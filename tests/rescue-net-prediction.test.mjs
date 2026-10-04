import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,stepGame,projectGeometry} from '../rescue/core.js';
import {LEVELS} from '../rescue/levels.js';
const awaitCore=await import('../rescue/core.js');
const module=await import('../rescue/net-prediction.js').catch(()=>({}));
const neutral=()=>({move:0,up:false,down:false,jump:false,action:false});
const fixture=()=>({...LEVELS[0],width:100,spawn:{x:5,y:1},platforms:[{id:'floor',x:0,y:1,w:100,h:1}],objects:[],enemies:[],hazards:[],pickups:[],boss:null,exit:{x:98,y:1}});
function setup(slot=0,level=fixture()){
 assert.equal(typeof module.createPrediction,'function','createPrediction must exist');
 let now=0;const p=module.createPrediction({slot,clock:{now:()=>now}}),s=createGame(level,{players:2});
 const receive=(ack=0,epoch=1,inputs=[neutral(),neutral()])=>p.receive(s,{epoch,ack,inputs});receive();
 return {p,s,receive,time:v=>{now=v;}};
}
function carrying(extra={}){
 const h=setup(0,{...fixture(),objects:[{id:'box',kind:'crate',x:5.4,y:1}],...extra});
 stepGame(h.s,[{...neutral(),action:true},neutral()],1/60);
 stepGame(h.s,[neutral(),neutral()],1/60);h.receive();
 assert.equal(h.s.players[0].carrying?.id,'box');return h;
}
test('walk and jump animation clocks advance with predicted motion between server snapshots',()=>{
 const {p,s,time:clockTime}=setup();clockTime(1000/60);const first=p.advance({move:1,jump:true},1/60).state;
 const time=first.players[0].renderTime,x=first.players[0].x,y=first.players[0].y;
 assert.ok(time>s.time,'the moving body must not use the stale server animation clock');
 clockTime(2000/60);const second=p.advance({move:1},1/60).state;
 assert.ok(second.players[0].renderTime>time);assert.ok(second.players[0].x>x);assert.ok(second.players[0].y>y);
 assert.equal(s.time,0);assert.equal(second.events,s.events);
});
test('acknowledging a local throw does not rewind the already flying crate',()=>{
 const {p,s,receive,time}=carrying(),commands=[];
 commands.push(...p.advance({action:true},1/60).commands);
 for(let i=0;i<10;i++)commands.push(...p.advance({},1/60).commands);
 const before={...p.render().objects[0]};assert.ok(before.x>7.5);
 stepGame(s,[commands[0].input,neutral()],1/60);time(100);receive(commands[0].seq);
 const confirmed=p.render().objects[0];
 assert.ok(Math.abs(confirmed.x-before.x)<.01,`throw rewound from ${before.x} to ${confirmed.x}`);
 assert.equal(confirmed.heldBy,null);
 time(117);const continued=p.advance({},1/60).state.objects[0];assert.ok(continued.x>confirmed.x);
 for(const command of commands.slice(1))stepGame(s,[command.input,neutral()],1/60);
 assert.equal(s.events.filter(e=>e.type==='throw').length,1);
});
test('a predicted impact keeps shared lifecycles authoritative until confirmed',()=>{
 const {p,s}=carrying({enemies:[{id:'target',kind:'mouse',x:9,y:1,min:8,max:10,speed:0}]}),original=structuredClone(s);
 p.advance({action:true},1/60);for(let i=0;i<25;i++)p.advance({},1/60);
 const view=p.render();
 assert.equal(view.objects[0].active,true,'only the server can consume the shared crate');
 assert.equal(view.enemies[0].alive,true,'only the server can kill the shared monster');
 assert.equal(view.score,s.score);assert.equal(view.events,s.events);assert.deepEqual(s,original);
});
test('predicted feet stay on the same moving platform that the scene displays',()=>{
 const level={...fixture(),spawn:{x:5,y:3},platforms:[{id:'lift',kind:'moving',x:2,y:3,w:6,h:.65,axis:'x',range:2,speed:1}]};
 const {p,s,receive}=setup(0,level);stepGame(s,[neutral(),neutral()],1/60);receive();
 assert.equal(s.players[0].groundId,'lift');const relative=s.players[0].x-s.platforms[0].x;
 const view=p.advance({},5/60).state;
 assert.ok(Math.abs(view.players[0].x-view.platforms[0].x-relative)<.005,'player and platform are on different simulation times');
});
test('actual core predicts movement and jump before authority; rewards and events remain authoritative',()=>{
 const {p,s}=setup(1,LEVELS[0]),x=s.players[1].x,y=s.players[1].y,raw=structuredClone(s);
 const result=p.advance({move:1,jump:true},1/60);
 assert.ok(result.state.players[1].x>x);assert.ok(result.state.players[1].y>y);
 assert.deepEqual(s,raw);assert.equal(result.state.level,s.level);assert.equal(result.state.events,s.events);
 assert.equal(result.state.score,s.score);assert.equal(result.commands.length,1);
 assert.equal(result.commands[0].input.jump,true);
});
test('ack consumes only acknowledged commands and replay converges with the real core',()=>{
 const {p,s,receive,time}=setup();const cmds=[];
 for(let i=0;i<12;i++)cmds.push(...p.advance({move:1,jump:i===0},1/60).commands);
 for(const c of cmds.slice(0,5))stepGame(s,[c.input,neutral()],1/60);
 receive(5);assert.equal(p.diagnostics().pending,7);
 for(const c of cmds.slice(5))stepGame(s,[c.input,neutral()],1/60);
 receive(12);time(1000);assert.equal(p.diagnostics().pending,0);
 assert.equal(p.render().players[0].x,s.players[0].x);assert.equal(p.render().players[0].y,s.players[0].y);
 assert.equal(s.events.filter(e=>e.type==='jump').length,1);
});
test('physical action and jump edges occur once across batches, gaps and replay',()=>{
 const {p,s,receive}=setup();
 const first=p.advance({action:true,jump:true},1/30);assert.equal(first.commands.filter(c=>c.input.action).length,1);
 assert.equal(first.commands.filter(c=>c.input.jump).length,1);assert.equal(first.state.players[1].heldBy,null,'an unconfirmed pickup cannot move the remote body');
 for(const c of first.commands)stepGame(s,[c.input,neutral()],1/60);
 stepGame(s,[neutral(),neutral()],1/60);receive(2);
 const next=p.advance({action:true,jump:true},1/30);assert.ok(next.commands.every(c=>!c.input.action&&!c.input.jump));
 assert.equal(next.state.players[0].carrying?.type,'player');
 p.advance({},1/60);const thrown=p.advance({action:true},1/60);
 assert.equal(thrown.state.players[0].carrying?.id,'p2');assert.equal(thrown.state.players[1].heldBy,'p1','remote ownership changes only after authority');
 assert.equal(s.events.filter(e=>e.type==='pickup').length,1);assert.equal(s.events.filter(e=>e.type==='throw').length,0);
});
test('sub-fixed-frame press is retained once and input/prediction memory stays bounded',()=>{
 const {p}=setup();assert.equal(p.advance({jump:true},1/240).commands.length,0);
 const result=p.advance({jump:false},1/60);assert.equal(result.commands[0].input.jump,true);
 for(let i=0;i<400;i++)p.advance({move:1},1/60);
 assert.equal(p.diagnostics().pending,120);assert.equal(p.advance({},1/60).commands.length,0);
});
test('same mutable authority keeps independent bounded history; epoch and teleport snap',()=>{
 const {p,s,receive,time}=setup();const level=s.level;
 for(let i=1;i<=12;i++){time(i*50);s.players[1].x=5.9+i*.2;receive();}
 assert.equal(p.diagnostics().history,8);assert.equal(p.render(600).players[1].x,8.3,'remote body shares the current collision clock instead of a delayed history sample');
 s.players[1].x=40;s.players[1].lives=2;time(650);receive();assert.equal(p.render(650).players[1].x,40);
 p.advance({move:1},1/60);s.players[0].x=70;s.players[0].lives=2;time(700);receive();assert.ok(p.render().players[0].x>=70);
 receive(0,2);assert.equal(p.diagnostics().pending,0);assert.equal(p.diagnostics().history,1);assert.equal(p.render().level,level);
 const next=p.advance({move:1},1/60);assert.equal(next.commands[0].seq,1);
 assert.equal(p.receive(s,{epoch:1,ack:999,inputs:[]}),false);assert.equal(p.diagnostics().pending,1);
});
test('clear, pause and terminal core suppress speculation and commands',()=>{
 const {p,s,receive}=setup();p.advance({move:1},1/60);p.clear();assert.equal(p.diagnostics().pending,0);
 assert.equal(p.advance({move:1},1/60).commands.length,0);
 s.paused=true;receive();assert.equal(p.advance({move:1},1/60).commands.length,0);
 s.paused=false;s.status='cleared';receive();assert.equal(p.advance({move:1},1/60).commands.length,0);
});
test('visual state identity survives epoch, suspend clear, and bonus transition without replaying scene events',()=>{
 const {p,s,receive}=setup(),view=p.render();p.advance({move:1},1/60);receive(0,2);
 assert.equal(p.render(),view);p.clear();assert.equal(p.render(),view);assert.equal(p.render().events,s.events);
 receive(0,3);assert.equal(p.render(),view);
 s.level={...s.level,id:'bonus-0'};s.status='bonus';receive(0,4);assert.equal(p.render(),view);assert.equal(p.render().level,s.level);
 const fresh=createGame(fixture(),{players:2});p.receive(fresh,{epoch:5,ack:0,inputs:[]});assert.notEqual(p.render(),view);
});
test('when held by a remote player, local visual remains attached to the carrier on the shared collision clock',()=>{
 const {p,s,receive,time}=setup(1);s.players[0].carrying={type:'player',id:'p2'};s.players[1].heldBy='p1';
 for(let i=1;i<=5;i++){time(i*50);s.players[0].x=5+i*.3;s.players[1].x=s.players[0].x;s.players[1].y=s.players[0].y+s.players[0].h+.15;receive(0,1,[{...neutral(),move:1},neutral()]);}
 p.advance({},1/60);const view=p.render();assert.equal(view.players[1].x,view.players[0].x);
 assert.equal(view.players[1].y,view.players[0].y+view.players[0].h+.15);
});
test('small local authority corrections smooth briefly and settle without modifying authority',()=>{
 const {p,s,receive,time}=setup();p.advance({move:1},1/60);const shown=p.render().players[0].x;
 s.players[0].x+=.4;time(50);receive(1);assert.equal(p.render().players[0].x,shown);
 time(100);assert.ok(p.render().players[0].x>shown);assert.ok(p.render().players[0].x<s.players[0].x);
 time(150);assert.equal(p.render().players[0].x,s.players[0].x);
});
test('shared geometry uses snapshot time rather than either local input queue',()=>{
 const level={...fixture(),platforms:[...fixture().platforms,{id:'lift',kind:'moving',x:2,y:3,w:6,h:.65,axis:'x',range:2,speed:1}],enemies:[{id:'mouse',kind:'mouse',x:12,y:1,min:9,max:20,speed:2}]};
 const a=setup(0,level),b=setup(1,level);
 for(let i=0;i<12;i++)a.p.advance({},1/60);
 for(let i=0;i<4;i++)b.p.advance({},1/60);
 a.time(200);b.time(200);
 const av=a.p.render(),bv=b.p.render();
 assert.ok(Math.abs(av.enemies[0].x-bv.enemies[0].x)<1e-8,'same server state and wall time must show the same enemy');
 assert.ok(Math.abs(av.platforms[1].x-bv.platforms[1].x)<1e-8);
 assert.equal(av.time,bv.time);assert.ok(av.time>a.s.time);
});
test('remote fall cannot predict a respawn or release a confirmed held chain',()=>{
 const {p,s,receive,time}=setup();s.players[1].y=-3.9;s.players[1].hearts=1;receive();
 for(let i=0;i<5;i++)p.advance({},1/60);time(100);const v=p.render();
 assert.ok(v.players[1].y< -3.9,'remote position must not jump to the checkpoint before confirmation');
 assert.equal(v.players[1].lives,3);assert.equal(v.players[1].hearts,1);
});
test('confirmed competing ownership cancels a speculative crate pickup',()=>{
 const {p,s,receive,time}=setup(0,{...fixture(),objects:[{id:'box',kind:'crate',x:5.4,y:1}]});
 p.advance({action:true},1/60);assert.equal(p.render().players[0].carrying?.id,'box');
 s.players[1].carrying={type:'object',id:'box'};s.objects[0].heldBy='p2';time(50);receive();
 const v=p.render();assert.equal(v.players[0].carrying,null);assert.equal(v.objects[0].heldBy,'p2');assert.equal(v.objects[0].x,v.players[1].x);
});
test('geometry projection preserves lifecycle, attacks, held ownership and campaign decisions',()=>{
 const s=createGame({...fixture(),enemies:[{id:'shot',kind:'toy',x:7,y:1,timer:2.79},{id:'bird',kind:'pelican',x:9,y:4,timer:2.39}],objects:[{id:'box',kind:'crate',x:7,y:1}],boss:{id:'boss',kind:'owl',x:10,y:4}},{players:2});
 s.objects[0].thrown=true;s.objects[0].vx=11;
 s.players[1].y=-3.9;s.players[1].hearts=1;
 s.players[0].x=s.level.exit.x;s.boss.active=true;s.boss.phase='perch';s.boss.timer=.5;s.boss.attackTimer=1.79;
 const before=structuredClone(s);projectGeometry(s,.2);
 assert.equal(s.enemies[0].alive,true);assert.equal(s.objects[0].active,true);
 assert.equal(s.players[1].hearts,1);assert.equal(s.players[1].lives,3);assert.ok(s.players[1].y< -4);
 for(const key of ['score','stars','status','events','projectiles','pickups','campaign','completed','nextEntityId','nextEventId'])assert.deepEqual(s[key],before[key],key);
 assert.equal(s.boss.phase,'perch');assert.equal(s.boss.hp,before.boss.hp);assert.ok(s.boss.x!==before.boss.x,'moving Boss geometry follows the shared clock without firing attacks');
});
test('acknowledged throws switch to advancing common geometry after bounded visual correction',()=>{
 const {p,s,receive,time}=carrying({objects:[{id:'box',kind:'metal',x:5.4,y:1}]});
 const result=p.advance({action:true},1/60);stepGame(s,[result.commands[0].input,neutral()],1/60);time(20);receive(result.commands[0].seq);
 time(120);const first=p.render().objects[0].x;time(220);const second=p.render().objects[0].x;
 assert.ok(second>first+.5,'confirmed box must keep moving between snapshots');
 const b=module.createPrediction({slot:1,clock:{now:()=>20}});b.receive(s,{epoch:1,ack:0,inputs:[neutral(),neutral()]});
 assert.ok(Math.abs(p.render(1020).objects[0].x-b.render(1020).objects[0].x)<.001,'expired own overlay must use the same public geometry');
});
test('rejected predicted damage cannot introduce a correction offset under the floor',()=>{
 const {p,s,receive}=setup(0,{...fixture(),enemies:[{id:'target',kind:'mouse',x:5.8,y:1,speed:0,min:5.8,max:5.8}]});
 for(let i=0;i<5;i++)p.advance({move:1},1/60);
 receive();const v=p.render();assert.ok(v.players[0].x>=s.players[0].x,'local movement still responds');assert.equal(v.players[0].y,s.players[0].y,'speculative damage cannot pull feet below the floor');assert.equal(v.players[0].hearts,3);
});
test('Boss geometry agrees across snapshots on either side of a phase boundary',()=>{
 const level={...fixture(),boss:{id:'ufo',kind:'ufo',x:10,y:5,arena:{x:0,y:1,w:20}}};
 const a=createGame(level,{players:2}),b=structuredClone(a);Object.assign(a.boss,{active:true,timer:3.49,phase:'alienDrop'});Object.assign(b.boss,{active:true,timer:3.55,phase:'ram'});
 projectGeometry(a,.16);projectGeometry(b,.10);
 assert.ok(Math.hypot(a.boss.x-b.boss.x,a.boss.y-b.boss.y)<.001,'geometry uses common target time without changing confirmed phases');
 assert.equal(a.boss.phase,'alienDrop');assert.equal(b.boss.phase,'ram');
});
test('a rejected pickup of a previously owned moving box cannot retain its prediction overlay',()=>{
 const {p,s,receive,time}=setup(0,{...fixture(),objects:[{id:'box',kind:'metal',x:6.4,y:1.2,vx:5,owner:'p1'}]});
 const result=p.advance({action:true},1/60);assert.equal(p.render().players[0].carrying?.id,'box');
 for(let i=0;i<3;i++)stepGame(s,[neutral(),neutral()],1/60);
 stepGame(s,[result.commands[0].input,neutral()],1/60);assert.notEqual(s.players[0].carrying?.id,'box','server box pickup is outside range');
 time(20);receive(result.commands[0].seq);const other=module.createPrediction({slot:1,clock:{now:()=>20}});other.receive(s,{epoch:1,ack:0,inputs:[neutral(),neutral()]});
 time(170);assert.ok(Math.abs(p.render().objects[0].x-other.render(170).objects[0].x)<.001,'old owner is not proof of the rejected pickup');
});
test('local replay advances only its player and acted box, without stepping remote AI or damage',()=>{
 const s=createGame({...fixture(),objects:[{id:'box',kind:'crate',x:5.4,y:1},{id:'other',kind:'metal',x:20,y:4}],enemies:[{id:'enemy',kind:'mouse',x:6,y:1,speed:0}],boss:{id:'boss',kind:'owl',x:10,y:4}},{players:2});
 const {stepLocal}=awaitCore;assert.equal(typeof stepLocal,'function','local-only prediction must exist');
 const enemies=structuredClone(s.enemies),remote=structuredClone(s.players[1]),other=structuredClone(s.objects[1]);
 stepLocal(s,0,{action:true},1/60);assert.equal(s.players[0].carrying?.id,'box');
 stepLocal(s,0,{},1/60);stepLocal(s,0,{action:true},1/60);
 const x=s.objects[0].x;for(let i=0;i<20;i++)stepLocal(s,0,{move:1},1/60);
 assert.ok(s.objects[0].x>x);assert.ok(s.players[0].x>5);assert.equal(s.players[0].hearts,3);
 assert.deepEqual(s.enemies,enemies);assert.deepEqual(s.players[1],remote);assert.deepEqual(s.objects[1],other);assert.equal(s.boss.active,false);assert.equal(s.score,0);
});

