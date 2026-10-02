import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../goldminer-sites/volley.js';
const items=()=>[{id:1,x:100,y:220,value:80,weight:1},{id:2,x:600,y:400,value:360,weight:3}];
test('winch upgrades speed up return travel while preserving rewards and outgoing speed',()=>{
 const run=speed=>{const m=items(),h=core.createVolley(m);core.advanceVolley(h,m,.2,speed);const outward=h[0].length;core.advanceVolley(h,m,2,speed);return{outward,h,m}};
 const a=run(1),b=run(1.75);assert.equal(a.outward,b.outward);assert.ok(b.h[1].length<a.h[1].length);
 assert.equal(b.h.length,2);
});
test('one aimed hook per mineral, no hooks for an empty mine',()=>{
 assert.equal(typeof core.createVolley,'function');
 const hooks=core.createVolley(items());
 assert.equal(hooks.length,2);
 assert.deepEqual(hooks.map(h=>h.grabbedId),[1,2]);
 assert.equal(core.createVolley([]).length,0);
});
test('each mineral is paid once and low FPS preserves travel time',()=>{
 assert.equal(typeof core.advanceVolley,'function');
 for(const fps of [15,60]){
  const minerals=items(),hooks=core.createVolley(minerals);let sum=0;
  for(let i=0;i<fps*8;i++)sum+=core.advanceVolley(hooks,minerals,1/fps).value;
  assert.equal(sum,440);assert.equal(minerals.length,0);assert.equal(hooks.every(h=>h.mode==='done'),true);
  assert.equal(core.advanceVolley(hooks,minerals,1).value,0);
 }
});
test('destroyed cargo retracts without awarding money',()=>{
 assert.equal(typeof core.advanceVolley,'function');
 const minerals=items(),hooks=core.createVolley(minerals);minerals.splice(0,1);let sum=0;
 for(let i=0;i<600;i++)sum+=core.advanceVolley(hooks,minerals,1/60).value;
 assert.equal(sum,360);
});
