import test from 'node:test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {openBrowser,sleep} from './game-browser-harness.mjs';
import {createCoopServer} from '../shooter/server.mjs';
async function until(b,expression){for(let i=0;i<150;i++){if(await b.evaluate(expression))return;await sleep(50)}throw Error('Timed out: '+expression)}
test('separate phone and computer join, see both aircraft, move, fire, pause and leave together',{timeout:40000},async()=>{
 const a=await openBrowser(),b=await openBrowser();let server;
 try{
  if(!process.env.GAMES_TEST_ORIGIN){server=createCoopServer({port:0,origins:[a.origin,b.origin]});await server.ready}
  for(const [browser,size]of [[a,[390,844,true]],[b,[1440,900,false]]]){
   await browser.size(...size);await browser.navigate('games/shooter.html');
   if(server)await browser.evaluate(`history.replaceState(null,'',location.pathname+'?coopPort=${server.address().port}')`);
   await browser.evaluate(`window.WebSocket=class extends WebSocket{constructor(...args){super(...args);window.testSocket=this;this.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.type==='state')window.testState=m;})}}`);
  }
  await a.evaluate('createTeam.click()');await until(a,'!!window.testState');
  const code=await a.evaluate('testState.code');await b.evaluate(`teamCode.value=${JSON.stringify(code)};joinTeam.click()`);
  await until(a,'testState.members.length===2');await until(b,'!!window.testState&&testState.members.length===2');
  assert.equal(await a.evaluate('testState.game.partners.length'),1);assert.equal(await b.evaluate('testState.code'),code);
  await a.evaluate('launchTeam.click()');await until(b,'document.body.dataset.mode==="playing"');
  const id=await b.evaluate('testState.game.partners[0].id'),before=await a.evaluate('testState.game.partners[0].player.x');
  await b.call('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight'});await sleep(350);await b.call('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight'});
  await until(a,`testState.game.partners.find(p=>p.id===${JSON.stringify(id)}).player.x>${before+40}`);
  const r=await b.evaluate('(()=>{const r=game.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height*.8}})()');
  await b.call('Input.dispatchMouseEvent',{type:'mousePressed',x:r.x,y:r.y,button:'left',clickCount:1});await b.call('Input.dispatchMouseEvent',{type:'mouseMoved',x:r.x+60,y:r.y,button:'left',buttons:1});await b.call('Input.dispatchMouseEvent',{type:'mouseReleased',x:r.x+60,y:r.y,button:'left',clickCount:1});await sleep(250);
  const dragged=await b.evaluate('testState.game.partners[0].player.x');await b.call('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowLeft',code:'ArrowLeft'});await sleep(350);await b.call('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowLeft',code:'ArrowLeft'});assert.ok(await b.evaluate('testState.game.partners[0].player.x')<dragged-20);
  await b.evaluate('document.getElementById("laser").click()');await until(a,'testState.game.partners[0].lasers===9');assert.equal(await a.evaluate('testState.game.lasers'),10);
  await b.evaluate('document.getElementById("pause").click()');await until(a,'document.body.dataset.mode==="paused"');assert.equal(await b.evaluate('resume.disabled'),true);
  await a.evaluate('resume.click()');await until(b,'document.body.dataset.mode==="playing"');
  if(process.env.GAMES_SCREENSHOT){const shot=await a.call('Page.captureScreenshot',{format:'png'});await writeFile(process.env.GAMES_SCREENSHOT,Buffer.from(shot.data,'base64'))}
  const beforeReconnect=await b.evaluate('testState.game.partners[0].id');await b.evaluate('testSocket.close()');await sleep(1600);await until(b,'testState.members.length===2&&testState.members.every(m=>m.online)');assert.equal(await b.evaluate('testState.game.partners[0].id'),beforeReconnect);
  await b.size(568,320,true);const bounds=await b.evaluate('Array.from(document.querySelectorAll(".weapon-buttons button")).map(e=>e.getBoundingClientRect().bottom)');assert.ok(bounds.every(y=>y<=320));
  await b.evaluate('leaveTeam.click()');await until(b,'document.body.dataset.mode==="home"');await until(a,'testState.members.length===1');
  const invite=await a.evaluate('inviteLink.value');await b.call('Page.navigate',{url:invite});await until(b,'document.body.dataset.online==="true"&&document.getElementById("teamStatus").textContent.includes("2/16")');await until(a,'testState.members.length===2');
  await a.evaluate('leaveTeam.click()');await until(b,'!document.getElementById("resume").disabled');await b.evaluate('leaveTeam.click()');assert.deepEqual(a.errors,[]);assert.deepEqual(b.errors,[]);
 }finally{a.close();b.close();await server?.close()}
});
