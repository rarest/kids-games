import test from 'node:test';
import assert from 'node:assert/strict';
import {createEditorLevel} from '../parkour/editor.js';
import {createRouteLibrary,saveRoute,writeRouteLibrary,readRouteLibrary} from '../parkour/route-library.js';

const KEY='glow-parkour-routes-v1',OLD='glow-parkour-level-v1';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function store(initial=[]){
  const values=new Map(initial);
  return {values,getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
}

test('two saves assign stable unique IDs and monotonic Chinese names and survive a read',()=>{
  const library=createRouteLibrary(),storage=store();
  const first=saveRoute(library,createEditorLevel(),{now:100}),second=saveRoute(library,createEditorLevel(),{now:200});
  assert.match(first.id,uuid);assert.match(second.id,uuid);assert.notEqual(first.id,second.id);
  assert.equal(first.name,'自创路线一');assert.equal(second.name,'自创路线二');
  assert.equal(first.level.id,first.id);assert.equal(first.level.custom,true);assert.equal(first.updatedAt,100);
  assert.equal(library.nextNumber,3);assert.equal(writeRouteLibrary(storage,library),true);
  assert.deepEqual(readRouteLibrary(storage),library);
  const edited=structuredClone(first.level);edited.name='山间长路';edited.goal.x=5.2;
  const updated=saveRoute(library,edited,{id:first.id,now:300});
  assert.equal(updated.name,'山间长路');assert.equal(updated.id,first.id);assert.equal(library.routes.length,2);
  assert.equal(library.nextNumber,3);assert.equal(library.routes[1].name,'自创路线二');
  assert.equal(saveRoute(library,edited,{id:'missing'}),null);
});

test('a legacy single-slot route migrates once without touching its key or wallet',()=>{
  const legacy=JSON.stringify(createEditorLevel()),storage=store([[OLD,legacy],['glow-parkour-v1','wallet']]);
  const first=readRouteLibrary(storage),second=readRouteLibrary(storage);
  assert.equal(first.routes.length,1);assert.equal(first.routes[0].name,'自创路线一');assert.deepEqual(second,first);
  assert.equal(storage.values.get(OLD),legacy);assert.equal(storage.values.get('glow-parkour-v1'),'wallet');
});

test('failed migration leaves the old slot available and retries on the next read',()=>{
  const legacy=JSON.stringify(createEditorLevel()),storage=store([[OLD,legacy]]),setItem=storage.setItem;
  storage.setItem=()=>{throw Error('quota');};
  const failed=readRouteLibrary(storage);
  assert.equal(failed.routes.length,1);assert.equal(storage.values.has(KEY),false);assert.equal(storage.values.get(OLD),legacy);
  storage.setItem=setItem;
  assert.equal(readRouteLibrary(storage).routes.length,1);assert.equal(storage.values.has(KEY),true);
  assert.equal(readRouteLibrary(storage).routes.length,1);
});

test('staging then failing persistence preserves the old snapshot and live library',()=>{
  const storage=store(),live=createRouteLibrary();saveRoute(live,createEditorLevel());
  assert.equal(writeRouteLibrary(storage,live),true);
  const snapshot=storage.values.get(KEY),staged=structuredClone(live);
  saveRoute(staged,createEditorLevel());storage.setItem=()=>{throw Error('quota');};
  assert.equal(writeRouteLibrary(storage,staged),false);assert.equal(live.routes.length,1);
  assert.equal(storage.values.get(KEY),snapshot);assert.deepEqual(readRouteLibrary(storage),live);
});

test('incomplete empty drafts round trip but cannot enter the playable route list',()=>{
  const draft={...createEditorLevel(),platforms:[],spawn:null,goal:null};
  const library=createRouteLibrary({draft}),storage=store();
  assert.deepEqual(library.draft,draft);assert.equal(saveRoute(library,draft),null);assert.equal(library.nextNumber,1);
  assert.equal(writeRouteLibrary(storage,library),true);assert.deepEqual(readRouteLibrary(storage).draft,draft);
  assert.equal(createRouteLibrary({routes:[{id:'custom',level:createEditorLevel()}]}).routes.length,0);
  const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
  assert.deepEqual(readRouteLibrary(blocked),createRouteLibrary());assert.equal(writeRouteLibrary(blocked,library),false);
});

test('long saved routes retain all geometry and malformed library records are filtered',()=>{
  const level=createEditorLevel();
  level.platforms=Array.from({length:1000},(_,i)=>({id:`p${i}`,x:i*10,z:0,y:0,w:4,d:4,h:.6}));
  level.goal={x:9990,y:0,z:0};
  level.coins=Array.from({length:200},(_,i)=>({id:`c${i}`,x:i*10,y:.4,z:0}));
  level.checkpoints=Array.from({length:100},(_,i)=>({id:`cp${i}`,x:i*10,y:0,z:0}));
  const library=createRouteLibrary(),storage=store();assert.ok(saveRoute(library,level));
  assert.equal(writeRouteLibrary(storage,library),true);
  const restored=readRouteLibrary(storage);assert.equal(restored.routes[0].level.platforms.length,1000);
  assert.equal(restored.routes[0].level.coins.length,200);assert.equal(restored.routes[0].level.checkpoints.length,100);
  const valid=restored.routes[0];
  assert.equal(createRouteLibrary({routes:[valid,valid,{...valid,id:'invalid'}]}).routes.length,1);
});

test('numbering remains monotonic after deletion and formats multi-digit Chinese names',()=>{
  const library=createRouteLibrary({nextNumber:110});
  assert.equal(saveRoute(library,createEditorLevel()).name,'自创路线一百一十');
  library.routes=[];
  assert.equal(saveRoute(library,createEditorLevel()).name,'自创路线一百一十一');
});