test('delayed teammate reversals correct smoothly instead of teleporting at each snapshot',()=>{
 const {p,s,time}=setup();
 s.players[1].vx=7.2;
 time(200);p.receive(s,{epoch:1,ack:0,at:0});
 time(250);const before={...p.render().players[1]};
 for(let i=0;i<3;i++)stepGame(s,[neutral(),{...neutral(),move:-1}],1/60);
 p.receive(s,{epoch:1,ack:0,at:50});
 const after={...p.render().players[1]};
 assert.ok(Math.abs(after.x-before.x)<.01,`snapshot teleported teammate from ${before.x} to ${after.x}`);
 time(266);const next={...p.render().players[1]};
 assert.ok(next.x<after.x,'the correction must start moving toward the new path');
 assert.ok(after.x-next.x<.8,'correction must not be deferred as another one-frame teleport');
 time(500);const expected=structuredClone(s);projectGeometry(expected,.25);
 assert.ok(Math.abs(p.render().players[1].x-expected.players[1].x)<.001,'correction must settle on the current physical path');
});

test('teammate respawns and new epochs clear an in-flight visual correction',()=>{
 const {p,s,time}=setup();s.players[1].vx=7.2;
 time(200);p.receive(s,{epoch:1,ack:0,at:0});time(250);p.render();
 s.players[1].vx=-7.2;s.players[1].x-=.36;p.receive(s,{epoch:1,ack:0,at:50});
 s.players[1].lives--;s.players[1].x=30;s.players[1].vx=0;
 time(260);p.receive(s,{epoch:1,ack:0,at:260});
 assert.equal(p.render().players[1].x,30,'a respawn must not slide across the whole level');
 s.players[1].x=5.9;time(270);p.receive(s,{epoch:2,ack:0,at:270});
 assert.equal(p.render().players[1].x,5.9,'a new epoch must not inherit the previous correction');
});

