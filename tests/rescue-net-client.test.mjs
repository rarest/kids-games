import test from 'node:test';
import assert from 'node:assert/strict';
import WebSocket from 'ws';
import {createRescueServer} from '../rescue/server.mjs';
import {createGame,setPaused,stepGame,finishBonus} from '../rescue/core.js';
import {encodeFrame} from '../rescue/net-codec.js';
import {LEVELS} from '../rescue/levels.js';
const module=await import('../rescue/net-client.js').catch(()=>({}));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,label='condition',timeout=5000){const start=performance.now();while(!fn()){if(performance.now()-start>timeout)throw Error(`Timed out: ${label}`);await sleep(5);}}
function storage(){const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k),values:()=>[...map.values()]};}
async function setup(t,{delay=0,serverOptions={}}={}){
 assert.equal(typeof module.createRescueClient,'function','createRescueClient must exist');
 const app=createRescueServer({port:0,...serverOptions});await app.ready;const clients=[],links=[];
 t.after(async()=>{clients.forEach(c=>c.dispose());links.forEach(l=>l.ws.terminate());await app.close();});
 function make(store=storage()){
  const statuses=[],frames=[],link={ws:null,out:0,in:0,delay,inputs:[]};links.push(link);
  const transport=url=>{
   const ws=new WebSocket(url,{origin:'https://games.nblord.com'});link.ws=ws;
   const timers=new Set();const later=(fn,ms)=>{if(!ms)return fn();const id=setTimeout(()=>{timers.delete(id);fn();},ms);timers.add(id);};
   return {get readyState(){return ws.readyState;},get bufferedAmount(){return ws.bufferedAmount;},
    send(raw){const packet=JSON.parse(raw);if(packet.type==='input')link.inputs.push(packet);link.out+=Buffer.byteLength(raw);later(()=>{if(ws.readyState===1)ws.send(raw);},link.delay);},
    close(){for(const id of timers)clearTimeout(id);if(ws.readyState===0)ws.on('open',()=>ws.close());else ws.close();},
    addEventListener(type,fn){ws.addEventListener(type,event=>{if(type==='message'){link.in+=Buffer.byteLength(event.data);later(()=>fn(event),link.delay);}else fn(event);});}
   };
  };
  const c=module.createRescueClient({url:`ws://127.0.0.1:${app.address().port}/rescue-ws`,storage:store,transport,onStatus:s=>statuses.push(s),onState:(s,p)=>frames.push({s,p,inputsSent:link.inputs.length})});clients.push(c);return {c,store,statuses,frames,link};
 }
 async function pair(){const a=make();a.c.create();await until(()=>a.c.room,'create');const b=make();b.c.join(a.c.room.code);await until(()=>b.c.room,'join');return [a,b];}
 async function start(a,b){a.c.setReady(true);b.c.setReady(true);await until(()=>a.c.room.members.every(m=>m?.ready),'ready');a.c.command('start');await until(()=>a.c.room.mode==='playing'&&b.c.room.mode==='playing','start');}
 return {make,pair,start};
}
test('real WS clients own separate roles, no lobby input, full room errors and explicit leave cleanup',async t=>{
 const h=await setup(t),[a,b]=await h.pair();assert.equal(a.c.slot,0);assert.equal(b.c.slot,1);
 assert.equal(a.c.advance({move:1},1/60).commands.length,0);
 const c=h.make();c.c.join(a.c.room.code);await until(()=>c.statuses.some(s=>s.connection==='error'),'full');
 assert.match(c.statuses.at(-1).message,/满/);await h.start(a,b);
 const before=b.c.render().players[1].x;b.c.advance({move:1},1/60);assert.equal(b.c.render().players[1].x,before,'input alone cannot invent a position');
 await until(()=>b.c.render().players[1].x>before,'confirmed movement');
 b.c.leave();await until(()=>a.statuses.some(s=>s.connection==='closed'),'closed');assert.equal(b.store.values().length,0);assert.equal(b.c.render(),null);
});
test('a reconnect clears the old socket RTT until the new socket receives its own pong',async t=>{
 const h=await setup(t,{delay:60}),[a]=await h.pair();
 await until(()=>a.statuses.some(s=>s.rtt>=100),'measured initial socket RTT');
 a.link.ws.terminate();await until(()=>a.statuses.at(-1).connection==='reconnecting','socket lost');
 assert.equal(a.statuses.at(-1).rtt,null,'disconnected transport must not advertise its old latency');
 await until(()=>a.statuses.at(-1).connection==='connected','reclaimed socket');
 const replacement=a.statuses.slice(a.statuses.findLastIndex(s=>s.connection==='reconnecting')).find(s=>s.connection==='connected');
 assert.equal(replacement.rtt,null,'the replacement socket cannot inherit the old socket RTT');
 await until(()=>a.statuses.at(-1).rtt>=100,'new socket pong');
});
test('200ms RTT waits for confirmed motion and converges after ack with bounded history and queues',async t=>{
 const h=await setup(t,{delay:100}),[a,b]=await h.pair();await h.start(a,b);
 const original=b.c.authority,level=original.level,base=original.players[1].x,frameStart=b.frames.length,start=performance.now();
 const first=b.c.advance({move:1,jump:true},1/60);
 assert.equal(first.state.players[1].x,base);assert.equal(first.state.players[1].y,original.players[1].y);
 let response=null;
 let maxPending=0,maxHistory=0;
 for(let i=0;i<75;i++){a.c.advance({},1/60);b.c.advance({move:i<12?1:0,jump:i<12},1/60);if(response===null&&b.c.render().players[1].x>base+.01)response=performance.now()-start;maxPending=Math.max(maxPending,b.c.diagnostics().pending);maxHistory=Math.max(maxHistory,b.c.diagnostics().history);await sleep(1000/60);}
 assert.ok(response>=200&&response<600,`confirmed response ${response}ms`);
 await until(()=>b.c.diagnostics().pending===0,'ack');await sleep(150);
 assert.equal(b.c.authority,original);assert.equal(b.c.authority.level,level);
 const error=Math.hypot(b.c.render().players[1].x-b.c.authority.players[1].x,b.c.render().players[1].y-b.c.authority.players[1].y);
 assert.ok(error<.001,`settled error ${error}`);assert.ok(maxPending<=120);assert.ok(maxHistory<=32);assert.equal(b.c.diagnostics().mode,'confirmed');
 assert.equal(b.c.authority.events.filter(e=>e.type==='jump'&&e.player==='p2').length,1);
 const sampleSeconds=(performance.now()-start)/1000,dynamic=b.frames.slice(frameStart).filter(f=>!f.p.stage),dynamicBytes=dynamic.reduce((total,f)=>total+Buffer.byteLength(JSON.stringify(f.p)),0),dynamicBytesPerSecond=dynamicBytes/sampleSeconds;
 assert.ok(dynamicBytesPerSecond<=80*1024);
 await until(()=>b.statuses.some(s=>s.rtt>=190),'rtt');
 console.log(JSON.stringify({measurement:'real-ws-200ms-rtt',responseMs:response,maxPending,maxHistory,settledError:error,receivedBytes:b.link.in,sentBytes:b.link.out,rttMs:b.statuses.at(-1).rtt,sampleSeconds,dynamicFrames:dynamic.length,dynamicBytesPerSecond}));
});
test('socket failure automatically reclaims original seat, remains paused and never leaks token',async t=>{
 const h=await setup(t),[a,b]=await h.pair();await h.start(a,b);const original=b.c.authority;
 b.link.ws.terminate();await until(()=>b.statuses.some(s=>s.connection==='reconnecting'),'reconnecting');
 assert.equal(b.c.advance({move:1},1/60).commands.length,0);
 await until(()=>b.statuses.at(-1).connection==='connected'&&b.c.room.mode==='paused','reclaim');
 assert.equal(b.c.slot,1);assert.equal(b.c.authority,original);assert.equal(b.c.room.members[1].ready,false);
 const secret=JSON.parse(b.store.values()[0]).token;assert.ok(secret.length>20);
 assert.ok(!JSON.stringify([b.statuses,b.c.diagnostics(),b.c.room]).includes(secret));
 b.c.dispose();await until(()=>!a.c.room.members[1].connected,'dispose disconnect');
 const restored=h.make(b.store);await until(()=>restored.c.room,'stored reconnect');assert.equal(restored.c.slot,1);assert.equal(restored.c.room.mode,'paused');
 restored.c.leave();await until(()=>a.statuses.at(-1).connection==='closed','leave after reconnect');
});
test('suspend immediately clears prediction, prevents ready until explicit recovery, and pause keeps run identity',async t=>{
 const h=await setup(t),[a,b]=await h.pair();await h.start(a,b);const original=b.c.authority;
 b.c.advance({move:1},1/60);b.c.suspend();assert.equal(b.c.diagnostics().pending,0);
 assert.equal(b.c.advance({move:1},1/60).commands.length,0);await until(()=>a.c.room.mode==='paused','pause');
 a.c.command('resume');await until(()=>a.statuses.at(-1).connection==='error','resume blocked');
 b.c.setReady(true);await until(()=>a.c.room.members[1].ready,'recovered');a.c.command('resume');await until(()=>b.c.room.mode==='playing','resume');
 assert.equal(b.c.authority,original);assert.equal(b.c.advance({move:1},1/60).commands[0].seq,2);
});

