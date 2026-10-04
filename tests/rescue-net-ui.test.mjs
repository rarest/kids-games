import test from 'node:test';
import assert from 'node:assert/strict';
import {updateRoomUI,resetRoomUI} from '../rescue/net-ui.js';

test('an input timeout explains the affected teammate and preserves host-only manual resume',()=>{
 const previous=globalThis.document, elements=new Map();
 globalThis.document={getElementById(id){if(!elements.has(id))elements.set(id,{});return elements.get(id);}};
 const status={connection:'connected',message:'',rtt:200,code:'ABC123',slot:0,room:{mode:'paused',pauseReason:{type:'input-timeout',slot:1},members:[{connected:true,ready:true},{connected:true,ready:true}]}};
 try{
  updateRoomUI(status,true);
  assert.match(elements.get('pause-copy').textContent,/蒂蒂.*操作.*暂停/);
  assert.match(elements.get('pause-copy').textContent,/继续冒险/);
  assert.equal(elements.get('resume').disabled,false);
  updateRoomUI({...status,slot:1},true);
  assert.match(elements.get('pause-copy').textContent,/等待房主/);
  assert.equal(elements.get('resume').disabled,true);
  updateRoomUI(status,false);assert.equal(elements.get('resume').disabled,true);
  assert.match(elements.get('pause-copy').textContent,/恢复/);
  status.room.members[1].ready=false;updateRoomUI(status,true);
  assert.equal(elements.get('resume').disabled,true);assert.match(elements.get('pause-copy').textContent,/连接并准备/);
  status.room.members[1].ready=true;status.room.pauseReason=null;updateRoomUI(status,true);
  assert.doesNotMatch(elements.get('pause-copy').textContent,/操作.*暂停/);
  resetRoomUI();assert.equal(elements.get('pause-copy').textContent,'准备好了，就继续一起出发。');
 }finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous;}
});
