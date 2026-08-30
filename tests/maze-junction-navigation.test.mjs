import test from 'node:test';
import assert from 'node:assert/strict';
import { canMove, createRun, move } from '../maze/engine.js';
import { createPathAwareNavigator } from '../maze/joystick-controls.js';

function runFor(rows,start){
  return createRun({
    id:'junction-fixture',type:'normal',index:1,name:'fixture',rows,start,
    exit:{x:1,y:1},keys:[],coins:[],breakableWalls:[],parSteps:20
  });
}

function navigatorFor(run,clock={now:0}){
  return createPathAwareNavigator({
    canMove:direction=>canMove(run,direction),
    onDirection:direction=>{
      const before={...run.player},result=move(run,direction);
      return {moved:before.x!==run.player.x||before.y!==run.player.y,result};
    },
    now:()=>clock.now,
    turnBufferMs:400
  });
}

const upLeft={primary:'up',secondary:'left'};

test('a held diagonal intent turns at the first open cell of an L junction without overshooting',()=>{
  const run=runFor([
    '#######',
    '#...###',
    '#...###',
    '###.###',
    '###.###',
    '###.###',
    '#######'
  ],{x:3,y:5});
  const navigator=navigatorFor(run);
  navigator.step(upLeft);
  navigator.step(upLeft);
  navigator.step(upLeft);
  navigator.step(upLeft);
  assert.deepEqual(run.player,{x:2,y:2});
  assert.equal(run.steps,4);
});

test('T and cross junctions choose only the perpendicular branch expressed by the player',()=>{
  for(const rows of [[
    '#######',
    '###.###',
    '#.....#',
    '###.###',
    '###.###',
    '#######'
  ],[
    '#######',
    '###.###',
    '#.....#',
    '###.###',
    '###.###',
    '###.###',
    '#######'
  ]]){
    const run=runFor(rows,{x:3,y:rows.length-2}),navigator=navigatorFor(run);
    while(run.player.y>2)navigator.step(upLeft);
    navigator.step(upLeft);
    assert.deepEqual(run.player,{x:2,y:2});
  }
});

test('a blocked primary uses the expressed secondary at a dead end but never invents an unexpressed route',()=>{
  const rows=[
    '#######',
    '#..####',
    '#...###',
    '###.###',
    '#######'
  ];
  const run=runFor(rows,{x:3,y:2}),navigator=navigatorFor(run);
  navigator.step(upLeft);
  assert.deepEqual(run.player,{x:2,y:2},'the diagonal secondary resolves the blocked primary in one legal grid step');

  const blocked=runFor(rows,{x:3,y:2}),single=navigatorFor(blocked);
  single.step({primary:'right',secondary:null});
  assert.deepEqual(blocked.player,{x:3,y:2},'a single blocked direction does not auto-select up or left');
  assert.equal(blocked.steps,0);
});

test('reset clears heading and buffered turns so movement cannot resume after release',()=>{
  const run=runFor([
    '#######',
    '#...###',
    '###.###',
    '###.###',
    '###.###',
    '#######'
  ],{x:3,y:4}),navigator=navigatorFor(run);
  navigator.step(upLeft);
  navigator.reset();
  const stopped={...run.player};
  assert.deepEqual(navigator.state,{heading:null,bufferedTurn:null});
  assert.deepEqual(run.player,stopped);
});

test('a winding S route preserves heading between turns and follows the newly expressed bend',()=>{
  const run=runFor([
    '#########',
    '#.....###',
    '#####.###',
    '#.....###',
    '#.#######',
    '#.....###',
    '#####.###',
    '#####.###',
    '#########'
  ],{x:5,y:7}),navigator=navigatorFor(run);
  for(let index=0;index<8;index++)navigator.step({primary:'up',secondary:'left'});
  assert.deepEqual(run.player,{x:1,y:3});
  navigator.step({primary:'right',secondary:'up'});
  assert.deepEqual(run.player,{x:2,y:3},'the next diagonal pair arms the next bend instead of returning to the old branch');
});
