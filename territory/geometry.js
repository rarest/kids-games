// Trace the union, including holes and disconnected patches. Shared edges are
// never drawn; right turns keep diagonally touching patches separate.
export function contours(mask,cols,rows){
  const edges=[],starts=new Map(),stride=cols+1;
  const add=(x,y,u,v,d)=>{const e={x,y,u,v,d,used:false},k=y*stride+x;edges.push(e);if(!starts.has(k))starts.set(k,[]);starts.get(k).push(e)};
  for(let i=0;i<mask.length;i++)if(mask[i]){const x=i%cols,y=Math.floor(i/cols);
    if(!y||!mask[i-cols])add(x,y,x+1,y,0);
    if(x===cols-1||!mask[i+1])add(x+1,y,x+1,y+1,1);
    if(y===rows-1||!mask[i+cols])add(x+1,y+1,x,y+1,2);
    if(!x||!mask[i-1])add(x,y+1,x,y,3);
  }
  const loops=[];
  for(const first of edges){if(first.used)continue;const loop=[];let e=first;
    while(e&&!e.used){e.used=true;loop.push({x:e.x,y:e.y});const candidates=starts.get(e.v*stride+e.u)||[],order=[(e.d+1)%4,e.d,(e.d+3)%4,(e.d+2)%4];e=order.flatMap(d=>candidates.filter(v=>!v.used&&v.d===d))[0];}
    if(loop.length>=4)loops.push(loop);
  }
  return loops;
}
export function smoothContour(points){
  // Keep the unit edge vertices: rounding a long merged edge would cut deeply
  // into valid land. Smoothing stays within a fraction of a logical cell.
  let p=points;
  for(let pass=0;pass<2;pass++){const next=[];for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];next.push({x:a.x*.75+b.x*.25,y:a.y*.75+b.y*.25},{x:a.x*.25+b.x*.75,y:a.y*.25+b.y*.75})}p=next;}
  return p;
}
export function viewport(game,w,h,follow=true){
  const scale=follow?Math.max(w/42,h/30,Math.min(w/26,h/22)):Math.min((w-26)/game.cols,(h-32)/game.rows);
  const viewWidth=w/scale,viewHeight=h/scale,p=game.players[0];
  const cx=follow?Math.max(viewWidth/2,Math.min(game.cols-viewWidth/2,p.x)):game.cols/2;
  const cy=follow?Math.max(viewHeight/2,Math.min(game.rows-viewHeight/2,p.y)):game.rows/2;
  return {scale,ox:w/2-cx*scale,oy:h/2-cy*scale,viewWidth,viewHeight,cx,cy};
}
