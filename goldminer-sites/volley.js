const ORIGIN={x:450,y:72};
export const MIN_LENGTH=54;
// Reserve a distinct mineral at launch; no pairwise per-frame collision scans.
export function createVolley(minerals){
 return minerals.map(item=>{
  const dx=item.x-ORIGIN.x,dy=item.y-ORIGIN.y,distance=Math.hypot(dx,dy);
  return {angle:Math.atan2(dx,dy),direction:1,length:MIN_LENGTH,mode:'extend',grabbedId:item.id,distance:Math.max(MIN_LENGTH,distance),sin:dx/distance,cos:dy/distance};
 });
}
export function advanceVolley(hooks,minerals,dt){
 const byId=new Map(minerals.map(item=>[item.id,item]));
 const collected=[];
 for(const hook of hooks){
  if(hook.mode==='done')continue;
  const item=byId.get(hook.grabbedId);
  let remaining=Math.max(0,dt);
  if(!item)hook.mode='retract';
  if(hook.mode==='extend'){
   const travel=Math.max(0,(hook.distance-hook.length)/450);
   if(remaining<travel){hook.length+=remaining*450;continue;}
   hook.length=hook.distance;remaining-=travel;hook.mode='retract';
  }
  const speed=item?340/item.weight:560;
  hook.length=Math.max(MIN_LENGTH,hook.length-remaining*speed);
  if(hook.length<=MIN_LENGTH){
   hook.mode='done';
   if(item){collected.push(item);byId.delete(item.id);}
  }
 }
 if(collected.length){const ids=new Set(collected.map(item=>item.id));for(let i=minerals.length-1;i>=0;i--)if(ids.has(minerals[i].id))minerals.splice(i,1);}
 return {value:collected.reduce((sum,item)=>sum+item.value,0),collected};
}