test('redundant ready preserves current epoch command order; terminal core stops inputs and run identity persists',async t=>{
 const level={id:'0',name:'test',theme:'street',width:100,height:20,spawn:{x:5,y:1},platforms:[{id:'floor',x:0,y:1,w:100,h:1}],objects:[],enemies:[],hazards:[],pickups:[],decor:[],checkpoints:[],boss:null,exit:{x:6,y:1}};
 const h=await setup(t,{serverOptions:{levelFor:()=>level}}),[a,b]=await h.pair();await h.start(a,b);
 const authority=b.c.authority,view=b.c.render();
 const first=b.c.advance({},1/60);a.c.advance({},1/60);
 b.c.setReady(true);const second=b.c.advance({},1/60);assert.ok(second.commands[0]?.seq>first.commands[0].seq);
 await until(()=>b.c.authority.status==='bonus','bonus');assert.equal(b.c.authority,authority);assert.equal(b.c.render(),view);
 a.c.command('finishBonus');await until(()=>b.c.authority.status==='cleared','cleared');
 assert.equal(b.c.room.mode,'playing');assert.equal(b.c.authority,authority);assert.equal(b.c.render(),view);
 const bytes=b.link.out;for(let i=0;i<100;i++)assert.equal(b.c.advance({move:1},1/60).commands.length,0);
 assert.equal(b.link.out,bytes);assert.equal(b.c.diagnostics().pending,0);
});

