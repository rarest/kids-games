import test from 'node:test';
import assert from 'node:assert/strict';
import {connectTeam} from '../shooter/online.js';
test('high-refresh drag merges pointer updates while direction changes stay immediate',()=>{
 const savedWS=globalThis.WebSocket,clock=performance.now;let now=0,socket;const packets=[];
 class Socket{static OPEN=1;readyState=1;constructor(){socket=this}send(s){packets.push(JSON.parse(s))}close(){}}
 globalThis.WebSocket=Socket;performance.now=()=>now;
 try{
  const online=connectTeam({endpoint:'ws://test',onStatus(){},onJoined(){},onState(){},onLeft(){}});online.join({type:'create'});socket.onopen();
  for(let i=0;i<144;i++){now=i*1000/144;online.input({tx:i,ty:200})}
  const movement=packets.filter(p=>p.type==='input');assert.ok(movement.length<=35,`${movement.length} inputs on a 144Hz display`);
  now+=50;online.input({tx:144,ty:200});assert.equal(packets.at(-1).tx,144,'latest target is eventually sent');
  const before=packets.length;online.input({x:-1,y:0});assert.equal(packets.length,before+1,'direction changes send immediately');
  const sequence=packets.at(-1).sequence;now+=101;online.input({x:-1,y:0});assert.equal(packets.at(-1).sequence,sequence,'heartbeat repeats its original sequence');online.close();
 }finally{globalThis.WebSocket=savedWS;performance.now=clock}
});
