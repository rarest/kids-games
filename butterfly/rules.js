/* Shared deterministic rules for local play and the authoritative LAN server. */
globalThis.GardenRules = (() => {
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
  const hutFor=p=>p?.home||hut;
  const isSafe=p=>distance(p,hutFor(p))<=hut.radius;
  const isSheltered=(s,p)=>(s.huts||[hut]).some(home=>distance(p,home)<=hut.radius);
  const housePositions=[];
  for(let row=-6;row<=6;row++)for(let col=-6;col<=6;col++){const x=(col+(Math.abs(row)%2)*.5)*7.2,z=6+row*6.3;if((x/36)**2+(z/28)**2<1)housePositions.push({x,z});}
  housePositions.sort((a,b)=>Math.hypot(a.x,a.z-6)-Math.hypot(b.x,b.z-6)||a.x-b.x||a.z-b.z);
  function clearHouseFlowers(s){let seed=0;for(const f of s.flowers){if(s.huts.every(h=>distance(f,h)>=3))continue;for(;seed<12000;seed++){const angle=seed*2.3999632297,r=Math.sqrt((((seed*73)%997)+.5)/997),point={x:Math.cos(angle)*38*r,z:Math.sin(angle)*30*r};if(s.huts.every(h=>distance(point,h)>=3)&&s.flowers.every(other=>other===f||distance(point,other)>=1.15)){f.x=point.x;f.z=point.z;seed++;break;}}}}
  const collectTime=s=>s.level===4?.1:1;
  const mapIds=['meadow','forest','sunset','moon'];
  function growMeadow(s){
    const key=s.players.map(p=>Math.floor(p.x/24)+','+Math.floor(p.z/24)).join(';');if(s.flowerKey===key)return;s.flowerKey=key;
    const old=s.flowers,active=s.players.map(p=>old.find(f=>f.id===p.activeFlower));s.flowers=old.filter((f,i)=>i<192||s.players.some(p=>distance(f,p)<60));
    const existing=new Set(s.flowers.map(f=>f.tile).filter(Boolean));
    for(const p of s.players){if(Math.abs(p.x)<24&&Math.abs(p.z)<20)continue;const cx=Math.floor(p.x/24),cz=Math.floor(p.z/24);for(let tx=cx-1;tx<=cx+1;tx++)for(let tz=cz-1;tz<=cz+1;tz++){const tile=tx+','+tz;if(existing.has(tile))continue;existing.add(tile);for(let n=0;n<16;n++){const seed=Math.abs(Math.sin(tx*17.3+tz*73.1+n*2.399)),x=tx*24+(n%4)*6+2+seed*2,z=tz*24+Math.floor(n/4)*6+2+(1-seed)*2;if(s.huts.every(h=>distance({x,z},h)>=3))s.flowers.push({x,z,tile,id:0,done:false,progress:0,regrow:0});}}}
    if(s.flowers.length>8192){const keep=new Set(active.filter(Boolean)),base=s.flowers.slice(0,192),near=s.flowers.slice(192).map(f=>({f,score:keep.has(f)?-1:Math.min(...s.players.map(p=>(p.x-f.x)**2+(p.z-f.z)**2))})).sort((a,b)=>a.score-b.score);s.flowers=base.concat(near.slice(0,8000).map(a=>a.f));}
    s.flowers.forEach((f,id)=>{f.id=id;});s.players.forEach((p,i)=>{p.activeFlower=active[i]?s.flowers.indexOf(active[i]):-1;if(p.activeFlower<0)p.collectProgress=0;});
  }
  const finite=n=>Number.isFinite(n)?n:0;
  const itemIds=['shields','slows','energy','decoys'];
  const itemCount=n=>Number.isFinite(n)?Math.max(0,Math.min(99,Math.floor(n))):0;
  function actor(inventory={},id=0){
    const stash=Object.fromEntries(itemIds.map(key=>[key,itemCount(inventory[key])]));
    const home={...housePositions[id],id};
    return {id,home,x:home.x,z:home.z+2.1,nectar:0,bag:0,deposit:0,stamina:1,surge:0,immunity:0,stash,held:'',folded:false,shields:0,slows:0,energy:0,decoys:0,activeFlower:-1,collectProgress:0,skin:String(inventory.skin||'sun'),hiddenFor:0,hideCooldown:0};
  }
  function addPlayer(s,inventory={}){const p=actor(inventory,s.players.length);s.players.push(p);s.huts.push(p.home);clearHouseFlowers(s);for(const h of s.hunters)move(s,h,0,0,.55,true);return p;}
  function create(level=1,inventory={},options={}){
    level=Math.min(4,Math.max(1,Math.floor(level)||1));
    const s={mode:'playing',level,map:mapIds.includes(options.map)?options.map:'meadow',target:Math.max(1,Math.min(199,Math.floor(options.target)||[6,8,10,112][level-1])),players:[actor(inventory)],hunters:[],flowers:layouts.map(([x,z],id)=>({x,z,id,done:false,progress:0,regrow:0})),obstacles:[],nectar:0,decoy:null,grace:3,slowed:0,elapsed:0,events:[],eventDetails:[]};
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
    const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.08));
    for(let i=0;i<steps;i++){const previous={x:p.x,z:p.z};p.x+=dx/steps;p.z+=dz/steps;bound(p,hunter?0:r);
      for(let k=0;k<3;k++){for(const o of s.obstacles)project(p,o,o.radius+r);for(const home of s.huts||[hut]){if(hunter)project(p,home,hut.hunterExclusion);else hutWall(p,previous,home);}bound(p,hunter?0:r);}
    }
  }
  function separateHunters(s){
    for(let pass=0;pass<3;pass++){
      for(let i=0;i<s.hunters.length;i++)for(let j=i+1;j<s.hunters.length;j++){
        const a=s.hunters[i],b=s.hunters[j];let dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);if(d>=1.12)continue;
        if(d<1e-8){const angle=(i*7+j)*2.399963;dx=Math.cos(angle);dz=Math.sin(angle);d=1;}else{dx/=d;dz/=d;}
        const push=(1.12-(Math.hypot(b.x-a.x,b.z-a.z)))*.5;move(s,a,-dx*push,-dz*push,.55,true);move(s,b,dx*push,dz*push,.55,true);
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
      const moving=Math.hypot(x,z)>.01,boosted=!!a.boost&&moving;
      if(moving){p.hiddenFor=0;p.folded=false;}
      p.stamina=1;
      const speed=(boosted?(s.level===4?12:7.6):4.3)*(p.surge>0?1.35:1);move(s,p,x*speed*dt,z*speed*dt,world.playerRadius);
      if(a.deposit&&!moving&&isSafe(p)&&p.bag&&s.nectar<s.target){p.deposit+=dt;if(p.deposit>=1-1e-8){p.bag=0;p.deposit=0;s.nectar=Math.min(s.target,s.nectar+1);p.nectar++;event(s,'deposit',i);}}else p.deposit=0;
      const f=a.collect&&!moving&&!p.bag?s.flowers.find(f=>!f.done&&distance(f,p)<.85):null;
      if(f){if(p.activeFlower!==f.id)p.collectProgress=0;p.activeFlower=f.id;p.collectProgress+=dt;f.progress=Math.max(f.progress,p.collectProgress/collectTime(s));
        if(p.collectProgress>=collectTime(s)-1e-8){f.done=true;f.regrow=8;f.progress=1;p.bag=1;p.activeFlower=-1;p.collectProgress=0;event(s,'collect',i);}
      }else{p.activeFlower=-1;p.collectProgress=0;}
    }
    if(s.nectar>=s.target){s.mode='won';returnTools(s);event(s,'won');return;}
    if(s.grace>0){separateHunters(s);return;}
    for(const h of s.hunters){
      const visible=s.players.filter(p=>p.hiddenFor<=0);const targets=visible.filter(p=>!isSheltered(s,p));const choices=targets.length?targets:visible;
      const target=s.decoy||(choices.length?choices.reduce((best,p)=>distance(h,p)<distance(h,best)?p:best,choices[0]):{x:Math.cos(s.elapsed*.18+h.id)*7,z:Math.sin(s.elapsed*.18+h.id)*5-1});
      let tx=target.x,tz=target.z;
      const protectedHome=(s.huts||[hut]).find(home=>distance(target,home)<=hut.radius);if(protectedHome){const d=distance(h,protectedHome)||1;tx=protectedHome.x+(h.x-protectedHome.x)/d*3.8;tz=protectedHome.z+(h.z-protectedHome.z)/d*3.8;}
      let dx=tx-h.x,dz=tz-h.z,d=Math.hypot(dx,dz),hs=([2.1,2.65,3.15,3.5][s.level-1])*(s.slowed>0?.38:1);
      // A small tangential detour lets pursuers walk around circular obstacles.
      for(const o of s.obstacles){const od=distance(h,o);if(od<o.radius+1.15&&dx*(o.x-h.x)+dz*(o.z-h.z)>0){const side=(h.id%2?1:-1);dx+=(h.z-o.z)*side*2.4;dz-=(h.x-o.x)*side*2.4;d=Math.hypot(dx,dz);break;}}
      const ease=1-Math.exp(-dt*4);h.vx+=((d>.2?dx/d*hs:0)-h.vx)*ease;h.vz+=((d>.2?dz/d*hs:0)-h.vz)*ease;
      move(s,h,h.vx*dt,h.vz*dt,.55,true);
    }
    separateHunters(s);
    for(const h of s.hunters){
      for(let i=0;i<s.players.length;i++){const p=s.players[i];if(!isSheltered(s,p)&&p.hiddenFor<=0&&p.immunity<=0&&distance(p,h)<1.4){
        if(p.shields>0){consume(p,'shields');p.immunity=3.5;event(s,'shield',i);const a=Math.atan2(h.z-p.z,h.x-p.x);move(s,h,Math.cos(a)*2.8,Math.sin(a)*2.8,.55,true);}
        else if(i===0){s.mode='dead';returnTools(s);event(s,'dead',i);return;}
        else{const home=hutFor(p);Object.assign(p,{x:home.x,z:home.z+2.1,bag:0,deposit:0,collectProgress:0,activeFlower:-1,hiddenFor:0,folded:false,immunity:3.5});event(s,'respawn',i);}
      }}
    }
  }
  function tick(s,delta,input={}){if(s.mode!=='playing')return;let remaining=Math.min(.1,Math.max(0,finite(delta)));while(remaining>1e-9&&s.mode==='playing'){const dt=Math.min(.02,remaining);step(s,dt,input);remaining-=dt;}}
  return {create,addPlayer,tick,slow,hide,fold,refill,decoy,equip,returnTools,isSafe,isSheltered,hutFor,collectTime,hut,world,targetFor,mapIds};
})();
if(typeof module!=='undefined')module.exports=globalThis.GardenRules;
