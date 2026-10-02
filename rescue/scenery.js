import * as THREE from 'three';
import { createAsset, createMaterials } from './materials.js';
import { createBoss } from './models.js';

export const THEMES={
 street:{sky:'#b5d5d3',fog:'#b5d5d3',surface:'#b59375',accent:'#779c9a'},
 tree:{sky:'#a8cdc4',fog:'#adcbb3',surface:'#a47a48',accent:'#6d9556'},
 kitchen:{sky:'#e1c7aa',fog:'#d7c4b1',surface:'#aa7450',accent:'#81aaa2'},
 study:{sky:'#beb8c2',fog:'#cbc1b6',surface:'#a48161',accent:'#987886'},
 toys:{sky:'#bfb9d2',fog:'#c8bfd1',surface:'#b78c74',accent:'#888db8'},
 river:{sky:'#b2d6d1',fog:'#bad9d1',surface:'#a78460',accent:'#6ba69a'},
 factory:{sky:'#a7b6b8',fog:'#aebabc',surface:'#7f979a',accent:'#c79d57'},
 casino:{sky:'#8e879e',fog:'#a7a0b1',surface:'#b1816f',accent:'#cfb571'},
 sewer:{sky:'#829b9c',fog:'#a1b7b0',surface:'#7e9ba1',accent:'#b78660'},
 office:{sky:'#c0cdd0',fog:'#c0cbcb',surface:'#a48c76',accent:'#6d9baa'},
 fatcat:{sky:'#93949e',fog:'#a2a1aa',surface:'#819194',accent:'#b4756c'},
 bonus:{sky:'#c3b2cc',fog:'#c8b7ce',surface:'#d0a875',accent:'#efc86d'}
};
const WOOD='#a57547',METAL='#a9bbc0',DARK='#485b65',GOLD='#d9b664';
function instances(a,type,color,items,kind='plain',name='repeated-detail'){
 if(!items.length)return;const mesh=new THREE.InstancedMesh(a.pool.geometry(type),a.pool.material(kind,color),items.length),dummy=new THREE.Object3D();mesh.name=name;
 for(const [i,v] of items.entries()){dummy.position.set(...v.p);dummy.scale.set(...v.s);dummy.rotation.set(0,0,v.r??0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}mesh.castShadow=true;mesh.receiveShadow=true;mesh.instanceMatrix.needsUpdate=true;a.group.add(mesh);return mesh;
}
function repeated(n,fn){return Array.from({length:n},(_,i)=>fn(i));}
export function createDecor(d,pool,theme='street'){
 const a=createAsset(pool,`decor:${d.id??d.kind}`),{part,group}=a;group.userData.kind=d.kind;
 const box=(color,s,p,name,kind='plain')=>part('round',color,s,p,name,group,kind);
 const cylinder=(color,s,p,name,kind='metal')=>part('cylinder',color,s,p,name,group,kind);
 const sphere=(color,s,p,name,kind='plain')=>part('sphere',color,s,p,name,group,kind);
 const rail=(color=WOOD)=>{for(const y of [.27,.72])box(color,[1,.065,.09],[0,y,.05],'cross-rail','wood');instances(a,'round',color,repeated(Math.max(5,Math.min(30,Math.round(d.w??10))),i=>({p:[-.48+i/(Math.max(5,Math.min(30,Math.round(d.w??10)))-1)*.96,.5,.01],s:[.025,.98,.11]})),'wood','fence-pickets');};
 const pipe=()=>{const horizontal=(d.w??1)>(d.h??1);cylinder(theme==='sewer'?'#b8794a':METAL,horizontal?[.20,1,.20]:[.72,1,.65],[0,.5,0],'pipe').rotation.z=horizontal?Math.PI/2:0;for(const v of [-.4,.4]){const ring=part('torus',theme==='sewer'?'#c89968':'#6e8790',horizontal?[.3,.3,.25]:[.87,.87,.35],horizontal?[v,.5,0]:[0,.5+v,0],'pipe-collar',group,'metal');ring.rotation.y=horizontal?Math.PI/2:0;ring.rotation.x=horizontal?0:Math.PI/2;}};
 const cabinet=(color=WOOD)=>{box(color,[1,.94,.46],[0,.48,0],'cabinet','wood');box('#4d4d4b',[.91,.82,.025],[0,.5,.25],'interior');for(const y of [.11,.38,.65,.92])box(color,[1,.045,.58],[0,y,.025],'shelf','wood');};
 const table=(color=WOOD)=>{box(color,[1,.12,.7],[0,.91,0],'table-top','wood');for(const x of [-.4,.4])box(color,[.055,.9,.12],[x,.45,0],'table-leg','wood');};
 switch(d.kind){
 case 'fence':rail();break;
 case 'planter':cylinder('#b27558',[.84,.56,.73],[0,.28,0],'terracotta','plain');cylinder('#ce9370',[1,.13,.83],[0,.55,0],'pot-rim','plain');cylinder('#5f503b',[.82,.04,.70],[0,.60,0],'soil','plain');instances(a,'sphere','#759357',repeated(11,i=>({p:[Math.sin(i*2.4)*.30,.7+(i%3)*.08,Math.cos(i*2.4)*.2],s:[.35,.35,.18],r:i})),'leaf','leaves');break;
 case 'trash':cylinder('#8ca3a5',[.90,.88,.83],[0,.44,0],'trash-can');cylinder('#b7c7c2',[1,.1,.91],[0,.93,0],'lid');instances(a,'round',METAL,repeated(9,i=>({p:[-.39+i*.097,.45,.38],s:[.025,.72,.035]})),'metal','can-ribs');box(DARK,[.23,.08,.1],[0,1,.05],'lid-handle');break;
 case 'pole':cylinder(WOOD,[.7,1,.65],[0,.5,0],'wood-pole','wood');for(const y of [.48,.83,.94]){box('#675441',[1.9,.025,.12],[0,y,0],'crossarm','wood');instances(a,'cylinder','#c9d9d6',[-.75,-.4,.4,.75].map(x=>({p:[x,y+.025,0],s:[.15,.055,.15]})),'plain','insulators');}break;
 case 'building':case 'lab':case 'tileWall':case 'brickWall':case 'brick':{
 const lab=d.kind==='lab',tile=d.kind==='tileWall';box(tile?'#d4ac84':lab?'#92aeb0':theme==='sewer'?'#69909a':'#b88f79',[1,1,.35],[0,.5,-.25],'masonry',tile?'tile':'brick');
 if(d.kind==='building'||lab){const n=Math.min(18,Math.max(4,Math.round((d.w??20)/4)));instances(a,'round',lab?'#638c94':'#6c8a91',repeated(n,i=>({p:[-.45+i/(n-1)*.9,.63,.0],s:[.7/n,.4,.045]})),'metal','windows');instances(a,'box','#d2c7a7',repeated(n,i=>({p:[-.45+i/(n-1)*.9,.44,.025],s:[.8/n,.025,.07]})),'plain','sills');box('#d3c6ae',[1.04,.08,.5],[0,.96,0],'cornice');}break;}
 case 'satellite':{const dish=sphere('#c9d4d1',[.86,.18,.74],[0,.64,0],'dish','metal');dish.rotation.z=-.35;box(DARK,[.07,.63,.08],[0,.31,0],'antenna-stem');cylinder(METAL,[.04,.5,.04],[.10,.8,.14],'receiver').rotation.z=-.6;break;}
 case 'testTubes':box(WOOD,[1,.06,.49],[0,.1,0],'tube-rack','wood');box(WOOD,[1,.05,.44],[0,.47,0],'tube-rack','wood');for(let i=0;i<5;i++){const x=-.4+i*.2;cylinder(['#89bca4','#dba66d','#a692c1'][i%3],[.12,.68,.12],[x,.59,0],'tube','plain');cylinder('#e0ece0',[.14,.035,.14],[x,.95,0],'tube-lip');}break;
 case 'pencil':cylinder('#edbd5f',[.7,.82,.7],[-.07,.5,0],'pencil','wood').rotation.z=Math.PI/2;part('cone','#e4c89a',[.7,.18,.7],[.43,.5,0],'pencil-tip').rotation.z=-Math.PI/2;box('#c77f83',[.1,.67,.65],[-.48,.5,0],'eraser');break;
 case 'trunk':cylinder('#a57a4c',[.93,1,.8],[0,.5,0],'tree-trunk','wood');instances(a,'sphere','#785739',repeated(12,i=>({p:[Math.sin(i*2)*.3,.05+i*.081,.32],s:[.11,.14,.045],r:.35})),'wood','bark-knots');break;
 case 'treeHole':sphere('#514734',[.78,.84,.22],[0,.5,0],'tree-hole');part('torus','#9e7446',[.98,1.14,.37],[0,.5,.02],'hole-rim',group,'wood');break;
 case 'tree':cylinder(WOOD,[.16,.78,.14],[0,.38,0],'trunk','wood');
 // Fall through: a tree includes a distinct leaf canopy.
 case 'leaves':instances(a,'sphere','#71935c',repeated(26,i=>({p:[Math.sin(i*2.399)*(.12+(i%5)*.075),.5+Math.cos(i*1.7)*.26,Math.sin(i*.9)*.2],s:[.30,.44,.18],r:i*.4})),'leaf','leaf-canopy');break;
 case 'counter':case 'bar':cabinet('#a9845f');box('#d7c4a2',[1.04,.12,.69],[0,1,0],'countertop','wood');break;
 case 'stool':cylinder('#a77858',[.86,.13,.75],[0,.93,0],'stool-seat','wood');for(const x of [-.30,.30])box('#8d6d50',[.10,.87,.12],[x,.44,0],'stool-leg','wood');box('#b08b66',[.7,.07,.13],[0,.36,0],'footrest','wood');break;
 case 'bottle':cylinder('#65958b',[.58,.69,.5],[0,.34,0],'bottle-body','plain');cylinder('#73a599',[.23,.34,.21],[0,.83,0],'bottle-neck','plain');cylinder('#c5ad79',[.26,.08,.24],[0,1,0],'bottle-cap');box('#ead7b1',[.54,.26,.035],[0,.40,.255],'label','fabric');break;
 case 'sink':box(METAL,[1,.16,.83],[0,.93,0],'sink-rim','metal');box('#657b84',[.82,.46,.62],[0,.67,0],'sink-basin','metal');for(const x of [-.47,.47])box(METAL,[.06,.52,.82],[x,.68,0],'sink-side','metal');cylinder(METAL,[.08,.57,.08],[.25,.28,0],'sink-drain');break;
 case 'faucet':cylinder(METAL,[.15,.82,.15],[.23,.41,0],'faucet-stem');cylinder(METAL,[.16,.6,.16],[0,.85,0],'faucet-spout').rotation.z=Math.PI/2;cylinder(METAL,[.17,.21,.17],[-.3,.77,0],'nozzle');part('torus','#a6b9ba',[.4,.4,.2],[.23,.38,.14],'tap-wheel',group,'metal');break;
 case 'stove':box('#d6c9ad',[1,.85,.56],[0,.43,0],'oven');box(DARK,[.70,.50,.04],[0,.37,.30],'oven-window');box(METAL,[1.04,.06,.62],[0,.90,0],'stovetop','metal');for(const x of [-.25,.25])part('torus',DARK,[.35,.35,.2],[x,.95,0],'burner').rotation.x=Math.PI/2;for(const x of [-.34,0,.34])cylinder(DARK,[.1,.05,.1],[x,.75,.32],'knob').rotation.x=Math.PI/2;break;
 case 'drain':box(DARK,[1,.9,.24],[0,.5,0],'grille');instances(a,'round',METAL,repeated(14,i=>({p:[-.46+i*.071,.5,.15],s:[.028,.85,.07]})),'metal','drain-bars');break;
 case 'bookshelf':cabinet();instances(a,'round','#98a9a1',repeated(33,i=>({p:[-.43+(i%11)*.085,.22+Math.floor(i/11)*.27,.12],s:[.045,.18+(i%3)*.02,.18],r:(i%5-2)*.025})),'fabric','book-spines');instances(a,'round','#b28370',repeated(12,i=>({p:[-.36+(i%4)*.23,.24+Math.floor(i/4)*.27,.15],s:[.05,.22,.2]})),'fabric','red-books');break;
 case 'books':for(let i=0;i<5;i++){box(['#a86460','#759899','#b9a575','#8588a2'][i%4],[.9-i*.07,.13,.56],[(i%2)*.025,.1+i*.18,0],'book-cover','fabric');box('#e4d6b9',[.83-i*.07,.075,.51],[(i%2)*.025,.17+i*.18,.02],'pages');}break;
 case 'desk':case 'table':table();if(d.kind==='desk')for(const x of [-.31,.31]){box('#886d54',[.23,.7,.45],[x,.42,-.04],'drawer-unit','wood');for(const y of [.2,.42,.64])box(GOLD,[.10,.025,.04],[x,y,.2],'drawer-handle','metal');}break;
 case 'fan':cylinder(METAL,[.07,.55,.07],[0,.75,0],'fan-stem');sphere('#bcbca7',[.21,.18,.21],[0,.47,0],'fan-hub','metal');for(let i=0;i<4;i++){const r=i*Math.PI/2;const blade=box('#b29465',[.40,.065,.17],[Math.cos(r)*.27,.47+Math.sin(r)*.2,0],'fan-blade','wood');blade.rotation.z=r;}break;
 case 'lamp':cylinder(GOLD,[.07,.75,.07],[0,.39,0],'lamp-stem');part('cone','#e3c995',[.8,.36,.65],[0,.87,0],'shade',group,'fabric');cylinder(GOLD,[.42,.06,.35],[0,.04,0],'lamp-base');break;
 case 'toyBox':case 'gift':case 'catBox':case 'shippingCrates':{const color=d.kind==='gift'?'#a37aa8':d.kind==='toyBox'?'#799fa5':'#ba9064';box(color,[1,.94,.6],[0,.47,0],'box','wood');box('#e5c88c',[.10,.98,.04],[0,.5,.325],'ribbon');box('#e5c88c',[1,.1,.05],[0,.6,.33],'ribbon');if(d.kind==='gift'){for(const s of [-1,1])part('torus',GOLD,[.35,.28,.14],[s*.15,1,.0],'bow').rotation.z=s*.4;}else if(d.kind==='toyBox'){part('star','#edcc83',[.36,.36,.6],[.24,.5,.35],'star-logo');}else instances(a,'box','#966b44',repeated(5,i=>({p:[-.4+i*.2,.5,.32],s:[.015,.85,.04]})),'wood','crate-planks');break;}
 case 'toyRobot':{const robot=createBoss('toyRobot',a.pool);group.add(robot.group);robot.group.scale.set(1,1,.7);break;}
 case 'conveyor':box(DARK,[1,.5,.56],[0,.4,0],'conveyor-bed','metal');instances(a,'cylinder',METAL,repeated(Math.min(32,Math.max(8,Math.round(d.w??8))),i=>({p:[-.46+i/(Math.min(32,Math.max(8,Math.round(d.w??8)))-1)*.92,.60,.28],s:[.025,.42,.025],r:Math.PI/2})),'metal','rollers');break;
 case 'stairs':for(let i=0;i<5;i++)box('#9990b3',[.21,(i+1)*.19,.5],[-.4+i*.2,(i+1)*.095,0],'step','wood');break;
 case 'pipe':case 'duct':pipe();break;
 case 'sluice':case 'gate':box('#849d94',[1,.11,.6],[0,.96,0],'bridge-top','metal');for(const x of [-.40,.40])box('#86938b',[.15,.91,.35],[x,.46,0],'pier','brick');instances(a,'box',METAL,repeated(9,i=>({p:[-.34+i*.085,.53,.05],s:[.035,.72,.10]})),'metal','sluice-bars');break;
 case 'water':box(theme==='sewer'?'#719d80':'#6ca9ad',[1,.12,1],[0,.12,0],'water','plain');instances(a,'sphere','#bcdfd7',repeated(12,i=>({p:[-.46+i*.083,.2,(i%3)*.14-.2],s:[.035,.013,.16]})),'plain','ripples');break;
 case 'pump':case 'machine':box('#809b92',[.9,.72,.56],[0,.37,0],'pump-body','metal');part('torus',GOLD,[.46,.46,.25],[0,.59,.32],'wheel',group,'metal');for(const r of [0,Math.PI/2])box(METAL,[.035,.39,.05],[0,.59,.35],'wheel-spoke','metal').rotation.z=r;cylinder(METAL,[.12,.4,.12],[.31,.85,0],'outlet');break;
 case 'piston':case 'press':box(DARK,[1,.17,.52],[0,.9,0],'press-housing','metal');cylinder(METAL,[.19,.62,.19],[0,.54,0],'hydraulic-ram');box('#b69c70',[.8,.14,.6],[0,.22,0],'press-head','metal');break;
 case 'warning':box('#e5bd63',[1,.9,.10],[0,.5,0],'warning-panel');instances(a,'box',DARK,repeated(7,i=>({p:[-.45+i*.15,.5,.07],s:[.06,.8,.025],r:-.3})),'plain','warning-stripes');break;
 case 'slotMachine':box('#ad7752',[.84,.9,.54],[0,.48,0],'slot-case','wood');box(GOLD,[.78,.48,.07],[0,.65,.30],'slot-frame','metal');box('#433e51',[.69,.37,.05],[0,.65,.35],'slot-window');for(const x of [-.23,0,.23]){box('#e4d7b6',[.19,.28,.03],[x,.65,.39],'reel');part('star',x===0?'#bfa444':'#b65f57',[.13,.13,.2],[x,.65,.42],'reel-symbol');}box('#728c8e',[.63,.14,.18],[0,.28,.3],'payout');cylinder(METAL,[.045,.41,.045],[.48,.59,0],'slot-lever');sphere('#b96659',[.14,.13,.13],[.48,.84,0],'lever-knob');break;
 case 'restaurantDoor':box('#9a7159',[1,1,.2],[0,.5,0],'door-frame','wood');box('#546f70',[.80,.86,.08],[0,.5,.14],'door');part('torus',GOLD,[.23,.30,.2],[.24,.45,.23],'door-handle',group,'metal');break;
 case 'curtain':instances(a,'cylinder',theme==='fatcat'?'#927382':'#777d9c',repeated(28,i=>({p:[-.48+i*.0355,.5,0],s:[.055,1,.18]})),'fabric','curtain-folds');box(GOLD,[1.06,.045,.11],[0,1,.06],'curtain-rail','metal');break;
 case 'chandelier':cylinder(GOLD,[.035,.6,.035],[0,.73,0],'chain');part('torus',GOLD,[.85,.49,.3],[0,.40,0],'chandelier-ring',group,'metal');for(const x of [-.36,-.18,.18,.36]){cylinder(GOLD,[.04,.3,.04],[x,.37,.02],'candle-holder');sphere('#f9deb1',[.15,.22,.14],[x,.55,.03],'lamp');}break;
 case 'cans':for(let i=0;i<6;i++){const row=i<3?0:i<5?1:2,x=row===0?-.32+i*.32:row===1?-.16+(i-3)*.32:0;cylinder(['#a5b7a3','#b79d77','#87a5a9'][i%3],[.29,.30,.29],[x,.15+row*.31,0],'tin');cylinder(METAL,[.30,.025,.30],[x,.31+row*.31,0],'lid');}break;
 case 'phone':box('#659bac',[.91,.38,.65],[0,.21,0],'telephone-base');const receiver=box('#83b5c0',[.95,.16,.27],[0,.68,0],'receiver');for(const x of [-.37,.37])sphere('#79abb8',[.24,.32,.32],[x,.58,0],'earpiece');instances(a,'round','#e4dfc7',repeated(12,i=>({p:[-.2+(i%3)*.2,.21+Math.floor(i/3)*.09,.345],s:[.12,.05,.025]})),'plain','phone-buttons');instances(a,'torus',DARK,repeated(15,i=>({p:[.48,.2+i*.033,0],s:[.12,.06,.12]})),'plain','coiled-cord');receiver.rotation.z=-.03;break;
 case 'drawers':box('#849ca2',[1,.98,.55],[0,.5,0],'filing-cabinet','metal');for(let i=0;i<4;i++){box('#a3b5b3',[.91,.21,.05],[0,.14+i*.24,.30],'drawer','metal');box(DARK,[.22,.032,.07],[0,.17+i*.24,.34],'handle');box('#dfd3b2',[.24,.045,.02],[0,.10+i*.24,.34],'label');}break;
 default:throw new Error(`Unimplemented scenery: ${d.kind}`);
 }
 group.position.set(d.x,d.y,-2.4);group.scale.set(d.w??1,d.h??1,Math.min(3.6,Math.max(1,(d.w??1)*.3)));return a;
}
export function createScenery(level,pool){const own=!pool;pool??=createMaterials();const group=new THREE.Group();group.name='scenery';const items=(level.decor??[]).map(d=>createDecor(d,pool,level.theme));items.forEach(a=>group.add(a.group));return {group,dispose(){items.forEach(a=>a.dispose());group.clear();group.removeFromParent();if(own)pool.dispose();}};}

// Distant architecture fills the stretches between authored landmarks. It is
// purely visual, behind the gameplay plane, and never creates support surfaces.
export function createBackdrop(level,pool){
 const a=createAsset(pool,'backdrop'),{part}=a;const {width:w,height:h,theme}=level,palette=THEMES[theme]??THEMES.street;
 if(theme==='tree'||theme==='river'){
  const count=Math.ceil(w/12)+2;
  instances(a,'cylinder','#82927a',repeated(count,i=>({p:[i*12-6,h/2,-11-(i%3)*2],s:[3+(i%3),h+10,3]})),'wood','distant-trunks');
  const leaves=[];for(let x=-8;x<w+12;x+=8)for(let y=theme==='river'?6:0;y<h+10;y+=13)for(let k=0;k<3;k++)leaves.push({p:[x+Math.sin(k*2.4)*3,y+Math.cos(k*2)*2,-9-(k%2)*2],s:[8,5,2],r:k*.5});
  instances(a,'sphere','#8ea984',leaves,'leaf','distant-canopies');
  if(theme==='river')part('round','#8bbfc0',[w+20,2,4],[w/2,-1,-8],'distant-river');
 }else if(theme==='street'){
  const count=Math.ceil(w/14)+1;instances(a,'box','#97b4af',repeated(count,i=>({p:[i*14,12+(i%3)*3,-16],s:[11,24+(i%3)*6,2]})),'brick','city-silhouettes');
  const windows=[];for(let i=0;i<count;i++)for(let row=0;row<5;row++)for(let col=0;col<3;col++)windows.push({p:[i*14-3.5+col*3.5,3+row*4,-14.9],s:[1.3,2,.04]});instances(a,'box','#b9cebb',windows,'plain','city-windows');
 }else if(theme==='kitchen'){
  part('box','#c1b69e',[w+20,h+8,.2],[w/2,h/2,-12],'kitchen-wall',a.group,'plain');const tiles=[];for(let x=-8;x<w+10;x+=4)for(let y=-3;y<h+8;y+=3)tiles.push({p:[x,y,-11.8],s:[3.92,2.92,.12]});instances(a,'round','#d2c5aa',tiles,'tile','ceramic-tiles');
 }else if(theme==='casino'||theme==='bonus'){
  const n=Math.ceil(w/.8)+4;instances(a,'cylinder','#8a8da7',repeated(n,i=>({p:[i*.8-1,h/2,-11],s:[1,h+6,.7]})),'fabric','distant-drapes');
  const stars=[];for(let x=0;x<w;x+=5)for(let y=2;y<h;y+=5)stars.push({p:[x,y,-10.4],s:[.6,.6,.2],r:.4});instances(a,'star','#c5b58a',stars,'metal','curtain-stars');
 }else if(theme==='study'||theme==='office'){
  part('box',theme==='study'?'#b5a79d':'#9eafb0',[w+20,h+8,.2],[w/2,h/2,-12],'wallpaper',a.group,'fabric');
  instances(a,'round',theme==='study'?'#c2b298':'#b7c3ba',repeated(Math.ceil(w/2)+8,i=>({p:[i*2-8,h/2,-11.8],s:[.08,h+8,.06]})),'plain','wallpaper-stripes');
  instances(a,'round','#819699',repeated(Math.ceil(w/18),i=>({p:[i*18+8,6,-10.9],s:[6,4,.25]})),'wood','wall-panels');
 }else if(theme==='toys'){
  part('box','#b5acbd',[w+20,h+8,.2],[w/2,h/2,-12],'workshop-wall',a.group,'fabric');const count=Math.ceil(w/9)+2;
  instances(a,'round','#9a9bb9',repeated(count,i=>({p:[i*9-4,4+(i%3)*3,-10],s:[6,8+(i%3)*6,1]})),'fabric','toy-packaging');instances(a,'star','#d6c28f',repeated(count,i=>({p:[i*9-4,5+(i%3)*3,-9.4],s:[2,2,.2]})),'metal','package-stars');
 }else{
  part('box',theme==='sewer'?'#809c99':'#96a8a5',[w+20,h+8,.2],[w/2,h/2,-13],'industrial-wall',a.group,theme==='sewer'?'brick':'metal');
  const n=Math.ceil(w/9)+2;instances(a,'cylinder',theme==='sewer'?'#a68c70':'#839995',repeated(n,i=>({p:[i*9-4,h/2,-10],s:[.75,h+8,.75]})),'metal','distant-pipework');
  const beams=[];for(let y=2;y<h+10;y+=7)beams.push({p:[w/2,y,-11],s:[w+20,.35,.6]});instances(a,'box','#7b9393',beams,'metal','wall-beams');
 }
 // Distant layers receive light but do not consume the foreground shadow budget.
 a.group.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});return a;
}
