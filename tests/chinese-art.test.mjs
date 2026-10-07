import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {unitArt} from '../chinese/art.js';

test('all eight Chinese units use distinct optimized illustrated assets with reserved dimensions and descriptive alternatives',async()=>{
 const sources=new Set();
 for(let n=1;n<=8;n++){
  const html=unitArt(`u${n}`);assert.match(html,/<img /);assert.match(html,/width="1200" height="800"/);assert.match(html,/loading="lazy"/);assert.match(html,/alt="[^"<>]+"/);assert.doesNotMatch(html,/undefined|NaN/);
  const src=html.match(/src="([^"]+)"/)[1];sources.add(src);
  const bytes=await readFile(new URL(src));assert.equal(bytes.subarray(8,12).toString(),'WEBP');assert.ok(bytes.length<350000,'unit cover should remain below 350 KB');
 }
 assert.equal(sources.size,8);
 assert.match(unitArt('u1',{priority:true}),/loading="eager"/);assert.match(unitArt('u1',{priority:true}),/fetchpriority="high"/);
 assert.equal(unitArt('not-a-unit'),unitArt('u1'));
});
