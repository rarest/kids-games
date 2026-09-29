import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function waitFor(url, attempts = 80) {
  for (let index = 0; index < attempts; index += 1) {
    try { const response = await fetch(url); if (response.ok) return response; } catch {}
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

class Cdp {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
    this.ready = new Promise((resolve, reject) => {
      this.socket.onopen = resolve;
      this.socket.onerror = reject;
    });
    this.socket.onmessage = message => {
      const payload = JSON.parse(message.data);
      if (payload.id) {
        const promise = this.pending.get(payload.id);
        this.pending.delete(payload.id);
        payload.error ? promise.reject(new Error(payload.error.message)) : promise.resolve(payload.result);
      } else this.events.push(payload);
    };
  }
  async call(method, params = {}) {
    await this.ready;
    const id = this.nextId++;
    const result = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.socket.send(JSON.stringify({ id, method, params }));
    return result;
  }
  close() { this.socket.close(); }
}

test('Sites edition aims one hook per mineral, advances levels and persists best score', {timeout:45000}, async()=>{
 const baseUrl=process.env.GOLDMINER_BASE_URL||'http://127.0.0.1:4175';
 const server=process.env.GOLDMINER_BASE_URL?null:spawn('python3',['-m','http.server','4175','--bind','127.0.0.1'],{cwd:new URL('..',import.meta.url),stdio:'ignore'});
 const chrome=spawn('chromium-browser',['--headless','--no-sandbox','--disable-gpu','--remote-debugging-port=9235',`--user-data-dir=/home/ubuntu/snap/chromium/common/goldminer-sites-${process.pid}`,'about:blank'],{stdio:'ignore'});
 let cdp;
 try{
  await waitFor(`${baseUrl}/games/goldminer.html`);
  const tabs=await(await waitFor('http://127.0.0.1:9235/json')).json();cdp=new Cdp(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
  await cdp.call('Runtime.enable');await cdp.call('Page.enable');await cdp.call('Network.enable');await cdp.call('Network.setCacheDisabled',{cacheDisabled:true});
  await cdp.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});
  const evaluate=async expression=>(await cdp.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result.value;
  await cdp.call('Page.navigate',{url:`${baseUrl}/games/goldminer.html?v=sites-volley-20260929`});
  for(let i=0;i<100&&!await evaluate('!!document.querySelector(".primary-button")');i++)await sleep(100);
  const click=async text=>evaluate(`Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes(${JSON.stringify(text)}))?.click()`);
  await click('开始淘金');
  await evaluate('document.getElementById("canvas").dispatchEvent(new PointerEvent("pointerdown",{bubbles:true}))');
  assert.match(await evaluate('document.getElementById("status").textContent'),/12 块矿物，12 钩齐发/);
  await evaluate('Object.defineProperty(document,"hidden",{configurable:true,value:true});document.dispatchEvent(new Event("visibilitychange"))');
  const before=await evaluate('document.getElementById("time").textContent');await sleep(1200);
  assert.equal(await evaluate('document.getElementById("time").textContent'),before);
  await evaluate('delete document.hidden;document.dispatchEvent(new Event("visibilitychange"))');
  for(let i=0;i<180&&!await evaluate('document.body.innerText.includes("前往第 2 关")');i++)await sleep(100);
  assert.equal(await evaluate('document.body.innerText.includes("前往第 2 关")'),true);
  const score=await evaluate('Number(document.getElementById("score").textContent.replaceAll(",",""))');assert.ok(score>=650);
  assert.ok(Number(await evaluate('localStorage.getItem("goldMinerBest")'))>=score);
  await click('购买');await click('购买');await click('前往第 2 关');
  assert.equal(await evaluate('document.getElementById("level").textContent'),'2');
  await evaluate('document.getElementById("canvas").dispatchEvent(new PointerEvent("pointerdown",{bubbles:true}))');
  assert.match(await evaluate('document.getElementById("status").textContent'),/13 块矿物，13 钩齐发/);
  await sleep(1800);await click('使用炸药');await sleep(100);
  assert.equal(await evaluate('document.querySelector(".dynamite-button").disabled'),false,'remaining loaded hooks allow a second bomb');
  await click('使用炸药');await sleep(100);
  assert.equal(await evaluate('document.querySelector(".item-count").textContent'),'×0');
  await click('商店');const paused=await evaluate('document.getElementById("time").textContent');await sleep(1200);
  assert.equal(await evaluate('document.getElementById("time").textContent'),paused);await click('返回矿井');
  for(const size of [{width:844,height:390},{width:820,height:1180},{width:1440,height:900}]){
   await cdp.call('Emulation.setDeviceMetricsOverride',{...size,deviceScaleFactor:1,mobile:false});await sleep(100);
   assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
  }
  if(process.env.GOLDMINER_SCREENSHOT){const shot=await cdp.call('Page.captureScreenshot',{format:'png'});await writeFile(process.env.GOLDMINER_SCREENSHOT,Buffer.from(shot.data,'base64'));}
  await click('商店');
  const saved=await evaluate('localStorage.getItem("goldMinerBest")');await cdp.call('Page.reload',{ignoreCache:true});
  for(let i=0;i<80&&await evaluate('document.getElementById("best")?.textContent.replaceAll(",","")')!==saved;i++)await sleep(100);
  assert.equal(await evaluate('document.getElementById("best").textContent.replaceAll(",","")'),saved);
  assert.deepEqual(cdp.events.filter(e=>e.method==='Runtime.exceptionThrown'),[]);
 }finally{cdp?.close();chrome.kill('SIGTERM');server?.kill('SIGTERM');}
});
