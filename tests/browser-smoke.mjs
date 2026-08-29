import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { LEVELS, getLevel } from '../maze/levels.js';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const DIRECTIONS = [['up',0,-1],['down',0,1],['left',-1,0],['right',1,0]];

function solutionFor(level) {
  const keyIndex = new Map(level.keys.map((key, index) => [`${key.x},${key.y}`, index]));
  const allKeys = (1 << level.keys.length) - 1;
  const queue = [{ ...level.start, mask: 0, path: [] }], seen = new Set([`${level.start.x},${level.start.y}|0`]);
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const node = queue[cursor];
    if (node.x === level.exit.x && node.y === level.exit.y && node.mask === allKeys) return node.path;
    for (const [name, dx, dy] of DIRECTIONS) {
      const x = node.x + dx, y = node.y + dy;
      if (level.rows[y]?.[x] !== '.') continue;
      const key = keyIndex.get(`${x},${y}`), mask = key === undefined ? node.mask : node.mask | (1 << key), signature = `${x},${y}|${mask}`;
      if (!seen.has(signature)) { seen.add(signature); queue.push({ x, y, mask, path: [...node.path, name] }); }
    }
  }
  throw new Error('No browser solution');
}

async function waitFor(url, attempts = 80) {
  for (let index = 0; index < attempts; index++) {
    try { const response = await fetch(url); if (response.ok) return response; } catch {}
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

class Cdp {
  constructor(url) {
    this.socket = new WebSocket(url); this.nextId = 1; this.pending = new Map(); this.events = [];
    this.ready = new Promise((resolve, reject) => { this.socket.onopen = resolve; this.socket.onerror = reject; });
    this.socket.onmessage = message => {
      const payload = JSON.parse(message.data);
      if (payload.id) { const promise = this.pending.get(payload.id); this.pending.delete(payload.id); payload.error ? promise.reject(new Error(payload.error.message)) : promise.resolve(payload.result); }
      else this.events.push(payload);
    };
  }
  async call(method, params = {}) {
    await this.ready; const id = this.nextId++;
    const result = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.socket.send(JSON.stringify({ id, method, params })); return result;
  }
  close() { this.socket.close(); }
}

test('390x844 mobile flow reaches shop, map, normal stage and moves without browser errors', { timeout: 30000 }, async () => {
  const stageId = process.env.CROWN_STAGE_ID || 'normal-1', level = getLevel(stageId);
  assert.ok(level, `Unknown CROWN_STAGE_ID: ${stageId}`);
  const baseUrl = process.env.CROWN_BASE_URL || 'http://127.0.0.1:4174';
  const server = process.env.CROWN_BASE_URL ? null : spawn('python3', ['-m', 'http.server', '4174', '--bind', '127.0.0.1'], { cwd: new URL('..', import.meta.url), stdio: 'ignore' });
  const chrome = spawn('chromium-browser', [
    '--headless', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=9234',
    '--user-data-dir=/home/ubuntu/snap/chromium/common/crown-maze-cdp', 'about:blank'
  ], { stdio: 'ignore' });
  let cdp;
  try {
    await waitFor(`${baseUrl}/games/maze.html`);
    const tabs = await (await waitFor('http://127.0.0.1:9234/json')).json();
    cdp = new Cdp(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
    await cdp.call('Runtime.enable'); await cdp.call('Page.enable'); await cdp.call('Network.enable'); await cdp.call('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await cdp.call('Page.navigate', { url: `${baseUrl}/games/maze.html?v=202608291449` });
    for (let index = 0; index < 80; index++) {
      const state = await cdp.call('Runtime.evaluate', { expression: 'document.readyState', returnByValue: true });
      if (state.result.value === 'complete') break; await sleep(100);
    }
    const evaluate = async expression => (await cdp.call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value;
    if (stageId !== 'normal-1') {
      const position = LEVELS.findIndex(candidate => candidate.id === stageId);
      const isolatedSave = { version:1, coins:0, inventory:{dynamite:0,hook:0}, ownedSkins:['red'], equippedSkin:'red', collectedCoinIds:[], completedNormal:[], bestStars:{}, bestSteps:{}, unlockedNormal:level.type==='normal'?level.index:1, journeyPosition:position };
      await evaluate(`localStorage.setItem('crown-maze-save-v1',${JSON.stringify(JSON.stringify(isolatedSave))});location.reload()`);
      for (let index = 0; index < 80; index++) {
        if (await evaluate('document.readyState') === 'complete') break; await sleep(100);
      }
    }
    assert.equal(await evaluate('document.body.dataset.screen'), 'home');
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
    await evaluate("document.getElementById('shopButton').click()");
    assert.equal(await evaluate('document.body.dataset.screen'), 'shop');
    assert.equal(await evaluate("document.querySelectorAll('.shop-card').length"), 2);
    await evaluate("document.querySelector('[data-back=home]').click()");
    await evaluate("document.getElementById('startButton').click()");
    assert.equal(await evaluate('document.body.dataset.screen'), 'map');
    assert.equal(await evaluate("document.querySelectorAll('.stage-node').length"), 19);
    await evaluate(`document.querySelector('[data-stage=${stageId}]').click()`);
    await sleep(250);
    assert.equal(await evaluate('document.body.dataset.screen'), 'game');
    assert.equal(await evaluate('document.body.dataset.stage'), stageId);
    assert.equal(await evaluate("document.getElementById('keyRack').children.length"), level.keys.length);
    assert.equal(await evaluate("document.getElementById('mazeCanvas').width > 0"), true);
    if (process.env.CROWN_SCREENSHOT) {
      const shot = await cdp.call('Page.captureScreenshot', { format: 'png', fromSurface: true });
      await writeFile(process.env.CROWN_SCREENSHOT, Buffer.from(shot.data, 'base64'));
    }
    const solution = solutionFor(level);
    const press = direction => evaluate(`(() => { const b=document.querySelector('[data-direction=${direction}]'); b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:1})); b.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:1})); })()`);
    await press(solution[0]);
    assert.equal(await evaluate("Number(document.getElementById('stepCount').textContent)"), 1);
    for (const direction of solution.slice(1)) await press(direction);
    await sleep(600);
    assert.equal(await evaluate('document.body.dataset.screen'), 'result');
    assert.equal(await evaluate(`Object.hasOwn(JSON.parse(localStorage.getItem('crown-maze-save-v1')).bestStars,'${stageId}')`), true);
    const failures = cdp.events.filter(event => event.method === 'Runtime.exceptionThrown' || (event.method === 'Runtime.consoleAPICalled' && event.params.type === 'error'));
    assert.deepEqual(failures, []);
  } finally {
    cdp?.close(); chrome.kill('SIGTERM'); server?.kill('SIGTERM');
  }
});
