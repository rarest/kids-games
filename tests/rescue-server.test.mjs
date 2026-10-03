import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import WebSocket from 'ws';
import { LEVELS } from '../rescue/levels.js';

const serverModule=await import('../rescue/server.mjs').catch(()=>({}));
const codec=await import('../rescue/net-codec.js').catch(()=>({}));
const input=(extra={})=>({move:0,up:false,down:false,jump:false,action:false,...extra});
const fixture=(extra={})=>({id:'0',name:'test',theme:'street',width:100,height:20,spawn:{x:5,y:1},platforms:[{id:'floor',x:0,y:1,w:100,h:1}],objects:[],enemies:[],hazards:[],pickups:[],decor:[],checkpoints:[],boss:null,exit:{x:98,y:1},...extra});
async function setup(t,options={}) {
  assert.equal(typeof serverModule.createRescueServer,'function','createRescueServer must exist');
  let time=0,callback;
  const clock={now:()=>time,setInterval:fn=>(callback=fn,1),clearInterval:()=>{}};
  const app=serverModule.createRescueServer({port:0,clock,levelFor:()=>fixture(),...options});
  await app.ready;
  const peers=[];
  t.after(async()=>{for(const p of peers)p.ws.terminate();await app.close();});
  async function peer(origin='https://games.nblord.com',path='/rescue-ws') {
    const ws=new WebSocket(`ws://127.0.0.1:${app.address().port}${path}`,{origin});
    const p={ws,packets:[],state:null};
    ws.on('message',raw=>{const packet=JSON.parse(raw);p.packets.push(packet);if(packet.type==='state')p.state=codec.decodeFrame(packet,p.state);});
    await once(ws,'open');peers.push(p);return p;
  }
  async function send(p,msg){p.ws.send(JSON.stringify(msg));await barrier(p);}
  async function barrier(p){const at=Math.random(),deadline=Date.now()+4000;p.ws.send(JSON.stringify({type:'ping',at}));while(!p.packets.some(v=>v.type==='pong'&&v.at===at)){if(Date.now()>deadline||p.ws.readyState!==WebSocket.OPEN)throw Error('WebSocket barrier timed out or disconnected');await new Promise(r=>setTimeout(r,1));}}
  async function tick(n=1){for(let i=0;i<n;i++){time+=1000/60;callback();}for(const p of peers)if(p.ws.readyState===WebSocket.OPEN&&!p.skipBarrier)await barrier(p);}
  function last(p,type='state'){return p.packets.findLast(v=>v.type===type);}
  async function pair(){const a=await peer();await send(a,{type:'create'});const b=await peer();await send(b,{type:'join',code:last(a,'joined').code});return [a,b];}
  async function start(a,b){await send(a,{type:'ready',value:true});await send(b,{type:'ready',value:true});await send(a,{type:'start'});await barrier(b);}
  async function commands(p,cmds,epoch=last(p).epoch){await send(p,{type:'input',epoch,commands:cmds.map((c,i)=>({seq:i+1,input:input(c)}))});}
  async function poll(ms){time+=ms;callback();for(const p of peers)if(p.ws.readyState===WebSocket.OPEN)await barrier(p);}
  return {app,peer,send,tick,poll,last,pair,start,commands,barrier,advanceTime:ms=>{time+=ms;}};
}

test('two seats, host-only lifecycle, explicit leave, separate room isolation',async t=>{
  const h=await setup(t),[a,b]=await h.pair();
  assert.equal(h.last(a,'joined').slot,0);assert.equal(h.last(b,'joined').slot,1);
  assert.deepEqual(a.state.players.map(p=>p.character),['chip','dale']);
  const c=await h.peer();await h.send(c,{type:'join',code:h.last(a,'joined').code});assert.match(h.last(c,'error').message,/满|full/);
  await h.send(c,{type:'create'});await h.send(b,{type:'start'});assert.ok(h.last(b,'error'));
  await h.start(a,b);await h.commands(a,[{move:1}]);await h.commands(b,[{move:-1}]);await h.tick(9);
  assert.ok(a.state.players[0].x>5.5);assert.ok(a.state.players[1].x<5.5);
  assert.equal(c.state.time,0);assert.equal(c.state.players[0].x,5);
  await h.send(b,{type:'leave'});await h.barrier(a);assert.ok(h.last(a,'closed'));
  await h.send(c,{type:'join',code:h.last(a,'joined').code});assert.ok(h.last(c,'error'));
});

