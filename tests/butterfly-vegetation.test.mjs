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
 setAttribute(){return this;}
 setIndex(){return this;}
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
class Material {constructor(options){Object.assign(this,options);}}
class Texture {constructor(){this.repeat={set(){}};}}
const THREE={Vector3,Object3D,Color,InstancedMesh,BufferGeometry:Geometry,Float32BufferAttribute:class{},CircleGeometry:Geometry,SphereGeometry:Geometry,IcosahedronGeometry:Geometry,CylinderGeometry:Geometry,CanvasTexture:Texture,MeshStandardMaterial:Material};
const canvasContext={fillRect(){},beginPath(){},ellipse(){},fill(){}};
const context=vm.createContext({document:{createElement:()=>({getContext:()=>canvasContext})}});
// Expose the actual cell filler only in this VM so 126 cases do not regenerate
// the other 48 cells each time. The published source and function body stay intact.
const instrumented=source.replace('return{update,snapshot:','return{fillForTest:fill,update,snapshot:');
assert.notEqual(instrumented,source,'vegetation cell filler must be available to this regression');
vm.runInContext(instrumented,context);
vm.runInContext(rulesSource,context);
const vegetation=context.GardenVegetation;
const homes=JSON.parse(JSON.stringify(context.GardenRules.create(1,{}, {players:64}).huts));

function world(quality){
 const owner={quality,scene:{children:[],add(mesh){this.children.push(mesh);}},decorChunks:[],houses:[{home:homes[0]}],renderer:{shadowMap:{}},meadowCounts:{},pbr:{bladeGeometry:new Geometry(),palette:{grass:['#779944'],flowers:['#eebbcc']}},materials:{grass:new Material(),leaf:new Material(),petal:new Material(),honey:new Material(),bark:new Material()}};
 const plants=vegetation.create(THREE,owner);
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
