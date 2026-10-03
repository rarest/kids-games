const $ = id => document.getElementById(id);
const connections = {idle:'尚未连接',connecting:'正在连接',connected:'已连接',reconnecting:'正在重连',closed:'房间已结束',error:'连接提示'};
export function updateRoomUI(status,available) {
  const room=status.room,host=status.slot===0;
  const ready=!!room?.members.every(member=>member?.connected&&member.ready);
  const role=status.slot===null?'等待加入':host?'奇奇 · 房主':'蒂蒂 · 队员';
  const latency=status.rtt===null?'延迟测量中':`延迟 ${Math.round(status.rtt)} 毫秒`;
  $('online-code').textContent=status.code??'——';
  $('online-role').textContent=`你的角色：${role}`;
  $('online-message').textContent=status.message||connections[status.connection];
  $('online-members').textContent=room?room.members.map((member,slot)=>`${slot===0?'奇奇':'蒂蒂'}：${!member?'等待加入':!member.connected?'已断开':member.ready?'已准备':'等待恢复'}`).join(' · '):'创建房间，把房间号发给搭档；也可以输入房间号加入。';
  $('online-entry').hidden=!!room;
  $('online-start').hidden=!room||room.mode!=='lobby'||!host;
  $('online-start').disabled=!ready||!available||status.connection!=='connected';
  $('online-hud').textContent=`房间 ${status.code??'——'} · ${role} · ${connections[status.connection]} · ${latency}`;
  $('online-hud').hidden=false;
  $('resume').disabled=!host||!ready||!available||status.connection!=='connected';
  $('retry').disabled=!host||!ready||!available;
  $('gameover-retry').disabled=!host||!ready||!available;
  $('next-area').disabled=!host||!ready;
  $('bonus-finish').disabled=!host;
  $('pause-copy').textContent=!available?'本设备正在恢复，恢复后由房主继续。':!ready?'等待两位搭档连接并准备。':host?'两位搭档已准备，点击继续冒险。':'等待房主继续冒险。';
}
export function resetRoomUI(){
  $('online-hud').hidden=true;
  $('online-leave').hidden=true;
  $('home').hidden=false;
  $('online-entry').hidden=false;
  for(const id of ['resume','retry','gameover-retry','next-area','bonus-finish'])$(id).disabled=false;
  $('pause-copy').textContent='准备好了，就继续一起出发。';
}
