import test from 'node:test';
import assert from 'node:assert/strict';
import {createConfirmedPresentation} from '../rescue/net-confirmed.js';
import {createPrediction} from '../rescue/net-prediction.js';
import {createGame,stepGame} from '../rescue/core.js';

const level={id:'confirmed',name:'test',theme:'street',width:100,height:20,spawn:{x:30,y:1},platforms:[{id:'floor',x:0,y:1,w:100,h:1}],objects:[],enemies:[],hazards:[],pickups:[],decor:[],checkpoints:[],boss:null,exit:{x:99,y:1}};
function harness(){let now=0;const state=createGame(level,{players:2}),clock={now:()=>now},client=createConfirmedPresentation({slot:0,clock});return {state,clock,client,setNow:value=>now=value,receive:(ack=0,epoch=1)=>client.receive(state,{epoch,ack})};}

test('unacknowledged movement cannot run ahead and stopping cannot pull the player back',()=>{
 const h=harness(),legacy=createPrediction({slot:0,clock:h.clock});h.receive();legacy.receive(h.state,{epoch:1,ack:0,at:0});
 const confirmed=h.state.players[0].x;
 for(let i=0;i<12;i++){h.client.advance({move:1},1/60);legacy.advance({move:1},1/60);}
 assert.ok(legacy.render().players[0].x>confirmed+.5,'reproduces the old speculative position during an acknowledgement gap');
 assert.equal(h.client.render().players[0].x,confirmed);
 for(let i=0;i<12;i++)stepGame(h.state,[{move:1},{}],1/60);
 h.setNow(200);h.receive(12);
 let previous=h.client.render().players[0].x;
 for(let i=0;i<12;i++){
  h.setNow(200+i*16);h.client.advance({},1/60);const x=h.client.render().players[0].x;
  assert.ok(x>=previous-1e-9&&x<=h.state.players[0].x+1e-9);previous=x;
 }
 h.setNow(500);assert.equal(h.client.render().players[0].x,h.state.players[0].x);
});

test('packet jitter never rewinds the timeline or extrapolates beyond confirmed snapshots',()=>{
 const h=harness();h.receive();let cursor=0,x=h.state.players[0].x;
 for(const [arrival,time,position] of [[60,.05,31],[120,.1,32],[280,.15,33],[281,.2,34],[400,.25,35]]){
  h.setNow(arrival-1);const frozen=h.client.render();assert.ok(frozen.time>=cursor);assert.ok(frozen.players[0].x>=x);cursor=frozen.time;x=frozen.players[0].x;
  h.state.time=time;h.state.players[0].x=position;h.setNow(arrival);h.receive();
  const view=h.client.render();assert.ok(view.time>=cursor);assert.ok(view.time<=time);assert.ok(view.players[0].x>=x&&view.players[0].x<=position);cursor=view.time;x=view.players[0].x;
 }
 h.setNow(2000);const final=h.client.render();assert.equal(final.time,.25);assert.equal(final.players[0].x,35);assert.equal(h.client.diagnostics().stalled,true);
});

test('world geometry, events and rewards share a timeline; authority snapshots remain immutable',()=>{
 const h=harness();h.state.players[0].grounded=true;h.state.players[0].groundId='moving';
 h.state.platforms.push({id:'moving',kind:'moving',x:30,y:1});h.state.objects.push({id:'box',x:30,y:2,heldBy:'p1',active:true});
 h.state.boss={id:'boss',x:32,y:4,active:true,phase:'move',weakpoint:{x:32,y:5},anchors:{mouth:{x:33,y:5}},contactRegions:[{x:32,y:4}],segments:[{x:32,y:4}]};h.receive();
 h.state.time=.1;h.state.players[0].x=32;h.state.platforms.at(-1).x=32;h.state.objects[0].x=32;h.state.boss.x=34;
 h.state.boss.weakpoint.x=34;h.state.boss.anchors.mouth.x=35;h.state.boss.contactRegions[0].x=34;h.state.boss.segments[0].x=34;
 h.state.score=100;h.state.events.push({id:'event-1',type:'collect',time:.1});h.setNow(100);h.receive();const original=structuredClone(h.state);
 h.setNow(150);const mid=h.client.render();assert.equal(mid.time,.05);assert.equal(mid.players[0].x,31);assert.equal(mid.platforms.at(-1).x,31);assert.equal(mid.objects[0].x,31);
 assert.equal(mid.boss.x,33);assert.equal(mid.boss.weakpoint.x,33);assert.equal(mid.boss.anchors.mouth.x,34);assert.equal(mid.boss.contactRegions[0].x,33);assert.equal(mid.boss.segments[0].x,33);
 assert.equal(mid.score,0);assert.equal(mid.events.length,0);assert.deepEqual(h.state,original);
 h.setNow(200);const end=h.client.render();assert.equal(end.score,100);assert.equal(end.events[0].id,'event-1');
});

test('respawns and ownership changes apply at the confirmed boundary; pause and new epochs flush old motion',()=>{
 const h=harness();h.receive();const view=h.client.render(),before=view.players[0].x;
 h.state.time=.1;h.state.players[0].x=5;h.state.players[0].lives--;h.setNow(100);h.receive();
 h.setNow(150);assert.equal(h.client.render().players[0].x,before);
 h.setNow(200);assert.equal(h.client.render().players[0].x,5);
 h.state.time=.2;h.state.players[0].heldBy='p2';h.state.players[1].x=10;h.setNow(200);h.receive();
 h.setNow(250);assert.equal(h.client.render().players[0].heldBy,null);
 h.setNow(300);assert.equal(h.client.render().players[0].x,10);
 h.state.paused=true;h.state.players[1].x=12;h.receive(0,2);assert.equal(h.client.render(),view);assert.equal(h.client.render().players[0].x,12);
 assert.equal(h.client.advance({move:1},1/60).commands.length,0);
 h.state.paused=false;h.receive(0,3);assert.equal(h.client.advance({},1/60).commands[0].seq,1);
});

test('fixed-step input retains short action edges, bounds debt and rejects stale acknowledgements',()=>{
 const h=harness();h.receive();assert.equal(h.client.advance({jump:true,action:true},1/120).commands.length,0);
 const first=h.client.advance({},1/120).commands[0];assert.equal(first.input.jump,true);assert.equal(first.input.action,true);
 assert.equal(h.client.advance({move:1},10).commands.length,5);
 h.receive(4);assert.equal(h.client.diagnostics().pending,2);assert.equal(h.receive(3),false);assert.equal(h.receive(4,0),false);
 for(let i=0;i<100;i++)h.client.advance({},1);
 assert.equal(h.client.diagnostics().pending,120);h.client.clear();assert.equal(h.client.diagnostics().pending,0);
});
