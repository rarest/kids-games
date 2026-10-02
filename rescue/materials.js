import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// A scene owns one pool. Actors borrow it; standalone constructors own their pool.
// No per-instance geometry/texture: removing an entity only releases its graph.
export function createMaterials() {
 const geometries=new Map(),materials=new Map(),textures=new Map();let disposed=false;
 function texture(kind){
  if(textures.has(kind))return textures.get(kind);
  const n=64,data=new Uint8Array(n*n*4);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
   const noise=((x*73+y*151+x*y*17)%31)/31;let c=235;
   if(kind==='wood')c=190+35*Math.sin(y*.6+Math.sin(x*.14)*2)+noise*20;
   if(kind==='metal')c=215+(y%3)*6+noise*12;
   if(kind==='brick')c=(y%16<2||(x+(Math.floor(y/16)%2)*16)%32<2)?145:230+noise*20;
   if(kind==='fabric')c=205+((x+y)%2)*23+noise*15;
   if(kind==='leaf')c=185+35*Math.sin((x-y)*.25)+(Math.abs(x-32)<2?35:0);
   if(kind==='tile')c=x<2||y<2?145:242+noise*10;
   const i=(y*n+x)*4;data[i]=data[i+1]=data[i+2]=c;data[i+3]=255;
  }
  const t=new THREE.DataTexture(data,n,n);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;textures.set(kind,t);return t;
 }
 function material(kind='plain',color='#ffffff',options={}){
  if(disposed)throw new Error('Disposed material pool');const key=JSON.stringify([kind,color,options]);
  if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:kind==='metal'?.34:.78,metalness:kind==='metal'?.65:0,map:kind==='plain'?null:texture(kind),...options}));return materials.get(key);
 }
 function geometry(kind){
  if(disposed)throw new Error('Disposed geometry pool');
  if(!geometries.has(kind)){
   let g;
   switch(kind){case 'box':g=new THREE.BoxGeometry(1,1,1);break;case 'round':g=new RoundedBoxGeometry(1,1,1,2,.12);break;case 'sphere':g=new THREE.SphereGeometry(.5,20,12);break;case 'cylinder':g=new THREE.CylinderGeometry(.5,.5,1,20);break;case 'cone':g=new THREE.ConeGeometry(.5,1,20);break;case 'torus':g=new THREE.TorusGeometry(.4,.1,8,24);break;case 'star':{const shape=new THREE.Shape();for(let i=0;i<10;i++){const angle=i*Math.PI/5+Math.PI/2,r=i%2?.23:.5;const x=Math.cos(angle)*r,y=Math.sin(angle)*r;i?shape.lineTo(x,y):shape.moveTo(x,y);}shape.closePath();g=new THREE.ExtrudeGeometry(shape,{depth:.13,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.04,bevelThickness:.04});break;}default:throw new Error(`Unknown geometry: ${kind}`);}
   geometries.set(kind,g);
  }return geometries.get(kind);
 }
 return {material,geometry,stats:()=>({geometries:geometries.size,materials:materials.size,textures:textures.size}),dispose(){if(disposed)return;disposed=true;geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());geometries.clear();materials.clear();textures.clear();}};
}

export function createAsset(pool,name='asset'){
 const own=!pool;pool??=createMaterials();const group=new THREE.Group();group.name=name;
 function part(type,color,size=[1,1,1],position=[0,0,0],name='',parent=group,kind='plain',options={}){
  const mesh=new THREE.Mesh(pool.geometry(type),pool.material(kind,color,options));mesh.scale.set(...size);mesh.position.set(...position);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 }
 function joint(name,position,parent=group){const g=new THREE.Group();g.name=name;g.position.set(...position);parent.add(g);return g;}
 let disposed=false;
 return {group,pool,part,joint,update(entity){group.position.set(entity.x??0,entity.y??0,0);},dispose(){if(disposed)return;disposed=true;group.traverse(o=>{if(o.isInstancedMesh)o.dispose();});group.removeFromParent();group.clear();if(own)pool.dispose();}};
}
