import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { openBrowser, sleep } from './game-browser-harness.mjs';

const wait = async (b, expression) => {
  for (let i = 0; i < 120; i++) {
    const value = await b.evaluate(expression);
    if (value) return value;
    await sleep(60);
  }
  assert.fail(`${expression}: ${JSON.stringify(await b.evaluate('({...document.querySelector("#view")?.dataset})'))}`);
};
const key = (b, code, down = true) => b.call('Input.dispatchKeyEvent', {
  type: down ? 'keyDown' : 'keyUp', key: code === 'Space' ? ' ' : code, code,
});
const click = async (b, selector) => {
  const p = await b.evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});el.scrollIntoView({block:'center'});const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  for (const type of ['mousePressed', 'mouseReleased']) {
    await b.call('Input.dispatchMouseEvent', { type, ...p, button: 'left', clickCount: 1 });
  }
};
const frames = (b, count = 12) => b.evaluate(`new Promise(resolve=>{let n=${count};const frame=()=>--n?requestAnimationFrame(frame):resolve();requestAnimationFrame(frame)})`);
const shot = async (b, name) => {
  const r = await b.call('Page.captureScreenshot', { format: 'png' });
  await writeFile(`/tmp/parkour-integration-${name}.png`, Buffer.from(r.data, 'base64'));
};
const snapshot = b => b.evaluate('({x:Number(view.dataset.x),y:Number(view.dataset.y),z:Number(view.dataset.z),yaw:Number(view.dataset.cameraYaw),distance:Number(view.dataset.cameraDistance),resources:JSON.parse(view.dataset.resources),triangles:Number(view.dataset.triangles),calls:Number(view.dataset.drawCalls)})');
const waitForHall = async b => {
  for (let i = 0; i < 120; i++) {
    try {
      if (await b.evaluate('location.pathname.endsWith("/index.html") && document.readyState === "complete" && document.querySelectorAll(".card").length === 11')) return;
    } catch (error) {
      // A real navigation can replace the inspected context during this poll.
      if (!/Inspected target navigated or closed|Execution context was destroyed|Cannot find context with specified id/.test(error.message)) throw error;
    }
    await sleep(60);
  }
  assert.fail(`game hall did not render eleven cards: ${JSON.stringify(await b.evaluate('({path:location.pathname,ready:document.readyState,cards:document.querySelectorAll(".card").length})'))}`);
};

// Removing the catalog entry, pointing it at another game, or losing the preset
// coin save must break this complete visitor path. Motion uses native inputs only.
test('hall search reaches parkour and a real preset jump credits its first coin durably', { timeout: 60000 }, async () => {
  const b = await openBrowser();
  try {
    await b.size(960, 640);
    await b.navigate('index.html');
    await waitForHall(b);
    assert.equal(await b.evaluate('document.querySelectorAll(".card").length'), 11);
    assert.equal(await b.evaluate(`document.querySelector('a[href="games/parkour.html"] .name')?.textContent`), '微光跑酷');
    const description = await b.evaluate(`document.querySelector('a[href="games/parkour.html"] .desc').textContent`);
    for (const requirement of [/12关/, /3D/, /自创/]) assert.match(description, requirement);
    assert.deepEqual(await b.evaluate(`Array.from(document.querySelectorAll('a[href="games/parkour.html"] .tag'),t=>t.textContent)`), ['跑酷', '3D', '闯关', '手机']);
    await click(b, '#q');
    await b.call('Input.insertText', { text: '微光跑酷' });
    assert.equal(await b.evaluate('document.querySelectorAll(".card").length'), 1);
    await click(b, 'a[href="games/parkour.html"]');
    await wait(b, 'location.pathname.endsWith("/games/parkour.html") && document.body.dataset.ready === "true"');
    await click(b, '#start');
    assert.equal(await b.evaluate('document.querySelectorAll("[data-level]").length'), 12);
    await click(b, '[data-level="sakura-1"]');
    await wait(b, 'view.dataset.mode === "playing"');
    const spawn = await snapshot(b);
    assert.ok(Math.abs(spawn.yaw - Math.PI / 2) < .02, 'default forward points toward the first +x landing');
    assert.equal(await b.evaluate('coins.textContent'), '0');
    await Promise.all([key(b, 'ArrowUp'), key(b, 'Space')]);
    await wait(b, 'coins.textContent === "1"');
    await key(b, 'ArrowUp', false);
    await key(b, 'Space', false);
    await wait(b, 'Number(view.dataset.y) === .22');
    const landed = await snapshot(b);
    assert.ok(landed.x > 4.8 && landed.x < 7.7 && Math.abs(landed.z) < .1, `real first landing: ${JSON.stringify(landed)}`);
    assert.match(await b.evaluate('document.querySelector("#run-info").textContent'), /1 \/ 4 金币/);
    assert.equal(await b.evaluate('JSON.parse(localStorage.getItem("glow-parkour-v1")).coins'), 1);
    await click(b, '#reset-camera');
    await frames(b);
    assert.ok(Math.abs((await snapshot(b)).yaw) < .02, 'reset on first landing faces the next +z platform');
    await b.size(390, 844, true);
    await shot(b, 'first-preset-coin');
    console.log('actual first preset coin', landed);
    await b.navigate('games/parkour.html');
    await wait(b, 'document.body.dataset.ready === "true"');
    assert.equal(await b.evaluate('coins.textContent'), '1', 'actual collected coin survives page reload');
    console.log('actual preset wallet survives reload', await b.evaluate('coins.textContent'));
    await click(b, '.brand');
    await waitForHall(b);
    assert.equal(await b.evaluate('document.querySelectorAll(".card").length'), 11);
    assert.deepEqual(b.errors, []);
  } finally {
    b.close();
  }
});

