// A volley transmits its origin and live-lane mask, rather than every projectile.
// The server still simulates all 100 lanes and decides which ones hit.
export function encodeVolleys(bullets){
 const groups=new Map();
 for(const b of bullets){
  const v=b.volley;if(!v)continue;
  let group=groups.get(v.id);
  if(!group){group={v,age:(b.y-v.y)/b.vy,mask:new Uint8Array(Math.ceil(v.spread/8))};groups.set(v.id,group)}
  group.mask[b.lane>>3]|=1<<(b.lane&7);
 }
 return [...groups.values()].map(({v,age,mask})=>[v.id,v.owner,v.x,v.y,v.speed,v.spread,Math.round(age*1e6)/1e6,[...mask].map(n=>n.toString(16).padStart(2,'0')).join('')]);
}
const directions=new Map();
export function decodeVolleys(volleys,cache=new Map()){
 const bullets=[];const next=new Map();
 for(const [id,owner,x,y,speed,spread,age,mask]of volleys){
  let angles=directions.get(spread);if(!angles){angles=Array.from({length:spread},(_,i)=>{const angle=spread===1?0:(i/(spread-1)-.5)*1.25;return [Math.sin(angle),-Math.cos(angle)]});directions.set(spread,angles)}
  for(let i=0;i<spread;i++){
   if(!(parseInt(mask.slice((i>>3)*2,(i>>3)*2+2),16)&(1<<(i&7))))continue;
   const key=`${id}:${i}`,b=cache.get(key)||{},[dx,dy]=angles[i];b.x=x+dx*speed*age;b.y=y+dy*speed*age;b.vx=dx*speed;b.vy=dy*speed;b.owner=owner;b.r=4;
   bullets.push(b);next.set(key,b);
  }
 }
 cache.clear();for(const [key,b]of next)cache.set(key,b);return bullets;
}
