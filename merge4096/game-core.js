export const VALUES = [2,4,8,16,32,64,128,256,512];
export const DECK_SIZE = 10000;
export const COLUMN_COUNT = 5;
export const COLUMN_CAPACITY = 12;

const validValue = value => Number.isInteger(value) && value >= 2 && value <= 4096 && (value & (value - 1)) === 0;
const cloneState = state => ({...state,deck:[...state.deck],columns:state.columns.map(column=>[...column]),pendingCard:state.pendingCard&&{...state.pendingCard}});

export function allowedValuesAt(index) {
  if (index < 100) return [2,2,2,2,4,4,8];
  if (index < 500) return [2,2,2,4,4,8,8,16];
  if (index < 2000) return [2,2,4,4,8,8,16,16,32,64];
  return [2,2,4,4,8,8,16,16,32,32,64,64,128,256,512];
}

export function createGame(difficultyId='joy',random=Math.random) {
  if(typeof difficultyId==='function'){random=difficultyId;difficultyId='joy'}
  const difficulty=getDifficulty(difficultyId);
  const deck = Array.from({length:DECK_SIZE},(_,index)=>{
    if ((index + 1) % difficulty.luckyEvery === 0) return {kind:'lucky'};
    return {kind:'ordinary'};
  });
  return {deck,drawIndex:0,pendingCard:null,columns:Array.from({length:COLUMN_COUNT},()=>[]),roundMax:0,status:'playing',rewardClaimed:false,lastCombo:0,difficulty:difficulty.id,missStreak:0,rerolls:0,temporaryBombs:0,comboCoins:0};
}

function generatedValue(state,random){
  const bottoms=state.columns.flatMap(column=>column.length?[column.at(-1)]:[]);
  if(state.missStreak>=5&&bottoms.length)return bottoms[Math.min(bottoms.length-1,Math.floor(random()*bottoms.length))];
  const cap=ordinaryValueCap(state.roundMax);
  const values=[2,2,2,4,4,8,16,32,64,128,256,512].filter(value=>value<=cap);
  const difficulty=getDifficulty(state.difficulty);
  if(bottoms.length&&random()<difficulty.pairBias)return bottoms[Math.min(bottoms.length-1,Math.floor(random()*bottoms.length))];
  return values[Math.min(values.length-1,Math.floor(random()*values.length))];
}

export function drawGeneratedCard(state,random=Math.random){
  if(state.status!=='playing')throw new Error('本局已经结束');
  if(state.pendingCard)throw new Error('请先放置当前牌');
  const value=generatedValue(state,random),bottoms=state.columns.flatMap(column=>column.length?[column.at(-1)]:[]);
  return {...state,pendingCard:{kind:'number',value},drawIndex:state.drawIndex+1,missStreak:bottoms.includes(value)?0:(state.missStreak??0)+1};
}

export function drawCard(state,random=Math.random) {
  if (state.status !== 'playing') throw new Error('本局已经结束');
  if (state.pendingCard) throw new Error('请先放置当前牌');
  if (state.drawIndex >= state.deck.length) return {...state,status:'lost'};
  const card=state.deck[state.drawIndex];
  if(card.kind==='ordinary')return drawGeneratedCard(state,random);
  return {...state,pendingCard:{...card},drawIndex:state.drawIndex+1};
}

export function chooseLuckyValue(state,value) {
  if (state.pendingCard?.kind !== 'lucky' || !VALUES.includes(value)) throw new Error('请选择有效的幸运牌数字');
  return {...state,pendingCard:{kind:'number',value}};
}

const validColumn=(state,columnIndex)=>Number.isInteger(columnIndex)&&columnIndex>=0&&columnIndex<COLUMN_COUNT;

export function useLuckyCopy(state,columnIndex){
  if(state.pendingCard?.kind!=='lucky')throw new Error('当前不是幸运牌');
  if(!validColumn(state,columnIndex))throw new Error('无效牌列');
  const value=state.columns[columnIndex].at(-1);
  if(!value)throw new Error('不能复制空列');
  return {...state,pendingCard:{kind:'number',value}};
}

