import test from 'node:test';
import assert from 'node:assert/strict';
import {generateMaze} from '../maze/maze-builder.js';
import {GENERATED_LAYOUTS} from '../maze/generated-levels.js';
import {findDeadEnds,shortestCompletionSteps,topologyMetrics,validateLevel} from '../maze/level-tools.js';
import {verifyLayouts} from '../scripts/generate-crown-mazes.mjs';

test('same seed creates the same closed dense maze',()=>{
  const config={seed:1107,cellWidth:7,cellHeight:6,targetDeadEnds:3,loopOpenings:1,minStraight:4};
  const first=generateMaze(config),second=generateMaze(config);
  assert.deepEqual(first,second);
  assert.equal(validateLevel({...first,keys:first.keyCandidates.slice(0,1),coins:[]}).length,0);
});

test('builder reaches the requested dead-end count and avoids a dominant spine',()=>{
  const built=generateMaze({seed:19031,cellWidth:12,cellHeight:10,targetDeadEnds:11,loopOpenings:4,minStraight:6});
  const level={...built,keys:built.keyCandidates.slice(0,5),coins:[]};
  assert.equal(findDeadEnds(level).length,11);
  assert.ok(topologyMetrics(level).trunkDominance<.34);
});

test('breakable walls shorten the route that collects the campaign keys',()=>{
  const built=generateMaze({seed:5133,cellWidth:9,cellHeight:8,targetDeadEnds:7,loopOpenings:2,minStraight:5});
  const level={...built,keys:built.keyCandidates.slice(0,3),coins:[]};
  const baseline=shortestCompletionSteps(level);
  assert.ok(built.breakableWalls.length>0);
  for(const {x,y} of built.breakableWalls){
    const rows=[...built.rows];
    rows[y]=`${rows[y].slice(0,x)}.${rows[y].slice(x+1)}`;
    assert.ok(shortestCompletionSteps({...level,rows})<baseline,`${x},${y} must shorten the key-complete route`);
  }
});

test('checked-in layouts pass the complete generated-data verifier',()=>{
  assert.doesNotThrow(()=>verifyLayouts(GENERATED_LAYOUTS));
});

test('generated-data verifier rejects drift in every checked-in semantic field',()=>{
  const mutations=[
    ['id',layouts=>{layouts[0].id='normal-edited'}],
    ['rows',layouts=>{layouts[0].rows[0]=`.${layouts[0].rows[0].slice(1)}`}],
    ['key candidate coordinate',layouts=>{layouts[0].keyCandidates[0].x--}],
    ['key candidate order',layouts=>{[layouts[0].keyCandidates[0],layouts[0].keyCandidates[1]]=[layouts[0].keyCandidates[1],layouts[0].keyCandidates[0]]}],
    ['breakable floor',layouts=>{layouts[0].breakableWalls[0]={...layouts[0].start}}],
    ['breakable solid wall',layouts=>{layouts[0].breakableWalls[0]={x:1,y:0}}],
    ['breakable non-shortcut',layouts=>{layouts[0].breakableWalls[0]={x:4,y:2}}],
    ['difficulty',layouts=>{layouts[0].difficulty.turns++}]
  ];
  for(const [field,mutate] of mutations){
    const layouts=structuredClone(GENERATED_LAYOUTS);
    mutate(layouts);
    assert.throws(()=>verifyLayouts(layouts),undefined,`${field} drift must be rejected`);
  }
});
