import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { openBrowser, sleep } from './game-browser-harness.mjs';
const wait = async (b, expr, tries = 140) => { for (let i = 0; i < tries; i++) { if (await b.evaluate(expr)) return; await sleep(80); } assert.fail(`memory browser condition: ${expr}`); };
const clickAt = async (b, x, y) => { for (const type of ['mousePressed', 'mouseReleased']) await b.call('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 }); };
const click = async (b, selector) => { const r = await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`); await clickAt(b, r.x, r.y); };
const saved = b => b.evaluate('JSON.parse(localStorage.getItem("memory-garden-v1"))');
const card = async (b, index) => { const r = await b.evaluate(`JSON.parse(document.querySelector('#view').dataset.cards).find(c=>c.index===${index})`); assert.ok(r, `card ${index} must be visible`); await clickAt(b, r.x, r.y); };

test('cards automatically shrink to fit the whole board and remain clickable as more cards are added', { timeout: 60000 }, async () => {
  const b = await openBrowser();
  try {
    await b.size(390, 844, true); await b.navigate('games/memory.html');
    await wait(b, 'document.body.dataset.ready === "true"');
    await click(b, '#start'); await click(b, '[data-level="1"]');
    await wait(b, 'view.dataset.phase === "playing"');
    const spacing = () => b.evaluate('(()=>{const cards=JSON.parse(view.dataset.cards);return Math.abs(cards.find(c=>c.index===1).x-cards.find(c=>c.index===0).x)})()');
    const firstSpacing = await spacing();
    await click(b, '#pause'); await click(b, '#leave');
    await click(b, '#start'); await click(b, '[data-level="10"]'); await click(b, '#confirm-unlock');
    await wait(b, 'JSON.parse(view.dataset.cards).length >= 40');
    const visible = await b.evaluate('(()=>{const r=view.getBoundingClientRect();return {cards:JSON.parse(view.dataset.cards),top:r.top,bottom:r.bottom}})()');
    assert.equal(visible.cards.length, 40);
    for (const c of visible.cards) assert.ok(c.x > 12 && c.x < 378 && c.y > visible.top + 100 && c.y < visible.bottom - 80, `card ${c.index} is clipped or hidden behind controls: ${JSON.stringify(c)}`);
    const levelSpacing = await spacing(); assert.ok(levelSpacing < firstSpacing, 'more cards must have smaller visual size');
    assert.ok(await b.evaluate('JSON.parse(view.dataset.resources).objects') > 0, 'small preview cards retain their raised symbols');
    const preview = await b.call('Page.captureScreenshot', { format: 'png' }); await writeFile('/tmp/memory-adaptive-preview.png', Buffer.from(preview.data, 'base64'));
    await wait(b, 'view.dataset.phase === "playing"');
    await card(b, 39); assert.deepEqual((await saved(b)).session.selected, [39], 'a fitted last card can be selected directly');
    const selected = (await saved(b)).session.cards[39].symbol;
    const matching = (await saved(b)).session.cards.findIndex((c, i) => c.symbol === selected && i !== 39);
    await card(b, matching);
    await click(b, '#use-add'); await wait(b, 'JSON.parse(view.dataset.cards).length === 44');
    assert.ok(await spacing() < levelSpacing, 'adding cards must recalculate and reduce the visual size');
    await wait(b, 'view.dataset.phase === "playing"');
    await card(b, 43); assert.deepEqual((await saved(b)).session.selected, [43], 'new final cards remain selectable');
    for (const [width, height] of [[320, 568], [568, 320], [844, 390], [820, 1180], [1440, 900]]) {
      await b.size(width, height, width < 1000);
      const layout = await b.evaluate('(()=>{const r=view.getBoundingClientRect();return {cards:JSON.parse(view.dataset.cards),top:r.top,bottom:r.bottom,height:r.height}})()');
      assert.equal(layout.cards.length, 44, `${width}x${height} keeps the whole board visible`);
      for (const c of layout.cards) assert.ok(c.x > 8 && c.x < width - 8 && c.y > layout.top + (layout.height < 300 ? 40 : 100) && c.y < layout.bottom - (layout.height < 300 ? 70 : 80), `${width}x${height}: clipped card ${JSON.stringify(c)}`);
    }
    assert.deepEqual(b.errors, []);
  } finally { b.close(); }
});
test('a matched sculpture stays face up when a paused board is restored', { timeout: 45000 }, async () => {
  const b = await openBrowser();
  try {
    await b.size(390, 844, true); await b.navigate('games/memory.html'); await wait(b, 'document.body.dataset.ready === "true"');
    await click(b, '#start'); await click(b, '[data-level="1"]'); await wait(b, 'view.dataset.phase === "playing"');
    const pair = (await saved(b)).session.cards.flatMap((c, i) => c.symbol === 0 ? [i] : []);
    await card(b, pair[0]); await card(b, pair[1]); await sleep(1400);
    await click(b, '#pause'); await b.evaluate('document.getElementById("pause-dialog").style.visibility="hidden"');
    const p = await b.evaluate(`JSON.parse(view.dataset.cards).find(c=>c.index===${pair[0]})`);
    const capture = () => b.call('Page.captureScreenshot', { format: 'png', clip: { x: Math.floor(p.x - 38), y: Math.floor(p.y - 44), width: 76, height: 88, scale: 1 } });
    const before = await capture();
    await b.navigate('games/memory.html'); await wait(b, 'document.body.dataset.ready === "true"'); await click(b, '#continue');
    await wait(b, 'document.body.dataset.mode === "paused"'); await b.evaluate('document.getElementById("pause-dialog").style.visibility="hidden"');
    assert.equal((await saved(b)).session.cards[pair[0]].matched, true);
    assert.equal((await capture()).data, before.data, 'restored matched card has the same face and sculpture');
    assert.deepEqual(b.errors, []);
  } finally { b.close(); }
});
// Removing actual raycast input, a first-clear receipt, or next-level unlock must break this visitor path.
test('native 3D flips finish level one, award once, persist and unlock only the next level', { timeout: 120000 }, async () => {
  const b = await openBrowser();
  try {
    await b.call('Page.addScriptToEvaluateOnNewDocument', { source: 'const NativeAudio=window.AudioContext;window.AudioContext=new Proxy(NativeAudio,{construct(Type,args){const ctx=new Type(...args);window.observedAudio=ctx;return ctx;}});' });
    await b.size(390, 844, true); await b.navigate('games/memory.html');
    await wait(b, 'document.body.dataset.ready === "true"');
    assert.equal((await saved(b)).coins, 1000); assert.deepEqual((await saved(b)).items, { peek: 1, bomb: 0, add: 2 });
    await click(b, '#start'); await click(b, '[data-level="1"]');
    await wait(b, 'view.dataset.phase === "playing"');
    const game = (await saved(b)).session;
    for (const symbol of [0, 1]) {
      const indexes = game.cards.flatMap((c, i) => c.symbol === symbol ? [i] : []);
      await card(b, indexes[0]); await sleep(350); await card(b, indexes[1]); await sleep(450);
    }
    await wait(b, 'document.body.dataset.mode === "result"');
    let profile = await saved(b); assert.equal(profile.coins, 1100); assert.deepEqual(profile.completed, [1]); assert.deepEqual(profile.unlocked, [1, 2]);
    await b.evaluate('window.dispatchEvent(new Event("blur"))');
    await wait(b, 'observedAudio.state === "suspended"');
    await b.navigate('games/memory.html'); await wait(b, 'document.body.dataset.ready === "true"');
    assert.equal((await saved(b)).coins, 1100); assert.equal((await saved(b)).items.add, 2);
    await click(b, '#start'); await click(b, '[data-level="1"]'); await wait(b, 'view.dataset.phase === "playing"');
    const repeat = (await saved(b)).session;
    for (const symbol of [0, 1]) { const indexes = repeat.cards.flatMap((c, i) => c.symbol === symbol ? [i] : []); await card(b, indexes[0]); await sleep(350); await card(b, indexes[1]); await sleep(450); }
    await wait(b, 'document.body.dataset.mode === "result"'); assert.equal((await saved(b)).coins, 1100);
    const shot = await b.call('Page.captureScreenshot', { format: 'png' }); await writeFile('/tmp/memory-garden-phone-win.png', Buffer.from(shot.data, 'base64'));
    assert.deepEqual(b.errors, []);
  } finally { b.close(); }
});
test('shop, explicit paid unlock, large touch drag, consumables and pause survive reload', { timeout: 180000 }, async () => {
  const b = await openBrowser();
  try {
    await b.size(390, 844, true); await b.navigate('games/memory.html'); await wait(b, 'document.body.dataset.ready === "true"');
    await click(b, '#shop'); await click(b, '[data-buy="peek"]'); assert.equal((await saved(b)).coins, 500); assert.equal((await saved(b)).items.peek, 2);
    assert.equal(await b.evaluate('document.querySelector("[data-buy=bomb]").disabled'), true);
    await click(b, '#close-shop'); await click(b, '#start');
    await b.evaluate('document.querySelector(\'[data-level="200"]\').scrollIntoView({block:"center"})');
    await click(b, '[data-level="200"]'); assert.equal((await saved(b)).coins, 500, 'selecting a locked level alone never spends');
    await click(b, '#confirm-unlock'); assert.equal((await saved(b)).coins, 400); assert.deepEqual((await saved(b)).unlocked, [1, 200]);
    await wait(b, 'view.dataset.phase === "playing"'); assert.equal((await saved(b)).session.cards.length, 796);
    const before = await b.evaluate('view.dataset.center');
    const r = await b.evaluate('(()=>{const r=view.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height*.72}})()');
    await b.call('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...r, id: 1 }] });
    await b.call('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: r.x - 50, y: r.y - 160, id: 1 }] });
    await b.call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await wait(b, `view.dataset.center !== ${JSON.stringify(before)}`);
    assert.notEqual(await b.evaluate('view.dataset.center'), before); assert.deepEqual((await saved(b)).session.selected, []);
    await click(b, '#overview'); await wait(b, 'view.dataset.overview === "true"');
    assert.deepEqual(b.errors, [], 'a 796-card overview must keep rendering');
    const overviewCards = await b.evaluate('JSON.parse(view.dataset.cards)');
    for (const index of [0, 795]) { const c = overviewCards.find(c => c.index === index); assert.ok(c && c.x >= 0 && c.x <= 390 && c.y >= 68 && c.y <= 770, `overview includes endpoint ${index}`); }
    await click(b, '#overview'); await wait(b, 'view.dataset.overview === "false"');
    await click(b, '#use-add'); assert.equal((await saved(b)).items.add, 1); assert.equal((await saved(b)).session.cards.length, 800);
    await wait(b, 'view.dataset.phase === "playing"');
    await click(b, '#use-peek'); assert.equal((await saved(b)).items.peek, 1);
    await click(b, '#pause'); const remaining = (await saved(b)).session.remaining; await sleep(600); assert.equal((await saved(b)).session.remaining, remaining);
    await b.navigate('games/memory.html'); await wait(b, 'document.body.dataset.ready === "true"'); await click(b, '#continue');
    assert.equal(await b.evaluate('document.body.dataset.mode'), 'paused'); assert.equal((await saved(b)).session.cards.length, 800); assert.equal((await saved(b)).items.peek, 1);
    await click(b, '#resume'); await wait(b, 'view.dataset.phase === "playing"');
    const stats = await b.evaluate('JSON.parse(view.dataset.resources)'); assert.ok(stats.geometries < 800, JSON.stringify(stats));
    const shot = await b.call('Page.captureScreenshot', { format: 'png' }); await writeFile('/tmp/memory-garden-phone-large.png', Buffer.from(shot.data, 'base64'));
    assert.deepEqual(b.errors, []);
  } finally { b.close(); }
});
test('memory controls fit phone, tablet, desktop and landscape and hall reaches its real local entry', { timeout: 120000 }, async () => {
  const b = await openBrowser();
  try {
    await b.navigate('index.html'); await wait(b, 'window.GAMES?.some(g=>g.file === "games/memory.html")');
    await click(b, 'a[href="games/memory.html"]'); await wait(b, 'document.body.dataset.ready === "true"');
    for (const [width, height] of [[320, 568], [568, 320], [390, 844], [844, 390], [820, 1180], [1440, 900]]) {
      await b.size(width, height, width < 1000);
      assert.equal(await b.evaluate('document.documentElement.scrollWidth > innerWidth'), false);
      const controls = await b.evaluate('Array.from(document.querySelectorAll("button")).filter(e=>e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent,width:r.width,height:r.height,left:r.left,right:r.right}})');
      for (const c of controls) assert.ok(c.width >= 48 && c.height >= 48 && c.left >= -1 && c.right <= width + 1, `${width}x${height}: ${JSON.stringify(c)}`);
    }
    await b.size(1440, 900); const shot = await b.call('Page.captureScreenshot', { format: 'png' }); await writeFile('/tmp/memory-garden-desktop-home.png', Buffer.from(shot.data, 'base64'));
    assert.deepEqual(b.errors, []);
  } finally { b.close(); }
});
test('real audio remains stopped while buying from a paused game and resumes with the game', { timeout: 45000 }, async () => {
  const b = await openBrowser();
  try {
    await b.call('Page.addScriptToEvaluateOnNewDocument', { source: 'const NativeAudio = window.AudioContext; window.AudioContext = new Proxy(NativeAudio,{construct(Type,args){const ctx=new Type(...args);window.observedAudio=ctx;return ctx;}});' });
    await b.size(390, 844, true); await b.navigate('games/memory.html'); await wait(b, 'document.body.dataset.ready === "true"');
    await click(b, '#start'); await click(b, '[data-level="1"]'); await wait(b, 'observedAudio?.state === "running"');
    await click(b, '#play-shop'); await wait(b, 'observedAudio.state === "suspended"');
    await click(b, '[data-buy="add"]'); await sleep(250);
    assert.equal(await b.evaluate('observedAudio.state'), 'suspended', 'buying cannot restart paused background music');
    await click(b, '#close-shop'); assert.equal(await b.evaluate('document.body.dataset.mode'), 'paused');
    await click(b, '#resume'); await wait(b, 'observedAudio.state === "running"');
    await click(b, '#mute'); assert.equal((await saved(b)).muted, true);
    await click(b, '#pause');
    assert.equal(await b.evaluate('document.body.dataset.mode'), 'paused');
    await wait(b, 'observedAudio.state === "suspended"');
    assert.deepEqual(b.errors, []);
  } finally { b.close(); }
});
test('all five real garden themes retain readable scores, including the dark moon garden', { timeout: 60000 }, async () => {
  const b = await openBrowser();
  try {
    await b.size(390, 844, true); await b.navigate('games/memory.html'); await wait(b, 'document.body.dataset.ready === "true"');
    const themes = ['阳光花园', '樱花庭院', '水晶温室', '月光池塘', '星云花园'];
    for (const [i, level] of [1, 41, 81, 121, 161].entries()) {
      await click(b, '#start'); await click(b, `[data-level="${level}"]`);
      if (level > 1) await click(b, '#confirm-unlock');
      await wait(b, `view.dataset.theme === ${JSON.stringify(themes[i])}`);
      if (level === 121) {
        const color = await b.evaluate('getComputedStyle(document.getElementById("matched")).color');
        assert.ok(Number(color.match(/\d+/)[0]) > 180, `night score must contrast the dark scene: ${color}`);
        const shot = await b.call('Page.captureScreenshot', { format: 'png' }); await writeFile('/tmp/memory-garden-phone-moon.png', Buffer.from(shot.data, 'base64'));
      }
      await click(b, '#pause'); await click(b, '#leave');
    }
    assert.equal((await saved(b)).coins, 600); assert.deepEqual(b.errors, []);
  } finally { b.close(); }
});
test('pausing also freezes the real card flip and matching ring pixels', { timeout: 45000 }, async () => {
  const b = await openBrowser();
  try {
    await b.size(390, 844, true); await b.navigate('games/memory.html'); await wait(b, 'document.body.dataset.ready === "true"');
    await click(b, '#start'); await click(b, '[data-level="1"]'); await wait(b, 'view.dataset.phase === "playing"');
    const g = (await saved(b)).session, pair = g.cards.flatMap((c, i) => c.symbol === 0 ? [i] : []);
    await card(b, pair[0]);
    const p = await b.evaluate(`JSON.parse(view.dataset.cards).find(c=>c.index===${pair[1]})`);
    await Promise.all([
      b.call('Input.dispatchMouseEvent', { type: 'mousePressed', x: p.x, y: p.y, button: 'left', clickCount: 1 }),
      b.call('Input.dispatchMouseEvent', { type: 'mouseReleased', x: p.x, y: p.y, button: 'left', clickCount: 1 }),
      b.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' }),
    ]);
    await b.call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' });
    await wait(b, 'document.body.dataset.mode === "paused"');
    // Hide only the dialog for pixel observation; the real game remains paused.
    await b.evaluate('document.getElementById("pause-dialog").style.visibility="hidden"'); await sleep(200);
    const capture = () => b.call('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 200, width: 390, height: 480, scale: 1 } });
    const before = await capture(); await sleep(1000); const after = await capture();
    assert.ok(after.data === before.data, 'paused canvas geometry must not continue its flip or fade');
    assert.deepEqual(b.errors, []);
  } finally { b.close(); }
});
test('a clearly labelled hall button saves an active game and supports continuing it', { timeout: 90000 }, async () => {
  const b = await openBrowser();
  try {
    await b.size(320, 568, true); await b.navigate('games/memory.html'); await wait(b, 'document.body.dataset.ready === "true"');
    const label = await b.evaluate(`document.querySelector('header a[href="../index.html"]').textContent`);
    assert.match(label, /返回游戏厅/);
    await click(b, '#start'); await click(b, '[data-level="1"]'); await wait(b, 'view.dataset.phase === "playing"');
    await card(b, 0); const before = await saved(b);
    await click(b, 'header a[href="../index.html"]'); await wait(b, 'window.GAMES?.some(g=>g.file === "games/memory.html")');
    const after = await saved(b); assert.equal(after.coins, before.coins); assert.equal(after.session.paused, true); assert.deepEqual(after.session.cards, before.session.cards); assert.deepEqual(after.session.selected, [0]);
    await click(b, 'a[href="games/memory.html"]'); await wait(b, 'document.body.dataset.ready === "true"'); await click(b, '#continue'); await click(b, '#resume');
    await wait(b, 'document.body.dataset.mode === "playing"'); assert.deepEqual((await saved(b)).session.selected, [0]);
    assert.deepEqual(b.errors, []);
  } finally { b.close(); }
});
