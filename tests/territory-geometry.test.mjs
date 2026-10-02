import test from 'node:test';
import assert from 'node:assert/strict';
import {contours,smoothContour,viewport} from '../territory/geometry.js';
test('rounded contours retain holes and keep diagonal islands separate',()=>{
  const ring=Array(25).fill(1);ring[12]=0;const loops=contours(ring,5,5);assert.equal(loops.length,2);
  const smooth=loops.map(smoothContour);assert.ok(smooth.every(p=>p.some(v=>v.x%1!==0&&v.y%1!==0)),'corners are rounded');
  assert.equal(contours([1,0,0,1],2,2).length,2);
  assert.equal(contours(Array(9).fill(1),3,3).length,1,'no internal grid seams');
});
test('local camera follows the player and maps coordinates correctly on phone, tablet and computer',()=>{
  const g={cols:88,rows:76,players:[{x:30,y:30}]};
  for(const [w,h]of [[282,260],[352,490],[620,210],[780,770],[950,700]]){const a=viewport(g,w,h);assert.ok(a.viewWidth<g.cols*.6&&a.viewHeight<g.rows*.6);assert.equal(a.ox+g.players[0].x*a.scale,w/2);assert.equal(a.oy+g.players[0].y*a.scale,h/2);g.players[0].x+=2;const b=viewport(g,w,h);assert.ok(b.ox<a.ox);g.players[0].x-=2;}
});
