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

test('real mobile input launches the 700-hook miner and completes a collection cycle', { timeout: 35000 }, async () => {
  const baseUrl = process.env.GOLDMINER_BASE_URL || 'http://127.0.0.1:4175';
  const server = process.env.GOLDMINER_BASE_URL ? null : spawn('python3', ['-m', 'http.server', '4175', '--bind', '127.0.0.1'], { cwd: new URL('..', import.meta.url), stdio: 'ignore' });
  const chrome = spawn('chromium-browser', [
    '--headless', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=9235',
    '--user-data-dir=/home/ubuntu/snap/chromium/common/goldminer-cdp', 'about:blank'
  ], { stdio: 'ignore' });
  let cdp;
  try {
    await waitFor(`${baseUrl}/games/goldminer.html`);
    const tabs = await (await waitFor('http://127.0.0.1:9235/json')).json();
    cdp = new Cdp(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
    await cdp.call('Runtime.enable');
    await cdp.call('Page.enable');
    await cdp.call('Network.enable');
    await cdp.call('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.call('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 2 });
    await cdp.call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await cdp.call('Page.navigate', { url: `${baseUrl}/games/goldminer.html?v=browser-smoke` });
    const evaluate = async expression => (await cdp.call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value;
    for (let index = 0; index < 80 && await evaluate('document.readyState') !== 'complete'; index += 1) await sleep(100);

    const devices = [
      { name: 'phone portrait', width: 390, height: 844, dpr: 2, mobile: true, insets: { top: 0, left: 0, bottom: 0, right: 0 } },
      { name: 'phone landscape notch', width: 844, height: 390, dpr: 2, mobile: true, insets: { top: 0, left: 47, bottom: 21, right: 47 } },
      { name: 'tablet portrait', width: 820, height: 1180, dpr: 2, mobile: true, insets: { top: 0, left: 0, bottom: 0, right: 0 } },
      { name: 'desktop', width: 1440, height: 900, dpr: 1, mobile: false, insets: { top: 0, left: 0, bottom: 0, right: 0 } }
    ];
    for (const device of devices) {
      await cdp.call('Emulation.setSafeAreaInsetsOverride', { insets: device.insets });
      await cdp.call('Emulation.setDeviceMetricsOverride', { width: device.width, height: device.height, deviceScaleFactor: device.dpr, mobile: device.mobile });
      await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
      const layout = await evaluate(`(()=>{const canvas=document.getElementById('canvas').getBoundingClientRect(),card=document.querySelector('#overlay .card').getBoundingClientRect(),start=document.getElementById('start').getBoundingClientRect();return{width:innerWidth,height:innerHeight,noOverflow:document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight,canvas:{width:canvas.width,height:canvas.height},card:{top:card.top,bottom:card.bottom},start:{top:start.top,bottom:start.bottom}}})()`);
      assert.deepEqual({ width: layout.width, height: layout.height }, { width: device.width, height: device.height }, device.name);
      assert.equal(layout.noOverflow, true, `${device.name}: no overflow`);
      assert.deepEqual(layout.canvas, { width: device.width, height: device.height }, `${device.name}: canvas fits viewport`);
      assert.ok(layout.start.top >= device.insets.top && layout.start.bottom <= device.height - device.insets.bottom, `${device.name}: start ${layout.start.top}-${layout.start.bottom} stays within ${device.insets.top}-${device.height-device.insets.bottom}`);
    }
    const phone = devices[0];
    await cdp.call('Emulation.setSafeAreaInsetsOverride', { insets: phone.insets });
    await cdp.call('Emulation.setDeviceMetricsOverride', { width: phone.width, height: phone.height, deviceScaleFactor: phone.dpr, mobile: phone.mobile });
    await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    assert.equal(await evaluate("document.querySelector('#overlay h1').textContent"), '黄金矿工');
    assert.equal(await evaluate("document.querySelector('#overlay .card>p:not(.eyebrow)').textContent.includes('700')"), true);
    await evaluate("document.getElementById('start').click()");
    assert.equal(await evaluate("document.getElementById('overlay').classList.contains('hidden')"), true);
    const timeBeforeBackground = Number(await evaluate("document.getElementById('time').textContent"));
    await evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))");
    await sleep(1200);
    assert.equal(Number(await evaluate("document.getElementById('time').textContent")), timeBeforeBackground, 'backgrounding pauses the countdown');
    assert.equal(await evaluate("document.getElementById('status').textContent"), '游戏已暂停');
    await evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'))");
    await sleep(1100);
    assert.equal(Number(await evaluate("document.getElementById('time').textContent")), timeBeforeBackground - 1, 'foregrounding resumes the countdown');
    await evaluate("delete document.hidden");

    let point = await evaluate(`(()=>{const rect=document.getElementById('canvas').getBoundingClientRect();return{x:rect.left+rect.width/2,y:rect.top+rect.height*.55}})()`);
    await cdp.call('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...point, id: 1, radiusX: 1, radiusY: 1, force: 1 }] });
    await cdp.call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    const launched = await evaluate(`({status:document.getElementById('status').textContent,score:Number(document.getElementById('score').textContent)})`);
    assert.ok(launched.status === '700 钩齐射！' || launched.score > 0, 'touch starts the volley before its first reward');
    if (process.env.GOLDMINER_SCREENSHOT) {
      const shot = await cdp.call('Page.captureScreenshot', { format: 'png', fromSurface: true });
      await writeFile(process.env.GOLDMINER_SCREENSHOT, Buffer.from(shot.data, 'base64'));
    }
    const landscape = devices[1];
    await evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))");
    await cdp.call('Emulation.setSafeAreaInsetsOverride', { insets: landscape.insets });
    await cdp.call('Emulation.setDeviceMetricsOverride', { width: landscape.width, height: landscape.height, deviceScaleFactor: landscape.dpr, mobile: landscape.mobile });
    await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    assert.equal(await evaluate("document.getElementById('status').textContent"), '屏幕已调整，点击再次齐射', 'background rotation cancels and safely reflows the volley');
    await evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden");
    await cdp.call('Emulation.setSafeAreaInsetsOverride', { insets: phone.insets });
    await cdp.call('Emulation.setDeviceMetricsOverride', { width: phone.width, height: phone.height, deviceScaleFactor: phone.dpr, mobile: phone.mobile });
    await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    assert.equal(await evaluate("document.getElementById('status').textContent"), '屏幕已调整，点击再次齐射');
    point = await evaluate(`(()=>{const rect=document.getElementById('canvas').getBoundingClientRect();return{x:rect.left+rect.width/2,y:rect.top+rect.height*.55}})()`);
    await cdp.call('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...point, id: 2, radiusX: 1, radiusY: 1, force: 1 }] });
    await cdp.call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

    let score = 0;
    for (let index = 0; index < 160; index += 1) {
      score = Number(await evaluate("document.getElementById('score').textContent"));
      if (score > 0) break;
      await sleep(100);
    }
    assert.ok(score > 0, 'a real touch volley retrieves treasure');
    let refreshed = false;
    for (let index = 0; index < 180; index += 1) {
      const status = await evaluate("document.getElementById('status').textContent");
      if (status === '新矿脉出现，点击再次齐射') { refreshed = true; break; }
      await sleep(100);
    }
    assert.equal(refreshed, true, 'an emptied mine refreshes immediately after every hook returns');
    const pixels = await evaluate(`(()=>{const canvas=document.getElementById('canvas'),ctx=canvas.getContext('2d'),data=ctx.getImageData(0,0,Math.min(canvas.width,80),Math.min(canvas.height,80)).data;return new Set(Array.from(data).filter((_,index)=>index%4!==3)).size})()`);
    assert.ok(pixels > 8, 'canvas contains a non-blank rendered scene');

    const failed = cdp.events.filter(event => event.method === 'Runtime.exceptionThrown' || (event.method === 'Runtime.consoleAPICalled' && event.params.type === 'error'));
    assert.deepEqual(failed, []);
  } finally {
    cdp?.close();
    chrome.kill('SIGTERM');
    server?.kill('SIGTERM');
  }
});
