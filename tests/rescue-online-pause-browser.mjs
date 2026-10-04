import test from 'node:test';
import assert from 'node:assert/strict';
import {openOnlinePair,createRoom,click,key,point,touch,wait,snapshot,sleep} from './rescue-online-harness.mjs';

test('a stalled input stream explains the pause, requires host resume and preserves the seat after reload',{timeout:150000},async()=>{
 const pair=await openOnlinePair({quality:'low'}),{host,guest}=pair;
 try{
  for(const b of [host,guest])await b.size(320,400);
  const saved=await host.evaluate('localStorage.getItem("rescue-rangers-3d-v1")');
  await createRoom(pair);
  await guest.evaluate(`(()=>{
   window.__holdRescueInputs=true;
   for(const ws of window.__rescueSockets){const send=ws.send.bind(ws);ws.send=raw=>{if(window.__holdRescueInputs&&JSON.parse(raw).type==='input')return;return send(raw);};}
  })()`);
  for(const b of [host,guest])await wait(b,'view.dataset.phase==="paused"');
  for(const b of [host,guest]){
   assert.deepEqual((await snapshot(b)).network.room.pauseReason,{type:'input-timeout',slot:1});
   assert.match(await b.evaluate('document.querySelector("#pause-copy").textContent'),/蒂蒂.*操作.*暂停/);
   assert.deepEqual(b.errors,[]);
  }
  assert.equal(await guest.evaluate('document.querySelector("#resume").disabled'),true);
  assert.equal(await host.evaluate('document.querySelector("#resume").disabled'),false);
  const paused=await snapshot(host);await sleep(450);
  assert.deepEqual((await snapshot(host)).positions,paused.positions,'paused players remain still');
  assert.equal((await snapshot(host)).network.room.mode,'paused','no automatic resume');
  await guest.evaluate('window.__holdRescueInputs=false');
  await click(host,'#resume');for(const b of [host,guest])await wait(b,'view.dataset.phase==="playing"');
  assert.equal((await snapshot(host)).network.room.pauseReason,null);
  const before=(await snapshot(host)).positions[1].x;
  await key(guest,'KeyD');await wait(host,`JSON.parse(view.dataset.positions)[1].x>${before+.2}`);await key(guest,'KeyD',false);
  const touchBefore=(await snapshot(host)).positions[1].x,stick=await point(guest,'#joystick');
  await touch(guest,'touchStart',{x:stick.x+35,y:stick.y});
  await wait(host,`JSON.parse(view.dataset.positions)[1].x>${touchBefore+.2}`);await touch(guest,'touchEnd',stick);
  await click(host,'#pause');for(const b of [host,guest])await wait(b,'view.dataset.phase==="paused"');
  await guest.call('Page.reload');
  await wait(guest,'JSON.parse(view.dataset.network||"null")?.slot===1&&JSON.parse(view.dataset.network).connection==="connected"&&JSON.parse(view.dataset.network).room.members[1].ready',60000);
  await wait(host,'!document.querySelector("#resume").disabled');
  assert.equal((await snapshot(guest)).network.room.mode,'paused','reload must not resume the room');
  await click(host,'#resume');for(const b of [host,guest])await wait(b,'view.dataset.phase==="playing"');
  await click(host,'#pause');await wait(host,'view.dataset.phase==="paused"');await click(host,'#online-leave');
  for(const b of [host,guest]){await wait(b,'view.dataset.phase==="home"');assert.equal(await b.evaluate('sessionStorage.getItem("rescue.online.session.v1")'),null);assert.deepEqual(b.errors,[]);}
  assert.equal(await host.evaluate('localStorage.getItem("rescue-rangers-3d-v1")'),saved,'online recovery does not alter the local save');
 }finally{await pair.close();}
});
