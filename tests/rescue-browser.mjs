import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { openBrowser, sleep } from "./game-browser-harness.mjs";
const root = "/tmp/rescue-evidence/ui";
const wait = async (b, e) => {
  for (let i = 0; i < 100; i++) {
    if (await b.evaluate(e)) return;
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
      await touch("touchStart", await pos("#touch-jump"));
      await touch("touchEnd", stick);
      await wait(b, "Number(view.dataset.y)>1.3");
      await touch("touchStart", await pos("#touch-action"));
      await touch("touchEnd", stick);
      await wait(b, "Number(view.dataset.carrying)===0");
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
