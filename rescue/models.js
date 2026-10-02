import { createAsset } from './materials.js';
const GOLD='#e9b952',SILVER='#abbcc2',DARK='#37424c',CREAM='#f5dfae';
function eyes(a,parent,y=.7,spread=.16,size=.12){for(const side of [-1,1]){a.part('sphere','#fff9df',[size,size*1.2,size*.45],[side*spread,y,.29],'eye',parent);a.part('sphere','#242638',[size*.45,size*.65,size*.25],[side*spread+.015,y,.318],'pupil',parent);}}
function legs(a,parent,color,count=2){for(let i=0;i<count;i++){const x=(i-(count-1)/2)*(.65/count);a.part('sphere',color,[.18,.22,.28],[x,.12,.01],'foot',parent);}}
function tracked(a,w=1,h=1){const base=a.update;a.update=(e,t=0)=>{base(e);a.group.scale.set((e.w??w)/w,(e.h??h)/h,1);a.group.rotation.y=(e.facing??1)<0?-.22:.22;};return a;}
export function createCrate(pool,big=false){const a=createAsset(pool,big?'bigcrate':'crate');a.part('round','#bf874e',[.96,.96,.88],[0,.5,0],'wooden-box',a.group,'wood');
 for(const side of [-1,1]){a.part('box','#e2b778',[.12,.94,.08],[side*.37,.5,.47],'frame',a.group,'wood');a.part('box','#e2b778',[.94,.11,.08],[0,.5+side*.37,.47],'frame',a.group,'wood');}
 const brace=a.part('box','#deb078',[.12,1.04,.08],[0,.5,.49],'diagonal-brace',a.group,'wood');brace.rotation.z=-.7;
 for(const x of [-.36,.36])for(const y of [.13,.87])a.part('sphere',DARK,[.045,.045,.025],[x,y,.527],'nail');return tracked(a);}
export function createMetal(pool){const a=createAsset(pool,'metal');a.part('round',SILVER,[.96,.96,.88],[0,.5,0],'metal-box',a.group,'metal');a.part('round',DARK,[.67,.67,.03],[0,.5,.455],'recess');const ring=a.part('torus',SILVER,[.56,.56,.23],[0,.5,.49],'vent-ring',a.group,'metal');for(let i=0;i<5;i++)a.part('box',SILVER,[.46,.045,.06],[0,.34+i*.08,.50],'vent',a.group,'metal');return tracked(a);}
export function createApple(pool){const a=createAsset(pool,'apple');for(const x of [-.14,.14])a.part('sphere','#df483b',[.65,.8,.75],[x,.44,0],'apple-lobe');const stem=a.part('cylinder','#724530',[.06,.23,.06],[0,.88,0],'stem');stem.rotation.z=-.25;const leaf=a.part('sphere','#77a852',[.35,.10,.15],[.15,.90,0],'leaf',a.group,'leaf');leaf.rotation.z=.4;return tracked(a);}
export function createBall(pool){const a=createAsset(pool,'ball');a.part('sphere','#e56337',[.96,.96,.96],[0,.5,0],'ball');for(const r of [0,Math.PI/2]){const ring=a.part('torus','#fff0ac',[1.02,1.02,.09],[0,.5,0],'ball-seam');ring.rotation.y=r;}return tracked(a);}
export function createObject(kind,pool){switch(kind){case 'crate':return createCrate(pool);case 'bigcrate':return createCrate(pool,true);case 'metal':return createMetal(pool);case 'apple':return createApple(pool);case 'ball':return createBall(pool);default:throw new Error(`Unknown object ${kind}`);}}

