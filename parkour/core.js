export const PLAYER_HEIGHT = 1.65;
export const PLAYER_RADIUS = .25;
const SPEED = 6, JUMP = 8.4, GRAVITY = 20, GRACE = .12, EPS = 1e-7;
const timing = new WeakMap();

function overlaps(player, platform) {
  const dx = Math.max(0, Math.abs(player.x-platform.x)-platform.w/2);
  const dz = Math.max(0, Math.abs(player.z-platform.z)-platform.d/2);
  return dx*dx+dz*dz < PLAYER_RADIUS*PLAYER_RADIUS-EPS;
}

function supported(player, platforms) {
  return platforms.some(p => Math.abs(player.y-p.y)<EPS && overlaps(player,p));
}

export function createState(level) {
  const player = {...level.spawn,vx:0,vy:0,vz:0,yaw:0,grounded:false};
  player.grounded = supported(player,level.platforms);
  const state = {
    level, player, checkpoint:{...level.spawn}, collected:new Set(), receipts:new Set(),
    events:[], elapsed:0, complete:false, falls:0,
    tutorial:{moved:false,jumped:false,camera:false,collected:false,checkpoint:false,finished:false},
  };
  timing.set(state,{held:false,buffer:0,coyote:player.grounded?GRACE:0});
  return state;
}

// Sweep one horizontal axis against the cylinder's circular footprint.
function moveAxis(player, platforms, axis, distance) {
  if (!distance) return;
  const other = axis==='x'?'z':'x', size = axis==='x'?'w':'d', otherSize = axis==='x'?'d':'w';
  const previous = player[axis];
  let next = previous+distance;
  for (const p of platforms) {
    if (player.y>=p.y-EPS || player.y+PLAYER_HEIGHT<=p.y-p.h+EPS) continue;
    const off = Math.max(0,Math.abs(player[other]-p[other])-p[otherSize]/2);
    if (off>=PLAYER_RADIUS) continue;
    const radius = Math.sqrt(PLAYER_RADIUS*PLAYER_RADIUS-off*off);
    const low = p[axis]-p[size]/2-radius, high = p[axis]+p[size]/2+radius;
    if (distance>0 && previous<=low+EPS && next>low) next=Math.min(next,low);
    if (distance<0 && previous>=high-EPS && next<high) next=Math.max(next,high);
  }
  player[axis]=next;
  if (Math.abs(next-previous-distance)>EPS) player[axis==='x'?'vx':'vz']=0;
}

function moveVertical(state, dt) {
  const p=state.player, previous=p.y;
  p.vy-=GRAVITY*dt;
  let next=previous+p.vy*dt, contact=false;
  for (const platform of state.level.platforms) {
    if (!overlaps(p,platform)) continue;
    if (p.vy<=0 && previous>=platform.y-EPS && next<=platform.y) {
      next=Math.max(next,platform.y); contact=true;
    } else if (p.vy>0) {
      const underside=platform.y-platform.h-PLAYER_HEIGHT;
      if (previous<=underside+EPS && next>=underside) next=Math.min(next,underside);
    }
  }
  if (contact) {
    if (!p.grounded) state.events.push({type:'land'});
    p.vy=0;
  } else if (p.vy>0 && next<previous+p.vy*dt-EPS) p.vy=0;
  p.y=next; p.grounded=contact;
}

function visitPoints(state) {
  const p=state.player;
  for (const coin of state.level.coins??[]) {
    if (!state.collected.has(coin.id) && Math.hypot(p.x-coin.x,p.y-coin.y,p.z-coin.z)<=.6) {
      state.collected.add(coin.id); state.events.push({type:'coin',id:coin.id}); state.tutorial.collected=true;
    }
  }
  if (!p.grounded) return;
  const onPoint=point=>Math.abs(p.y-point.y)<.08 && Math.hypot(p.x-point.x,p.z-point.z)<=.6;
  for (const point of state.level.checkpoints??[]) {
    if (state.checkpoint.id!==point.id && onPoint(point)) {
      state.checkpoint={...point}; state.events.push({type:'checkpoint',id:point.id}); state.tutorial.checkpoint=true;
    }
  }
  if (onPoint(state.level.goal)) {
    state.complete=true; state.events.push({type:'finish'}); state.tutorial.finished=true;
  }
}

export function stepState(state, input={}, dt=0) {
  state.events=[];
  if (state.complete || !Number.isFinite(dt) || dt<=0) return state;
  const clock=timing.get(state);
  const held=Boolean(input.jump);
  if (held && !clock.held) clock.buffer=GRACE;
  clock.held=held;
  let x=Number.isFinite(input.x)?input.x:0, z=Number.isFinite(input.z)?input.z:0;
  const magnitude=Math.hypot(x,z);
  if (magnitude>1) {x/=magnitude; z/=magnitude;}
  const frame=Math.min(dt,.25), steps=Math.ceil(frame/(1/120)), slice=frame/steps;
  for (let i=0;i<steps && !state.complete;i++) {
    const p=state.player;
    p.grounded=p.vy<=0 && supported(p,state.level.platforms);
    clock.coyote=p.grounded?GRACE:Math.max(0,clock.coyote-slice);
    if (clock.buffer>0 && clock.coyote>0) {
      p.vy=JUMP; p.grounded=false; clock.buffer=0; clock.coyote=0;
      state.events.push({type:'jump'}); state.tutorial.jumped=true;
    }
    clock.buffer=Math.max(0,clock.buffer-slice);
    const beforeX=p.x, beforeZ=p.z;
    p.vx=x*SPEED; p.vz=z*SPEED;
    if (x || z) p.yaw=Math.atan2(x,z);
    moveAxis(p,state.level.platforms,'x',p.vx*slice);
    moveAxis(p,state.level.platforms,'z',p.vz*slice);
    if (Math.hypot(p.x-beforeX,p.z-beforeZ)>EPS) state.tutorial.moved=true;
    moveVertical(state,slice);
    state.elapsed+=slice;
    const fallHeight=Math.min(-8,...state.level.platforms.map(platform=>platform.y-8));
    if (p.y<fallHeight) {
      Object.assign(p,state.checkpoint,{vx:0,vy:0,vz:0,grounded:true});
      // Checkpoint ID belongs to the point, not to the player schema.
      delete p.id;
      state.falls++; state.events.push({type:'fall'}); clock.buffer=0; clock.coyote=GRACE;
    }
    visitPoints(state);
  }
  return state;
}
