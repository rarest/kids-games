import test from "node:test";
import assert from "node:assert/strict";
import { openBrowser, sleep } from "./game-browser-harness.mjs";
import { writeFile } from "node:fs/promises";
test(
  "new worlds render their geometry, T checkpoints and shared hazard animation; bridge falling respawns",
  { timeout: 180000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.size(568, 320, true);
      await b.navigate("games/racing.html");
      for (const theme of ["tunnel", "cyber", "sky", "china"]) {
        await b.evaluate(
          `document.querySelector('[data-track="${theme}"]').click()`,
        );
        await sleep(150);
        assert.equal(await b.evaluate("view.dataset.theme"), theme);
        assert.equal(await b.evaluate("view.dataset.checkpoint"), "T");
        assert.ok(Number(await b.evaluate("view.dataset.hazards")) >= 5);
        assert.ok(Number(await b.evaluate("view.dataset.triangles")) > 10000);
        if (theme === "tunnel")
          assert.ok(Number(await b.evaluate("view.dataset.neonRings")) > 15);
        if (theme === "sky")
          assert.equal(await b.evaluate("view.dataset.deck"), "glass+grating");
        if (theme === "china")
          assert.ok(Number(await b.evaluate("view.dataset.pavilions")) > 5);
      }
      await b.evaluate(
        `document.querySelector('[data-track="sky"]').click();document.querySelector('#start').click()`,
      );
      for (
        let i = 0;
        i < 100 && !(await b.evaluate("Number(speed.textContent)>0"));
        i++
      )
        await sleep(100);
      await b.call("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: "ArrowRight",
        code: "ArrowRight",
      });
      for (
        let i = 0;
        i < 150 && !(await b.evaluate("Number(view.dataset.crashes)>0"));
        i++
      )
        await sleep(100);
      await b.call("Input.dispatchKeyEvent", {
        type: "keyUp",
        key: "ArrowRight",
        code: "ArrowRight",
      });
      assert.equal(await b.evaluate("view.dataset.crashes"), "1");
      assert.ok(Number(await b.evaluate("view.dataset.respawn")) > 0);
      assert.match(await b.evaluate("penalty.textContent"), /5秒|复活/);
      await b.evaluate("pause.click()");
      const s = await b.evaluate("view.dataset.distance");
      await sleep(200);
      assert.equal(await b.evaluate("view.dataset.distance"), s);
      assert.deepEqual(b.errors, []);
      if (process.env.RACING_WORLDS_SCREENSHOT) {
        const p = await b.call("Page.captureScreenshot", { format: "png" });
        await writeFile(
          process.env.RACING_WORLDS_SCREENSHOT,
          Buffer.from(p.data, "base64"),
        );
      }
    } finally {
      b.close();
    }
  },
);
