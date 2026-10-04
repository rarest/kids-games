// Network transport carries input only; combat and upgrades are server-authoritative.
export function connectTeam({endpoint,onState,onStatus,onJoined,onLeft}){
 let socket,closed=false,retry=0,session=null,request=null,timer=null,lastInput=0,sequence=0,lastControl='',stateAt=null;
 const send=data=>{if(socket?.readyState===WebSocket.OPEN){socket.send(JSON.stringify(data));return true}return false};
 function open(){
  stateAt=null;
  onStatus(retry?'连接中断，正在重新加入队伍…':'正在连接队伍…');
  socket=new WebSocket(endpoint);
  socket.onopen=()=>{retry=0;send(session?{type:'join',protocol:2,...session}:{...request,protocol:2})};
  socket.onmessage=event=>{let m;try{m=JSON.parse(event.data)}catch{return}
   if(m.type==='joined'){session={code:m.code,token:m.token};onJoined(m);onStatus('已连接队伍')}
   if(m.type==='state'){stateAt=performance.now();onState(m);}
   if(m.type==='error')onStatus(m.message);
   if(m.type==='left'){closed=true;socket.close();onLeft()}
  };
  socket.onclose=()=>{stateAt=null;if(closed)return;onStatus('连接中断，正在重新加入队伍…');if(retry<6)timer=setTimeout(open,Math.min(8000,700*2**retry++));else onStatus('暂时无法连接，请退出队伍后重新加入')};
  socket.onerror=()=>{};
 }
 return {join(data){request=data;open()},send,get sequence(){return sequence},get hasLiveState(){return !closed&&socket?.readyState===WebSocket.OPEN&&stateAt!==null&&performance.now()-stateAt<=2000},input(data){const control=JSON.stringify(data),now=performance.now();if(control===lastControl&&now-lastInput<100)return;if(lastControl&&Number.isFinite(data.tx)&&now-lastInput<33)return;lastInput=now;if(control!==lastControl){lastControl=control;sequence++}send({type:'input',sequence,...data})},close(){closed=true;stateAt=null;clearTimeout(timer);send({type:'leave'});socket?.close();onLeft()}};
}
