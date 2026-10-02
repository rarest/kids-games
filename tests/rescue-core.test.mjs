import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, stepGame, setPaused, restartLevel, snapshot, finishBonus } from '../rescue/core.js';
import { updateBoss } from '../rescue/bosses.js';
import { LEVELS } from '../rescue/levels.js';

const floor = {id:'floor',x:0,y:1,w:40,h:1};
function fixture(extra={}) { return {id:'fixture',name:'fixture',theme:'street',width:40,height:20,spawn:{x:2,y:1},platforms:[floor],objects:[],enemies:[],hazards:[],decor:[],exit:{x:38,y:1},boss:null,checkpoints:[],...extra}; }
function run(s, input={}, seconds=1) {for(let t=0;t<seconds-1e-9;t+=1/60) stepGame(s,Array.isArray(input)?input:[input],1/60);}
function tap(s,input){stepGame(s,[input],1/60);stepGame(s,[{}],1/60);}

test('directional movement, jump and actual descending platform landing',()=>{
 const s=createGame(fixture({platforms:[floor,{id:'ledge',x:5,y:3,w:5,h:.4,oneWay:true}]}));
 run(s,{move:1},.35);assert.ok(s.players[0].x>3.5);assert.equal(s.players[0].facing,1);
 tap(s,{jump:true,move:1});run(s,{move:1},.5);run(s,{},.6);
 assert.equal(s.players[0].y,3);assert.equal(s.players[0].grounded,true);
 tap(s,{down:true,jump:true});run(s,{},.5);assert.equal(s.players[0].y,1);
});
test('pickup edge, hold, horizontal throw and actual enemy hit',()=>{
 const s=createGame(fixture({objects:[{id:'box',kind:'crate',x:2.9,y:1}],enemies:[{id:'dog',kind:'dog',x:6,y:1,speed:0}]}));
 tap(s,{action:true});assert.deepEqual(s.players[0].carrying,{type:'object',id:'box'});
 run(s,{action:true},.12); // one new press throws, keeping pressed cannot pick back up
 assert.equal(s.players[0].carrying,null);assert.ok(s.objects[0].vx>0);
 run(s,{},.3);assert.equal(s.enemies[0].alive,false);assert.equal(s.objects[0].active,false);
});
test('down hides inside held crate and defends against touching enemies',()=>{
 const s=createGame(fixture({objects:[{id:'box',kind:'crate',x:2.8,y:1}],enemies:[{id:'dog',kind:'dog',x:3.6,y:1,speed:2,facing:-1}]}));
 tap(s,{action:true});run(s,{down:true},.6);assert.equal(s.players[0].hearts,3);assert.equal(s.enemies[0].alive,false);assert.equal(s.objects[0].active,false);assert.equal(s.players[0].carrying,null);
 run(s,{},.03);assert.equal(s.players[0].hidden,false);
});
test('metal defense survives enemy contact while electric and press hazards still hurt hiding player',()=>{
 const s=createGame(fixture({objects:[{id:'metal',kind:'metal',x:2.8,y:1}],enemies:[{id:'dog',kind:'dog',x:3.6,y:1,speed:2,facing:-1}]}));
 tap(s,{action:true});run(s,{down:true},.6);assert.equal(s.players[0].hidden,true);assert.equal(s.objects[0].active,true);assert.equal(s.enemies[0].alive,false);
 s.hazards.push({id:'hazard',kind:'electric',x:1,y:1,w:3,h:1});run(s,{down:true},.05);assert.equal(s.players[0].hearts,2);
});
test('hazard collision shares entity bottom-center coordinates with its visible mesh',()=>{
 const s=createGame(fixture({spawn:{x:3.1,y:1},hazards:[{id:'visible-spike',kind:'spike',x:4,y:1,w:2,h:1}]}));
 run(s,{},.05);assert.equal(s.players[0].hearts,2);
});
test('solid platform blocks upward head collision while one-way shelf permits ascent',()=>{
 const solid=createGame(fixture({platforms:[floor,{id:'ceiling',x:0,y:4,w:10,h:1}]}));tap(solid,{jump:true});run(solid,{},.3);assert.ok(solid.players[0].y<2);
 const one=createGame(fixture({platforms:[floor,{id:'ceiling',x:0,y:4,w:10,h:1,oneWay:true}]}));tap(one,{jump:true});run(one,{},.3);assert.ok(one.players[0].y>3.5);
});
test('falling Boss ball stuns its player without taking a heart',()=>{
 const s=createGame(fixture({objects:[{id:'ball',kind:'ball',x:2,y:4,vy:-2}]}));run(s,{},.5);assert.equal(s.players[0].hearts,3);assert.ok(s.events.some(e=>e.type==='stun'));
});
test('wooden crate blocks one enemy projectile, opens contents, and metal remains reusable',()=>{
 for(const kind of ['crate','metal']){
  const s=createGame(fixture({objects:[{id:'shield',kind,x:2.8,y:1,contents:'flower'}]}));tap(s,{action:true});run(s,{down:true},.05);
  s.projectiles.push({id:'shot',kind:'gear',owner:'toy',x:2,y:1.5,vx:0,vy:0,w:.5,h:.5,ttl:2});run(s,{down:true},.05);
  assert.equal(s.players[0].hearts,3);assert.equal(s.projectiles.length,0);
  assert.equal(s.objects[0].active,kind==='metal');if(kind==='crate')assert.equal(s.pickups.filter(p=>p.id.startsWith('shield')).length,1);
 }
});
for(const kind of ['metal','ball']) test(`${kind} can hit and be picked up again`,()=>{
 const s=createGame(fixture({objects:[{id:'item',kind,x:2.8,y:1}],enemies:[{id:'target',kind:'toy',x:5,y:1,speed:0}]}));
 tap(s,{action:true});tap(s,{action:true});run(s,{},.8);const o=s.objects[0];assert.equal(o.active,true);assert.equal(s.enemies[0].alive,false);
 s.players[0].x=o.x-.6;s.players[0].y=o.y;tap(s,{action:true});assert.equal(s.players[0].carrying.id,'item');
});
test('apple weight reduces movement and throw range; upper throw flies vertically',()=>{
 const a=createGame(fixture({objects:[{id:'a',kind:'apple',x:2.8,y:1}]}));const b=createGame(fixture({objects:[{id:'b',kind:'crate',x:2.8,y:1}]}));
 tap(a,{action:true});tap(b,{action:true});run(a,{move:1},.3);run(b,{move:1},.3);assert.ok(a.players[0].x<b.players[0].x);
 tap(a,{action:true});tap(b,{action:true});assert.ok(a.objects[0].vx<b.objects[0].vx);
 const c=createGame(fixture({objects:[{id:'c',kind:'ball',x:2.8,y:1}]}));tap(c,{action:true});tap(c,{action:true,up:true});assert.equal(c.objects[0].vx,0);assert.ok(c.objects[0].vy>10);
});
test('thrown crate opens bigcrate and acorn actually restores a heart',()=>{
 const s=createGame(fixture({objects:[{id:'box',kind:'crate',x:2.8,y:1},{id:'large',kind:'bigcrate',x:5,y:1,contents:'acorn'}]}));
 s.players[0].hearts=2;tap(s,{action:true});tap(s,{action:true});run(s,{},.3);assert.equal(s.objects[1].active,false);assert.equal(s.pickups[0].kind,'acorn');
 s.players[0].x=s.pickups[0].x;run(s,{},.1);assert.equal(s.players[0].hearts,3);
});
test('local players can carry and throw teammate but cannot create a hold cycle',()=>{
 const s=createGame(fixture(),{players:2});s.players[1].x=2.8;
 stepGame(s,[{action:true},{action:true}],1/60);assert.deepEqual(s.players[0].carrying,{type:'player',id:'p2'});assert.equal(s.players[1].heldBy,'p1');assert.equal(s.players[1].carrying,null);
 stepGame(s,[{},{}],1/60);stepGame(s,[{action:true},{}],1/60);assert.equal(s.players[1].heldBy,null);assert.ok(s.players[1].vx>7);assert.equal(s.players[0].carrying,null);
});
test('damage cooldown, three hearts, life restart and final gameover',()=>{
 const s=createGame(fixture({hazards:[{id:'spike',kind:'spike',x:1,y:1,w:5,h:1}]}));
 run(s,{},.15);assert.equal(s.players[0].hearts,2);run(s,{},.3);assert.equal(s.players[0].hearts,2);
 for(let i=0;i<2;i++){s.players[0].x=2;s.players[0].y=1;s.players[0].invulnerable=0;run(s,{},.05);}
 assert.equal(s.players[0].lives,2);assert.equal(s.players[0].hearts,3);
 s.players[0].lives=1;s.players[0].hearts=1;s.players[0].invulnerable=0;s.players[0].x=2;run(s,{},.05);assert.equal(s.status,'gameover');
 restartLevel(s);assert.equal(s.status,'playing');assert.equal(s.players[0].hearts,3);
});
test('moving platform carries a standing player; conveyor shifts feet and hazard collides',()=>{
 const s=createGame(fixture({spawn:{x:3,y:3},platforms:[floor,{id:'lift',kind:'moving',x:1,y:3,w:5,h:.3,axis:'x',range:3,speed:1}]}));
 run(s,{},.6);assert.ok(s.players[0].x>3.2);assert.equal(s.players[0].y,s.platforms[1].y);
 const c=createGame(fixture({platforms:[{...floor,kind:'conveyor',speed:2}]}));run(c,{},.5);assert.ok(c.players[0].x>2.7);
});
test('objects stack on stationary boxes and players land on stacks',()=>{
 const s=createGame(fixture({spawn:{x:5,y:8},objects:[{id:'base',kind:'metal',x:5,y:1},{id:'top',kind:'crate',x:5,y:4}]}));
 run(s,{},1);assert.equal(s.objects[1].y,1.8);assert.equal(s.players[0].y,2.6);assert.equal(s.players[0].grounded,true);
});
test('flower conversion, stars extra life and Zipper protection use actual pickups',()=>{
 const s=createGame(fixture({pickups:[{id:'flower',kind:'flower',x:2,y:1},{id:'z',kind:'zipper',x:2,y:1}]}));s.flowers=49;s.stars=9;
 run(s,{},.05);assert.equal(s.flowers,50);assert.equal(s.stars,10);assert.equal(s.players[0].lives,4);assert.ok(s.players[0].zipper>0);
 s.hazards.push({id:'h',kind:'electric',x:1,y:1,w:3,h:1});run(s,{},.2);assert.equal(s.players[0].hearts,3);
});
test('pause stops physics; snapshots are independent copies; dt is capped',()=>{
 const s=createGame(fixture());setPaused(s,true);run(s,{move:1});assert.equal(s.time,0);setPaused(s,false);stepGame(s,[{move:1}],10);assert.ok(s.time<=1/30+.0001);
 const copy=snapshot(s);copy.players[0].hearts=0;assert.equal(s.players[0].hearts,3);
});
test('fixed-step physics agrees at 60 and 240 Hz and preserves short button presses',()=>{
 const a=createGame(fixture()),b=createGame(fixture());
 for(let f=0;f<60;f++)stepGame(a,[{move:1}],1/60);
 for(let f=0;f<240;f++)stepGame(b,[{move:1}],1/240);
 assert.ok(Math.abs(a.players[0].x-b.players[0].x)<1e-10);assert.ok(Math.abs(a.time-b.time)<1e-10);
 const high=createGame(fixture()),low=createGame(fixture());
 for(let f=0;f<12;f++)stepGame(high,[{jump:f===0}],1/60);
 for(let f=0;f<48;f++)stepGame(low,[{jump:f===0}],1/240);
 assert.ok(Math.abs(high.players[0].y-low.players[0].y)<1e-10);
 const c=createGame(fixture());stepGame(c,[{jump:true}],1/240);stepGame(c,[{}],1/240);run(c,{},.1);assert.ok(c.players[0].y>2);
});
test('all eight Bosses reject actual crate throws',()=>{
 for(const kind of ['robot','owl','ufo','toyRobot','electricFish','casinoCat','caterpillar','fatCat']){
  const s=createGame(fixture({spawn:{x:20,y:1},objects:[{id:'wood',kind:'crate',x:20.7,y:1}],boss:{id:'boss',kind,x:20,y:3,w:2,h:2}}));
  s.players[0].invulnerable=2;tap(s,{action:true});tap(s,{action:true,up:true});run(s,{},.4);assert.equal(s.boss.hp,5,kind);
 }
});
test('enemy categories use real patrol, flying, pounce, projectile and mimic behavior',()=>{
 const kinds=['dog','bird','caterpillar','mouse','kangaroo','mimic','toy','bee','rhino','crab','lizard','pelican'];
 for(const kind of kinds)assert.ok(LEVELS.some(l=>l.enemies.some(e=>e.kind===kind)),`${kind} missing from campaign`);
 const s=createGame(fixture({enemies:[{id:'bird',kind:'bird',x:10,y:5,min:5,max:15},{id:'toy',kind:'toy',x:17,y:1,min:14,max:20},{id:'kang',kind:'kangaroo',x:9,y:1,min:7,max:13},{id:'mimic',kind:'mimic',x:8,y:1,min:6,max:10}]}));
 run(s,{},.15);assert.notEqual(s.enemies[0].y,5);assert.equal(s.enemies[3].animation,'disguise');
 run(s,{},1);assert.ok(s.enemies[2].y>1||s.enemies[2].vy>0);run(s,{},1.8);assert.ok(s.projectiles.some(p=>p.kind==='gear'));
 s.players[0].x=s.enemies[3].x-2;run(s,{},.05);assert.equal(s.enemies[3].animation,'lunge');
});
test('playable bonus room uses physics and collection, then records completion',()=>{
 const s=createGame(fixture({exit:{x:2,y:1}}));run(s,{},.1);assert.equal(s.status,'bonus');assert.equal(s.areaLevel.id,'fixture');assert.equal(s.level.id,'bonus-fixture');
 const start=s.players[0].x;run(s,{move:1},.55);assert.ok(s.players[0].x>start);assert.ok(s.bonus.collected>0);finishBonus(s);assert.equal(s.status,'cleared');assert.ok(s.completed.includes('fixture'));
});
for(const kind of ['robot','owl','ufo','toyRobot','electricFish','casinoCat','caterpillar','fatCat']) test(`${kind} attacks distinctly, rejects crates and is defeated by five actual upper ball throws`,()=>{
 const s=createGame(fixture({spawn:{x:15,y:1},boss:{id:'boss',kind,x:20,y:3,w:2,h:2,arena:{x:10,w:24,y:1}},objects:[{id:'ball',kind:'ball',x:15.8,y:1},{id:'crate',kind:'crate',x:15.8,y:1}]}));
 updateBoss(s,3);const patterns={robot:'lightning',owl:'feather',ufo:'alien',toyRobot:'colorBall',electricFish:'spark',casinoCat:'token',caterpillar:'segment',fatCat:'ash'};
 if(kind==='caterpillar')assert.equal(s.boss.segments.length,5);
 else assert.ok(s.projectiles.some(q=>q.kind===patterns[kind]),kind);assert.equal(s.boss.hp,5);
 if(['robot','toyRobot'].includes(kind)){assert.ok(s.boss.weakpoint);assert.ok(s.boss.weakpoint.y>s.boss.y);}
 // Fix an attack phase at a close reachable height; the ball follows simulated gravity and hit collision.
 for(let i=0;i<5;i++){
   s.boss.x=20;s.boss.y=3;s.boss.homeX=20;s.boss.homeY=3;s.boss.active=true;s.boss.invulnerable=0;s.boss.timer=0;
   const p=s.players[0];p.x=20;p.y=1;p.vx=0;p.vy=0;p.grounded=true;p.invulnerable=100;
   const ball=s.objects.find(o=>o.kind==='ball');ball.active=true;ball.heldBy=null;ball.x=20.65;ball.y=1;ball.vx=0;ball.vy=0;ball.thrown=false;p.carrying=null;
   tap(s,{action:true});assert.equal(p.carrying?.id,'ball');tap(s,{action:true,up:true});run(s,{},.25);
   assert.equal(s.boss.hp,4-i,`hit ${i+1}`);
   if(kind==='caterpillar')run(s,{},1);
 }
 assert.equal(s.boss.defeated,true);assert.ok(s.events.some(e=>e.type==='bossDefeated'));
});
test('robot green orb weakpoint rejects body contact and crates; repeated ball contact obeys cooldown',()=>{
 const s=createGame(fixture({spawn:{x:20,y:1},boss:{id:'robot',kind:'robot',x:20,y:1,w:4,h:5,arena:{x:10,y:1,w:25}},objects:[{id:'ball',kind:'ball',x:20.7,y:1}]}));
 const p=s.players[0];p.invulnerable=100;tap(s,{action:true});tap(s,{action:true});run(s,{},.05);assert.equal(s.boss.hp,5);
 const weak=s.boss.weakpoint;assert.ok(weak.y>4);
 const ball=s.objects[0];Object.assign(ball,{x:weak.x,y:weak.y,thrown:true,vx:0,vy:0,hitIds:[]});run(s,{},.02);assert.equal(s.boss.hp,4);
 Object.assign(ball,{x:s.boss.weakpoint.x,y:s.boss.weakpoint.y,thrown:true,vx:0,vy:0,hitIds:[]});run(s,{},.02);assert.equal(s.boss.hp,4);
});
test('every authored Boss size and placement is hittable with actual upper ball physics',()=>{
 for(const l of LEVELS.filter(l=>l.boss)){
  const b=l.boss,a=b.arena;
  const s=createGame(fixture({width:l.width,height:l.height,spawn:{x:b.x,y:a.y},boss:b,platforms:[{id:'arena',x:a.x,y:a.y,w:a.w,h:1}],objects:[{id:'ball',kind:'ball',x:b.x+.7,y:a.y}]}));
  s.players[0].invulnerable=2;tap(s,{action:true});tap(s,{action:true,up:true});run(s,{},.5);
  assert.equal(s.boss.hp,4,`${l.id} ${b.kind} weakpoint out of normal throw range`);
 }
});
test('robot center is safe during arm attacks and supports a normal non-invulnerable orb upthrow',()=>{
 const s=createGame(fixture({spawn:{x:20,y:1},boss:{id:'robot',kind:'robot',x:20,y:1,w:5,h:5.5,arena:{x:10,y:1,w:25}},objects:[{id:'ball',kind:'ball',x:20.7,y:1}]}));
 run(s,{},3);assert.equal(s.players[0].hearts,3);assert.equal(s.players[0].lives,3);
 tap(s,{action:true});tap(s,{action:true,up:true});run(s,{},.4);assert.equal(s.boss.hp,4);assert.equal(s.players[0].hearts,3);
 const side=createGame(fixture({spawn:{x:21.9,y:1},boss:{id:'robot',kind:'robot',x:20,y:1,w:5,h:5.5}}));run(side,{},.05);assert.equal(side.players[0].hearts,2);
});
test('Fat Cat body is harmless and ash originates at the cigar mouth anchor',()=>{
 const s=createGame(fixture({spawn:{x:20,y:1},boss:{id:'cat',kind:'fatCat',x:20,y:2.2,w:6,h:6.5,arena:{x:10,y:1,w:25}},objects:[{id:'ball',kind:'ball',x:20.7,y:1}]}));
 tap(s,{action:true});tap(s,{action:true,up:true});run(s,{},.4);assert.equal(s.boss.hp,4);assert.equal(s.players[0].hearts,3);
 updateBoss(s,2);assert.ok(s.boss.anchors.mouth.y>s.boss.y+s.boss.h*.7);assert.equal(s.boss.contactRegions.length,0);
 for(const ash of s.projectiles.filter(q=>q.kind==='ash'))assert.equal(ash.y,s.boss.anchors.mouth.y);
});
test('separated caterpillar rejects hits after cooldown and has no invisible contact body',()=>{
 const s=createGame(fixture({spawn:{x:20,y:1},boss:{id:'caterpillar',kind:'caterpillar',x:20,y:3,w:2,h:2},objects:[{id:'ball',kind:'ball',x:20.7,y:1}]}));
 s.players[0].invulnerable=2;tap(s,{action:true});tap(s,{action:true,up:true});run(s,{},.25);assert.equal(s.boss.hp,4);
 run(s,{},.45);assert.ok(s.boss.breakTimer>0);assert.equal(s.boss.invulnerable,0);assert.equal(s.boss.contactRegions.length,0);
 // Isolate the absent-body collision; the visible falling segments still hurt normally.
 s.projectiles=[];
 const ball=s.objects[0],b=s.boss,p=s.players[0];Object.assign(ball,{x:b.x,y:b.y,thrown:true,hitIds:[],vx:0,vy:0});Object.assign(p,{x:b.x,y:b.y,invulnerable:0});
 run(s,{},.02);assert.equal(b.hp,4);assert.equal(p.hearts,3);
 ball.thrown=false;run(s,{},.3);assert.equal(b.breakTimer,0);assert.ok(b.segments.length===5);
});
test('ball is recovered after falling outside arena and Boss remains locked until defeated',()=>{
 const s=createGame(fixture({exit:{x:20,y:1},boss:{id:'boss',kind:'robot',x:20,y:1},objects:[{id:'ball',kind:'ball',x:5,y:1}]}));
 s.objects[0].y=-10;run(s,{},.05);assert.ok(s.objects[0].y>=1);assert.equal(s.objects[0].active,true);
 s.players[0].x=20;s.players[0].invulnerable=100;run(s,{},.1);assert.equal(s.status,'playing');
});
for(const areaId of ['B','G'])for(const loss of ['below-map','below-arena','outside-arena'])test(`${areaId} authored Boss ball ${loss} recovers on real ground, is picked up and thrown again`,()=>{
 const l=structuredClone(LEVELS.find(l=>l.id===areaId)),original=l.objects.find(o=>o.kind==='ball');
 // Keep the entire original platform map; only isolate unrelated combat entities.
 const s=createGame({...l,spawn:{x:original.x-3,y:original.y},objects:[original],enemies:[],hazards:[],pickups:[]});
 const ball=s.objects[0],p=s.players[0];s.boss.active=true;
 // Initial loss fixture only. Every later position comes from simulation/input.
 if(loss==='below-map')ball.y=-10;
 else if(loss==='below-arena')ball.y=s.boss.arena.y-2.2;
 else ball.x=s.boss.arena.x-1.2;
 run(s,{},.2);assert.equal(ball.grounded,true,`${areaId} ${loss}: ball did not land`);
 const support=s.platforms.find(platform=>platform.id===ball.groundId);assert.ok(support);
 assert.equal(ball.y,support.y);assert.ok(ball.x>=support.x+ball.w/2&&ball.x<=support.x+support.w-ball.w/2);
 for(let f=0;f<90&&Math.abs(ball.x-p.x)>1;f++)stepGame(s,[{move:Math.sign(ball.x-p.x)}],1/60);
 tap(s,{action:true});assert.deepEqual(p.carrying,{type:'object',id:ball.id});assert.equal(ball.heldBy,p.id);
 tap(s,{action:true,up:true});assert.equal(p.carrying,null);assert.equal(ball.heldBy,null);assert.equal(ball.thrown,true);assert.ok(ball.vy>10);
 const thrownY=ball.y;run(s,{},.04);assert.ok(ball.y>thrownY);assert.equal(p.lives,3);
});
test('all eight authored Boss balls recover onto actual support after either loss path',()=>{
 for(const l of LEVELS.filter(l=>l.boss))for(const belowMap of [true,false]){
  const original=l.objects.find(o=>o.kind==='ball');
  const s=createGame({...structuredClone(l),spawn:{x:original.x-1.2,y:original.y},objects:[original],enemies:[],hazards:[],pickups:[]});
  const ball=s.objects[0];s.boss.active=true;ball.y=belowMap?-10:s.boss.arena.y-2.2;
  run(s,{},.25);assert.equal(ball.grounded,true,`${l.id} loss path ${belowMap}`);
  const platform=s.platforms.find(p=>p.id===ball.groundId);assert.ok(platform,`${l.id} invented recovery support`);assert.equal(ball.y,platform.y);
 }
});
