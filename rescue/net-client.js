import {decodeFrame} from './net-codec.js';
import {createConfirmedPresentation} from './net-confirmed.js';

const SESSION_KEY='rescue.online.session.v1';
const runtimeClock={now:()=>performance.now(),setInterval:(fn,ms)=>setInterval(fn,ms),clearInterval:id=>clearInterval(id)};
function defaultStorage(){try{return globalThis.sessionStorage;}catch{return null;}}
function defaultURL(){const base=new URL('/rescue-ws',globalThis.location.href);base.protocol=base.protocol==='https:'?'wss:':'ws:';return base.href;}

export function createRescueClient({onState=()=>{},onStatus=()=>{},url=defaultURL(),storage=defaultStorage(),transport=address=>new WebSocket(address),clock=runtimeClock}={}){
 let socket=null,authority=null,room=null,slot=null,prediction=null,session=null,intent=null,disposed=false,suspended=false;
 let epoch=null,tick=-1,retryAt=0,retries=0,retryStarted=null,lastMessage=0,lastPing=0,pingAt=null;
 let receivedBytes=0,sentBytes=0,status={connection:'idle',message:'',rtt:null,code:null,slot:null,room:null,suspended:false};
 function notify(connection=status.connection,message=''){
  status={connection,message,rtt:status.rtt,code:room?.code??session?.code??null,slot,room,suspended};onStatus({...status});
 }
 function save(value){session=value;try{if(value)storage?.setItem(SESSION_KEY,JSON.stringify(value));else storage?.removeItem(SESSION_KEY);}catch{/* A blocked session store still permits this connection. */}}
 function read(){try{const saved=JSON.parse(storage?.getItem(SESSION_KEY)??'null');if(saved&&/^[A-F0-9]{6}$/.test(saved.code)&&typeof saved.token==='string'&&saved.token.length>=20)return {code:saved.code,token:saved.token};}catch{}return null;}
 function send(packet){if(socket?.readyState!==1)return false;const raw=JSON.stringify(packet);try{socket.send(raw);sentBytes+=new TextEncoder().encode(raw).length;return true;}catch{return false;}}
 function stopSocket(){const old=socket;socket=null;pingAt=null;status.rtt=null;if(old)try{old.close();}catch{}}
 function resetPrediction(){prediction?.clear();}
 function end(message,connection='closed'){
  intent=null;retryAt=0;retryStarted=null;save(null);resetPrediction();prediction=null;stopSocket();room=null;slot=null;authority=null;epoch=null;tick=-1;notify(connection,message);
 }
 function lost(){
  resetPrediction();stopSocket();pingAt=null;
  if(disposed)return;
  if(!session){intent=null;notify('error','连接中断，请重新加入');return;}
  retryStarted??=clock.now();retryAt=clock.now()+Math.min(4000,250*2**Math.min(retries++,4));notify('reconnecting','连接中断，正在重连');
 }
 function connect(request){
  stopSocket();intent=request;retryAt=0;lastMessage=clock.now();lastPing=clock.now();
  notify(session?'reconnecting':'connecting');let ws;
  try{ws=transport(url);socket=ws;}catch{lost();return;}
  ws.addEventListener('open',()=>{if(disposed||socket!==ws)return;lastMessage=clock.now();send(request);pingAt=clock.now();lastPing=pingAt;send({type:'ping',at:pingAt});});
  ws.addEventListener('message',event=>{
   if(disposed||socket!==ws)return;
   lastMessage=clock.now();let packet;
   try{const raw=typeof event.data==='string'?event.data:String(event.data);receivedBytes+=new TextEncoder().encode(raw).length;packet=JSON.parse(raw);}catch{lost();return;}
   if(packet.type==='joined'){
    if((packet.slot!==0&&packet.slot!==1)||typeof packet.token!=='string'||typeof packet.code!=='string'){end('无效的房间响应','error');return;}
    const sameSeat=slot===packet.slot;slot=packet.slot;save({code:packet.code,token:packet.token});
    if(!prediction||!sameSeat)prediction=createConfirmedPresentation({slot,clock});else resetPrediction();
    retries=0;retryStarted=null;epoch=null;tick=-1;notify('connected');
   }else if(packet.type==='state'){
    if(slot===null||!packet.room||!Number.isSafeInteger(packet.epoch)||!Number.isSafeInteger(packet.tick))return;
    if(epoch!==null&&(packet.epoch<epoch||(packet.epoch===epoch&&packet.tick<tick)))return;
    const enteringPlaying=packet.epoch!==epoch&&packet.room.mode==='playing';
    try{authority=decodeFrame(packet,authority);}catch{lost();return;}
    epoch=packet.epoch;tick=packet.tick;room=packet.room;
    prediction.receive(authority,{epoch,ack:packet.acks[slot]});
    if(suspended||room.mode!=='playing'||!['playing','bonus'].includes(authority.status))resetPrediction();
    // Start the epoch's normal input stream before rendering/UI can delay its first RAF.
    // Sequence and acknowledgement use the fixed-step path without speculative physics.
    if(enteringPlaying&&!suspended&&room.members?.[slot]?.ready){
     advance({},1/60);if(socket!==ws)return;
    }
    onState(authority,packet);notify('connected');
   }else if(packet.type==='pong'){
    if(packet.at===pingAt){const now=clock.now();status.rtt=Math.max(0,now-packet.at);pingAt=null;notify(status.connection,status.message);}
   }else if(packet.type==='closed')end(packet.message||'房间已结束');
   else if(packet.type==='error'){
    // A rejected reclaim cannot safely choose a different seat or keep retrying.
    if(intent?.type==='join'&&intent.token&&epoch===null)end(packet.message||'房间无法重连','error');
    else notify('error',packet.message||'操作失败');
   }
  });
  ws.addEventListener('close',()=>{if(socket===ws)lost();});
  ws.addEventListener('error',()=>{if(socket===ws)lost();});
 }
 function create(){if(disposed)return false;if(room||session)leave();suspended=false;authority=null;slot=null;epoch=null;tick=-1;connect({type:'create'});return true;}
 function join(code){if(disposed)return false;const normalized=String(code??'').trim().toUpperCase();if(!/^[A-F0-9]{6}$/.test(normalized)){notify('error','请输入6位房间号');return false;}if(room||session)leave();suspended=false;authority=null;slot=null;epoch=null;tick=-1;connect({type:'join',code:normalized});return true;}
 function command(type,payload={}){
  if(!['start','pause','resume','retry','next','finishBonus'].includes(type)||disposed||!room)return false;
  if(type==='pause')resetPrediction();
  return send(type==='next'?{type,areaId:payload.areaId}:{type});
 }
 function advance(input,dt){
  if(disposed||suspended||socket?.readyState!==1||!room||room.mode!=='playing'||!['playing','bonus'].includes(authority?.status))return {commands:[],state:render()};
  if(socket.bufferedAmount>65536||prediction.diagnostics().pending>=120){suspend();notify('connected','网络拥堵，已暂停');return {commands:[],state:render()};}
  const result=prediction.advance(input,dt);
  if(result.commands.length&&!send({type:'input',epoch,commands:result.commands})){lost();return {commands:[],state:render()};}
  return result;
 }
 function render(now){return prediction?.render(now)??authority;}
 function suspend(ready=false){suspended=true;resetPrediction();send({type:'ready',value:!!ready});if(ready)send({type:'pause'});notify();}
 function setReady(value){if(disposed||!room)return false;suspended=!value;if(!value)resetPrediction();const sent=send({type:'ready',value:!!value});notify();return sent;}
 function leave(){if(disposed)return;send({type:'leave'});suspended=false;end('已退出房间');}
 function dispose(){if(disposed)return;send({type:'ready',value:false});disposed=true;clock.clearInterval(timer);globalThis.removeEventListener?.('pagehide',pagehide);resetPrediction();stopSocket();notify('closed','连接已关闭');}
 function pagehide(){suspend();dispose();}
 const timer=clock.setInterval(()=>{
  if(disposed)return;
  const now=clock.now();
  if(retryStarted!==null&&now-retryStarted>120000){end('重连等待已超时','error');return;}
  if(retryAt&&now>=retryAt){connect({type:'join',code:session.code,token:session.token});return;}
  if(socket&&now-lastMessage>8000){lost();return;}
  if(socket?.readyState===1&&now-lastPing>=2000){lastPing=now;pingAt=now;send({type:'ping',at:now});}
 },250);
 globalThis.addEventListener?.('pagehide',pagehide);
 session=read();if(session)connect({type:'join',code:session.code,token:session.token});
 return {create,join,command,advance,render,suspend,setReady,leave,dispose,
  get authority(){return authority;},get slot(){return slot;},get room(){return room;},
  diagnostics:()=>({...prediction?.diagnostics(),connection:status.connection,rtt:status.rtt,slot,code:room?.code??session?.code??null,epoch,tick,suspended,receivedBytes,sentBytes})};
}
