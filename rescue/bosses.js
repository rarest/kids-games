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
  b.phase='armSweep';positionBoss(b,t);
  if(b.attackTimer>1.65){b.attackTimer=0;shot(s,b,'lightning',b.x-b.w*.42,b.y+.4,-7,0);shot(s,b,'lightning',b.x+b.w*.42,b.y+b.h*.65,5,-1.4);}break;
 case 'owl':{
  const dive=t%4.5;b.phase=dive>2.4&&dive<3.4?'dive':'perch';positionBoss(b,t);
  if(b.attackTimer>1.8){b.attackTimer=0;shot(s,b,'feather',b.x,b.y+.6,direction*4,-4);}break;
 }
 case 'ufo':
  b.phase=t%5>3.5?'ram':'alienDrop';positionBoss(b,t);
  if(b.attackTimer>1.4){b.attackTimer=0;shot(s,b,'alien',b.x,b.y,direction*1.4,-1,{gravity:9,w:.7,h:.7,bounce:true});}break;
 case 'toyRobot':
  b.phase=t%5>3.6?'charge':'march';positionBoss(b,t);
  if(b.attackTimer>1.9){b.attackTimer=0;for(const [n,color] of ['red','blue','green'].entries())shot(s,b,'colorBall',p.x+(n-1)*1.7,b.y+b.h+2,0,-1,{gravity:12,bounce:true,color});}break;
 case 'electricFish':
  b.phase=t%3.2>2?'discharge':'swim';positionBoss(b,t);
  if(b.attackTimer>2.1){b.attackTimer=0;for(const angle of [-Math.PI*.8,-Math.PI*.5,-Math.PI*.2])shot(s,b,'spark',b.x,b.y,Math.cos(angle)*5,Math.sin(angle)*5);}break;
 case 'casinoCat':
  b.phase='slot';positionBoss(b,t);
  if(b.attackTimer>1.7){b.attackTimer=0;const dx=p.x-b.x,dy=p.y+.6-b.y,length=Math.hypot(dx,dy)||1;
   for(const offset of [-.35,0,.35])shot(s,b,'token',b.x,b.y+.6,dx/length*5,dy/length*5+offset,{gravity:1});}break;
 case 'caterpillar':
  b.breakTimer=Math.max(0,(b.breakTimer??0)-dt);b.phase=b.breakTimer>0?'separated':'segmentWave';
  positionBoss(b,t);
  b.segments=b.breakTimer>0?[]:Array.from({length:5},(_,i)=>({x:b.x+Math.sin(t*2-i*.7)*.6,y:b.y+i*(b.h/5),w:.7,h:b.h/5}));break;
 case 'fatCat':
  b.phase=t%4>2?'cigar':'taunt';positionBoss(b,t);
  if(b.attackTimer>1.75){b.attackTimer=0;for(const n of [-1,0,1])shot(s,b,'ash',b.x-b.w*.16,b.y+b.h*.78,direction*(4+n*.8),5+n*1.2,{gravity:10});}break;
 }
 b.anchors={mouth:{x:b.x-b.w*.16,y:b.y+b.h*.78},hand:{x:b.x-b.w*.34,y:b.y+b.h*.52}};
 b.contactRegions=b.kind==='fatCat'||(b.kind==='caterpillar'&&b.breakTimer>0)?[]:b.kind==='robot'?[-1,1].map(side=>({x:b.x+side*b.w*.38,y:b.y+.2,w:b.w*.25,h:b.h*.85})):[{x:b.x,y:b.y,w:b.w,h:b.h}];
 if(b.kind==='robot')b.weakpoint={kind:'orb',x:b.x,y:b.y+b.h-.45,w:.75,h:.6};
 else if(b.kind==='toyRobot')b.weakpoint={kind:'chest',x:b.x,y:b.y+b.h*.48,w:1,h:.7};
 else b.weakpoint=null;
 if(b.attackTimer===0)s.events.push({id:`event-${s.nextEventId++}`,type:'bossAttack',kind:b.kind,time:s.time});
}

function positionBoss(b,t){
 const phase=b.kind==='owl'?((t%4.5)>2.4&&(t%4.5)<3.4?'dive':'perch'):b.kind==='ufo'?(t%5>3.5?'ram':'alienDrop'):b.kind==='toyRobot'?(t%5>3.6?'charge':'march'):b.phase;
 switch(b.kind){
 case 'robot':b.x=b.homeX;break;
 case 'owl':b.x=b.homeX+Math.sin(t)*2;b.y=b.homeY-(phase==='dive'?Math.sin(((t%4.5)-2.4)*Math.PI)*2.4:0);break;
 case 'ufo':b.x=b.homeX+Math.sin(t*(phase==='ram'?2.2:1.1))*3;b.y=phase==='ram'?(b.arena?.y??b.homeY)+.5:b.homeY+Math.sin(t*1.8)*.65;break;
 case 'toyRobot':b.x=b.homeX+Math.sin(t*(phase==='charge'?2:.7))*2;break;
 case 'electricFish':b.x=b.homeX+Math.sin(t)*1.8;b.y=b.homeY+Math.sin(t*2)*.6;break;
 case 'casinoCat':b.x=b.homeX+Math.sin(t*.8)*1.2;break;
 case 'caterpillar':b.x=b.homeX+Math.sin(t*.9)*2;b.y=b.homeY+Math.sin(t*1.4)*.8;break;
 case 'fatCat':b.x=b.homeX+Math.sin(t*.45)*.4;break;
 }
}
// Advance pose under the confirmed phase without activating, attacking or changing health.
export function projectBoss(b,dt){
 if(!b?.active||b.defeated)return;
 const x=b.x,y=b.y;b.timer+=dt;positionBoss(b,b.timer);const dx=b.x-x,dy=b.y-y;
 const shift=e=>{if(e){e.x+=dx;e.y+=dy;}};
 shift(b.weakpoint);for(const e of b.contactRegions??[])shift(e);for(const e of Object.values(b.anchors??{}))shift(e);
 for(const [i,e] of (b.segments??[]).entries()){e.x=b.x+Math.sin(b.timer*2-i*.7)*.6;e.y=b.y+i*(b.h/5);}
}