test('one command per tick, acknowledgements, duplicates/old epoch, held input edge clearing',async t=>{
  const h=await setup(t),[a,b]=await h.pair();await h.start(a,b);
  const epoch=h.last(a).epoch;
  await h.commands(a,[{action:true,jump:true},{action:true,jump:true},{action:false,jump:false},{action:true}],epoch);
  await h.commands(b,[{}]);await h.tick(3);
  assert.deepEqual(h.last(a).acks,[3,1]);assert.equal(a.state.events.filter(e=>e.type==='pickup').length,1);
  assert.equal(a.state.events.filter(e=>e.type==='jump').length,1);
  assert.equal(a.state.players[1].heldBy,'p1');
  await h.tick(3);assert.deepEqual(h.last(a).acks,[4,1]);assert.equal(a.state.players[1].heldBy,null);
  assert.equal(a.state.events.filter(e=>e.type==='throw').length,1);
  await h.commands(a,[{action:true}],epoch);await h.tick(3);
  assert.equal(a.state.events.filter(e=>e.type==='throw').length,1);
  assert.equal(h.last(a).inputs[0].action,false);
  await h.send(a,{type:'pause'});const paused=h.last(a);assert.ok(paused.epoch>epoch);
  const errors=a.packets.filter(p=>p.type==='error').length;await h.commands(a,[{move:1}],epoch);assert.equal(a.packets.filter(p=>p.type==='error').length,errors);
  const x=a.state.players[0].x;await h.tick(3);assert.equal(a.state.players[0].x,x);
});

test('ready false, stale input and disconnect pause; token reclaims original seat; manual resume only',async t=>{
  const h=await setup(t),[a,b]=await h.pair();await h.start(a,b);
  await h.send(b,{type:'ready',value:false});await h.barrier(a);assert.equal(h.last(a).room.mode,'paused');
  await h.send(a,{type:'resume'});assert.equal(h.last(a).room.mode,'paused');assert.ok(h.last(a,'error'));
  await h.send(b,{type:'ready',value:true});await h.send(a,{type:'resume'});await h.tick(24);assert.equal(h.last(a).room.mode,'paused');
  await h.send(a,{type:'resume'});
  const joined=h.last(b,'joined');b.ws.terminate();await once(b.ws,'close');await new Promise(r=>setTimeout(r,10));await h.barrier(a);
  assert.equal(h.last(a).room.mode,'paused');
  const c=await h.peer();await h.send(c,{type:'join',code:joined.code,token:joined.token});
  assert.equal(h.last(c,'joined').slot,1);assert.equal(h.last(c).room.mode,'paused');
  await h.send(a,{type:'resume'});assert.equal(h.last(a).room.mode,'paused');
  await h.send(c,{type:'ready',value:true});await h.send(a,{type:'resume'});assert.equal(h.last(a).room.mode,'playing');
});

test('input validation is atomic and cannot write another seat or authoritative state',async t=>{
  const h=await setup(t),[a,b]=await h.pair();await h.start(a,b);
  const epoch=h.last(a).epoch;
  for(const bad of [{move:2},{jump:'true'},{move:null}]){
    await h.send(a,{type:'input',epoch,commands:[{seq:1,input:input({move:1})},{seq:2,input:input(bad)}]});assert.ok(h.last(a,'error'));
  }
  await h.send(a,{type:'input',epoch,slot:1,state:{score:999},commands:[{seq:1,input:input({move:1})}]});
  await h.commands(b,[{}]);await h.tick(3);
  assert.equal(a.state.score,0);assert.equal(a.state.players[1].x,5.9);assert.ok(a.state.players[0].x>5);
  await h.send(b,{type:'next',areaId:'J'});assert.equal(b.state.areaLevel.id,'0');assert.ok(h.last(b,'error'));
  await h.send(a,{type:'next',areaId:'J'});assert.equal(a.state.areaLevel.id,'0');assert.ok(h.last(a,'error'));
});

