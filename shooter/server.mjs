import {createServer} from 'node:http';
import {randomBytes} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {WebSocketServer,WebSocket} from 'ws';
import {encodeVolleys} from './snapshot.js';
import {createGame,startWave,stepGame,addPilot,pilots,laser,pulse,drawUpgrade,continueWave,MAX_PILOTS} from './core.js';

const WIDTH=720,HEIGHT=960;
const pilotKeys=['id','inputSequence','disconnected','retired','player','hp','shield','spread','power','pulses','lasers','laserPower','beam','reward','invincible'];
const pickPilot=p=>Object.fromEntries(pilotKeys.map(k=>[k,p[k]]));
const code=()=>randomBytes(4).toString('hex').slice(0,6).toUpperCase();
export function createCoopServer({port=Number(process.env.PORT)||8787,host='127.0.0.1',origins=['https://games.nblord.com','https://games.596996.xyz']}={}){
 const rooms=new Map(),connections=new Set();
 const http=createServer((req,res)=>{res.writeHead(req.url==='/health'?200:404,{'content-type':'application/json','cache-control':'no-store'});res.end(req.url==='/health'?JSON.stringify({ok:true,rooms:rooms.size}):'{}')});
 const wss=new WebSocketServer({noServer:true,maxPayload:2048,perMessageDeflate:false});
 http.on('upgrade',(req,socket,head)=>{
  const ip=req.socket.remoteAddress;
  if(req.url!=='/shooter-ws'||!origins.includes(req.headers.origin)||connections.size>=512||[...connections].filter(c=>c.ip===ip).length>=64){socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');socket.destroy();return}
  wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws,req));
 });
 const send=(ws,data)=>{if(ws?.readyState===WebSocket.OPEN){if(ws.bufferedAmount>256000){ws.close(1013,'Slow connection');return}ws.send(typeof data==='string'?data:JSON.stringify(data))}};
 function state(room,compact=false){
  const g=room.g,game={...pickPilot(g),partners:g.partners.map(pickPilot),width:g.width,height:g.height,mode:g.mode,wave:g.wave,score:g.score,time:g.time,spawnIndex:g.spawnIndex,plan:g.plan,
   bullets:compact?[]:g.bullets.map(b=>[Math.round(b.x),Math.round(b.y),b.owner,Math.round(b.vx),Math.round(b.vy)]),enemyBullets:g.enemyBullets.map(b=>[Math.round(b.x),Math.round(b.y),b.color,Math.round(b.vx),Math.round(b.vy)]),
   enemies:g.enemies.map(e=>({id:e.id,kind:e.kind,x:Math.round(e.x),y:Math.round(e.y),r:e.r,hp:e.hp,maxHp:e.maxHp})),effects:g.effects};if(compact)game.volleys=encodeVolleys(g.bullets);
  return {type:'state',game,host:room.host,code:room.code,members:[...room.members.values()].map(m=>({id:m.id,online:!!m.ws})),revision:room.revision};
 }
 const broadcast=room=>{let legacy,compact;for(const m of room.members.values()){if(m.ws?.readyState!==WebSocket.OPEN||m.ws.bufferedAmount>65536)continue;const packet=m.protocol===2?(compact??=JSON.stringify(state(room,true))):(legacy??=JSON.stringify(state(room)));send(m.ws,packet)}};
 function leave(c,permanent=false){
  const room=c.room,m=c.member;if(!room||!m||m.ws!==c.ws)return;
  m.ws=null;m.input={};const pilot=[room.g,...room.g.partners].find(p=>p.id===m.id);if(pilot)pilot.disconnected=true;m.until=Date.now()+(permanent?0:120000);c.room=c.member=null;
  if(room.g.mode==='playing')room.g.mode='paused';room.lastActive=Date.now();
  if(room.host===m.id){const candidates=[...room.members.values()].filter(p=>p.ws);room.host=candidates[Math.floor(Math.random()*candidates.length)]?.id||m.id;}
  if(permanent){room.members.delete(m.id);if(m.id===room.g.id){room.g.hp=0;room.g.reward={kind:'left'};room.g.retired=true}else room.g.partners=room.g.partners.filter(p=>p.id!==m.id)}
  if(permanent&&!room.members.size){rooms.delete(room.code);return}
  broadcast(room);
 }
 function join(c,msg){
  if(c.room)return;
  let room;
  if(msg.type==='create'){
   if(rooms.size>=32)throw Error('队伍暂时已满，请稍后再试');
   let key;do{key=code()}while(rooms.has(key));
   room={code:key,g:createGame(WIDTH,HEIGHT),members:new Map(),host:'host',lastActive:Date.now(),revision:0};room.g.mode='lobby';rooms.set(key,room);
  }else{room=rooms.get(String(msg.code||'').toUpperCase());if(!room)throw Error('队伍不存在或已结束')}
  let member=[...room.members.values()].find(m=>typeof msg.token==='string'&&m.token===msg.token);
  if(member?.ws)throw Error('这个队员已在另一页面连接');
  if(!member){
   if(room.members.size>=MAX_PILOTS||pilots(room.g).length>=MAX_PILOTS&&room.members.size)throw Error('队伍已满，最多16人');
   const first=room.members.size===0&&room.g.mode==='lobby',id=first?'host':randomBytes(3).toString('hex');
   const p=first?room.g:addPilot(room.g,id);if(!p)throw Error('队伍已满，最多16人');
   if(!first){const peers=pilots(room.g).filter(v=>v!==p);if(peers.length)for(const k of ['spread','power','laserPower'])p[k]=Math.min(...peers.map(v=>v[k]));if(room.g.mode==='playing')room.g.mode='paused'}
   member={id,token:randomBytes(24).toString('hex'),input:{},ws:null,until:0};room.members.set(id,member);
  }
  member.protocol=msg.protocol===2?2:1;member.ws=c.ws;member.until=0;const pilot=[room.g,...room.g.partners].find(p=>p.id===member.id);pilot.disconnected=false;c.member=member;c.room=room;room.lastActive=Date.now();
  if(!room.members.get(room.host)?.ws)room.host=member.id;
  send(c.ws,{type:'joined',code:room.code,id:member.id,token:member.token});broadcast(room);
 }
 function act(c,msg){
  if(msg.type==='create'||msg.type==='join'){join(c,msg);return}
  const room=c.room,m=c.member;if(!room||!m)return;const g=room.g,p=pilots(g).find(p=>p.id===m.id);room.lastActive=Date.now();
  if(msg.type==='leave'){leave(c,true);send(c.ws,{type:'left'});return}
  if(msg.type==='input'){
   const clamp=n=>Number.isFinite(n)?Math.max(-1,Math.min(1,n)):0;
   m.input={x:clamp(msg.x),y:clamp(msg.y),sequence:Number.isSafeInteger(msg.sequence)&&msg.sequence>=0?msg.sequence:0};
   if(Number.isFinite(msg.tx)&&Number.isFinite(msg.ty))m.input.target={x:Math.max(18,Math.min(WIDTH-18,msg.tx)),y:Math.max(24,Math.min(HEIGHT-18,msg.ty))};
   m.inputAt=Date.now();return;
  }
  if(msg.type==='laser')laser(g,p);
  if(msg.type==='pulse')pulse(g,p);
  if(msg.type==='draw')drawUpgrade(g,p);
  if(msg.type==='pause'&&g.mode==='playing'){g.mode='paused';for(const m of room.members.values())m.input={}}
  if(m.id===room.host){
   if(msg.type==='start'&&g.mode==='lobby')startWave(g);
   if(msg.type==='resume'&&g.mode==='paused'){for(const p of pilots(g))p.invincible=2;g.mode=pilots(g).every(p=>p.hp<=0)?'over':'playing'}
   if(msg.type==='next'&&g.mode==='upgrade'){
    // Disconnected players never block the active team's next round.
    for(const member of room.members.values())if(!member.ws)drawUpgrade(g,[g,...g.partners].find(p=>p.id===member.id));
    continueWave(g);
   }
   if(msg.type==='retry'&&(g.mode==='over'||g.mode==='won')){
    if(g.mode==='won')g.wave=0;else g.wave--;for(const p of pilots(g)){p.hp=p.retired?0:10;p.shield=Math.max(10,p.shield)}startWave(g);
   }
  }
  room.revision++;broadcast(room);
 }
 wss.on('connection',(ws,req)=>{
  const c={ws,ip:req.socket.remoteAddress,window:Date.now(),count:0,room:null,member:null,alive:true};connections.add(c);
  ws.on('pong',()=>c.alive=true);
  ws.on('message',raw=>{try{if(Date.now()-c.window>1000){c.window=Date.now();c.count=0}if(++c.count>80){ws.close(1008,'Too many messages');return}const msg=JSON.parse(raw);if(!msg||typeof msg!=='object'||typeof msg.type!=='string')return;act(c,msg)}catch(e){send(ws,{type:'error',message:e instanceof SyntaxError?'消息格式不正确':e.message})}});
  ws.on('error',()=>{});ws.on('close',()=>{leave(c);connections.delete(c)});
 });
 let ticks=0;
 const timer=setInterval(()=>{
  const now=Date.now();ticks++;for(const room of rooms.values()){
   const online=[...room.members.values()].filter(m=>m.ws);
   if(!online.length){if(now-room.lastActive>120000)rooms.delete(room.code);continue}
   for(const m of [...room.members.values()])if(!m.ws&&m.until<now){room.members.delete(m.id);if(m.id===room.g.id){room.g.hp=0;room.g.retired=true;room.g.reward={kind:'left'}}else room.g.partners=room.g.partners.filter(p=>p.id!==m.id)}
   const inputs={partners:{}};for(const m of room.members.values()){const input=m.ws&&now-(m.inputAt||0)<250?m.input:{};if(m.id===room.g.id)Object.assign(inputs,input);else inputs.partners[m.id]=input}
   stepGame(room.g,1/30,inputs);if(ticks%2===0)broadcast(room);
  }
 },1000/30);
 const heartbeat=setInterval(()=>{for(const c of connections){if(!c.alive){c.ws.terminate();continue}c.alive=false;c.ws.ping()}},15000);
 const ready=new Promise((resolve,reject)=>{http.once('error',reject);http.listen(port,host,resolve)});
 return {ready,address:()=>http.address(),async close(){clearInterval(timer);clearInterval(heartbeat);for(const c of connections)c.ws.terminate();await new Promise(r=>wss.close(r));await new Promise(r=>http.close(r))}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const app=createCoopServer();await app.ready;console.log('Cooperative shooter service ready');for(const signal of ['SIGTERM','SIGINT'])process.on(signal,async()=>{await app.close();process.exit(0)})}