export function useLuckyUpgrade(state,random=Math.random){
  if(state.pendingCard?.kind!=='lucky')throw new Error('当前不是幸运牌');
  const value=Math.min(256,generatedValue({...state,pendingCard:null},random));
  return {...state,pendingCard:{kind:'number',value:value*2}};
}

export function applyComboRewards(state,comboCount){
  return {...state,
    rerolls:(state.rerolls??0)+(comboCount>=4?1:0),
    temporaryBombs:(state.temporaryBombs??0)+(comboCount>=5?1:0),
    comboCoins:Math.min(60,(state.comboCoins??0)+(comboCount>=6?20:0))
  };
}

export function consumeReroll(state,random=Math.random){
  if((state.rerolls??0)<1)throw new Error('没有重抽机会');
  if(state.pendingCard?.kind!=='number')throw new Error('当前数字牌才能重抽');
  const value=generatedValue({...state,pendingCard:null},random);
  return {...state,rerolls:state.rerolls-1,pendingCard:{kind:'number',value}};
}

function collapseAll(column) {
  const values = [...column];
  let combos = 0;
  for (let index = values.length - 1; index > 0;) {
    if (values[index] === values[index - 1]) {
      values.splice(index - 1,2,values[index] * 2);
      combos++;
      index = Math.min(index - 1,values.length - 1);
    } else index--;
  }
  return {column:values,combos};
}

export function resolvePlacement(columns,columnIndex,value){
  const next=columns.map(column=>[...column]);
  next[columnIndex].push(value);
  let combos=0,changed=true;
  while(changed){
    changed=false;
    const collapsed=collapseAll(next[columnIndex]);
    if(collapsed.combos){next[columnIndex]=collapsed.column;combos+=collapsed.combos;changed=true;continue}
    const active=next[columnIndex].at(-1);
    for(const neighbour of [columnIndex-1,columnIndex+1]){
      if(neighbour>=0&&neighbour<next.length&&next[neighbour].at(-1)===active){
        next[neighbour].pop();next[columnIndex].pop();next[columnIndex].push(active*2);combos++;changed=true;break;
      }
    }
  }
  return {columns:next,comboCount:combos,createdValue:next[columnIndex].at(-1)};
}

export function placePendingCard(state,columnIndex) {
  if (!state.pendingCard || state.pendingCard.kind !== 'number') throw new Error('请先抽取数字牌');
  if (!Number.isInteger(columnIndex) || columnIndex < 0 || columnIndex >= COLUMN_COUNT) throw new Error('无效牌列');
  if (state.columns[columnIndex].length >= COLUMN_CAPACITY) throw new Error('这一列已满');
  const next = cloneState(state);
  const placedValue = next.pendingCard.value;
  const resolved=resolvePlacement(next.columns,columnIndex,placedValue);
  next.columns=resolved.columns;
  next.pendingCard = null;
  next.lastCombo = resolved.comboCount;
  const createdValue = resolved.createdValue;
  next.roundMax = Math.max(next.roundMax,...next.columns.flat());
  let outcome = null;
  if (next.roundMax >= 4096) { next.status = 'won'; outcome = 'won'; }
  else if (next.drawIndex >= next.deck.length && !next.pendingCard) { next.status = 'lost'; outcome = 'lost'; }
  const rewarded=applyComboRewards(next,resolved.comboCount);
  return {state:rewarded,comboCount:resolved.comboCount,removed:resolved.comboCount,createdValue,outcome};
}