test('a delayed local acknowledgement does not snap when held-input server ticks exceed two units of correction',()=>{
 const {p,s,time}=setup();
 for(let i=0;i<20;i++)p.advance({move:1},1/60);
 const before={...p.render().players[0]};
 // During an input gap the server keeps held movement active. Its world clock
 // can advance 24 ticks while only five sequenced commands have been received.
 for(let i=0;i<24;i++)stepGame(s,[{...neutral(),move:1},neutral()],1/60);
 time(400);p.receive(s,{epoch:1,ack:5,at:200});
 assert.ok(Math.abs(p.render().players[0].x-before.x)<.01,'a valid late ack must not abruptly pull the local player forward');
 time(416);const next=p.render().players[0].x;
 assert.ok(next>before.x&&next-before.x<.8,'catch-up starts without a one-frame jump');
 time(700);assert.ok(p.render().players[0].x>before.x+2,'the correction must converge rather than hide the authoritative advance');
 assert.equal(p.diagnostics().pending,15,'visual smoothing must not discard unacknowledged inputs');
});

test('walking off a moving platform cannot resurrect a suppressed teammate correction',()=>{
 let now=200;
 const p=module.createPrediction({slot:0,clock:{now:()=>now}});
 const s=createGame({...fixture(),spawn:{x:5,y:3},platforms:[{id:'lift',kind:'moving',x:2,y:3,w:6,h:.65,axis:'x',range:0,speed:1}]},{players:2});
 Object.assign(s.players[1],{x:6.3,y:3,vx:-7.2,grounded:true,groundId:'lift'});
 p.receive(s,{epoch:1,ack:0,at:0});now=250;p.render();
 Object.assign(s.players[1],{x:6.65,vx:7.2});
 p.receive(s,{epoch:1,ack:0,at:50});
 now=285;const grounded={...p.render().players[1]};
 now=290;const airborne={...p.render().players[1]};
 assert.equal(grounded.grounded,true);assert.equal(airborne.grounded,false);
 assert.ok(airborne.x>=grounded.x,'the player must keep walking forward when leaving the platform');
 assert.ok(airborne.x-grounded.x<.1,'leaving platform must preserve motion continuity');
});