test('parkour home, live controls, level picker and editor fit six portrait and landscape sizes', { timeout: 120000 }, async () => {
  const b = await openBrowser();
  const fit = async (width, height, mode) => {
    assert.equal(await b.evaluate('document.documentElement.scrollWidth > innerWidth'), false, `${width}x${height} ${mode}: horizontal overflow`);
    const buttons = await b.evaluate('Array.from(document.querySelectorAll("button")).filter(b=>b.getClientRects().length).map(b=>{const r=b.getBoundingClientRect();return {id:b.id||b.textContent.trim(),x:r.x,right:r.right,w:r.width,h:r.height}})');
    for (const r of buttons) {
      assert.ok(r.w >= 48 && r.h >= 48, `${width}x${height} ${mode}: ${JSON.stringify(r)}`);
      assert.ok(r.x >= -1 && r.right <= width + 1, `${width}x${height} ${mode}: ${JSON.stringify(r)}`);
    }
    if (mode === 'playing') {
      const controls = await b.evaluate('Array.from(document.querySelectorAll("#joystick,#jump,#pause,#reset-camera"),el=>{const r=el.getBoundingClientRect();return {id:el.id,x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width}})');
      for (const r of controls) assert.ok(r.x >= 0 && r.y >= 0 && r.right <= width + 1 && r.bottom <= height + 1, JSON.stringify(r));
      assert.ok(controls.find(r => r.id === 'joystick').w >= 112);
      const canvas = await b.evaluate('({w:view.getBoundingClientRect().width,h:view.getBoundingClientRect().height})');
      assert.deepEqual(canvas, { w: width, h: height });
    }
  };
  try {
    await b.navigate('games/parkour.html');
    await wait(b, 'document.body.dataset.ready === "true"');
    for (const [width, height] of [[320, 568], [568, 320], [390, 844], [844, 390], [820, 1180], [1440, 900]]) {
      await b.size(width, height, width < 1440);
      await fit(width, height, 'home');
      await click(b, '#start');
      await fit(width, height, 'levels');
      await click(b, '[data-level="sakura-1"]');
      await frames(b, 4);
      await fit(width, height, 'playing');
      const fresh = await snapshot(b);
      assert.ok(Math.abs(fresh.yaw - Math.PI / 2) < .02, 'fresh camera faces first landing');
      if (width / height < .75) assert.ok(fresh.distance >= 17, `${width}x${height}: portrait landing distance ${fresh.distance}`);
      await shot(b, `${width}x${height}-playing`);
      await click(b, '#pause');
      await click(b, '#pause-home');
      await click(b, '#editor');
      await fit(width, height, 'editor');
      await click(b, '#editor-close');
    }
    assert.deepEqual(b.errors, []);
  } finally {
    b.close();
  }
});