export function createEnemy(kind,pool){
 const a=kind==='mimic'?createCrate(pool):createAsset(pool,kind),{part,group}=a;group.userData.silhouette=kind;
 switch(kind){
 case 'dog':part('round','#699bb0',[.73,.43,.44],[0,.47,0],'robot-dog-body',group,'metal');part('round',SILVER,[.48,.4,.44],[.24,.71,.02],'head',group,'metal');part('round',DARK,[.26,.15,.28],[.45,.65,.18],'muzzle');for(const s of [-1,1]){part('cone',DARK,[.16,.25,.19],[.15+s*.19,.95,0],'ear');part('cylinder',DARK,[.22,.13,.22],[s*.27,.17,0],'wheel').rotation.x=Math.PI/2;}part('sphere','#ec7856',[.09,.1,.05],[.33,.79,.26],'eye');break;
 case 'bird':case 'pelican':part('sphere',kind==='bird'?'#ab75c0':'#e9e6d4',[.62,.64,.44],[0,.49,0],'bird-body');part('sphere','#eee4c9',[.42,.4,.42],[.12,.78,.07],'bird-head');part('cone','#e9b047',[kind==='pelican'?.57:.3,.25,.19],[.32,.7,.2],'beak').rotation.z=-Math.PI/2;for(const s of [-1,1]){const wing=part('sphere',kind==='bird'?'#77549b':'#a6bcc6',[.42,.2,.19],[s*.35,.53,0],`wing-${s}`);wing.rotation.z=s*.4;}eyes(a,group,.83,.1,.085);legs(a,group,'#dfac52');break;
 case 'caterpillar':for(let i=0;i<4;i++){part('sphere',i===3?'#c4d955':'#73a54d',[.35,.48,.42],[-.33+i*.22,.36,0],`segment-${i}`);part('sphere','#bd7845',[.16,.12,.23],[-.33+i*.22,.08,.1],'foot');}part('sphere','#243428',[.06,.09,.035],[.38,.49,.2],'eye');break;
 case 'mouse':case 'kangaroo':{const color=kind==='mouse'?'#b1a3bf':'#b88763';part('sphere',color,[.52,.64,.4],[0,.45,0],'body');part('sphere',color,[.5,.38,.4],[.1,.78,.03],'head');for(const s of [-1,1])part('sphere','#cfabb4',[.22,kind==='mouse'?.25:.45,.12],[s*.17,.94,-.02],'ear');part('sphere',CREAM,[.36,.20,.20],[.12,.69,.23],'muzzle');part('sphere','#49303a',[.1,.07,.065],[.13,.75,.33],'nose');eyes(a,group,.84,.1,.09);legs(a,group,color);const tail=part('sphere',color,[.58,.12,.12],[-.37,.23,-.1],'tail');tail.rotation.z=.4;break;}
 case 'mimic':eyes(a,group,.63,.2,.13);part('round','#452a30',[.53,.13,.08],[0,.31,.5],'mouth');for(const x of [-.18,0,.18])part('cone','#fff6df',[.08,.11,.06],[x,.33,.55],'tooth').rotation.z=Math.PI;break;
 case 'toy':part('round','#d66556',[.55,.5,.4],[0,.48,0],'body',group,'metal');part('round','#e7ba65',[.52,.34,.43],[0,.85,.02],'head',group,'metal');eyes(a,group,.87,.14,.11);legs(a,group,DARK);for(const s of [-1,1])part('sphere',SILVER,[.16,.39,.18],[s*.36,.50,0],'arm',group,'metal');part('torus',GOLD,[.28,.28,.15],[.4,.65,-.22],'windup-key');break;
 case 'bee':part('sphere','#e8b94d',[.55,.58,.45],[0,.5,0],'bee-body');for(const y of [.36,.54])part('torus',DARK,[.61,.25,.61],[0,y,0],'stripe').rotation.x=Math.PI/2;for(const s of [-1,1])part('sphere','#d5f6f5',[.4,.51,.065],[s*.31,.79,-.04],`wing-${s}`,group,'plain',{transparent:true,opacity:.72});eyes(a,group,.69,.12,.11);break;
 case 'rhino':part('sphere','#909daf',[.87,.67,.55],[0,.47,0],'rhino');part('sphere','#a8b2bc',[.5,.44,.51],[.31,.57,.09],'head');part('cone',CREAM,[.17,.37,.17],[.49,.85,.15],'horn');legs(a,group,'#6d798d',4);part('sphere','#273040',[.065,.09,.04],[.36,.68,.35],'eye');break;
 case 'crab':part('sphere','#ce6147',[.69,.44,.52],[0,.35,0],'shell');for(const s of [-1,1]){part('sphere','#db7454',[.26,.3,.23],[s*.4,.66,.04],'claw');part('cylinder','#d97d53',[.07,.3,.07],[s*.15,.66,.19],'eye-stalk');part('sphere','#202a32',[.1,.12,.1],[s*.15,.82,.2],'eye');}legs(a,group,'#c96046',6);break;
 case 'lizard':part('sphere','#6ba96b',[.8,.43,.35],[0,.4,0],'body');part('sphere','#a3c577',[.4,.33,.38],[.35,.57,.03],'head');part('cone','#559361',[.25,.72,.24],[-.57,.31,-.07],'tail').rotation.z=Math.PI/2;legs(a,group,'#619757',4);part('sphere','#292c2d',[.07,.09,.045],[.38,.63,.22],'eye');break;
 default:throw new Error(`Unknown enemy ${kind}`);
 }
 const base=tracked(a).update;a.update=(e,t=0)=>{base(e,t);for(const s of [-1,1]){const wing=group.getObjectByName(`wing-${s}`);if(wing)wing.rotation.z=s*(.3+Math.sin(t*20)*.6);}if(kind==='mimic'){for(const mesh of group.children)if(['eye','pupil','mouth','tooth'].includes(mesh.name))mesh.visible=e.animation!=='disguise';}};return a;
}

