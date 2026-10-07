import test from 'node:test';
import assert from 'node:assert/strict';
import { SKINS,createProfile,buySkin,equipSkin,creditCoin,creditCustomFinish as customCredit,recordFinish,readProfile,writeProfile } from '../parkour/profile.js';
import {createState,stepState} from '../parkour/core.js';
import {LEVELS} from '../parkour/levels.js';
import {createEditorLevel} from '../parkour/editor.js';
import {createWardrobe,buyOutfit} from '../parkour/wardrobe.js';

const routeId='16786448-09c0-4ccc-a8b2-764e2d78fe23';
function customRun(){
  const level=createEditorLevel();level.id=routeId;
  level.coins=[{id:'one',x:0,y:0,z:0},{id:'two',x:.1,y:0,z:0},{id:'three',x:.2,y:0,z:0},{id:'four',x:.3,y:0,z:0}];
  const state=createState(level);stepState(state,{},1/120);return state;
}

test('each paid skin costs two coins, can be owned once, and only owned skins equip',()=>{
  assert.equal(SKINS.length,13);
  for(const skin of SKINS){
    const profile=createProfile();
    assert.equal(profile.equipped,'red'); assert.ok(profile.owned.includes('red'));
    if(skin.id==='red'){assert.equal(skin.price,0);continue;}
    assert.equal(buySkin(profile,skin.id),false); assert.equal(equipSkin(profile,skin.id),false);
    profile.coins=2; assert.equal(buySkin(profile,skin.id),true); assert.equal(profile.coins,0);
    assert.equal(buySkin(profile,skin.id),false); assert.equal(profile.coins,0);
    assert.equal(equipSkin(profile,skin.id),true); assert.equal(profile.equipped,skin.id);
  }
  assert.ok(SKINS.some(s=>s.id==='rainbow'));
  assert.equal(buySkin(createProfile(),'missing'),false);
});

test('coin receipts pay once per preset state, remain paid after reset, and pay again in a new run',()=>{
  const profile=createProfile(),state=createState(LEVELS[0]),coin=LEVELS[0].coins[0];
  assert.equal(creditCoin(profile,state,coin.id),false);
  state.player.x=coin.x;state.player.y=coin.y;state.player.z=coin.z;
  stepState(state,{},1/120);
  assert.equal(creditCoin(profile,state,coin.id),true); assert.equal(creditCoin(profile,state,coin.id),false);
  state.player.y=-30;stepState(state,{},1/120); assert.equal(creditCoin(profile,state,coin.id),false);
  const next=createState(LEVELS[0]);next.collected.add(coin.id); assert.equal(creditCoin(profile,next,coin.id),true);
  assert.equal(profile.coins,2);
  const custom=createState({...LEVELS[0],custom:true});custom.collected.add(coin.id);
  assert.equal(creditCoin(profile,custom,coin.id),false); assert.equal(profile.coins,2);
  next.collected.add('forged');assert.equal(creditCoin(profile,next,'forged'),false);
});

test('only finished preset runs record completion and retain the fastest time',()=>{
  const profile=createProfile(),state=createState(LEVELS[0]);
  assert.equal(recordFinish(profile,state),false);
  state.complete=true;state.elapsed=20; assert.equal(recordFinish(profile,state),true);
  state.elapsed=30;recordFinish(profile,state);assert.equal(profile.progress[state.level.id].bestTime,20);
  state.elapsed=12;recordFinish(profile,state);assert.deepEqual(profile.progress[state.level.id],{completed:true,bestTime:12});
  assert.equal(recordFinish(profile,{...state,level:{...state.level,custom:true}}),false);
});

