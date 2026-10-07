import test from 'node:test';
import assert from 'node:assert/strict';
import {createEditorLevel,validateLevel,readEditorLevel,writeEditorLevel} from '../parkour/editor.js';
import {createState,stepState} from '../parkour/core.js';

test('editor sample has supported start and finish and a playable connecting jump',()=>{
  const level=createEditorLevel();assert.equal(level.platforms.length,2);assert.equal(level.custom,true);
  assert.equal(validateLevel(level).ok,true);
  const state=createState(level),target=level.goal;let jumped=false;
  for(let i=0;i<240 && !state.complete;i++){
    const dx=target.x-state.player.x,dz=target.z-state.player.z,d=Math.hypot(dx,dz);
    const jump=!jumped && state.player.x>=level.platforms[0].w/2-.6;
    if(jump)jumped=true;
    stepState(state,{x:d>.05?dx/d:0,z:d>.05?dz/d:0,jump},1/120);
  }
  assert.equal(state.complete,true);assert.equal(state.falls,0);
});

test('validation retains only supported fields and forces practice status',()=>{
  const raw=createEditorLevel();raw.custom=false;raw.secret='discard';raw.platforms[0].script='discard';raw.spawn.extra=8;
  const result=validateLevel(raw);assert.equal(result.ok,true);assert.deepEqual(result.errors,[]);
  assert.equal(result.level.custom,true);assert.equal(result.level.secret,undefined);
  assert.equal(result.level.platforms[0].script,undefined);assert.equal(result.level.spawn.extra,undefined);
  assert.notEqual(result.level,raw);
});

test('invalid finite values, size and coordinate bounds are rejected',()=>{
  for(const [field,value] of [['x',NaN],['z',Infinity],['x',100001],['z',-100001],['y',31],['y',-3],['w',.9],['d',21],['h',.1],['h',11]]){
    const level=createEditorLevel();level.platforms[0][field]=value;
    const result=validateLevel(level);assert.equal(result.ok,false,`${field}=${value}`);assert.ok(result.errors.length>0);assert.equal(result.level,null);
  }
  for(const raw of [null,[],{},'oops']) assert.equal(validateLevel(raw).ok,false);
});

test('duplicate IDs and unsupported endpoints are rejected',()=>{
  let level=createEditorLevel();level.platforms[1].id=level.platforms[0].id;assert.equal(validateLevel(level).ok,false);
  level=createEditorLevel();level.spawn.x=80;assert.equal(validateLevel(level).ok,false);
  level=createEditorLevel();level.goal.y+=1;assert.equal(validateLevel(level).ok,false);
  level=createEditorLevel();level.coins=[{id:'coin',x:0,y:0,z:0},{id:'coin',x:1,y:0,z:0}];assert.equal(validateLevel(level).ok,false);
});

test('long routes accept 1000 platforms, 200 coins and 100 checkpoints without truncation',()=>{
  const level=createEditorLevel();
  level.platforms=Array.from({length:1000},(_,i)=>({id:`p${i}`,x:i*10,z:0,y:0,w:4,d:4,h:.6}));
  level.goal={x:9990,y:0,z:0};
  level.coins=Array.from({length:200},(_,i)=>({id:`c${i}`,x:i*10,y:.4,z:0}));
  level.checkpoints=Array.from({length:100},(_,i)=>({id:`cp${i}`,x:i*10,y:0,z:0}));
  const result=validateLevel(level);
  assert.equal(result.ok,true);assert.equal(result.level.platforms.length,1000);
  assert.equal(result.level.coins.length,200);assert.equal(result.level.checkpoints.length,100);
});

test('powerups default to an empty array and require unique IDs, valid types and platform support',()=>{
  const level=createEditorLevel();
  assert.deepEqual(validateLevel(level).level.powerups,[]);
  level.powerups=[{id:'speed',type:'speed',x:0,y:.4,z:0},{id:'jump',type:'jump',x:5,y:.7,z:0}];
  assert.deepEqual(validateLevel(level).level.powerups,level.powerups);
  for(const patch of [{id:'p0'},{type:'flight'},{x:50},{y:Infinity}]){
    const invalid=structuredClone(level);Object.assign(invalid.powerups[0],patch);
    assert.equal(validateLevel(invalid).ok,false);
  }
});

test('malformed null powerup entries are rejected without throwing',()=>{
  const level=createEditorLevel();level.powerups=[null];
  assert.doesNotThrow(()=>validateLevel(level));assert.equal(validateLevel(level).ok,false);
});

test('nonfinite difficulty and unsupported point data are rejected without throwing',()=>{
  for(const difficulty of [NaN,Infinity,-Infinity]){
    const level=createEditorLevel();level.difficulty=difficulty;assert.equal(validateLevel(level).ok,false);
  }
  for(const [kind,point] of [['coins',{id:'coin',x:90,y:0,z:0}],['coins',{id:'coin',x:0,y:Infinity,z:0}],['checkpoints',{id:'cp',x:0,y:1,z:0}]]){
    const level=createEditorLevel();level[kind]=[point];assert.equal(validateLevel(level).ok,false);
  }
});

test('editor saves and restores sanitized data using its isolated key',()=>{
  const values=new Map([['glow-parkour-v1','profile untouched']]);
  const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  const level=createEditorLevel();level.coins=[{id:'coin',x:0,y:.4,z:0}];
  assert.equal(writeEditorLevel(storage,level),true);assert.deepEqual(readEditorLevel(storage),validateLevel(level).level);
  assert.equal(values.get('glow-parkour-v1'),'profile untouched');assert.ok(values.has('glow-parkour-level-v1'));
  assert.equal(writeEditorLevel(storage,{}),false);
  values.set('glow-parkour-level-v1','{');assert.equal(readEditorLevel(storage),null);
  const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
  assert.equal(readEditorLevel(blocked),null);assert.equal(writeEditorLevel(blocked,level),false);
});
