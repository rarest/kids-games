import test from 'node:test';
import assert from 'node:assert/strict';
import { createState, stepState, PLAYER_HEIGHT, PLAYER_RADIUS } from '../parkour/core.js';
import { LEVELS } from '../parkour/levels.js';

const platform = (id, x=0, z=0, y=0, w=8, d=8, h=1) => ({id,x,z,y,w,d,h});
const fixture = (extra={}) => ({id:'test',theme:'sakura',platforms:[platform('floor')],spawn:{x:0,y:0,z:0},goal:{x:3,y:0,z:3},coins:[],checkpoints:[],...extra});
const tick = (state, input={}, frames=1) => { for(let i=0;i<frames;i++) stepState(state,input,1/120); return state; };
const near = (actual, expected, tolerance=.02) => assert.ok(Math.abs(actual-expected)<tolerance, `${actual} should be near ${expected}`);

test('free movement travels six units per second and diagonal input has equal speed', () => {
  const straight=createState(fixture()), diagonal=createState(fixture());
  tick(straight,{x:1,z:0},60); tick(diagonal,{x:1,z:1},60);
  near(straight.player.x,3); near(Math.hypot(diagonal.player.x,diagonal.player.z),3);
  assert.equal(straight.tutorial.moved,true); assert.equal(straight.tutorial.camera,false);
  tick(straight,{},10); near(straight.player.x,3);
});

test('jump rises, lands with feet on the top, and holding jump does not repeat', () => {
  const state=createState(fixture()); const seen=[];
  for(let i=0;i<180;i++){stepState(state,{jump:true},1/120); seen.push(...state.events);}
  assert.equal(seen.filter(e=>e.type==='jump').length,1);
  assert.equal(seen.filter(e=>e.type==='land').length,1);
  near(state.player.y,0); assert.equal(state.player.grounded,true);
  assert.equal(state.tutorial.jumped,true);
  tick(state,{},1); tick(state,{jump:true},1); assert.ok(state.player.vy>8);
});

test('a raised platform side blocks the character instead of letting them tunnel', () => {
  const state=createState(fixture({platforms:[platform('floor',0,0,0,20,20),platform('wall',2,0,3,1,4,3)]}));
  tick(state,{x:1},120);
  near(state.player.x,1.5-PLAYER_RADIUS); near(state.player.y,0);
});

test('head contact with platform underside stops ascent', () => {
  const state=createState(fixture({platforms:[platform('floor'),platform('ceiling',0,0,2.6,4,4,.5)]}));
  let peak=0;
  for(let i=0;i<120;i++){stepState(state,{jump:i===0},1/120); peak=Math.max(peak,state.player.y);}
  assert.ok(peak<=2.1-PLAYER_HEIGHT+.001); assert.ok(peak>.2);
  near(state.player.y,0);
});

test('large frames clamp to a quarter second and still collide', () => {
  const state=createState(fixture({platforms:[platform('floor',0,0,0,20,20),platform('wall',1,0,3,.2,4,3)]}));
  stepState(state,{x:1},4);
  near(state.elapsed,.25,.00001); near(state.player.x,.9-PLAYER_RADIUS);
  stepState(state,{x:1},NaN); near(state.elapsed,.25,.00001);
});

test('leaving an edge permits a jump for 0.12 seconds but not indefinitely', () => {
  const state=createState(fixture({platforms:[platform('floor',0,0,0,2,8)]}));
  tick(state,{x:1},27); assert.equal(state.player.grounded,false);
  tick(state,{jump:true},1); assert.ok(state.player.vy>8);
  const late=createState(fixture({platforms:[platform('floor',0,0,0,2,8)]}));
  tick(late,{x:1},50); tick(late,{jump:true},1); assert.ok(late.player.vy<0);
});

test('a fresh airborne jump press is buffered until imminent landing', () => {
  const state=createState(fixture({spawn:{x:0,y:.12,z:0}})); state.player.vy=-2;
  const seen=[];
  for(let i=0;i<12;i++){stepState(state,{jump:true},1/120);seen.push(...state.events);}
  assert.equal(seen.filter(e=>e.type==='jump').length,1); assert.ok(state.player.vy>7);
});

test('an airborne jump press expires before a distant landing', () => {
  const state=createState(fixture({spawn:{x:0,y:3,z:0}}));const seen=[];
  for(let i=0;i<120;i++){stepState(state,{jump:true},1/120);seen.push(...state.events);}
  assert.equal(state.player.grounded,true);assert.equal(seen.filter(e=>e.type==='jump').length,0);
});