test('corrupt profile normalizes balance, ownership and equipped skin',()=>{
  const profile=createProfile({coins:-5,owned:['blue','blue','fake'],equipped:'rainbow',progress:{bad:{completed:true,bestTime:-2}}});
  assert.equal(profile.coins,0);assert.deepEqual(profile.owned,['red','blue']);assert.equal(profile.equipped,'red');
  assert.deepEqual(profile.progress,{});
  for(const raw of [null,[], 'oops',{coins:Infinity},{coins:NaN}]) assert.equal(createProfile(raw).coins,0);
});

test('profile round trips through its own key and reports blocked storage',()=>{
  const values=new Map([['goldminer','keep']]);
  const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
  const profile=createProfile();profile.coins=2;buySkin(profile,'blue');equipSkin(profile,'blue');
  assert.equal(writeProfile(storage,profile),true);assert.deepEqual(readProfile(storage),profile);
  assert.equal(values.get('goldminer'),'keep');assert.ok(values.has('glow-parkour-v1'));
  values.set('glow-parkour-v1','{');assert.deepEqual(readProfile(storage),createProfile());
  const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
  assert.deepEqual(readProfile(blocked),createProfile());assert.equal(writeProfile(blocked,profile),false);
});

test('saved custom finish credits actual collected IDs once and pays for skin and outfit',()=>{
  const profile=createProfile(),state=customRun();
  assert.equal(state.collected.size,4);
  assert.equal(customCredit(profile,state,{saved:true}),0);assert.equal(profile.coins,0);
  state.player={...state.player,...state.level.goal};stepState(state,{},1/120);assert.equal(state.complete,true);
  assert.equal(customCredit(profile,state),0);assert.equal(profile.coins,0);
  state.collected.add('forged');
  assert.equal(customCredit(profile,state,{saved:true}),4);assert.equal(profile.coins,4);
  assert.equal(customCredit(profile,state,{saved:true}),0);assert.equal(profile.coins,4);
  assert.equal(buySkin(profile,'blue'),true);assert.equal(profile.coins,2);
  const wardrobe=createWardrobe();assert.equal(buyOutfit(profile,wardrobe,'sailor'),true);assert.equal(profile.coins,0);
  assert.ok(profile.owned.includes('blue'));assert.ok(wardrobe.owned.includes('sailor'));
  const next=customRun();next.complete=true;
  assert.equal(customCredit(profile,next,{saved:true}),4);assert.equal(profile.coins,4);
});

test('custom finish rejects draft or preset impersonation and unsafe balances without consuming receipt',()=>{
  for(const patch of [{id:'custom'},{id:LEVELS[0].id},{custom:false}]){
    const profile=createProfile(),state=customRun();state.complete=true;Object.assign(state.level,patch);
    assert.equal(customCredit(profile,state,{saved:true}),0);assert.equal(profile.coins,0);
    assert.equal(recordFinish(profile,state,{saved:true}),false);
  }
  const profile=createProfile(),state=customRun();state.complete=true;profile.coins=Number.MAX_SAFE_INTEGER-3;
  assert.equal(customCredit(profile,state,{saved:true}),0);assert.equal(profile.coins,Number.MAX_SAFE_INTEGER-3);
  profile.coins=0;assert.equal(customCredit(profile,state,{saved:true}),4);
});

test('saved UUID custom progress keeps best time across profile reload while draft runs cannot record',()=>{
  const profile=createProfile(),state=customRun();state.complete=true;state.elapsed=12;
  assert.equal(recordFinish(profile,state),false);assert.equal(recordFinish(profile,state,{saved:true}),true);
  state.elapsed=20;recordFinish(profile,state,{saved:true});state.elapsed=10;recordFinish(profile,state,{saved:true});
  assert.deepEqual(profile.progress[routeId],{completed:true,bestTime:10});
  assert.deepEqual(createProfile(profile).progress[routeId],{completed:true,bestTime:10});
  const storage={value:null,getItem(){return this.value;},setItem(key,value){this.value=value;}};
  assert.equal(writeProfile(storage,profile),true);assert.deepEqual(readProfile(storage).progress[routeId],{completed:true,bestTime:10});
});
