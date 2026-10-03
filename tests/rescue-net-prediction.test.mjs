import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,stepGame} from '../rescue/core.js';
import {LEVELS} from '../rescue/levels.js';
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
 const {p,s}=setup();const first=p.advance({move:1,jump:true},1/60).state;
 const time=first.time,x=first.players[0].x,y=first.players[0].y;
 assert.ok(time>s.time,'the moving body must not use the stale server animation clock');
 const second=p.advance({move:1},1/60).state;
 assert.ok(second.time>time);assert.ok(second.players[0].x>x);assert.ok(second.players[0].y>y);
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
 const continued=p.advance({},1/60).state.objects[0];assert.ok(continued.x>confirmed.x);
 for(const command of commands.slice(1))stepGame(s,[command.input,neutral()],1/60);
 assert.equal(s.events.filter(e=>e.type==='throw').length,1);
});
test('a predicted throw impact removes both crate and monster without claiming a server reward',()=>{
 const {p,s}=carrying({enemies:[{id:'target',kind:'mouse',x:9,y:1,min:8,max:10,speed:0}]}),original=structuredClone(s);
 p.advance({action:true},1/60);for(let i=0;i<25;i++)p.advance({},1/60);
 const view=p.render();
 assert.equal(view.objects[0].active,false,'spent crate must not keep flying through the target');
 assert.equal(view.enemies[0].alive,false,'the monster must react at the visible impact');
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
 assert.equal(first.commands.filter(c=>c.input.jump).length,1);assert.equal(first.state.players[1].heldBy,'p1');
 for(const c of first.commands)stepGame(s,[c.input,neutral()],1/60);
 stepGame(s,[neutral(),neutral()],1/60);receive(2);
 const next=p.advance({action:true,jump:true},1/30);assert.ok(next.commands.every(c=>!c.input.action&&!c.input.jump));
 assert.equal(next.state.players[0].carrying?.type,'player');
 p.advance({},1/60);const thrown=p.advance({action:true},1/60);
 assert.equal(thrown.state.players[0].carrying,null);assert.equal(thrown.state.players[1].heldBy,null);
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
