import test from 'node:test';
import assert from 'node:assert/strict';
import {viewport} from '../territory/geometry.js';
test('local camera follows the player and maps coordinates correctly on phone, tablet and computer',()=>{
  const g={cols:88,rows:76,players:[{x:30,y:30}]};
  for(const [w,h]of [[282,260],[352,490],[620,210],[780,770],[950,700]]){const a=viewport(g,w,h);assert.ok(a.viewWidth<g.cols*.6&&a.viewHeight<g.rows*.6);assert.equal(a.ox+g.players[0].x*a.scale,w/2);assert.equal(a.oy+g.players[0].y*a.scale,h/2);g.players[0].x+=2;const b=viewport(g,w,h);assert.ok(b.ox<a.ox);g.players[0].x-=2;}
});
