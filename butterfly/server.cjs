'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
let WebSocketServer;try{({WebSocketServer}=require('ws'));}catch{try{({WebSocketServer}=require('./vendor/ws'));}catch{({WebSocketServer}=require('/home/ubuntu/codex-work/goldminer-perf/node_modules/ws'));}}
const rules=require('./rules.js'),checkpoint=require('./checkpoint.js');
function createServer(options={}){
 const rooms=new Map(),sessions=new Map();const root=__dirname;const maxPlayers=options.maxPlayers||64;
 const stateFile=options.stateFile??process.env.GARDEN_STATE_FILE;let closed=false;
 function load(){
  if(!stateFile||!fs.existsSync(stateFile))return;
  try{
   const data=JSON.parse(fs.readFileSync(stateFile,'utf8'));if(data.version!==1||!Array.isArray(data.rooms)||data.rooms.length>100)throw Error();
   for(const saved of data.rooms){
    if(!saved||!/^\d{4}$/.test(saved.password)||rooms.has(saved.password)||typeof saved.id!=='string'||!saved.id||!Number.isInteger(saved.level)||saved.level<1||saved.level>4||!Number.isInteger(saved.epoch)||saved.epoch<0||!Array.isArray(saved.members)||!saved.members.length||saved.members.length>64)throw Error();
    const room={id:saved.id,password:saved.password,level:saved.level,map:rules.mapIds.includes(saved.map)?saved.map:'meadow',epoch:saved.epoch,members:[],state:saved.state?checkpoint.restore(saved.state,rules):null,paused:!!saved.state};
    for(const m of saved.members){
     if(!m||typeof m.id!=='string'||typeof m.token!=='string'||!/^[a-f0-9]{48}$/.test(m.token)||sessions.has(m.token)||typeof m.name!=='string'||typeof m.ready!=='boolean'||!m.inventory||typeof m.inventory.skin!=='string')throw Error();
     for(const key of ['energy','decoys','shields','slows'])if(!Number.isInteger(m.inventory[key])||m.inventory[key]<0||m.inventory[key]>99)throw Error();
     if(m.offlineAt!==undefined&&(!Number.isFinite(m.offlineAt)||m.offlineAt<0))throw Error();
     const member={id:m.id,token:m.token,name:m.name,ready:m.ready,waitingRound:!!m.waitingRound,inventory:{...m.inventory},offlineAt:m.offlineAt||Date.now(),room,ws:null,input:{}};room.members.push(member);sessions.set(member.token,member);
    }
    if(room.state&&room.state.players.length!==room.members.filter(m=>!m.waitingRound).length)throw Error();rooms.set(room.password,room);
   }
  }catch{throw Error('游戏服务器存档损坏，启动已停止；原存档保持不变');}
 }
 function persist(){
  if(!stateFile)return;
  const data={version:1,rooms:[...rooms.values()].map(room=>({id:room.id,password:room.password,level:room.level,map:room.map||'meadow',epoch:room.epoch,state:room.state?checkpoint.capture(room.state):null,members:room.members.map(m=>({id:m.id,token:m.token,name:m.name,ready:m.ready,waitingRound:!!m.waitingRound,inventory:m.inventory,offlineAt:m.offlineAt||0}))}))};
  const directory=path.dirname(stateFile);fs.mkdirSync(directory,{recursive:true,mode:0o700});const temp=stateFile+'.tmp-'+process.pid;
  try{fs.writeFileSync(temp,JSON.stringify(data),{mode:0o600});fs.renameSync(temp,stateFile);}catch(error){try{fs.unlinkSync(temp);}catch{}throw error;}
 }
 load();
 const server=http.createServer((req,res)=>{
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));const ext=path.extname(file);
  const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.woff2':'font/woff2'};
  if(!file.startsWith(root+path.sep)||!mime[ext]||pathname.includes('/evidence/')){res.writeHead(404);res.end();return;}
  fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':mime[ext],'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(data);});
 });
 const wss=new WebSocketServer({noServer:true,maxPayload:4096});
 server.on('upgrade',(req,socket,head)=>{
  if(req.url!=='/ws'){socket.destroy();return;}
  if(req.headers.origin){try{if(new URL(req.headers.origin).host!==req.headers.host){socket.destroy();return;}}catch{socket.destroy();return;}}
  wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws,req));
 });
 const send=(ws,data)=>{if(ws?.readyState===1)ws.send(JSON.stringify(data));};
 function describe(room,member){return {code:room.password,password:room.password,roundId:`${room.id}:${room.epoch}`,host:room.members[0]===member,playerIndex:room.members.indexOf(member),players:room.members.map((m,i)=>({id:m.id,index:i,name:m.name,ready:m.ready,online:m.ws?.readyState===1,host:i===0})),started:!!room.state&&!member.waitingRound,paused:room.paused,maxPlayers};}
 function state(room){return room.paused?{...room.state,mode:'paused',pauseReason:'有队友断线，等待重新连接或返回大厅'}:room.state;}
 function broadcastRoom(room){persist();for(const m of room.members)send(m.ws,{type:'room',room:describe(room,m),token:m.token});}
 function broadcast(room,data){for(const m of room.members)if(!m.waitingRound||!['state','start'].includes(data.type)){if(data.state?.flowers.length>300){const p=data.state.players[room.members.indexOf(m)];send(m.ws,{...data,state:{...data.state,flowers:[...data.state.flowers].sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z)).slice(0,240)}});}else send(m.ws,data);}}
 function syncInventories(room){if(!room.state)return;room.members.forEach((m,i)=>{const p=room.state.players[i];if(p){m.inventory.skin=p.skin;for(const key of ['shields','slows','energy','decoys'])m.inventory[key]=Math.min(99,(p.stash?.[key]||0)+(p[key]||0));}});}
 function start(room){syncInventories(room);room.state=rules.create(room.level,room.members[0].inventory,{map:room.map,players:room.members.length,target:rules.targetFor(room.level),inventories:room.members.map(m=>m.inventory)});room.paused=false;room.epoch++;room.members.forEach(m=>{m.input={};m.ready=true;m.waitingRound=false;});broadcastRoom(room);broadcast(room,{type:'start',state:room.state,epoch:room.epoch});}
 function leave(ws){const m=ws.member;if(!m)return;const room=m.room;if(room.state){rules.returnTools(room.state);broadcast(room,{type:'state',state:state(room),epoch:room.epoch});}syncInventories(room);ws.member=null;sessions.delete(m.token);room.members.splice(room.members.indexOf(m),1);m.ws=null;
  if(!room.members.length){rooms.delete(room.password);persist();return;}
  if(room.state){room.state=null;room.paused=false;for(const other of room.members){other.input={};other.ready=false;}broadcast(room,{type:'status',status:'lobby',message:'有队友离开，本局结束，回到大厅重新准备'});}
  broadcastRoom(room);
 }
 wss.on('connection',ws=>{
  ws.isAlive=true;ws.on('pong',()=>{ws.isAlive=true;});
  ws.on('message',raw=>{let data;try{data=JSON.parse(raw);}catch{send(ws,{type:'error',code:'BAD_MESSAGE',message:'消息格式错误'});return;}
   const fail=(code,message)=>send(ws,{type:'error',code,message});if(!data||typeof data!=='object'||Array.isArray(data))return fail('BAD_MESSAGE','消息格式错误');const m=ws.member;
   if(data.type==='create'||data.type==='join'){
    if(m)return fail('IN_ROOM','请先离开当前房间');
    let password,room;
    if(data.type==='create'){
     if(rooms.size>=100)return fail('BUSY','房间已满，请稍后再试');
     const first=crypto.randomInt(10000);
     for(let offset=0;offset<10000;offset++){const code=String((first+offset)%10000).padStart(4,'0');if(!rooms.has(code)){password=code;break;}}
     room={id:crypto.randomUUID(),password,map:rules.mapIds.includes(data.map)?data.map:'meadow',level:Math.min(4,Math.max(1,Math.floor(Number(data.level))||1)),members:[],state:null,paused:false,epoch:0};rooms.set(password,room);
    }else{
     password=String(data.code??data.password??'').trim();if(!/^\d{4}$/.test(password))return fail('BAD_CODE','请输入四位数字房间码');
     room=rooms.get(password);if(!room)return fail('NOT_FOUND','没有找到这个房间码，请核对后再试');
    }
    if(room.members.length>=maxPlayers)return fail('FULL','这个房间已满');
    const member={id:crypto.randomUUID(),token:crypto.randomBytes(24).toString('hex'),name:String(data.name||`蝴蝶${room.members.length+1}`).slice(0,24),room,ws,ready:data.type==='create',input:{},inventory:{energy:Math.max(0,Math.min(99,Math.floor(Number(data.inventory?.energy)||0))),decoys:Math.max(0,Math.min(99,Math.floor(Number(data.inventory?.decoys)||0))),skin:String(data.inventory?.skin||'sun').slice(0,32),shields:Math.max(0,Math.min(99,Math.floor(Number(data.inventory?.shields)||0))),slows:Math.max(0,Math.min(99,Math.floor(Number(data.inventory?.slows)||0)))}};
    room.members.push(member);sessions.set(member.token,member);ws.member=member;
    if(room.state){if(['won','dead'].includes(room.state.mode)){member.waitingRound=true;}else{rules.addPlayer(room.state,member.inventory);member.ready=true;}}
    broadcastRoom(room);if(member.waitingRound)send(ws,{type:'status',status:'waiting-next',message:'这一局已结束，等待房主开始下一局'});else if(room.state)send(ws,{type:'start',state:state(room),epoch:room.epoch});return;
   }
   if(data.type==='resume'){
    const member=sessions.get(data.token);if(!member)return fail('EXPIRED','房间连接已失效，请重新加入');if(member.ws?.readyState===1)return fail('CONNECTED','这个玩家已在其他窗口连接');
    member.ws=ws;member.offlineAt=0;ws.member=member;member.room.paused=member.room.members.some(x=>x.ws?.readyState!==1);broadcastRoom(member.room);if(member.room.state)broadcast(member.room,{type:'start',state:state(member.room),epoch:member.room.epoch});return;
   }
   if(!m)return fail('NO_ROOM','请先创建或加入房间');const room=m.room;
   if(data.type==='ready'){m.ready=true;broadcastRoom(room);}
   else if(data.type==='start'||data.type==='restart'){
    if(room.members[0]!==m)return fail('HOST_ONLY','由房主开始');
    if(room.members.length<2)return fail('WAIT_PLAYERS','等待至少一位真实队友加入');
    if(room.members.some(x=>x.ws?.readyState!==1))return fail('OFFLINE','有队友断线，等待重新连接');
    if(data.type==='start'&&room.members.some(x=>!x.ready))return fail('NOT_READY','等待队友点击准备');start(room);
   }else if(data.type==='input')m.input={x:Number.isFinite(data.input?.x)?Math.max(-1,Math.min(1,data.input.x)):0,z:Number.isFinite(data.input?.z)?Math.max(-1,Math.min(1,data.input.z)):0,rise:Number.isFinite(data.input?.rise)?Math.max(-1,Math.min(1,data.input.rise)):0,boost:!!data.input?.boost,collect:!!data.input?.collect,deposit:!!data.input?.deposit};
   else if(data.type==='equip'&&room.state&&!room.paused)rules.equip(room.state,data.id,room.members.indexOf(m));
   else if(data.type==='slow'&&room.state&&!room.paused)rules.slow(room.state,room.members.indexOf(m));
   else if(data.type==='fold'&&room.state&&!room.paused)rules.fold(room.state,room.members.indexOf(m));
   else if(data.type==='hide'&&room.state&&!room.paused)rules.hide(room.state,room.members.indexOf(m));
   else if(data.type==='refill'&&room.state&&!room.paused)rules.refill(room.state,room.members.indexOf(m));
   else if(data.type==='decoy'&&room.state&&!room.paused)rules.decoy(room.state,room.members.indexOf(m));
   else if(data.type==='leave'){leave(ws);send(ws,{type:'status',status:'left',message:'已离开房间'});}
   if(data.type!=='input')persist();
  });
  ws.on('close',()=>{const m=ws.member;if(closed||!m||m.ws!==ws)return;m.ws=null;m.offlineAt=Date.now();m.input={};if(m.room.state)m.room.paused=true;broadcastRoom(m.room);if(m.room.state)broadcast(m.room,{type:'state',state:state(m.room),epoch:m.room.epoch});});
  ws.on('error',()=>{});
 });
 const tick=setInterval(()=>{for(const room of rooms.values())if(room.state&&!room.paused)rules.tick(room.state,1/30,{inputs:room.members.map(m=>m.input)});},1000/30);
 const snapshots=setInterval(()=>{for(const room of rooms.values())if(room.state)broadcast(room,{type:'state',state:state(room),epoch:room.epoch});},50);
 const housekeeping=setInterval(()=>{
  for(const ws of wss.clients){if(!ws.isAlive){ws.terminate();continue;}ws.isAlive=false;ws.ping();}
  for(const room of rooms.values())if(room.members.every(m=>!m.ws&&Date.now()-(m.offlineAt||0)>(room.state?86400000:300000))){for(const m of room.members)sessions.delete(m.token);rooms.delete(room.password);}
  persist();
 },15000);
 const saving=setInterval(persist,1000);
 return {rooms,address:()=>server.address(),listen:()=>new Promise((resolve,reject)=>{server.once('error',reject);server.listen(options.port??Number(process.env.PORT||4178),options.host||process.env.HOST||'127.0.0.1',resolve);}),close:()=>new Promise(resolve=>{if(closed){resolve();return;}closed=true;persist();clearInterval(saving);clearInterval(tick);clearInterval(snapshots);clearInterval(housekeeping);for(const ws of wss.clients)ws.terminate();wss.close(()=>server.close(resolve));})};
}
module.exports={createServer};
if(require.main===module){const app=createServer({stateFile:process.env.GARDEN_STATE_FILE||path.join(require('node:os').homedir(),'.local','state','butterfly-garden','state.json')});for(const signal of ['SIGTERM','SIGINT'])process.once(signal,()=>app.close().then(()=>process.exit(0)));app.listen().then(()=>{console.log(`Butterfly Garden: http://${app.address().address}:${app.address().port}`);}).catch(error=>{console.error(error.message);process.exitCode=1;});}
