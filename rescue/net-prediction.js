import {stepLocal,projectGeometry} from './core.js';

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
 let authority=null,replay=null,view=null,epoch=null,seq=0,ack=0,pending=[],history=[];
 let accumulator=0,held=neutral(),edges={jump:false,action:false},offset={x:0,y:0,at:0};
 let ownSample=null,teammateSample=null,teammateOffset={x:0,y:0,at:0};
 let snapshotAt=0,objectOverlay=null,geometry=null,geometryLead=0;
 function reset(){pending=[];history=[];seq=0;ack=0;accumulator=0;held=neutral();edges={jump:false,action:false};offset={x:0,y:0,at:0};ownSample=null;teammateSample=null;teammateOffset={x:0,y:0,at:0};objectOverlay=null;}
 function simulate(command){
  const previousLink=replay.players[slot].carrying;
  stepLocal(replay,slot,command.input,STEP);
  const own=replay.players[slot];
  if(command.input.action&&(own.carrying?.type==='object'||previousLink?.type==='object')&&objectOverlay?.seq!==command.seq){
   const id=own.carrying?.type==='object'?own.carrying.id:previousLink.id;
   objectOverlay={id,seq:command.seq,released:!own.carrying,last:view?.objects?.find(o=>o.id===id)};
  }
 }
 function receive(state,meta){
  if(!Number.isSafeInteger(meta?.epoch)||meta.epoch<0||!Number.isSafeInteger(meta?.ack)||meta.ack<0|| (epoch!==null&&meta.epoch<epoch))return false;
  const changed=meta.epoch!==epoch||authority!==state||authority?.level!==state.level;
  if(!changed&&meta.ack<ack)return false;
  const newRun=authority!==state;
  const old=view?.players?.[slot],oldX=old?.x,oldY=old?.y;
  const oldTeammate=view?.players?.[1-slot];
  if(changed)reset();
  authority=state;epoch=meta.epoch;ack=meta.ack;seq=Math.max(seq,ack);
  pending=pending.filter(c=>c.seq>ack);
  const now=clock.now(),sample=positions(state),hard=changed||discontinuity(ownSample,sample.players[slot]);
  const teammateHard=changed||discontinuity(teammateSample,sample.players[1-slot]);
  teammateSample=sample.players[1-slot];teammateOffset={x:0,y:0,at:now};
  snapshotAt=Number.isFinite(meta.at)?Math.min(now,meta.at):now;
  geometry=null;geometryLead=0;
  ownSample=sample.players[slot];history.push({at:now,positions:sample});if(history.length>MAX_HISTORY)history.shift();
  replay=cloneDynamic(state);replay._localObjectIds=new Set(objectOverlay?[objectOverlay.id]:[]);for(const command of pending)simulate(command);
  if(!view||newRun)view={};
  const own=replay.players[slot],dx=oldX-own.x,dy=oldY-own.y;
  offset=!hard&&own.lives===state.players[slot].lives&&own.hearts===state.players[slot].hearts&&!state.players[slot].heldBy&&Number.isFinite(dx)&&Number.isFinite(dy)?{x:dx,y:dy,at:now,duration:Math.min(240,Math.max(80,Math.hypot(dx,dy)*60))}:{x:0,y:0,at:now};
  render(now);
  const teammate=view.players[1-slot];
  // A delayed direction change invalidates extrapolation, not the player's
  // location. Blend that visual correction; never smooth respawns or ownership.
  if(!teammateHard&&now-snapshotAt>STEP*1000&&active(authority)&&!teammate.heldBy&&oldTeammate){
   const x=oldTeammate.x-teammate.x,y=oldTeammate.y-teammate.y;
   if(Number.isFinite(x)&&Number.isFinite(y))teammateOffset={x,y,at:now};
  }
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
  // Shared bodies advance by elapsed server time, never by this seat's input debt.
  const lead=active(authority)?Math.min(.25,Math.max(0,(now-snapshotAt)/1000)):0;
  if(coherent){
   if(!geometry||lead<geometryLead){geometry=cloneDynamic(authority);geometryLead=0;}
   projectGeometry(geometry,lead-geometryLead);geometryLead=lead;
  }
  const physical=coherent?geometry:authority;
  for(const group of groups){
   view[group]=(physical[group]??[]).map(e=>({...e}));
  }
  if(authority.boss)view.boss={...physical.boss};
  view.time=physical.time;
  if(coherent){
   const confirmed=authority.players[slot],predicted=replay.players[slot];
   // Damage/respawn and teammate ownership are server decisions, including their positions.
   if(predicted.lives===confirmed.lives&&predicted.hearts===confirmed.hearts&&!confirmed.heldBy){
    for(const field of visualKeys)if(field in predicted)view.players[slot][field]=typeof predicted[field]==='object'?structuredClone(predicted[field]):predicted[field];
    view.players[slot].renderTime=physical.time;
    if(predicted.carrying?.type==='player'||confirmed.carrying?.type==='player')view.players[slot].carrying=confirmed.carrying;
    const link=view.players[slot].carrying;
    if(link?.type==='object'){
     const object=authority.objects.find(o=>o.id===link.id);
     if(!object?.active||(object.heldBy&&object.heldBy!==confirmed.id))view.players[slot].carrying=null;
    }
    const ground=replay.platforms.find(m=>m.id===predicted.groundId),shown=view.platforms.find(m=>m.id===predicted.groundId);
    if(predicted.grounded&&ground?.kind==='moving'&&shown){view.players[slot].x+=shown.x-ground.x;view.players[slot].y+=shown.y-ground.y;}
   }
   if(objectOverlay){
    const object=authority.objects.find(o=>o.id===objectOverlay.id),predictedObject=replay.objects.find(o=>o.id===objectOverlay.id);
    if(!object?.active||(object.heldBy&&object.heldBy!==confirmed.id)||!predictedObject||(!objectOverlay.released&&ack>=objectOverlay.seq&&object.heldBy!==confirmed.id))objectOverlay=null;
    else {
     const row=view.objects.find(o=>o.id===object.id);
     // Copy geometry only. A speculative hit cannot remove an entity or create a reward.
     if(objectOverlay.released&&ack>=objectOverlay.seq&&!object.heldBy){
      objectOverlay.handoff??={at:now,x:(objectOverlay.last?.x??row.x)-row.x,y:(objectOverlay.last?.y??row.y)-row.y,duration:Math.min(1000,Math.max(100,Math.abs((objectOverlay.last?.x??row.x)-row.x)/Math.max(1,Math.abs(row.vx)*.5)*1000))};
      const handoff=objectOverlay.handoff,weight=Math.max(0,1-(now-handoff.at)/handoff.duration);
      row.x+=handoff.x*weight;row.y+=handoff.y*weight;
      if(!weight)objectOverlay=null;
     }else if(predicted.lives===confirmed.lives&&predicted.hearts===confirmed.hearts&&(predictedObject.heldBy===confirmed.id||(objectOverlay.released&&predictedObject.owner===confirmed.id))){
      for(const key of ['x','y','vx','vy','heldBy','thrown'])row[key]=predictedObject[key];
     }
     if(objectOverlay)objectOverlay.last={...row};
    }
   }
   const own=view.players[slot],onMovingPlatform=own.grounded&&view.platforms.some(p=>p.id===own.groundId&&p.kind==='moving');
   // Smoothing must not slide feet away from a platform on the shared replay clock.
   if(onMovingPlatform)offset={x:0,y:0,at:now};
   const weight=onMovingPlatform?0:Math.max(0,1-(now-offset.at)/(offset.duration??80));
   if(predicted.lives===confirmed.lives&&predicted.hearts===confirmed.hearts&&!confirmed.heldBy){own.x+=offset.x*weight;own.y+=offset.y*weight;}
  }
  if(coherent){
   const teammate=view.players[1-slot];
   const onMovingPlatform=teammate.grounded&&view.platforms.some(p=>p.id===teammate.groundId&&p.kind==='moving');
   // Discard rather than hide it: walking off must not revive an old correction.
   if(onMovingPlatform)teammateOffset={x:0,y:0,at:now};
   const weight=onMovingPlatform?0:Math.max(0,1-(now-teammateOffset.at)/120);
   if(!teammate.heldBy){teammate.x+=teammateOffset.x*weight;teammate.y+=teammateOffset.y*weight;}
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
