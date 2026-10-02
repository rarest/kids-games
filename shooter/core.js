export const STAGES=200;
export const SUBSTAGES=100;
export const MAX_WAVES=STAGES*SUBSTAGES;
export const MAX_SPREAD=100;
export const TIERS={
 drone:{name:'红色小怪',hp:1,r:16,damage:1,shots:1,color:'#ed7877',bullet:'#ff7a78',interval:2.6,score:100},
 yellow:{name:'黄色大怪兽',hp:12,r:26,damage:2,shots:3,color:'#edc667',bullet:'#ffd06a',interval:2.2,score:500},
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
 const bosses=wave===SUBSTAGES+1?10:1+Math.floor(random()*4);
 const normal=4+Math.floor(random()*4)+Math.min(8,Math.floor(wave/10));
 const available=['yellow','blue','purple'];
 return [...Array(normal).fill('drone'),...Array.from({length:bosses},()=>available[Math.min(available.length-1,Math.floor(random()*available.length))])];
}
export function createGame(width,height,random=Math.random){
 return {width,height,random,mode:'home',wave:0,score:0,hp:10,shield:0,spread:1,power:1,pulses:2,lasers:10,laserPower:20,beam:null,reward:null,
  player:{x:width/2,y:height*.82,r:16},bullets:[],enemies:[],enemyBullets:[],effects:[],plan:[],
  spawnLeft:0,spawnClock:0,spawnIndex:0,fireClock:0,invincible:0,time:0};
}
export function startWave(g){
 if(g.wave>=MAX_WAVES){g.mode='won';return false}
 g.wave++;g.mode='playing';g.plan=buildWave(g.wave,g.random);g.spawnLeft=g.plan.length;g.spawnClock=.4;g.spawnIndex=0;
 g.bullets=[];g.enemies=[];g.enemyBullets=[];g.effects=[];g.fireClock=0;g.pulses=2;g.lasers=10;g.beam=null;g.reward=null;g.invincible=1.5;
 return true;
}
export function resizeGame(g,width,height){
 const sx=width/g.width,sy=height/g.height;
 for(const e of [g.player,...g.bullets,...g.enemies,...g.enemyBullets,...g.effects]){e.x*=sx;e.y*=sy}
 if(g.beam){g.beam.x*=sx;g.beam.y*=sy}
 g.width=width;g.height=height;g.player.x=clamp(g.player.x,18,width-18);g.player.y=clamp(g.player.y,24,height-18);
}
export function drawUpgrade(g){
 if(g.mode!=='upgrade'||g.reward)return null;
 const pool=CARDS.filter(c=>c.kind!=='spread'||g.spread<MAX_SPREAD);
 const card=pool[Math.min(pool.length-1,Math.floor(g.random()*pool.length))];
 if(card.kind==='spread')g.spread++;
 if(card.kind==='power')g.power++;
 if(card.kind==='shield')g.shield+=10;
 if(card.kind==='laser')g.laserPower+=10;
 g.reward=card;return card;
}
export function continueWave(g){if(g.mode!=='upgrade'||!g.reward)return false;return startWave(g)}
function destroy(g,e){
 g.score+=(TIERS[e.kind]||TIERS.drone).score;
 g.effects.push({x:e.x,y:e.y,r:e.r,ttl:.4});
}
function clearDefeated(g){g.enemies=g.enemies.filter(e=>{if(e.hp<=0){destroy(g,e);return false}return true})}
export function pulse(g){
 if(g.mode!=='playing'||g.pulses<=0)return false;
 g.pulses--;g.enemyBullets=[];for(const e of g.enemies)e.hp-=3+g.power;
 clearDefeated(g);return true;
}
export function laser(g){
 if(g.mode!=='playing'||g.lasers<=0||g.beam?.ttl>0)return false;
 g.lasers--;g.beam={x:g.player.x,y:g.player.y,width:44,ttl:.22};
 for(const e of g.enemies)if(e.y-e.r<g.player.y&&Math.abs(e.x-g.player.x)<22+e.r)e.hp-=g.laserPower;
 g.enemyBullets=g.enemyBullets.filter(b=>b.y>g.player.y||Math.abs(b.x-g.player.x)>22+b.r);
 clearDefeated(g);return true;
}
function damage(g,amount){
 if(g.invincible>0||g.mode!=='playing')return;
 const absorbed=Math.min(g.shield,amount);g.shield-=absorbed;g.hp=Math.max(0,g.hp-(amount-absorbed));g.invincible=1.2;
 if(g.hp<=0)g.mode='over';
}
export function fireVolley(g){
 const speed=Math.max(520,g.height*.85);
 for(let i=0;i<g.spread;i++){
  const angle=g.spread===1?0:(i/(g.spread-1)-.5)*1.25;
  g.bullets.push({x:g.player.x,y:g.player.y-20,r:4,vy:-Math.cos(angle)*speed,vx:Math.sin(angle)*speed,damage:g.power});
 }
}
function tick(g,dt,input){
 g.time+=dt;g.invincible=Math.max(0,g.invincible-dt);if(g.beam)g.beam.ttl=Math.max(0,g.beam.ttl-dt);
 const speed=Math.min(560,Math.max(260,g.width*.55)),dx=input.x||0,dy=input.y||0,length=Math.hypot(dx,dy)||1;
 g.player.x=clamp(g.player.x+dx/length*speed*dt,18,g.width-18);g.player.y=clamp(g.player.y+dy/length*speed*dt,24,g.height-18);
 g.spawnClock-=dt;
 // Bosses enter in groups of at most three so the ten-boss round stays playable.
 const nextKind=g.plan[g.spawnIndex];
 if(g.spawnLeft>0&&g.spawnClock<=0&&g.enemies.length<10&&(nextKind==='drone'||g.enemies.filter(e=>e.kind!=='drone').length<3)){
  const kind=nextKind||'drone',tier=TIERS[kind],boss=kind!=='drone';g.spawnIndex++;
  const hp=tier.hp+Math.floor((g.wave-1)/8)*(boss?4:1);
  g.enemies.push({kind,x:g.width*(.15+g.random()*.7),y:-tier.r,r:tier.r,hp,maxHp:hp,
   vy:boss?Math.max(36,g.height*.16):40+Math.min(65,g.wave*.5),vx:(g.random()>.5?1:-1)*(boss?25:18),fire:1.8+g.random()});
  g.spawnLeft--;g.spawnClock=.65;
 }
 g.fireClock-=dt;if(g.fireClock<=0){fireVolley(g);g.fireClock=.24}
 for(const e of g.enemies){
  e.y+=e.vy*dt;e.x+=e.vx*dt;
  if(e.x<e.r){e.x=e.r;e.vx=Math.abs(e.vx)}if(e.x>g.width-e.r){e.x=g.width-e.r;e.vx=-Math.abs(e.vx)}
  if(e.kind!=='drone'&&e.y>Math.max(e.r,g.height*.2))e.vy=0;
  e.fire-=dt;
  if(e.fire<=0&&e.y>0){
   const tier=TIERS[e.kind]||TIERS.drone,aim=Math.atan2(g.player.y-e.y,g.player.x-e.x),bs=100+Math.min(g.wave,80);
   for(let i=0;i<tier.shots&&g.enemyBullets.length<320;i++){
    const angle=aim+(i-(tier.shots-1)/2)*.16;
    g.enemyBullets.push({x:e.x,y:e.y,r:5,vx:Math.cos(angle)*bs,vy:Math.sin(angle)*bs,damage:tier.damage,color:tier.bullet});
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
  if(e.y>g.height+e.r){damage(g,(TIERS[e.kind]||TIERS.drone).damage);return false}
  if(hit(e,g.player)){damage(g,(TIERS[e.kind]||TIERS.drone).damage);return e.kind!=='drone'}
  return true;
 });
 g.enemyBullets=g.enemyBullets.filter(b=>{
  b.x+=b.vx*dt;b.y+=b.vy*dt;if(hit(b,g.player)){damage(g,b.damage||1);return false}
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
 return {version:1,wave:g.wave,hp:g.hp,shield:g.shield,spread:g.spread,power:g.power,laserPower:g.laserPower,score:g.score};
}
export function restoreCheckpoint(width,height,saved){
 if(!saved||saved.version!==1)return null;
 const limits={wave:[1,MAX_WAVES],hp:[1,10],shield:[0,MAX_WAVES*10],spread:[1,MAX_SPREAD],power:[1,MAX_WAVES+1],laserPower:[20,20+MAX_WAVES*10],score:[0,1000000000]};
 for(const [key,[lo,hi]]of Object.entries(limits))if(!Number.isInteger(saved[key])||saved[key]<lo||saved[key]>hi)return null;
 const g=createGame(width,height);for(const key of Object.keys(limits))g[key]=saved[key];
 g.wave--;startWave(g);return g;
}
