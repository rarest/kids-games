export const STAGES=200;
export const SUBSTAGES=50;
export const MAX_WAVES=STAGES*SUBSTAGES;
export const MAX_SPREAD=100;
export const MAX_PILOTS=16;
export const TIERS={
 drone:{name:'红色小怪',hp:1,r:16,damage:1,shots:1,color:'#ed7877',bullet:'#ff7a78',interval:2.6,score:100},
 yellow:{name:'黄色大怪兽',hp:12,r:26,damage:3,shots:3,color:'#edc667',bullet:'#ffd06a',interval:2.2,score:500},
 blue:{name:'蓝色巨兽',hp:24,r:33,damage:4,shots:5,color:'#60a6ef',bullet:'#7bb9ff',interval:2,score:1000},
 purple:{name:'紫色巨兽',hp:40,r:40,damage:10,shots:7,color:'#b185ed',bullet:'#7df28b',interval:1.8,score:1500},
};
export const CARDS=[
 {kind:'spread',title:'扩散 +1',description:'增加1道子弹，最多100道',icon:'⋮'},
 {kind:'power',title:'子弹强化',description:'每发子弹伤害 +1',icon:'ϟ'},
 {kind:'shield',title:'护盾 +10',description:'获得10点护盾，优先抵挡伤害',icon:'◇'},
 {kind:'laser',title:'激光强化',description:'激光伤害 +10，每小关补满10次',icon:'✧'},
];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const hit=(a,b)=>{const dx=a.x-b.x,dy=a.y-b.y,r=a.r+b.r;return Math.abs(dx)<r&&Math.abs(dy)<r&&dx*dx+dy*dy<r*r};
export const stageNumber=g=>Math.ceil(Math.max(1,g.wave)/SUBSTAGES);
export const substageNumber=g=>(Math.max(1,g.wave)-1)%SUBSTAGES+1;
export function buildWave(wave,random=Math.random){
 if(!Number.isInteger(wave)||wave<1||wave>MAX_WAVES)throw new RangeError('Invalid stage');
 const normal=6+Math.floor(random()*4)+Math.min(14,Math.floor(wave/5));
 if(wave<=2)return [...Array(normal).fill('drone'),'yellow'];
 if(wave===30)return [...Array(normal).fill('drone'),...Array(10).fill('purple')];
 const bosses=wave===SUBSTAGES+1?20:1+Math.floor(random()*3)+Math.min(5,Math.floor(wave/20));
 const available=wave<10?['yellow']:wave<20?['yellow','blue']:['yellow','blue','purple'];
 return [...Array(normal).fill('drone'),...Array.from({length:bosses},()=>available[Math.min(available.length-1,Math.floor(random()*available.length))])];
}
export function createGame(width,height,random=Math.random){
 return {id:'host',partners:[],width,height,random,mode:'home',wave:0,score:0,hp:10,shield:0,spread:1,power:1,pulses:2,lasers:10,laserPower:20,beam:null,reward:null,
  player:{x:width/2,y:height*.82,r:16},bullets:[],enemies:[],enemyBullets:[],effects:[],plan:[],
  spawnLeft:0,spawnClock:0,spawnIndex:0,fireClock:0,invincible:0,time:0};
}
export const pilots=g=>[g,...(g.partners||[])].filter(p=>!p.retired&&!p.disconnected);
export function addPilot(g,id){
 if(pilots(g).length>=MAX_PILOTS||pilots(g).some(p=>p.id===id))return null;
 const {player,hp,shield,spread,power,pulses,lasers,laserPower,beam,reward,fireClock,invincible}=createGame(g.width,g.height);
 const p={id,player,hp,shield,spread,power,pulses,lasers,laserPower,beam,reward,fireClock,invincible:3};
 p.player.x=g.width*(.12+(.17*g.partners.length)% .76);g.partners.push(p);return p;
}
export function startWave(g){
 if(g.wave>=MAX_WAVES){g.mode='won';return false}
 g.wave++;g.mode='playing';g.plan=buildWave(g.wave,g.random);g.spawnLeft=g.plan.length;g.spawnClock=.4;g.spawnIndex=0;
 g.bullets=[];g.enemies=[];g.enemyBullets=[];g.effects=[];g.fireClock=0;g.pulses=2;g.lasers=10;g.beam=null;g.reward=null;g.invincible=1.5;
 for(const p of pilots(g)){p.fireClock=0;p.pulses=2;p.lasers=10;p.beam=null;p.reward=null;p.invincible=1.5;if(p.hp<=0)p.hp=10}
 return true;
}
export function resizeGame(g,width,height){
 const sx=width/g.width,sy=height/g.height;
 for(const e of [g.player,...g.bullets,...g.enemies,...g.enemyBullets,...g.effects]){e.x*=sx;e.y*=sy}
 if(g.beam){g.beam.x*=sx;g.beam.y*=sy}
 g.width=width;g.height=height;g.player.x=clamp(g.player.x,18,width-18);g.player.y=clamp(g.player.y,24,height-18);
}
export function drawUpgrade(g,p=g){
 if(g.mode!=='upgrade'||p.reward)return null;
 const pool=CARDS.filter(c=>c.kind!=='spread'||p.spread<MAX_SPREAD);
 const card=pool[Math.min(pool.length-1,Math.floor(g.random()*pool.length))];
 if(card.kind==='spread')p.spread++;
 if(card.kind==='power')p.power++;
 if(card.kind==='shield')p.shield+=10;
 if(card.kind==='laser')p.laserPower+=10;
 p.reward=card;return card;
}
export function continueWave(g){if(g.mode!=='upgrade'||pilots(g).some(p=>!p.reward))return false;return startWave(g)}
function destroy(g,e){
 g.score+=(TIERS[e.kind]||TIERS.drone).score;
 g.effects.push({x:e.x,y:e.y,r:e.r,ttl:.4});
}
function clearDefeated(g){g.enemies=g.enemies.filter(e=>{if(e.hp<=0){destroy(g,e);return false}return true})}
export function pulse(g,p=g){
 if(g.mode!=='playing'||p.hp<=0||p.pulses<=0)return false;
 p.pulses--;g.enemyBullets=[];for(const e of g.enemies)e.hp-=3+p.power;
 clearDefeated(g);return true;
}
export function laser(g,p=g){
 if(g.mode!=='playing'||p.hp<=0||p.lasers<=0||p.beam?.ttl>0)return false;
 p.lasers--;p.beam={x:p.player.x,y:p.player.y,width:44,ttl:.22};
 for(const e of g.enemies)if(e.y-e.r<p.player.y&&Math.abs(e.x-p.player.x)<22+e.r)e.hp-=p.laserPower;
 g.enemyBullets=g.enemyBullets.filter(b=>b.y>p.player.y||Math.abs(b.x-p.player.x)>22+b.r);
 clearDefeated(g);return true;
}
function damage(g,amount,p=g){
 if(p.invincible>0||g.mode!=='playing')return;
 const absorbed=Math.min(p.shield,amount);p.shield-=absorbed;p.hp=Math.max(0,p.hp-(amount-absorbed));p.invincible=1.2;
 if(pilots(g).every(p=>p.hp<=0))g.mode='over';
}
export function fireVolley(g,p=g){
 const speed=Math.max(520,g.height*.85);
 for(let i=0;i<p.spread;i++){
  const angle=p.spread===1?0:(i/(p.spread-1)-.5)*1.25;
  g.bullets.push({owner:p.id,x:p.player.x,y:p.player.y-20,r:4,vy:-Math.cos(angle)*speed,vx:Math.sin(angle)*speed,damage:p.power});
 }
}
function tick(g,dt,input){
 if(pilots(g).length&&pilots(g).every(p=>p.hp<=0)){g.mode='over';return}
 g.time+=dt;
 const speed=Math.min(560,Math.max(260,g.width*.55));
 for(const p of pilots(g)){
  p.invincible=Math.max(0,p.invincible-dt);if(p.beam)p.beam.ttl=Math.max(0,p.beam.ttl-dt);
  if(p.hp<=0)continue;
  const control=p===g?input:input.partners?.[p.id]||{};
  let dx=control.x||0,dy=control.y||0;
  if(control.target){dx=control.target.x-p.player.x;dy=control.target.y-p.player.y;const distance=Math.hypot(dx,dy);if(distance<speed*dt){p.player.x=control.target.x;p.player.y=control.target.y;dx=dy=0}}
  const length=Math.hypot(dx,dy)||1;
  p.player.x=clamp(p.player.x+dx/length*speed*dt,18,g.width-18);p.player.y=clamp(p.player.y+dy/length*speed*dt,24,g.height-18);
  p.fireClock-=dt;if(p.fireClock<=0){fireVolley(g,p);p.fireClock=.24}
 }
 g.spawnClock-=dt;
 // Bosses enter in groups of at most three so the ten-boss round stays playable.
 const nextKind=g.plan[g.spawnIndex];
 if(g.spawnLeft>0&&g.spawnClock<=0&&g.enemies.length<10&&(nextKind==='drone'||g.enemies.filter(e=>e.kind!=='drone').length<3)){
  const kind=nextKind||'drone',tier=TIERS[kind],boss=kind!=='drone';g.spawnIndex++;
  const hp=Math.ceil((tier.hp+(g.wave-1)*(boss?1:.15))*(1+Math.min(.6,(pilots(g).length-1)*.08)));
  g.enemies.push({kind,damage:tier.damage+(boss?Math.min(5,Math.floor((g.wave-1)/SUBSTAGES))+(pilots(g).length>1?1:0):0),x:g.width*(.15+g.random()*.7),y:-tier.r,r:tier.r,hp,maxHp:hp,
   vy:boss?Math.max(36,g.height*.16):40+Math.min(65,g.wave*.5),vx:(g.random()>.5?1:-1)*(boss?25:18),fire:1.8+g.random()});
  g.spawnLeft--;g.spawnClock=.65;
 }
 for(const e of g.enemies){
  e.y+=e.vy*dt;e.x+=e.vx*dt;
  if(e.x<e.r){e.x=e.r;e.vx=Math.abs(e.vx)}if(e.x>g.width-e.r){e.x=g.width-e.r;e.vx=-Math.abs(e.vx)}
  if(e.kind!=='drone'&&e.y>Math.max(e.r,g.height*.2))e.vy=0;
  e.fire-=dt;
  if(e.fire<=0&&e.y>0){
   const targets=pilots(g).filter(p=>p.hp>0),target=targets[Math.floor(g.random()*targets.length)]?.player||g.player;
   const tier=TIERS[e.kind]||TIERS.drone,aim=Math.atan2(target.y-e.y,target.x-e.x),bs=100+Math.min(g.wave,80);
   for(let i=0;i<tier.shots&&g.enemyBullets.length<320;i++){
    const angle=aim+(i-(tier.shots-1)/2)*.16;
    g.enemyBullets.push({x:e.x,y:e.y,r:5,vx:Math.cos(angle)*bs,vy:Math.sin(angle)*bs,damage:e.damage||tier.damage,color:tier.bullet});
   }
   e.fire=tier.interval;
  }
 }
 for(const b of g.bullets){
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  for(const e of g.enemies)if(e.hp>0&&hit(b,e)){e.hp-=b.damage;b.y=-100;break}
 }
 g.bullets=g.bullets.filter(b=>b.y>-20&&b.x>-10&&b.x<g.width+10);
 clearDefeated(g);
 g.enemies=g.enemies.filter(e=>{
  if(e.y>g.height+e.r){for(const p of pilots(g))if(p.hp>0)damage(g,e.damage||(TIERS[e.kind]||TIERS.drone).damage,p);return false}
  for(const p of pilots(g))if(p.hp>0&&hit(e,p.player)){damage(g,1,p);if(e.kind==='drone')return false}
  return true;
 });
 g.enemyBullets=g.enemyBullets.filter(b=>{
  b.x+=b.vx*dt;b.y+=b.vy*dt;for(const p of pilots(g))if(p.hp>0&&hit(b,p.player)){damage(g,b.damage||1,p);return false}
  return b.x>-20&&b.x<g.width+20&&b.y>-20&&b.y<g.height+20;
 });
 g.effects=g.effects.filter(e=>(e.ttl-=dt)>0);
 if(g.mode==='playing'&&g.spawnLeft===0&&g.enemies.length===0){g.mode=g.wave===MAX_WAVES?'won':'upgrade';g.enemyBullets=[]}
}
export function stepGame(g,seconds,input={}){
 let remaining=Math.min(1,Math.max(0,seconds));
 while(remaining>1e-8&&g.mode==='playing'){const dt=Math.min(1/60,remaining);tick(g,dt,input);remaining-=dt}
}

// Save at each substage entrance; reloading replays that substage, not half a battle.
export function checkpoint(g){
 return {version:2,wave:g.wave,hp:g.hp,shield:g.shield,spread:g.spread,power:g.power,laserPower:g.laserPower,score:g.score};
}
export function restoreCheckpoint(width,height,saved){
 if(!saved||![1,2].includes(saved.version))return null;
 if(saved.version===1){if(!Number.isInteger(saved.wave)||saved.wave<1||saved.wave>20000)return null;saved={...saved,wave:Math.floor((saved.wave-1)/100)*SUBSTAGES+Math.min(SUBSTAGES,(saved.wave-1)%100+1)}}
 const limits={wave:[1,MAX_WAVES],hp:[1,10],shield:[0,200000],spread:[1,MAX_SPREAD],power:[1,20001],laserPower:[20,200020],score:[0,1000000000]};
 for(const [key,[lo,hi]]of Object.entries(limits))if(!Number.isInteger(saved[key])||saved[key]<lo||saved[key]>hi)return null;
 const g=createGame(width,height);for(const key of Object.keys(limits))g[key]=saved[key];
 g.wave--;startWave(g);return g;
}
