import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitFor(url,attempts=100){for(let i=0;i<attempts;i++){try{const response=await fetch(url);if(response.ok)return response}catch{}await sleep(100)}throw new Error(`timeout: ${url}`)}
class Cdp{
  constructor(url){this.ws=new WebSocket(url);this.id=0;this.pending=new Map();this.ready=new Promise((resolve,reject)=>{this.ws.onopen=resolve;this.ws.onerror=reject});this.ws.onmessage=event=>{const payload=JSON.parse(event.data);if(payload.id){const pending=this.pending.get(payload.id);this.pending.delete(payload.id);payload.error?pending.reject(new Error(payload.error.message)):pending.resolve(payload.result)}}}
  async call(method,params={}){await this.ready;const id=++this.id;const result=new Promise((resolve,reject)=>this.pending.set(id,{resolve,reject}));this.ws.send(JSON.stringify({id,method,params}));return result}
  close(){this.ws.close()}
}

test('fresh player can draw, place, exit and continue on a real phone viewport',{timeout:30000},async()=>{
  const server=spawn('python3',['-m','http.server','4189','--bind','127.0.0.1'],{cwd:new URL('..',import.meta.url),stdio:'ignore'});
  const chrome=spawn('chromium-browser',['--headless','--no-sandbox','--disable-gpu','--hide-scrollbars','--remote-debugging-port=9249','--user-data-dir=/home/ubuntu/snap/chromium/common/merge4096-cdp','about:blank'],{stdio:'ignore'});
  let cdp;
  try{
    await waitFor('http://127.0.0.1:4189/games/merge4096.html');
    const tabs=await (await waitFor('http://127.0.0.1:9249/json')).json();cdp=new Cdp(tabs.find(tab=>tab.type==='page').webSocketDebuggerUrl);
    await cdp.call('Runtime.enable');await cdp.call('Page.enable');await cdp.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});
    await cdp.call('Page.navigate',{url:'http://127.0.0.1:4189/games/merge4096.html'});
    const evaluate=async expression=>(await cdp.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result.value;
    for(let i=0;i<100&&await evaluate('document.readyState')!=='complete';i++)await sleep(50);
    await evaluate("localStorage.removeItem('merge4096-save-v1');location.reload()");
    for(let i=0;i<100&&await evaluate('document.readyState')!=='complete';i++)await sleep(50);
    assert.deepEqual(JSON.parse(await evaluate(`JSON.stringify({screen:document.body.dataset.screen,best:bestValue.textContent,last:lastResult.textContent,wins:winCount.textContent,coins:coinCount.textContent})`)),{screen:'home',best:'0',last:'0',wins:'0',coins:'500'});
    await evaluate('startButton.click()');await sleep(100);
    assert.equal(await evaluate('document.body.dataset.screen'),'game');
    assert.equal(await evaluate("document.querySelectorAll('.tile').length"),0);
    assert.equal(await evaluate('drawCount.textContent'),'0');
    await evaluate('drawButton.click()');await sleep(50);
    assert.equal(await evaluate('drawCount.textContent'),'1');
    assert.equal(await evaluate('pendingCard.hidden'),false);
    await evaluate("document.querySelector('.pile-button').click()");
    assert.equal(await evaluate("document.querySelectorAll('.pile-button')[0].querySelectorAll('.tile').length"),1);
    await evaluate('exitButton.click()');
    assert.equal(await evaluate('document.body.dataset.screen'),'home');
    assert.notEqual(await evaluate('lastResult.textContent'),'0');
    await evaluate('location.reload()');for(let i=0;i<100&&await evaluate('document.readyState')!=='complete';i++)await sleep(50);
    await evaluate('startButton.click()');await sleep(100);
    assert.equal(await evaluate("document.querySelectorAll('.pile-button')[0].querySelectorAll('.tile').length"),1);
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
  }finally{cdp?.close();chrome.kill('SIGTERM');server.kill('SIGTERM')}
});
