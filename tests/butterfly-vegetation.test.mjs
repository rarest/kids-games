import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const html=await readFile(new URL('../games/butterfly.html',import.meta.url),'utf8');
const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(match=>match[1]);
const source=scripts.find(script=>script.includes('globalThis.GardenVegetation='));
assert.ok(source,'published HTML must include its vegetation implementation');
const rulesSource=scripts.find(script=>script.includes('globalThis.GardenRules ='));
assert.ok(rulesSource,'published HTML must include its shared house layout');

// Store the transforms supplied by real vegetation.create/update without a GPU.
// Rendering, shader compilation and actual rotation matrices belong in browser tests.
class Vector3 {
 constructor(x=0,y=0,z=0){this.set(x,y,z);}
 set(x,y,z){Object.assign(this,{x,y,z});return this;}
 copy(other){return this.set(other.x,other.y,other.z);}
}
class Geometry {
 constructor(...parameters){this.parameters=parameters;this.attributes={};}
 setAttribute(name,attribute){this.attributes[name]=attribute;return this;}
 setIndex(index){this.index=index;return this;}
 computeVertexNormals(){}
 rotateX(){return this;}
}
class Object3D {
 constructor(){this.position=new Vector3();this.rotation=new Vector3();this.scale=new Vector3(1,1,1);this.matrix={elements:new Float64Array(16)};}
 updateMatrix(){const e=this.matrix.elements;e.fill(0);e[0]=this.scale.x;e[5]=this.scale.y;e[10]=this.scale.z;e[12]=this.position.x;e[13]=this.position.y;e[14]=this.position.z;e[15]=1;}
}
class Color {set(value){this.value=value;return this;}}
class InstancedMesh {
 constructor(geometry,material,capacity){Object.assign(this,{geometry,material,capacity,count:capacity,userData:{},instanceMatrix:{array:new Float64Array(capacity*16)}});}
 setMatrixAt(index,matrix){assert.ok(index>=0&&index<this.capacity,'instance pool capacity exceeded');this.instanceMatrix.array.set(matrix.elements,index*16);}
 setColorAt(){this.instanceColor??={};}
 computeBoundingSphere(){this.boundingSphere={center:new Vector3()};}
}
class Material {constructor(options){Object.assign(this,options);}clone(){return new Material({...this});}}
class Texture {constructor(){this.repeat={set(){}};}}
class Float32BufferAttribute {constructor(array,itemSize){this.array=new Float32Array(array);this.itemSize=itemSize;this.count=array.length/itemSize;}}
const THREE={Vector3,Object3D,Color,InstancedMesh,BufferGeometry:Geometry,Float32BufferAttribute,CircleGeometry:Geometry,SphereGeometry:Geometry,IcosahedronGeometry:Geometry,CylinderGeometry:Geometry,CanvasTexture:Texture,MeshStandardMaterial:Material};
const canvasContext={fillRect(){},beginPath(){},moveTo(){},bezierCurveTo(){},quadraticCurveTo(){},stroke(){},ellipse(){},fill(){}};
const context=vm.createContext({document:{createElement:()=>({getContext:()=>canvasContext})}});
// Expose the actual cell filler only in this VM so 126 cases do not regenerate
// the other 48 cells each time. The published source and function body stay intact.
const instrumented=source.replace('return{update,snapshot:','return{fillForTest:fill,update,snapshot:');
assert.notEqual(instrumented,source,'vegetation cell filler must be available to this regression');
vm.runInContext(instrumented,context);
vm.runInContext(rulesSource,context);
const vegetation=context.GardenVegetation;
const homes=JSON.parse(JSON.stringify(context.GardenRules.create(1,{}, {players:64}).huts));

