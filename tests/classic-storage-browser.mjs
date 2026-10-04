import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser} from './game-browser-harness.mjs';

for(const game of ['snake','fish'])for(const scenario of ['malformed','wrong-shape','unavailable','full','valid']){
 test(`${game}: ${scenario} storage does not prevent starting or pausing`,{timeout:30000},async()=>{
  const b=await openBrowser();try{
   const key=game==='snake'?'snakeBoard':'bigfish_leaderboard_v1';
   const source=scenario==='unavailable'?`Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError')}})`:
    scenario==='full'?`Storage.prototype.setItem=function(){throw new DOMException('Full','QuotaExceededError')}`:
    `localStorage.setItem(${JSON.stringify(key)},${JSON.stringify(scenario==='malformed'?'{bad':scenario==='valid'?(game==='snake'?'[300,200,100]':'[{"name":"老玩家","score":300,"at":1}]'):'{"unexpected":true}')});`;
   await b.call('Page.addScriptToEvaluateOnNewDocument',{source});await b.size(820,1180,true);await b.navigate(`games/${game}.html`);
   assert.deepEqual(b.errors,[],'initialization must survive storage errors');
   if(scenario==='valid')assert.ok((await b.evaluate('document.body.innerText')).includes('300'),'existing scores are preserved');
   await b.evaluate('document.getElementById("startBtn").click()');
   if(game==='snake'){
    assert.equal(await b.evaluate('getComputedStyle(document.getElementById("overlay")).display'),'none');
    await b.evaluate('document.querySelector("[data-act=pause]").click()');
    assert.match(await b.evaluate('document.getElementById("ovTitle").textContent'),/暂停/);
    await b.evaluate('document.getElementById("startBtn").click();document.querySelector("[data-act=cheat]").click();document.querySelector("[data-act=restart]").click()');
   }else{
    assert.equal(await b.evaluate('document.getElementById("startOverlay").classList.contains("hidden")'),true);
    await b.call('Input.dispatchKeyEvent',{type:'keyDown',key:'p',code:'KeyP'});
    assert.equal(await b.evaluate('document.getElementById("pauseOverlay").classList.contains("hidden")'),false);
    await b.evaluate('document.getElementById("resumeBtn").click();document.getElementById("muteBtn2").click()');
   }
   assert.deepEqual(b.errors,[],'controls must survive storage errors');
   if(scenario==='unavailable'||scenario==='full')assert.equal(await b.evaluate('document.getElementById("storageNotice").hidden'),false,'storage failure is explained');
  }finally{b.close()}
 });
}

for(const full of [false,true])test(`fish settlement preserves ${full?'unsaved session':'another tab'} scores`,{timeout:30000},async()=>{
 const {readFile}=await import('node:fs/promises');
 const html=(await readFile(new URL('../games/fish.html',import.meta.url),'utf8')).replace('// pause when tab hidden','window.__finishFish=(name,score)=>{game.name=name;game.score=score;die()};\n// pause when tab hidden');
 const b=await openBrowser();try{
  await b.call('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('bigfish_leaderboard_v1',JSON.stringify([{name:'旧玩家',score:300,at:1}]));window.__setItem=Storage.prototype.setItem;${full?"Storage.prototype.setItem=function(){throw new DOMException('Full','QuotaExceededError')}":''}`});
  b.on('Fetch.requestPaused',p=>b.call('Fetch.fulfillRequest',{requestId:p.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/html; charset=utf-8'}],body:Buffer.from(html).toString('base64')}));
  await b.call('Fetch.enable',{patterns:[{urlPattern:'*games/fish.html*',resourceType:'Document',requestStage:'Request'}]});
  await b.navigate('games/fish.html');
  if(!full)await b.evaluate(`localStorage.setItem('bigfish_leaderboard_v1',JSON.stringify([{name:'旧玩家',score:300,at:1},{name:'另一页玩家',score:250,at:2}]))`);
  await b.evaluate(`document.getElementById('startBtn').click();window.__finishFish('本局玩家',200)`);
  assert.equal(await b.evaluate('document.getElementById("overOverlay").classList.contains("hidden")'),false);
  const board=await b.evaluate('document.getElementById("boardOver").innerText');
  assert.match(board,/旧玩家/);assert.match(board,/本局玩家/);if(!full)assert.match(board,/另一页玩家/);
  await b.evaluate('document.getElementById("changeBtn").click()');assert.match(await b.evaluate('document.getElementById("boardStart").innerText'),/本局玩家/);
  if(full){
   await b.evaluate(`Storage.prototype.setItem=window.__setItem;document.getElementById('startBtn').click();window.__finishFish('本局玩家',400)`);
   const saved=await b.evaluate(`JSON.parse(localStorage.getItem('bigfish_leaderboard_v1'))`);assert.equal(saved.find(x=>x.name==='本局玩家').score,400);assert.equal(saved.find(x=>x.name==='旧玩家').score,300);
  }
  assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