test('new playing epochs send one normal neutral command before onState without waiting for RAF',async t=>{
 const h=await setup(t),[a,b]=await h.pair();assert.equal(a.link.inputs.length,0);assert.equal(b.link.inputs.length,0);
 await h.start(a,b);
 const neutral={move:0,up:false,down:false,jump:false,action:false};
 for(const peer of [a,b]){
  assert.equal(peer.link.inputs.length,1,'playing delivery primes exactly once before application advance');
  assert.deepEqual(peer.link.inputs[0].commands,[{seq:1,input:neutral}]);
  assert.equal(peer.frames.find(f=>f.p.room.mode==='playing').inputsSent,1,'prime precedes onState/UI callback');
 }
 const authority=b.c.authority,view=b.c.render(),run=b.c.room.run;
 await until(()=>b.c.diagnostics().ack===1,'prime acknowledged');
 const next=b.c.advance({move:1,jump:true},1/60);assert.equal(next.commands[0].seq,2);
 await until(()=>b.c.diagnostics().ack===2,'next command acknowledged');await sleep(80);
 assert.equal(b.link.inputs.length,2,'same epoch broadcasts do not prime again');assert.equal(b.c.authority,authority);assert.equal(b.c.render(),view);
 assert.equal(b.c.authority.events.filter(e=>e.type==='jump'&&e.player==='p2').length,1);
 a.c.command('pause');await until(()=>b.c.room.mode==='paused');const pausedInputs=b.link.inputs.length;await sleep(60);assert.equal(b.link.inputs.length,pausedInputs);
 a.c.command('resume');await until(()=>b.c.room.mode==='playing');assert.equal(b.link.inputs.length,pausedInputs+1);assert.equal(b.link.inputs.at(-1).commands[0].seq,1);assert.deepEqual(b.link.inputs.at(-1).commands[0].input,neutral);
 assert.equal(b.c.room.run,run);assert.equal(b.c.authority,authority);assert.equal(b.c.render(),view);
 a.c.command('retry');await until(()=>b.c.room.run===run+1);assert.equal(b.link.inputs.length,pausedInputs+2);assert.equal(b.link.inputs.at(-1).commands[0].seq,1);assert.notEqual(b.c.authority,authority);
});