function world(quality,T=THREE,forestScale=1){
 const owner={quality,_forestScale:forestScale,scene:{children:[],add(mesh){this.children.push(mesh);}},decorChunks:[],houses:[{home:homes[0]}],renderer:{shadowMap:{}},meadowCounts:{},pbr:{bladeGeometry:new T.BufferGeometry(),palette:{grass:['#779944'],flowers:['#eebbcc']}},materials:Object.fromEntries(['grass','leaf','petal','honey','bark'].map(name=>[name,new T.MeshStandardMaterial()]))};
 const plants=vegetation.create(T,owner);
 return {owner,plants};
}
function coordinates(mesh){
 const array=mesh.instanceMatrix.array,points=[];
 for(let i=0;i<mesh.count;i++)points.push([array[i*16+12],array[i*16+14]]);
 return points;
}
const key=point=>point.join(',');

test('streaming flower IDs do not change physical flower features',()=>{
 for(const [x,z] of [[0,0],[35.25,-8.75],[-1203,871],[.001,-.001]]){
  const first=vegetation.flowerStyle({x,z,id:0,value:1});
  assert.deepEqual(vegetation.flowerStyle({x,z,id:777,value:3}),first);
  assert.ok(first.height>0&&first.angle>=0&&first.angle<2*Math.PI&&first.palette>=0&&first.palette<6);
 }
});

test('fixed tree cells reproduce the same keyed trees after visiting other cells',()=>{
 for(const [x,z] of [[0,0],[-4,2],[37,-28]]){
  const first=JSON.stringify(vegetation.treesInCell(x,z));
  vegetation.treesInCell(x+19,z-31);
  assert.equal(JSON.stringify(vegetation.treesInCell(x,z)),first);
  const trees=vegetation.treesInCell(x,z);
  assert.equal(new Set(trees.map(tree=>tree.key)).size,trees.length);
  assert.ok(trees.every(tree=>tree.key.startsWith(`${x},${z}:`)));
 }
});

test('software density preserves positions of complete plants from full quality',()=>{
 const full=world('full'),soft=world('software');
 full.plants.update({x:0,z:6});soft.plants.update({x:0,z:6});
 let reduced=0;
 for(const slot of soft.plants.slots){
  const original=full.plants.slots.find(other=>other.key===slot.key);
  for(const kind of ['grass','clover','petal','center']){
   const points=coordinates(slot[kind]),all=new Set(coordinates(original[kind]).map(key));
   assert.ok(points.every(point=>all.has(key(point))),`${slot.key} ${kind} moved when quality changed`);
   if(points.length<original[kind].count)reduced++;
  }
  assert.equal(slot.petal.count,slot.center.count*5,'a decorative flower retains all five petals');
  assert.equal(slot.clover.count%3,0,'a clover retains all three leaves');
 }
 assert.ok(reduced>0,'software quality must actually reduce plant density');
});

test('all 63 late joins preserve existing grass outside the new house in both qualities',()=>{
 let cases=0;
 for(const quality of ['full','software']){
  const {owner,plants}=world(quality);
  const pool=[...plants.slots],objects=owner.scene.children.length;
  for(let index=1;index<homes.length;index++){
   const home=homes[index],cx=Math.floor(home.x/vegetation.cellSize),cz=Math.floor(home.z/vegetation.cellSize),slot=plants.slots[0];
   plants.fillForTest(slot,cx,cz,homes.slice(0,index));
   const before=coordinates(slot.grass);
   plants.fillForTest(slot,cx,cz,homes.slice(0,index+1));
   const after=new Set(coordinates(slot.grass).map(key));
   const outside=before.filter(([x,z])=>Math.hypot(x-home.x,z-home.z)>=1.6);
   assert.ok(outside.every(point=>after.has(key(point))),`${quality}: player ${index+1} changed grass outside its house`);
   assert.equal(owner.scene.children.length,objects,'joining must reuse the bounded mesh pool');
   assert.ok(pool.every(slot=>plants.slots.includes(slot)),'joining must reuse cell slots');
   cases++;
  }
 }
 assert.equal(cases,126);
});

