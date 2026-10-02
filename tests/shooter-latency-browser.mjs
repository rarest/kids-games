import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';
import {createCoopServer} from '../shooter/server.mjs';
const wait=async(b,expression)=>{for(let i=0;i<160;i++){if(await b.evaluate(expression))return;await sleep(50)}throw Error('Timed out '+expression)};
test('local aircraft responds before a delayed server snapshot arrives',{timeout:20000},async()=>{
 const b=await openBrowser();let server;
 try{
  if(!process.env.GAMES_TEST_ORIGIN){server=createCoopServer({port:0,origins:[b.origin]});await server.ready}
  await b.size(390,844,true);await b.navigate('games/shooter.html');
  if(server)await b.evaluate(`history.replaceState(null,'',location.pathname+'?coopPort=${server.address().port}')`);
  await b.evaluate(`window.networkDelay=0;window.WebSocket=class extends WebSocket{set onmessage(fn){super.onmessage=e=>setTimeout(()=>{const m=JSON.parse(e.data);if(m.type==='state')window.authority=m.game;fn(e)},window.networkDelay)}send(data){if(window.networkDelay)setTimeout(()=>super.send(data),200);else super.send(data)}}`);
  await b.evaluate('createTeam.click()');await wait(b,'!launchTeam.disabled');await b.evaluate('launchTeam.click()');await wait(b,'document.body.dataset.mode==="playing"');
  await b.evaluate('window.networkDelay=400');await sleep(600);
  await b.evaluate(`window.motionResult=new Promise(resolve=>{const start=performance.now(),initial=Number(arena.dataset.playerX);function probe(){const diff=Number(arena.dataset.playerX)-initial;if(diff>5||performance.now()-start>1200)resolve({delay:performance.now()-start,distance:diff});else requestAnimationFrame(probe)}requestAnimationFrame(probe)});document.body.dispatchEvent(new KeyboardEvent('keydown',{code:'ArrowRight',key:'ArrowRight',bubbles:true}));`);
  const result=await b.evaluate('motionResult');textResult(result);assert.ok(result.delay<100,`input took ${Math.round(result.delay)}ms under a delayed network`);
  await b.evaluate(`document.body.dispatchEvent(new KeyboardEvent('keyup',{code:'ArrowRight',key:'ArrowRight',bubbles:true}));window.networkDelay=0`);await sleep(1000);assert.ok(await b.evaluate('Math.abs(Number(arena.dataset.playerX)-authority.player.x)')<3,'idle aircraft reconciles to server position');assert.deepEqual(b.errors,[]);
 }finally{b.close();await server?.close()}
});
function textResult(result){process.stdout.write(`local response ${Math.round(result.delay)}ms, distance ${result.distance}\n`)}
