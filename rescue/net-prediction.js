import {stepGame} from './core.js';

const STEP=1/60, MAX_PENDING=120, MAX_HISTORY=8;
const groups=['players','objects','enemies','platforms','projectiles','effects','hazards','pickups'];
const visualKeys=['x','y','vx','vy','facing','grounded','groundId','animation','carrying','heldBy','hidden','thrown'];
const neutral=()=>({move:0,up:false,down:false,jump:false,action:false});
const active=s=>s&&!s.paused&&['playing','bonus'].includes(s.status);
const inputOf=i=>({move:Math.max(-1,Math.min(1,Number(i?.move)||0)),up:!!i?.up,down:!!i?.down,jump:!!i?.jump,action:!!i?.action});
// Static stage objects are immutable in core; do not clone them for every reconciliation.
function cloneDynamic(s){const {level,areaLevel,...dynamic}=s;return {...structuredClone(dynamic),level,areaLevel};}
function positions(s){const result={};for(const group of groups)result[group]=(s[group]??[]).map(e=>({id:e.id,x:e.x,y:e.y,heldBy:e.heldBy,carrying:JSON.stringify(e.carrying),lives:e.lives,hearts:e.hearts}));if(s.boss)result.boss=[{...s.boss}];return result;}
function discontinuity(a,b){return !a||!b||a.heldBy!==b.heldBy||a.carrying!==b.carrying||a.lives!==b.lives||a.hearts!==b.hearts||Math.hypot(a.x-b.x,a.y-b.y)>3;}

export function createPrediction({slot,clock={now:()=>performance.now()}}={}){
 if(slot!==0&&slot!==1)throw Error('Invalid player slot');
 let authority=null,replay=null,view=null,epoch=null,seq=0,ack=0,pending=[],history=[],inputs=[neutral(),neutral()];
 let accumulator=0,held=neutral(),edges={jump:false,action:false},offset={x:0,y:0,at:0};
 let ownSample=null,affected=new Set();
 function reset(){pending=[];history=[];seq=0;ack=0;accumulator=0;held=neutral();edges={jump:false,action:false};offset={x:0,y:0,at:0};affected.clear();ownSample=null;}
 function simulate(command){
  const samples=inputs.map(i=>({...i,jump:false,action:false}));samples[slot]=command.input;
  const before=replay.players[slot]?.carrying;if(before)affected.add(`${before.type==='player'?'players':'objects'}:${before.id}`);
  stepGame(replay,samples,STEP);
  const after=replay.players[slot]?.carrying;if(after)affected.add(`${after.type==='player'?'players':'objects'}:${after.id}`);
 }
 function receive(state,meta){
  if(!Number.isSafeInteger(meta?.epoch)||meta.epoch<0||!Number.isSafeInteger(meta?.ack)||meta.ack<0|| (epoch!==null&&meta.epoch<epoch))return false;
  const changed=meta.epoch!==epoch||authority!==state||authority?.level!==state.level;
  if(!changed&&meta.ack<ack)return false;
  const newRun=authority!==state;
  const old=view?.players?.[slot],oldX=old?.x,oldY=old?.y;
  if(changed)reset();
  authority=state;epoch=meta.epoch;ack=meta.ack;seq=Math.max(seq,ack);
  inputs=[0,1].map(i=>inputOf(meta.inputs?.[i]));pending=pending.filter(c=>c.seq>ack);
  const now=clock.now(),sample=positions(state),hard=changed||discontinuity(ownSample,sample.players[slot]);
  ownSample=sample.players[slot];history.push({at:now,positions:sample});if(history.length>MAX_HISTORY)history.shift();
  replay=cloneDynamic(state);affected.clear();for(const command of pending)simulate(command);
  if(!view||newRun)view={};
  const own=replay.players[slot],dx=oldX-own.x,dy=oldY-own.y;
  offset=!hard&&Number.isFinite(dx)&&Math.hypot(dx,dy)<2?{x:dx,y:dy,at:now}:{x:0,y:0,at:now};
  render(now);return true;
 }
 function advance(raw={},dt=0){
  if(!active(authority)||!replay)return {commands:[],state:render()};
  const input=inputOf(raw);edges.jump||=input.jump&&!held.jump;edges.action||=input.action&&!held.action;held=input;
  accumulator+=Math.min(5*STEP,Math.max(0,Number(dt)||0));const commands=[];
  while(accumulator+1e-9>=STEP){
   accumulator=Math.max(0,accumulator-STEP);if(pending.length>=MAX_PENDING){accumulator=0;break;}
   const command={seq:++seq,input:{...input,...edges}};edges={jump:false,action:false};pending.push(command);commands.push(command);simulate(command);
  }
  return {commands,state:render()};
 }
 function render(now=clock.now()){
  if(!authority)return null;
  view??={};Object.assign(view,authority);
  const target=now-100;let left=history[0],right=left;
  for(const entry of history){if(entry.at<=target)left=entry;if(entry.at>=target){right=entry;break;}right=entry;}
  const alpha=left&&right&&right.at>left.at?Math.max(0,Math.min(1,(target-left.at)/(right.at-left.at))):1;
  for(const group of groups){view[group]=(authority[group]??[]).map(e=>{
   const row={...e},a=left?.positions[group]?.find(v=>v.id===e.id),b=right?.positions[group]?.find(v=>v.id===e.id);
   const current=history.at(-1)?.positions[group]?.find(v=>v.id===e.id);
   if(!discontinuity(a,b)&&!discontinuity(b,current)){row.x=a.x+(b.x-a.x)*alpha;row.y=a.y+(b.y-a.y)*alpha;}
   return row;
  });}
  if(authority.boss){view.boss={...authority.boss};const a=left?.positions.boss?.[0],b=right?.positions.boss?.[0],current=history.at(-1)?.positions.boss?.[0];if(!discontinuity(a,b)&&!discontinuity(b,current)){view.boss.x=a.x+(b.x-a.x)*alpha;view.boss.y=a.y+(b.y-a.y)*alpha;}}
  if(replay&&active(authority)&&replay.level===authority.level){
   const own=replay.players[slot],weight=Math.max(0,1-(now-offset.at)/80);
   const predicted=new Set(affected);predicted.add(`players:${own.id}`);
   for(const key of predicted){const split=key.indexOf(':'),group=key.slice(0,split),id=key.slice(split+1),source=replay[group].find(e=>e.id===id),target=view[group].find(e=>e.id===id);if(!source||!target)continue;
    for(const field of visualKeys)if(field in source)target[field]=typeof source[field]==='object'?structuredClone(source[field]):source[field];
    target.x+=offset.x*weight;target.y+=offset.y*weight;
   }
  }
  // A local player held by the remote player shares that carrier's interpolation.
  const own=view.players[slot],carrier=view.players.find(p=>p.id===own.heldBy);
  if(carrier){own.x=carrier.x;own.y=carrier.hidden?carrier.y:carrier.y+carrier.h+.15;}
  return view;
 }
 function clear(){reset();replay=null;epoch=null;}
 return {receive,advance,render,clear,diagnostics:()=>({pending:pending.length,history:history.length,epoch,ack,sequence:seq})};
}