test('published tree bodies follow rendered trunks, branch axes and crown vertices in both biome scales',()=>{
 // Use the exact bundled THREE matrices and vertex data for this CPU-only
 // comparison. The lightweight transform stubs above intentionally omit rotation.
 const threeSource=scripts.find(script=>script.includes('REVISION')&&script.includes('WebGLRenderer'));
 assert.ok(threeSource,'published HTML must bundle its THREE implementation');
 const threeContext=vm.createContext({console:{warn(){}}});
 vm.runInContext(threeSource,threeContext);
 const T=threeContext.THREE,matrix=new T.Matrix4(),point=new T.Vector3();
 const near=(actual,expected,label)=>assert.ok(Math.hypot(actual.x-expected.x,actual.y-expected.y,actual.z-expected.z)<1e-4,label);
 function covers(body,p){
  if(body.shape==='capsule'){
   const dx=body.bx-body.ax,dy=body.by-body.ay,dz=body.bz-body.az,length=dx*dx+dy*dy+dz*dz;
   const t=length?Math.max(0,Math.min(1,((p.x-body.ax)*dx+(p.y-body.ay)*dy+(p.z-body.az)*dz)/length)):0;
   return Math.hypot(p.x-body.ax-dx*t,p.y-body.ay-dy*t,p.z-body.az-dz*t)<=body.radius+.025;
  }
  const co=Math.cos(body.angle),si=Math.sin(body.angle),dx=p.x-body.x,dz=p.z-body.z,lx=dx*co-dz*si,lz=dx*si+dz*co;
  const t=body.shape==='cone'?(p.y-body.yMin)/(body.yMax-body.yMin):(p.y-body.y)/body.ry;
  const rings=body.rings;
  if(t<rings[0][0]-1e-6||t>rings.at(-1)[0]+1e-6)return false;
  for(let i=1;i<rings.length;i++)if(t<=rings[i][0]+1e-6){
   const [a,ar]=rings[i-1],[b,br]=rings[i],amount=ar+(br-ar)*(t-a)/(b-a);
   // Crown vertices have a documented ten-percent radial wobble. Their solid
   // envelope must still follow the same lobes, tiers, scale and world rotation.
   return Math.hypot(lx/(body.rx*Math.max(0,amount)+.0001),lz/(body.rz*Math.max(0,amount)+.0001))<=1.101;
  }return false;
 }
 for(const scale of [1,.65]){
  const {plants}=world('full',T,scale);plants.update({x:0,z:6});
  for(const species of ['oak','birch','pine','willow']){
   const tree=plants.snapshot().find(tree=>tree.species===species);
   assert.ok(tree,`${species} must have a rendered instance`);
   const bodies=vegetation.treeCollidersNear(tree.x,tree.z,scale,homes.slice(0,1)).filter(body=>body.treeKey===tree.key);
   const timber=bodies.filter(body=>body.kind==='trunk'||body.kind==='branch');
   assert.equal(timber.length,4,'one trunk and three branches share the rendered tree');
   for(const [i,body]of timber.entries()){
    plants.bark.getMatrixAt(tree.trunkIndex+i,matrix);
    near(point.set(0,0,0).applyMatrix4(matrix),{x:(body.ax+body.bx)/2,y:(body.ay+body.by)/2,z:(body.az+body.bz)/2},`${species} timber midpoint`);
    near(point.set(0,.5,0).applyMatrix4(matrix),{x:body.bx,y:body.by,z:body.bz},`${species} timber endpoint`);
   }
   const crown=plants.canopies[species],positions=crown.geometry.attributes.position,crowns=bodies.filter(body=>body.kind==='crown');
   crown.getMatrixAt(tree.canopyIndex,matrix);
   for(let i=0;i<positions.count;i++){
    point.fromBufferAttribute(positions,i).applyMatrix4(matrix);
    assert.ok(crowns.some(body=>covers(body,point)),`${species} crown vertex ${i} disagrees with collision at scale ${scale}`);
   }
   assert.equal(vegetation.treeCollidersNear(tree.x,tree.z,scale,[tree]).filter(body=>body.treeKey===tree.key).length,0,'a house-cleared tree cannot retain shared collision bodies');
  }
 }
});
