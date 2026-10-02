const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const hit=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)<a.r+b.r;

export function createGame(width,height){
  return {width,height,mode:'home',wave:0,score:0,shield:3,spread:1,power:1,pulses:2,
    player:{x:width/2,y:height*.82,r:16},bullets:[],enemies:[],enemyBullets:[],effects:[],
    spawnLeft:0,spawnClock:0,spawnIndex:0,fireClock:0,invincible:0,time:0};
}
export function startWave(g){
  g.wave++;g.mode='playing';g.spawnLeft=5+Math.min(g.wave,15);g.spawnClock=.4;g.spawnIndex=0;
  g.bullets=[];g.enemies=[];g.enemyBullets=[];g.fireClock=0;g.pulses=2;g.invincible=1.5;
}
export function resizeGame(g,width,height){
  const sx=width/g.width,sy=height/g.height;
  for(const e of [g.player,...g.bullets,...g.enemies,...g.enemyBullets,...g.effects]){e.x*=sx;e.y*=sy}
  g.width=width;g.height=height;
  g.player.x=clamp(g.player.x,18,width-18);g.player.y=clamp(g.player.y,24,height-18);
}
export function chooseUpgrade(g,choice){
  if(g.mode!=='upgrade'||!['spread','power','shield'].includes(choice))return false;
  if(choice==='spread')g.spread=Math.min(3,g.spread+1);
  if(choice==='power')g.power++;
  if(choice==='shield')g.shield=Math.min(5,g.shield+2);
  startWave(g);return true;
}
function destroy(g,e){
  g.score+=e.kind==='boss'?1000:100;
  g.effects.push({x:e.x,y:e.y,r:e.r,ttl:.4});
}
export function pulse(g){
  if(g.mode!=='playing'||g.pulses<=0)return false;
  g.pulses--;g.enemyBullets=[];
  g.enemies=g.enemies.filter(e=>{e.hp-=3;if(e.hp<=0){destroy(g,e);return false}return true});
  return true;
}
function damage(g){
  if(g.invincible>0)return;
  g.shield--;g.invincible=1.5;
  if(g.shield<=0)g.mode='over';
}
function tick(g,dt,input){
  g.time+=dt;g.invincible=Math.max(0,g.invincible-dt);
  const speed=Math.min(560,Math.max(260,g.width*.55));
  const dx=input.x||0,dy=input.y||0,length=Math.hypot(dx,dy)||1;
  g.player.x=clamp(g.player.x+dx/length*speed*dt,18,g.width-18);
  g.player.y=clamp(g.player.y+dy/length*speed*dt,24,g.height-18);
  g.spawnClock-=dt;
  if(g.spawnLeft>0&&g.spawnClock<=0){
    const index=g.spawnIndex++,boss=g.wave%3===0&&g.spawnLeft===1;
    g.enemies.push({x:g.width*(.15+((index*37+g.wave*11)%70)/100),y:-28,r:boss?36:18,
      hp:boss?18+g.wave*2:1+Math.floor(g.wave/4),vy:boss?30:35+Math.min(90,g.wave*5),
      vx:index%2===0?22:-22,fire:2+(index%3)*.4,kind:boss?'boss':'drone'});
    g.spawnLeft--;g.spawnClock=.75;
  }
  g.fireClock-=dt;
  if(g.fireClock<=0){
    for(let i=0;i<g.spread;i++)g.bullets.push({x:g.player.x+(i-(g.spread-1)/2)*14,y:g.player.y-20,r:4,vy:-520,vx:(i-(g.spread-1)/2)*35,damage:g.power});
    g.fireClock=.2;
  }
  for(const e of g.enemies){
    e.y+=e.vy*dt;e.x+=e.vx*dt;
    if(e.x<e.r){e.x=e.r;e.vx=Math.abs(e.vx)}
    if(e.x>g.width-e.r){e.x=g.width-e.r;e.vx=-Math.abs(e.vx)}
    if(e.kind==='boss'&&e.y>g.height*.18)e.vy=0;
    e.fire-=dt;
    if(e.fire<=0&&e.y>0){
      const distance=Math.hypot(g.player.x-e.x,g.player.y-e.y)||1;
      const bulletSpeed=115+Math.min(g.wave*5,75);
      g.enemyBullets.push({x:e.x,y:e.y,r:5,vx:(g.player.x-e.x)/distance*bulletSpeed,vy:(g.player.y-e.y)/distance*bulletSpeed});
      e.fire=e.kind==='boss'?.65:2.3;
    }
  }
  for(const b of g.bullets){
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    for(const e of g.enemies){if(e.hp>0&&hit(b,e)){e.hp-=b.damage;b.y=-100;if(e.hp<=0)destroy(g,e);break}}
  }
  g.bullets=g.bullets.filter(b=>b.y>-20&&b.x>-10&&b.x<g.width+10);
  g.enemies=g.enemies.filter(e=>{
    if(e.hp<=0)return false;
    if(hit(e,g.player)||e.y>g.height+e.r){damage(g);return false}
    return true;
  });
  g.enemyBullets=g.enemyBullets.filter(b=>{
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(hit(b,g.player)){damage(g);return false}
    return b.x>-20&&b.x<g.width+20&&b.y>-20&&b.y<g.height+20;
  });
  g.effects=g.effects.filter(e=>(e.ttl-=dt)>0);
  if(g.mode==='playing'&&g.spawnLeft===0&&g.enemies.length===0){g.mode='upgrade';g.enemyBullets=[]}
}
export function stepGame(g,seconds,input={}){
  // Fixed-size slices keep slow frames from jumping over a collision.
  let remaining=Math.min(1,Math.max(0,seconds));
  while(remaining>1e-8&&g.mode==='playing'){const dt=Math.min(1/60,remaining);tick(g,dt,input);remaining-=dt}
}