export function createPickup(kind,pool){const a=createAsset(pool,kind),{part,group}=a;
 switch(kind){case 'flower':part('cylinder','#5d914b',[.055,.5,.055],[0,.25,0],'stem');for(let i=0;i<6;i++){const r=i*Math.PI/3;part('sphere','#f2c851',[.25,.25,.14],[Math.cos(r)*.19,.68+Math.sin(r)*.19,0],'petal');}part('sphere','#986539',[.20,.20,.15],[0,.68,.06],'flower-heart');break;case 'star':part('star',GOLD,[.9,.9,1],[0,.5,0],'star',group,'metal',{emissive:'#946626',emissiveIntensity:.22});break;case 'acorn':part('sphere','#b37b43',[.59,.65,.5],[0,.40,0],'acorn');part('sphere','#694b31',[.66,.30,.55],[0,.68,0],'cap',group,'wood');part('cylinder','#61472f',[.09,.19,.09],[0,.88,0],'stem');break;case 'zipper':part('sphere','#4dbca6',[.4,.65,.35],[0,.5,0],'zipper-body');for(const s of [-1,1]){part('sphere','#e8ffff',[.45,.5,.06],[s*.24,.61,-.12],'wing',group,'plain',{transparent:true,opacity:.7});part('sphere','#ffffff',[.23,.3,.12],[s*.1,.77,.12],'eye');part('sphere','#222d3e',[.075,.14,.05],[s*.1,.79,.19],'pupil');}break;default:throw new Error(`Unknown pickup ${kind}`);}
 const base=tracked(a).update;a.update=(e,t=0)=>{base(e,t);group.rotation.y=Math.sin(t*2)*.35;};return a;}
export function createProjectile(kind,pool){
 if(kind==='alien'){const a=createEnemy('mouse',pool);a.group.traverse(o=>{if(o.isMesh&&['body','head','ear'].includes(o.name))o.material=a.pool.material('plain','#9dbb63');});return a;}
 if(kind==='colorBall'){const a=createBall(pool),base=a.update;let shell;a.group.traverse(o=>{if(o.isMesh&&o.name==='ball')shell=o;});a.update=(e,t)=>{base(e,t);shell.material=a.pool.material('plain',({red:'#dc6253',blue:'#649fcb',green:'#92b968'})[e.color]??'#e56337');};return a;}
 if(kind==='segment'){const a=createAsset(pool,'segment');a.part('sphere','#98bd54',[.9,.78,.65],[0,.46,0],'segment-body');for(const x of [-.3,.3])a.part('sphere','#cba277',[.24,.18,.27],[x,.12,.08],'foot');return tracked(a);}
 const a=createAsset(pool,kind),{part,group}=a;
 switch(kind){case 'lightning':case 'spark':for(let i=0;i<4;i++){const m=part('round','#d9f7a2',[.16,.35,.13],[Math.sin(i*2)*.14,.15+i*.22,0],'electric-bolt',group,'plain',{emissive:'#bcff55',emissiveIntensity:1});m.rotation.z=i%2?.7:-.7;}break;
 case 'feather':part('sphere','#d2a873',[.32,.85,.12],[0,.5,0],'feather');part('cylinder','#fff3d5',[.05,.9,.05],[0,.5,.04],'shaft');break;
 case 'token':part('cylinder',GOLD,[.83,.15,.83],[0,.5,0],'coin',group,'metal').rotation.x=Math.PI/2;part('star','#fff2b1',[.43,.43,.5],[0,.5,.1],'coin-star');break;
 case 'ash':part('sphere','#a99889',[.65,.7,.5],[0,.45,0],'ash',group,'plain',{emissive:'#d95b29',emissiveIntensity:.25});for(let i=0;i<3;i++)part('sphere','#ddc3a9',[.32,.32,.28],[Math.sin(i*3)*.2,.65+i*.15,-.1],'smoke');break;
 case 'gear':part('torus',SILVER,[.8,.8,.3],[0,.5,0],'gear',group,'metal');for(let i=0;i<8;i++){const r=i*Math.PI/4,m=part('box',SILVER,[.18,.23,.15],[Math.sin(r)*.4,.5+Math.cos(r)*.4,0],'cog',group,'metal');m.rotation.z=-r;}break;
 case 'drop':part('sphere','#88cbd2',[.6,.73,.55],[0,.36,0],'drop');part('cone','#a9e1e2',[.46,.48,.44],[0,.8,0],'drop-tip');break;default:throw new Error(`Unknown projectile ${kind}`);}
 return tracked(a);
}