test('epoch priming respects readiness, suspension, active bonus, terminal state and send failure',()=>{
 let handlers={},failInput=false,now=0;const sent=[],statuses=[];
 const ws={readyState:1,bufferedAmount:0,addEventListener:(type,fn)=>handlers[type]=fn,close(){this.readyState=3;},send(raw){const packet=JSON.parse(raw);if(packet.type==='input'&&failInput)throw Error('closed');sent.push(packet);}};
 const c=module.createRescueClient({url:'ws://example.invalid/rescue-ws',storage:storage(),transport:()=>ws,clock:{now:()=>now,setInterval:()=>1,clearInterval(){}},onStatus:s=>statuses.push(s)});
 try{
  c.create();handlers.open();handlers.message({data:JSON.stringify({type:'joined',slot:0,code:'ABC123',token:'unit-test-token-ephemeral'})});
  const game=createGame(LEVELS[0],{players:2}),inputs=[0,1].map(()=>({move:0,up:false,down:false,jump:false,action:false}));
  const inputCount=()=>sent.filter(p=>p.type==='input').length;
  function state(epoch,{mode='playing',ready=true,authority=game}={}){
   setPaused(authority,mode!=='playing');now+=50;
   const room={code:'ABC123',host:0,mode,run:1,members:[0,1].map(slot=>({slot,ready,connected:true}))};
   handlers.message({data:JSON.stringify(encodeFrame(authority,{epoch,tick:epoch,acks:[0,0],inputs,room,includeStage:true}))});
  }
  state(1,{mode:'lobby',ready:false});state(2,{ready:false});assert.equal(inputCount(),0,'lobby and unready do not prime');
  state(3);state(3);assert.equal(inputCount(),1,'one prime for playing epoch');const authority=c.authority,view=c.render();
  c.suspend();state(4);assert.equal(inputCount(),1,'in-flight playing state while locally suspended does not prime');
  c.setReady(true);state(5,{mode:'paused'});assert.equal(inputCount(),1,'ready recovery stays paused');
  const bonus=createGame({...LEVELS[0],exit:{x:2,y:1},boss:null},{players:2});stepGame(bonus,inputs,1/60);assert.equal(bonus.status,'bonus');
  state(6,{authority:bonus});assert.equal(inputCount(),2,'genuine active bonus epoch primes');assert.equal(c.authority,authority);assert.equal(c.render(),view);
  finishBonus(bonus);assert.equal(bonus.status,'cleared');state(7,{authority:bonus});assert.equal(inputCount(),2,'terminal playing room does not prime');
  failInput=true;state(8);assert.equal(statuses.at(-1).connection,'reconnecting','failed priming uses normal lost path');assert.equal(c.diagnostics().pending,0);
 }finally{c.dispose();}
});
