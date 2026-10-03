import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { WebSocket, WebSocketServer } from 'ws';
import { createGame, stepGame, setPaused, finishBonus } from './core.js';
import { createCampaign, availableAreas } from './campaign.js';
import { LEVELS } from './levels.js';
import { encodeFrame } from './net-codec.js';

const neutral = () => ({move:0,up:false,down:false,jump:false,action:false});
const runtimeClock = {now:()=>Date.now(),setInterval:(fn,ms)=>setInterval(fn,ms),clearInterval:id=>clearInterval(id)};
const MAX_ROOMS = 16, MAX_CONNECTIONS = 64, MAX_QUEUE = 120;
const RECLAIM_MS = 120_000, STALE_MS = 350;

export function createRescueServer({port=8788,host='127.0.0.1',origins=['https://games.nblord.com','https://games.596996.xyz'],clock=runtimeClock,levelFor=id=>LEVELS.find(level=>level.id===id)}={}) {
  const rooms = new Map(), connections = new Set();
  const allowedOrigins = new Set(origins);
  const http = createServer((req,res)=>{
    res.writeHead(req.url==='/health'?200:404,{'content-type':'application/json','cache-control':'no-store'});
    res.end(req.url==='/health'?JSON.stringify({ok:true,rooms:rooms.size}):'{}');
  });
  const wss = new WebSocketServer({noServer:true,maxPayload:4096,perMessageDeflate:false});
  const send = (ws,packet) => {if(ws?.readyState===WebSocket.OPEN)ws.send(typeof packet==='string'?packet:JSON.stringify(packet));};
  function roomInfo(room) {
    return {code:room.code,host:0,mode:room.mode,run:room.run,members:room.members.map((member,slot)=>member?{slot,character:slot===0?'chip':'dale',connected:!!member.ws,ready:member.ready}:null)};
  }
  function broadcast(room) {
    const stageKey = `${room.epoch}:${room.game.areaLevel.id}:${room.game.level.id}`;
    let small, full;
    for (const member of room.members) {
      if (!member?.ws || member.ws.readyState!==WebSocket.OPEN || member.ws.bufferedAmount>0) continue;
      const includeStage = member.stageKey!==stageKey;
      const encode = () => JSON.stringify(encodeFrame(room.game,{epoch:room.epoch,tick:room.tick,acks:room.acks,inputs:room.inputs,room:roomInfo(room),includeStage}));
      send(member.ws,includeStage?(full??=encode()):(small??=encode()));
      member.stageKey = stageKey;
    }
  }
  function resetInputs(room) {
    room.epoch++;
    room.acks = [0,0];room.inputs = [neutral(),neutral()];
    setPaused(room.game,room.mode!=='playing');
    for (const member of room.members) if (member) {
      member.queue=[];member.received=0;member.lastInput=clock.now();
    }
  }
  function pause(room) {
    if(room.mode==='playing'){room.mode='paused';resetInputs(room);}
  }
  function closeRoom(room,message) {
    rooms.delete(room.code);
    for(const member of room.members)if(member?.ws){
      send(member.ws,{type:'closed',message});
      const connection=member.connection;
      if(connection){connection.room=null;connection.member=null;}
      member.ws=null;member.connection=null;
    }
  }
  function disconnect(connection) {
    connections.delete(connection);
    const {room,member}=connection;
    if(!room||!member||member.ws!==connection.ws)return;
    member.ws=null;member.connection=null;member.ready=false;member.until=clock.now()+RECLAIM_MS;
    member.queue=[];
    pause(room);broadcast(room);
    connection.room=null;connection.member=null;
  }
  function entryValues(game) {
    return {score:game.score,flowers:game.flowers,stars:game.stars,players:game.players.map(({lives,hearts})=>({lives,hearts}))};
  }
  function newGame(room,id,entry) {
    const level=levelFor(id);
    if(!level)throw Error('区域不存在');
    room.game=createGame(level,{players:2,campaign:room.campaign});
    if(entry){
      for(const key of ['score','flowers','stars'])room.game[key]=entry[key];
      for(let i=0;i<2;i++)Object.assign(room.game.players[i],entry.players[i]);
    }
    room.entry=entryValues(room.game);room.campaign.current=id;
    room.run++;room.tick=0;room.mode='playing';resetInputs(room);
  }
  function allReady(room) {return room.members.every(m=>m?.ws?.readyState===WebSocket.OPEN&&m.ready);}
  function join(connection,message) {
    if(connection.room)throw Error('请先退出当前房间');
    let room,member,slot;
    if(message.type==='create') {
      if(rooms.size>=MAX_ROOMS)throw Error('房间数量已满，请稍后重试');
      let code;do{code=randomBytes(3).toString('hex').toUpperCase();}while(rooms.has(code));
      const campaign=createCampaign();
      room={code,campaign,game:createGame(levelFor('0'),{players:2,campaign}),members:[null,null],mode:'lobby',run:0,epoch:1,tick:0,acks:[0,0],inputs:[neutral(),neutral()]};
      setPaused(room.game,true);rooms.set(code,room);slot=0;
    } else {
      if(typeof message.code!=='string'||!/^[A-Fa-f0-9]{6}$/.test(message.code))throw Error('请输入6位房间号');
      room=rooms.get(message.code.toUpperCase());
      if(!room)throw Error('房间不存在或已结束');
      if(message.token!==undefined){
        if(typeof message.token!=='string')throw Error('重连凭据无效');
        slot=room.members.findIndex(m=>m?.token===message.token);
        if(slot<0)throw Error('重连凭据无效');
        member=room.members[slot];
        if(member.ws)throw Error('这个角色已在另一页面连接');
        if(clock.now()>=member.until){closeRoom(room,'重连等待已超时');throw Error('房间已结束');}
      }else{
        slot=room.members.findIndex(m=>!m);
        if(slot<0||room.mode!=='lobby')throw Error('房间已满，最多2人');
      }
    }
    member??={slot,token:randomBytes(24).toString('hex'),ready:false,queue:[],received:0,lastInput:clock.now()};
    member.ws=connection.ws;member.connection=connection;member.until=0;member.stageKey=null;member.ready=false;
    room.members[slot]=member;connection.room=room;connection.member=member;
    send(member.ws,{type:'joined',code:room.code,slot,token:member.token});broadcast(room);
  }
  function acceptInputs(room,member,message) {
    if(message.epoch!==room.epoch)throw Error('输入版本已过期');
    if(room.mode!=='playing')throw Error('游戏尚未运行');
    if(!Array.isArray(message.commands)||!message.commands.length||message.commands.length>MAX_QUEUE)throw Error('输入队列格式无效');
    const accepted=[];let received=member.received;
    for(const command of message.commands){
      if(!command||!Number.isSafeInteger(command.seq)||command.seq<1)throw Error('输入序号无效');
      const input=command.input;
      if(!input||typeof input!=='object'||typeof input.move!=='number'||!Number.isFinite(input.move)||Math.abs(input.move)>1||['up','down','jump','action'].some(k=>typeof input[k]!=='boolean'))throw Error('输入值无效');
      if(command.seq<=received)continue;
      received=command.seq;accepted.push({seq:command.seq,input:{move:input.move,up:input.up,down:input.down,jump:input.jump,action:input.action}});
    }
    if(member.queue.length+accepted.length>MAX_QUEUE)throw Error('输入队列已满');
    member.queue.push(...accepted);member.received=received;
    if(accepted.length)member.lastInput=clock.now();
  }
  function act(connection,message) {
    if(message.type==='ping'){
      if(typeof message.at!=='number'||!Number.isFinite(message.at))throw Error('时间戳无效');
      send(connection.ws,{type:'pong',at:message.at});return;
    }
    if(message.type==='create'||message.type==='join'){join(connection,message);return;}
    const {room,member}=connection;
    if(!room||!member)throw Error('请先加入房间');
    if(message.type==='leave'){closeRoom(room,'队员已退出，房间已结束');return;}
    if(message.type==='input'){acceptInputs(room,member,message);return;}
    if(message.type==='ready'){
      if(typeof message.value!=='boolean')throw Error('准备状态无效');
      member.ready=message.value;
      if(!member.ready)pause(room);
    }else if(message.type==='pause')pause(room);
    else {
      if(member.slot!==0)throw Error('只有房主可以执行此操作');
      if(message.type==='start'){
        if(room.mode!=='lobby'||!allReady(room))throw Error('需要两位玩家连接并准备');
        newGame(room,'0');
      }else if(message.type==='resume'){
        if(room.mode!=='paused'||!allReady(room))throw Error('需要两位玩家连接并准备');
        room.mode='playing';resetInputs(room);
      }else if(message.type==='retry'){
        if(room.mode==='lobby'||!allReady(room))throw Error('需要两位玩家连接并准备');
        const entry=structuredClone(room.entry);
        if(room.game.status==='gameover')for(const p of entry.players){p.lives=3;p.hearts=3;}
        newGame(room,room.game.areaLevel.id,entry);
      }else if(message.type==='next'){
        if(room.game.status!=='cleared'||!allReady(room)||typeof message.areaId!=='string'||!availableAreas(room.campaign).includes(message.areaId))throw Error('该区域尚未解锁');
        newGame(room,message.areaId,entryValues(room.game));
      }else if(message.type==='finishBonus'){
        if(room.game.status!=='bonus'||room.mode!=='playing')throw Error('当前不在奖励房');
        finishBonus(room.game);resetInputs(room);
      }else throw Error('未知操作');
    }
    broadcast(room);
  }
  wss.on('connection',ws=>{
    const connection={ws,room:null,member:null,window:clock.now(),count:0,alive:true};connections.add(connection);
    ws.on('error',()=>{});
    ws.on('pong',()=>{connection.alive=true;});
    ws.on('close',()=>disconnect(connection));
    ws.on('message',(raw,binary)=>{
      try{
        if(clock.now()-connection.window>=1000){connection.window=clock.now();connection.count=0;}
        if(++connection.count>180){ws.close(1008,'Too many messages');return;}
        if(binary)throw Error('只接受JSON文本消息');
        const message=JSON.parse(raw);
        if(!message||Array.isArray(message)||typeof message.type!=='string')throw Error('消息格式无效');
        act(connection,message);
      }catch(error){send(ws,{type:'error',message:error instanceof SyntaxError?'消息格式无效':error.message});}
    });
  });
  http.on('upgrade',(req,socket,head)=>{
    if(req.url!=='/rescue-ws'||!allowedOrigins.has(req.headers.origin)||connections.size>=MAX_CONNECTIONS){socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');return;}
    wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws,req));
  });
  let broadcasts=0,lastHeartbeat=clock.now();
  function advanceRooms(now){
    for(const room of rooms.values()){
      if(room.members.some(m=>m&&!m.ws&&now>=m.until)){closeRoom(room,'重连等待已超时');continue;}
      if(room.mode==='playing'&&['playing','bonus'].includes(room.game.status)){
        if(room.members.some(m=>!m?.ws||now-m.lastInput>STALE_MS)){pause(room);broadcast(room);continue;}
        const samples=room.members.map(m=>m.queue.shift());
        room.inputs=samples.map((command,slot)=>command?.input??{...room.inputs[slot],jump:false,action:false});
        const levelId=room.game.level.id,status=room.game.status;
        stepGame(room.game,room.inputs,1/60);room.tick++;
        for(let slot=0;slot<2;slot++)if(samples[slot])room.acks[slot]=samples[slot].seq;
        if(levelId!==room.game.level.id||status!==room.game.status){resetInputs(room);broadcast(room);continue;}
      }
      if(broadcasts%3===2)broadcast(room);
    }
    broadcasts++;
    if(now-lastHeartbeat>=30_000){
      lastHeartbeat=now;
      for(const connection of connections){if(!connection.alive){connection.ws.terminate();continue;}connection.alive=false;connection.ws.ping();}
    }
  }
  // Node rounds interval delays to whole milliseconds. Wall-time accumulation
  // prevents a 16 ms wakeup from accidentally running a 62.5 Hz simulation.
  const tickMs=1000/60;
  let lastLoop=clock.now(),accumulator=0;
  const timer=clock.setInterval(()=>{
    const now=clock.now();
    accumulator+=Math.min(Math.max(0,now-lastLoop),tickMs*5);lastLoop=now;
    while(accumulator+1e-7>=tickMs){accumulator=Math.max(0,accumulator-tickMs);advanceRooms(now);}
  },tickMs);
  const ready=new Promise((resolve,reject)=>{http.once('error',reject);http.listen(port,host,resolve);});
  let closing;
  function close(){return closing??=new Promise(resolve=>{
    clock.clearInterval(timer);
    for(const connection of connections)connection.ws.terminate();
    wss.close(()=>http.close(resolve));
  });}
  return {ready,address:()=>http.address(),close};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const app=createRescueServer({port:Number(process.env.PORT)||8788});
  await app.ready;
  console.log(`Rescue server listening on 127.0.0.1:${app.address().port}`);
  for(const signal of ['SIGTERM','SIGINT'])process.once(signal,async()=>{await app.close();process.exit(0);});
}
