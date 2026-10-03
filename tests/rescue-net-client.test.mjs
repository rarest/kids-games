import test from 'node:test';
import assert from 'node:assert/strict';
import WebSocket from 'ws';
import {createRescueServer} from '../rescue/server.mjs';
const module=await import('../rescue/net-client.js').catch(()=>({}));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,label='condition',timeout=5000){const start=performance.now();while(!fn()){if(performance.now()-start>timeout)throw Error(`Timed out: ${label}`);await sleep(5);}}
function storage(){const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k),values:()=>[...map.values()]};}
async function setup(t,{delay=0,serverOptions={}}={}){
 assert.equal(typeof module.createRescueClient,'function','createRescueClient must exist');
 const app=createRescueServer({port:0,...serverOptions});await app.ready;const clients=[],links=[];
 t.after(async()=>{clients.forEach(c=>c.dispose());links.forEach(l=>l.ws.terminate());await app.close();});
 function make(store=storage()){
  const statuses=[],frames=[],link={ws:null,out:0,in:0,delay};links.push(link);
  const transport=url=>{
   const ws=new WebSocket(url,{origin:'https://games.nblord.com'});link.ws=ws;
   const timers=new Set();const later=(fn,ms)=>{if(!ms)return fn();const id=setTimeout(()=>{timers.delete(id);fn();},ms);timers.add(id);};
   return {get readyState(){return ws.readyState;},get bufferedAmount(){return ws.bufferedAmount;},
    send(raw){link.out+=Buffer.byteLength(raw);later(()=>{if(ws.readyState===1)ws.send(raw);},link.delay);},
    close(){for(const id of timers)clearTimeout(id);if(ws.readyState===0)ws.on('open',()=>ws.close());else ws.close();},
    addEventListener(type,fn){ws.addEventListener(type,event=>{if(type==='message'){link.in+=Buffer.byteLength(event.data);later(()=>fn(event),link.delay);}else fn(event);});}
   };
  };
  const c=module.createRescueClient({url:`ws://127.0.0.1:${app.address().port}/rescue-ws`,storage:store,transport,onStatus:s=>statuses.push(s),onState:(s,p)=>frames.push({s,p})});clients.push(c);return {c,store,statuses,frames,link};
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
 const before=b.c.authority.players[1].x;b.c.advance({move:1},1/60);assert.ok(b.c.render().players[1].x>before);
 b.c.leave();await until(()=>a.statuses.some(s=>s.connection==='closed'),'closed');assert.equal(b.store.values().length,0);assert.equal(b.c.render(),null);
});
test('200ms RTT predicts within 100ms and converges after ack with bounded history and queues',async t=>{
 const h=await setup(t,{delay:100}),[a,b]=await h.pair();await h.start(a,b);
 const original=b.c.authority,level=original.level,base=original.players[1].x,frameStart=b.frames.length,start=performance.now();
 const first=b.c.advance({move:1,jump:true},1/60);const response=performance.now()-start;
 assert.ok(first.state.players[1].x>base);assert.ok(first.state.players[1].y>original.players[1].y);assert.ok(response<100);
 let maxPending=0,maxHistory=0;
 for(let i=0;i<75;i++){a.c.advance({},1/60);b.c.advance({move:i<12?1:0,jump:i<12},1/60);maxPending=Math.max(maxPending,b.c.diagnostics().pending);maxHistory=Math.max(maxHistory,b.c.diagnostics().history);await sleep(1000/60);}
 await until(()=>b.c.diagnostics().pending===0,'ack');await sleep(90);
 assert.equal(b.c.authority,original);assert.equal(b.c.authority.level,level);
 const error=Math.hypot(b.c.render().players[1].x-b.c.authority.players[1].x,b.c.render().players[1].y-b.c.authority.players[1].y);
 assert.ok(error<.001,`settled error ${error}`);assert.ok(maxPending<=120);assert.ok(maxHistory<=8);
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
 assert.equal(b.c.authority,original);assert.equal(b.c.advance({move:1},1/60).commands[0].seq,1);
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
