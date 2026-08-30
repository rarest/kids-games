import test from 'node:test';
import assert from 'node:assert/strict';
import {columnIndexAtPoint} from '../merge4096/drag.js';

const rects=[
  {left:10,right:60,top:200,bottom:600},
  {left:65,right:115,top:200,bottom:600},
  {left:120,right:170,top:200,bottom:600}
];

test('last known drag point selects the containing column',()=>{
  assert.equal(columnIndexAtPoint(rects,88,350),1);
  assert.equal(columnIndexAtPoint(rects,140,220),2);
});

test('a point outside all columns returns minus one',()=>{
  assert.equal(columnIndexAtPoint(rects,88,100),-1);
  assert.equal(columnIndexAtPoint(rects,400,350),-1);
});
