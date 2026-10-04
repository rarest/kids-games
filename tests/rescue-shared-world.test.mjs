import test from 'node:test';import assert from 'node:assert/strict';import WebSocket from 'ws';
import {createRescueServer} from '../rescue/server.mjs';
import {createRescueClient} from '../rescue/net-client.js';

const sleep=ms=>new Promise(r=>setTimeout(r,ms));async function until(fn){const end=Date.now()+8000;while(!fn()){if(Date.now()>end)throw Error('wait');await sleep(5)}}
const level={id:'0',name:'sync probe',theme:'street',width:40,height:12,spawn:{x:5,y:3},platforms:[{id:'floor',x:0,y:1,w:40,h:.65},{id:'lift',kind:'moving',x:2,y:3,w:6,h:.65,axis:'x',range:2,speed:1}],objects:[],enemies:[{id:'mouse',kind:'mouse',x:12,y:1,min:9,max:20,speed:2}],hazards:[],pickups:[],decor:[],boss:null,exit:{x:38,y:1}};
test('real WS clients at 100/300ms RTT and 60/20Hz share moving-world geometry',{timeout:15000},async()=>{
const app=createRescueServer({port:0,levelFor:()=>structuredClone(level)});await app.ready;
const clients=[],sockets=[],timers=new Set();
function make(delay){const map=new Map(),later=f=>{const t=setTimeout(()=>{timers.delete(t);f()},delay);timers.add(t)};
 const c=createRescueClient({url:`ws://127.0.0.1:${app.address().port}/rescue-ws`,storage:{getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)},transport:url=>{
 const ws=new WebSocket(url,{origin:'https://games.nblord.com'});sockets.push(ws);return{get readyState(){return ws.readyState},get bufferedAmount(){return ws.bufferedAmount},send:data=>later(()=>{if(ws.readyState===1)ws.send(data)}),close:()=>ws.close(),addEventListener:(type,fn)=>ws.addEventListener(type,e=>type==='message'?later(()=>fn(e)):fn(e))}}});clients.push(c);return c}
const pumps=[];
try{
 const a=make(50);a.create();await until(()=>a.room);const b=make(150);b.join(a.room.code);await until(()=>b.room);for(const c of clients)c.setReady(true);await until(()=>a.room.members.every(m=>m?.ready));a.command('start');await until(()=>a.room.mode==='playing'&&b.room.mode==='playing');
 for(const [i,c] of clients.entries()){let last=performance.now();pumps.push(setInterval(()=>{const now=performance.now();c.advance({},(now-last)/1000);last=now},i?50:1000/60))}
 const rows=[];for(let i=0;i<30;i++){await sleep(50);const sample=clients.map((c,slot)=>{const s=c.render();return{slot,time:s.time,authorityTime:c.authority.time,tick:c.diagnostics().tick,pending:c.diagnostics().pending,mode:c.room.mode,enemyX:s.enemies[0].x,platformX:s.platforms[1].x}});rows.push(sample)}
 // Different RTTs present different confirmed times. Match simulation samples
 // from the history instead of projecting both peers into the unknown future.
 const samples=rows.slice(8).filter(r=>r.every(s=>s.mode==='playing'));
 const gaps=samples.map(r=>{const a=r[0],b=samples.map(row=>row[1]).reduce((best,row)=>!best||Math.abs(row.time-a.time)<Math.abs(best.time-a.time)?row:best,null);return {enemy:Math.abs(a.enemyX-b.enemyX),platform:Math.abs(a.platformX-b.platformX),time:Math.abs(a.time-b.time)}}).filter(g=>g.time<.025);
 const result={delayEachDirection:[50,150],renderCadence:[1000/60,50],rows,maxEnemyGap:Math.max(...gaps.map(g=>g.enemy)),maxPlatformGap:Math.max(...gaps.map(g=>g.platform)),maxTimeGap:Math.max(...gaps.map(g=>g.time))};
 console.log(JSON.stringify({maxEnemyGap:result.maxEnemyGap,maxPlatformGap:result.maxPlatformGap,maxTimeGap:result.maxTimeGap,first:rows[0],last:rows.at(-1)}));
assert.ok(gaps.length>=10,'enough matching confirmed times');assert.ok(result.maxEnemyGap<.08,`shared enemy gap ${result.maxEnemyGap}`);assert.ok(result.maxPlatformGap<.08,`shared platform gap ${result.maxPlatformGap}`);assert.ok(result.maxTimeGap<.025,`shared time gap ${result.maxTimeGap}`);
}finally{pumps.forEach(clearInterval);clients.forEach(c=>c.dispose());timers.forEach(clearTimeout);sockets.forEach(s=>s.terminate());await app.close()}

});
