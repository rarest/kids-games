import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser} from './game-browser-harness.mjs';

for (const [file,pattern,message] of [
 ['games/goldminer.html','*goldminer-sites/bundle.js*','重新加载'],
 ['index.html','*games.js*','游戏列表未能加载'],
]) {
 test(`${file}: failed script leaves a visible recovery path`,{timeout:30000},async()=>{
  const b=await openBrowser();
  try {
   await b.size(820,1180,true);
   await b.call('Network.setBlockedURLs',{urls:[pattern]});
   await b.navigate(file);
   const text=await b.evaluate('document.body.innerText');
   assert.ok(text.includes(message),`Expected recovery message; actual visible text: ${text}`);
   assert.ok(await b.evaluate('Array.from(document.querySelectorAll("a")).some(a=>a.getBoundingClientRect().width>0&&a.textContent.includes("重新加载"))'));
   await b.call('Network.setBlockedURLs',{urls:[]});
   await b.navigate(file);
   assert.equal(await b.evaluate(file==='index.html'?'document.querySelectorAll(".card").length':'document.querySelectorAll(".primary-button").length')>0,true);
   assert.deepEqual(b.errors,[]);
  }finally{b.close()}
 });
}