test('server retry restores authoritative entry rewards; bonus completion unlocks valid next areas',async t=>{
  const h=await setup(t,{levelFor:id=>fixture({id,exit:{x:7,y:1},pickups:[{id:'flower',kind:'flower',x:5,y:1}]})});
  const [a,b]=await h.pair();await h.start(a,b);await h.commands(a,[{}]);await h.commands(b,[{}]);await h.tick(3);assert.equal(a.state.score,100);
  await h.send(a,{type:'pause'});await h.send(a,{type:'retry'});assert.equal(a.state.score,0);assert.equal(a.state.flowers,0);
  await h.commands(a,[{move:1}]);await h.commands(b,[{}]);await h.tick(12);assert.equal(a.state.status,'bonus');
  await h.send(a,{type:'finishBonus'});assert.equal(a.state.status,'cleared');
  await h.send(a,{type:'next',areaId:'J'});assert.equal(a.state.areaLevel.id,'0');
  await h.send(a,{type:'next',areaId:'A'});assert.equal(a.state.areaLevel.id,'A');assert.equal(a.state.score,100);
  assert.deepEqual(a.state.campaign.completed,['0']);
});

test('default real street simulation measured at 20 dynamic frames per second stays below bandwidth budget',async t=>{
  const h=await setup(t,{levelFor:id=>LEVELS.find(l=>l.id===id)}),[a,b]=await h.pair();await h.start(a,b);
  const setupBytes=Buffer.byteLength(JSON.stringify(h.last(a)));
  a.packets=[];b.packets=[];
  for(let block=0;block<1200;block++){
    for(const p of [a,b])await h.send(p,{type:'input',epoch:2,commands:Array.from({length:3},(_,i)=>({seq:block*3+i+1,input:input({move:block%60<30?1:-1,jump:block%30===0&&i===0,action:block%40===0&&i===0})}))});
    await h.tick(3);
  }
  const frames=a.packets.filter(p=>p.type==='state');assert.equal(frames.length,1200);
  assert.ok(frames.every(p=>!p.stage));
  const sizes=frames.map(p=>Buffer.byteLength(JSON.stringify(p))),bytesPerSecond=sizes.reduce((a,b)=>a+b,0)/60,finalSecondBytes=sizes.slice(-20).reduce((a,b)=>a+b,0);
  console.log(JSON.stringify({measurement:'active-street-per-client',setupBytes,frames:frames.length,bytesPerSecond,finalSecondBytes,maxFrame:Math.max(...sizes),eventHistory:a.state.events.length}));
  assert.ok(bytesPerSecond<=80*1024,`bandwidth ${bytesPerSecond}`);
  assert.ok(finalSecondBytes<=80*1024,`steady-state bandwidth ${finalSecondBytes}`);
  assert.equal(a.state.events.length,100);assert.ok(a.state.time>59.9);
  assert.equal(b.packets.filter(p=>p.type==='state').reduce((n,p)=>n+Buffer.byteLength(JSON.stringify(p)),0),sizes.reduce((a,b)=>a+b,0));
});

test('rejects missing or foreign Origins and wrong upgrade path while allowing both configured sites',async t=>{
  const h=await setup(t);
  for(const [origin,path] of [['https://evil.example','/rescue-ws'],['','/rescue-ws'],['https://games.nblord.com','/shooter-ws']]) {
    const ws=new WebSocket(`ws://127.0.0.1:${h.app.address().port}${path}`,{origin});
    const [error]=await once(ws,'error');assert.match(error.message,/403/);ws.terminate();
  }
  const second=await h.peer('https://games.596996.xyz');await h.send(second,{type:'create'});assert.ok(h.last(second,'joined'));
});

