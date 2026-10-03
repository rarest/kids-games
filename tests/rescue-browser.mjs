import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { openBrowser, sleep } from "./game-browser-harness.mjs";
const root = "/tmp/rescue-evidence/ui";
const wait = async (b, e) => {
  for (let i = 0; i < 100; i++) {
    try {
      if (await b.evaluate(e)) return;
    } catch (error) {
      // A native navigation can replace the execution context between polls.
      if (!/navigated|Execution context was destroyed/i.test(error.message))
        throw error;
    }
    await sleep(60);
  }
  assert.ok(await b.evaluate(e), e);
};
const key = (b, code, down = true) =>
  b.call("Input.dispatchKeyEvent", {
    type: down ? "keyDown" : "keyUp",
    code,
    key: code === "Space" ? " " : code,
    windowsVirtualKeyCode:
      code === "Enter" ? 13 : code === "Space" ? 32 : undefined,
    text: down
      ? code === "Enter"
        ? "\r"
        : code === "Space"
          ? " "
          : undefined
      : undefined,
  });
const click = async (b, selector) => {
  await b.evaluate(
    `document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:"nearest"})`,
  );
  const p = await b.evaluate(
    `(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`,
  );
  for (const type of ["mousePressed", "mouseReleased"])
    await b.call("Input.dispatchMouseEvent", {
      type,
      ...p,
      button: "left",
      clickCount: 1,
    });
};
const shot = async (b, name) => {
  await mkdir(root, { recursive: true });
  const r = await b.call("Page.captureScreenshot", { format: "png" });
  await writeFile(`${root}/${name}.png`, Buffer.from(r.data, "base64"));
};
const measure = async (b) => {
  const controls = await b.evaluate(
    'Array.from(document.querySelectorAll("button,a.control,[data-touch]"),e=>{const r=e.getBoundingClientRect();return {id:e.id,w:r.width,h:r.height,left:r.left,right:r.right,visible:!!(r.width&&r.height)&&getComputedStyle(e).visibility!=="hidden"}}).filter(e=>e.visible)',
  );
  assert.ok(controls.length);
  const width = await b.evaluate("innerWidth");
  for (const c of controls)
    assert.ok(
      c.w >= 48 && c.h >= 48 && c.left >= -1 && c.right <= width + 1,
      JSON.stringify(c),
    );
  assert.equal(
    await b.evaluate("document.documentElement.scrollWidth>innerWidth"),
    false,
  );
  return controls;
};
test(
  "real 3D home and play keyboard interactions, pause and cooperative players",
  { timeout: 120000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.size(1440, 900);
      await b.navigate("games/rescue.html");
      await wait(b, 'document.querySelector("#view")?.dataset.webgl==="true"');
      await shot(b, "home-desktop");
      await click(b, "#start");
      await wait(b, 'view.dataset.phase==="playing"');
      const x = Number(await b.evaluate("view.dataset.x"));
      await key(b, "KeyD");
      await wait(b, `Number(view.dataset.x)>${x + 1.6}`);
      await key(b, "KeyD", false);
      await key(b, "KeyE");
      await key(b, "KeyE", false);
      await wait(b, "Number(view.dataset.carrying)===1");
      await key(b, "KeyS");
      await wait(b, 'view.dataset.hidden==="true"');
      await key(b, "KeyS", false);
      await key(b, "Space");
      await key(b, "Space", false);
      await wait(b, "Number(view.dataset.y)>1.3");
      await key(b, "KeyE");
      await key(b, "KeyE", false);
      await wait(b, "Number(view.dataset.carrying)===0");
      await shot(b, "play-desktop");
      await key(b, "KeyD");
      await click(b, "#pause");
      const px = await b.evaluate("view.dataset.x");
      await sleep(300);
      assert.equal(await b.evaluate("view.dataset.x"), px);
      await click(b, "#resume");
      await sleep(200);
      assert.equal(await b.evaluate("view.dataset.x"), px);
      await key(b, "KeyD", false);
      await key(b, "KeyD");
      await wait(b, `Number(view.dataset.x)>${Number(px) + 0.3}`);
      await key(b, "KeyD", false);
      await click(b, "#pause");
      await click(b, "#home");
      await click(b, "#players-two");
      await click(b, "#start");
      await wait(b, 'view.dataset.players==="2"');
      const a = await b.evaluate("JSON.parse(view.dataset.positions)");
      await key(b, "KeyA");
      await key(b, "ArrowRight");
      await sleep(400);
      await key(b, "KeyA", false);
      await key(b, "ArrowRight", false);
      const c = await b.evaluate("JSON.parse(view.dataset.positions)");
      assert.ok(c[0].x < a[0].x);
      assert.ok(c[1].x > a[1].x);
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);
test(
  "six viewport home/game controls and native touch actions",
  { timeout: 180000 },
  async () => {
    const b = await openBrowser();
    try {
      for (const [w, h] of [
        [320, 568],
        [568, 320],
        [390, 844],
        [844, 390],
        [820, 1180],
        [1440, 900],
      ]) {
        await b.size(w, h, true);
        await b.navigate("games/rescue.html");
        await wait(
          b,
          'document.querySelector("#view")?.dataset.webgl==="true"',
        );
        await measure(b);
        await shot(b, `home-${w}x${h}`);
        await click(b, "#start");
        await wait(b, 'view.dataset.phase==="playing"');
        await measure(b);
        await shot(b, `game-${w}x${h}`);
      }
      await b.size(390, 844, true);
      await b.navigate("games/rescue.html");
      await click(b, "#start");
      await wait(b, 'view.dataset.phase==="playing"');
      const pos = async (selector) =>
        b.evaluate(
          `(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`,
        );
      const touch = async (type, p) =>
        b.call("Input.dispatchTouchEvent", {
          type,
          touchPoints: type === "touchEnd" ? [] : [{ ...p, id: 1 }],
        });
      const stick = await pos("#joystick"),
        x = Number(await b.evaluate("view.dataset.x"));
      await touch("touchStart", { x: stick.x + 35, y: stick.y });
      await wait(b, `Number(view.dataset.x)>${x + 1.6}`);
      await touch("touchEnd", stick);
      await touch("touchStart", await pos("#touch-action"));
      await touch("touchEnd", stick);
      await wait(b, "Number(view.dataset.carrying)===1");
      await touch("touchStart", { x: stick.x, y: stick.y + 35 });
      await wait(b, 'view.dataset.hidden==="true"');
      await touch("touchEnd", stick);
      await touch("touchStart", await pos("#touch-jump"));
      await touch("touchEnd", stick);
      await wait(b, "Number(view.dataset.y)>1.3");
      const action = await pos("#touch-action");
      await b.call("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: stick.x, y: stick.y - 35, id: 1 }],
      });
      await b.call("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [
          { x: stick.x, y: stick.y - 35, id: 1 },
          { ...action, id: 2 },
        ],
      });
      await b.call("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      await wait(b, "Number(view.dataset.carrying)===0");
      assert.ok(
        await b.evaluate(
          "JSON.parse(view.dataset.physics).objects.some(o=>o.thrown&&o.vy>0)",
        ),
        "native up direction and action throw upward",
      );
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);
test(
  "native reload area-start save, storage failure, audio and same-state resources",
  { timeout: 120000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.size(960, 640);
      await b.navigate("games/rescue.html");
      await wait(b, 'view.dataset.phase==="home"');
      await click(b, "#start");
      await wait(b, 'view.dataset.phase==="playing"');
      await wait(b, 'JSON.parse(view.dataset.audio).state==="running"');
      await key(b, "KeyD");
      await wait(b, "Number(view.dataset.x)>3.5");
      await key(b, "KeyD", false);
      await b.call("Page.reload");
      await wait(
        b,
        'document.readyState==="complete"&&view.dataset.phase==="home"',
      );
      assert.equal(
        await b.evaluate('document.querySelector("#continue").hidden'),
        false,
      );
      await click(b, "#continue");
      await wait(b, 'view.dataset.phase==="playing"');
      assert.ok(
        Math.abs(Number(await b.evaluate("view.dataset.x")) - 2.881) < 0.1,
        "reload resumes area start",
      );
      await click(b, "#pause");
      assert.equal(
        await b.evaluate("JSON.parse(view.dataset.audio).active"),
        false,
      );
      await click(b, "#home");
      await click(b, "#map-open");
      assert.equal(
        await b.evaluate(
          'document.querySelector("button[data-area=A]").disabled',
        ),
        true,
      );
      assert.equal(
        await b.evaluate(
          "document.querySelector('button[data-area=\"0\"]').disabled",
        ),
        false,
      );
      await click(b, "#map-panel .close-panel");
      const resources = [];
      for (let i = 0; i < 4; i++) {
        await click(b, "#start");
        await wait(b, 'view.dataset.phase==="playing"');
        await sleep(120);
        resources.push(
          await b.evaluate(
            "(({geometries,textures,resources,entities})=>({geometries,textures,resources,entities}))(JSON.parse(view.dataset.graphics))",
          ),
        );
        await click(b, "#pause");
        await click(b, "#home");
        await wait(b, 'view.dataset.phase==="home"');
      }
      assert.deepEqual(resources[3], resources[1]);
      await mkdir(root, { recursive: true });
      await writeFile(
        `${root}/resource-cycles.json`,
        JSON.stringify(resources, null, 2),
      );
      await b.evaluate(
        'window.__savedSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==="rescue-rangers-3d-v1")throw new DOMException("Full","QuotaExceededError");return window.__savedSet.call(this,k,v)}',
      );
      await click(b, "#options-open");
      await click(b, "#music");
      assert.match(await b.evaluate("notice.textContent"), /保存失败/);
      assert.doesNotMatch(await b.evaluate("notice.textContent"), /已保存/);
      assert.match(
        await b.evaluate('document.querySelector("#saved-label").textContent'),
        /未保存/,
      );
      await b.evaluate("Storage.prototype.setItem=window.__savedSet");
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);
test(
  "WebGL unavailable shows a readable error while help and options remain usable",
  { timeout: 60000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.call("Page.addScriptToEvaluateOnNewDocument", {
        source:
          'const nativeContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return kind.startsWith("webgl")?null:nativeContext.call(this,kind,...args)};',
      });
      await b.navigate("games/rescue.html");
      assert.match(await b.evaluate("notice.textContent"), /WebGL 2/);
      assert.equal(await b.evaluate("start.disabled"), true);
      await click(b, "#help-open");
      await click(b, "#help-panel .close-panel");
      await click(b, "#options-open");
      await click(b, "[data-quality=low]");
      assert.deepEqual(b.errors, []);
      assert.equal(
        await b.evaluate('document.querySelector("#map-open").disabled'),
        true,
      );
    } finally {
      b.close();
    }
  },
);
test(
  "standard Gamepad API fixture pauses and resumes with Start without replaying held A",
  { timeout: 60000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.size(960, 640);
      await b.navigate("games/rescue.html");
      await click(b, "#start");
      await wait(b, 'view.dataset.phase==="playing"');
      await b.evaluate(
        'window.__padButtons=[];Object.defineProperty(navigator,"getGamepads",{configurable:true,value:()=>[{index:7,connected:true,mapping:"standard",axes:[0,0],buttons:Array.from({length:17},(_,i)=>({pressed:window.__padButtons.includes(i),value:window.__padButtons.includes(i)?1:0}))}]})',
      );
      await b.evaluate("window.__padButtons=[9]");
      await wait(b, 'view.dataset.phase==="paused"');
      await b.evaluate("window.__padButtons=[]");
      await sleep(350);
      await b.evaluate("window.__padButtons=[9,0]");
      await wait(b, 'view.dataset.phase==="playing"');
      await sleep(200);
      assert.ok(
        Number(await b.evaluate("view.dataset.y")) < 1.1,
        "A held through resume must release first",
      );
      await b.evaluate("window.__padButtons=[]");
      await sleep(250);
      await b.evaluate("window.__padButtons=[0]");
      await wait(b, "Number(view.dataset.y)>1.3");
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);
test(
  "native page freeze and BFCache return discard old input and resume real loop",
  { timeout: 120000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.size(960, 640);
      await b.navigate("games/rescue.html");
      await click(b, "#start");
      await wait(b, 'view.dataset.phase==="playing"');
      await key(b, "KeyD");
      await wait(b, "Number(view.dataset.x)>3.4");
      await b.call("Page.setWebLifecycleState", { state: "frozen" });
      const before = await b.evaluate("view.dataset.x");
      await sleep(300);
      assert.equal(await b.evaluate("view.dataset.x"), before);
      assert.equal(await b.evaluate("document.hidden"), true);
      await b.call("Page.setWebLifecycleState", { state: "active" });
      await b.call("Emulation.setFocusEmulationEnabled", { enabled: true });
      await wait(b, '!document.hidden&&view.dataset.phase==="paused"');
      assert.equal(
        await b.evaluate("JSON.parse(view.dataset.audio).active"),
        false,
      );
      await key(b, "KeyD", false);
      await click(b, "#resume");
      await key(b, "Space");
      await key(b, "Space", false);
      await wait(b, "Number(view.dataset.y)>1.3");
      await click(b, "#pause");
      await click(b, "#home");
      await b.evaluate(
        'window.__rescueHistoryMarker=42;window.addEventListener("pageshow",e=>window.__rescueFromCache=e.persisted)',
      );
      await click(b, "a.control");
      await wait(b, 'location.pathname.endsWith("/index.html")');
      await b.evaluate("history.back()");
      await wait(
        b,
        'location.pathname.endsWith("/games/rescue.html")&&document.querySelector("#view")?.dataset.phase==="home"',
      );
      assert.equal(await b.evaluate("window.__rescueHistoryMarker"), 42);
      assert.equal(await b.evaluate("window.__rescueFromCache"), true);
      await click(b, "#start");
      await wait(b, 'view.dataset.phase==="playing"');
      await key(b, "Space");
      await key(b, "Space", false);
      await wait(b, "Number(view.dataset.y)>1.3");
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);
test(
  "short landscape keeps the real scene tall with readable edge touch controls",
  { timeout: 60000 },
  async () => {
    const b = await openBrowser();
    try {
      for (const [w, h] of [
        [568, 320],
        [844, 390],
        [568, 280],
      ]) {
        await b.size(w, h, true);
        await b.navigate("games/rescue.html");
        await click(b, "#start");
        await wait(b, 'view.dataset.phase==="playing"');
        const size = await b.evaluate(
          '({h:view.getBoundingClientRect().height,windowHeight:innerHeight,jump:getComputedStyle(document.querySelector("#touch-jump")).whiteSpace})',
        );
        assert.ok(size.h >= h * 0.9, JSON.stringify(size));
        assert.equal(size.jump, "nowrap");
        await measure(b);
        await shot(b, `short-game-${w}x${h}`);
        await key(b, "Space");
        await key(b, "Space", false);
        await wait(b, "Number(view.dataset.y)>1.3");
      }
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);
test(
  "home character selection keeps both recognizable partners in the live preview",
  { timeout: 60000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.size(960, 640);
      await b.navigate("games/rescue.html");
      await wait(b, 'view.dataset.phase==="home"');
      await click(b, "#dale");
      await wait(b, 'JSON.parse(view.dataset.positions)[0].character==="dale"');
      assert.equal(
        await b.evaluate("JSON.parse(view.dataset.positions)[1].character"),
        "chip",
      );
      await shot(b, "home-dale");
      await click(b, "#chip");
      await wait(b, 'JSON.parse(view.dataset.positions)[0].character==="chip"');
      assert.equal(
        await b.evaluate("JSON.parse(view.dataset.positions)[1].character"),
        "dale",
      );
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);
test(
  "home idle preview animates and rests while its options are open",
  { timeout: 60000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.size(960, 640);
      await b.navigate("games/rescue.html");
      await wait(b, 'view.dataset.phase==="home"');
      const time = Number(await b.evaluate("view.dataset.simTime"));
      await wait(b, `Number(view.dataset.simTime)>${time + 0.02}`);
      await click(b, "#options-open");
      const paused = await b.evaluate("view.dataset.simTime");
      await sleep(300);
      assert.equal(await b.evaluate("view.dataset.simTime"), paused);
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);
test(
  "real Web Audio consumes stable event IDs once and resets for a new game instance",
  { timeout: 60000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.navigate("games/rescue.html");
      await b.evaluate(
        '(async()=>{window.__audioFixture=(await import("/rescue/audio.js")).createAudio({music:false});document.querySelector("#help-open").addEventListener("click",()=>window.__audioFixture.unlock())})()',
      );
      await click(b, "#help-open");
      await wait(b, 'window.__audioFixture.diagnostics().state==="running"');
      const result = await b.evaluate(
        '(()=>{const audio=window.__audioFixture;audio.setActive(true);const state={level:{theme:"street"},events:[{id:"event-1",type:"jump"}]};audio.consume(state);const first=audio.diagnostics().voices;audio.consume(state);const repeated=audio.diagnostics().voices;state.events.push({id:"event-2",type:"throw"});audio.consume(state);const next=audio.diagnostics().voices;audio.consume({level:{theme:"bonus"},events:[{id:"event-1",type:"collect"}]});const restarted=audio.diagnostics().voices;audio.setOptions({sound:false});const muted=audio.diagnostics().voices;audio.setActive(false);const stopped=audio.diagnostics().active;audio.dispose();return {first,repeated,next,restarted,muted,stopped}})()',
      );
      assert.deepEqual(result, {
        first: 1,
        repeated: 1,
        next: 2,
        restarted: 3,
        muted: 0,
        stopped: false,
      });
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);
test(
  "normal saved run restore preserves totals and an exhausted cooperative partner",
  { timeout: 60000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.size(960, 640);
      await b.navigate("games/rescue.html");
      await b.evaluate(
        '(async()=>{const {createProfile}=await import("/rescue/profile.js");const profile=createProfile();const value=profile.load();value.options.players=2;value.run={areaId:"0",score:17000,flowers:149,stars:19,lives:[0,4],players:2,character:"chip"};if(!profile.save(value).ok)throw Error("fixture save failed")})()',
      );
      await b.call("Page.reload");
      await wait(
        b,
        'document.readyState==="complete"&&view.dataset.phase==="home"',
      );
      await click(b, "#players-one");
      await click(b, "#continue");
      await wait(b, 'view.dataset.phase==="playing"');
      const restored = await b.evaluate(
        "({score:Number(view.dataset.score),flowers:Number(view.dataset.flowers),stars:Number(view.dataset.stars),lives:JSON.parse(view.dataset.positions).map(p=>p.lives)})",
      );
      assert.deepEqual(restored, {
        score: 17000,
        flowers: 149,
        stars: 19,
        lives: [0, 4],
      });
      const x = Number(
        await b.evaluate("JSON.parse(view.dataset.positions)[1].x"),
      );
      await key(b, "ArrowRight");
      await wait(b, `JSON.parse(view.dataset.positions)[1].x>${x + 0.4}`);
      await key(b, "ArrowRight", false);
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);
test(
  "native map mode conversion preserves surviving lives, totals, selected character and reload continuation",
  { timeout: 120000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.size(960, 640);
      await b.navigate("games/rescue.html");
      for (const fixture of [
        { lives: [0, 2], players: 2, selected: 1, want: [2], moving: 0 },
        { lives: [1, 2], players: 2, selected: 1, want: [1], moving: 0 },
        { lives: [0, 2], players: 2, selected: 2, want: [0, 2], moving: 1 },
        { lives: [2], players: 1, selected: 2, want: [2, 3], moving: 0 },
      ]) {
        await b.evaluate(
          `(async()=>{const {createProfile}=await import("/rescue/profile.js");const p=createProfile();if(!p.save({campaign:{completed:["0","B"],current:"D"},options:{players:${fixture.players},quality:"low",music:false},run:{areaId:"D",score:2000,flowers:3,stars:2,lives:${JSON.stringify(fixture.lives)},players:${fixture.players},character:"chip"}}).ok)throw Error("fixture save failed")})()`,
        );
        await b.call("Page.reload");
        await wait(b, 'view.dataset.phase==="home"');
        await click(
          b,
          fixture.selected === 1 ? "#players-one" : "#players-two",
        );
        await click(b, "#dale");
        await click(b, "#map-open");
        await click(b, "button[data-area=D]");
        await wait(
          b,
          'view.dataset.area==="D"&&view.dataset.phase==="playing"',
        );
        const expected = {
          score: 2000,
          flowers: 3,
          stars: 2,
          lives: fixture.want,
          character: "dale",
        };
        const values =
          "({score:Number(view.dataset.score),flowers:Number(view.dataset.flowers),stars:Number(view.dataset.stars),lives:JSON.parse(view.dataset.positions).map(p=>p.lives),character:JSON.parse(view.dataset.positions)[0].character})";
        assert.deepEqual(
          await b.evaluate(values),
          expected,
          JSON.stringify(fixture),
        );
        assert.equal(
          await b.evaluate(
            `JSON.parse(view.dataset.positions)[${fixture.moving}].hearts`,
          ),
          3,
        );
        const x = Number(
          await b.evaluate(
            `JSON.parse(view.dataset.positions)[${fixture.moving}].x`,
          ),
        );
        const code = fixture.moving ? "ArrowRight" : "KeyD";
        await key(b, code);
        await wait(
          b,
          `JSON.parse(view.dataset.positions)[${fixture.moving}].x>${x + 0.4}`,
        );
        await key(b, code, false);
        const stored = await b.evaluate(
          '(async()=> (await import("/rescue/profile.js")).createProfile().load())()',
        );
        assert.deepEqual(stored.run, {
          areaId: "D",
          score: 2000,
          flowers: 3,
          stars: 2,
          lives: fixture.want,
          players: fixture.selected,
          character: "dale",
        });
        await b.call("Page.reload");
        await wait(b, 'view.dataset.phase==="home"');
        await click(b, "#continue");
        await wait(
          b,
          'view.dataset.area==="D"&&view.dataset.phase==="playing"',
        );
        assert.deepEqual(await b.evaluate(values), expected);
      }
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);
test(
  "native keyboard activates home choices and start, then switches to game bindings",
  { timeout: 60000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.navigate("games/rescue.html");
      await wait(b, 'view.dataset.phase==="home"');
      await b.evaluate('document.querySelector("#players-two").focus()');
      await key(b, "Enter");
      await key(b, "Enter", false);
      assert.equal(
        await b.evaluate(
          'document.querySelector("#players-two").getAttribute("aria-pressed")',
        ),
        "true",
      );
      await b.evaluate('document.querySelector("#start").focus()');
      await key(b, "Space");
      await key(b, "Space", false);
      await wait(
        b,
        'view.dataset.phase==="playing"&&view.dataset.players==="2"',
      );
      await key(b, "Enter");
      await key(b, "Enter", false);
      await wait(b, "JSON.parse(view.dataset.positions)[1].y>1.3");
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);
test(
  "terminal production events finish real Web Audio once and hard pause stops voices",
  { timeout: 60000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.navigate("games/rescue.html");
      await b.evaluate(
        '(async()=>{window.__terminalAudio=(await import("/rescue/audio.js")).createAudio({music:false});document.querySelector("#help-open").addEventListener("click",()=>window.__terminalAudio.unlock())})()',
      );
      await click(b, "#help-open");
      await wait(b, 'window.__terminalAudio.diagnostics().state==="running"');
      const first = await b.evaluate(
        '(async()=>{const {createGame,stepGame,finishBonus}=await import("/rescue/core.js");const {getLevel}=await import("/rescue/levels.js");const level=getLevel("C");const s=createGame({...level,exit:{...level.spawn}});stepGame(s,[{}],1/60);const a=window.__terminalAudio;a.consume(s);finishBonus(s);window.__terminalState=s;a.setActive(true);a.consume(s);a.setActive(false,{finishEffects:true});const before=a.diagnostics();a.consume(s);return {before,after:a.diagnostics(),events:s.events.map(e=>e.type)}})()',
      );
      assert.ok(
        first.events.includes("clear"),
        "production finishBonus emits clear",
      );
      assert.equal(
        first.before.voices,
        1,
        "terminal oscillator must remain scheduled after menu opens",
      );
      assert.equal(first.after.voices, 1, "same clear event must not replay");
      await sleep(650);
      assert.equal(
        await b.evaluate("__terminalAudio.diagnostics().voices"),
        0,
        "real oscillator onended clears the voice naturally",
      );
      const stop = await b.evaluate(
        '(()=>{const a=__terminalAudio;a.setActive(true);a.consume({level:{theme:"street"},events:[{id:"event-1",type:"lifeLost"}]});const before=a.diagnostics().voices;a.setActive(false);return {before,after:a.diagnostics().voices}})()',
      );
      assert.deepEqual(stop, { before: 1, after: 0 });
      await b.evaluate("__terminalAudio.dispose()");
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);

// Native controls only. Geometry is observed from the running page; no game state setters.
const clampRoute = (n, a, b) => Math.max(a, Math.min(b, n));
function nativeRoute(platforms, from, exit) {
  const queue = [[from]],
    seen = new Set([from.id]);
  while (queue.length) {
    const path = queue.shift(),
      a = path.at(-1);
    if (exit.x >= a.x && exit.x <= a.x + a.w && Math.abs(exit.y - a.y) < 0.2)
      return path;
    for (const b of platforms) {
      const rise = b.y - a.y,
        d = 196 - 56 * rise;
      const gap = Math.max(0, b.x - a.x - a.w, a.x - b.x - b.w);
      if (
        !seen.has(b.id) &&
        rise <= 3.5 &&
        rise >= -9 &&
        d >= 0 &&
        gap < (7.2 * (14 + Math.sqrt(d))) / 28 - 0.15
      ) {
        seen.add(b.id);
        queue.push([...path, b]);
      }
    }
  }
  return null;
}
async function nativeCompleteC(b) {
  const level = await b.evaluate(
    '(async()=> (await import("/rescue/levels.js")).getLevel("C"))()',
  );
  let plan = null,
    previousTime = -1,
    previousJump = false,
    previousAction = false,
    lastLog = -10,
    previousLives = 3;
  const held = new Set(),
    trace = [];
  async function apply(input) {
    const wanted = new Set();
    if (input.move < 0) wanted.add("KeyA");
    if (input.move > 0) wanted.add("KeyD");
    if (input.jump) wanted.add("Space");
    if (input.action) wanted.add("KeyE");
    for (const code of held)
      if (!wanted.has(code)) {
        await key(b, code, false);
        held.delete(code);
      }
    for (const code of wanted)
      if (!held.has(code)) {
        await key(b, code);
        held.add(code);
      }
  }
  const started = Date.now();
  try {
    while (Date.now() - started < 600000) {
      const live = await b.evaluate(
        "({phase:view.dataset.phase,time:Number(view.dataset.simTime),p:JSON.parse(view.dataset.positions)[0],physics:JSON.parse(view.dataset.physics),score:Number(view.dataset.score)})",
      );
      if (live.phase !== "playing") return { live, trace };
      if (live.time === previousTime) {
        await sleep(10);
        continue;
      }
      previousTime = live.time;
      const { p, physics: s } = live;
      if (p.lives !== previousLives) {
        plan = null;
        previousLives = p.lives;
      }
      if (live.time - lastLog >= 2) {
        const entry = {
          t: live.time,
          x: p.x,
          y: p.y,
          ground: p.groundId,
          lives: p.lives,
          hearts: p.hearts,
          score: live.score,
        };
        trace.push(entry);
        console.log("C native", JSON.stringify(entry));
        lastLog = live.time;
      }
      const platforms = [
        ...s.platforms,
        ...s.objects
          .filter(
            (o) =>
              o.active &&
              !o.heldBy &&
              !o.thrown &&
              o.grounded &&
              o.kind !== "ball",
          )
          .map((o) => ({
            id: o.id,
            x: o.x - o.w / 2,
            y: o.y + o.h,
            w: o.w,
            h: o.h,
            oneWay: false,
          })),
      ];
      let input = { move: 0 };
      if (plan?.mode === "air") {
        plan.next = platforms.find((m) => m.id === plan.next.id) ?? plan.next;
        plan.landing = clampRoute(
          plan.landing,
          plan.next.x + 0.9,
          plan.next.x + plan.next.w - 0.9,
        );
        const clear =
          !plan.next.oneWay &&
          plan.next.y > plan.current.y + 0.1 &&
          p.vy > 0 &&
          p.y < plan.next.y + 0.05;
        input.move = clear
          ? 0
          : Math.abs(plan.landing - p.x) < 0.1
            ? 0
            : Math.sign(plan.landing - p.x);
        if (p.grounded && live.time > plan.jumpAt + 0.1) plan = null;
      }
      if (!plan && p.grounded) {
        const current = platforms.find((m) => m.id === p.groundId);
        if (current) {
          const path = nativeRoute(platforms, current, level.exit);
          assert.ok(path, `route from actual support ${current.id}`);
          if (path.length === 1)
            plan = { mode: "exit", current, target: level.exit.x };
          else {
            const next = path[1],
              margin = Math.min(
                current.kind === "moving" ? 1 : 0.65,
                current.w / 3,
              ),
              leftBound = current.x + margin,
              rightBound = current.x + current.w - margin;
            const left = Math.max(leftBound, next.x + 0.65),
              right = Math.min(rightBound, next.x + next.w - 0.65);
            let launch =
              left <= right
                ? clampRoute(p.x, left, right)
                : next.x > current.x
                  ? rightBound
                  : leftBound;
            if (!next.oneWay && next.y > current.y + 0.1) {
              const before = next.x - 0.55,
                after = next.x + next.w + 0.55;
              if (before >= leftBound && before <= rightBound) launch = before;
              else if (after >= leftBound && after <= rightBound)
                launch = after;
            }
            for (const ceiling of platforms.filter(
              (m) =>
                !m.oneWay &&
                m.id !== current.id &&
                m.y > current.y + 1.3 &&
                m.y < current.y + 4.8,
            )) {
              if (
                launch + 0.4 > ceiling.x &&
                launch - 0.4 < ceiling.x + ceiling.w
              ) {
                const before = ceiling.x - 0.65,
                  after = ceiling.x + ceiling.w + 0.65;
                if (before >= leftBound && before <= rightBound)
                  launch = before;
                else if (after >= leftBound && after <= rightBound)
                  launch = after;
              }
            }
            plan = {
              mode: "walk",
              current,
              next,
              target: clampRoute(launch, leftBound, rightBound),
            };
          }
        }
      }
      if (plan?.mode === "walk" || plan?.mode === "exit") {
        plan.current =
          platforms.find((m) => m.id === plan.current.id) ?? plan.current;
        if (plan.next)
          plan.next = platforms.find((m) => m.id === plan.next.id) ?? plan.next;
        if (plan.mode === "walk") {
          const margin = Math.min(
            plan.current.kind === "moving" ? 1 : 0.65,
            plan.current.w / 3,
          );
          plan.target = clampRoute(
            plan.target,
            plan.current.x + margin,
            plan.current.x + plan.current.w - margin,
          );
        }
        if (p.grounded && p.groundId !== plan.current.id) {
          plan = null;
          input.move = 0;
        } else {
          input.move =
            Math.abs(p.x - plan.target) < 0.1
              ? 0
              : Math.sign(plan.target - p.x);
          if (
            plan.mode === "walk" &&
            p.grounded &&
            Math.abs(p.x - plan.target) < 0.2 &&
            !previousJump
          ) {
            const { current, next } = plan;
            let landing = clampRoute(p.x, next.x + 0.7, next.x + next.w - 0.7);
            if (next.y <= current.y + 0.15) {
              if (next.x + next.w > current.x + current.w)
                landing = Math.max(landing, current.x + current.w + 0.65);
              else if (next.x < current.x)
                landing = Math.min(landing, current.x - 0.65);
            }
            plan = { mode: "air", current, next, landing, jumpAt: live.time };
            input = { move: 0, jump: true };
          }
        }
      }
      const foe = s.enemies.find(
        (e) =>
          e.alive && Math.abs(e.y - p.y) < 2.5 && Math.abs(e.x - p.x) < 4.2,
      );
      const carried = s.objects.find((o) => o.id === p.carrying?.id);
      const near = s.objects.find(
        (o) =>
          o.active &&
          !o.heldBy &&
          ["crate", "metal"].includes(o.kind) &&
          Math.abs(o.x - p.x) < 1.4 &&
          Math.abs(o.y - p.y) < 1.4,
      );
      const big = s.objects.find(
        (o) =>
          o.active &&
          o.kind === "bigcrate" &&
          Math.abs(o.x - p.x) < 4 &&
          Math.abs(o.y - p.y) < 1.5,
      );
      if (!previousAction && ((carried && (foe || big)) || (!carried && near)))
        input.action = true;
      const direction = Math.sign(input.move || 0);
      const hazard = s.hazards.find(
        (h) =>
          h.period &&
          p.y < h.y + h.h &&
          p.y + 1.25 > h.y &&
          Math.abs(h.x - p.x) < h.w / 2 + 1.4 &&
          direction * (h.x - p.x) > 0.1,
      );
      if (hazard && p.grounded) {
        const phase = (live.time + (hazard.offset ?? 0)) % hazard.period;
        const distance = Math.abs(hazard.x - p.x) + hazard.w / 2 + 0.7;
        if (
          phase < (hazard.activeFor ?? hazard.period / 2) ||
          hazard.period - phase < distance / 7.2 + 0.12
        ) {
          input.move = 0;
          input.jump = false;
        }
      }
      if (
        p.grounded &&
        !previousJump &&
        ((foe && Math.abs(foe.x - p.x) < 1.8) ||
          s.projectiles.some(
            (q) =>
              Math.abs(
                q.x + q.vx * 0.18 - p.x - (input.move || 0) * 7.2 * 0.18,
              ) < 1.1 &&
              q.y + q.vy * 0.18 < p.y + 1.4 &&
              q.y + q.vy * 0.18 + q.h > p.y,
          ))
      )
        input.jump = true;
      await apply(input);
      previousJump = !!input.jump;
      previousAction = !!input.action;
    }
    assert.fail("native C route exceeded 10 minutes");
  } finally {
    for (const code of held) await key(b, code, false);
    await mkdir(root, { recursive: true });
    await writeFile(
      `${root}/native-C-route.json`,
      JSON.stringify(trace, null, 2),
    );
  }
}
test(
  "native authored C traversal, real bonus, completion unlocks D and reload preserves progress and best score",
  { timeout: 720000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.size(568, 320);
      await b.navigate("games/rescue.html");
      // Prerequisite fixture: validated normal region entrance, not a mid-region save.
      await b.evaluate(
        '(async()=>{const {createProfile}=await import("/rescue/profile.js");const p=createProfile(),v=p.load();v.campaign={completed:["0","A"],current:"C"};v.options.quality="low";v.options.music=false;v.run={areaId:"C",score:0,flowers:0,stars:0,lives:[3],players:1,character:"chip"};if(!p.save(v).ok)throw Error("prerequisite fixture rejected")})()',
      );
      await b.call("Page.reload");
      await wait(b, 'view.dataset.phase==="home"');
      await click(b, "#map-open");
      assert.equal(
        await b.evaluate(
          'document.querySelector("button[data-area=D]").disabled',
        ),
        true,
      );
      await click(b, "#map-panel .close-panel");
      await click(b, "#continue");
      await wait(b, 'view.dataset.area==="C"&&view.dataset.phase==="playing"');
      const spawn = await b.evaluate(
        "({x:Number(view.dataset.x),y:Number(view.dataset.y),entities:JSON.parse(view.dataset.graphics).liveEntities})",
      );
      assert.ok(Math.abs(spawn.x - 4.217) < 0.1);
      assert.ok(Math.abs(spawn.y - 1) < 0.1);
      const result = await nativeCompleteC(b);
      assert.equal(result.live.phase, "bonus", JSON.stringify(result.live));
      await shot(b, "native-C-bonus");
      const flowers = Number(await b.evaluate("view.dataset.flowers"));
      await key(b, "KeyD");
      await wait(b, `Number(view.dataset.flowers)>${flowers}`);
      await key(b, "KeyD", false);
      assert.equal(await b.evaluate("view.dataset.level"), "bonus-C");
      await click(b, "#bonus-finish");
      await wait(b, 'view.dataset.phase==="complete"');
      const terminal = await b.evaluate("JSON.parse(view.dataset.audio)");
      assert.equal(terminal.effects.clear, 1);
      assert.equal(terminal.active, false);
      assert.ok(
        terminal.voices > 0,
        "main page preserves its real clear oscillator",
      );
      await sleep(650);
      assert.equal(
        await b.evaluate("JSON.parse(view.dataset.audio).voices"),
        0,
      );
      assert.equal(
        await b.evaluate("JSON.parse(view.dataset.audio).effects.clear"),
        1,
      );
      await shot(b, "native-C-complete");
      const totals = await b.evaluate(
        "({score:Number(view.dataset.score),flowers:Number(view.dataset.flowers),stars:Number(view.dataset.stars),lives:JSON.parse(view.dataset.positions).map(p=>p.lives)})",
      );
      assert.ok(totals.score > 0);
      assert.ok(totals.flowers > 0);
      await click(b, "#next-area");
      await shot(b, "native-C-unlocked-map");
      await click(b, "#map-panel .close-panel");
      await wait(b, 'view.dataset.phase==="complete"&&!document.querySelector("#complete-panel").hidden');
      assert.equal(await b.evaluate("JSON.parse(view.dataset.audio).effects.clear"), 1);
      assert.deepEqual(await b.evaluate("({score:Number(view.dataset.score),flowers:Number(view.dataset.flowers),stars:Number(view.dataset.stars),lives:JSON.parse(view.dataset.positions).map(p=>p.lives)})"), totals);
      await click(b, "#next-area");
      await wait(b, 'view.dataset.phase==="map"');
      assert.equal(
        await b.evaluate(
          'document.querySelector("button[data-area=D]").disabled',
        ),
        false,
      );
      assert.match(
        await b.evaluate(
          'document.querySelector("button[data-area=C]").getAttribute("aria-label")',
        ),
        /已完成/,
      );
      await b.evaluate(
        'document.querySelector("button[data-area=D]").scrollIntoView({block:"center"})',
      );
      await click(b, "button[data-area=D]");
      await wait(b, 'view.dataset.area==="D"&&view.dataset.phase==="playing"');
      await shot(b, "native-next-D");
      assert.deepEqual(
        await b.evaluate(
          "({score:Number(view.dataset.score),flowers:Number(view.dataset.flowers),stars:Number(view.dataset.stars),lives:JSON.parse(view.dataset.positions).map(p=>p.lives)})",
        ),
        totals,
      );
      await click(b, "#pause");
      await click(b, "#paused-options");
      await click(b, "#options-panel .close-panel");
      await wait(b, 'view.dataset.phase==="paused"&&document.querySelector("#complete-panel").hidden');
      await click(b, "#resume");
      await wait(b, 'view.dataset.phase==="playing"');
      await b.call("Page.reload");
      await wait(b, 'view.dataset.phase==="home"');
      assert.match(
        await b.evaluate('document.querySelector("#best-score").textContent'),
        new RegExp(String(totals.score)),
      );
      await click(b, "#continue");
      await wait(b, 'view.dataset.area==="D"&&view.dataset.phase==="playing"');
      await shot(b, "native-D-reloaded");
      assert.deepEqual(
        await b.evaluate(
          "({score:Number(view.dataset.score),flowers:Number(view.dataset.flowers),stars:Number(view.dataset.stars),lives:JSON.parse(view.dataset.positions).map(p=>p.lives)})",
        ),
        totals,
      );
      assert.ok(
        await b.evaluate('JSON.parse(view.dataset.completed).includes("C")'),
      );
      await click(b, "#pause");
      await click(b, "#home");
      for (const name of ["help", "options"]) {
        await click(b, `#${name}-open`);
        await click(b, `#${name}-panel .close-panel`);
        await wait(b, 'view.dataset.phase==="home"&&document.querySelector("#complete-panel").hidden');
      }
      await click(b, "#start");
      await wait(b, 'view.dataset.area==="0"&&view.dataset.phase==="playing"');
      assert.equal(await b.evaluate("Number(view.dataset.score)"), 0);
      await click(b, "#pause");
      await click(b, "#paused-options");
      await click(b, "#options-panel .close-panel");
      await wait(b, 'view.dataset.phase==="paused"&&document.querySelector("#complete-panel").hidden');
      await click(b, "#retry");
      await wait(b, 'view.dataset.phase==="playing"');
      await b.call("Page.reload");
      await wait(b, 'view.dataset.phase==="home"');
      assert.match(
        await b.evaluate('document.querySelector("#best-score").textContent'),
        new RegExp(String(totals.score)),
      );
      const persisted = await b.evaluate(
        '(async()=> (await import("/rescue/profile.js")).createProfile().load())()',
      );
      assert.equal(persisted.bestScore, totals.score);
      assert.equal(persisted.run.score, 0);
      assert.ok(persisted.campaign.completed.includes("C"));
      await writeFile(
        `${root}/native-C-result.json`,
        JSON.stringify(
          {
            prerequisite: { completed: ["0", "A"], entrance: "C", lives: [3] },
            spawn,
            totals,
            persisted,
            errors: b.errors,
          },
          null,
          2,
        ),
      );
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);

// Additional playtest regressions use real native inputs and actual WebGL loss.
test("native GPU context loss pauses physics and restores without replaying held movement", { timeout: 6e4 }, async () => {
  const b = await openBrowser();
  try {
    await b.size(960, 640);
    await b.navigate("games/rescue.html");
    await click(b, "#start");
    await wait(b, 'view.dataset.phase==="playing"');
    await key(b, "KeyD");
    await wait(b, "Number(view.dataset.x)>3.5");
    await b.evaluate('window.__loss=view.getContext("webgl2").getExtension("WEBGL_lose_context");__loss.loseContext()');
    await wait(b, "JSON.parse(view.dataset.graphics).contextLost===true");
    assert.equal(await b.evaluate("view.dataset.phase"), "paused");
    const frozen = await b.evaluate("({t:view.dataset.simTime,positions:JSON.parse(view.dataset.positions)})");
    await sleep(350);
    assert.deepEqual(await b.evaluate("({t:view.dataset.simTime,positions:JSON.parse(view.dataset.positions)})"), frozen);
    await b.evaluate("__loss.restoreContext()");
    await wait(b, "JSON.parse(view.dataset.graphics).webgl===true&&!JSON.parse(view.dataset.graphics).contextLost");
    assert.equal(await b.evaluate("view.dataset.phase"), "paused");
    await shot(b, "playtest-context-restored");
    await click(b, "#resume");
    await sleep(250);
    assert.equal(Number(await b.evaluate("view.dataset.x")), frozen.positions[0].x);
    await key(b, "KeyD", false);
    await key(b, "KeyD");
    await wait(b, `Number(view.dataset.x)>${frozen.positions[0].x + 0.4}`);
    await key(b, "KeyD", false);
    assert.deepEqual(b.errors, []);
  } finally {
    b.close();
  }
});
test("native bonus teammate revival stays inside the reward room until its normal exit", { timeout: 6e5 }, async () => {
  const b = await openBrowser();
  try {
    await b.size(568, 320);
    await b.navigate("games/rescue.html");
    await b.evaluate('(async()=>{const {createProfile}=await import("/rescue/profile.js");const p=createProfile(),v=p.load();v.campaign={completed:["0","A"],current:"C"};v.options.quality="low";v.options.music=false;v.options.players=2;v.run={areaId:"C",score:9000,flowers:48,stars:9,lives:[3,0],players:2,character:"chip"};if(!p.save(v).ok)throw Error("fixture rejected")})()');
    await b.call("Page.reload");
    await wait(b, 'view.dataset.phase==="home"');
    await click(b, "#continue");
    const route = await nativeCompleteC(b);
    assert.equal(route.live.phase, "bonus");
    assert.equal(Number(await b.evaluate("view.dataset.stars")), 9);
    assert.equal(await b.evaluate("JSON.parse(view.dataset.positions)[1].lives"), 0);
    await key(b, "KeyD");
    await wait(b, "Number(view.dataset.stars)===10");
    await key(b, "KeyD", false);
    assert.equal(await b.evaluate("view.dataset.phase"), "bonus", "extra life must not prematurely complete the reward room");
    const revived = await b.evaluate("JSON.parse(view.dataset.positions)[1]");
    assert.equal(revived.lives, 1);
    assert.equal(revived.hearts, 3);
    assert.ok(revived.x >= 0 && revived.x < 24);
    await sleep(150);
    assert.equal(await b.evaluate("JSON.parse(view.dataset.positions)[1].groundId"), "bonus-floor");
    await shot(b, "playtest-bonus-revived");
    await key(b, "KeyD");
    for (let i = 0; i < 400 && await b.evaluate("view.dataset.phase") !== "complete"; i++) await sleep(50);
    await key(b, "KeyD", false);
    assert.equal(await b.evaluate("view.dataset.phase"), "complete");
    assert.ok(Number(await b.evaluate("view.dataset.flowers")) > 50);
    assert.deepEqual(b.errors, []);
  } finally {
    b.close();
  }
});
