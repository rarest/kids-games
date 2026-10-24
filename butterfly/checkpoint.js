/* Versioned progress only. Current rules rebuild aliases, homes and hut geometry. */
globalThis.GardenCheckpoint=(()=>{
 const items=['shields','slows','energy','decoys'];
 const clone=value=>JSON.parse(JSON.stringify(value));
 const fail=()=>{throw Error('游戏存档损坏或版本不兼容');};
 const num=(n,min=0,max=1e9)=>{if(!Number.isFinite(n)||n<min||n>max)fail();return n;};
 const integer=(n,min,max)=>{num(n,min,max);if(!Number.isInteger(n))fail();return n;};
 function capture(s){
  const state={};for(const key of ['mode','level','map','target','nectar','grace','slowed','elapsed','players','hunters','flowers','obstacles','decoy','events','eventDetails'])state[key]=s[key];
  return clone({version:1,state});
 }
 function restore(snapshot,rules=globalThis.GardenRules){
  if(!snapshot||snapshot.version!==1||!snapshot.state||!rules?.create)fail();const saved=snapshot.state;
  integer(saved.level,1,4);integer(saved.target,1,199);if(!['playing','won','dead'].includes(saved.mode))fail();
  if(!Array.isArray(saved.players)||saved.players.length<1||saved.players.length>64)fail();
  const s=rules.create(saved.level,{}, {players:saved.players.length,target:saved.target,map:saved.map});
  for(const key of ['nectar','grace','slowed','elapsed'])s[key]=num(saved[key]);integer(s.nectar,0,saved.target);s.mode=saved.mode;
  if(s.mode==='won'&&s.nectar!==saved.target)fail();
  saved.players.forEach((p,index)=>{
   if(!p||typeof p!=='object'||!p.stash)fail();const dest=s.players[index];
   for(const key of Object.keys(dest)){
    if(['id','home','stash'].includes(key))continue;
    const value=p[key];if(typeof dest[key]==='number')dest[key]=num(value,['x','z','activeFlower'].includes(key)?-1e9:0);
    else if(typeof dest[key]==='boolean'){if(typeof value!=='boolean')fail();dest[key]=value;}
    else if(typeof dest[key]==='string'){if(typeof value!=='string'||value.length>64)fail();dest[key]=value;}
   }
   integer(dest.bag,0,1);num(dest.stamina,0,1);num(dest.deposit,0,1);num(dest.collectProgress,0,1);integer(dest.activeFlower,-1,saved.flowers.length-1);
   if(!rules.world.infinite&&Math.hypot(dest.x/rules.world.x,dest.z/rules.world.z)>1.001)fail();
   for(const key of items){dest.stash[key]=integer(p.stash[key],0,99);integer(dest[key],0,1);if(dest.stash[key]+dest[key]>99)fail();}
   if(!['',...items].includes(dest.held))fail();for(const key of items)if(dest[key]!==Number(dest.held===key))fail();
  });
  if(!Array.isArray(saved.flowers)||saved.flowers.length<192||saved.flowers.length>12000||!Array.isArray(saved.hunters)||saved.hunters.length!==s.hunters.length)fail();
  s.flowers=saved.flowers.map((f,index)=>{if(!f||f.id!==index||typeof f.done!=='boolean'||f.tile!==undefined&&(typeof f.tile!=='string'||f.tile.length>64))fail();return{x:num(f.x,-1e9,1e9),z:num(f.z,-1e9,1e9),id:index,done:f.done,regrow:num(f.regrow,0,8),progress:num(f.progress,0,1),...(f.tile?{tile:f.tile}:{})};});
  saved.hunters.forEach((h,index)=>{if(!h||h.id!==s.hunters[index].id)fail();for(const key of ['x','z','vx','vz'])s.hunters[index][key]=num(h[key],-1e4,1e4);});
  if(!Array.isArray(saved.obstacles)||saved.obstacles.length>1000)fail();s.obstacles=saved.obstacles.map(o=>({x:num(o.x,-1e4,1e4),z:num(o.z,-1e4,1e4),radius:num(o.radius,0,100)}));
  if(saved.decoy!==null){if(!saved.decoy)fail();s.decoy={x:num(saved.decoy.x,-1e4,1e4),z:num(saved.decoy.z,-1e4,1e4),left:num(saved.decoy.left,0,8)};}
  if(!Array.isArray(saved.events)||saved.events.length>80||saved.events.some(e=>typeof e!=='string'||e.length>32)||!Array.isArray(saved.eventDetails)||saved.eventDetails.length>80)fail();s.events=clone(saved.events);s.eventDetails=saved.eventDetails.map(e=>{if(!e||typeof e.type!=='string'||e.type.length>32)fail();const out={type:e.type,time:num(e.time)};if(e.player!==undefined)out.player=integer(e.player,0,s.players.length-1);return out;});
  return s;
 }
 async function encode(snapshot){
  const small=clone(snapshot),s=small.state,kept=s.flowers.slice(0,192).concat(s.flowers.slice(192).sort((a,b)=>Math.hypot(a.x-s.players[0].x,a.z-s.players[0].z)-Math.hypot(b.x-s.players[0].x,b.z-s.players[0].z)).slice(0,128)),ids=new Map(kept.map((f,i)=>[f.id,i]));
  s.players.forEach(p=>{p.activeFlower=ids.get(p.activeFlower)??-1;if(p.activeFlower<0)p.collectProgress=0;});s.flowers=kept.map((f,id)=>({...f,id,x:Math.round(f.x*1000)/1000,z:Math.round(f.z*1000)/1000}));
  const bytes=new Uint8Array(await new Response(new Blob([JSON.stringify(small)]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());let binary='';for(const n of bytes)binary+=String.fromCharCode(n);return btoa(binary);
 }
 async function decode(text){if(typeof text!=='string'||text.length>14000)fail();const bytes=Uint8Array.from(atob(text),c=>c.charCodeAt(0));return JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text());}
 return {capture,restore,encode,decode};
})();
if(typeof module!=='undefined')module.exports=globalThis.GardenCheckpoint;