export function createBoss(kind,pool){
 const a=createAsset(pool,kind),{part,joint,group}=a;group.userData.silhouette=kind;
 switch(kind){
 case 'robot':{
  part('cylinder','#d65f72',[.25,.79,.35],[0,.43,0],'coil-core',group,'metal');
  for(let i=0;i<13;i++)part('torus',i%2?'#df8cab':'#4e6d9f',[.35,.11,.4],[0,.10+i*.055,0],'coil-ring',group,'metal').rotation.x=Math.PI/2;
  for(const side of [-1,1]){const arm=joint(side<0?'contact-arm-left':'contact-arm-right',[side*.38,.45,0]);for(let i=0;i<3;i++){const link=part('cylinder',SILVER,[.04,.22,.08],[side*-.03,(i-1)*.27,0],'arm-link',arm,'metal');link.rotation.z=side*(i%2?.8:-.8);part('sphere',SILVER,[.10,.10,.12],[side*.06,(i-1)*.27+.05,0],'elbow',arm,'metal');part(i===0?'round':'sphere',i===0?'#c88a55':'#ede4d2',[.18,.12,.20],[side*.025,(i-1)*.27,0],'hand-brush',arm);}}
  for(const side of [-1,1])for(const y of [.20,.47,.74]){const connector=part('cylinder',SILVER,[.035,.34,.055],[side*.22,y,-.05],'arm-connector',group,'metal');connector.rotation.z=Math.PI/2;}
  part('sphere','#aeef54',[.15,.12,.23],[0,.92,0],'weakpoint',group,'plain',{emissive:'#64ad19',emissiveIntensity:.6});break;}
 case 'toyRobot':part('round','#6f8a90',[.56,.57,.43],[0,.46,0],'armour',group,'metal');part('round',SILVER,[.48,.24,.42],[0,.83,0],'head',group,'metal');part('round',DARK,[.34,.07,.04],[0,.85,.23],'visor');for(const x of [-.11,.11])part('sphere','#d7eea6',[.07,.07,.04],[x,.85,.26],'eye');part('round','#e8bd53',[.20,.14,.06],[0,.53,.24],'weakpoint',group,'plain',{emissive:'#f4a828',emissiveIntensity:.6});for(const side of [-1,1]){part('sphere',SILVER,[.22,.37,.3],[side*.36,.44,0],'arm',group,'metal');part('round',DARK,[.35,.18,.48],[side*.2,.10,0],'tank-tread');for(let i=0;i<4;i++)part('sphere',SILVER,[.07,.10,.06],[side*.2-.11+i*.075,.1,.25],'tread-wheel',group,'metal');}break;
 case 'owl':part('sphere','#a97144',[.56,.69,.42],[0,.43,0],'owl-body');part('sphere',CREAM,[.39,.49,.06],[0,.4,.23],'breast');for(const s of [-1,1]){part('sphere','#8b5739',[.45,.26,.18],[s*.37,.56,0],`wing-${s}`);part('sphere','#ead8b1',[.29,.33,.10],[s*.14,.77,.18],'eye-mask');part('sphere','#f8e874',[.14,.17,.08],[s*.14,.78,.25],'eye');part('sphere','#2e2830',[.07,.1,.03],[s*.14,.78,.30],'pupil');part('cone','#744732',[.19,.26,.20],[s*.2,.98,0],'ear');}part('cone','#e4ad43',[.17,.22,.14],[0,.61,.27],'beak').rotation.z=Math.PI;legs(a,group,GOLD);break;
 case 'ufo':part('sphere','#90aa9c',[.99,.29,.72],[0,.39,0],'saucer',group,'metal');part('sphere','#9ce6d5',[.51,.47,.44],[0,.65,0],'dome',group,'plain',{metalness:.35,roughness:.2});part('torus',GOLD,[1,.34,.70],[0,.40,0],'rim',group,'metal').rotation.x=Math.PI/2;for(const x of [-.3,0,.3])part('sphere','#f8c66c',[.11,.11,.07],[x,.38,.35],'navigation-light',group,'plain',{emissive:'#f9c457',emissiveIntensity:.5});eyes(a,group,.66,.13,.12);break;
 case 'electricFish':part('sphere','#a4bf4c',[.72,.61,.45],[0,.50,0],'fish-body');part('sphere',CREAM,[.6,.34,.10],[0,.4,.24],'belly');for(const s of [-1,1]){part('cone','#738d36',[.28,.43,.17],[s*.4,.53,0],'fin').rotation.z=s*Math.PI/2;part('sphere','#f8f0ce',[.20,.23,.12],[s*.16,.68,.19],'eye');part('sphere','#27342e',[.08,.11,.04],[s*.16,.70,.27],'pupil');}for(let i=0;i<5;i++)part('cone',GOLD,[.08,.25,.1],[-.2+i*.1,.88,0],'spine');break;
 case 'casinoCat':case 'fatCat':{
  const fat=kind==='fatCat';part('sphere',fat?'#7b6a83':'#648cbe',[.83,.66,.48],[0,.36,0],'suit',group,'fabric');part('sphere','#e5d6ba',[.42,.50,.07],[0,.43,.26],'shirt');for(const s of [-1,1]){part('round',fat?'#654e6a':'#315788',[.19,.45,.09],[s*.23,.43,.25],'lapel').rotation.z=s*.25;part('sphere',fat?'#95847d':'#938e98',[.26,.34,.27],[s*.4,.47,.07],'hand');part('cone',fat?'#928078':'#817780',[.21,.27,.19],[s*.20,.96,0],'cat-ear');}part('sphere',fat?'#a99b89':'#a3a0a7',[.59,.43,.40],[0,fat?.835:.78,0],'head');for(const s of [-1,1])part('sphere',CREAM,[.27,.17,.10],[s*.13,fat?.775:.70,.22],'muzzle');eyes(a,group,fat?.905:.82,.135,.12);part('sphere','#785157',[.14,.09,.08],[0,fat?.815:.74,.29],'nose');part('round','#be6860',[.15,.16,.06],[0,.53,.32],'tie');legs(a,group,DARK);
  if(fat){const chair=joint('chair',[0,0,-.16]);part('round','#65516a',[.96,.06,.62],[0,0,0],'chair-seat',chair,'fabric');part('round','#8b6c51',[.96,.8,.10],[0,.38,-.28],'chair-back',chair,'wood');part('round','#775c72',[.80,.65,.06],[0,.38,-.215],'chair-cushion',chair,'fabric');for(const x of [-.39,.39])for(const z of [-.23,.23])part('cylinder',GOLD,[.055,.15,.055],[x,-.11,z],'chair-leg',chair,'metal');for(const x of [-.45,.45])part('sphere',GOLD,[.08,.08,.08],[x,.82,-.28],'chair-finial',chair,'metal');
  part('sphere','#5b3b37',[.13,.055,.06],[-.16,.78,.29],'mouth');for(const side of [-1,1]){const brow=part('round','#5c5355',[.19,.035,.035],[side*.135,.98,.28],'brow');brow.rotation.z=side*.25;}const cigar=joint('cigar-tip',[-.16,.78,.32]);part('cylinder','#875237',[.04,.19,.04],[-.09,0,0],'cigar',cigar).rotation.z=Math.PI/2;part('sphere','#f1a366',[.035,.04,.04],[0,0,0],'ember',cigar,'plain',{emissive:'#ec591a',emissiveIntensity:.8});}else{part('cylinder','#344960',[.58,.10,.47],[0,.99,0],'hat-brim');part('cylinder','#344960',[.4,.21,.35],[0,1.08,0],'top-hat');}break;}
 case 'caterpillar':for(let i=0;i<5;i++){const g=joint(`body-segment-${i}`,[0,.1+i*.2,0]);part('sphere',i===4?'#c98a58':'#97bf50',[.98,.87,.48],[0,.48,0],'segment',g);for(const s of [-1,1])part('sphere','#d2a86e',[.19,.15,.23],[s*.27,.08,.08],'foot',g);if(i===4)eyes(a,g,.63,.17,.19);}break;
 default:throw new Error(`Unknown Boss ${kind}`);
 }
 a.update=(b,t=0)=>{
  group.position.set(b.x,b.y,0);group.scale.set(b.w??2,b.h??2.4,Math.min(b.w??2,3));group.visible=!b.defeated&&b.phase!=='separated';
  const weak=group.getObjectByName('weakpoint');if(weak&&b.weakpoint){weak.position.x=(b.weakpoint.x-b.x)/b.w;weak.position.y=(b.weakpoint.y+b.weakpoint.h/2-b.y)/b.h;weak.scale.x=b.weakpoint.w/b.w;weak.scale.y=b.weakpoint.h/b.h;}
  if(kind==='robot')for(const [i,name] of ['contact-arm-left','contact-arm-right'].entries()){const r=b.contactRegions?.[i];if(r){const arm=group.getObjectByName(name);arm.position.x=(r.x-b.x)/b.w;arm.position.y=(r.y+r.h/2-b.y)/b.h;}}
  const chair=group.getObjectByName('chair');if(chair){const floor=((b.arena?.y??b.y-1.2)-b.y)/b.h;chair.traverse(o=>{if(o.name==='chair-leg'){o.position.y=(floor-.03)/2;o.scale.y=Math.max(.01,-.03-floor);}});}
  const cigar=group.getObjectByName('cigar-tip');if(cigar&&b.anchors?.mouth){cigar.position.x=(b.anchors.mouth.x-b.x)/b.w;cigar.position.y=(b.anchors.mouth.y-b.y)/b.h;const mouth=group.getObjectByName('mouth');mouth.position.x=cigar.position.x;mouth.position.y=cigar.position.y;}
  if(kind==='caterpillar')for(let i=0;i<5;i++){const segment=group.getObjectByName(`body-segment-${i}`),s=b.segments?.[i];segment.visible=!!s;if(s){segment.position.set((s.x-b.x)/b.w,(s.y-b.y)/b.h,0);segment.scale.set(s.w/b.w,s.h/b.h,1);}}
  for(const s of [-1,1]){const wing=group.getObjectByName(`wing-${s}`);if(wing)wing.rotation.z=s*Math.sin(t*6)*.45;}
 };return a;
}
export const createRobot=pool=>createBoss('robot',pool);
export const createOwl=pool=>createBoss('owl',pool);
export const createUFO=pool=>createBoss('ufo',pool);
export const createToyRobot=pool=>createBoss('toyRobot',pool);
export const createElectricFish=pool=>createBoss('electricFish',pool);
export const createCasinoCat=pool=>createBoss('casinoCat',pool);
export const createCaterpillarBoss=pool=>createBoss('caterpillar',pool);
export const createFatCat=pool=>createBoss('fatCat',pool);
export const createBigCrate=pool=>createCrate(pool,true);
export const createDog=pool=>createEnemy('dog',pool);
export const createBird=pool=>createEnemy('bird',pool);
export const createCaterpillar=pool=>createEnemy('caterpillar',pool);
export const createMouse=pool=>createEnemy('mouse',pool);
export const createKangaroo=pool=>createEnemy('kangaroo',pool);
export const createMimic=pool=>createEnemy('mimic',pool);
export const createToy=pool=>createEnemy('toy',pool);
export const createBee=pool=>createEnemy('bee',pool);
export const createRhino=pool=>createEnemy('rhino',pool);
export const createCrab=pool=>createEnemy('crab',pool);
export const createLizard=pool=>createEnemy('lizard',pool);
export const createPelican=pool=>createEnemy('pelican',pool);
