const STEP=1/60, MAX_PENDING=120, MAX_HISTORY=32;
const groups=['players','objects','enemies','platforms','projectiles','effects','hazards','pickups'];
const neutral=()=>({move:0,up:false,down:false,jump:false,action:false});
const active=s=>s&&!s.paused&&['playing','bonus'].includes(s.status);
function cloneState(s){const {level,areaLevel,...dynamic}=s;return {...structuredClone(dynamic),level,areaLevel};}
function continuous(a,b){
 return a&&b&&['heldBy','lives','hearts','alive','active','hidden','groundId','grounded','phase','defeated'].every(k=>a[k]===b[k])&&
  JSON.stringify(a.carrying)===JSON.stringify(b.carrying)&&Math.hypot(a.x-b.x,a.y-b.y)<=3;
}
function blendPosition(a,b,weight){
 if(!continuous(a,b))return;
 for(const key of ['x','y'])if(Number.isFinite(a[key])&&Number.isFinite(b[key]))a[key]+=(b[key]-a[key])*weight;
}

// Inputs are sequenced and acknowledged, but never simulated for presentation.
// Every body, event and reward is shown on the same confirmed snapshot timeline.
export function createConfirmedPresentation({slot,clock={now:()=>performance.now()},bufferMs=100}={}){
 if(slot!==0&&slot!==1)throw Error('Invalid player slot');
 if(!Number.isFinite(bufferMs)||bufferMs<0||bufferMs>1000)throw Error('Invalid snapshot buffer');
 let authority=null,view=null,epoch=null,seq=0,ack=0,pending=[],history=[];
 let accumulator=0,held=neutral(),edges={jump:false,action:false},cursor=null,receivedAt=0,stalled=false;
 function reset(){pending=[];history=[];seq=0;ack=0;accumulator=0;held=neutral();edges={jump:false,action:false};cursor=null;stalled=false;}
 function receive(state,meta){
  if(!Number.isSafeInteger(meta?.epoch)||meta.epoch<0||!Number.isSafeInteger(meta?.ack)||meta.ack<0||(epoch!==null&&meta.epoch<epoch))return false;
  const newRun=authority!==state,changed=newRun||epoch!==meta.epoch||authority?.level!==state.level;
  if(!changed&&meta.ack<ack)return false;
  if(changed)reset();
  if(newRun)view={};
  authority=state;epoch=meta.epoch;ack=meta.ack;seq=Math.max(seq,ack);pending=pending.filter(c=>c.seq>ack);
  receivedAt=clock.now();
  const snapshot=cloneState(state);
  if(!active(state)){history=[];cursor=state.time;}
  if(history.at(-1)?.time===state.time)history[history.length-1]=snapshot;
  else history.push(snapshot);
  if(history.length>MAX_HISTORY)history.shift();
  render();return true;
 }
 function advance(raw={},dt=0){
  if(!active(authority))return {commands:[],state:render()};
  const input={move:Math.max(-1,Math.min(1,Number(raw.move)||0)),up:!!raw.up,down:!!raw.down,jump:!!raw.jump,action:!!raw.action};
  edges.jump||=input.jump&&!held.jump;edges.action||=input.action&&!held.action;held=input;
  accumulator+=Math.min(5*STEP,Math.max(0,Number(dt)||0));const commands=[];
  while(accumulator+1e-9>=STEP){
   accumulator=Math.max(0,accumulator-STEP);
   if(pending.length>=MAX_PENDING){accumulator=0;break;}
   const command={seq:++seq,input:{...input,...edges}};edges={jump:false,action:false};pending.push(command);commands.push(command);
  }
  return {commands,state:render()};
 }
 function render(now=clock.now()){
  if(!authority)return null;
  view??={};
  if(!history.length){Object.assign(view,cloneState(authority));return view;}
  const latest=history.at(-1);
  // Arrival-time buffering works without assuming symmetric network delays.
  // Underflow holds the last confirmed pose; the playhead can never rewind.
  const target=active(authority)?latest.time+(now-receivedAt-bufferMs)/1000:latest.time;
  cursor=Math.min(latest.time,Math.max(cursor??history[0].time,history[0].time,target));
  stalled=active(authority)&&target>=latest.time;
  let index=history.findLastIndex(s=>s.time<=cursor+1e-9);index=Math.max(0,index);
  const base=history[index],next=history[index+1];
  Object.assign(view,cloneState(base));
  if(next&&next.time>base.time){
   const weight=Math.max(0,Math.min(1,(cursor-base.time)/(next.time-base.time)));
   for(const group of groups){
    const peers=new Map((next[group]??[]).map(e=>[e.id,e]));
    for(const row of view[group]??[])blendPosition(row,peers.get(row.id),weight);
   }
   if(continuous(view.boss,next.boss)){
    blendPosition(view.boss,next.boss,weight);
    // Boss hit regions and render anchors use absolute world coordinates.
    for(const key of ['weakpoint'])if(view.boss[key]&&next.boss[key])blendPosition(view.boss[key],next.boss[key],weight);
    for(const key of ['contactRegions','segments'])if(view.boss[key]?.length===next.boss[key]?.length)
     for(let i=0;i<(view.boss[key]?.length??0);i++)blendPosition(view.boss[key][i],next.boss[key][i],weight);
    for(const [key,row] of Object.entries(view.boss.anchors??{}))blendPosition(row,next.boss.anchors?.[key],weight);
   }
  }
  view.time=cursor;
  // Ownership changes stay discrete; an attached body follows its shown carrier.
  for(const row of [...(view.players??[]),...(view.objects??[])]){
   const carrier=view.players?.find(p=>p.id===row.heldBy);
   if(carrier){row.x=carrier.x;row.y=carrier.hidden?carrier.y:carrier.y+carrier.h+.15;}
  }
  return view;
 }
 function clear(){reset();epoch=null;}
 return {receive,advance,render,clear,diagnostics:()=>({mode:'confirmed',bufferMs,pending:pending.length,history:history.length,epoch,ack,sequence:seq,renderTime:cursor,latestTime:authority?.time??null,stalled})};
}
