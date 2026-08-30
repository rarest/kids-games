import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createGame, drawCard, drawGeneratedCard, chooseLuckyValue, placePendingCard,
  buyItem, useBomb, useCandle, canFail, settleGame
} from '../merge4096/game-core.js';

const state = overrides => ({
  deck: [], drawIndex: 0, pendingCard: null,
  columns: [[], [], [], [], []], roundMax: 0,
  status: 'playing', rewardClaimed: false, lastCombo: 0,
  ...overrides
});

test('new game has 10000 cards and five empty columns', () => {
  const game = createGame(() => 0);
  assert.equal(game.deck.length, 10000);
  assert.deepEqual(game.columns, [[], [], [], [], []]);
  assert.equal(game.drawIndex, 0);
  assert.equal(game.pendingCard, null);
});

test('each mode uses its own lucky interval and opening numbers stay small', () => {
  const easy = createGame('easy',() => 0.99);
  const joy = createGame('joy',() => 0.99);
  assert.equal(easy.deck[14].kind,'lucky');
  assert.equal(joy.deck[24].kind,'lucky');
  assert.equal(joy.deck[23].kind,'ordinary');
  assert.equal(joy.difficulty,'joy');
});

test('sixth miss is guaranteed to match a visible bottom card',()=>{
  const game=state({difficulty:'joy',missStreak:5,columns:[[32],[8],[],[],[]]});
  const drawn=drawGeneratedCard(game,()=>0);
  assert.ok([32,8].includes(drawn.pendingCard.value));
  assert.equal(drawn.missStreak,0);
});

test('a pending card must be placed before another draw', () => {
  const once = drawCard(createGame(() => 0));
  assert.equal(once.drawIndex, 1);
  assert.throws(() => drawCard(once), /先放置/);
});

test('lucky card requires a valid chosen value', () => {
  const lucky = drawCard(state({deck:[{kind:'lucky'}]}));
  assert.equal(lucky.pendingCard.kind, 'lucky');
  assert.throws(() => chooseLuckyValue(lucky,1024), /幸运牌/);
  assert.equal(chooseLuckyValue(lucky,512).pendingCard.value,512);
});

test('cards append downward and different values do not merge', () => {
  const transition = placePendingCard(state({pendingCard:{kind:'number',value:4},columns:[[2],[],[],[],[]]}),0);
  assert.deepEqual(transition.state.columns[0],[2,4]);
  assert.equal(transition.comboCount,0);
});

test('placed card chains upward through equal neighbours', () => {
  const transition = placePendingCard(state({pendingCard:{kind:'number',value:32},columns:[[64,32],[],[],[],[]]}),0);
  assert.deepEqual(transition.state.columns[0],[128]);
  assert.equal(transition.comboCount,2);
  assert.equal(transition.createdValue,128);
});

test('full columns reject placement and 4096 wins immediately', () => {
  const full = Array(12).fill(2);
  assert.throws(() => placePendingCard(state({pendingCard:{kind:'number',value:4},columns:[full,[],[],[],[]]}),0),/已满/);
  const win = placePendingCard(state({pendingCard:{kind:'number',value:2048},columns:[[2048],[],[],[],[]]}),0);
  assert.equal(win.outcome,'won');
  assert.equal(win.state.status,'won');
});

test('bomb clears a selected column and candle removes one card then collapses matches', () => {
  const bomb = useBomb(state({columns:[[2,4],[8],[],[],[]]}),0);
  assert.deepEqual(bomb.state.columns[0],[]);
  const candle = useCandle(state({columns:[[32,16,32],[8],[],[],[]]}),() => 0.34);
  assert.deepEqual(candle.state.columns[0],[64]);
  assert.equal(candle.comboCount,1);
});

test('shop charges exact prices and rejects insufficient coins', () => {
  assert.deepEqual(buyItem({coins:110,bombs:0,candles:0},'bomb'),{coins:60,bombs:1,candles:0});
  assert.deepEqual(buyItem({coins:110,bombs:0,candles:0},'candle'),{coins:50,bombs:0,candles:1});
  assert.throws(() => buyItem({coins:49,bombs:0,candles:0},'bomb'),/金币不足/);
});

test('all full without a bomb purchase path can fail', () => {
  const fullState = state({columns:Array.from({length:5},()=>Array(12).fill(2))});
  assert.equal(canFail(fullState,{coins:49,bombs:0}),true);
  assert.equal(canFail(fullState,{coins:50,bombs:0}),false);
  assert.equal(canFail(fullState,{coins:0,bombs:1}),false);
});

test('settlement pays only once and updates records', () => {
  const profile = {coins:500,bombs:0,candles:3,best:0,lastResult:0,wins:0,musicOn:true};
  const won = settleGame(state({status:'won',roundMax:4096}),profile,'won');
  assert.equal(won.profile.coins,800);
  assert.equal(won.profile.wins,1);
  assert.equal(won.profile.best,4096);
  const duplicate = settleGame(won.state,won.profile,'won');
  assert.equal(duplicate.profile.coins,800);
  const lost = settleGame(state({status:'lost',roundMax:512}),profile,'lost');
  assert.equal(lost.profile.coins,750);
  assert.equal(lost.profile.lastResult,512);
});
