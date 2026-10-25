import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {resolve} from 'node:path';
import {openBrowser,sleep} from './game-browser-harness.mjs';
test('Butterfly is reachable from the hall, plays with native controls and returns on a phone',{timeout:120000},async()=>{
 const b=await openBrowser({chromeFlags:['--enable-unsafe-swiftshader']});const failures=[];
 b.on('Network.responseReceived',({response:r})=>{if(r.status>=400&&new URL(r.url).pathname.includes('butterfly'))failures.push(`${r.status} ${r.url}`);});
 try{
  const evidence=process.env.BUTTERFLY_EVIDENCE_DIR;
  async function wait(expression){for(let i=0;i<150;i++){if(await b.evaluate(expression))return;await sleep(80);}throw Error('Timed out: '+expression);}
  async function tap(selector){await b.evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);const point=await b.evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);await b.call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await b.call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});await sleep(100);}
  await b.size(390,844,true);await b.navigate('index.html');
  const link=await b.evaluate(`document.querySelector('a[href*="games/butterfly.html"]')?.getAttribute('href')`);assert.ok(link,'visible game hall entry');
  await tap('a[href*="games/butterfly.html"]');
  for(let i=0;i<200;i++){if(await b.evaluate(`location.pathname==='/games/butterfly.html'&&document.readyState==='complete'&&!!globalThis.GardenGame`))break;await sleep(50);}
  const state=await b.evaluate(`({path:location.pathname,title:document.title,configured:globalThis.GARDEN_WS_PATH,canvas:!!document.querySelector('canvas'),back:[...document.querySelectorAll('a[href]')].filter(a=>a.textContent.includes('回到小火箭游戏厅')).map(a=>a.getAttribute('href')),overflow:document.documentElement.scrollWidth>innerWidth+1,text:document.body.innerText.slice(0,200)})`);
  assert.equal(state.path,'/games/butterfly.html');assert.equal(state.configured,'/butterfly-ws');assert.equal(state.canvas,true);assert.ok(state.back.length);assert.equal(state.overflow,false);assert.deepEqual(b.errors,[]);assert.deepEqual(failures,[]);
  await tap('[data-action="choose"]');await tap('[data-start="1"]');await wait('document.querySelectorAll(".ng-map-card").length===4');await tap('[data-map="forest"]');await wait('GardenGame.view==="playing"');
  const before=await b.evaluate('({x:GardenGame.state.player.x,z:GardenGame.state.player.z})');await b.call('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowDown',code:'ArrowDown',windowsVirtualKeyCode:40});await sleep(250);await b.call('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowDown',code:'ArrowDown',windowsVirtualKeyCode:40});
  const played=await b.evaluate('({x:GardenGame.state.player.x,z:GardenGame.state.player.z,map:GardenGame.state.map,view:GardenGame.view,look:GardenGame.look})');assert.equal(played.map,'forest');assert.equal(played.view,'playing');assert.ok(Math.hypot(played.x-before.x,played.z-before.z)>.1,'native arrow input moves the butterfly');
  if(evidence){await fs.mkdir(evidence,{recursive:true});const shot=await b.call('Page.captureScreenshot',{format:'png'});await fs.writeFile(resolve(evidence,'hall-butterfly-play.png'),Buffer.from(shot.data,'base64'));await fs.writeFile(resolve(evidence,'hall-butterfly.json'),JSON.stringify({origin:b.origin,...state,played,errors:b.errors},null,2));}
  await tap('.ng-hud [data-action="home"]');await tap('.ng-hall-link');
  for(let i=0;i<100;i++){if(await b.evaluate(`!!window.GAMES&&document.querySelectorAll('.card').length===window.GAMES.length`))break;await sleep(50);}
  assert.equal(await b.evaluate(`!!window.GAMES&&document.querySelectorAll('.card').length===window.GAMES.length`),true);console.log(JSON.stringify({origin:b.origin,...state,played}));
 }finally{b.close();}
});