export function useLuckyRemove(state,columnIndex){
  if(state.pendingCard?.kind!=='lucky')throw new Error('当前不是幸运牌');
  if(!validColumn(state,columnIndex))throw new Error('无效牌列');
  if(!state.columns[columnIndex].length)throw new Error('不能移除空列');
  const next=cloneState(state);next.pendingCard=null;next.columns[columnIndex].pop();
  let comboCount=0,createdValue=next.columns[columnIndex].at(-1)??null;
  if(createdValue){next.columns[columnIndex].pop();const resolved=resolvePlacement(next.columns,columnIndex,createdValue);next.columns=resolved.columns;comboCount=resolved.comboCount;createdValue=resolved.createdValue}
  next.lastCombo=comboCount;next.roundMax=Math.max(next.roundMax,...next.columns.flat(),0);
  const rewarded=applyComboRewards(next,comboCount);
  if(rewarded.roundMax>=4096)rewarded.status='won';
  return {state:rewarded,comboCount,removed:1,createdValue,outcome:rewarded.status==='won'?'won':null};
}

export function buyItem(profile,item) {
  const price = item === 'bomb' ? 50 : item === 'candle' ? 60 : null;
  if (price === null) throw new Error('未知道具');
  if (profile.coins < price) throw new Error('金币不足');
  return {...profile,coins:profile.coins-price,bombs:profile.bombs+(item==='bomb'?1:0),candles:profile.candles+(item==='candle'?1:0)};
}

export function useBomb(state,columnIndex) {
  if (!Number.isInteger(columnIndex) || columnIndex < 0 || columnIndex >= COLUMN_COUNT) throw new Error('无效牌列');
  const next = cloneState(state);
  const removed = next.columns[columnIndex].length;
  next.columns[columnIndex] = [];
  if((next.temporaryBombs??0)>0)next.temporaryBombs--;
  return {state:next,comboCount:0,removed,createdValue:null,outcome:null};
}

export function useCandle(state,random = Math.random) {
  const total = state.columns.reduce((sum,column)=>sum+column.length,0);
  if (!total) throw new Error('棋盘上还没有牌');
  const target = Math.min(total-1,Math.floor(random()*total));
  const next = cloneState(state);
  let cursor = target;
  let columnIndex = 0;
  while (cursor >= next.columns[columnIndex].length) cursor -= next.columns[columnIndex++].length;
  next.columns[columnIndex].splice(cursor,1);
  const collapsed = collapseAll(next.columns[columnIndex]);
  next.columns[columnIndex] = collapsed.column;
  next.roundMax = Math.max(next.roundMax,...collapsed.column,0);
  if (next.roundMax >= 4096) next.status = 'won';
  return {state:next,comboCount:collapsed.combos,removed:1,createdValue:collapsed.column.at(-1)??null,outcome:next.status==='won'?'won':null};
}

export function canFail(state,profile) {
  const full = state.columns.every(column=>column.length >= COLUMN_CAPACITY);
  const exhausted = state.drawIndex >= state.deck.length && !state.pendingCard;
  return (full || exhausted) && (state.temporaryBombs??0)<1 && profile.bombs < 1 && profile.coins < 50;
}

export function settleGame(state,profile,outcome) {
  if (state.rewardClaimed) return {state,profile};
  const difficulty=getDifficulty(state.difficulty);
  const reward = outcome === 'won' ? difficulty.winReward : outcome === 'lost' ? difficulty.lossReward : 0;
  if (!reward) throw new Error('无效结算结果');
  return {
    state:{...state,status:outcome,rewardClaimed:true},
    profile:{...profile,coins:profile.coins+reward+(state.comboCoins??0),best:Math.max(profile.best,state.roundMax),lastResult:state.roundMax,wins:profile.wins+(outcome==='won'?1:0)}
  };
}

export function isValidGameState(state) {
  return Boolean(state && Array.isArray(state.deck) && Number.isInteger(state.drawIndex) && state.drawIndex >= 0 && state.drawIndex <= state.deck.length &&
    Array.isArray(state.columns) && state.columns.length === COLUMN_COUNT && state.columns.every(column=>Array.isArray(column)&&column.length<=COLUMN_CAPACITY&&column.every(validValue)));
}
import {getDifficulty,ordinaryValueCap} from './difficulty.js';
