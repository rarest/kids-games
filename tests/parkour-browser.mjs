import test from "node:test";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { openBrowser, sleep } from "./game-browser-harness.mjs";

const wait = async (b, expression) => {
  for (let i = 0; i < 100; i++) {
    const value = await b.evaluate(expression);
    if (value) return value;
    await sleep(80);
  }
  assert.ok(
    await b.evaluate(expression),
    expression +
      ": " +
      JSON.stringify(
        await b.evaluate('({...document.querySelector("#view")?.dataset})'),
      ),
  );
};
const key = (b, code, down = true) =>
  b.call("Input.dispatchKeyEvent", {
    type: down ? "keyDown" : "keyUp",
    key: code === "Space" ? " " : code,
    code,
  });
const click = async (b, x, y) => {
  await b.call("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x,
    y,
    button: "left",
    clickCount: 1,
  });
  await b.call("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x,
    y,
    button: "left",
    clickCount: 1,
  });
};
const shot = async (b, name) => {
  const r = await b.call("Page.captureScreenshot", { format: "png" });
  await writeFile(`/tmp/parkour-${name}.png`, Buffer.from(r.data, "base64"));
};

test(
  "mute pointer click preserves playing keyboard movement and jump",
  { timeout: 60000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.size(960, 640);
      await b.navigate("games/parkour.html");
      await b.evaluate(
        'start.click();document.querySelector("[data-level=sakura-1]").click()',
      );
      const mutePosition = await b.evaluate(
        "(()=>{const r=mute.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()",
      );
      await click(b, mutePosition.x, mutePosition.y);
      const before = Number(await b.evaluate("view.dataset.x"));
      await key(b, "ArrowUp");
      await sleep(350);
      await key(b, "ArrowUp", false);
      assert.ok(
        Number(await b.evaluate("view.dataset.x")) > before + 0.4,
        "native direction key still moves after clicking mute",
      );
      await key(b, "Space");
      await wait(b, "Number(view.dataset.y)>.4");
      await key(b, "Space", false);
      assert.equal(
        await b.evaluate('mute.getAttribute("aria-pressed")'),
        "true",
        "Space jumps rather than reactivating the mute button",
      );
      await b.evaluate("pause.click()");
      await click(b, mutePosition.x, mutePosition.y);
      assert.notEqual(
        await b.evaluate("document.activeElement.id"),
        "view",
        "paused controls do not focus through the modal",
      );
      assert.equal(await b.evaluate("view.dataset.mode"), "paused");
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);

for (const failedKey of ["glow-parkour-wardrobe-v1", "glow-parkour-v1"]) {
  test(
    `scoped review: outfit purchase rolls back when ${failedKey} cannot save`,
    { timeout: 60000 },
    async () => {
      const b = await openBrowser();
      try {
        await b.size(640, 480);
        await b.navigate("games/parkour.html");
        await b.evaluate(
          'localStorage.setItem("glow-parkour-v1",JSON.stringify({coins:2,owned:["red"],equipped:"red",progress:{}}))',
        );
        await b.navigate("games/parkour.html");
        await b.evaluate(
          `window.__nativeSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===${JSON.stringify(failedKey)})throw new DOMException('Quota full','QuotaExceededError');return window.__nativeSetItem.call(this,k,v);};shop.click();document.querySelector('[data-shop-tab=outfits]').click();document.querySelector('button[data-outfit=academy]').click();`,
        );
        assert.match(
          await b.evaluate('document.querySelector("#status").textContent'),
          /保存失败/,
        );
        await b.evaluate("Storage.prototype.setItem=window.__nativeSetItem");
        await b.navigate("games/parkour.html");
        assert.equal(
          await b.evaluate("coins.textContent"),
          "2",
          "failed purchase cannot durably debit the wallet",
        );
        assert.equal(
          await b.evaluate("view.dataset.outfit"),
          "",
          "failed purchase cannot grant a free equipped outfit",
        );
        assert.equal(
          await b.evaluate(
            'JSON.parse(localStorage.getItem("glow-parkour-wardrobe-v1")||"null")?.owned?.includes("academy")??false',
          ),
          false,
        );
        await b.evaluate(
          'shop.click();document.querySelector("[data-shop-tab=outfits]").click();document.querySelector("button[data-outfit=academy]").click()',
        );
        await b.navigate("games/parkour.html");
        assert.equal(
          await b.evaluate("coins.textContent"),
          "0",
          "a subsequent successful purchase debits exactly once",
        );
        assert.equal(
          await b.evaluate("view.dataset.outfit"),
          "academy",
          "successful retry survives reload",
        );
        assert.deepEqual(b.errors, []);
      } finally {
        b.close();
      }
    },
  );
}

test(
  "scoped review: BFCache history return preserves a working jump loop",
  { timeout: 60000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.size(640, 480);
      await b.navigate("games/parkour.html");
      await b.evaluate(
        'window.__historyMarker=42;window.addEventListener("pageshow",e=>window.__restoredFromCache=e.persisted)',
      );
      const position = await b.evaluate(
        '(()=>{const r=document.querySelector(".brand").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()',
      );
      await click(b, position.x, position.y);
      await wait(b, 'location.pathname.endsWith("/index.html")');
      await b.evaluate("history.back()");
      await wait(
        b,
        'location.pathname.endsWith("/games/parkour.html") && document.body.dataset.ready === "true"',
      );
      assert.equal(
        await b.evaluate("window.__historyMarker"),
        42,
        "same document restored rather than reloaded",
      );
      assert.equal(
        await b.evaluate("window.__restoredFromCache"),
        true,
        "native persisted pageshow observed",
      );
      await click(b, 520, 250);
      await wait(b, "Number(view.dataset.y)>.4");
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);

test(
  "scoped review: every touch button is at least 48px and fits narrow viewports",
  { timeout: 60000 },
  async () => {
    const b = await openBrowser();
    const verify = async (width) => {
      const buttons = await b.evaluate(
        'Array.from(document.querySelectorAll("button")).filter(b=>b.getClientRects().length).map(b=>{const r=b.getBoundingClientRect();return {id:b.id||b.textContent.trim(),x:r.x,right:r.right,w:r.width,h:r.height};})',
      );
      for (const r of buttons) {
        assert.ok(r.w >= 48 && r.h >= 48, JSON.stringify(r));
        assert.ok(r.x >= -1 && r.right <= width + 1, JSON.stringify(r));
      }
      assert.ok(
        await b.evaluate("document.documentElement.scrollWidth <= innerWidth"),
      );
    };
    try {
      await b.size(390, 844, true);
      await b.navigate("games/parkour.html");
      for (const [width, height] of [
        [320, 568],
        [568, 320],
        [390, 844],
        [844, 390],
      ]) {
        await b.size(width, height, true);
        await verify(width);
        await b.evaluate(
          'start.click();document.querySelector("[data-level=sakura-1]").click()',
        );
        await verify(width);
        await b.evaluate(
          'pause.click();document.querySelector("#pause-home").click();editor.click()',
        );
        await verify(width);
        await b.evaluate('document.querySelector("#editor-close").click()');
      }
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);

test(
  "audio unlock creates native context only after interaction and follows mute and pause",
  { timeout: 60000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.call("Page.addScriptToEvaluateOnNewDocument", {
        source:
          "window.__nativeAudioContexts=[];const Native=window.AudioContext;window.AudioContext=new Proxy(Native,{construct(target,args){const context=Reflect.construct(target,args);window.__nativeAudioContexts.push(context);return context;}});",
      });
      await b.size(640, 480);
      await b.navigate("games/parkour.html");
      assert.equal(
        await b.evaluate("window.__nativeAudioContexts.length"),
        0,
        "initial homepage does not initialize audio",
      );
      await click(b, 520, 250);
      await sleep(100);
      assert.equal(await b.evaluate("window.__nativeAudioContexts.length"), 1);
      assert.equal(
        await b.evaluate("window.__nativeAudioContexts[0].state"),
        "running",
      );
      await b.evaluate("mute.click()");
      await sleep(100);
      assert.equal(
        await b.evaluate("window.__nativeAudioContexts[0].state"),
        "suspended",
      );
      await b.evaluate(
        'mute.click();start.click();document.querySelector("[data-level=sakura-1]").click();pause.click()',
      );
      await sleep(100);
      assert.equal(
        await b.evaluate("window.__nativeAudioContexts[0].state"),
        "suspended",
      );
      await b.evaluate("resume.click()");
      await sleep(100);
      assert.equal(
        await b.evaluate("window.__nativeAudioContexts[0].state"),
        "running",
      );
      assert.equal(await b.evaluate("window.__nativeAudioContexts.length"), 1);
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);

test(
  "real 3D parkour: pointer/keyboard movement, pause, shop persistence, editing and bounded scene resources",
  { timeout: 180000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.size(1440, 900);
      await b.navigate("games/parkour.html");
      await wait(b, 'document.body.dataset.ready === "true"');
      assert.equal(await b.evaluate("document.body.dataset.ready"), "true");
      assert.ok(
        Number(await b.evaluate("view.dataset.triangles")) > 1000,
        "real geometric scene rendered",
      );
      await shot(b, "home");
      await click(b, 950, 450);
      await wait(b, "Number(view.dataset.y) > .4");
      assert.ok(
        Number(await b.evaluate("view.dataset.y")) > 0.4,
        "home character jumps on released pointer",
      );
      await b.size(960, 640);
      await sleep(1000);
      await b.evaluate('document.querySelector("#start").click()');
      assert.equal(
        await b.evaluate('document.querySelectorAll("[data-level]").length'),
        12,
      );
      await b.evaluate(
        'document.querySelector("[data-level=sakura-1]").click()',
      );
      await wait(b, 'view.dataset.mode === "playing"');
      const initial = await b.evaluate(
        "({x:Number(view.dataset.x),z:Number(view.dataset.z)})",
      );
      await key(b, "ArrowUp");
      await wait(b, `Number(view.dataset.x) > ${initial.x + 0.5}`);
      await key(b, "ArrowUp", false);
      await sleep(120);
      assert.ok(
        Number(await b.evaluate("view.dataset.x")) > initial.x + 0.4,
        "camera-relative keyboard moves character",
      );
      assert.ok(
        Number(await b.evaluate("view.dataset.grassResponse")) > 0.01,
        "actual nearby grass bends from walking",
      );
      await key(b, "ArrowRight");
      await wait(b, "Number(view.dataset.z) > .4");
      await key(b, "ArrowRight", false);
      await b.evaluate("pause.click();restart.click()");
      await wait(
        b,
        'view.dataset.mode === "playing" && Number(view.dataset.x) === 0',
      );
      await key(b, "ArrowUp");
      await b.evaluate(
        "new Promise(resolve=>requestAnimationFrame(()=>{const start=performance.now();while(performance.now()-start<180){};requestAnimationFrame(()=>requestAnimationFrame(resolve));}))",
      );
      await key(b, "ArrowUp", false);
      assert.ok(
        Number(await b.evaluate("view.dataset.x")) > 0.8,
        "180ms slow frame advances actual capped elapsed rather than only 50ms",
      );
      await b.evaluate("pause.click();restart.click()");
      await key(b, "Space");
      await wait(b, "Number(view.dataset.y) > .4");
      await key(b, "Space", false);
      assert.ok(
        Number(await b.evaluate("view.dataset.y")) > 0.4,
        "space really jumps",
      );
      await b.evaluate("pause.click()");
      await wait(b, 'view.dataset.mode === "paused"');
      const frozen = await b.evaluate(
        'view.dataset.x+","+view.dataset.y+","+view.dataset.z',
      );
      await key(b, "ArrowUp");
      await sleep(300);
      assert.equal(
        await b.evaluate(
          'view.dataset.x+","+view.dataset.y+","+view.dataset.z',
        ),
        frozen,
        "pause freezes simulation",
      );
      await b.evaluate("resume.click()");
      await sleep(250);
      await key(b, "ArrowUp", false);
      assert.equal(
        await b.evaluate("view.dataset.x"),
        frozen.split(",")[0],
        "resume clears held movement",
      );
      await wait(b, "Number(view.dataset.y) === 0");
      const y = Number(await b.evaluate("view.dataset.y"));
      await b.call("Input.dispatchMouseEvent", {
        type: "mousePressed",
        x: 850,
        y: 420,
        button: "left",
        clickCount: 1,
      });
      await b.call("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: 1000,
        y: 450,
        buttons: 1,
      });
      await b.call("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        x: 1000,
        y: 450,
        button: "left",
        clickCount: 1,
      });
      await sleep(160);
      assert.ok(
        Math.abs(Number(await b.evaluate("view.dataset.y")) - y) < 0.1,
        "drag does not trigger click jump",
      );
      await b.evaluate(
        'document.querySelector("#reset-camera").click();pause.click();quit.click();document.querySelector("#home-return").click();shop.click()',
      );
      assert.equal(
        await b.evaluate('document.querySelectorAll("[data-skin]").length'),
        13,
      );
      await b.evaluate('document.querySelector("[data-skin=orange]").click()');
      assert.match(
        await b.evaluate('document.querySelector("#status").textContent'),
        /不足/,
      );
      await b.evaluate(
        'localStorage.setItem("glow-parkour-v1",JSON.stringify({coins:4,owned:["red"],equipped:"red",progress:{}}))',
      );
      await b.navigate("games/parkour.html");
      await wait(b, 'document.body.dataset.ready === "true"');
      await b.evaluate(
        'shop.click();document.querySelector("[data-skin=rainbow]").click()',
      );
      assert.equal(await b.evaluate("coins.textContent"), "2");
      await b.evaluate('document.querySelector("[data-skin=rainbow]").click()');
      assert.equal(
        await b.evaluate("coins.textContent"),
        "2",
        "equipping purchased skin costs no extra coins",
      );
      await b.navigate("games/parkour.html");
      await wait(b, 'document.body.dataset.ready === "true"');
      assert.equal(
        await b.evaluate(
          'JSON.parse(localStorage.getItem("glow-parkour-v1")).equipped',
        ),
        "rainbow",
      );
      await b.evaluate(
        'shop.click();document.querySelector("[data-shop-tab=outfits]").click()',
      );
      assert.equal(
        await b.evaluate(
          'document.querySelectorAll("button[data-outfit]").length',
        ),
        20,
      );
      const outfit = await b.evaluate(
        'document.querySelector("button[data-outfit]").dataset.outfit',
      );
      await b.evaluate('document.querySelector("button[data-outfit]").click()');
      assert.equal(await b.evaluate("coins.textContent"), "0");
      await b.evaluate('document.querySelector("button[data-outfit]").click()');
      assert.equal(await b.evaluate("coins.textContent"), "0");
      await b.navigate("games/parkour.html");
      await wait(b, 'document.body.dataset.ready === "true"');
      assert.equal(await b.evaluate("view.dataset.outfit"), outfit);
      const morning = Number(await b.evaluate("view.dataset.sunIntensity"));
      await b.evaluate('document.querySelector("[data-time=night]").click()');
      await sleep(650);
      const middle = Number(await b.evaluate("view.dataset.sunIntensity"));
      assert.ok(
        middle < morning && middle > 0.5,
        "actual light intensity transitions",
      );
      await sleep(1600);
      assert.ok(Number(await b.evaluate("view.dataset.sunIntensity")) < 1);
      await shot(b, "night");
      await b.evaluate('document.querySelector("[data-time=dawn]").click()');
      await sleep(2200);
      await shot(b, "dawn");
      assert.ok(Number(await b.evaluate("view.dataset.sunIntensity")) > 1);
      await b.evaluate('document.querySelector("[data-time=morning]").click()');
      await sleep(2200);
      await shot(b, "morning");
      assert.ok(Number(await b.evaluate("view.dataset.sunIntensity")) > 3);
      await b.size(960, 640, true);
      await b.evaluate("editor.click()");
      const preview = await b.evaluate(
        '(()=>{const r=document.querySelector("#editor-map").getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()',
      );
      assert.ok(
        preview.w >= 250 && preview.h >= 220,
        "usable top-down editor preview",
      );
      await click(b, preview.x + preview.w * 0.8, preview.y + preview.h * 0.75);
      assert.equal(
        await b.evaluate(
          'document.querySelector("#platform-count").textContent',
        ),
        "3 / 80",
      );
      await b.evaluate(
        'document.querySelector("#platform-y").value="1.1";document.querySelector("#platform-y").dispatchEvent(new Event("change",{bubbles:true}));document.querySelector("#editor-save").click()',
      );
      assert.equal(
        await b.evaluate(
          'JSON.parse(localStorage.getItem("glow-parkour-level-v1")).platforms.at(-1).y',
        ),
        1.1,
        "editor saves actual modified height",
      );
      await b.evaluate(
        'document.querySelector("#platform-y").value="2";document.querySelector("#platform-y").dispatchEvent(new Event("change",{bubbles:true}));document.querySelector("#editor-load").click()',
      );
      assert.equal(
        await b.evaluate('document.querySelector("#platform-y").value'),
        "1.1",
        "reload restores platform",
      );
      for (const tool of ["coin", "checkpoint", "goal"]) {
        await b.evaluate(
          `document.querySelector('[data-tool=${tool}]').click()`,
        );
        await click(
          b,
          preview.x + preview.w / 2 + (tool === "coin" ? 34.5 : 57.5),
          preview.y + preview.h / 2,
        );
      }
      await b.evaluate('document.querySelector("#editor-save").click()');
      assert.ok(
        Math.abs(
          (await b.evaluate(
            'JSON.parse(localStorage.getItem("glow-parkour-level-v1")).coins[0].y',
          )) - 0.65,
        ) < 1e-9,
        "coin is placed above actual support top",
      );
      assert.equal(
        await b.evaluate(
          'JSON.parse(localStorage.getItem("glow-parkour-level-v1")).checkpoints[0].y',
        ),
        0.3,
      );
      await shot(b, "editor");
      await b.evaluate('document.querySelector("#editor-play").click()');
      await wait(b, 'view.dataset.mode === "playing"');
      assert.match(
        await b.evaluate(
          'document.querySelector("#practice-note").textContent',
        ),
        /不.*余额/,
      );
      const customStick = await b.evaluate(
        '(()=>{const r=document.querySelector("#joystick").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()',
      );
      await b.call("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: customStick.x, y: customStick.y - 8, id: 1 }],
      });
      await wait(b, "Number(view.dataset.x) >= 1.1");
      await Promise.all([
        b.call("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: customStick.x, y: customStick.y - 25, id: 1 }],
        }),
        key(b, "Space"),
      ]);
      await wait(b, 'view.dataset.mode === "complete"');
      await b.call("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      await key(b, "Space", false);
      assert.match(
        await b.evaluate(
          'document.querySelector("#pause-details").textContent',
        ),
        /收集 1 枚/,
        "real custom route collects the practice coin",
      );
      assert.equal(
        await b.evaluate("coins.textContent"),
        "0",
        "custom completion cannot credit preset wallet",
      );
      await b.evaluate("quit.click()");
      assert.equal(
        await b.evaluate('document.querySelector("#editor-panel").hidden'),
        false,
        "custom play returns to editor",
      );
      await b.evaluate(
        'document.querySelector("#editor-close").click();start.click()',
      );
      const resources = [];
      for (const id of [
        "sakura-1",
        "flowers-1",
        "city-1",
        "cabin-1",
        "sakura-1",
        "city-1",
      ]) {
        await b.evaluate(
          `document.querySelector('[data-level="${id}"]').click()`,
        );
        await wait(b, `view.dataset.theme === "${id.split("-")[0]}"`);
        assert.equal(await b.evaluate("view.dataset.theme"), id.split("-")[0]);
        await b.evaluate(
          "new Promise(resolve=>{let n=4;const frame=()=>--n?requestAnimationFrame(frame):resolve();requestAnimationFrame(frame);})",
        );
        const measured = await b.evaluate(
          "({resources:JSON.parse(view.dataset.resources),triangles:Number(view.dataset.triangles),drawCalls:Number(view.dataset.drawCalls),renderMs:Number(view.dataset.renderMs),dpr:Number(view.dataset.dpr)})",
        );
        resources.push(measured.resources);
        console.log(id, measured);
        await shot(b, id);
        await b.evaluate("pause.click();quit.click()");
      }
      assert.ok(
        resources.at(-1).geometries <= resources[2].geometries + 2,
        "scene switches dispose old geometries",
      );
      assert.ok(
        resources.every((r) => r.textures < 15),
        "textures bounded",
      );
      await b.evaluate(
        'document.querySelector("[data-level=sakura-1]").click()',
      );
      await b.size(390, 844, true);
      const controls = await b.evaluate(
        '(()=>{const a=document.querySelector("#joystick").getBoundingClientRect(),b=document.querySelector("#jump").getBoundingClientRect();return {x:a.x+a.width/2,y:a.y+a.height/2,jx:b.x+b.width/2,jy:b.y+b.height/2,w:a.width,jw:b.width}})()',
      );
      assert.ok(controls.w >= 112 && controls.jw >= 48);
      const before = Number(await b.evaluate("view.dataset.x"));
      await b.call("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: controls.x, y: controls.y, id: 1 }],
      });
      await b.call("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: controls.x, y: controls.y - 38, id: 1 }],
      });
      await b.call("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [
          { x: controls.x, y: controls.y - 38, id: 1 },
          { x: controls.jx, y: controls.jy, id: 2 },
        ],
      });
      const touchSnapshot = await wait(
        b,
        `Number(view.dataset.x) > ${before + 0.5} && Number(view.dataset.y) > .4 ? {x:Number(view.dataset.x),y:Number(view.dataset.y)} : null`,
      );
      await b.call("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      await sleep(100);
      assert.ok(
        touchSnapshot.x > before + 0.5,
        "independent touch stick moves",
      );
      assert.ok(touchSnapshot.y > 0.4, "simultaneous touch jump");
      await b.evaluate(
        'pause.click();restart.click();document.querySelector("#reset-camera").click()',
      );
      await wait(
        b,
        'view.dataset.mode === "playing" && Number(view.dataset.x) === 0',
      );
      assert.ok(
        Number(await b.evaluate("view.dataset.cameraDistance")) >= 17,
        "portrait camera preserves landing view instead of shrinking behind a platform",
      );
      await shot(b, "phone-portrait-playing");
      await b.size(844, 390, true);
      await shot(b, "phone-landscape-playing");
      await b.evaluate("pause.click()");
      for (const [w, h] of [
        [320, 568],
        [568, 320],
        [844, 390],
        [820, 1180],
        [1440, 900],
      ]) {
        await b.size(w, h, true);
        assert.equal(
          await b.evaluate("document.documentElement.scrollWidth>innerWidth"),
          false,
          `${w}x${h} no overflow`,
        );
      }
      await shot(b, "mobile");
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);

