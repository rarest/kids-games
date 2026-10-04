import test from 'node:test';
import assert from 'node:assert/strict';

// These assertions catch a guest camera accidentally following slot zero,
// losing another driver's equipped paint, or interpolating across a respawn.
const load = () => import('../racing/online-state.js');
function packet(overrides={}) {
  return {room:{trackId:'plateau',run:1,mode:'racing'},race:{time:4,countdown:0,laps:2,status:'racing',cars:[
    {id:0,name:'队长',car:'apex',skin:'aurora',human:true,s:50,offset:0,speed:30,nitro:100,finished:0,finishTime:null,respawn:0},
    {id:3,name:'朋友',car:'rally',skin:'silver',human:true,s:55,offset:4,speed:20,nitro:100,finished:0,finishTime:null,respawn:0},
  ],traffic:[],...overrides}};
}
test('guest sees their own car first without changing authoritative player IDs or paint',async()=>{
  const {hydrateRace}=await load();const r=hydrateRace(packet(),3);
  assert.equal(r.cars[0].id,3);assert.equal(r.cars[0].name,'朋友');
  assert.equal(r.cars[0].model.id,'rally');assert.equal(r.cars[0].skin,'silver');
  assert.equal(r.cars[1].id,0);assert.equal(r.cars[0].finishTime,Infinity);
  assert.equal(r.online,true);assert.equal(r.hazards.length>0,true);
  const next=hydrateRace(packet({time:5}),3,r);
  assert.equal(next.track,r.track,'same course keeps its geometry');
});
test('visual projection moves cars smoothly but never runs on countdown, penalties, finish or stale frames',async()=>{
  const {hydrateRace,projectRace}=await load();const r=hydrateRace(packet(),3);
  const projected=projectRace(r,null,0.1,1/60);
  assert.ok(Math.abs(projected.cars[0].s-57)<0.001);
  assert.equal(r.cars[0].s,55,'server snapshot stays untouched');
  assert.ok(projectRace(r,null,8,1/60).cars[0].s<=58.01,'projection is capped at 150ms');
  for(const delta of [{countdown:2},{cars:r.cars.map(c=>({...c,car:c.model.id,respawn:3}))},{status:'finished'}]){
    const still=hydrateRace(packet(delta),3);
    assert.equal(projectRace(still,null,0.1,1/60).cars[0].s,55);
  }
});
test('a checkpoint reset snaps to the server position instead of drawing a car travelling backward around the circuit',async()=>{
  const {hydrateRace,projectRace}=await load();const before=hydrateRace(packet(),3);
  const view=projectRace(before,null,0,1/60);
  const newer=packet();Object.assign(newer.race.cars[1],{s:0,respawn:5,speed:0});
  const reset=hydrateRace(newer,3,before);const drawn=projectRace(reset,view,0,1/60);
  assert.equal(drawn.cars[0].s,0);assert.equal(drawn.cars[0].respawn,5);
});
