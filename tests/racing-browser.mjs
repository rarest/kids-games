import test from "node:test";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { openBrowser, sleep } from "./game-browser-harness.mjs";
test(
  "3D racer renders, controls, pauses, changes tracks and fits rotating devices",
  // CPU-only SwiftShader can exceed three minutes for all six resizes and tracks.
  // Keep every interaction assertion; allow the full visitor path to finish.
  { timeout: 300000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.size(568, 320);
      await b.navigate("games/racing.html");
      for (
        let i = 0;
        i < 100 && !(await b.evaluate('document.body.dataset.ready==="true"'));
        i++
      )
        await sleep(100);
      assert.equal(
        await b.evaluate("document.body.dataset.ready"),
        "true",
        await b.evaluate('document.querySelector("#loading").textContent'),
      );
      assert.equal(
        await b.evaluate('document.querySelectorAll("#tracks button").length'),
        14,
      );
      assert.equal(
        await b.evaluate('document.querySelectorAll("#cars button").length'),
        4,
      );
      assert.equal(
        await b.evaluate('document.querySelectorAll("#skins button").length'),
        6,
      );
      assert.ok(
        await b.evaluate(
          'Number(document.querySelector("#view").dataset.triangles)>10000',
        ),
      );
      await b.evaluate('document.querySelector("#start").click()');
      for (
        let i = 0;
        i < 100 &&
        !(await b.evaluate(
          'Number(document.querySelector("#speed").textContent)>0',
        ));
        i++
      )
        await sleep(200);
      assert.ok(
        await b.evaluate(
          'Number(document.querySelector("#speed").textContent)>0',
        ),
      );
      assert.match(
        await b.evaluate('document.querySelector("#position").textContent'),
        /\/ 11/,
      );
      assert.ok(
        Number(await b.evaluate("view.dataset.trailVertices")) > 0,
        "moving racers emit neon trails",
      );
      const offset = Number(await b.evaluate("view.dataset.offset"));
      await b.call("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: "ArrowRight",
        code: "ArrowRight",
      });
      for (
        let i = 0;
        i < 80 &&
        !(Number(await b.evaluate("view.dataset.offset")) < offset - 0.5);
        i++
      )
        await sleep(100);
      assert.equal(
        await b.evaluate("view.dataset.steer"),
        "-1",
        "right key reaches the physics with the camera-correct sign",
      );
      await b.call("Input.dispatchKeyEvent", {
        type: "keyUp",
        key: "ArrowRight",
        code: "ArrowRight",
      });
      assert.ok(
        Number(await b.evaluate("view.dataset.offset")) < offset - 0.5,
        "right arrow moves towards the chase-camera right (-track normal)",
      );
      await b.size(568, 320, true);
      // Test touch in a fresh race; a checkpoint reset from the preceding
      // keyboard drive must not count as movement or hide steering while frozen.
      await b.evaluate('pause.click();quit.click();start.click()');
      for (
        let i = 0;
        i < 100 && !(Number(await b.evaluate('speed.textContent')) > 0);
        i++
      )
        await sleep(200);
      const touchOffset = Number(await b.evaluate("view.dataset.offset"));
      const touch = await b.evaluate(
        `(()=>{const r=document.querySelector('[data-control="left"]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,id:1}})()`,
      );
      await b.call("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [touch],
      });
      for (
        let i = 0;
        i < 80 &&
        !(await b.evaluate(`view.dataset.steer === '1' && Number(view.dataset.offset) > ${touchOffset + 0.5} && Number(view.dataset.respawn) === 0`));
        i++
      )
        await sleep(100);
      assert.equal(
        await b.evaluate("view.dataset.steer"),
        "1",
        "touch left reaches the physics with the camera-correct sign",
      );
      await b.call("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      assert.ok(
        Number(await b.evaluate("view.dataset.offset")) > touchOffset + 0.5,
        "touch left button moves towards chase-camera left (+track normal)",
      );
      await b.evaluate('document.querySelector("#pause").click()');
      const before = await b.evaluate(
        'document.querySelector("#view").dataset.distance',
      );
      await sleep(250);
      assert.equal(
        await b.evaluate('document.querySelector("#view").dataset.distance'),
        before,
      );
      await b.evaluate(
        'document.querySelector("#resume").click();document.querySelector("#pause").click()',
      );
      for (const [w, h, touch] of [
        [320, 568, true],
        [568, 320, true],
        [390, 844, true],
        [844, 390, true],
        [820, 1180, true],
        [1440, 900, false],
      ]) {
        await b.size(w, h, touch);
        const rect = await b.evaluate(
          '(()=>{const r=document.querySelector("#view").getBoundingClientRect();return {w:r.width,h:r.height,overflow:document.documentElement.scrollWidth>innerWidth}})()',
        );
        assert.equal(rect.overflow, false, `${w}x${h}`);
        assert.ok(rect.w >= w * 0.95 && rect.h >= h * 0.8);
      }
      await b.evaluate('document.querySelector("#quit").click()');
      for (const id of [
        "mountain",
        "factory",
        "abandoned",
        "highway",
        "plateau",
      ]) {
        await b.evaluate(
          `document.querySelector('[data-track="${id}"]').click()`,
        );
        await sleep(150);
        assert.equal(
          await b.evaluate('document.querySelector("#view").dataset.track'),
          id,
        );
      }
      await b.evaluate(
        `localStorage.setItem('summit-racing-v1',JSON.stringify({coins:4000,cars:['apex'],skins:['aurora','silver'],car:'apex',skin:'aurora'}))`,
      );
      await b.size(568, 320, true);
      await b.navigate("games/racing.html");
      await b.evaluate(
        `document.querySelector('[data-tab="models"]').click();document.querySelector('[data-shop="cars"][data-item="rally"]').click();document.querySelector('[data-tab="paints"]').click();document.querySelector('[data-shop="skins"][data-item="ember"]').click()`,
      );
      assert.equal(await b.evaluate("coins.textContent"), "200");
      await b.navigate("games/racing.html");
      assert.equal(
        await b.evaluate('document.getElementById("car-name").textContent'),
        "山猫 RX",
      );
      assert.match(
        await b.evaluate('document.getElementById("paint-name").textContent'),
        /熔岩红/,
      );
      assert.equal(await b.evaluate("coins.textContent"), "200");
      if (process.env.RACING_SCREENSHOT) {
        const shot = await b.call("Page.captureScreenshot", { format: "png" });
        await writeFile(
          process.env.RACING_SCREENSHOT,
          Buffer.from(shot.data, "base64"),
        );
      }
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);
