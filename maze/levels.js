import { GENERATED_LAYOUTS } from './generated-levels.js?v=20260831a';

const NORMAL_NAMES=['皇家花园','珊瑚宫殿','翡翠秘境','紫晶城堡','黄金神殿','冰蓝王宫','绯红剧院','星空圣殿','幻彩云宫','永恒皇冠迷城'];
const REWARD_NAMES=['蜂蜜灯笼庭院','樱花珍珠长廊','暖阳翡翠宫','玫瑰金宴会厅','水晶糖果王国','月桂灯火圣殿','彩云宝石天宫','星辉黄金大道','皇冠极光庆典宫'];
const NORMAL_PALETTES=[
 ['#172d3b','#315c49','#7553a6','#bca2ed','#302044','#ffd86b','#8ff0ca','#b98cff'],['#071d38','#123f58','#167f91','#6de0e0','#06304b','#ffc883','#ff8cb8','#66d9ff'],['#092c2a','#174b3e','#21805b','#8ee3a4','#0b382f','#f5d76e','#72f6ce','#63d893'],['#22113e','#3b2160','#744da3','#c89be8','#2b1645','#ffd77c','#ff91d7','#b882ff'],['#3a2108','#674111','#a86d18','#f5cf63','#4c2e0b','#fff19b','#ffba40','#ffd95c'],['#071c35','#173d62','#3975a3','#a7e5ff','#0a2949','#e8fbff','#75dcff','#b4efff'],['#360c1c','#651a31','#9c3150','#f29ab1','#471023','#ffcf72','#ff799f','#ffb0c5'],['#0b1235','#1d275a','#4d4e9a','#aaa7ff','#131945','#ffe67b','#75eaff','#9d8cff'],['#271351','#4e2d78','#8d58ad','#e2a6ff','#351c61','#ffe980','#7cf7e2','#ff83ef'],['#2b1708','#52330e','#8e651d','#f1ce61','#392207','#fff0a0','#ffd14f','#fff2b3']
];
const REWARD_PALETTES=[
 ['#3a2414','#6b4525','#c4813f','#ffe1a0','#4d3019','#fff08a','#ffc65c','#fff2bf'],['#432333','#7a3e55','#c8798e','#ffd2dc','#57283d','#ffe89b','#ffabc3','#fff1d0'],['#203321','#45633d','#80a65c','#e1eca6','#2d432a','#ffe780','#f0c75a','#fff5b0'],['#442319','#804838','#c78363','#ffd0aa','#593027','#ffe08a','#f4a25e','#fff0bb'],['#34224f','#694a89','#b888c8','#f2d5ff','#492f62','#fff08a','#ff9fd8','#fff4c5'],['#2e2b19','#605837','#a49559','#eee0a1','#403b25','#ffe879','#f4bd54','#fff3bd'],['#24325a','#536b9a','#8fa9d8','#e1edff','#314472','#ffe788','#ffb3e2','#fff5c6'],['#30240c','#685317','#ad8c2d','#f4d96f','#46360e','#fff39a','#ffc74f','#fff7c9'],['#3b2854','#75569a','#b994d4','#f1dcff','#50366e','#fff19c','#ffd45c','#ffffff']
];
const LEGACY_REWARD_COIN_COORDS=[
 ['10,2','7,3','2,5','8,5','12,7'],
 ['11,2','16,3','14,5','3,7','9,7','4,9','10,9','14,11'],
 ['8,2','6,3','8,4','6,5','8,6','10,7','9,9','8,10','5,11','8,11','4,13'],
 ['9,2','13,3','11,5','2,7','7,7','3,9','8,9','11,11','9,12','13,13','2,15','7,15','2,17','7,17'],
 ['10,2','7,3','3,5','8,5','11,7','10,8','14,9','5,11','10,11','5,13','10,13','13,15','10,17','15,17','4,19','9,19','4,21'],
 ['11,2','15,3','13,5','4,7','9,7','5,9','10,9','13,11','11,13','16,13','6,15','11,15','6,17','11,17','14,19','11,21','16,21','5,23','10,23','5,25'],
 ['8,2','6,3','3,5','8,5','11,7','10,9','3,11','8,11','5,13','8,15','8,16','12,17','3,19','8,19','4,21','8,22','12,23','10,25','1,27','6,27','2,29','7,29','10,31'],
 ['9,2','12,3','10,5','9,6','6,7','9,8','6,9','9,10','12,11','10,13','9,14','6,15','9,16','6,17','9,18','12,19','9,21','13,21','3,23','7,23','2,25','6,25','9,26','12,27','9,29','13,29'],
 ['10,2','8,3','5,5','10,5','13,7','12,9','5,11','10,11','7,13','10,15','10,16','14,17','7,19','3,21','8,21','11,23','10,24','14,25','5,27','10,27','6,29','10,30','14,31','12,33','3,35','8,35','4,37','9,37','12,39']
];

function theme(values,index,type){const [sky,ground,wall,wallEdge,wallShadow,accent,gem,glow]=values;return{sky,ground,wall,wallEdge,wallShadow,accent,gem,glow,decor:`${type}-${index}`}}

function rewardCoins(rows,index,start,exit,keys,deadEnds){
  const occupied=new Set([start,exit,...keys,...deadEnds].map(point=>`${point.x},${point.y}`));
  const candidates=[];
  for(let y=1;y<rows.length-1;y++)for(let x=1;x<rows[y].length-1;x++)if(rows[y][x]==='.'&&!occupied.has(`${x},${y}`))candidates.push({x,y});
  const ids=LEGACY_REWARD_COIN_COORDS[index-1].map(coordinate=>`reward-${index}:${coordinate}`),count=ids.length,step=Math.max(1,Math.floor(candidates.length/count));
  return Array.from({length:count},(_,coinIndex)=>{
    const point=candidates[Math.min(candidates.length-1,coinIndex*step)];
    return {...point,id:ids[coinIndex]};
  });
}

function buildLevel(layout){
  const [type,indexText]=layout.id.split('-'),index=Number(indexText),reward=type==='reward';
  const rows=[...layout.rows],start={...layout.start},exit={...layout.exit},keys=layout.keyCandidates.slice(0,index).map(point=>({...point}));
  const coins=reward?rewardCoins(rows,index,start,exit,keys,layout.keyCandidates):[];
  const palettes=reward?REWARD_PALETTES:NORMAL_PALETTES,names=reward?REWARD_NAMES:NORMAL_NAMES;
  return {
    id:layout.id,type,index,name:names[index-1],rows,start,exit,keys,coins,
    breakableWalls:layout.breakableWalls.map(point=>({...point})),theme:theme(palettes[index-1],index,type),
    parSteps:layout.parSteps,difficulty:{...layout.difficulty}
  };
}

export const LEVELS=GENERATED_LAYOUTS.map(buildLevel);
export const getLevel=id=>LEVELS.find(level=>level.id===id)||null;
