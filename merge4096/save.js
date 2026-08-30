import {isValidGameState} from './game-core.js';

export const STORAGE_KEY = 'merge4096-save-v1';
export const DEFAULT_PROFILE = Object.freeze({coins:500,bombs:0,candles:3,best:0,lastResult:0,wins:0,musicOn:true});

export function createDefaultSave() {
  return {version:1,profile:{...DEFAULT_PROFILE},currentGame:null};
}

const nonnegative = value => Number.isInteger(value) && value >= 0;

export function validateSave(value) {
  const profile = value?.profile;
  if (value?.version !== 1 || !profile || !['coins','bombs','candles','best','lastResult','wins'].every(key=>nonnegative(profile[key])) || typeof profile.musicOn !== 'boolean') return false;
  return value.currentGame === null || isValidGameState(value.currentGame);
}

export function loadSave(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return createDefaultSave();
    const parsed = JSON.parse(raw);
    return validateSave(parsed) ? parsed : createDefaultSave();
  } catch {
    return createDefaultSave();
  }
}

export function saveGame(storage = globalThis.localStorage,save) {
  try {
    if (!validateSave(save)) return false;
    storage?.setItem(STORAGE_KEY,JSON.stringify(save));
    return true;
  } catch {
    return false;
  }
}
