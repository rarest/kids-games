export const containsCircle=(circles,x,y)=>circles.some(c=>(x-c.x)**2+(y-c.y)**2<=c.r*c.r+1e-9);
// Exact squared Euclidean distance transform; padding represents the coast.
function distanceLine(f){
  const n=f.length,v=new Int32Array(n),z=new Float64Array(n+1),out=new Float64Array(n);let k=0;z[0]=-Infinity;z[1]=Infinity;
  for(let q=1;q<n;q++){let s;do{s=((f[q]+q*q)-(f[v[k]]+v[k]*v[k]))/(2*q-2*v[k]);if(s<=z[k])k--;else break;}while(k>=0);k++;v[k]=q;z[k]=s;z[k+1]=Infinity;}
  k=0;for(let q=0;q<n;q++){while(z[k+1]<q)k++;out[q]=(q-v[k])**2+f[v[k]];}return out;
}
export function circleCover(mask,cols,rows){
  const w=cols+2,h=rows+2,dist=new Float64Array(w*h);
  for(let y=0;y<h;y++){const f=Array.from({length:w},(_,x)=>x&&y&&x<w-1&&y<h-1&&mask[(y-1)*cols+x-1]?1e12:0);dist.set(distanceLine(f),y*w);}
  for(let x=0;x<w;x++){const d=distanceLine(Array.from({length:h},(_,y)=>dist[y*w+x]));for(let y=0;y<h;y++)dist[y*w+x]=d[y];}
  const candidates=[];for(let i=0;i<mask.length;i++)if(mask[i]){const x=i%cols,y=Math.floor(i/cols);candidates.push({i,x:x+.5,y:y+.5,r:Math.max(.56,Math.sqrt(dist[(y+1)*w+x+1])-.55)});}
  candidates.sort((a,b)=>b.r-a.r);const covered=new Int32Array(mask.length).fill(-1),circles=[];
  for(const c of candidates){if(covered[c.i]>=0)continue;const id=circles.length;circles.push({x:c.x,y:c.y,r:c.r});
    for(let y=Math.max(0,Math.floor(c.y-c.r));y<Math.min(rows,Math.ceil(c.y+c.r));y++)for(let x=Math.max(0,Math.floor(c.x-c.r));x<Math.min(cols,Math.ceil(c.x+c.r));x++)if((x+.5-c.x)**2+(y+.5-c.y)**2<=c.r*c.r&&covered[y*cols+x]<0)covered[y*cols+x]=id;
  }
  // Cover a narrow neck with a small circle whenever its two covering disks
  // do not meet. Midpoints between owned neighbors exclude every other center.
  for(let i=0;i<mask.length;i++)if(mask[i])for(const j of [i%cols<cols-1?i+1:-1,i+cols<mask.length?i+cols:-1]){
    if(j<0||!mask[j]||covered[i]===covered[j])continue;const a=circles[covered[i]],b=circles[covered[j]];
    if(Math.hypot(a.x-b.x,a.y-b.y)>a.r+b.r)circles.push({x:(i%cols+j%cols)/2+.5,y:(Math.floor(i/cols)+Math.floor(j/cols))/2+.5,r:.56});
  }
  return circles;
}
export function viewport(game,w,h,follow=true){
  const scale=follow?Math.max(w/42,h/30,Math.min(w/26,h/22)):Math.min((w-26)/game.cols,(h-32)/game.rows);
  const viewWidth=w/scale,viewHeight=h/scale,p=game.players[0];
  const cx=follow?Math.max(viewWidth/2,Math.min(game.cols-viewWidth/2,p.x)):game.cols/2;
  const cy=follow?Math.max(viewHeight/2,Math.min(game.rows-viewHeight/2,p.y)):game.rows/2;
  return {scale,ox:w/2-cx*scale,oy:h/2-cy*scale,viewWidth,viewHeight,cx,cy};
}
