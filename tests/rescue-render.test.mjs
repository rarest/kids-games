import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3, Vector3, Frustum, Matrix4, OrthographicCamera } from 'three';
import { LEVELS } from '../rescue/levels.js';
async function module(name) { const m=await import(`../rescue/${name}.js`).catch(()=>null); assert.ok(m,`${name} rendering module must exist`); return m; }
const meshes=g=>{const a=[];g.traverse(o=>{if(o.isMesh)a.push(o)});return a};
test('Chip and Dale have distinct recognizable accessories and actual articulated poses',async()=>{
 const {createAvatar}=await module('avatar');const chip=createAvatar('chip'),dale=createAvatar('dale');
 assert.ok(chip.group.getObjectByName('fedora'));assert.ok(dale.group.getObjectByName('floral-shirt'));
 const p={x:2,y:1,w:.8,h:1.3,facing:1,animation:'run',carrying:null,hidden:false,invulnerable:0};
 chip.update(p,.1);const rotation=chip.group.getObjectByName('left-leg').rotation.z;
 chip.update(p,.25);assert.notEqual(chip.group.getObjectByName('left-leg').rotation.z,rotation);
 chip.update({...p,animation:'carry',carrying:{type:'object',id:'box'}},.2);
 assert.ok(chip.group.getObjectByName('left-arm').rotation.z<-.5);
 const before=new Box3().setFromObject(chip.group).getSize(new Vector3()).y;
 chip.update({...p,hidden:true,animation:'hide'},.2);assert.ok(new Box3().setFromObject(chip.group).getSize(new Vector3()).y<before*.75);
 assert.equal(chip.group.position.x,2);assert.equal(chip.group.position.y,1);chip.dispose();dale.dispose();
});
test('shared texture cache survives borrowed actor disposal and releases exactly once with owner',async()=>{
 const {createMaterials}=await module('materials');const {createAvatar}=await module('avatar');const pool=createMaterials();
 const mat=pool.material('wood','#b87d40'),other=pool.material('wood','#845025');assert.equal(mat.map,other.map);
 let disposed=0;mat.map.addEventListener('dispose',()=>disposed++);const a=createAvatar('chip',pool),b=createAvatar('dale',pool);
 a.dispose();assert.equal(disposed,0);assert.ok(meshes(b.group).length);b.dispose();pool.dispose();pool.dispose();assert.equal(disposed,1);assert.deepEqual(pool.stats(),{geometries:0,materials:0,textures:0});
});
test("every enemy, object, pickup and projectile produces visible geometry with category silhouettes", async () => {
  const m = await module("models");
  const all = [];
  for (const kind of ["crate", "metal", "apple", "ball", "bigcrate"])
    all.push(m.createObject(kind));
  const enemies = [
    "dog",
    "bird",
    "caterpillar",
    "mouse",
    "kangaroo",
    "mimic",
    "toy",
    "bee",
    "rhino",
    "crab",
    "lizard",
    "pelican",
  ].map((k) => m.createEnemy(k));
  all.push(...enemies);
  for (const kind of ["flower", "star", "acorn", "zipper"])
    all.push(m.createPickup(kind));
  for (const kind of [
    "lightning",
    "feather",
    "alien",
    "colorBall",
    "spark",
    "token",
    "segment",
    "ash",
    "gear",
    "drop",
  ])
    all.push(m.createProjectile(kind));
  for (const a of all) {
    assert.ok(meshes(a.group).length, a.group.name);
    a.update?.({ x: 4, y: 2, w: 1, h: 1, facing: -1, animation: "run" }, 0.2);
    assert.equal(a.group.position.x, 4);
  }
  // Routing all kinds to one mesh must fail on real visible anatomy, not labels.
  const part = (actor, name) => {
    const p = actor.group.getObjectByName(name);
    assert.ok(
      p?.isMesh && p.visible,
      `${actor.group.name} needs visible ${name}`,
    );
    return p;
  };
  const bounds = (p) => new Box3().setFromObject(p);
  const [dog, bird] = enemies,
    kangaroo = enemies[4],
    rhino = enemies[8],
    crab = enemies[9];
  const dogBody = part(dog, "robot-dog-body"),
    wheels = meshes(dog.group).filter((p) => p.name === "wheel");
  assert.ok(dogBody.material.metalness > 0.5);
  assert.ok(
    bounds(dogBody).getSize(new Vector3()).x >
      bounds(dogBody).getSize(new Vector3()).y,
  );
  assert.ok(
    wheels.some((p) => p.position.x < dogBody.position.x) &&
      wheels.some((p) => p.position.x > dogBody.position.x),
  );
  for (const wheel of wheels) {
    assert.equal(wheel.geometry.type, "CylinderGeometry");
    assert.ok(
      bounds(wheel).getCenter(new Vector3()).y <
        bounds(dogBody).getCenter(new Vector3()).y,
    );
    assert.ok(bounds(wheel).min.y < bounds(dogBody).min.y);
  }
  const birdBody = part(bird, "bird-body");
  assert.equal(birdBody.geometry.type, "SphereGeometry");
  for (const side of [-1, 1]) {
    const wing = part(bird, `wing-${side}`);
    assert.ok(side * (wing.position.x - birdBody.position.x) > 0);
    assert.ok(
      bounds(wing).getSize(new Vector3()).x >
        bounds(wing).getSize(new Vector3()).z,
    );
  }
  assert.ok(part(bird, "beak").position.x > birdBody.position.x);
  assert.equal(part(bird, "beak").geometry.type, "ConeGeometry");
  const kangarooHead = part(kangaroo, "head"),
    ears = meshes(kangaroo.group).filter((p) => p.name === "ear");
  assert.ok(
    ears.some((p) => p.position.x < 0) && ears.some((p) => p.position.x > 0),
  );
  for (const ear of ears) {
    assert.ok(ear.position.y > kangarooHead.position.y);
    assert.ok(ear.scale.y > ear.scale.x * 1.5);
  }
  assert.equal(part(rhino, "horn").geometry.type, "ConeGeometry");
  assert.ok(part(rhino, "horn").position.y > part(rhino, "head").position.y);
  const shell = part(crab, "shell"),
    claws = meshes(crab.group).filter((p) => p.name === "claw");
  assert.ok(
    claws.some((p) => p.position.x < 0) && claws.some((p) => p.position.x > 0),
  );
  for (const claw of claws) {
    assert.ok(Math.abs(claw.position.x) > shell.scale.x / 2);
    assert.ok(claw.position.y > shell.position.y);
  }
  for (const a of all) a.dispose();
});
test('Boss render anchors match real weakpoints, side contacts, cigar and separated segment state',async()=>{
 const {createBoss}=await module('models');
 for(const kind of ['robot','owl','ufo','toyRobot','electricFish','casinoCat','caterpillar','fatCat']){
 const a=createBoss(kind);const b={kind,x:10,y:3,w:5,h:5.5,weakpoint:{x:10,y:7.9,w:.75,h:.6},anchors:{mouth:{x:9.2,y:7.29},hand:{x:8.3,y:5.86}},contactRegions:[{x:8.1,y:3.2,w:1.25,h:4.675},{x:11.9,y:3.2,w:1.25,h:4.675}],segments:[{x:10.2,y:3,w:.7,h:1.1}],phase:'segmentWave'};
 a.update(b,.1);a.group.updateMatrixWorld(true);assert.ok(meshes(a.group).length);
 if(['robot','toyRobot'].includes(kind)){const v=a.group.getObjectByName('weakpoint').getWorldPosition(new Vector3());assert.ok(Math.abs(v.x-10)<.001);assert.ok(Math.abs(v.y-8.2)<.001);}
 if(kind==='fatCat'){const v=a.group.getObjectByName('cigar-tip').getWorldPosition(new Vector3());assert.ok(Math.abs(v.x-9.2)<.001);assert.ok(Math.abs(v.y-7.29)<.001);}
 if(kind==='robot'){const v=a.group.getObjectByName('contact-arm-left').getWorldPosition(new Vector3());assert.ok(Math.abs(v.x-8.1)<.001);}
 if(kind==='caterpillar'){a.update({...b,phase:'separated',segments:[]},.2);assert.equal(a.group.visible,false);}
 a.dispose();}
});
test('all authored scenery kinds are implemented and repeated scenery uses instancing',async()=>{
 const {createScenery}=await module('scenery');let instances=0;for(const l of LEVELS){const a=createScenery(l);assert.equal(a.group.children.length,l.decor.length);a.group.traverse(o=>{if(o.isInstancedMesh)instances++});for(const d of a.group.children){assert.ok(meshes(d).length,d.name);assert.notEqual(d.userData.fallback,true,d.name);}a.dispose();}assert.ok(instances>20);
});
test('camera keeps both full real player bounds with margin in portrait and landscape',async()=>{
 const {framePlayers}=await module('scene');const players=[{x:2,y:1,w:.8,h:1.3,lives:3},{x:19,y:12,w:.8,h:1.3,lives:3,heldBy:'p1'}];
 for(const aspect of [.45,1,2.2]){const f=framePlayers(players,aspect);assert.ok(f.left<1.6&&f.right>19.4);assert.ok(f.bottom<1&&f.top>13.3);assert.ok(Math.abs(f.width/f.height-aspect)<.0001);}
});
test('scene graph follows dynamic platforms, held objects and spawned pickups without mutating simulation',async()=>{
 const {createWorld}=await module('scene');const {createGame}=await import('../rescue/core.js');const state=createGame(LEVELS[0],{players:2});const world=createWorld();world.setLevel(state.level);state.platforms[0].x=5;state.objects[0].x=8;state.objects[0].y=4;state.objects[0].heldBy='p1';state.pickups.push({id:'new',kind:'star',x:9,y:5,w:.5,h:.5});const before=JSON.stringify(state);world.update(state,1/60);assert.equal(JSON.stringify(state),before);
 assert.equal(world.group.getObjectByName('platform:street-west').position.x,5+state.platforms[0].w/2);
 assert.equal(world.group.getObjectByName('object:s1').position.y,4);assert.ok(world.group.getObjectByName('pickup:new'));
 state.objects[0].active=false;state.pickups.at(-1).collected=true;world.update(state,1/60);assert.equal(world.group.getObjectByName('object:s1'),undefined);assert.equal(world.group.getObjectByName('pickup:new'),undefined);world.dispose();
});
test('world resource counts plateau across level switches and particles stay bounded',async()=>{
 const {createWorld}=await module('scene');const {createGame}=await import('../rescue/core.js');const world=createWorld();const counts=[];
 for(let cycle=0;cycle<3;cycle++){for(const l of LEVELS){world.setLevel(l);world.update(createGame(l),1/60);}counts.push(world.resources.stats());}
 assert.deepEqual(counts[1],counts[2]);world.dispose();assert.deepEqual(world.resources.stats(),{geometries:0,materials:0,textures:0});
});
test('quality uses observed slow-frame windows rather than an unmeasured device label',async()=>{
 const {createQualityController}=await module('scene');const q=createQualityController(2);assert.equal(q.mode,'auto');for(let i=0;i<150;i++)q.observe(45);assert.ok(q.dpr<2);assert.equal(q.shadows,false);q.set('high');assert.equal(q.shadows,true);q.set('low');assert.ok(q.dpr<=1);assert.throws(()=>q.set('ultra'));
});
test('scenery disposal releases instance buffers without disposing borrowed texture resources',async()=>{
 const {createMaterials}=await module('materials'),{createScenery}=await module('scenery');const pool=createMaterials(),a=createScenery(LEVELS[1],pool);let instances=0,released=0;a.group.traverse(o=>{if(o.isInstancedMesh){instances++;o.addEventListener('dispose',()=>released++);}});a.dispose();assert.ok(instances>0);assert.equal(released,instances);assert.ok(pool.stats().textures>0);pool.dispose();
});
test('colored falling balls retain their real attack color and separated caterpillar projectiles are single segments',async()=>{
 const {createProjectile}=await module('models');const red=createProjectile('colorBall'),blue=createProjectile('colorBall');red.update({x:0,y:0,w:.5,h:.5,color:'red'});blue.update({x:0,y:0,w:.5,h:.5,color:'blue'});assert.notEqual(meshes(red.group).find(m=>m.name==='ball').material.color.getHex(),meshes(blue.group).find(m=>m.name==='ball').material.color.getHex());const segment=createProjectile('segment');assert.ok(segment.group.getObjectByName('segment-body'));red.dispose();blue.dispose();segment.dispose();
});
test('particle event IDs are consumed once, capped, expire and reset for a new game state',async()=>{
 const {createWorld}=await module('scene'),{createGame}=await import('../rescue/core.js');const world=createWorld(),s=createGame(LEVELS[0]);s.events=Array.from({length:100},(_,i)=>({id:`event-${i+1}`,type:'hit'}));world.update(s,1/60);assert.equal(world.particleCount,48);s.events=[];world.update(s,.5);assert.equal(world.particleCount,0);s.events=[{id:'event-100',type:'hit'}];world.update(s,.01);assert.equal(world.particleCount,0);const another=createGame(LEVELS[0]);another.events=[{id:'event-1',type:'hit'}];world.update(another,.01);assert.equal(world.particleCount,6);world.dispose();
});
test('carry pose puts both hands at the real overhead object support height',async()=>{const {createAvatar}=await module('avatar');const a=createAvatar('chip');a.update({x:0,y:0,w:.8,h:1.3,facing:1,animation:'carry',carrying:{type:'player',id:'p2'}},0);a.group.updateMatrixWorld(true);const hands=meshes(a.group).filter(m=>m.name==='hand').map(m=>m.getWorldPosition(new Vector3()));assert.equal(hands.length,2);assert.ok(hands.every(h=>h.y>1.3&&h.y<1.6));a.dispose();});
test('theme backdrop fills authored spawn gaps with depth and releases instancing',async()=>{const {createBackdrop}=await module('scenery');assert.equal(typeof createBackdrop,'function');const a=createBackdrop(LEVELS[1]);const bounds=new Box3().setFromObject(a.group);assert.ok(bounds.min.x<10&&bounds.max.x>10&&bounds.min.y<=1&&bounds.max.y>8);assert.ok(bounds.max.z< -4);let released=0;a.group.traverse(o=>{if(o.isInstancedMesh)o.addEventListener('dispose',()=>released++);});a.dispose();assert.ok(released>0);});
test('carrying preserves rounded hand proportions, and birds have visible eyes',async()=>{const {createAvatar}=await module('avatar'),{createEnemy}=await module('models');const a=createAvatar('chip');a.update({x:0,y:0,animation:'carry',carrying:{id:'box'},facing:1},0);a.group.updateMatrixWorld(true);for(const hand of meshes(a.group).filter(m=>m.name==='hand')){const scale=hand.getWorldScale(new Vector3());assert.ok(scale.y/scale.x<1.5);}a.dispose();for(const kind of ['bird','pelican']){const b=createEnemy(kind);assert.ok(meshes(b.group).some(m=>m.name==='pupil'));b.dispose();}});
test('FatCat mouth meets its cigar anchor and caterpillar segment art fits actual segment bounds',async()=>{const {createBoss}=await module('models');const cat=createBoss('fatCat');cat.update({x:10,y:2,w:6,h:6.5,anchors:{mouth:{x:9.04,y:7.07},hand:{x:7.96,y:5.38}}});cat.group.updateMatrixWorld(true);assert.ok(cat.group.getObjectByName('mouth'));const mouth=cat.group.getObjectByName('mouth').getWorldPosition(new Vector3());assert.ok(Math.abs(mouth.x-9.04)<.001&&Math.abs(mouth.y-7.07)<.001);cat.dispose();const c=createBoss('caterpillar');const segments=Array.from({length:5},(_,i)=>({x:10,y:2+i*.9,w:.7,h:.9}));c.update({x:10,y:2,w:2,h:4.5,segments,phase:'segmentWave'});c.group.updateMatrixWorld(true);for(let i=0;i<5;i++){const bounds=new Box3().setFromObject(c.group.getObjectByName(`body-segment-${i}`));assert.ok(bounds.max.y<=segments[i].y+.95);}c.dispose();});
test('robot contact arms remain inside the actual side contact regions',async()=>{const {createBoss}=await module('models');const a=createBoss('robot'),regions=[{x:8.1,y:3.2,w:1.25,h:4.675},{x:11.9,y:3.2,w:1.25,h:4.675}];a.update({x:10,y:3,w:5,h:5.5,contactRegions:regions});a.group.updateMatrixWorld(true);for(const [i,name] of ['contact-arm-left','contact-arm-right'].entries()){const bounds=new Box3().setFromObject(a.group.getObjectByName(name)),r=regions[i];assert.ok(bounds.min.x>=r.x-r.w/2-.03&&bounds.max.x<=r.x+r.w/2+.03);}a.dispose();});
test('FatCat chair supports the authored raised body down to the real arena floor without moving Boss',async()=>{const {createBoss}=await module('models');const a=createBoss('fatCat'),b={x:119.887,y:35.8,w:6,h:6.5,arena:{y:34.6},anchors:{mouth:{x:118.927,y:40.87}}};a.update(b);a.group.updateMatrixWorld(true);const chair=a.group.getObjectByName('chair');assert.ok(chair);const bounds=new Box3().setFromObject(chair);assert.ok(Math.abs(bounds.min.y-34.6)<.001);assert.equal(a.group.position.y,35.8);assert.ok(bounds.max.y>35.8);a.dispose();});

test('particles remain renderable after an empty frame and a distant player hit',async()=>{const {createWorld}=await module('scene'),{createGame}=await import('../rescue/core.js');const world=createWorld(),s=createGame(LEVELS[0]);world.update(s,1/60);const particle=world.group.getObjectByName('hit-particles'),camera=new OrthographicCamera(-5,5,5,-5,.1,100);camera.position.set(100,2,10);camera.lookAt(100,2,0);camera.updateMatrixWorld(true);const frustum=new Frustum().setFromProjectionMatrix(new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));frustum.intersectsObject(particle);s.players[0].x=100;s.events=[{id:'event-1',type:'hit'}];world.update(s,1/60);world.group.updateMatrixWorld(true);assert.equal(particle.count,6);assert.ok(!particle.frustumCulled||frustum.intersectsObject(particle),'real in-view hit particles must survive the renderer frustum check');world.dispose();});
