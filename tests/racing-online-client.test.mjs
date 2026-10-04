import test from 'node:test';
import assert from 'node:assert/strict';
import WebSocket from 'ws';
import { createRacingServer } from '../racing/server.mjs';
import { RacingClient } from '../racing/online.js';

async function wait(check) {const end=Date.now()+5000;while(!check()){assert.ok(Date.now()<end,'real socket result arrives');await new Promise(r=>setTimeout(r,10));}}
async function setup(t) {
  let now=0,tick;const app=createRacingServer({port:0,clock:{now:()=>now,setInterval:f=>(tick=f,1),clearInterval:()=>{}}});await app.ready;
  const origin=`http://127.0.0.1:${app.address().port}`;
  // Keep the actual WebSocket transport; only supply the browser's Origin header.
  const saved={WebSocket:globalThis.WebSocket,location:globalThis.location,sessionStorage:globalThis.sessionStorage};
  globalThis.WebSocket=class extends WebSocket {constructor(url){super(url,{origin:'https://games.nblord.com'});}};
  globalThis.location={href:`${origin}/games/racing.html`,protocol:'http:'};
  const store=new Map();globalThis.sessionStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
  const clients=[];
  t.after(async()=>{clients.forEach(c=>c.leave());await app.close();Object.assign(globalThis,saved);});
  const make=()=>{const packets=[],errors=[];const c=new RacingClient({onState:p=>packets.push(p),onJoined:()=>{},onStatus:()=>{},onError:m=>errors.push(m),onLeave:()=>{}});c.packets=packets;c.errors=errors;clients.push(c);return c;};
  const create={type:'create',name:'队长',car:'apex',skin:'aurora',trackId:'plateau'};
  async function pair(){const a=make();a.enter(create);await wait(()=>a.room?.members.length===1);const b=make();b.enter({type:'join',code:a.session.code,name:'朋友',car:'apex',skin:'silver'});await wait(()=>a.room?.members.length===2&&b.room);return[a,b];}
  async function advance(n){for(let i=0;i<n;i++){now+=1000/60;tick();}await new Promise(r=>setTimeout(r,15));}
  return {make,pair,advance,create,origin};
}
test('repeated create clicks open one transport and one room',async t=>{
  const h=await setup(t),c=h.make();for(let i=0;i<4;i++)c.enter(h.create);
  await wait(()=>c.session&&c.room);const health=await fetch(`${h.origin}/health`).then(r=>r.json());
  assert.equal(health.rooms,1);assert.equal(health.connections,1,'pending entry does not leak idle sockets');
});
test('ordinary input validation errors keep membership for the next race',async t=>{
  const h=await setup(t),[a,b]=await h.pair();b.send({type:'ready',value:true});await wait(()=>a.room.members[1].ready);a.send({type:'start'});await wait(()=>b.room.mode==='racing');
  b.send({type:'input',run:2,seq:1,input:{throttle:true,steer:0,brake:false,boost:false}});
  await wait(()=>b.errors.length);assert.ok(b.session);assert.equal(b.room.members.length,2);
  a.send({type:'lobby'});await wait(()=>b.room.mode==='lobby');b.send({type:'ready',value:true});await wait(()=>a.room.members[1].ready);a.send({type:'start'});await wait(()=>b.room.run===2);
  assert.ok(b.session);assert.equal(b.room.members.length,2);
});
test('a real reconnect restores the same slot and resumes input above acknowledged sequence',async t=>{
  const h=await setup(t),[a,b]=await h.pair();b.send({type:'ready',value:true});await wait(()=>a.room.members[1].ready);a.send({type:'start'});await wait(()=>b.room.mode==='racing');
  await h.advance(181);for(let i=0;i<9;i++)b.input({throttle:true,steer:1,brake:false,boost:false},performance.now(),true);
  await new Promise(r=>setTimeout(r,20));await h.advance(12);const slot=b.session.slot,token=b.session.token;
  assert.equal(b.packets.at(-1).acks[slot],9);b.socket.terminate();
  await wait(()=>a.room.members.find(m=>m.id===slot).connected===false);
  await wait(()=>b.socket?.readyState===WebSocket.OPEN&&a.room.members.find(m=>m.id===slot).connected);
  assert.equal(b.session.slot,slot);assert.equal(b.session.token,token);
  b.input({throttle:true,steer:-1,brake:false,boost:false},performance.now(),true);
  await new Promise(r=>setTimeout(r,20));await h.advance(3);
  assert.equal(b.packets.at(-1).acks[slot],10);
  assert.equal(b.packets.at(-1).race.cars.find(c=>c.id===slot).steer,-1);
});
