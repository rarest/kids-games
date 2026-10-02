import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,movePlayer} from '../territory/core.js';
import {circleCover,containsCircle} from '../territory/geometry.js';
test('islands consist of connected large and small circles sampled into the same logical mask',()=>{
  for(let seed=1;seed<=12;seed++){const g=createGame({seed,cols:88,rows:76});assert.ok(g.islandCircles.length>=4);assert.ok(new Set(g.islandCircles.map(c=>c.r)).size>3);
    for(let i=0;i<g.mask.length;i++)assert.equal(Boolean(g.mask[i]),containsCircle(g.islandCircles,i%g.cols+.5,Math.floor(i/g.cols)+.5));
    assert.deepEqual(g.islandCircles,createGame({seed,cols:88,rows:76}).islandCircles);
    const main=g.islandCircles[0];for(const c of g.islandCircles.slice(1))assert.ok(Math.hypot(c.x-main.x,c.y-main.y)<c.r+main.r);
    const p=g.players[0];movePlayer(g,0,p.x,0);assert.ok(containsCircle(g.islandCircles,p.x,p.y));
  }
});
test('circle covers preserve all owned cell centers, exclude others, and use one large round initial territory',()=>{
  for(const [cols,rows,mask]of [[3,3,Array(9).fill(1)],[7,7,Array.from({length:49},(_,i)=>i%7===3||Math.floor(i/7)===3?1:0)],[7,7,Array.from({length:49},(_,i)=>i===24?0:1)]]){
    const disks=circleCover(mask,cols,rows);assert.ok(disks.length);assert.ok(disks.every(c=>c.r>0));
    for(let i=0;i<mask.length;i++)assert.equal(containsCircle(disks,i%cols+.5,Math.floor(i/cols)+.5),Boolean(mask[i]),`center ${i}`);
    if(cols===3)assert.equal(disks.length,1,'small starting land is a single circle, not a square with rounded corners');
  }
});
