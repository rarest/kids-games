import { updateBoss } from './bosses.js';
import { completeArea } from './campaign.js';
const G=28,STEP=1/120;
const copy=v=>structuredClone(v);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const box=e=>({left:e.x-e.w/2,right:e.x+e.w/2,bottom:e.y,top:e.y+e.h});
function overlap(a,b){const x=box(a),y=box(b);return x.left<y.right&&x.right>y.left&&x.bottom<y.top&&x.top>y.bottom;}
function event(s,type,extra={}){s.events.push({id:`event-${s.nextEventId++}`,type,time:s.time,...extra});if(s.events.length>100)s.events.splice(0,s.events.length-100);}
function dynamicObject(o){return {w:o.kind==='bigcrate'?1.6:.8,h:o.kind==='bigcrate'?1.6:.8,vx:0,vy:0,active:true,heldBy:null,thrown:false,grounded:false,hitIds:[],recover:{x:o.x,y:o.y},...copy(o)};}
function player(id,character,spawn,offset=0){return {id,character,x:spawn.x+offset,y:spawn.y,vx:0,vy:0,w:.8,h:1.3,facing:1,hearts:3,lives:3,grounded:true,groundId:null,carrying:null,heldBy:null,hidden:false,invulnerable:0,stun:0,zipper:0,dropTimer:0,throwTimer:0,animation:'idle'};}
function loadEntities(s,level){
 s.level=copy(level);s.platforms=(level.platforms??[]).map(p=>({...copy(p),homeX:p.x,homeY:p.y,dx:0,dy:0}));
 s.objects=(level.objects??[]).map(dynamicObject);
 s.enemies=(level.enemies??[]).map(e=>({w:1,h:1,vx:0,vy:0,alive:true,facing:-1,speed:1.7,timer:0,homeY:e.y,min:e.x-3,max:e.x+3,...copy(e)}));
 s.hazards=copy(level.hazards??[]);s.pickups=(level.pickups??[]).map(p=>({w:.55,h:.6,collected:false,...copy(p)}));
 s.boss=level.boss?{w:2,h:2.4,...copy(level.boss),homeX:level.boss.x,homeY:level.boss.y,active:false,hp:5,defeated:false,invulnerable:0,timer:0,attackTimer:0}:null;
 s.projectiles=[];s.effects=[];
}
export function createGame(level,{players=1,character='chip',campaign=null}={}){
 const s={areaLevel:copy(level),level:null,players:[],objects:[],enemies:[],hazards:[],boss:null,projectiles:[],effects:[],events:[],time:0,paused:false,status:'playing',score:0,flowers:0,stars:0,completed:[...(campaign?.completed??[])],checkpoint:copy(level.spawn),campaign,bonus:null,ending:false,nextEntityId:1,nextEventId:1,previousInputs:[],_accumulator:0,_pendingEdges:[]};
 loadEntities(s,level);s.players=Array.from({length:clamp(players,1,2)},(_,i)=>player(`p${i+1}`,i===0?character:(character==='chip'?'dale':'chip'),level.spawn,i*.9));
 return s;
}
export function setPaused(s,value){s.paused=!!value;s.previousInputs=[];s._accumulator=0;s._pendingEdges=[];}
export function snapshot(s){const {campaign,...state}=s;return copy({...state,campaign});}
export function restartLevel(s){
 const old=s.players.map(p=>({id:p.id,character:p.character,lives:s.status==='gameover'?3:p.lives}));loadEntities(s,s.areaLevel);
 s.players=old.map((p,i)=>({...player(p.id,p.character,s.areaLevel.spawn,i*.9),lives:p.lives}));s.status='playing';s.checkpoint=copy(s.areaLevel.spawn);s.bonus=null;s.ending=false;s.previousInputs=[];s.paused=false;s._accumulator=0;s._pendingEdges=[];
 event(s,'restart');
}
function release(s,p,thrown=false,up=false){
 const link=p.carrying;if(!link)return;
 const e=(link.type==='player'?s.players:s.objects).find(e=>e.id===link.id);p.carrying=null;if(!e)return;
 e.heldBy=null;e.x=p.x+(up?0:p.facing*(p.w/2+e.w/2+.15));e.y=p.y+.9;
 e.vx=thrown?(up?0:p.facing*(e.kind==='apple'?7:11)):0;e.vy=thrown?(up?16:3):0;e.grounded=false;
 if(link.type==='object'){e.thrown=thrown;e.hitIds=[];e.owner=p.id;}else{e.throwTimer=thrown?.55:0;e.stun=thrown?.18:0;}
 if(thrown)event(s,'throw',{player:p.id,kind:e.kind??'player',up});
}
function act(s,p,input){
 if(p.heldBy||p.stun>0||p.hidden)return;
 if(p.carrying){release(s,p,true,input.up);return;}
 const nearby=e=>Math.abs(e.x-p.x)<1.5&&Math.abs(e.y-p.y)<1.6;
 const candidates=s.objects.filter(o=>o.active&&!o.heldBy&&o.kind!=='bigcrate'&&nearby(o)).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x));
 let e=candidates[0],type='object';
 if(!e){type='player';e=s.players.find(o=>o.id!==p.id&&o.lives>0&&!o.heldBy&&!o.carrying&&nearby(o));}
 if(!e)return;e.heldBy=p.id;e.thrown=false;e.vx=0;e.vy=0;p.carrying={type,id:e.id};event(s,'pickup',{player:p.id,kind:e.kind??'player'});
}
function supports(s,e,includeObjects=true){
 const ps=s.platforms.map(p=>({...p,top:p.y,left:p.x,right:p.x+p.w}));
 if(includeObjects)for(const o of s.objects)if(o!==e&&o.active&&!o.heldBy&&!o.thrown&&o.grounded&&o.kind!=='ball')ps.push({id:o.id,left:o.x-o.w/2,right:o.x+o.w/2,top:o.y+o.h,h:o.h,oneWay:false,object:true});
 return ps;
}
function integrate(s,e,dt,{ignoreOneWay=false,objects=true,sideWalls=true}={}){
 const oldY=e.y,oldX=e.x,wasGrounded=e.grounded;const ps=supports(s,e,objects);
 e.vy-=G*dt;e.x+=e.vx*dt;e.y+=e.vy*dt;e.grounded=false;e.groundId=null;
 let landing=null;
 for(const p of ps){
  if(ignoreOneWay&&p.oneWay)continue;
  const left=e.x-e.w/2,right=e.x+e.w/2;
  if(right>p.left+.025&&left<p.right-.025&&e.vy<=0&&oldY>=p.top-.06&&e.y<=p.top+.001){if(!landing||p.top>landing.top)landing=p;}
  if(!p.oneWay&&right>p.left+.025&&left<p.right-.025&&e.vy>0&&oldY+e.h<=p.top-p.h+.03&&e.y+e.h>=p.top-p.h){e.y=p.top-p.h-e.h;e.vy=0;}
  if(sideWalls&&!p.oneWay&&!p.object&&e.y<p.top-.12&&e.y+e.h>p.top-p.h+.1){
   if(oldX+e.w/2<=p.left+.025&&right>p.left){e.x=p.left-e.w/2;e.vx=0;}
   else if(oldX-e.w/2>=p.right-.025&&left<p.right){e.x=p.right+e.w/2;e.vx=0;}
  }
 }
 if(landing){e.y=landing.top;e.vy=0;e.grounded=true;e.groundId=landing.id;if(landing.kind==='conveyor')e.x+=(landing.speed??1.5)*dt;}
 return !wasGrounded&&e.grounded;
}
function damage(s,p,source,fall=false){
 if(p.lives<=0||p.heldBy||(!fall&&(p.invulnerable>0||p.zipper>0)))return;
 if(fall)p.hearts=0;else p.hearts--;
 release(s,p);p.invulnerable=1.5;p.stun=.25;p.vx=(Math.sign(p.x-source.x)||-p.facing)*4;p.vy=6;p.hidden=false;event(s,'damage',{player:p.id,hearts:p.hearts});
 if(p.hearts<=0){p.lives--;event(s,'lifeLost',{player:p.id,lives:p.lives});
  if(p.lives>0){Object.assign(p,{x:s.checkpoint.x,y:s.checkpoint.y,hearts:3,vx:0,vy:0,grounded:true,stun:0,invulnerable:2,throwTimer:0});}
  else{p.hearts=0;p.vx=0;p.vy=0;}
  if(s.players.every(p=>p.lives<=0))s.status='gameover';
 }
}
function awardStar(s,converted=false){
 s.stars++;if(converted)event(s,'star',{converted:true});
 if(s.stars%10!==0)return;
 for(const q of s.players){
  const wasDead=q.lives<=0;q.lives++;
  if(wasDead)Object.assign(q,player(q.id,q.character,s.checkpoint),{lives:q.lives,invulnerable:2});
 }
 event(s,'extraLife');
}
function collect(s,p,item){
 item.collected=true;const kind=item.kind;
 if(kind==='flower'){s.flowers++;s.score+=100;if(s.flowers%50===0)awardStar(s,true);}
 else if(kind==='star'){s.score+=500;awardStar(s);}
 else if(kind==='acorn')p.hearts=Math.min(3,p.hearts+1);
 else if(kind==='zipper')for(const q of s.players)q.zipper=10;
 if(s.bonus)s.bonus.collected++;event(s,'collect',{kind,player:p.id});
}
function contents(s,o){
 if(!o.contents||o.opened)return;o.opened=true;
 const values=Array.isArray(o.contents)?o.contents:[o.contents];
 for(const [i,kind] of values.entries())s.pickups.push({id:`${o.id}-contents-${i}`,kind,x:o.x+(i%3)*.65,y:o.y,w:.55,h:.6,collected:false});
}
function defend(s,p){
 if(!p.hidden)return false;
 const o=s.objects.find(o=>o.id===p.carrying?.id);
 if(o?.kind==='crate'){p.carrying=null;o.heldBy=null;o.active=false;o.x=p.x;o.y=p.y;contents(s,o);p.hidden=false;p.invulnerable=Math.max(p.invulnerable,.3);event(s,'break',{kind:'crate'});}
 return true;
}
function hitObject(s,o,target){
 if(o.hitIds.includes(target.id))return;
 if(target===s.boss){
  if(o.kind!=='ball'||target.invulnerable>0||target.breakTimer>0||!target.active||target.defeated)return;
  target.hp--;target.invulnerable=.65;s.score+=500;event(s,'bossHit',{kind:target.kind,hp:target.hp});
  if(target.kind==='caterpillar'){
   target.breakTimer=.9;target.phase='separated';target.contactRegions=[];target.segments=[];
   for(let i=0;i<5;i++)s.projectiles.push({id:`segment-${s.nextEntityId++}`,kind:'segment',owner:target.id,x:target.x,y:target.y+i*target.h/5,w:.7,h:.7,vx:(i-2)*2.1,vy:4-i*.3,gravity:12,ttl:2});
  }
  o.vx=(Math.sign(o.x-target.x)||-1)*4;o.vy=5;o.thrown=false;
  if(target.hp<=0){target.defeated=true;s.projectiles=s.projectiles.filter(x=>x.owner!==target.id);s.score+=2500;event(s,'bossDefeated',{kind:target.kind});}
 }else if(target.kind==='bigcrate'){
  target.active=false;contents(s,target);event(s,'break',{kind:'bigcrate'});
 }else{
  target.alive=false;s.score+=200;event(s,'hit',{kind:target.kind});
 }
 if(o.kind==='crate'){o.active=false;contents(s,o);}else if(o.kind!=='apple'){o.vx*=.35;o.vy=4;}
 else{o.active=false;contents(s,o);}
 o.hitIds.push(target.id);
}
function recoverObject(s,o){
 // Authored object spawns have real support; arena bounds can sit underneath
 // elevated terrain and are not a safe floor or respawn coordinate.
 Object.assign(o,{x:o.recover.x,y:o.recover.y,vx:0,vy:0,thrown:false,grounded:false,groundId:null,hitIds:[]});
 event(s,'recover',{kind:o.kind});
}
function updateObjects(s,dt){
 // Lower boxes settle before upper boxes, independent of authored object order.
 for(const o of [...s.objects].sort((a,b)=>a.y-b.y)){
  if(!o.active||o.heldBy)continue;
  const oldVX=o.vx;const land=integrate(s,o,dt,{sideWalls:!o.thrown});
  if(o.kind==='ball'&&o.vy< -1)for(const p of s.players)if(!p.heldBy&&p.lives>0&&overlap(o,p)){
   p.stun=.5;o.vy=4;o.vx=(Math.sign(o.x-p.x)||1)*3;event(s,'stun',{player:p.id,kind:'ball'});
  }
  if(o.grounded){o.vx*=Math.max(0,1-dt*7);if(Math.abs(o.vx)<.2){o.vx=0;o.thrown=false;}}
  if(land&&o.thrown&&o.kind==='ball'){o.vy=3;o.grounded=false;o.vx=oldVX*.5;}
  if(o.y< -4||o.x< -2||o.x>s.level.width+2){
   if(o.kind==='ball'||o.kind==='metal')recoverObject(s,o);
   else{o.active=false;}continue;
  }
  if(o.kind==='ball'&&s.boss?.active&&!s.boss.defeated&&s.boss.arena){const a=s.boss.arena;if(o.x<a.x-.8||o.x>a.x+a.w+.8||o.y<a.y-2)recoverObject(s,o);}
  if(!o.thrown)continue;
  for(const e of s.enemies)if(e.alive&&overlap(o,e))hitObject(s,o,e);
  for(const big of s.objects)if(big!==o&&big.active&&big.kind==='bigcrate'&&overlap(o,big))hitObject(s,o,big);
  if(s.boss&&!s.boss.defeated&&overlap(o,s.boss.weakpoint??s.boss))hitObject(s,o,s.boss);
 }
}
function updateEnemies(s,dt){
 for(const e of s.enemies){if(!e.alive)continue;
  const near=s.players.find(p=>p.lives>0&&Math.abs(p.x-e.x)<24&&Math.abs(p.y-e.y)<12);if(!near)continue;
  e.timer+=dt;
  if(['bird','bee','pelican'].includes(e.kind)){
   e.x+=e.facing*(e.speed??2)*dt;e.y=e.homeY+Math.sin(e.timer*(e.kind==='bee'?4:2))*1.1;
   if(e.kind==='pelican'&&e.timer>2.4){e.timer=0;s.projectiles.push({id:`enemy-shot-${s.nextEntityId++}`,kind:'drop',owner:e.id,x:e.x,y:e.y,vx:0,vy:-2,w:.4,h:.5,ttl:4,gravity:10});}
  }else{
   if(e.kind==='mimic'){e.animation=Math.abs(near.x-e.x)<4?'lunge':'disguise';e.vx=e.animation==='lunge'?Math.sign(near.x-e.x)*4:0;}
   else if(['rhino','dog'].includes(e.kind)&&Math.abs(near.x-e.x)<4){e.vx=e.speed===0?0:Math.sign(near.x-e.x)*(e.kind==='rhino'?4.4:2.8);e.animation='charge';}
   else e.vx=e.facing*(e.speed??1.7);
   if(e.kind==='kangaroo'&&e.grounded&&e.timer>.9){e.vy=9;e.timer=0;}
   if(e.kind==='toy'&&e.timer>2.8){e.timer=0;s.projectiles.push({id:`enemy-shot-${s.nextEntityId++}`,kind:'gear',owner:e.id,x:e.x,y:e.y+.5,vx:e.facing*4,vy:3,w:.4,h:.4,ttl:4,gravity:10,bounce:true});}
   integrate(s,e,dt,{objects:false});
   if(e.y< -4)e.alive=false;
  }
  if(e.x<=e.min){e.x=e.min;e.facing=1;}if(e.x>=e.max){e.x=e.max;e.facing=-1;}
  for(const p of s.players)if(p.lives>0&&!p.heldBy&&overlap(p,e)){
   if(p.hidden||p.zipper>0||p.throwTimer>0){e.alive=false;s.score+=200;event(s,'hit',{kind:e.kind});
    defend(s,p);
   }
   else damage(s,p,e);
  }
 }
}
function updateProjectiles(s,dt){
 for(const q of s.projectiles){q.ttl-=dt;q.vy-=(q.gravity??0)*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;
  if(q.bounce)for(const p of s.platforms)if(q.vy<0&&q.y<p.y&&q.y>p.y-.4&&q.x>p.x&&q.x<p.x+p.w){q.y=p.y;q.vy=5;}
  for(const p of s.players)if(p.lives>0&&overlap(p,q)){if(!defend(s,p))damage(s,p,q);q.ttl=0;}
 }
 s.projectiles=s.projectiles.filter(q=>q.ttl>0&&q.y> -5&&q.x> -5&&q.x<s.level.width+5);
}
function bonusLevel(areaId){
 return {id:`bonus-${areaId}`,name:'通关奖励房',theme:'bonus',width:24,height:12,spawn:{x:2,y:1},
 platforms:[{id:'bonus-floor',x:0,y:1,w:24,h:1},{id:'bonus-low',x:5,y:3.2,w:6,h:.5,kind:'shelf',oneWay:true},{id:'bonus-high',x:13,y:5.4,w:7,h:.5,kind:'shelf',oneWay:true}],
 objects:[{id:'bonus-box',kind:'bigcrate',x:10,y:1,contents:['star','acorn']},{id:'bonus-crate',kind:'crate',x:3,y:1}],
 pickups:[...Array.from({length:10},(_,i)=>({id:`bonus-flower-${i}`,kind:'flower',x:4+i*1.6,y:1.2})),{id:'bonus-star',kind:'star',x:17,y:5.5}],
 enemies:[],hazards:[],boss:null,checkpoints:[],decor:[{id:'bonus-back',kind:'curtain',x:12,y:1,w:24,h:10}],exit:{x:23,y:1},reference:{sections:['timed collection room'],landmarks:['three reward shelves']}};
}
function clearArea(s){
 const id=s.areaLevel.id;s.status='cleared';if(!s.completed.includes(id))s.completed.push(id);
 if(s.campaign){completeArea(s.campaign,id);s.completed=[...s.campaign.completed];}
 s.ending=id==='J';s.bonus=null;event(s,'clear',{area:id,ending:s.ending});
}
export function finishBonus(s){if(s.status==='bonus')clearArea(s);}
function enterBonus(s){
 if(s.areaLevel.id==='J'){clearArea(s);return;}
 for(const p of s.players)release(s,p);
 loadEntities(s,bonusLevel(s.areaLevel.id));s.status='bonus';s.bonus={areaId:s.areaLevel.id,remaining:20,collected:0};
 for(const [i,p] of s.players.entries())Object.assign(p,{x:2+i,y:1,vx:0,vy:0,heldBy:null,carrying:null,hidden:false,grounded:true,groundId:null,invulnerable:1});
 event(s,'bonus',{area:s.areaLevel.id});
}
function substep(s,inputs,dt,pressed){
 s.time+=dt;
 for(const m of s.platforms){const ox=m.x,oy=m.y;if(m.kind==='moving'){const amount=Math.sin(s.time*(m.speed??1))*(m.range??2);if(m.axis==='y')m.y=m.homeY+amount;else m.x=m.homeX+amount;}m.dx=m.x-ox;m.dy=m.y-oy;
  for(const p of s.players)if(p.grounded&&p.groundId===m.id){p.x+=m.dx;p.y+=m.dy;}
 }
 for(const [i,p] of s.players.entries()){
  if(p.lives<=0)continue;const input=inputs[i]??{};for(const key of ['invulnerable','stun','zipper','dropTimer','throwTimer'])p[key]=Math.max(0,p[key]-dt);
  if(p.heldBy)continue;
  const held=p.carrying?.type==='object'?s.objects.find(o=>o.id===p.carrying.id):null;
  p.hidden=!!(input.down&&held&&['crate','metal'].includes(held.kind)&&p.grounded);
  if(pressed&&input.action)act(s,p,input);
  if(pressed&&input.jump&&p.grounded&&p.stun<=0){
   if(input.down){const ground=s.platforms.find(m=>m.id===p.groundId);if(ground?.oneWay){p.dropTimer=.3;p.y-=.12;p.grounded=false;}}
   else{p.vy=held?.kind==='apple'?11:14;p.grounded=false;event(s,'jump',{player:p.id});}
  }
  const move=clamp(Number(input.move)||0,-1,1);
  if(p.stun<=0&&p.throwTimer<=0)p.vx=p.hidden?0:move*(held?.kind==='apple'?4.1:7.2);
  if(move&&!p.hidden)p.facing=Math.sign(move);
  const landed=integrate(s,p,dt,{ignoreOneWay:p.dropTimer>0});p.x=clamp(p.x,p.w/2,s.level.width-p.w/2);
  if(landed)event(s,'land',{player:p.id});
  if(p.y< -4)damage(s,p,{x:p.x},true);
  p.animation=p.hidden?'hide':p.heldBy?'held':p.stun>0?'hurt':!p.grounded?'jump':p.carrying?'carry':Math.abs(p.vx)>.1?'run':'idle';
 }
 updateBoss(s,dt);updateObjects(s,dt);updateEnemies(s,dt);updateProjectiles(s,dt);
 for(const p of s.players){if(p.lives<=0||p.heldBy)continue;
  if(s.boss?.active&&!s.boss.defeated&&(s.boss.contactRegions??[s.boss]).some(region=>overlap(p,region)))damage(s,p,s.boss);
  for(const h of s.hazards){h.active=h.period?((s.time+(h.offset??0))%h.period)<(h.activeFor??h.period/2):true;
   if(h.active&&overlap(p,{...h,w:h.w,h:h.h??1}))damage(s,p,h);}
  for(const item of s.pickups)if(!item.collected&&overlap(p,item))collect(s,p,item);
  for(const cp of s.level.checkpoints??[])if(Math.abs(p.x-cp.x)<2&&Math.abs(p.y-cp.y)<1.5){s.checkpoint=copy(cp);}
 }
 // Resolve held positions after all integration, including holding/throwing player 2.
 for(const p of s.players)if(p.carrying){const e=(p.carrying.type==='player'?s.players:s.objects).find(e=>e.id===p.carrying.id);if(e){e.x=p.x;e.y=p.hidden?p.y:p.y+p.h+.15;e.vx=0;e.vy=0;e.grounded=false;if(p.carrying.type==='player')e.animation='held';}}
 if(s.status==='playing'&&(!s.boss||s.boss.defeated)&&s.players.some(p=>p.lives>0&&!p.heldBy&&Math.abs(p.x-s.level.exit.x)<1&&Math.abs(p.y-s.level.exit.y)<2))enterBonus(s);
 else if(s.status==='bonus'){s.bonus.remaining-=dt;if(s.bonus.remaining<=0||s.players.some(p=>p.x>s.level.exit.x-.8))finishBonus(s);}
 s.events=s.events.slice(-100);s.effects=s.effects.filter(e=>s.time-e.time<1.5);
}
export function stepGame(s,inputs=[],dt=1/60){
 if(s.paused||!['playing','bonus'].includes(s.status))return s;
 for(const [i,input] of inputs.entries())s._pendingEdges[i]={action:!!(s._pendingEdges[i]?.action||(input.action&&!s.previousInputs[i]?.action)),jump:!!(s._pendingEdges[i]?.jump||(input.jump&&!s.previousInputs[i]?.jump))};
 s.previousInputs=inputs.map(i=>({...i}));s._accumulator+=clamp(Number(dt)||0,0,1/30);let first=true;
 while(s._accumulator+1e-9>=STEP&&['playing','bonus'].includes(s.status)){
  const sample=first?inputs.map((input,i)=>({...input,...s._pendingEdges[i]})):inputs;
  substep(s,sample,STEP,first);s._accumulator=Math.max(0,s._accumulator-STEP);
  if(first)s._pendingEdges=[];first=false;
 }
 return s;
}
