const TRAIL_LIFETIME = 3000;
const MAX_STEPS = 20;
const MAX_TRAILS = 72;

const skinColors = {
  red: ['#f4435c','#ffbdca'], orange: ['#ff8a3d','#ffd0a8'], yellow: ['#ffd84d','#fff0a8'],
  green: ['#54d878','#c0ffd0'], cyan: ['#55e4e0','#c7ffff'], blue: ['#5794ff','#c2d8ff'],
  purple: ['#aa6cff','#e1c6ff'], pink: ['#ff7fba','#ffd1e5'], silver: ['#dce9f4','#91a9bd'],
  gold: ['#ffd35a','#fff0a6'], iridescent: ['#ff6e95','#ffe06e','#70f0c6','#6fb2ff','#b979ff']
};

export function skinTrailStyle(skinId){
  const colors=skinColors[skinId]||skinColors.red;
  if(skinId==='silver')return{colors,particles:'moon-grains',stars:true,moons:true,rainbow:false};
  if(skinId==='gold')return{colors,particles:'moon-grains',stars:true,moons:true,rainbow:false};
  if(skinId==='iridescent')return{colors,particles:'rainbow-grains',stars:true,moons:true,rainbow:true};
  return{colors,particles:'grains',stars:false,moons:false,rainbow:false};
}

export function createMotionState(){return{steps:[],trails:[]};}

function finiteNow(now){return Number.isFinite(now)?now:0;}
function prune(state,now){
  const cutoff=finiteNow(now)-TRAIL_LIFETIME;
  state.steps=state.steps.filter(step=>step.born>cutoff);
  state.trails=state.trails.filter(trail=>trail.born>cutoff);
}

export function recordStep(state,{from,to,skinId='red',now}){
  if(!state||!from||!to)return state;
  const dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy);
  if(!length)return state;
  const born=finiteNow(now);prune(state,born);
  const step={from:{x:from.x,y:from.y},to:{x:to.x,y:to.y},direction:{x:dx/length,y:dy/length},skinId,born};
  state.steps.push(step);state.trails.push({...step,style:skinTrailStyle(skinId)});
  if(state.steps.length>MAX_STEPS)state.steps.splice(0,state.steps.length-MAX_STEPS);
  if(state.trails.length>MAX_TRAILS)state.trails.splice(0,state.trails.length-MAX_TRAILS);
  return state;
}

export function activeTrails(state,now){
  if(!state)return[];
  const at=finiteNow(now);prune(state,at);
  return state.trails.map(trail=>({...trail,alpha:Math.max(0,Math.min(1,1-(at-trail.born)/TRAIL_LIFETIME))}));
}

export function grassSwayAt(cell,state,now){
  const at=finiteNow(now),ambient=.035+Math.sin((cell.x*1.7+cell.y*.9)+at/900)*.022;
  if(!state)return{amount:ambient,direction:{x:0,y:0}};
  prune(state,at);
  let amount=ambient,direction={x:0,y:0};
  for(const step of state.steps){
    const distance=Math.hypot(cell.x-step.to.x,cell.y-step.to.y),age=(at-step.born)/TRAIL_LIFETIME;
    if(distance>2.5||age<0||age>=1)continue;
    const influence=.42*(1-distance/2.5)*(1-age);
    if(influence>amount){amount=influence;direction=step.direction;}
  }
  return{amount,direction};
}