// Retaining old scene geometries, allocating during motion, or keeping held
// input through pause/selection must fail these repeated visitor actions.
test('twelve scene switches and sustained native movement keep resources bounded and clear inputs', { timeout: 180000 }, async () => {
  const b = await openBrowser();
  try {
    await b.size(960, 640);
    await b.navigate('games/parkour.html');
    await wait(b, 'document.body.dataset.ready === "true"');
    await click(b, '#start');
    const baseline = new Map(), samples = [];
    for (let cycle = 0; cycle < 3; cycle++) {
      for (const theme of ['sakura', 'flowers', 'city', 'cabin']) {
        await click(b, `[data-level="${theme}-1"]`);
        await frames(b);
        const first = await snapshot(b);
        assert.equal(await b.evaluate('view.dataset.theme'), theme);
        assert.ok(first.triangles > 1000 && first.calls > 10, 'actual WebGL drawing');
        const previous = baseline.get(theme);
        if (!previous) baseline.set(theme, first.resources);
        else {
          assert.ok(first.resources.geometries <= previous.geometries + 2, `${theme}: geometry leak ${JSON.stringify(first.resources)} vs ${JSON.stringify(previous)}`);
          assert.ok(first.resources.textures <= previous.textures + 1, `${theme}: texture leak`);
        }
        if (cycle === 2) await shot(b, `switch-${theme}`);
        const pausePoint = await b.evaluate('(()=>{const r=document.querySelector("#pause").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()');
        // Cache the button before holding movement: CDP query/click round trips
        // must not let the player walk off the first platform before pausing.
        await key(b, 'ArrowUp');
        for (const type of ['mousePressed', 'mouseReleased']) {
          await b.call('Input.dispatchMouseEvent', { type, ...pausePoint, button: 'left', clickCount: 1 });
        }
        const paused = await snapshot(b);
        assert.equal(paused.y, 0, `held-key pause must begin standing: ${JSON.stringify({theme,cycle,key:'ArrowUp held',paused})}`);
        assert.ok(Math.abs(paused.x) <= 1.5 && Math.abs(paused.z) <= 1.5, `held-key pause must stay inside every first platform: ${JSON.stringify({theme,cycle,key:'ArrowUp held',paused})}`);
        await sleep(250);
        assert.deepEqual(await snapshot(b), paused, 'pause freezes position, camera and resources');
        await click(b, '#resume');
        await frames(b, 4);
        const resumed = await snapshot(b);
        assert.equal(resumed.x, paused.x, `resume clears a key still held by the visitor: ${JSON.stringify({theme,cycle,key:'ArrowUp held',paused,resumed})}`);
        await key(b, 'ArrowUp', false);
        await click(b, '#pause');
        await click(b, '#quit');
        samples.push({ cycle, theme, ...first });
      }
    }
    await click(b, '[data-level="sakura-1"]');
    await frames(b);
    const before = await snapshot(b);
    const movingPositions = [];
    for (let i = 0; i < 12; i++) {
      for (const code of ['ArrowRight', 'ArrowLeft']) {
        await key(b, code);
        await sleep(180);
        movingPositions.push(await snapshot(b));
        await key(b, code, false);
      }
    }
    await frames(b, 24);
    const after = await snapshot(b);
    assert.ok(after.resources.geometries <= before.resources.geometries + 2, 'sustained movement allocates no accumulating geometries');
    assert.ok(after.resources.textures <= before.resources.textures + 1, 'sustained movement allocates no accumulating textures');
    assert.ok(movingPositions.some(p => Math.hypot(p.x - before.x, p.z - before.z) > .4), 'sustained keyboard inputs actually move the character');
    assert.match(await b.evaluate('document.querySelector("#run-info").textContent'), /^[1-9]/, 'real elapsed play advances');
    console.log('12 actual scene switches', JSON.stringify(samples));
    console.log('sustained real play resources', { before, after, maxDisplacement: Math.max(...movingPositions.map(p => Math.hypot(p.x - before.x, p.z - before.z))) });
    assert.deepEqual(b.errors, []);
  } finally {
    b.close();
  }
});
