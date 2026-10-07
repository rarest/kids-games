import test from 'node:test';
import assert from 'node:assert/strict';
import {foldNet} from '../math/geometry.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
test('six connected faces preserve all edge lengths throughout hinge folding',()=>{for(const solid of ['cube','cuboid']){const flat=foldNet(solid,0);for(const t of [0,.2,.5,.8,1]){const faces=foldNet(solid,t);assert.equal(faces.length,6);for(let i=0;i<6;i++)for(let j=0;j<4;j++){const a=faces[i].points[j],b=faces[i].points[(j+1)%4],c=flat[i].points[j],d=flat[i].points[(j+1)%4];close(Math.hypot(...a.map((v,k)=>v-b[k])),Math.hypot(...c.map((v,k)=>v-d[k])));}}}});
test('closed net has eight corners, six different faces and three faces meeting at every corner',()=>{for(const solid of ['cube','cuboid']){const faces=foldNet(solid,1),corners=new Map();const faceKeys=new Set();for(const face of faces){const keys=face.points.map(p=>p.map(v=>v.toFixed(8)).join(','));faceKeys.add(keys.toSorted().join('|'));for(const k of keys)corners.set(k,(corners.get(k)||0)+1);}assert.equal(faceKeys.size,6);assert.equal(corners.size,8);assert.deepEqual([...corners.values()],[3,3,3,3,3,3,3,3]);}});
