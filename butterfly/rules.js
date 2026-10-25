/* Shared deterministic rules for local play and the authoritative LAN server. */
globalThis.GardenRules = (() => {
  const vegetation=typeof module!=='undefined'?require('./vegetation.js'):globalThis.GardenVegetation;
  const flight={min:.4,max:18,speed:3,hunterReach:5.4,perchOffset:.12};
  const roofProfile=[[0,.95],[.22,.90],[.50,.77],[.83,.51],[1.17,.16],[1.50,-.21],[1.81,-.56],[2.05,-.78],[2.18,-.88]];
  const world={x:40,z:32,playerRadius:.12,infinite:true};
  const hut={x:0,z:6,radius:2.2,hunterExclusion:3.35,wallOuter:1.14,wallInner:.81,wallSplit:.98,doorHalf:.55,doorStart:6.35,modelScale:.6};
  const layouts=[[-4,3],[4,2],[-7,-2],[6,-3],[-3,-6],[2,-7],[8,1],[-8,2],[0,-3],[5,-6],[-9,-.2],[.2,-7.8]];
  // Keep familiar routes near home, then populate the full meadow deterministically.
  function addFlower(x,z){
    x=Math.round(x*1000)/1000;z=Math.round(z*1000)/1000;
    if((x/world.x)**2+(z/world.z)**2<1&&Math.hypot(x-hut.x,z-hut.z)>=3&&layouts.every(([fx,fz])=>Math.hypot(x-fx,z-fz)>=1.15))layouts.push([x,z]);
  }
  for(let i=0;layouts.length<32&&i<96;i++){
    const angle=i*2.399963229728653,radius=3.4+(i%3)*1.6;
    addFlower(Math.cos(angle)*radius,hut.z+Math.sin(angle)*radius);
  }
  for(let i=0;layouts.length<192&&i<5000;i++){
    const angle=i*2.399963229728653,radius=Math.sqrt((((i*73)%997)+.5)/997);
    addFlower(Math.cos(angle)*world.x*.965*radius,Math.sin(angle)*world.z*.965*radius);
  }
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
  function flowerType(f,homes=[hut]){
    const x=Math.round(f.x*1000),z=Math.round(f.z*1000),point={x:x/1000,z:z/1000};
    const golden=homes.every(home=>distance(point,home)>=14)&&Math.abs((x*73856093)^(z*19349663))%5===0;
    return {kind:golden?'golden':'ordinary',value:golden?3:1};
  }
  const hutFor=p=>p?.home||hut;
  const isSafe=p=>distance(p,hutFor(p))<=hut.radius&&(!Number.isFinite(p.altitude)||p.altitude<=1.55);
  const isSheltered=(s,p)=>altitudeOf(s,p)<=1.55&&(s.huts||[hut]).some(home=>distance(p,home)<=hut.radius);
  // Match scene._eyeHeight for players and old saves that have never used rise.
  function altitudeOf(s,p){
    if(Number.isFinite(p.altitude))return p.altitude;if(p.hiddenFor>0)return .4;
    const d=Math.min(...(s.huts||[hut]).map(home=>distance(p,home)));if(d<=1.35)return .78;if(d>=2)return 1.45;const t=(d-1.35)/.65;return .78+.67*t*t*(3-2*t);
  }
  function roofAt(x,z,home=hut){
    const r=Math.hypot(x-home.x,z-home.z)/hut.modelScale;if(r>2.18)return null;
    for(let i=1;i<roofProfile.length;i++){const [right,high]=roofProfile[i],[left,low]=roofProfile[i-1];if(r<=right)return (3+low+(high-low)*(r-left)/(right-left))*hut.modelScale;}return null;
  }
  function surfacesAt(s,p){
    const surfaces=(s.huts||[hut]).map(home=>roofAt(p.x,p.z,home)).filter(y=>y!==null);
    const plants=vegetation||globalThis.GardenVegetation,scale={meadow:1,forest:.65,sunset:.92,moon:.84}[s.map]||1;
    const crown=plants?.perchAt?.(p.x,p.z,scale,s.huts||[hut]);if(crown)surfaces.push(crown.y);return surfaces;
  }
  const forestScale=s=>({meadow:1,forest:.65,sunset:.92,moon:.84}[s.map]||1);
  function treeBodies(s,p){return (vegetation||globalThis.GardenVegetation)?.treeCollidersNear?.(p.x,p.z,forestScale(s),s.huts||[hut])||[];}
  function section(body,p,y,r){
    if(body.shape==='capsule'){
      const dx=body.bx-body.ax,dy=body.by-body.ay,dz=body.bz-body.az,len=dx*dx+dy*dy+dz*dz,t=len?Math.max(0,Math.min(1,((p.x-body.ax)*dx+(y-body.ay)*dy+(p.z-body.az)*dz)/len)):0;
      const cy=body.ay+dy*t,rr=(body.radius+r)**2-(y-cy)**2;if(rr<=0)return null;const radius=Math.sqrt(rr);return{x:body.ax+dx*t,z:body.az+dz*t,rx:radius,rz:radius,angle:0};
    }
    let amount;
    if(body.shape==='cone'){
      const t=(y-body.yMin)/(body.yMax-body.yMin);if(t<0||t>1)return null;const rings=body.rings||[[0,1],[1,0]];
      for(let i=1;i<rings.length;i++)if(t<=rings[i][0]){const [a,ar]=rings[i-1],[b,br]=rings[i];amount=ar+(br-ar)*(t-a)/(b-a);break;}
    }else{
      const t=(y-body.y)/body.ry;if(t<=-1||t>=1)return null;
      const rings=body.rings||[[-1,0],[-.4,.9],[.38,1],[1,0]];
      for(let i=1;i<rings.length;i++)if(t<=rings[i][0]){const [a,ar]=rings[i-1],[b,br]=rings[i];amount=ar+(br-ar)*(t-a)/(b-a);break;}
    }
    return{x:body.x,z:body.z,rx:body.rx*amount+r,rz:body.rz*amount+r,angle:body.angle||0};
  }
  function pushTree(p,c,apply){
    const co=Math.cos(c.angle),si=Math.sin(c.angle),dx=p.x-c.x,dz=p.z-c.z,lx=dx*co-dz*si,lz=dx*si+dz*co,n=Math.hypot(lx/c.rx,lz/c.rz);
    if(n>=1-1e-8)return false;if(apply){const x=n>1e-9?lx/n:c.rx,z=n>1e-9?lz/n:0;p.x=c.x+x*co+z*si;p.z=c.z-x*si+z*co;}return true;
  }
  function treeBlocked(bodies,p,y,r){return bodies.some(body=>{const c=section(body,p,y,r);return c&&pushTree(p,c,false);});}
  function rise(s,p,input,dt){
    const amount=Math.max(-1,Math.min(1,finite(input)));if(!amount)return;
    const before=altitudeOf(s,p);let after=Math.max(flight.min,Math.min(flight.max,before+amount*flight.speed*dt));
    for(const y of surfacesAt(s,p)){const top=y+flight.perchOffset,bottom=y-flight.perchOffset;
      if(amount<0&&before>=top-1e-8&&after<top)after=Math.max(after,top);
      if(amount>0&&before<=bottom+1e-8&&after>bottom)after=Math.min(after,bottom);
    }
    const bodies=treeBodies(s,p);if(!treeBlocked(bodies,p,before,world.playerRadius)&&treeBlocked(bodies,p,after,world.playerRadius)){let clear=before,blocked=after;for(let i=0;i<14;i++){const mid=(clear+blocked)/2;if(treeBlocked(bodies,p,mid,world.playerRadius))blocked=mid;else clear=mid;}after=clear;}
    p.altitude=after;
  }
  const housePositions=[];
  for(let row=-6;row<=6;row++)for(let col=-6;col<=6;col++){const x=(col+(Math.abs(row)%2)*.5)*7.2,z=6+row*6.3;if((x/36)**2+(z/28)**2<1)housePositions.push({x,z});}
  housePositions.sort((a,b)=>Math.hypot(a.x,a.z-6)-Math.hypot(b.x,b.z-6)||a.x-b.x||a.z-b.z);
  function clearHouseFlowers(s){let seed=0;for(const f of s.flowers){if(s.huts.every(h=>distance(f,h)>=3))continue;for(;seed<12000;seed++){const angle=seed*2.3999632297,r=Math.sqrt((((seed*73)%997)+.5)/997),point={x:Math.cos(angle)*38*r,z:Math.sin(angle)*30*r};if(s.huts.every(h=>distance(point,h)>=3)&&s.flowers.every(other=>other===f||distance(point,other)>=1.15)){f.x=point.x;f.z=point.z;seed++;break;}}}}
  const collectTime=s=>s.level===4?.1:1;
  const mapIds=['meadow','forest','sunset','moon'];
  // Stable per-tile scatter. Keep a margin so adjacent tiles cannot overlap.
  function flowersInTile(tx,tz,base){
    let seed=(Math.imul(tx^8717,73856093)^Math.imul(tz^9277,19349663))>>>0;
    const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;},points=[];
    for(let attempt=0;attempt<1024&&points.length<16;attempt++){
      const point={x:tx*24+.65+random()*22.7,z:tz*24+.65+random()*22.7};
      if(points.every(other=>distance(point,other)>=1.15)&&base.every(other=>distance(point,other)>=1.15))points.push(point);
    }return points;
  }
  function growMeadow(s){
    const key=s.players.map(p=>Math.floor(p.x/24)+','+Math.floor(p.z/24)).join(';');if(s.flowerKey===key)return;s.flowerKey=key;
    const old=s.flowers,active=s.players.map(p=>old.find(f=>f.id===p.activeFlower));s.flowers=old.filter((f,i)=>i<192||s.players.some(p=>distance(f,p)<60));
    const existing=new Set(s.flowers.map(f=>f.tile).filter(Boolean));
    for(const p of s.players){if(Math.abs(p.x)<24&&Math.abs(p.z)<20)continue;const cx=Math.floor(p.x/24),cz=Math.floor(p.z/24);for(let tx=cx-1;tx<=cx+1;tx++)for(let tz=cz-1;tz<=cz+1;tz++){const tile=tx+','+tz;if(existing.has(tile))continue;existing.add(tile);for(const {x,z} of flowersInTile(tx,tz,s.flowers.slice(0,192))){if(s.huts.every(h=>distance({x,z},h)>=3))s.flowers.push({x,z,tile,id:0,done:false,progress:0,regrow:0,...flowerType({x,z},s.huts)});}}}
    if(s.flowers.length>8192){const keep=new Set(active.filter(Boolean)),base=s.flowers.slice(0,192),near=s.flowers.slice(192).map(f=>({f,score:keep.has(f)?-1:Math.min(...s.players.map(p=>(p.x-f.x)**2+(p.z-f.z)**2))})).sort((a,b)=>a.score-b.score);s.flowers=base.concat(near.slice(0,8000).map(a=>a.f));}
    s.flowers.forEach((f,id)=>{f.id=id;});s.players.forEach((p,i)=>{p.activeFlower=active[i]?s.flowers.indexOf(active[i]):-1;if(p.activeFlower<0)p.collectProgress=0;});
  }
  const finite=n=>Number.isFinite(n)?n:0;
  const itemIds=['shields','slows','energy','decoys'];
  const itemCount=n=>Number.isFinite(n)?Math.max(0,Math.min(99,Math.floor(n))):0;
  function actor(inventory={},id=0){
    const stash=Object.fromEntries(itemIds.map(key=>[key,itemCount(inventory[key])]));
    const home={...housePositions[id],id};
    return {id,home,x:home.x,z:home.z+2.1,nectar:0,bag:0,deposit:0,stamina:1,surge:0,immunity:0,stash,held:'',folded:false,shields:0,slows:0,energy:0,decoys:0,activeFlower:-1,collectProgress:0,skin:String(inventory.skin||'sun'),hiddenFor:0,hideCooldown:0,lastCollectAt:0,streak:0};
  }
  function addPlayer(s,inventory={}){const p=actor(inventory,s.players.length);s.players.push(p);s.huts.push(p.home);clearHouseFlowers(s);for(const f of s.flowers)Object.assign(f,flowerType(f,s.huts));for(const h of s.hunters)move(s,h,0,0,.55,true);return p;}
  function create(level=1,inventory={},options={}){
    level=Math.min(4,Math.max(1,Math.floor(level)||1));
    const s={mode:'playing',level,map:mapIds.includes(options.map)?options.map:'meadow',target:Math.max(1,Math.min(199,Math.floor(options.target)||[6,8,10,112][level-1])),players:[actor(inventory)],hunters:[],flowers:layouts.map(([x,z],id)=>({x,z,id,done:false,progress:0,regrow:0,...flowerType({x,z})})),obstacles:[],nectar:0,decoy:null,grace:3,slowed:0,elapsed:0,events:[],eventDetails:[]};
    s.huts=[s.players[0].home];
    const spawn=[[9,-5],[-9,-4],[7,0],[-7,-6],[3,-7],[-9,1],[0,-7.8],[-5,0]];
    for(let i=0;i<[1,1,1,5][level-1];i++)s.hunters.push({x:spawn[i][0],z:spawn[i][1],vx:0,vz:0,id:i});
    for(let i=1;i<Math.min(64,Math.max(1,options.players||1));i++)addPlayer(s,options.inventories?.[i]||{});
    Object.defineProperty(s,'player',{enumerable:true,get:()=>s.players[0]});
    Object.defineProperty(s,'hunter',{enumerable:true,get:()=>s.hunters[0]});
    for(const key of ['bag','deposit','stamina','immunity','shields','slows','activeFlower','energy','decoys'])Object.defineProperty(s,key,{enumerable:true,get:()=>s.players[0][key],set:v=>{s.players[0][key]=v;}});
    return s;
  }
  function targetFor(level,rng=Math.random){return level===4?101+Math.floor(Math.min(.999999,Math.max(0,rng()))*19):5+Math.floor(Math.min(.999999,Math.max(0,rng()))*5);}
  function event(s,name,index){s.events.push(name);s.eventDetails.push({type:name,player:index,time:s.elapsed});if(s.events.length>80)s.events.shift();if(s.eventDetails.length>80)s.eventDetails.shift();}
  function returnTools(s,index){
    const players=index===undefined?s.players:[s.players[index]];let changed=false;
    for(const p of players){if(!p)continue;for(const id of itemIds){if(p[id]>0){p.stash[id]=itemCount(p.stash[id]+p[id]);p[id]=0;changed=true;}}p.held='';}return changed;
  }
  function equip(s,id,index=0){
    const p=s.players[index];if(s.mode!=='playing'||!p||!isSafe(p)||!(id===''||itemIds.includes(id)))return false;
    if(id&&p.held===id&&p[id]>0)return true;if(id&&p.stash[id]<1)return false;
    returnTools(s,index);if(id){p.stash[id]--;p[id]=1;p.held=id;}event(s,'equip',index);return true;
  }
  function consume(p,id){p[id]--;if(p.held===id&&p[id]===0)p.held='';}
  function slow(s,index=0){const p=s.players[index];if(s.mode!=='playing'||!p||p.slows<1)return false;consume(p,'slows');s.slowed=12;event(s,'slow',index);return true;}
  function hide(s,index=0){const p=s.players[index];if(s.mode!=='playing'||!p||!['leaf','dry-leaf'].includes(p.skin)||p.hideCooldown>1e-8)return false;p.hiddenFor=10;p.hideCooldown=50;p.folded=true;event(s,'hide',index);return true;}
  function fold(s,index=0){const p=s.players[index];if(s.mode!=='playing'||!p)return false;if(p.folded){p.folded=false;p.hiddenFor=0;}else{p.folded=true;if(['leaf','dry-leaf'].includes(p.skin)&&p.hideCooldown<=1e-8)hide(s,index);}event(s,'fold',index);return true;}
  function refill(s,index=0){const p=s.players[index];if(s.mode!=='playing'||!p||p.energy<1||p.surge>0)return false;consume(p,'energy');p.surge=6;p.stamina=1;event(s,'energy',index);return true;}
  function decoy(s,index=0){const p=s.players[index];if(s.mode!=='playing'||!p||p.decoys<1)return false;consume(p,'decoys');s.decoy={x:p.x,z:p.z,left:8};event(s,'decoy',index);return true;}
  function bound(p,radius=0){}
  function project(p,c,r){let dx=p.x-c.x,dz=p.z-c.z,d=Math.hypot(dx,dz);if(d<r){if(d<1e-9){dx=1;dz=0;d=1;}p.x=c.x+dx/d*r;p.z=c.z+dz/d*r;}}
  function hutWall(p,previous,home){
    const d=distance(p,home);if(d<hut.wallInner||d>=hut.wallOuter||Math.abs(p.x-home.x)<hut.doorHalf&&p.z>home.z+(hut.doorStart-hut.z))return;
    const radius=distance(previous,home)<hut.wallSplit?hut.wallInner:hut.wallOuter;const dx=p.x-home.x,dz=p.z-home.z;
    p.x=home.x+dx/d*radius;p.z=home.z+dz/d*radius;
  }
  function move(s,p,dx,dz,r,hunter=false){
    const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.08)),bodies=treeBodies(s,p);
    for(let i=0;i<steps;i++){const previous={x:p.x,z:p.z};p.x+=dx/steps;p.z+=dz/steps;bound(p,hunter?0:r);
      for(let k=0;k<3;k++){for(const o of s.obstacles)project(p,o,o.radius+r);for(const home of s.huts||[hut]){if(hunter)project(p,home,hut.hunterExclusion);else if(!Number.isFinite(p.altitude))hutWall(p,previous,home);else{
        const roof=roofAt(p.x,p.z,home),priorRoof=roofAt(previous.x,previous.z,home),height=p.altitude;
        if(roof!==null){const above=priorRoof===null?height>=roof+flight.perchOffset:height>=priorRoof+flight.perchOffset-1e-8;
          if(above&&height<roof+flight.perchOffset-1e-8||!above&&height>roof-flight.perchOffset&&height<roof+flight.perchOffset){p.x=previous.x;p.z=previous.z;}
        }if(height<1.38)hutWall(p,previous,home);
      }}for(const body of bodies){const c=section(body,p,hunter?2.4:altitudeOf(s,p),hunter?.6:r);if(c)pushTree(p,c,true);}bound(p,hunter?0:r);}
    }
  }
  function separateHunters(s){
    for(let pass=0;pass<3;pass++){
      for(let i=0;i<s.hunters.length;i++)for(let j=i+1;j<s.hunters.length;j++){
        const a=s.hunters[i],b=s.hunters[j];let dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);if(d>=1.12)continue;
        if(d<1e-8){const angle=(i*7+j)*2.399963;dx=Math.cos(angle);dz=Math.sin(angle);d=1;}else{dx/=d;dz/=d;}
        const push=(1.12-(Math.hypot(b.x-a.x,b.z-a.z)))*.5;move(s,a,-dx*push,-dz*push,.55,true);move(s,b,dx*push,dz*push,.55,true);
        // Remove only the closing velocity; keep tangential travel for smooth sliding.
        const closing=(a.vx-b.vx)*dx+(a.vz-b.vz)*dz;if(closing>0){a.vx-=dx*closing*.5;a.vz-=dz*closing*.5;b.vx+=dx*closing*.5;b.vz+=dz*closing*.5;}
      }
      for(const h of s.hunters)move(s,h,0,0,.55,true);
    }
  }
  function step(s,dt,input){
    s.elapsed+=dt;growMeadow(s);if(s.decoy){s.decoy.left=Math.max(0,s.decoy.left-dt);if(s.decoy.left<=1e-8)s.decoy=null;}s.grace=Math.max(0,s.grace-dt);s.slowed=Math.max(0,s.slowed-dt);
    for(const f of s.flowers){if(f.done){f.regrow=Math.max(0,f.regrow-dt);if(f.regrow<=1e-8){f.done=false;f.progress=0;}}if(!f.done)f.progress=0;}
    for(let i=0;i<s.players.length;i++){
      const p=s.players[i],a=input.inputs?input.inputs[i]||{}:i===0?input:{};
      p.surge=Math.max(0,p.surge-dt);const wasHidden=p.hiddenFor>0;p.immunity=Math.max(0,p.immunity-dt);p.hiddenFor=Math.max(0,p.hiddenFor-dt);p.hideCooldown=Math.max(0,p.hideCooldown-dt);if(p.hiddenFor<1e-8)p.hiddenFor=0;if(wasHidden&&p.hiddenFor===0)p.folded=false;if(p.hideCooldown<1e-8)p.hideCooldown=0;let x=finite(a.x),z=finite(a.z),n=Math.hypot(x,z);if(n>1){x/=n;z/=n;}
      const moving=Math.hypot(x,z)>.01||Math.abs(finite(a.rise))>.01,boosted=!!a.boost&&Math.hypot(x,z)>.01;
      if(Math.abs(finite(a.rise))>0&&!Number.isFinite(p.altitude))p.altitude=altitudeOf(s,p);
      if(moving){p.hiddenFor=0;p.folded=false;}
      p.stamina=1;
      const speed=(boosted?(s.level===4?12:7.6):4.3)*(p.surge>0?1.35:1);move(s,p,x*speed*dt,z*speed*dt,world.playerRadius);rise(s,p,a.rise,dt);
      const dense=(vegetation||globalThis.GardenVegetation)?.growthAt?.(p.x,p.z)>=.58;
      p.coverStill=!moving&&altitudeOf(s,p)<=.8&&dense?(p.coverStill||0)+dt:0;p.inCover=p.coverStill>=.6-1e-8;
      if(a.deposit&&!moving&&isSafe(p)&&p.bag&&s.nectar<s.target){p.deposit+=dt;if(p.deposit>=1-1e-8){const amount=Math.min(p.bag,s.target-s.nectar);p.bag-=amount;p.deposit=0;s.nectar+=amount;p.nectar+=amount;event(s,'deposit',i);}}else p.deposit=0;
      const f=a.collect&&!moving&&altitudeOf(s,p)<=2.1&&p.bag<s.target-s.nectar?s.flowers.find(f=>!f.done&&distance(f,p)<.85):null;
      if(f){if(p.activeFlower!==f.id)p.collectProgress=0;p.activeFlower=f.id;p.collectProgress+=dt;f.progress=Math.max(f.progress,p.collectProgress/collectTime(s));
        if(p.collectProgress>=collectTime(s)-1e-8){f.done=true;f.regrow=8;f.progress=1;p.bag+=Math.min(f.value,s.target-s.nectar-p.bag);p.activeFlower=-1;p.collectProgress=0;p.streak=p.streak>0&&s.elapsed-p.lastCollectAt<=8+1e-8?p.streak+1:1;p.lastCollectAt=s.elapsed;event(s,'collect',i);if(p.streak>=3){p.surge=Math.max(p.surge,3);event(s,'chain',i);}}
      }else{p.activeFlower=-1;p.collectProgress=0;}
    }
    if(s.nectar>=s.target){s.mode='won';returnTools(s);event(s,'won');return;}
    if(s.grace>0){separateHunters(s);return;}
    for(const h of s.hunters){
      const visible=s.players.filter(p=>p.hiddenFor<=0&&(!p.inCover||distance(h,p)<1.8));const targets=visible.filter(p=>!isSheltered(s,p));const choices=targets.length?targets:visible;
      const target=s.decoy||(choices.length?choices.reduce((best,p)=>distance(h,p)<distance(h,best)?p:best,choices[0]):{x:Math.cos(s.elapsed*.18+h.id)*7,z:Math.sin(s.elapsed*.18+h.id)*5-1});
      let tx=target.x,tz=target.z;
      const count=s.hunters.length,sector=Math.PI/2+h.id*Math.PI*2/count;
      if(count>1&&!s.decoy){tx+=Math.cos(sector)*1.2;tz+=Math.sin(sector)*1.2;}
      const protectedHome=(s.huts||[hut]).find(home=>distance(target,home)<=hut.radius);if(protectedHome){const angle=count>1?sector:Math.atan2(h.z-protectedHome.z,h.x-protectedHome.x);tx=protectedHome.x+Math.cos(angle)*3.8;tz=protectedHome.z+Math.sin(angle)*3.8;}
      let dx=tx-h.x,dz=tz-h.z,d=Math.hypot(dx,dz),hs=([2.1,2.65,3.15,3.5][s.level-1])*(s.slowed>0?.38:1);
      // A small tangential detour lets pursuers walk around circular obstacles.
      for(const o of s.obstacles){const od=distance(h,o);if(od<o.radius+1.15&&dx*(o.x-h.x)+dz*(o.z-h.z)>0){const side=(h.id%2?1:-1);dx+=(h.z-o.z)*side*2.4;dz-=(h.x-o.x)*side*2.4;d=Math.hypot(dx,dz);break;}}
      // Assign stable approach points and anticipate neighbours before contact.
      let vx=d>.03?dx/d*hs*Math.min(1,(d-.03)/.8):0,vz=d>.03?dz/d*hs*Math.min(1,(d-.03)/.8):0;
      for(const other of s.hunters){if(other===h)continue;let ax=h.x-other.x,az=h.z-other.z,ad=Math.hypot(ax,az);if(ad>1e-6&&ad<1.8){const pressure=(1.8-ad)/.68*hs*.7;vx+=ax/ad*pressure;vz+=az/ad*pressure;}}
      for(const home of s.huts||[hut]){const ax=h.x-home.x,az=h.z-home.z,ad=Math.hypot(ax,az),gx=tx-h.x,gz=tz-h.z,length=gx*gx+gz*gz,t=length?Math.max(0,Math.min(1,-(ax*gx+az*gz)/length)):0,clearance=Math.hypot(ax+gx*t,az+gz*t);if(ad<4.4&&clearance<3.5&&vx*ax+vz*az<0){const turn=Math.sin(Math.atan2(tz-home.z,tx-home.x)-Math.atan2(az,ax))>=0?1:-1,pressure=(4.4-ad)*hs;vx+=(-az/ad*turn+ax/ad)*pressure;vz+=(ax/ad*turn+az/ad)*pressure;}}
      const magnitude=Math.hypot(vx,vz);if(magnitude>hs){vx*=hs/magnitude;vz*=hs/magnitude;}
      const ease=1-Math.exp(-dt*5);h.vx+=(vx-h.vx)*ease;h.vz+=(vz-h.vz)*ease;
      move(s,h,h.vx*dt,h.vz*dt,.55,true);
    }
    separateHunters(s);
    for(const h of s.hunters){
      for(let i=0;i<s.players.length;i++){const p=s.players[i];if(!isSheltered(s,p)&&p.hiddenFor<=0&&p.immunity<=0&&altitudeOf(s,p)<=flight.hunterReach&&distance(p,h)<1.4){
        if(p.shields>0){consume(p,'shields');p.immunity=3.5;event(s,'shield',i);const a=Math.atan2(h.z-p.z,h.x-p.x);move(s,h,Math.cos(a)*2.8,Math.sin(a)*2.8,.55,true);}
        else if(i===0){s.mode='dead';returnTools(s);event(s,'dead',i);return;}
        else{const home=hutFor(p);Object.assign(p,{x:home.x,z:home.z+2.1,bag:0,deposit:0,collectProgress:0,activeFlower:-1,hiddenFor:0,folded:false,immunity:3.5,lastCollectAt:0,streak:0});delete p.altitude;event(s,'respawn',i);}
      }}
    }
  }
  function tick(s,delta,input={}){if(s.mode!=='playing')return;let remaining=Math.min(.1,Math.max(0,finite(delta)));while(remaining>1e-9&&s.mode==='playing'){const dt=Math.min(.02,remaining);step(s,dt,input);remaining-=dt;}}
  return {create,addPlayer,tick,slow,hide,fold,refill,decoy,equip,returnTools,isSafe,isSheltered,hutFor,collectTime,hut,world,targetFor,mapIds,flowerType,altitudeOf,roofAt,flight};
})();
if(typeof module!=='undefined')module.exports=globalThis.GardenRules;
