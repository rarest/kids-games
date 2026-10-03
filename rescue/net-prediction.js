import {stepGame} from './core.js';

const STEP=1/60, MAX_PENDING=120, MAX_HISTORY=8;
const groups=['players','objects','enemies','platforms','projectiles','effects','hazards','pickups'];
const collisionGroups=new Set(['players','objects','enemies','platforms','projectiles','hazards']);
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
 let ownSample=null;
 function reset(){pending=[];history=[];seq=0;ack=0;accumulator=0;held=neutral();edges={jump:false,action:false};offset={x:0,y:0,at:0};ownSample=null;}
 function simulate(command){
  const samples=inputs.map(i=>({...i,jump:false,action:false}));samples[slot]=command.input;
  stepGame(replay,samples,STEP);
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
  replay=cloneDynamic(state);for(const command of pending)simulate(command);
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
  const coherent=replay&&active(authority)&&replay.level===authority.level;
  const physical=coherent?replay:authority;
  const target=now-100;let left=history[0],right=left;
  for(const entry of history){if(entry.at<=target)left=entry;if(entry.at>=target){right=entry;break;}right=entry;}
  const alpha=left&&right&&right.at>left.at?Math.max(0,Math.min(1,(target-left.at)/(right.at-left.at))):1;
  for(const group of groups){
   // Collision bodies share the replay clock, including after a throw is acknowledged.
   // Rendering a predicted player/box against delayed monsters or platforms causes false contacts.
   if(collisionGroups.has(group)){
    view[group]=(physical[group]??[]).map(e=>{
     if(group!=='players')return {...e};
     const row={...authority.players.find(p=>p.id===e.id)};
     for(const field of visualKeys)if(field in e)row[field]=typeof e[field]==='object'?structuredClone(e[field]):e[field];
     return row;
    });continue;
   }
   view[group]=(authority[group]??[]).map(e=>{
   const row={...e},a=left?.positions[group]?.find(v=>v.id===e.id),b=right?.positions[group]?.find(v=>v.id===e.id);
   const current=history.at(-1)?.positions[group]?.find(v=>v.id===e.id);
   if(!discontinuity(a,b)&&!discontinuity(b,current)){row.x=a.x+(b.x-a.x)*alpha;row.y=a.y+(b.y-a.y)*alpha;}
   return row;
  });}
  if(authority.boss)view.boss={...physical.boss,hp:authority.boss.hp,defeated:authority.boss.defeated,invulnerable:authority.boss.invulnerable};
  view.time=physical.time;
  if(coherent){
   const own=view.players[slot],onMovingPlatform=own.grounded&&view.platforms.some(p=>p.id===own.groundId&&p.kind==='moving');
   // Smoothing must not slide feet away from a platform on the shared replay clock.
   const weight=onMovingPlatform?0:Math.max(0,1-(now-offset.at)/80);
   own.x+=offset.x*weight;own.y+=offset.y*weight;
  }
  // A carrier's visual correction also moves its held body, never a released projectile.
  for(const player of view.players){
   const carrier=view.players.find(p=>p.id===player.heldBy);
   if(carrier){player.x=carrier.x;player.y=carrier.hidden?carrier.y:carrier.y+carrier.h+.15;}
  }
  for(const object of view.objects){const carrier=view.players.find(p=>p.id===object.heldBy);if(carrier){object.x=carrier.x;object.y=carrier.hidden?carrier.y:carrier.y+carrier.h+.15;}}
  return view;
 }
 function clear(){reset();replay=null;epoch=null;}
 return {receive,advance,render,clear,diagnostics:()=>({pending:pending.length,history:history.length,epoch,ack,sequence:seq})};
}
