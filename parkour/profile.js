import {LEVELS} from './levels.js';
import {validateLevel} from './editor.js';

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
const customId=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const customFinishReceipt=Symbol('custom finish');
const savedCustom=(state,saved)=>saved===true && state.level.custom===true && customId.test(state.level.id) && validateLevel(state.level).ok;

export function createProfile(raw) {
  raw=raw && typeof raw==='object' && !Array.isArray(raw)?raw:{};
  const coins=Number.isSafeInteger(raw.coins) && raw.coins>=0?raw.coins:0;
  const owned=[...new Set(['red',...(Array.isArray(raw.owned)?raw.owned:[]).filter(id=>skinIds.has(id))])];
  const equipped=owned.includes(raw.equipped)?raw.equipped:'red';
  const progress={};
  if (raw.progress && typeof raw.progress==='object') {
    for (const [id,value] of Object.entries(raw.progress)) {
      if ((presetIds.has(id) || customId.test(id)) && value?.completed===true && Number.isFinite(value.bestTime) && value.bestTime>=0) {
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

export function creditCustomFinish(profile,state,{saved=false}={}) {
  if (!state.complete || !savedCustom(state,saved) || state.receipts.has(customFinishReceipt)) return 0;
  const amount=state.level.coins.filter(coin=>state.collected.has(coin.id)).length;
  if (!Number.isSafeInteger(profile.coins) || profile.coins<0 || !Number.isSafeInteger(profile.coins+amount)) return 0;
  state.receipts.add(customFinishReceipt);profile.coins+=amount;return amount;
}

export function recordFinish(profile,state,{saved=false}={}) {
  const eligible=state.level.custom?savedCustom(state,saved):presetIds.has(state.level.id);
  if (!state.complete || !eligible || !Number.isFinite(state.elapsed) || state.elapsed<0) return false;
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
