import { LEVELS } from './levels.js?v=20260831a';
import { sanitizeSave } from './save.js?v=20260831a';

export const SKINS = [
  { id: 'red', name: '皇冠红', price: 0, color: '#f4435c' },
  { id: 'orange', name: '珊瑚橙', price: 1, color: '#ff8a3d' },
  { id: 'yellow', name: '星芒黄', price: 1, color: '#ffd84d' },
  { id: 'green', name: '翡翠绿', price: 1, color: '#54d878' },
  { id: 'cyan', name: '水晶青', price: 1, color: '#55e4e0' },
  { id: 'blue', name: '皇家蓝', price: 1, color: '#5794ff' },
  { id: 'purple', name: '紫晶紫', price: 1, color: '#aa6cff' },
  { id: 'pink', name: '樱花粉', price: 1, color: '#ff7fba' },
  { id: 'silver', name: '月辉银', price: 3, color: '#dce9f4', hidden: true, requires: 1 },
  { id: 'gold', name: '永恒金', price: 3, color: '#ffd35a', hidden: true, requires: 5 },
  { id: 'iridescent', name: '炫彩琉璃', price: 3, color: '#ff75dd', hidden: true, requires: 7 }
];

const TOOL_PRICES = { dynamite: 1, hook: 3 };
const copy = save => sanitizeSave(save);

export function availableSkins(save) {
  const completed = new Set(save.completedNormal || []);
  return SKINS.filter(skin => !skin.hidden || completed.has(skin.requires));
}

export function purchase(input, sku) {
  const save = copy(input);
  if (Object.hasOwn(TOOL_PRICES, sku)) {
    const price = TOOL_PRICES[sku];
    if (save.coins < price) return { save, ok: false, reason: 'not-enough-coins' };
    save.coins -= price;
    save.inventory[sku] += 1;
    return { save, ok: true };
  }
  if (!sku.startsWith('skin-')) return { save, ok: false, reason: 'unknown-sku' };
  const skinId = sku.slice(5);
  const skin = availableSkins(save).find(candidate => candidate.id === skinId);
  if (!skin) return { save, ok: false, reason: 'locked' };
  if (save.ownedSkins.includes(skinId)) return { save, ok: false, reason: 'already-owned' };
  if (save.coins < skin.price) return { save, ok: false, reason: 'not-enough-coins' };
  save.coins -= skin.price;
  save.ownedSkins.push(skinId);
  return { save, ok: true };
}

export function equipSkin(input, skinId) {
  const save = copy(input);
  if (!save.ownedSkins.includes(skinId)) return { save, ok: false };
  save.equippedSkin = skinId;
  return { save, ok: true };
}

export function awardCoin(input, coinId) {
  const save = copy(input);
  if (save.collectedCoinIds.includes(coinId)) return save;
  save.collectedCoinIds.push(coinId);
  save.coins += 1;
  return save;
}

export function canEnterStage(save, level) {
  if (!level) return false;
  if (level.type === 'normal') return level.index <= save.unlockedNormal;
  return LEVELS[save.journeyPosition]?.id === level.id;
}

export function completeStage(input, result) {
  let save = copy(input);
  const levelIndex = LEVELS.findIndex(level => level.id === result.levelId);
  if (levelIndex < 0) return save;
  const level = LEVELS[levelIndex];
  for (const coinId of result.coinIds || []) save = awardCoin(save, coinId);
  if (level.type === 'normal' && !save.completedNormal.includes(level.index)) {
    save.completedNormal.push(level.index);
    save.completedNormal.sort((a, b) => a - b);
  }
  save.bestStars[level.id] = Math.max(save.bestStars[level.id] || 0, result.stars || 1);
  if (!save.bestSteps[level.id] || result.steps < save.bestSteps[level.id]) save.bestSteps[level.id] = result.steps;
  if (save.journeyPosition === levelIndex) {
    save.journeyPosition = Math.min(LEVELS.length, levelIndex + 1);
    if (level.type === 'reward') save.unlockedNormal = Math.max(save.unlockedNormal, Math.min(10, level.index + 1));
  }
  return save;
}

export function restartJourney(input) {
  return { ...copy(input), journeyPosition: 0 };
}
