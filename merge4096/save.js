import {isValidGameState} from './game-core.js?v=20260830i';

export const STORAGE_KEY='merge4096-save-v2';
export const LEGACY_STORAGE_KEY='merge4096-save-v1';
export const createDefaultRecords=()=>({easy:{best:0,wins:0},joy:{best:0,wins:0},challenge:{best:0,wins:0}});
export const DEFAULT_PROFILE=Object.freeze({coins:500,bombs:0,candles:3,best:0,lastResult:0,wins:0,musicOn:true,selectedDifficulty:'joy'});

export function createDefaultSave(){
  return {version:2,profile:{...DEFAULT_PROFILE,records:createDefaultRecords()},currentGame:null};
}

const nonnegative=value=>Number.isInteger(value)&&value>=0;
const validRecord=record=>record&&nonnegative(record.best)&&nonnegative(record.wins);

export function validateSave(value){
  const profile=value?.profile;
  if(value?.version!==2||!profile||!['coins','bombs','candles','best','lastResult','wins'].every(key=>nonnegative(profile[key]))||typeof profile.musicOn!=='boolean')return false;
  if(!['easy','joy','challenge'].includes(profile.selectedDifficulty)||!profile.records||!['easy','joy','challenge'].every(id=>validRecord(profile.records[id])))return false;
  return value.currentGame===null||isValidGameState(value.currentGame);
}

export function migrateSave(value){
  if(value?.version===2&&validateSave(value))return value;
  const profile=value?.version===1?value.profile:null;
  if(!profile||!['coins','bombs','candles','best','lastResult','wins'].every(key=>nonnegative(profile[key]))||typeof profile.musicOn!=='boolean')return createDefaultSave();
  const migrated=createDefaultSave();
  Object.assign(migrated.profile,{coins:profile.coins,bombs:profile.bombs,candles:profile.candles,best:profile.best,lastResult:profile.lastResult,wins:profile.wins,musicOn:profile.musicOn});
  migrated.profile.records.joy={best:profile.best,wins:profile.wins};
  return migrated;
}

export function loadSave(storage=globalThis.localStorage){
  try{
    const current=storage?.getItem(STORAGE_KEY);
    if(current){const parsed=JSON.parse(current);return validateSave(parsed)?parsed:createDefaultSave()}
    const legacy=storage?.getItem(LEGACY_STORAGE_KEY);
    if(!legacy)return createDefaultSave();
    const migrated=migrateSave(JSON.parse(legacy));
    storage?.setItem(STORAGE_KEY,JSON.stringify(migrated));
    return migrated;
  }catch{return createDefaultSave()}
}

export function saveGame(storage=globalThis.localStorage,save){
  try{if(!validateSave(save))return false;storage?.setItem(STORAGE_KEY,JSON.stringify(save));return true}catch{return false}
}
