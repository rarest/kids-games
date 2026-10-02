// Boss AI deliberately depends only on plain simulation state; collision/damage
// is owned by core so attack visuals and physical hitboxes share one position.
function shot(s,b,kind,x,y,vx,vy,extra={}){
 s.projectiles.push({id:`boss-shot-${s.nextEntityId++}`,kind,owner:b.id,x,y,vx,vy,w:.45,h:.45,ttl:6,gravity:0,...extra});
}
const target=(s,b)=>s.players.filter(p=>p.lives>0&&!p.heldBy).sort((a,c)=>Math.abs(a.x-b.x)-Math.abs(c.x-b.x))[0];
export function updateBoss(s,dt){
 const b=s.boss;if(!b||b.defeated)return;
 const p=target(s,b);if(!p)return;
 if(!b.active&&Math.abs(p.x-b.x)<18){b.active=true;s.events.push({id:`event-${s.nextEventId++}`,type:'bossStart',kind:b.kind,time:s.time});}
 if(!b.active)return;
 b.timer+=dt;b.attackTimer+=dt;b.invulnerable=Math.max(0,b.invulnerable-dt);
 const t=b.timer,direction=Math.sign(p.x-b.x)||-1;
 switch(b.kind){
 case 'robot':
  b.phase='armSweep';b.x=b.homeX+Math.sin(t*1.3)*1.6;
  if(b.attackTimer>1.65){b.attackTimer=0;shot(s,b,'lightning',b.x,b.y+.4,direction*7,0);shot(s,b,'lightning',b.x,b.y+b.h*.65,direction*5,-1.4);}break;
 case 'owl':{
  const dive=t%4.5;b.phase=dive>2.4&&dive<3.4?'dive':'perch';b.x=b.homeX+Math.sin(t)*2;
  b.y=b.homeY-(b.phase==='dive'?Math.sin((dive-2.4)*Math.PI)*2.4:0);
  if(b.attackTimer>1.8){b.attackTimer=0;shot(s,b,'feather',b.x,b.y+.6,direction*4,-4);}break;
 }
 case 'ufo':
  b.phase=t%5>3.5?'ram':'alienDrop';b.x=b.homeX+Math.sin(t*(b.phase==='ram'?2.2:1.1))*3;
  b.y=b.phase==='ram'?(b.arena?.y??b.homeY)+.5:b.homeY+Math.sin(t*1.8)*.65;
  if(b.attackTimer>1.4){b.attackTimer=0;shot(s,b,'alien',b.x,b.y,direction*1.4,-1,{gravity:9,w:.7,h:.7,bounce:true});}break;
 case 'toyRobot':
  b.phase=t%5>3.6?'charge':'march';b.x=b.homeX+Math.sin(t*(b.phase==='charge'?2:.7))*2;
  if(b.attackTimer>1.9){b.attackTimer=0;for(const [n,color] of ['red','blue','green'].entries())shot(s,b,'colorBall',p.x+(n-1)*1.7,b.y+b.h+2,0,-1,{gravity:12,bounce:true,color});}break;
 case 'electricFish':
  b.phase=t%3.2>2?'discharge':'swim';b.x=b.homeX+Math.sin(t)*1.8;b.y=b.homeY+Math.sin(t*2)*.6;
  if(b.attackTimer>2.1){b.attackTimer=0;for(const angle of [-Math.PI*.8,-Math.PI*.5,-Math.PI*.2])shot(s,b,'spark',b.x,b.y,Math.cos(angle)*5,Math.sin(angle)*5);}break;
 case 'casinoCat':
  b.phase='slot';b.x=b.homeX+Math.sin(t*.8)*1.2;
  if(b.attackTimer>1.7){b.attackTimer=0;const dx=p.x-b.x,dy=p.y+.6-b.y,length=Math.hypot(dx,dy)||1;
   for(const offset of [-.35,0,.35])shot(s,b,'token',b.x,b.y+.6,dx/length*5,dy/length*5+offset,{gravity:1});}break;
 case 'caterpillar':
  b.breakTimer=Math.max(0,(b.breakTimer??0)-dt);b.phase=b.breakTimer>0?'separated':'segmentWave';
  b.x=b.homeX+Math.sin(t*.9)*2;b.y=b.homeY+Math.sin(t*1.4)*.8;
  b.segments=b.breakTimer>0?[]:Array.from({length:5},(_,i)=>({x:b.x+Math.sin(t*2-i*.7)*.6,y:b.y+i*(b.h/5),w:.7,h:b.h/5}));break;
 case 'fatCat':
  b.phase=t%4>2?'cigar':'taunt';b.x=b.homeX+Math.sin(t*.45)*.4;
  if(b.attackTimer>1.75){b.attackTimer=0;for(const n of [-1,0,1])shot(s,b,'ash',b.x,b.y+1.6,direction*(4+n*.8),5+n*1.2,{gravity:10});}break;
 }
 if(b.kind==='robot')b.weakpoint={kind:'orb',x:b.x,y:b.y+b.h-.45,w:.75,h:.6};
 else if(b.kind==='toyRobot')b.weakpoint={kind:'chest',x:b.x,y:b.y+b.h*.48,w:1,h:.7};
 else b.weakpoint=null;
 if(b.attackTimer===0)s.events.push({id:`event-${s.nextEventId++}`,type:'bossAttack',kind:b.kind,time:s.time});
}
