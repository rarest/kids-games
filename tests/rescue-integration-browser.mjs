import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { playOccupied } from "./rescue-occupied-driver.mjs";
import { openBrowser, sleep } from "./game-browser-harness.mjs";

const root =
  process.env.RESCUE_EVIDENCE_DIR || "/tmp/rescue-evidence/integration";
const wait = async (b, expression) => {
  for (let i = 0; i < 150; i++) {
    try {
      if (await b.evaluate(expression)) return;
    } catch (error) {
      if (!/navigated|context|closed/i.test(error.message)) throw error;
    }
    await sleep(60);
  }
  assert.fail(`Timed out: ${expression}`);
};
const key = (b, code, down = true) =>
  b.call("Input.dispatchKeyEvent", {
    type: down ? "keyDown" : "keyUp",
    code,
    key: code === "Space" ? " " : code,
  });
const click = async (b, selector) => {
  const p = await b.evaluate(
    `(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`,
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
const snapshot = (b) =>
  b.evaluate(
    "({...view.dataset,positions:JSON.parse(view.dataset.positions),graphics:JSON.parse(view.dataset.graphics),physics:JSON.parse(view.dataset.physics)})",
  );

// Removing the card, breaking native pickup/throw, WebGL or the entrance save fails this visitor path.
test(
  "hall search, native rescue play, durable entrance continue and return to twelve-game hall",
  { timeout: 90000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.size(960, 640);
      await b.navigate("index.html");
      assert.equal(
        await b.evaluate(
          `document.querySelector('a[href="games/rescue.html?v=20261003rescue-online2"] .name')?.textContent`,
        ),
        "松鼠大作战",
        "hall contains the actual rescue card",
      );
      assert.equal(
        await b.evaluate('document.querySelectorAll(".card").length'),
        12,
      );
      assert.equal(
        await b.evaluate(
          `document.querySelector('a[href="games/rescue.html?v=20261003rescue-online2"] .desc').textContent`,
        ),
        "11个经典区域的3D横版重制，举箱子、扔队友，本机 / 联网双人救援",
      );
      assert.deepEqual(
        await b.evaluate(
          `Array.from(document.querySelectorAll('a[href="games/rescue.html?v=20261003rescue-online2"] .tag'),e=>e.textContent)`,
        ),
        ["经典", "3D", "本机双人", "联网双人", "手柄", "闯关"],
      );
      await click(b, "#q");
      await b.call("Input.insertText", { text: "松鼠大作战" });
      assert.equal(
        await b.evaluate('document.querySelectorAll(".card").length'),
        1,
      );
      await shot(b, "hall-search");
      await click(b, 'a[href="games/rescue.html?v=20261003rescue-online2"]');
      await wait(
        b,
        'location.pathname.endsWith("/games/rescue.html") && document.querySelector("#view")?.dataset.phase === "home"',
      );
      await click(b, "#start");
      await wait(b, 'view.dataset.phase === "playing"');
      const spawn = await snapshot(b);
      assert.equal(spawn.area, "0");
      assert.equal(spawn.webgl, "true");
      assert.ok(spawn.graphics.triangles > 0);
      await key(b, "KeyD");
      await wait(b, `Number(view.dataset.x)>${Number(spawn.x) + 1.6}`);
      await key(b, "KeyD", false);
      await key(b, "KeyE");
      await wait(b, "Number(view.dataset.carrying)===1");
      await key(b, "KeyE", false);
      const picked = await snapshot(b),
        objectId = picked.positions[0].carrying.id;
      await shot(b, "native-pickup");
      await key(b, "KeyE");
      await wait(b, "Number(view.dataset.carrying)===0");
      await key(b, "KeyE", false);
      const thrown = await snapshot(b);
      assert.ok(
        thrown.physics.objects.some(
          (o) => o.id === objectId && o.thrown && Math.abs(o.vx) > 0,
        ),
        "picked object is physically thrown",
      );
      await shot(b, "native-throw");
      await click(b, "#pause");
      const saved = await b.evaluate(
        '(async()=> (await import("/rescue/profile.js")).createProfile().load())()',
      );
      assert.equal(saved.run.areaId, "0");
      await b.call("Page.reload");
      await wait(
        b,
        'document.querySelector("#view")?.dataset.phase === "home"',
      );
      assert.equal(
        await b.evaluate('document.querySelector("#continue").hidden'),
        false,
      );
      await click(b, "#continue");
      await wait(b, 'view.dataset.phase === "playing"');
      const resumed = await snapshot(b);
      assert.equal(resumed.area, "0");
      assert.ok(
        Math.abs(Number(resumed.x) - Number(spawn.x)) < 0.1,
        "continue restores the documented region entrance",
      );
      assert.equal(Number(resumed.score), saved.run.score);
      assert.deepEqual(
        resumed.positions.map((p) => p.lives),
        saved.run.lives,
      );
      await shot(b, "reloaded-continue");
      await click(b, "#pause");
      await click(b, "#home");
      await click(b, 'a[href="../index.html"]');
      await wait(
        b,
        'location.pathname.endsWith("/index.html") && document.querySelectorAll(".card").length === 12',
      );
      assert.deepEqual(b.errors, []);
      await mkdir(root, { recursive: true });
      await writeFile(
        `${root}/result.json`,
        JSON.stringify(
          {
            origin: b.origin,
            spawn,
            picked,
            thrown,
            saved,
            resumed,
            errors: b.errors,
          },
          null,
          2,
        ),
      );
      console.log(
        "native rescue integration",
        JSON.stringify({
          origin: b.origin,
          objectId,
          spawnX: spawn.x,
          playedX: thrown.x,
          resumedX: resumed.x,
          evidence: root,
        }),
      );
    } finally {
      b.close();
    }
  },
);

// J is played with real simulator inputs; only the presentation is exercised in
// this browser. This does not claim a native browser traversal of J.
test(
  "genuine occupied J ending renders through the production completion presenter",
  { timeout: 60000 },
  async () => {
    const { state, reason } = playOccupied("J");
    assert.equal(state.status, "cleared", reason);
    assert.equal(state.ending, true);
    const b = await openBrowser();
    try {
      await b.navigate("games/rescue.html");
      await wait(
        b,
        'document.querySelector("#view")?.dataset.phase === "home"',
      );
      const result = await b.evaluate(`(async()=>{
      const module=await import('/rescue/completion.js');
      module.presentCompletion(${JSON.stringify(state)},document);
      return {title:document.querySelector('#complete-title').textContent,copy:document.querySelector('#complete-copy').textContent,next:document.querySelector('#next-area').textContent};
    })()`);
      assert.match(result.title, /朋友获救/);
      assert.match(result.copy, new RegExp(String(state.score) + " 分"));
      assert.match(result.copy, new RegExp(String(state.flowers) + " 朵花"));
      assert.match(result.copy, new RegExp(String(state.stars) + " 颗星"));
      assert.equal(result.next, "再去探险");
      assert.deepEqual(b.errors, []);
      await mkdir(root, { recursive: true });
      await writeFile(
        `${root}/ending.json`,
        JSON.stringify(
          {
            coverage:
              "real occupied J simulator + production DOM presenter; not native J traversal",
            state,
            result,
          },
          null,
          2,
        ),
      );
      console.log("real J ending presentation", JSON.stringify(result));
    } finally {
      b.close();
    }
  },
);
