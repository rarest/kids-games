const COLORS=['#ed4949','#4189ee','#f3b63a','#a269db'];
const DIRS=[[1,0],[0,1],[-1,0],[0,-1]];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
let runCounter=0;
function random(g){
  g.rng=(g.rng+0x6d2b79f5)>>>0;
  let t=g.rng;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);
  return ((t^t>>>14)>>>0)/4294967296;
}
function cell(g,x,y){
  const xx=Math.floor(x),yy=Math.floor(y);
  return xx>=0&&xx<g.cols&&yy>=0&&yy<g.rows?yy*g.cols+xx:-1;
}
const center=(g,i)=>({x:i%g.cols+.5,y:Math.floor(i/g.cols)+.5});
function neighbors(g,i){
  const x=i%g.cols,y=Math.floor(i/g.cols),out=[];
  for(const [dx,dy] of DIRS){const j=cell(g,x+dx,y+dy);if(j>=0&&g.mask[j])out.push(j);}
  return out;
}
function event(g,type,id,data={}){
  g.events.push({type,id,time:g.time,...data});
  if(g.events.length>100)g.events.splice(0,g.events.length-100);
}
function landPath(g,id,start,end){
  if(start<0||end<0||g.owners[start]!==id||g.owners[end]!==id)return null;
  const previous=new Map([[start,-1]]),queue=[start];
  for(const i of queue){
    if(i===end){const path=[];for(let j=end;j!==-1;j=previous.get(j))path.push(j);return path.reverse();}
    for(const j of neighbors(g,i))if(g.owners[j]===id&&!previous.has(j)){previous.set(j,i);queue.push(j);}
  }
  return null;
}
export function coverage(g,id){
  let total=0,owned=0;
  for(let i=0;i<g.mask.length;i++)if(g.mask[i]){total++;if(g.owners[i]===id)owned++;}
  return total?owned/total:0;
}
function checkResult(g){
  const counts=Array(g.players.length).fill(0);let total=0;
  for(let i=0;i<g.mask.length;i++)if(g.mask[i]){total++;if(g.owners[i]>=0)counts[g.owners[i]]++;}
  g.peak=Math.max(g.peak,total?counts[0]/total:0);
  for(const p of g.players)if(p.alive&&counts[p.id]===0){
    p.alive=false;clearTrail(p);p.route=[];event(g,'eliminated',p.id);
  }
  if(g.mode==='over')return;
  const winner=total?counts.findIndex(n=>n===total):-1;
  if(winner>=0){g.winner=winner;g.mode='over';event(g,'win',winner);}
  else if(!g.players[0].alive){g.mode='over';event(g,'end',0);}
}
function inside(x,y,polygon){
  let contained=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
    const a=polygon[i],b=polygon[j];
    if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)contained=!contained;
  }
  return contained;
}
function clearTrail(p){
  p.trail=[];p.trailStart=null;p.openPath=[];p.pendingClaim=[];p.stroke=[];
}
function simplifyStroke(points,tolerance){
  const keep=new Set([0,points.length-1]),stack=[[0,points.length-1]],limit=tolerance*tolerance;
  while(stack.length){const [a,b]=stack.pop(),s=points[a],e=points[b],dx=e.x-s.x,dy=e.y-s.y,length=dx*dx+dy*dy;let far=-1,best=limit;
    for(let i=a+1;i<b;i++){const p=points[i],t=length?clamp(((p.x-s.x)*dx+(p.y-s.y)*dy)/length,0,1):0,d=(p.x-s.x-t*dx)**2+(p.y-s.y-t*dy)**2;if(d>best){best=d;far=i}}
    if(far>=0){keep.add(far);stack.push([a,far],[far,b]);}
  }
  return [...keep].sort((a,b)=>a-b).map(i=>points[i]);
}
function tracePosition(p,x,y){
  const points=p.stroke,last=points.at(-1);if(last&&Math.hypot(x-last.x,y-last.y)<.00001)return;
  const third=points.at(-3),second=points.at(-2);
  // Repeating the same out-and-back adds no new ribbon geometry. Keep one
  // traversal with the current endpoint instead of accumulating reversals.
  if(third&&Math.hypot(third.x-last.x,third.y-last.y)<.00001&&Math.hypot(second.x-x,second.y-y)<.00001)points.length-=2;
  const before=points.at(-2),tip=points.at(-1);
  if(before&&tip){const ax=tip.x-before.x,ay=tip.y-before.y,bx=x-tip.x,by=y-tip.y;
    if(ax*bx+ay*by>=0&&Math.abs(ax*by-ay*bx)<.00001)points.pop();
  }
  points.push({x,y});
  if(points.length>4096){let tolerance=.025;do{p.stroke=simplifyStroke(p.stroke,tolerance);tolerance*=2;}while(p.stroke.length>4096);}
}
function appendTrail(g,p,i){
  // Visible/collidable trail cells are unique. Geometry keeps only a simple
  // open path, while completed sub-loops contribute their interiors by union.
  if(!p.trail.some(v=>cell(g,v.x,v.y)===i))p.trail.push(center(g,i));
  const repeated=p.openPath.indexOf(i);
  if(repeated<0){p.openPath.push(i);return;}
  const loop=p.openPath.slice(repeated);
  if(loop.length>=3){
    const polygon=loop.map(j=>center(g,j)),pending=new Set(p.pendingClaim);
    for(let j=0;j<g.mask.length;j++)if(g.mask[j]&&!pending.has(j)){
      const c=center(g,j);if(inside(c.x,c.y,polygon))pending.add(j);
    }
    p.pendingClaim=[...pending];
  }
  p.openPath.length=repeated+1;
}
function closeTrail(g,p,end){
  // The owned return path completes the polygon. No island boundary is treated
  // as an exterior seed, so loops beside coastlines cannot capture the exterior.
  if(g.owners[p.trailStart]!==p.id){cutTrail(g,p);return false;}
  const home=landPath(g,p.id,end,p.trailStart);
  // Two separated own regions may be reconnected across enemy land. Without
  // an existing home path only the traversed bridge/sub-loops are claimed.
  const polygon=home?[...(p.stroke?.length?p.stroke:p.openPath.map(i=>center(g,i))),...home.map(i=>center(g,i))]:[];
  const traced=new Set([...p.trail.map(v=>cell(g,v.x,v.y)),...p.pendingClaim]);let gained=0;
  for(let i=0;i<g.mask.length;i++)if(g.mask[i]&&g.owners[i]!==p.id){
    const pos=center(g,i);
    if(traced.has(i)||inside(pos.x,pos.y,polygon)){g.owners[i]=p.id;gained++;}
  }
  clearTrail(p);
  if(gained){g.revision++;event(g,'capture',p.id,{cells:gained});}
  checkResult(g);
  for(const other of g.players)if(other.id!==p.id&&other.alive&&!other.trail.length&&g.owners[cell(g,other.x,other.y)]!==other.id){
    returnHome(g,other);event(g,'displaced',other.id);
  }
  return true;
}
function returnHome(g,p){
  p.route=[];p.cooldown=.8;
  let nearest=-1,distance=Infinity;
  for(let i=0;i<g.mask.length;i++)if(g.mask[i]&&g.owners[i]===p.id){
    const c=center(g,i),d=(c.x-p.x)**2+(c.y-p.y)**2;
    if(d<distance){distance=d;nearest=i;}
  }
  if(nearest>=0)Object.assign(p,center(g,nearest));
  else p.alive=false;
}
function cutTrail(g,p){
  if(!p.trail.length)return;
  clearTrail(p);returnHome(g,p);
  event(g,'cut',p.id);
}
function touchTrail(g,p,i){
  // Legacy handcrafted states without a precise stroke retain cell detection.
  for(const other of g.players)if(other.id!==p.id&&other.alive&&!(other.stroke?.length>1)&&other.trail.some(v=>cell(g,v.x,v.y)===i))cutTrail(g,other);
}
function pointSegmentDistance(p,a,b){
  const dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy,t=length?clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/length,0,1):0;
  return (p.x-a.x-t*dx)**2+(p.y-a.y-t*dy)**2;
}
function segmentDistance(a,b,c,d){
  const dx=b.x-a.x,dy=b.y-a.y,ux=d.x-c.x,uy=d.y-c.y,den=dx*uy-dy*ux;
  if(Math.abs(den)>1e-12){const vx=c.x-a.x,vy=c.y-a.y,t=(vx*uy-vy*ux)/den,u=(vx*dy-vy*dx)/den;if(t>=0&&t<=1&&u>=0&&u<=1)return 0;}
  return Math.min(pointSegmentDistance(a,c,d),pointSegmentDistance(b,c,d),pointSegmentDistance(c,a,b),pointSegmentDistance(d,a,b));
}
function touchStroke(g,p,x,y){
  const a={x:p.x,y:p.y},b={x,y},radius=.25;
  for(const other of g.players){
    if(other.id===p.id||!other.alive||!other.trail.length||!(other.stroke?.length>1))continue;
    for(let n=1;n<other.stroke.length;n++){const c=other.stroke[n-1],d=other.stroke[n];
      if(Math.max(a.x,b.x)+radius<Math.min(c.x,d.x)||Math.min(a.x,b.x)-radius>Math.max(c.x,d.x)||Math.max(a.y,b.y)+radius<Math.min(c.y,d.y)||Math.min(a.y,b.y)-radius>Math.max(c.y,d.y))continue;
      if(segmentDistance(a,b,c,d)<=radius*radius){cutTrail(g,other);break;}
    }
  }
}
function enter(g,p,i,previous){
  touchTrail(g,p,i);
  if(g.owners[i]===p.id){if(p.trail.length&&!closeTrail(g,p,i))return false;}
  else {
    if(!p.trail.length){
      if(g.owners[previous]!==p.id)return false;
      p.trailStart=previous;p.openPath=[previous];p.pendingClaim=[];p.stroke=[{x:p.x,y:p.y}];
    }
    appendTrail(g,p,i);
  }
  return true;
}
export function movePlayer(g,id,x,y){
  const p=g.players[id],target=cell(g,x,y);
  if(g.mode!=='playing'||!p?.alive||p.cooldown>0||!Number.isFinite(x)||!Number.isFinite(y)||target<0||!g.mask[target])return false;
  const fromX=p.x,fromY=p.y,dx=x-fromX,dy=y-fromY,steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/.12));
  for(let n=1;n<=steps&&g.mode==='playing';n++){
    const xx=fromX+dx*n/steps,yy=fromY+dy*n/steps,i=cell(g,xx,yy),previous=cell(g,p.x,p.y);
    if(i<0||!g.mask[i])return false;
    // A diagonal cannot squeeze between two blocked cells.
    if(i%g.cols!==previous%g.cols&&Math.floor(i/g.cols)!==Math.floor(previous/g.cols)){
      const a=cell(g,xx,p.y),b=cell(g,p.x,yy);
      if(!g.mask[a]||!g.mask[b])return false;
      touchStroke(g,p,xx,yy);
      // Both cells touched at a corner can hold an enemy trail, regardless of
      // movement direction. Only one is used for the orthogonal polygon path.
      touchTrail(g,p,b);
      // Visit the intermediate cell too: diagonal movement must not skip a trail.
      if(!enter(g,p,a,previous))return false;
      if(!enter(g,p,i,a))return false;
    }else{touchStroke(g,p,xx,yy);if(i!==previous&&!enter(g,p,i,previous))return false;}
    p.x=xx;p.y=yy;if(p.trail.length)tracePosition(p,xx,yy);
  }
  return true;
}
function island(g){
  const phases=Array.from({length:3},()=>random(g)*Math.PI*2),mask=Array(g.cols*g.rows).fill(0);
  for(let y=0;y<g.rows;y++)for(let x=0;x<g.cols;x++){
    const nx=(x+.5-g.cols/2)/(g.cols*.45),ny=(y+.5-g.rows/2)/(g.rows*.45),a=Math.atan2(ny,nx);
    const radius=.92+.065*Math.sin(a*3+phases[0])+.065*Math.cos(a*5+phases[1])+.04*Math.sin(a*7+phases[2]);
    if(Math.hypot(nx,ny)<radius)mask[y*g.cols+x]=1;
  }
  // Keep only the central component, including on unusually small maps.
  const start=cell(g,g.cols/2,g.rows/2),seen=new Set([start]),queue=[start];mask[start]=1;
  for(const i of queue)for(const j of neighbors({...g,mask},i))if(!seen.has(j)){seen.add(j);queue.push(j);}
  return mask.map((v,i)=>v&&seen.has(i)?1:0);
}
export function createGame({seed=Date.now(),cols=44,rows=38,bots=3}={}){
  cols=clamp(Math.floor(Number(cols)||44),7,100);rows=clamp(Math.floor(Number(rows)||38),7,100);
  const numeric=typeof seed==='number'?seed:Array.from(String(seed)).reduce((n,c)=>Math.imul(n,31)+c.charCodeAt(0),0);
  const g={seed,cols,rows,rng:numeric>>>0,mask:[],owners:Array(cols*rows).fill(-1),players:[],mode:'playing',winner:null,time:0,peak:0,events:[],revision:0,speed:3.6,
    runId:globalThis.crypto?.randomUUID?.()||`${Date.now().toString(36)}-${++runCounter}-${Math.random().toString(36).slice(2)}`};
  g.mask=island(g);
  const candidates=[];
  for(let i=0;i<g.mask.length;i++)if(g.mask[i]){
    const x=i%cols,y=Math.floor(i/cols);
    if(x>=1&&y>=1&&x<cols-1&&y<rows-1&&[-1,0,1].every(dy=>[-1,0,1].every(dx=>g.mask[(y+dy)*cols+x+dx])))candidates.push(i);
  }
  for(let id=0;id<=clamp(Math.floor(Number(bots)||0),0,3);id++){
    let selected=-1,best=-1;
    for(const i of candidates){
      const c=center(g,i);if(g.owners[i]>=0)continue;
      const d=id?Math.min(...g.players.map(p=>(c.x-p.x)**2+(c.y-p.y)**2)):-((c.x-cols*.27)**2+(c.y-rows*.5)**2);
      if(d>best||selected<0){best=d;selected=i;}
    }
    if(selected<0)break;
    const c=center(g,selected),p={id,...c,trail:[],stroke:[],trailStart:null,openPath:[],pendingClaim:[],alive:true,color:COLORS[id],name:id?`纸片 ${id}`:'你',cooldown:0,route:[]};
    g.players.push(p);
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      const i=cell(g,c.x+dx,c.y+dy);if(g.mask[i]&&g.owners[i]===-1)g.owners[i]=id;
    }
  }
  g.revision=1;g.peak=coverage(g,0);return g;
}
function planBot(g,p){
  const start=cell(g,p.x,p.y);
  if(g.owners[start]!==p.id){cutTrail(g,p);return;}
  const previous=new Map([[start,-1]]),queue=[start],boundaries=[];
  for(const i of queue)for(const j of neighbors(g,i)){
    if(g.owners[j]===p.id){if(!previous.has(j)){previous.set(j,i);queue.push(j);}}
    else boundaries.push([i,j]);
  }
  if(!boundaries.length)return;
  let best=null,bestScore=-1;
  // Rectangles are actual traversed routes. Short excursions handle narrow tips
  // where no rectangle fits, so every connected map cell remains reachable.
  const offset=Math.floor(random(g)*boundaries.length);
  for(let n=0;n<Math.min(boundaries.length,40);n++){
    const [home,outside]=boundaries[(n+offset)%boundaries.length],hx=home%g.cols,hy=Math.floor(home/g.cols);
    const dx=outside%g.cols-hx,dy=Math.floor(outside/g.cols)-hy;
    for(const side of [-1,1])for(const length of [2,3,4]){
      const sx=-dy*side,sy=dx*side,loop=[home];let valid=true;
      for(const [vx,vy,count] of [[dx,dy,length],[sx,sy,3],[-dx,-dy,length],[-sx,-sy,3]]){
        for(let k=0;k<count;k++){
          const last=loop.at(-1),i=cell(g,last%g.cols+vx,Math.floor(last/g.cols)+vy);
          if(i<0||!g.mask[i]){valid=false;break;}loop.push(i);
        }
        if(!valid)break;
      }
      if(!valid)continue;
      const score=loop.reduce((sum,i)=>sum+(g.owners[i]!==p.id?1:0),0);
      if(score>bestScore){bestScore=score;best={home,loop};}
    }
  }
  if(!best){const [home,outside]=boundaries[offset];best={home,loop:[home,outside,home]};}
  const path=[];for(let i=best.home;i!==-1;i=previous.get(i))path.push(i);
  p.route=[...path.reverse().slice(1),...best.loop.slice(1)].map(i=>center(g,i));
}
export function stepGame(g,dt,input={x:0,y:0}){
  if(g.mode!=='playing'||!Number.isFinite(dt)||dt<=0)return;
  checkResult(g);
  let remaining=Math.min(dt,5);
  while(remaining>1e-8&&g.mode==='playing'){
    const slice=Math.min(remaining,1/30);remaining-=slice;g.time+=slice;
    for(const p of g.players)p.cooldown=Math.max(0,p.cooldown-slice);
    const dx=Number(input.x)||0,dy=Number(input.y)||0,length=Math.hypot(dx,dy);
    if(length&&g.players[0].alive){const p=g.players[0],speed=g.speed*(input.slow?.65:1);
      movePlayer(g,0,p.x+dx/Math.max(1,length)*speed*slice,p.y+dy/Math.max(1,length)*speed*slice);
    }
    for(const p of g.players.slice(1))if(p.alive&&p.cooldown<=0&&g.mode==='playing'){
      if(!p.route.length)planBot(g,p);
      const target=p.route[0];if(!target)continue;
      const dx=target.x-p.x,dy=target.y-p.y,distance=Math.hypot(dx,dy),travel=Math.min(distance,g.speed*.78*slice);
      if(distance<1e-8){p.route.shift();continue;}
      const moved=movePlayer(g,p.id,p.x+dx/distance*travel,p.y+dy/distance*travel);
      if(!moved){p.route=[];if(p.trail.length)cutTrail(g,p);}
      else if(distance<=travel+1e-8)p.route.shift();
    }
  }
}
export function finishRun(g){
  if(g.mode==='over')return false;
  checkResult(g);
  if(g.mode!=='over'){g.mode='over';event(g,'end',0);}
  return true;
}
