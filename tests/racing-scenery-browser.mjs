import test from "node:test";
import assert from "node:assert/strict";
import { writeFile, mkdir } from "node:fs/promises";
import { openBrowser, sleep } from "./game-browser-harness.mjs";
test(
  "fourteen distinct courses render container paths, ship bridges, river flora and four lighting periods",
  { timeout: 240000 },
  async () => {
    const b = await openBrowser(),
      consoleErrors = [];
    try {
      b.on("Runtime.consoleAPICalled", (e) => {
        if (e.type === "error")
          consoleErrors.push(
            e.args.map((a) => a.description || a.value).join(" "),
          );
      });
      await b.size(568, 320, true);
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
        await b.evaluate("loading.textContent"),
      );
      assert.equal(
        await b.evaluate('document.querySelectorAll("#tracks [data-track]").length'),
        14,
      );
      assert.ok(
        await b.evaluate('document.querySelector(".menu").getBoundingClientRect().left > innerWidth * .35'),
        "landscape garage leaves the car preview clear of the right-hand menu",
      );
      for (const theme of ["container", "ocean", "ship", "gorge"]) {
        await b.evaluate(
          `document.querySelector('[data-track="${theme}"]').click()`,
        );
        await sleep(120);
        assert.equal(await b.evaluate("view.dataset.theme"), theme);
        assert.ok(Number(await b.evaluate("view.dataset.triangles")) > 10000);
        if (theme === "container")
          assert.ok(Number(await b.evaluate("view.dataset.containers")) > 100);
        if (theme === "ocean")
          assert.ok(Number(await b.evaluate("view.dataset.bridgeTowers")) > 3);
        if (theme === "ship")
          assert.equal(await b.evaluate("view.dataset.ships"), "3");
        if (theme === "gorge") {
          assert.equal(await b.evaluate("view.dataset.river"), "1");
          for (const k of ["trees", "pines", "shrubs", "flowers"])
            assert.ok(Number(await b.evaluate(`view.dataset.${k}`)) > 5);
        }
      }
      const shots = [];
      for (const [mode, label] of [
        ["dawn", "黎明"],
        ["noon", "正午"],
        ["sunset", "晚霞"],
        ["night", "深夜"],
      ]) {
        await b.evaluate(
          `document.getElementById('light-time').value='${mode}';document.getElementById('light-time').dispatchEvent(new Event('change'))`,
        );
        for (
          let i = 0;
          i < 30 && (await b.evaluate("view.dataset.lightMode")) !== mode;
          i++
        )
          await sleep(100);
        assert.equal(await b.evaluate("view.dataset.lightPeriod"), label);
        const p = await b.call("Page.captureScreenshot", { format: "png" });
        shots.push(p.data);
        if (process.env.RACING_SCENERY_DIR) {
          await mkdir(process.env.RACING_SCENERY_DIR, { recursive: true });
          await writeFile(
            `${process.env.RACING_SCENERY_DIR}/gorge-${mode}.png`,
            Buffer.from(p.data, "base64"),
          );
        }
      }
      assert.equal(
        new Set(shots).size,
        4,
        "lighting periods change the actual rendered image",
      );
      for (const [w, h] of [
        [320, 568],
        [390, 844],
        [820, 1180],
        [1440, 900],
      ]) {
        await b.size(w, h, w < 1000);
        assert.equal(
          await b.evaluate("document.documentElement.scrollWidth>innerWidth"),
          false,
        );
      }
      assert.deepEqual(b.errors, []);
      assert.deepEqual(consoleErrors, []);
    } finally {
      b.close();
    }
  },
);
