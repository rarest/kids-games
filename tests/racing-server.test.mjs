import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import WebSocket from 'ws';
import {CARS,makeTrack,roadAt} from '../racing/core.js';
import {makeHazards,safeLane} from '../racing/hazards.js';
const server=await import('../racing/server.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
const controls=(values={})=>({throttle:false,steer:0,brake:false,boost:false,...values});
async function setup(t){
 assert.equal(typeof server.createRacingServer,'function','createRacingServer must exist');
 let now=0,tick;const clock={now:()=>now,setInterval:fn=>(tick=fn,1),clearInterval:()=>{}};
 const app=server.createRacingServer({port:0,clock});await app.ready;const peers=[];
 t.after(async()=>{peers.forEach(p=>p.ws.terminate());await app.close();});
 async function peer(origin='https://games.nblord.com',path='/racing-ws'){
  const ws=new WebSocket(`ws://127.0.0.1:${app.address().port}${path}`,{origin});const p={ws,packets:[]};ws.on('message',raw=>p.packets.push(JSON.parse(raw)));await once(ws,'open');peers.push(p);return p;
 }
 const last=(p,type='state')=>p.packets.findLast(m=>m.type===type);
 async function barrier(p){const at=Math.random();p.ws.send(JSON.stringify({type:'ping',at}));const deadline=Date.now()+3000;while(!p.packets.some(m=>m.type==='pong'&&m.at===at)){if(Date.now()>deadline)throw Error('barrier timeout');await new Promise(r=>setTimeout(r,1));}}
 async function send(p,m){p.ws.send(JSON.stringify(m));await barrier(p);}
 async function advance(n){for(let i=0;i<n;i++){now+=1000/60;tick();}for(const p of peers)if(p.ws.readyState===WebSocket.OPEN&&!p.skipBarrier)await barrier(p);}
 async function poll(ms){now+=ms;tick();for(const p of peers)if(p.ws.readyState===WebSocket.OPEN&&!p.skipBarrier)await barrier(p);}
 async function pair(){const a=await peer();await send(a,{type:'create',name:'甲',car:'apex',skin:'aurora',trackId:'tour'});const b=await peer();await send(b,{type:'join',code:last(a,'joined').code,name:'乙',car:'rally',skin:'silver'});return[a,b];}
 async function start(a,b){await send(b,{type:'ready',value:true});await send(a,{type:'start'});await barrier(b);}
 return {app,peer,last,send,barrier,advance,poll,pair,start};
}
test('six digit rooms isolate teams, hide tokens and support two to eight players',async t=>{
 const h=await setup(t),[a,b]=await h.pair();const joined=h.last(a,'joined');assert.match(joined.code,/^[1-9]\d{5}$/);assert.equal(joined.slot,0);assert.equal(h.last(b,'joined').slot,1);
 assert.ok(joined.token.length>=32);assert.ok(!JSON.stringify(h.last(b)).includes(joined.token));
 for(let i=2;i<8;i++){const p=await h.peer();await h.send(p,{type:'join',code:joined.code,name:`队员${i}`,car:'apex',skin:'aurora'});assert.equal(h.last(p,'joined').slot,i);}
 const ninth=await h.peer();await h.send(ninth,{type:'join',code:joined.code,name:'多余',car:'apex',skin:'aurora'});assert.match(h.last(ninth,'error').message,/满|8/);
 await h.send(ninth,{type:'create',name:'另队',car:'apex',skin:'aurora',trackId:'plateau'});assert.notEqual(h.last(ninth,'joined').code,joined.code);assert.equal(h.last(ninth).room.members.length,1);
});
test('only the captain changes track, starts ready connected teams or returns them to lobby',async t=>{
 const h=await setup(t),[a,b]=await h.pair();await h.send(b,{type:'settings',trackId:'mountain'});assert.match(h.last(b,'error').message,/队长/);
 await h.send(a,{type:'start'});assert.equal(h.last(a).room.mode,'lobby');assert.ok(h.last(a,'error'));
 await h.send(b,{type:'ready',value:true});await h.send(a,{type:'settings',trackId:'plateau'});assert.equal(h.last(a).room.members.find(m=>m.id===1).ready,false);
 await h.start(a,b);assert.equal(h.last(a).room.mode,'racing');assert.equal(h.last(a).race.cars.length,11);assert.ok(h.last(a).race.cars.every(c=>!('model'in c)&&typeof c.car==='string'&&typeof c.skin==='string'));
 const c=await h.peer();await h.send(c,{type:'join',code:h.last(a).room.code,name:'晚来',car:'apex',skin:'aurora'});assert.ok(h.last(c,'error'));
 await h.send(b,{type:'lobby'});assert.equal(h.last(b).room.mode,'racing');await h.send(a,{type:'lobby'});assert.equal(h.last(a).room.mode,'lobby');assert.equal(h.last(a).race,null);
});
test('server owns motion, consumes increasing run sequences and neutralizes stale controls after 500 ms',async t=>{
 const h=await setup(t),[a,b]=await h.pair();await h.start(a,b);await h.advance(181);const run=h.last(a).room.run;
 await h.send(a,{type:'input',run,seq:1,input:controls({throttle:true,steer:1,boost:true}),s:999999});await h.advance(12);
 const state=h.last(a);assert.equal(state.acks['0'],1);assert.ok(state.race.cars[0].speed>0);assert.equal(state.race.cars[1].speed,0);assert.ok(state.race.cars[0].s<100);
 await h.send(a,{type:'input',run,seq:1,input:controls({steer:-1})});await h.advance(3);assert.equal(h.last(a).race.cars[0].steer,1);
 await h.poll(501);await h.advance(3);assert.equal(h.last(a).race.cars[0].steer,0);assert.equal(h.last(a).race.cars[0].boosting,false);
 await h.send(a,{type:'input',run:run+1,seq:2,input:controls({throttle:true})});assert.match(h.last(a,'error').message,/比赛|版本|run/);
 await h.send(a,{type:'input',run,seq:2,input:controls({steer:2})});assert.match(h.last(a,'error').message,/输入/);assert.equal(h.last(a).acks['0'],1);
});
test('captain disconnect transfers ownership and a valid private token restores the fixed racing slot',async t=>{
 const h=await setup(t),[a,b]=await h.pair();await h.start(a,b);const joined=h.last(a,'joined');a.ws.close();await once(a.ws,'close');await h.barrier(b);assert.equal(h.last(b).room.host,1);
 const again=await h.peer();await h.send(again,{type:'join',code:joined.code,token:joined.token,name:'甲',car:'apex',skin:'aurora'});assert.equal(h.last(again,'joined').slot,0);assert.equal(h.last(again).room.host,1);assert.equal(h.last(again).race.cars[0].human,true);
 await h.send(again,{type:'settings',trackId:'tour'});assert.match(h.last(again,'error').message,/队长/);
 const bad=await h.peer();await h.send(bad,{type:'join',code:joined.code,token:'invalid',name:'冒名',car:'apex',skin:'aurora'});assert.match(h.last(bad,'error').message,/凭据/);
});
test('a 60 second disconnect converts only that car to AI without changing identity or stalling remaining players',async t=>{
 const h=await setup(t),[a,b]=await h.pair();await h.start(a,b);const old=h.last(b,'joined');b.ws.close();await once(b.ws,'close');await h.barrier(a);
 await h.poll(60001);await h.advance(3);const car=h.last(a).race.cars.find(c=>c.id===old.slot);assert.equal(car.human,false);assert.equal(car.name,'乙');assert.equal(h.last(a).room.mode,'racing');
 const again=await h.peer();await h.send(again,{type:'join',code:old.code,token:old.token,name:'乙',car:'rally',skin:'silver'});assert.match(h.last(again,'error').message,/凭据|超时/);
 await h.send(a,{type:'lobby'});assert.deepEqual(h.last(a).room.members.map(m=>m.id),[0]);
});
test('leave transfers captain and an empty room is removed; invalid origins and routes are denied',async t=>{
 const h=await setup(t),[a,b]=await h.pair();const code=h.last(a).room.code;
 await h.send(a,{type:'leave'});await h.barrier(b);assert.equal(h.last(b).room.host,1);await h.send(b,{type:'leave'});
 const c=await h.peer();await h.send(c,{type:'join',code,name:'丙',car:'apex',skin:'aurora'});assert.match(h.last(c,'error').message,/不存在/);
 for(const[origin,path]of [['https://evil.invalid','/racing-ws'],['https://games.nblord.com','/wrong']]){const ws=new WebSocket(`ws://127.0.0.1:${h.app.address().port}${path}`,{origin});const[error]=await once(ws,'error');assert.match(error.message,/403/);}
});
test('malformed metadata and payload never create rooms or inject public identity fields',async t=>{
 const h=await setup(t),a=await h.peer();await h.send(a,{type:'create',name:'甲',car:'hacked',skin:'aurora',trackId:'tour'});assert.match(h.last(a,'error').message,/车辆/);
 await h.send(a,{type:'join',code:'ABC123',name:'甲',car:'apex',skin:'aurora'});assert.match(h.last(a,'error').message,/6位|数字/);
 a.ws.send('{bad');await h.barrier(a);assert.match(h.last(a,'error').message,/格式/);
 await h.send(a,{type:'create',name:'甲',car:'apex',skin:'aurora',trackId:'tour'});assert.equal(h.last(a).room.members.length,1);
});

test('the real-time accumulator advances 60 simulation ticks and broadcasts 20 frames per elapsed second',async t=>{
 const h=await setup(t),[a,b]=await h.pair();await h.start(a,b);
 const before=a.packets.filter(m=>m.type==='state').length;
 await h.advance(60);
 assert.equal(h.last(a).tick,60);
 assert.ok(Math.abs(h.last(a).race.countdown-2)<1e-9);
 assert.equal(a.packets.filter(m=>m.type==='state').length-before,20);
});
test('host departure during a race converts its car to AI and preserves the other participant slot',async t=>{
 const h=await setup(t),[a,b]=await h.pair();await h.start(a,b);
 await h.send(a,{type:'leave'});await h.barrier(b);
 assert.equal(h.last(b).room.host,1);assert.equal(h.last(b).race.cars[0].human,false);assert.equal(h.last(b).race.cars[1].human,true);
 await h.send(b,{type:'lobby'});assert.deepEqual(h.last(b).room.members.map(m=>m.id),[1]);
 const c=await h.peer();await h.send(c,{type:'join',code:h.last(b).room.code,name:'新队员',car:'apex',skin:'aurora'});assert.equal(h.last(c,'joined').slot,0);
 await h.send(c,{type:'ready',value:true});await h.send(b,{type:'start'});await h.barrier(c);assert.equal(h.last(b).room.run,2);
 assert.equal(h.last(b).race.cars[1].name,'乙');assert.equal(h.last(b).race.cars[1].human,true);
});
test('room and connection limits reject excess resources without dropping existing teams',async t=>{
 const h=await setup(t);let first;
 for(let i=0;i<16;i++){const p=await h.peer();first??=p;await h.send(p,{type:'create',name:`队长${i}`,car:'apex',skin:'aurora',trackId:'tour'});assert.ok(h.last(p,'joined'));}
 const extra=await h.peer();await h.send(extra,{type:'create',name:'多余房间',car:'apex',skin:'aurora',trackId:'tour'});assert.match(h.last(extra,'error').message,/房间数量/);
 for(let i=17;i<128;i++)await h.peer();
 const rejected=new WebSocket(`ws://127.0.0.1:${h.app.address().port}/racing-ws`,{origin:'https://games.nblord.com'});const[error]=await once(rejected,'error');assert.match(error.message,/403/);
 await h.barrier(first);assert.equal(h.last(first).room.members.length,1);
});
test('oversized and high-rate messages close only the offending connection',async t=>{
 const h=await setup(t),a=await h.peer(),b=await h.peer();
 const oversized=once(a.ws,'close');a.ws.send('x'.repeat(4097));const[code]=await oversized;assert.equal(code,1009);
 const flooded=once(b.ws,'close');for(let i=0;i<181;i++)b.ws.send(JSON.stringify({type:'ping',at:i}));const[rateCode]=await flooded;assert.equal(rateCode,1008);
 const healthy=await h.peer();await h.send(healthy,{type:'create',name:'正常',car:'apex',skin:'aurora',trackId:'tour'});assert.ok(h.last(healthy,'joined'));
});
test('heartbeat removes a peer that stops answering transport pings and empty disconnected rooms expire',async t=>{
 const h=await setup(t),a=await h.peer();await h.send(a,{type:'create',name:'独自',car:'apex',skin:'aurora',trackId:'tour'});const code=h.last(a,'joined').code;
 a.ws._autoPong=false;
 await h.poll(30001);
 const closed=once(a.ws,'close');a.skipBarrier=true;await h.poll(30001);await closed;
 await h.poll(60001);
 const b=await h.peer();await h.send(b,{type:'join',code,name:'过时',car:'apex',skin:'aurora'});assert.match(h.last(b,'error').message,/不存在/);
});
test('valid in-flight input in the lobby preserves the room and token and stays ignored after the next start',async t=>{
 const h=await setup(t),[a,b]=await h.pair();await h.start(a,b);const joined=h.last(a,'joined'),run=h.last(a).room.run;
 await h.send(a,{type:'lobby'});const before=h.last(a),errors=a.packets.filter(p=>p.type==='error').length,states=a.packets.filter(p=>p.type==='state').length;
 await h.send(a,{type:'input',run,seq:99,input:controls({throttle:true})});
 assert.equal(a.packets.filter(p=>p.type==='error').length,errors,'a valid late packet is not a session error');
 assert.equal(a.packets.filter(p=>p.type==='state').length,states,'late input does not publish or mutate state');assert.deepEqual(h.last(a),before);assert.deepEqual(h.last(a,'joined'),joined);
 await h.send(a,{type:'input',run,seq:100,input:controls({steer:2})});assert.match(h.last(a,'error').message,/输入/);
 await h.send(a,{type:'input',run:run+1,seq:100,input:controls()});assert.match(h.last(a,'error').message,/比赛|版本/);
 await h.start(a,b);assert.equal(h.last(a).room.run,run+1);const afterErrors=a.packets.filter(p=>p.type==='error').length;
 await h.send(a,{type:'input',run,seq:101,input:controls({throttle:true})});await h.advance(3);
 assert.equal(a.packets.filter(p=>p.type==='error').length,afterErrors);assert.equal(h.last(a).acks['0'],0);assert.equal(h.last(a).room.members[0].ready,true);
 await h.send(a,{type:'input',run,seq:102,input:controls({steer:NaN})});assert.match(h.last(a,'error').message,/输入/);
});
test('a naturally completed race ignores valid last-frame input without changing its finish or readiness',async t=>{
 const h=await setup(t),[a,b]=await h.pair();await h.start(a,b);const run=h.last(a).room.run,track=makeTrack('tour'),hazards=makeHazards(track);let seq=0;
 for(let attempt=0;attempt<900&&h.last(a).room.mode==='racing';attempt++){
  const race=h.last(a).race;
  for(const p of[a,b]){
   const id=h.last(p,'joined').slot,car=race.cars.find(c=>c.id===id),model=CARS.find(m=>m.id===car.car),road=roadAt(track,car.s);
   const target=safeLane(track,hazards,car,race.time,id===0?-3:3);
   const steer=Math.max(-1,Math.min(1,((target-car.offset)*2+road.curvature*car.speed*car.speed*.02)/((2+car.speed*.115)*model.handling)));
   await h.send(p,{type:'input',run,seq:seq+1,input:controls({throttle:true,steer,boost:true})});
  }
  seq++;await h.advance(12);
 }
 assert.equal(h.last(a).room.mode,'finished','both real human controls must cross the two-lap finish');
 const before=h.last(a),errors=a.packets.filter(p=>p.type==='error').length,states=a.packets.filter(p=>p.type==='state').length;
 await h.send(a,{type:'input',run,seq:seq+1,input:controls({throttle:true})});
 assert.equal(a.packets.filter(p=>p.type==='error').length,errors);assert.equal(a.packets.filter(p=>p.type==='state').length,states);assert.deepEqual(h.last(a),before);
 await h.send(a,{type:'lobby'});assert.equal(h.last(a).room.mode,'lobby');assert.equal(h.last(a).room.members.length,2);
});
