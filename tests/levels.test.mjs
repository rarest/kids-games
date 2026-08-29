import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { complexityScore, findDeadEnds, shortestCompletionSteps, topologyMetrics, validateLevel } from '../maze/level-tools.js';
import { GENERATED_LAYOUTS } from '../maze/generated-levels.js';
import { createRun, move } from '../maze/engine.js';
let data=null; try{data=await import('../maze/levels.js')}catch{}
const legacyCoinIds=JSON.parse(await readFile(new URL('./fixtures/legacy-coin-ids.json',import.meta.url),'utf8'));

test('campaign has nineteen fixed interleaved stages',()=>{
  assert.ok(data?.LEVELS,'LEVELS must exist');
  assert.equal(data.LEVELS.length,19);
  assert.equal(data.LEVELS.filter(l=>l.type==='normal').length,10);
  assert.equal(data.LEVELS.filter(l=>l.type==='reward').length,9);
  data.LEVELS.forEach((level,i)=>assert.equal(level.type,i%2?'reward':'normal'));
});

test('every map is valid, unique, and follows key/dead-end rules',()=>{
  assert.ok(data?.LEVELS,'LEVELS must exist');
  const signatures=new Set();
  for(const level of data.LEVELS){
    assert.deepEqual(validateLevel(level),[],level.id);
    assert.equal(level.keys.length,level.index,level.id);
    assert.equal(findDeadEnds(level).length,level.index*2+1,level.id);
    assert.ok(level.breakableWalls.length>=1,`${level.id} needs a tool shortcut`);
    for(const wall of level.breakableWalls)assert.equal(level.rows[wall.y][wall.x],'#',`${level.id} breakable wall`);
    assert.equal(new Set(level.keys.map(p=>`${p.x},${p.y}`)).size,level.index,level.id);
    const deadEnds=findDeadEnds(level),keyCells=new Set(level.keys.map(point=>`${point.x},${point.y}`));
    const emptyDeadEnds=deadEnds.filter(point=>!keyCells.has(`${point.x},${point.y}`));
    const objectCells=new Set([level.start,level.exit,...level.keys,...level.coins].map(point=>`${point.x},${point.y}`));
    assert.equal(emptyDeadEnds.length,level.index+1,`${level.id} object-free dead-end count`);
    for(const point of emptyDeadEnds)assert.equal(objectCells.has(`${point.x},${point.y}`),false,`${level.id} dead end ${point.x},${point.y} must be empty`);
    assert.ok(Number.isFinite(shortestCompletionSteps(level)),level.id);
    assert.equal(level.parSteps,shortestCompletionSteps(level),level.id);
    if(level.type==='reward')assert.equal(level.coins.length,5+3*(level.index-1),level.id);
    else assert.equal(level.coins.length,0,level.id);
    for(const point of [level.start,level.exit,...level.keys,...level.coins])
      assert.equal(level.rows[point.y][point.x],'.',`${level.id} object at ${point.x},${point.y} must be floor`);
    for(const field of ['sky','ground','wall','wallEdge','wallShadow','accent','gem','glow'])assert.ok(level.theme[field],`${level.id}:${field}`);
    signatures.add(level.rows.join('\n'));
  }
  assert.equal(signatures.size,19);
});

test('reward stages retain the exact 153 baseline coin IDs per stage',()=>{
  const rewardLevels=data.LEVELS.filter(level=>level.type==='reward');
  assert.equal(Object.values(legacyCoinIds).flat().length,153);
  for(const level of rewardLevels){
    assert.deepEqual(level.coins.map(coin=>coin.id).sort(),[...legacyCoinIds[level.id]].sort(),level.id);
  }
});

test('a fully collected pre-redesign save cannot earn any redesigned coin again',()=>{
  const collected=new Set(Object.values(legacyCoinIds).flat());
  const directions=[[1,0,'right'],[-1,0,'left'],[0,1,'down'],[0,-1,'up']];
  for(const level of data.LEVELS.filter(candidate=>candidate.type==='reward')){
    const run=createRun(level,collected);
    for(const coin of level.coins){
      const [dx,dy,direction]=directions.find(([x,y])=>level.rows[coin.y-y]?.[coin.x-x]==='.');
      run.player={x:coin.x-dx,y:coin.y-dy};
      assert.notEqual(move(run,direction).event.type,'coin',`${level.id}:${coin.id}`);
    }
    assert.equal(run.newCoinIds.size,0,level.id);
  }
});

test('all nineteen maps form dense winding mazes with increasing campaign difficulty',()=>{
  const scores=data.LEVELS.map(level=>complexityScore(level));
  for(let i=1;i<scores.length;i++)assert.ok(scores[i]>scores[i-1],`${data.LEVELS[i].id}: ${scores[i-1]} -> ${scores[i]}`);
  for(const level of data.LEVELS){
    const m=topologyMetrics(level);
    assert.ok(m.turns>=6,`${level.id} turns`);
    assert.ok(m.junctions>=2,`${level.id} junctions`);
    assert.ok(m.longestStraight>=4,`${level.id} long corridor`);
    assert.ok(m.trunkDominance<.34,`${level.id} dominant spine`);
  }
});

test('campaign preserves the generated layout difficulty records',()=>{
  for(const [index,level] of data.LEVELS.entries()){
    const layout=GENERATED_LAYOUTS[index];
    assert.equal(level.id,layout.id);
    assert.equal(level.parSteps,layout.parSteps,level.id);
    assert.deepEqual(level.difficulty,layout.difficulty,level.id);
  }
});
