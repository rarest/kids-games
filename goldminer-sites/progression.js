export const STARTING_FUNDS=5000;
export const DYNAMITE_PRICE=150;
export function createEconomy(){return {wallet:STARTING_FUNDS,earned:0,winch:0}}
export function bankMinerals(e,value){e.wallet+=value;e.earned+=value}
export function winchPrice(e){return 400+e.winch*250}
export function purchase(e,item){
 if(!['dynamite','winch'].includes(item)||(item==='winch'&&e.winch>=3))return false;
 const price=item==='winch'?winchPrice(e):DYNAMITE_PRICE;
 if(e.wallet<price)return false;
 e.wallet-=price;if(item==='winch')e.winch++;return true;
}
export function mineTheme(level){
 return [
  {name:'黄金矿脉',hint:'金块与钻石混合，先积累装备'},
  {name:'巨石矿井',hint:'岩石重25%，炸药优先清除重石'},
  {name:'钻石矿井',hint:'钻石价值增加50%，绞盘加快回收'},
 ][(level-1)%3];
}
export function applyMineTheme(items,level){
 const kind=(level-1)%3;
 return items.map(item=>({...item,
  weight:kind===1&&item.kind==='rock'?item.weight*1.25:item.weight,
  value:kind===2&&item.kind==='diamond'?Math.round(item.value*1.5):item.value,
 }));
}
export function selectBlastTarget(hooks,minerals){
 const weights=new Map(minerals.map(m=>[m.id,m.weight]));
 return hooks.filter(h=>h.mode==='retract'&&weights.has(h.grabbedId))
  .sort((a,b)=>weights.get(b.grabbedId)-weights.get(a.grabbedId))[0];
}
