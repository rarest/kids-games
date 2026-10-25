/* Fixed world cells: rendering slots may be reused, living plants never follow the camera. */
globalThis.GardenVegetation=(()=>{
 const cellSize=32,radius=3,speciesNames=['oak','birch','pine','willow'];
 const speciesSpecs={oak:{top:7,spread:3},birch:{top:8.6,spread:1.35},pine:{top:8.2,spread:2.3},willow:{top:6.2,spread:3}};
 const crownLobes={oak:[[-.55,5.65,0,1.9,1.05,1.55,1],[1.05,5.15,.15,1.65,1,1.45,4],[-1.7,4.75,.35,1.2,.95,1.2,2],[.15,5.9,-1.1,1.6,1.1,1.4,7],[.35,4.8,1.3,1.9,.95,1.5,9],[-.1,6.15,.35,1.6,.85,1.3,5]],birch:[[-.18,6.4,0,1.1,2.2,.86,2],[.6,5.9,.12,.78,1.6,.74,3],[-.65,5.3,-.12,.65,1.5,.76,6],[.05,7.7,.05,.62,.9,.59,9]],willow:[[-.65,5.45,0,1.8,.7,1.7,2],[.85,5.35,.2,1.9,.75,1.6,6],[0,5.75,-.15,1.5,.45,1.6,4]]};
 function hash(x,z,salt=0){let h=Math.imul(Math.round(x*1000)^salt,73856093)^Math.imul(Math.round(z*1000),19349663);h=Math.imul(h^(h>>>16),2246822519);return(h^(h>>>13))>>>0;}
 function flowerStyle(f){const seed=hash(f.x,f.z,7143);return{height:.62+(seed%71)/110,angle:(seed%65536)/65536*Math.PI*2,palette:seed%6,phase:(seed%8192)/8192*Math.PI*2};}
 function randomFor(cx,cz){let seed=hash(cx,cz,783);return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
 function treesInCell(cx,cz){const rand=randomFor(cx,cz),out=[];for(let n=0;n<2;n++){const x=cx*cellSize+6+rand()*20,z=cz*cellSize+6+rand()*20,scale=.8+rand()*.65;if(Math.hypot(x,z-6)<18)continue;out.push({key:cx+','+cz+':'+n,x,z,scale,angle:rand()*Math.PI*2,species:speciesNames[hash(x,z,309)%4]});}return out;}
 function treeStructure(tree){const s=tree.scale,name=tree.species,birch=name==='birch',height=(birch?6.8:name==='pine'?6.9:name==='willow'?4.55:4.8)*s;
  return{height,trunkRadius:(birch?.13:.29)*s,branches:Array.from({length:3},(_,j)=>{const a=tree.angle+j*2.094;return{x:tree.x+Math.sin(a)*(birch?.27:name==='pine'?.24:.62)*s,y:height*(name==='pine'?.56:.75)+j*.20*s,z:tree.z+Math.cos(a)*(birch?.27:name==='pine'?.24:.62)*s,radius:(birch?.046:name==='pine'?.07:.10)*s,length:(birch?1.35:name==='pine'?1.25:2)*s,rx:.72*Math.cos(a),rz:-.72*Math.sin(a)};})};
 }
 function treeCollidersNear(x,z,forestScale=1,homes=[]){const out=[],cx=Math.floor(x/cellSize),cz=Math.floor(z/cellSize);
  for(let a=cx-1;a<=cx+1;a++)for(let b=cz-1;b<=cz+1;b++)for(const tree of treesInCell(a,b)){
   if(Math.hypot(x-tree.x,z-tree.z)>12||homes.some(h=>Math.hypot(tree.x-h.x,tree.z-h.z)<4))continue;
   const structure=treeStructure(tree),meta={treeKey:tree.key,species:tree.species},scale=tree.scale,co=Math.cos(tree.angle),si=Math.sin(tree.angle),world=(lx,ly,lz)=>({x:tree.x+(lx*co+lz*si)*scale*forestScale,y:ly*scale,z:tree.z+(-lx*si+lz*co)*scale*forestScale});
   out.push({...meta,kind:'trunk',shape:'capsule',ax:tree.x,ay:0,az:tree.z,bx:tree.x,by:structure.height,bz:tree.z,radius:structure.trunkRadius});
   for(const branch of structure.branches){const half=branch.length/2,dx=-Math.sin(branch.rz)*half,dy=Math.cos(branch.rx)*Math.cos(branch.rz)*half,dz=Math.sin(branch.rx)*Math.cos(branch.rz)*half;out.push({...meta,kind:'branch',shape:'capsule',ax:branch.x-dx,ay:branch.y-dy,az:branch.z-dz,bx:branch.x+dx,by:branch.y+dy,bz:branch.z+dz,radius:branch.radius});}
   if(tree.species==='pine')for(let tier=0;tier<5;tier++){
    const p=world(Math.sin(tier*2.3)*.12,2+tier*1.07,Math.cos(tier*2.3)*.10),r=(2.25-tier*.37)*scale*forestScale;
    out.push({...meta,kind:'crown',shape:'cone',x:p.x,z:p.z,yMin:p.y,yMax:p.y+1.92*scale,rx:r,rz:r*.9,angle:tree.angle,rings:[[0,1],[.18,.8],[1,0]]});
   }else for(const [lx,ly,lz,rx,ry,rz]of crownLobes[tree.species]){const p=world(lx,ly,lz);out.push({...meta,kind:'crown',shape:'ellipsoid',...p,rx:rx*scale*forestScale,ry:ry*scale,rz:rz*scale*forestScale,angle:tree.angle,rings:[[-1,0],[-.4,.9],[.38,1],[1,0]]});}
   if(tree.species==='willow')for(let j=0;j<11;j++)for(let strand=0;strand<3;strand++){
    const angle=j*Math.PI*2/11+strand*.09,cos=Math.cos(angle),sin=Math.sin(angle),length=2.5+(j%3)*.30+strand*.12,baseY=5.4+(j%2)*.25;
    let previous=world(cos*1.6,baseY,sin*1.6);
    for(let row=1;row<4;row++){const t=row/3,r=1.6+Math.sin(t*Math.PI*.72)*1.25,next=world(cos*r,baseY-t*length,sin*r),width=(.19+strand*.025)*(1-(t-1/3)*.85);out.push({...meta,kind:'crown',shape:'capsule',ax:previous.x,ay:previous.y,az:previous.z,bx:next.x,by:next.y,bz:next.z,radius:width*scale*forestScale});previous=next;}
   }
  }return out;
 }
 // A crown landing is deliberately inside the outer foliage. Both server and
 // renderer use these world coordinates; no THREE or DOM is needed to query it.
 function perchAt(x,z,forestScale=1,homes=[]){let best=null;const cx=Math.floor(x/cellSize),cz=Math.floor(z/cellSize);
  for(let a=cx-1;a<=cx+1;a++)for(let b=cz-1;b<=cz+1;b++)for(const tree of treesInCell(a,b)){
   if(homes.some(h=>Math.hypot(tree.x-h.x,tree.z-h.z)<4))continue;
   const spec=speciesSpecs[tree.species],r=spec.spread*tree.scale*forestScale*.65,dx=x-tree.x,dz=z-tree.z;if(Math.hypot(dx,dz)>r)continue;
   const co=Math.cos(tree.angle),si=Math.sin(tree.angle),lx=(dx*co-dz*si)/(tree.scale*forestScale),lz=(dx*si+dz*co)/(tree.scale*forestScale);let top=-Infinity;
   if(tree.species==='pine'){
    for(let tier=0;tier<5;tier++){const width=2.25-tier*.37,base=2+tier*1.07,d=Math.hypot(lx-Math.sin(tier*2.3)*.12,(lz-Math.cos(tier*2.3)*.10)/.9)/width;
     if(d<=1)top=Math.max(top,base+1.92*(d<.8?1-d/.8*.82:(1-d)/.2*.18));}
   }else for(const [x0,y0,z0,rx,ry,rz]of crownLobes[tree.species]){const d=Math.hypot((lx-x0)/rx,(lz-z0)/rz);if(d<=1)top=Math.max(top,y0+ry*(1-.62*d));}
   if(!Number.isFinite(top))continue;const y=top*tree.scale;if(!best||y>best.y)best={y,species:tree.species,key:tree.key,x:tree.x,z:tree.z,radius:r};
  }return best;
 }
 // Smooth world-space growth patches: widths/heights vary together over several
 // metres, with tiny gaps between the thickets. No random stream is consumed.
 function growthAt(x,z){const ax=x/7,az=z/7,ix=Math.floor(ax),iz=Math.floor(az),u=ax-ix,v=az-iz,s=u*u*(3-2*u),t=v*v*(3-2*v),n=(a,b)=>(hash(a,b,172)%1000)/999;return(n(ix,iz)*(1-s)+n(ix+1,iz)*s)*(1-t)+(n(ix,iz+1)*(1-s)+n(ix+1,iz+1)*s)*t;}
 function create(T,owner){
  const scene=owner.scene,slots=[],records=[],matrix=new T.Object3D(),color=new T.Color(),faded=new WeakSet();let signature='',treeSnapshot=[];
  function geometry(p,uv,index,colors){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));if(colors)g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setIndex(index);g.computeVertexNormals();return g;}
  function cards(cover=false){const p=[],uv=[],index=[];for(let j=0;j<3;j++){const a=j*Math.PI/3,c=Math.cos(a),s=Math.sin(a),i=p.length/3;p.push(-c*.5,0,-s*.5,c*.5,0,s*.5,c*.5,1,s*.5,-c*.5,1,-s*.5);uv.push(0,0,1,0,1,1,0,1);index.push(i,i+1,i+2,i,i+2,i+3);}if(cover){
    // One upright fern and one horizontal trefoil carpet use a single atlas.
    return geometry([-.5,0,0,.5,0,0,.5,1,0,-.5,1,0,-.58,.045,-.55,.58,.045,-.55,.58,.045,.55,-.58,.045,.55],[0,0,.5,0,.5,1,0,1,.5,0,1,0,1,1,.5,1],[0,1,2,0,2,3,4,6,5,4,7,6]);
   }return geometry(p,uv,index);}
  function painted(paint){const canvas=document.createElement('canvas');canvas.width=canvas.height=256;paint(canvas.getContext('2d'));const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;return map;}
  const tuftMap=painted(ctx=>{const rand=randomFor(81,49);for(let i=0;i<8;i++){const base=70+rand()*116,tip=16+rand()*220,top=12+rand()*115,w=8+rand()*9;ctx.fillStyle=['#c2c6a8','#e1e4c8','#f0f0d5','#b1bc97'][i%4];ctx.beginPath();ctx.moveTo(base-w,256);ctx.bezierCurveTo(base-w,165,tip-w,top+50,tip,top);ctx.bezierCurveTo(tip+w*.3,top+58,base+w,184,base+w,256);ctx.fill();ctx.strokeStyle='rgba(250,255,212,.35)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(base,251);ctx.quadraticCurveTo(base,164,tip,top+9);ctx.stroke();}});
  const coverMap=painted(ctx=>{
   ctx.strokeStyle='#dbe0c4';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(60,251);ctx.quadraticCurveTo(75,145,60,18);ctx.stroke();
   for(let i=0;i<10;i++)for(const side of [-1,1]){const y=233-i*20,w=26*Math.sin((i+1)/12*Math.PI)+3;ctx.fillStyle=i%2?'#e0e5c9':'#b3c09a';ctx.beginPath();ctx.ellipse(62+side*w*.52,y-5,w*.6,4.8,-side*.55,0,Math.PI*2);ctx.fill();}
   for(let i=0;i<5;i++){const x=158+(i*31%67),y=40+(i*53%160);for(let j=0;j<3;j++){const a=j*2.094;ctx.fillStyle=['#becba3','#e1e7c7','#afc292'][j];ctx.beginPath();ctx.ellipse(x+Math.cos(a)*12,y+Math.sin(a)*12,12,10,a,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#91a47d';ctx.beginPath();ctx.ellipse(x,y,3,3,0,0,Math.PI*2);ctx.fill();}
  });
  const grassMaterial=new T.MeshStandardMaterial({color:'#ffffff',map:tuftMap,roughness:1,side:T.DoubleSide,alphaTest:.44}),coverMaterial=new T.MeshStandardMaterial({color:'#ffffff',map:coverMap,roughness:1,side:T.DoubleSide,alphaTest:.44});
  grassMaterial.name='meadow:multi-blade-tufts';coverMaterial.name='meadow:fern-and-clover';
  const petalGeo=geometry([0,0,0,-.28,.5,.09,.28,.5,.09,0,1,.22,-.009,0,-1,.009,0,-1,.009,0,0,-.009,0,0,0,0,-.48,.15,.05,-.30,0,.02,-.34],[.5,0,0,.5,1,.5,.5,1,.5,.1,.5,.1,.5,.9,.5,.9,.5,.3,.5,.5,.5,.5],[0,2,1,1,2,3,4,5,6,4,6,7,8,9,10],[1,1,1,1,1,1,1,1,1,1,1,1,.20,.42,.12,.20,.42,.12,.20,.42,.12,.20,.42,.12,.28,.48,.16,.28,.48,.16,.28,.48,.16]);
  const petalMaterial=owner.materials.petal.clone();petalMaterial.vertexColors=true;petalMaterial.side=T.DoubleSide;
  const smallSphere=new T.IcosahedronGeometry(1,0),barkGeo=new T.CylinderGeometry(.64,1,1,8),pollen=owner.pbr.pollen||owner.materials.honey;
  const canopyMap=painted(ctx=>{ctx.fillStyle='#ddddcf';ctx.fillRect(0,0,256,256);const rand=randomFor(27,91);for(let i=0;i<1100;i++){ctx.fillStyle=['#b2bba3','#eeeeD8','#cbd2b9','#f1f1de'][i%4];ctx.beginPath();ctx.ellipse(rand()*256,rand()*256,2+rand()*6,1+rand()*3,rand()*6.28,0,Math.PI*2);ctx.fill();}});
  canopyMap.wrapS=canopyMap.wrapT=T.RepeatWrapping;canopyMap.repeat.set(2,2);
  const canopyMaterial=new T.MeshStandardMaterial({color:'#ffffff',map:canopyMap,roughness:.97,side:T.DoubleSide});
  const barkMaterial=new T.MeshStandardMaterial({color:'#ffffff',roughness:1,map:painted(ctx=>{ctx.fillStyle='#e4e1d7';ctx.fillRect(0,0,256,256);const rand=randomFor(91,23);for(let i=0;i<130;i++){ctx.fillStyle=i%3?'#858278':'#3f443b';ctx.fillRect(rand()*256,rand()*256,3+rand()*26,1+rand()*4);}})});
  // Each species is one shared merged crown. Wide branching oak, narrow birch,
  // separated pine tiers and hanging willow fans retain their own silhouettes.
  function crown(species){const p=[],uv=[],index=[];
   function loft(x,y,z,rx,ry,rz,rings,seed,segments=7){const start=p.length/3;for(let row=0;row<rings.length;row++){const [h,r]=rings[row];for(let col=0;col<segments;col++){const a=col/segments*Math.PI*2+.17*row,wobble=1+.10*Math.sin(col*2.1+seed+row*.6);p.push(x+Math.cos(a)*rx*r*wobble,y+h*ry,z+Math.sin(a)*rz*r*wobble);uv.push(col/segments,row/(rings.length-1));}}for(let row=0;row<rings.length-1;row++)for(let col=0;col<segments;col++){const a=start+row*segments+col,b=start+row*segments+(col+1)%segments,c=a+segments,d=b+segments;index.push(a,b,c,c,b,d);}}
   const lobe=(x,y,z,rx,ry,rz,seed)=>loft(x,y,z,rx,ry,rz,[[-1,0],[-.4,.9],[.38,1],[1,0]],seed,7);
   if(species!=='pine')for(const args of crownLobes[species])lobe(...args);
   if(species==='pine'){
    for(let j=0;j<5;j++){const r=2.25-j*.37;loft(Math.sin(j*2.3)*.12,2.0+j*1.07,Math.cos(j*2.3)*.10,r,1.92,r*.9,[[0,1],[.18,.80],[1,0]],j,10);}
   }else if(species==='willow'){
    for(let j=0;j<11;j++)for(let strand=0;strand<3;strand++){const a=j*Math.PI*2/11+strand*.09,co=Math.cos(a),si=Math.sin(a),tanX=-si,tanZ=co,length=2.5+(j%3)*.30+strand*.12,baseY=5.4+(j%2)*.25,start=p.length/3;
     for(let row=0;row<4;row++){const t=row/3,r=1.6+Math.sin(t*Math.PI*.72)*1.25,w=(.19+strand*.025)*(1-t*.85),h=baseY-t*length;for(const side of [-1,1]){p.push(co*r+tanX*w*side,h,si*r+tanZ*w*side);uv.push((side+1)/2,t);}}
     for(let row=0;row<3;row++){const a=start+row*2;index.push(a,a+1,a+2,a+2,a+1,a+3);}
    }
   }const g=geometry(p,uv,index);g.userData={species,silhouette:true};return g;
  }
  function mesh(geometry,material,count,kind){const m=new T.InstancedMesh(geometry,material,count);m.count=0;m.castShadow=kind==='trees'||kind==='bark';m.receiveShadow=kind!=='trees';m.userData.worldAnchored=true;scene.add(m);const record={mesh:m,kind,center:new T.Vector3(),worldAnchored:true};records.push(record);owner.decorChunks.push(record);return m;}
  const tuftGeo=cards(),coverGeo=cards(true);
  for(let i=0;i<49;i++)slots.push({key:'',grass:mesh(tuftGeo,grassMaterial,900,'grass'),clover:mesh(coverGeo,coverMaterial,450,'clover'),petal:mesh(petalGeo,petalMaterial,1050,'petal'),center:mesh(smallSphere,pollen,210,'centers')});
  const bark=mesh(barkGeo,barkMaterial,392,'bark'),canopies=Object.fromEntries(speciesNames.map(name=>{const m=mesh(crown(name),canopyMaterial,98,'trees');m.name='forest:'+name;m.userData.species=name;return[name,m];})),canopy=canopies.oak;
  function set(m,i,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0,c){matrix.position.set(x,y,z);matrix.rotation.set(rx,ry,rz);matrix.scale.set(sx,sy,sz);matrix.updateMatrix();m.setMatrixAt(i,matrix.matrix);if(c)m.setColorAt(i,color.set(c));}
  function flush(m,n){m.count=n;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.computeBoundingSphere();const rec=records.find(r=>r.mesh===m);rec.center.copy(m.boundingSphere?.center||new T.Vector3());}
  function fade(material,end){if(faded.has(material))return;faded.add(material);const previous=material.onBeforeCompile;material.onBeforeCompile=shader=>{previous?.(shader);shader.vertexShader='varying vec3 vGardenPosition;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>\nvec4 gardenVertex=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\ngardenVertex=instanceMatrix*gardenVertex;\n#endif\nvGardenPosition=(modelMatrix*gardenVertex).xyz;`);shader.fragmentShader='varying vec3 vGardenPosition;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>',`float gardenFade=1.0-smoothstep(${end-8}.0,${end}.0,distance(cameraPosition.xz,vGardenPosition.xz));\nfloat gardenNoise=fract(sin(dot(floor(vGardenPosition.xz*70.0),vec2(12.9898,78.233)))*43758.5453);\nif(gardenFade<gardenNoise)discard;\n#include <dithering_fragment>`);};material.customProgramCacheKey=()=>`garden-cell-fade-${end}`;material.needsUpdate=true;}
  function fill(slot,cx,cz,homes){const rand=randomFor(cx,cz),gx=cx*cellSize,gz=cz*cellSize,soft=owner.quality==='software';let g=0,c=0,p=0,n=0;
   for(let i=0;i<900;i++){
    // Always consume exactly six values, including candidates inside new homes.
    const x=gx+rand()*cellSize,z=gz+rand()*cellSize,height=.19+rand()*.33,angle=rand()*Math.PI*2,width=.55+rand()*.7,flowerHeight=.17+rand()*.22;
    const clearance=homes.reduce((d,h)=>Math.min(d,Math.hypot(x-h.x,z-h.z)),Infinity);if(clearance<1.6)continue;
    const growth=growthAt(x,z),spread=Math.min(width*(1.25+growth*1.5),Math.max(.08,(clearance-1.5)*1.8)),h=height*(.85+growth*1.5);
    if(!soft||hash(x,z,33)%100<45)set(slot.grass,g++,x,.004,z,spread,h,spread,0,angle,0,owner.pbr.palette.grass[hash(Math.floor(x/3),Math.floor(z/3),9)%owner.pbr.palette.grass.length]);
    if(i%6===0&&(!soft||hash(x,z,41)%100<45))for(let j=0;j<3;j++){const a=angle+j*2.094,r=.08+j*.045;set(slot.clover,c++,x+Math.cos(a)*r,.012,z+Math.sin(a)*r,.27+growth*.28,.18+growth*.30,.27+growth*.28,0,a,0,['#789459','#8fa966','#a0b979'][hash(x,z,7)%3]);}
    if(i%13===0&&(!soft||hash(x,z,61)%100<55))for(let bloom=0;bloom<3;bloom++){
     const seed=hash(x,z,81+bloom),a=angle+bloom*2.39,r=bloom===0?0:.17+(seed%41)/100,fx=x+Math.cos(a)*r,fz=z+Math.sin(a)*r;
     if(homes.some(home=>Math.hypot(fx-home.x,fz-home.z)<1.6))continue;
     const flowerH=flowerHeight*(1.1+growth*1.2)+(seed%19)/100,col=owner.pbr.palette.flowers[hash(Math.floor(x/4),Math.floor(z/4),24)%owner.pbr.palette.flowers.length],size=.17+(seed%11)/100;
     for(let j=0;j<5;j++)set(slot.petal,p++,fx,flowerH,fz,size,size,flowerH,-Math.PI/2,angle+j*Math.PI*.4,0,col);set(slot.center,n++,fx,flowerH+.014,fz,.036,.024,.036);
    }
   }
   for(const [m,count]of [[slot.grass,g],[slot.clover,c],[slot.petal,p],[slot.center,n]])flush(m,count);slot.key=cx+','+cz;slot.cx=cx;slot.cz=cz;
  }
  function forest(cells){let b=0;const counts={oak:0,birch:0,pine:0,willow:0};treeSnapshot=[];const forestScale=owner._forestScale||1;
   for(const [cx,cz]of cells)for(const tree of treesInCell(cx,cz)){
    if((owner.houses||[]).some(h=>Math.hypot(tree.x-h.home.x,tree.z-h.home.z)<4))continue;
    const s=tree.scale,name=tree.species,birch=name==='birch',pine=name==='pine',structure=treeStructure(tree),index=counts[name]++;
    treeSnapshot.push({...tree,trunkIndex:b,canopyIndex:index});set(bark,b++,tree.x,structure.height*.5,tree.z,structure.trunkRadius,structure.height,structure.trunkRadius,0,tree.angle,0,birch?'#fffdf0':pine?'#7b6c50':'#84704e');
    for(const branch of structure.branches)set(bark,b++,branch.x,branch.y,branch.z,branch.radius,branch.length,branch.radius,branch.rx,0,branch.rz,birch?'#e8e5cf':'#887351');
    const tint={oak:['#64834b','#78934f','#839a58'],birch:['#8fa65b','#a7b56c','#93a859'],pine:['#456d4d','#557d57','#3e684b'],willow:['#83995b','#93a965','#758e55']}[name][hash(tree.x,tree.z,111)%3];
    set(canopies[name],index,tree.x,0,tree.z,s*forestScale,s,s*forestScale,0,tree.angle,0,tint);
   }
   flush(bark,b);for(const name of speciesNames)flush(canopies[name],counts[name]);owner.meadowCounts.trees=treeSnapshot.length;owner.meadowCounts.treeSpecies=counts;owner.meadowCounts.canopyLeaves=treeSnapshot.length;
  }
  function update(local,force=false){const cx=Math.floor(local.x/cellSize),cz=Math.floor(local.z/cellSize),homes=(owner.houses||[]).map(h=>h.home);if(!homes.length)homes.push({x:0,z:6});const next=cx+','+cz+'|'+owner.biome+'|'+owner.quality+'|'+homes.map(h=>h.x+','+h.z).join(';');if(force||next!==signature){const cells=[];for(let x=cx-radius;x<=cx+radius;x++)for(let z=cz-radius;z<=cz+radius;z++)cells.push([x,z]);const need=new Set(cells.map(([x,z])=>x+','+z)),free=slots.filter(s=>!need.has(s.key));for(const [x,z]of cells){const key=x+','+z;let slot=slots.find(s=>s.key===key);if(!slot)slot=free.pop();if(force||next.split('|').slice(2).join('|')!==signature.split('|').slice(2).join('|')||slot.key!==key)fill(slot,x,z,homes);}forest(cells);signature=next;owner.renderer.shadowMap.needsUpdate=true;}
   for(const slot of slots){const dx=Math.max(slot.cx*cellSize-local.x,0,local.x-(slot.cx+1)*cellSize),dz=Math.max(slot.cz*cellSize-local.z,0,local.z-(slot.cz+1)*cellSize),distance=Math.hypot(dx,dz);slot.grass.visible=slot.clover.visible=distance<34;slot.petal.visible=slot.center.visible=distance<50;fade(slot.grass.material,32);fade(slot.clover.material,32);fade(slot.petal.material,48);fade(slot.center.material,48);}
  }
  return{update,snapshot:()=>treeSnapshot.map(t=>({...t})),slots,records,bark,canopy,canopies};
 }
 return{hash,flowerStyle,treesInCell,perchAt,treeCollidersNear,growthAt,speciesSpecs,cellSize,create};
})();
if(typeof module!=='undefined')module.exports=globalThis.GardenVegetation;
