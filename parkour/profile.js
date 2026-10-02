import {LEVELS} from './levels.js';

const KEY='glow-parkour-v1';
export const SKINS=[
  ['red','红色','#ef4444'],['orange','橙色','#f97316'],['yellow','黄色','#facc15'],
  ['green','绿色','#22c55e'],['cyan','青色','#06b6d4'],['blue','蓝色','#3b82f6'],
  ['purple','紫色','#a855f7'],['black','黑色','#20232a'],['pink','粉色','#f472b6'],
  ['brown','棕色','#a16207'],['navy','深蓝','#1e3a8a'],['forest','深绿','#166534'],
  ['rainbow','彩虹','rainbow'],
].map(([id,name,color])=>({id,name,color,price:id==='red'?0:2}));
const skinIds=new Set(SKINS.map(s=>s.id));
const presetIds=new Set(LEVELS.map(l=>l.id));

export function createProfile(raw) {
  raw=raw && typeof raw==='object' && !Array.isArray(raw)?raw:{};
  const coins=Number.isSafeInteger(raw.coins) && raw.coins>=0?raw.coins:0;
  const owned=[...new Set(['red',...(Array.isArray(raw.owned)?raw.owned:[]).filter(id=>skinIds.has(id))])];
  const equipped=owned.includes(raw.equipped)?raw.equipped:'red';
  const progress={};
  if (raw.progress && typeof raw.progress==='object') {
    for (const [id,value] of Object.entries(raw.progress)) {
      if (presetIds.has(id) && value?.completed===true && Number.isFinite(value.bestTime) && value.bestTime>=0) {
        progress[id]={completed:true,bestTime:value.bestTime};
      }
    }
  }
  return {coins,owned,equipped,progress};
}

export function buySkin(profile,id) {
  const skin=SKINS.find(s=>s.id===id);
  if (!skin || profile.owned.includes(id) || profile.coins<skin.price) return false;
  profile.coins-=skin.price; profile.owned.push(id); return true;
}

export function equipSkin(profile,id) {
  if (!skinIds.has(id) || !profile.owned.includes(id)) return false;
  profile.equipped=id; return true;
}

export function creditCoin(profile,state,coinId) {
  if (state.level.custom || !presetIds.has(state.level.id) || !state.level.coins.some(c=>c.id===coinId) ||
      !state.collected.has(coinId) || state.receipts.has(coinId)) return false;
  state.receipts.add(coinId); profile.coins+=1; return true;
}

export function recordFinish(profile,state) {
  if (!state.complete || state.level.custom || !presetIds.has(state.level.id) || !Number.isFinite(state.elapsed) || state.elapsed<0) return false;
  const best=profile.progress[state.level.id]?.bestTime??Infinity;
  profile.progress[state.level.id]={completed:true,bestTime:Math.min(best,state.elapsed)};
  return true;
}

export function readProfile(storage) {
  try {return createProfile(JSON.parse(storage.getItem(KEY)));} catch {return createProfile();}
}

export function writeProfile(storage,profile) {
  try {storage.setItem(KEY,JSON.stringify(createProfile(profile)));return true;} catch {return false;}
}
