import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,addPilot,pilots,startWave,stepGame,fireVolley} from '../shooter/core.js';
import {encodeVolleys,decodeVolleys} from '../shooter/snapshot.js';
test('volley wire format preserves every living projectile, including holes left by hits',()=>{
 const g=createGame(720,960);g.spread=100;fireVolley(g);g.bullets=g.bullets.filter((b,i)=>i!==0&&i!==30&&i!==99);
 for(const b of g.bullets){b.x+=b.vx*.31;b.y+=b.vy*.31}
 const restored=decodeVolleys(encodeVolleys(g.bullets));assert.equal(restored.length,g.bullets.length);
 for(let i=0;i<restored.length;i++){const a=restored[i],b=g.bullets[i];assert.ok(Math.abs(a.x-b.x)<.01);assert.ok(Math.abs(a.y-b.y)<.01);assert.equal(a.owner,b.owner);assert.equal(a.vx,b.vx);assert.equal(a.vy,b.vy)}
});
test('sixteen players with 100 lanes send under one tenth of the old projectile payload',()=>{
 const g=createGame(720,960);for(let i=1;i<16;i++)addPilot(g,String(i));startWave(g);for(const p of pilots(g)){p.spread=100;p.shield=100000}
 for(let i=0;i<40;i++)stepGame(g,1/30);
 const old=JSON.stringify(g.bullets.map(b=>[Math.round(b.x),Math.round(b.y),b.owner,Math.round(b.vx),Math.round(b.vy)]));
 const packed=JSON.stringify(encodeVolleys(g.bullets));assert.ok(packed.length<old.length/10,`${packed.length}/${old.length}`);assert.equal(decodeVolleys(JSON.parse(packed)).length,g.bullets.length);
});