test('feet land on a raised top approached through the real jump arc', () => {
  const state=createState(fixture({platforms:[platform('start',0,0,0,4,4),platform('end',4.5,0,.5,3,3)],goal:{x:4.5,y:.5,z:0}}));
  tick(state,{x:1},28); tick(state,{x:1,jump:true},1);
  for(let i=0;i<120 && !state.complete;i++) stepState(state,{x:state.player.x<4.5?1:0},1/120);
  near(state.player.y,.5);assert.equal(state.player.grounded,true);assert.equal(state.complete,true);
});

test('fall respawns at the last grounded checkpoint and retains collected coins', () => {
  const state=createState(fixture({coins:[{id:'c',x:1,y:0,z:0}],checkpoints:[{id:'cp',x:2,y:0,z:0}]}));
  tick(state,{x:1},40); assert.equal(state.checkpoint.id,'cp'); assert.ok(state.collected.has('c'));
  assert.equal(state.tutorial.checkpoint,true); assert.equal(state.tutorial.collected,true);
  state.player.y=-30; const returned=stepState(state,{},1/120);
  assert.equal(returned,state); assert.equal(state.falls,1); near(state.player.x,2); near(state.player.y,0);
  assert.ok(state.collected.has('c')); assert.ok(state.events.some(e=>e.type==='fall'));
});

test('collectible events happen once and are refreshed on each call', () => {
  const state=createState(fixture({coins:[{id:'c',x:0,y:0,z:0}]}));
  stepState(state,{},1/120); assert.deepEqual(state.events,[{type:'coin',id:'c'}]);
  stepState(state,{},1/120); assert.deepEqual(state.events,[]);
});

test('checkpoint and finish require the correct height and grounded feet', () => {
  const state=createState(fixture({goal:{x:0,y:3,z:0},checkpoints:[{id:'wrong',x:0,y:3,z:0}]}));
  tick(state,{},2); assert.equal(state.complete,false); assert.equal(state.checkpoint.id,undefined);
  state.level.goal={x:0,y:0,z:0}; state.player.y=.1; state.player.vy=2; state.player.grounded=false;
  tick(state,{},1); assert.equal(state.complete,false);
  tick(state,{},120); assert.equal(state.complete,true); assert.equal(state.tutorial.finished,true);
  const elapsed=state.elapsed; tick(state,{x:1},20); assert.equal(state.elapsed,elapsed);
});

// Removing a platform, widening a gap, or increasing a rise must fail a real input route.
for(const [index,level] of LEVELS.entries()) test(`preset ${level.id} completes its actual ${level.theme} route`, () => {
  assert.equal(level.difficulty,index+1);
  const state=createState(level);
  const allEvents=[];
  for(let i=1;i<level.platforms.length;i++){
    const from=level.platforms[i-1], to=level.platforms[i];
    const dx=to.x-from.x,dz=to.z-from.z,length=Math.hypot(dx,dz),nx=dx/length,nz=dz/length;
    const departure={x:from.x+nx*(from.w/2-.45),z:from.z+nz*(from.d/2-.45)};
    const moveTo=(point,jump=false)=>{
      const mx=point.x-state.player.x,mz=point.z-state.player.z,m=Math.hypot(mx,mz);
      stepState(state,{x:m>.03?mx/m:0,z:m>.03?mz/m:0,jump},1/120);
      allEvents.push(...state.events);
    };
    for(let n=0;n<160 && Math.hypot(state.player.x-departure.x,state.player.z-departure.z)>.06;n++) moveTo(departure);
    moveTo(to,true);
    for(let n=0;n<160 && (!state.player.grounded || Math.hypot(state.player.x-to.x,state.player.z-to.z)>.06);n++) moveTo(to);
    near(state.player.x,to.x,.1); near(state.player.z,to.z,.1); near(state.player.y,to.y);
    assert.equal(state.player.grounded,true,`platform ${to.id} must be reachable`);
  }
  tick(state,{},2);
  assert.equal(state.complete,true); assert.equal(state.falls,0);
  assert.ok(state.collected.size>0); assert.ok(allEvents.some(e=>e.type==='checkpoint'));
});

test('presets span four themes with progressively longer or narrower routes', () => {
  assert.equal(LEVELS.length,12);
  assert.deepEqual([...new Set(LEVELS.map(l=>l.theme))],['sakura','flowers','city','cabin']);
  for(let i=1;i<LEVELS.length;i++){
    assert.ok(LEVELS[i].platforms.length>=LEVELS[i-1].platforms.length);
    assert.ok(LEVELS[i].platforms[1].w<=LEVELS[i-1].platforms[1].w);
    assert.ok(LEVELS[i].platforms.length>LEVELS[i-1].platforms.length || LEVELS[i].platforms[1].w<LEVELS[i-1].platforms[1].w);
  }
});
