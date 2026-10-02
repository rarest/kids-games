import test from 'node:test';
import assert from 'node:assert/strict';
import {WebSocket} from 'ws';
import {createCoopServer} from '../shooter/server.mjs';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function connect(url){const ws=new WebSocket(url,{origin:'http://localhost'}),messages=[];ws.on('message',data=>messages.push(JSON.parse(data)));await new Promise((r,j)=>{ws.once('open',r);ws.once('error',j)});return {ws,messages,send:data=>ws.send(JSON.stringify(data)),async next(type,where=()=>true){for(let i=0;i<100;i++){const at=messages.findIndex(m=>m.type===type&&where(m));if(at>=0)return messages.splice(at,1)[0];await delay(20)}throw Error('Missing '+type)}}}
test('public protocol: join, independent input, room isolation, capacity, no client stat writes and reconnect',{timeout:20000},async()=>{
 const app=createCoopServer({port:0,origins:['http://localhost']});await app.ready;const url=`ws://127.0.0.1:${app.address().port}/shooter-ws`;const clients=[];
 try{
  const a=await connect(url);clients.push(a);a.send({type:'create'});const owner=await a.next('joined');
  const b=await connect(url);clients.push(b);b.send({type:'join',code:owner.code});const guest=await b.next('joined');assert.notEqual(owner.id,guest.id);
  a.send({type:'start'});await a.next('state',m=>m.game.mode==='playing');await b.next('state',m=>m.game.mode==='playing');
  b.send({type:'input',x:1,y:0,hp:9999,score:1e9});await delay(200);const state=await a.next('state',m=>m.game.time>.15);
  const p=state.game.partners.find(p=>p.id===guest.id);assert.ok(p.player.x>86.4);assert.equal(p.hp,10);assert.equal(state.game.hp,10);assert.ok(state.game.score<1e9);
  for(let i=2;i<16;i++){const guest=await connect(url);clients.push(guest);guest.send({type:'join',code:owner.code});await guest.next('joined')}
  const extra=await connect(url);clients.push(extra);extra.send({type:'join',code:owner.code});assert.match((await extra.next('error')).message,/满/);
  extra.send({type:'join',code:'XXXXXX'});assert.match((await extra.next('error')).message,/不存在/);
  extra.send({type:'create'});const other=await extra.next('joined');assert.notEqual(other.code,owner.code);assert.equal((await extra.next('state')).members.length,1);extra.send({type:'leave'});await extra.next('left');extra.send({type:'join',code:other.code});assert.match((await extra.next('error')).message,/不存在/);
  b.ws.close();await delay(120);const reconnect=await connect(url);clients.push(reconnect);reconnect.send({type:'join',code:owner.code,token:guest.token});assert.equal((await reconnect.next('joined')).id,guest.id);
  a.send({type:'leave'});await a.next('left');const inherited=await reconnect.next('state',s=>s.host!=='host');assert.ok(inherited.members.some(m=>m.id===inherited.host&&m.online));assert.ok(inherited.game.retired);assert.equal(inherited.game.mode,'paused');
 }finally{for(const c of clients)c.ws.terminate();await app.close()}
});