test(
  "blocked local storage still starts a real WebGL game with a visible saving explanation",
  { timeout: 60000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.call("Page.addScriptToEvaluateOnNewDocument", {
        source:
          'Object.defineProperty(window,"localStorage",{get(){throw new DOMException("Storage blocked","SecurityError")}});',
      });
      await b.size(640, 480);
      await b.navigate("games/parkour.html");
      await wait(b, 'document.body.dataset.ready === "true"');
      assert.match(
        await b.evaluate('document.querySelector("#storage-note").textContent'),
        /存储/,
      );
      await b.evaluate(
        'editor.click();document.querySelector("#editor-save").click()',
      );
      assert.match(
        await b.evaluate(
          'document.querySelector("#editor-feedback").textContent',
        ),
        /保存失败/,
      );
      assert.equal(
        await b.evaluate('document.querySelector("#loading").hidden'),
        true,
      );
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);

test(
  "invalid saved editor data is explained and cannot erase current editing on load",
  { timeout: 60000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.size(640, 480);
      await b.navigate("games/parkour.html");
      await wait(b, 'document.body.dataset.ready === "true"');
      await b.evaluate('localStorage.setItem("glow-parkour-level-v1","{bad")');
      await b.navigate("games/parkour.html");
      await wait(b, 'document.body.dataset.ready === "true"');
      await b.evaluate("editor.click()");
      assert.match(
        await b.evaluate(
          'document.querySelector("#editor-feedback").textContent',
        ),
        /数据无效/,
      );
      assert.equal(
        await b.evaluate('localStorage.getItem("glow-parkour-level-v1")'),
        "{bad",
        "opening did not overwrite damaged saved data",
      );
      await b.evaluate(
        'document.querySelector("#platform-x").value="1";document.querySelector("#platform-x").dispatchEvent(new Event("change",{bubbles:true}));document.querySelector("#editor-load").click()',
      );
      assert.match(
        await b.evaluate(
          'document.querySelector("#editor-feedback").textContent',
        ),
        /损坏/,
      );
      assert.equal(
        await b.evaluate('document.querySelector("#platform-x").value'),
        "1",
        "failed load keeps current edits",
      );
      await b.evaluate('document.querySelector("#editor-save").click()');
      assert.equal(
        await b.evaluate(
          'JSON.parse(localStorage.getItem("glow-parkour-level-v1")).platforms[0].x',
        ),
        1,
        "explicit save persists the current edited level",
      );
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);
