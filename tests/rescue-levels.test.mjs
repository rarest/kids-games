import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS,getLevel,nextLevels } from '../rescue/levels.js';
import { createGame,stepGame } from '../rescue/core.js';

test('eleven independent maps retain source-specific routes, landmarks and boss mapping',()=>{
 assert.deepEqual(LEVELS.map(l=>l.id),['0','A','B','C','D','E','F','G','H','I','J']);
 assert.equal(new Set(LEVELS.map(l=>JSON.stringify(l.platforms.map(p=>[p.x,p.y,p.w])))).size,11);
 const bosses={'0':'robot',A:'owl',B:'ufo',D:'toyRobot',E:'electricFish',G:'casinoCat',I:'caterpillar',J:'fatCat'};
 for(const l of LEVELS){assert.equal(l.boss?.kind,bosses[l.id]);assert.ok(l.decor.length>=5);assert.ok(l.reference.landmarks.length>=3);assert.ok(l.checkpoints.length>=1);assert.ok(l.platforms.length>8);}
 for(const id of ['A','F','H']) assert.ok(getLevel(id).height>28);
 assert.ok(getLevel('0').reference.sections.length>=4);assert.ok(getLevel('J').reference.sections.length>=3);
 const isolated=getLevel('0');isolated.platforms[0].x=999;assert.notEqual(getLevel('0').platforms[0].x,999);
 assert.deepEqual(nextLevels('D'),['E','F']);
});
test('each authored Boss ball spawn is inside its arena on a real fully supporting platform',()=>{
 for(const l of LEVELS.filter(l=>l.boss)){
  const ball=l.objects.find(o=>o.kind==='ball'),a=l.boss.arena;assert.ok(ball);
  assert.ok(ball.x>=a.x&&ball.x<=a.x+a.w,`${l.id} ball outside arena`);
  assert.ok(l.platforms.some(p=>Math.abs(ball.y-p.y)<.001&&ball.x-.4>=p.x&&ball.x+.4<=p.x+p.w),`${l.id} unsupported authored ball spawn`);
 }
});

// Independent ballistic reachability (no authored route IDs or links): a character can
// move on a platform, launch, then descend onto a next platform at the real jump constants.
function canJump(a,b){
 const rise=b.y-a.y;if(rise>3.5||rise< -9)return false;
 const discriminant=14*14-2*28*rise;if(discriminant<0)return false;
 const flight=(14+Math.sqrt(discriminant))/28;
 const gap=Math.max(0,b.x-(a.x+a.w),a.x-(b.x+b.w));return gap<7.2*flight-.15;
}
test('every authored area has an independent physics-reachable platform path from spawn to exit',()=>{
 for(const l of LEVELS){
   const seen=new Set(l.platforms.filter(p=>l.spawn.x>=p.x&&l.spawn.x<=p.x+p.w&&Math.abs(l.spawn.y-p.y)<.2));
   for(let changed=true;changed;){changed=false;for(const a of [...seen])for(const b of l.platforms)if(!seen.has(b)&&canJump(a,b)){seen.add(b);changed=true;}}
   assert.ok([...seen].some(p=>l.exit.x>=p.x-.2&&l.exit.x<=p.x+p.w+.2&&Math.abs(l.exit.y-p.y)<.2),`unreachable ${l.id}`);
 }
});
function plan(platforms,start,exit){
 const queue=[[start]],seen=new Set([start.id]);
 while(queue.length){const path=queue.shift(),a=path.at(-1);
  if(exit.x>=a.x&&exit.x<=a.x+a.w&&Math.abs(exit.y-a.y)<.2)return path;
  for(const b of platforms)if(!seen.has(b.id)&&canJump(a,b)){seen.add(b.id);queue.push([...path,b]);}
 }
 return null;
}
const moveTo=(s,x,max=6000)=>{
 const target=typeof x==='function'?x:()=>x;
 const p=s.players[0];for(let f=0;f<max&&Math.abs(target()-p.x)>.12&&s.status==='playing';f++)stepGame(s,[{move:Math.sign(target()-p.x)}],1/60);
};
test('real simulator traverses every complete authored area from spawn to exit using only movement and jump inputs',()=>{
 assert.equal(LEVELS.length,11);
 for(const l of LEVELS){
  // Isolate geometry, keeping all platforms, moving paths and conveyor physics.
  const s=createGame({...getLevel(l.id),objects:[],enemies:[],hazards:[],pickups:[],boss:null});const p=s.players[0];
  stepGame(s,[{}],1/60);let iterations=0;
  while(s.status==='playing'&&iterations++<150){
   const current=s.platforms.find(m=>m.id===p.groundId);
   assert.ok(current,`${l.id} feet lost support at ${p.x},${p.y}`);
   const route=plan(s.platforms,current,l.exit);assert.ok(route,`${l.id} no path from ${current.id}`);
   if(route.length===1){moveTo(s,l.exit.x);break;}
   const next=route[1],aLeft=current.x+.65,aRight=current.x+current.w-.65;
   const left=Math.max(aLeft,next.x+.65),right=Math.min(aRight,next.x+next.w-.65);
   let launch=left<=right?Math.max(left,Math.min(right,p.x)):next.x>current.x?aRight:aLeft;
   // A solid ledge has an underside: jump from beside it, then steer over its edge.
   if(!next.oneWay&&next.y>current.y+.1){
    const before=next.x-.55,after=next.x+next.w+.55;
    if(before>=aLeft&&before<=aRight)launch=before;
    else if(after>=aLeft&&after<=aRight)launch=after;
   }
   moveTo(s,()=>Math.max(current.x+.7,Math.min(current.x+current.w-.7,launch)));
   launch=p.x;
   let landing=Math.max(next.x+.7,Math.min(next.x+next.w-.7,launch));
   if(next.y<=current.y+.15){
    if(next.x+next.w>current.x+current.w)landing=Math.max(landing,current.x+current.w+.65);
    else if(next.x<current.x)landing=Math.min(landing,current.x-.65);
   }
   stepGame(s,[{jump:true}],1/60);
   for(let f=0;f<120;f++){
    const clear=!next.oneWay&&next.y>current.y+.1&&p.vy>0&&p.y<next.y+.05;
    stepGame(s,[{move:clear?0:Math.abs(landing-p.x)<.1?0:Math.sign(landing-p.x)}],1/60);
    if(p.grounded&&f>5)break;
   }
   assert.ok(p.y>=Math.min(current.y,next.y)-.2,`${l.id} failed ${current.id} -> ${next.id}: ${p.x},${p.y}`);
  }
  assert.ok(s.status==='bonus'||s.status==='cleared',`${l.id}: stalled after ${iterations} edges at ${p.x},${p.y}`);
  assert.equal(p.lives,3,`${l.id} traversal died`);
 }
});