test('bounded input queues reject overflow atomically and duplicates do not revive stale controls',async t=>{
  const h=await setup(t),[a,b]=await h.pair();await h.start(a,b);
  const epoch=h.last(a).epoch;
  for(let batch=0;batch<4;batch++)await h.send(a,{type:'input',epoch,commands:Array.from({length:30},(_,i)=>({seq:batch*30+i+1,input:input({move:1})}))});
  await h.send(a,{type:'input',epoch,commands:[{seq:121,input:input({move:-1})}]});assert.match(h.last(a,'error').message,/队列/);
  await h.commands(b,[{}]);await h.tick(3);assert.deepEqual(h.last(a).acks,[3,1]);
  await h.commands(a,[{move:-1}],epoch);await h.tick(20);assert.equal(h.last(a).room.mode,'paused');
  const count=a.state.time;await h.tick(9);assert.equal(a.state.time,count);
});

test('4096 byte payload limit disconnects oversized clients and pauses the other seat',async t=>{
  const h=await setup(t),[a,b]=await h.pair();await h.start(a,b);
  const closed=once(b.ws,'close');b.ws.send(JSON.stringify({type:'input',junk:'x'.repeat(4096)}));
  const [code]=await closed;assert.equal(code,1009);await h.barrier(a);assert.equal(h.last(a).room.mode,'paused');
});

test('expired 120-second reclaim ends the room instead of admitting an impostor',async t=>{
  const h=await setup(t),[a,b]=await h.pair(),joined=h.last(b,'joined');
  b.ws.terminate();await once(b.ws,'close');await new Promise(r=>setTimeout(r,10));
  const stranger=await h.peer();await h.send(stranger,{type:'join',code:joined.code,token:'invalid'});assert.ok(h.last(stranger,'error'));assert.equal(h.last(stranger,'joined'),undefined);
  await h.send(stranger,{type:'join',code:joined.code});assert.match(h.last(stranger,'error').message,/满/);
  h.advanceTime(120001);await h.tick();assert.ok(h.last(a,'closed'));
  await h.send(stranger,{type:'join',code:joined.code,token:joined.token});assert.ok(h.last(stranger,'error'));assert.equal(h.last(stranger,'joined'),undefined);
});

test('room and connection resource limits reject new allocations and free explicit-leave rooms',async t=>{
  const h=await setup(t);const members=[];
  for(let i=0;i<16;i++){const p=await h.peer();await h.send(p,{type:'create'});members.push(p);}
  const excess=await h.peer();await h.send(excess,{type:'create'});assert.match(h.last(excess,'error').message,/满/);
  await h.send(members[0],{type:'leave'});await h.send(excess,{type:'create'});assert.ok(h.last(excess,'joined'));
  for(let i=17;i<64;i++)await h.peer();
  const ws=new WebSocket(`ws://127.0.0.1:${h.app.address().port}/rescue-ws`,{origin:'https://games.nblord.com'});
  const [error]=await once(ws,'error');assert.match(error.message,/403/);ws.terminate();
});

test('real wall-clock simulation advances at 60 Hz and broadcasts at 20 Hz',async t=>{
  const h=await setup(t,{clock:undefined}),[a,b]=await h.pair();await h.start(a,b);
  const epoch=h.last(a).epoch;
  let seq=0;
  const feed=()=>{seq++;for(const p of [a,b])p.ws.send(JSON.stringify({type:'input',epoch,commands:[{seq,input:input({move:seq%20<10?1:-1})}]}));};
  const timer=setInterval(feed,40);t.after(()=>clearInterval(timer));feed();
  const start=performance.now();a.packets=[];
  await new Promise(r=>setTimeout(r,2200));clearInterval(timer);await h.send(a,{type:'pause'});
  const elapsed=(performance.now()-start)/1000;
  const frames=a.packets.filter(p=>p.type==='state'&&p.room.mode==='playing');
  console.log(JSON.stringify({measurement:'wall-clock-cadence',elapsed,simulationSeconds:a.state.time,dynamicFrames:frames.length}));
  assert.ok(Math.abs(a.state.time-elapsed)<.06,`simulation ${a.state.time} vs elapsed ${elapsed}`);
  assert.ok(Math.abs(frames.length-elapsed*20)<=2);
});

