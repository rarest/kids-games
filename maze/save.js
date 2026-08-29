export const SAVE_KEY = 'crown-maze-save-v1';

const VALID_SKINS = new Set(['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink', 'silver', 'gold', 'iridescent']);
const integer = (value, fallback = 0, maximum = Number.MAX_SAFE_INTEGER) => Number.isFinite(value)
  ? Math.min(maximum, Math.max(0, Math.floor(value)))
  : fallback;

export function createDefaultSave() {
  return {
    version: 1,
    coins: 0,
    inventory: { dynamite: 0, hook: 0 },
    ownedSkins: ['red'],
    equippedSkin: 'red',
    collectedCoinIds: [],
    completedNormal: [],
    bestStars: {},
    bestSteps: {},
    unlockedNormal: 1,
    journeyPosition: 0
  };
}

export function sanitizeSave(value) {
  const source = value && typeof value === 'object' ? value : {};
  const ownedSkins = [...new Set(Array.isArray(source.ownedSkins) ? source.ownedSkins.filter(id => VALID_SKINS.has(id)) : [])];
  if (!ownedSkins.includes('red')) ownedSkins.unshift('red');
  const completedNormal = [...new Set(Array.isArray(source.completedNormal)
    ? source.completedNormal.map(Number).filter(index => Number.isInteger(index) && index >= 1 && index <= 10)
    : [])].sort((a, b) => a - b);
  const collectedCoinIds = [...new Set(Array.isArray(source.collectedCoinIds)
    ? source.collectedCoinIds.filter(id => typeof id === 'string' && /^reward-\d+:\d+,\d+$/.test(id))
    : [])];
  const cleanRecord = (record, maximum = Number.MAX_SAFE_INTEGER) => Object.fromEntries(Object.entries(record && typeof record === 'object' ? record : {})
    .filter(([key, number]) => /^(normal|reward)-\d+$/.test(key) && Number.isFinite(number))
    .map(([key, number]) => [key, integer(number, 0, maximum)]));
  const equippedSkin = ownedSkins.includes(source.equippedSkin) ? source.equippedSkin : 'red';
  return {
    version: 1,
    coins: integer(source.coins),
    inventory: {
      dynamite: integer(source.inventory?.dynamite, 0, 999),
      hook: integer(source.inventory?.hook, 0, 999)
    },
    ownedSkins,
    equippedSkin,
    collectedCoinIds,
    completedNormal,
    bestStars: cleanRecord(source.bestStars, 3),
    bestSteps: cleanRecord(source.bestSteps),
    unlockedNormal: Math.min(10, Math.max(1, integer(source.unlockedNormal, 1, 10))),
    journeyPosition: integer(source.journeyPosition, 0, 19)
  };
}

export function loadSave(storage = globalThis.localStorage) {
  if (!storage) return createDefaultSave();
  try { return sanitizeSave(JSON.parse(storage.getItem(SAVE_KEY))); }
  catch { return createDefaultSave(); }
}

export function persistSave(save, storage = globalThis.localStorage) {
  const clean = sanitizeSave(save);
  if (storage) storage.setItem(SAVE_KEY, JSON.stringify(clean));
  return clean;
}
