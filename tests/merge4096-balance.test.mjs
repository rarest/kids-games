import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,drawCard,placePendingCard,useLuckyCopy,useLuckyUpgrade} from '../merge4096/game-core.js';

const seeded=seed=>()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);

function bestColumn(game,value){
  return game.columns.map((column,index)=>({index,column,score:(column.at(-1)===value?100:0)+(game.columns[index-1]?.at(-1)===value?30:0)+(game.columns[index+1]?.at(-1)===value?30:0)+(column.length===0?15:0)-column.length})).filter(item=>item.column.length<12).sort((a,b)=>b.score-a.score)[0]?.index??-1;
}

function autoplay(mode,seed){
  const random=seeded(seed);let game=createGame(mode,random);
  while(game.status==='playing'&&game.drawIndex<2500){
    game=drawCard(game,random);
    if(game.pendingCard.kind==='lucky'){
      const candidates=game.columns.map((column,index)=>({column,index})).filter(({column})=>column.length&&column.length<12);
      game=candidates.length?useLuckyCopy(game,candidates.sort((a,b)=>a.column.length-b.column.length)[0].index):useLuckyUpgrade(game,random);
    }
    const column=bestColumn(game,game.pendingCard.value);
    if(column<0)return {won:false,draws:game.drawIndex};
    game=placePendingCard(game,column).state;
  }
  return {won:game.status==='won',draws:game.drawIndex};
}

const median=values=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];

test('all modes are winnable and harder modes take longer for a simple player',t=>{
  const results=Object.fromEntries(['easy','joy','challenge'].map(mode=>[mode,Array.from({length:40},(_,seed)=>autoplay(mode,seed+1))]));
  for(const mode of Object.keys(results))assert.ok(results[mode].some(result=>result.won),`${mode} should be winnable`);
  const draws=Object.fromEntries(Object.entries(results).map(([mode,runs])=>[mode,median(runs.map(run=>run.draws))]));
  t.diagnostic(`median draws ${JSON.stringify(draws)}`);
  assert.ok(draws.easy<=draws.joy,JSON.stringify(draws));
  assert.ok(draws.joy<=draws.challenge,JSON.stringify(draws));
  assert.ok(draws.joy>=60&&draws.joy<=150,JSON.stringify(draws));
  assert.ok(draws.challenge<=180,JSON.stringify(draws));
});