test('rounded timer intervals do not speed up the fixed 60 Hz simulation',async t=>{
  const h=await setup(t),[a,b]=await h.pair();await h.start(a,b);
  const epoch=h.last(a).epoch;a.packets=[];
  for(let i=0;i<50;i++){
    for(const p of [a,b])await h.send(p,{type:'input',epoch,commands:[{seq:i+1,input:input()}]});
    await h.poll(16);
  }
  await h.send(a,{type:'pause'});
  assert.ok(Math.abs(a.state.time-.8)<1e-9,`50 timer wakes at16ms must simulate 48 ticks; got ${a.state.time}`);
  assert.equal(a.packets.filter(p=>p.type==='state'&&p.room.mode==='playing').length,16);
});

test('a real slow reader skips congested snapshots and later receives complete current state', {timeout:25000}, async t=>{
  const enemies=Array.from({length:1000},(_,i)=>({id:`bird-${i}`,kind:'bird',x:6,y:7,min:0,max:15}));
  const h=await setup(t,{levelFor:()=>fixture({enemies})}),[a,b]=await h.pair();await h.start(a,b);
  const epoch=h.last(a).epoch;
  b.skipBarrier=true;b.ws._socket.pause();b.packets=[];
  for(let block=0;block<160;block++){
    const message={type:'input',epoch,commands:[{seq:block+1,input:input()}]};
    b.ws.send(JSON.stringify(message));await h.send(a,message);await h.tick(3);
    a.packets=a.packets.filter(p=>p.type==='state').slice(-1);
  }
  b.ws._socket.resume();await h.barrier(b);b.skipBarrier=false;
  await h.tick(3);
  const ticks=b.packets.filter(p=>p.type==='state').map(p=>p.tick);
  assert.ok(ticks.some((tick,i)=>i>0&&tick-ticks[i-1]>3),'slow consumer must omit old snapshots');
  assert.equal(h.last(a).tick,h.last(b).tick);assert.deepEqual(a.state,b.state);
  assert.equal(b.state.enemies.length,1000);assert.ok(b.state.enemies[0].timer>7.9);
});

test('late positive integer input epochs are quietly discarded without changing input, readiness or stale deadline',async t=>{
 const h=await setup(t),[a,b]=await h.pair();await h.start(a,b);const old=h.last(a).epoch;
 await h.send(a,{type:'pause'});await h.send(a,{type:'resume'});const current=h.last(a).epoch;
 const errors=()=>a.packets.filter(p=>p.type==='error').length;
 const before=errors(),position=a.state.players[0].x,ready=h.last(a).room.members.map(m=>m.ready);
 await h.commands(a,[{move:1,jump:true,action:true}],old);await h.tick(3);
 assert.equal(errors(),before,'normal late input should not become a player-visible protocol error');
 assert.deepEqual(h.last(a).acks,[0,0]);assert.equal(a.state.players[0].x,position);assert.deepEqual(h.last(a).room.members.map(m=>m.ready),ready);
 await h.commands(a,[{}],current);await h.commands(b,[{}],current);await h.tick(3);assert.deepEqual(h.last(a).acks,[1,1],'old seq did not alter received/queue');
 await h.poll(300);await h.commands(a,[{move:1}],old);await h.commands(b,[{move:1}],old);await h.poll(60);
 assert.equal(h.last(a).room.mode,'paused','late old packets do not refresh the stale deadline');assert.equal(errors(),before);
 for(const epoch of [current+100,1.5,String(old),-1,0,null]){const count=errors();await h.commands(a,[{}],epoch);assert.equal(errors(),count+1,`invalid/future epoch ${epoch} stays rejected`);}
});
