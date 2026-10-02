import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { openBrowser, sleep } from "./game-browser-harness.mjs";
test(
  "detailed surfaces render without shader errors and fine mode raises actual framebuffer resolution",
  { timeout: 300000 },
  async () => {
    const b = await openBrowser(),
      errors = [];
    try {
      b.on("Runtime.consoleAPICalled", (e) => {
        if (e.type === "error")
          errors.push(e.args.map((a) => a.description || a.value).join(" "));
      });
      await b.size(960, 640);
      await b.navigate("games/racing.html");
      assert.equal(await b.evaluate("document.body.dataset.ready"), "true");
      await b.evaluate(
        "document.getElementById('light-time').value='noon';document.getElementById('light-time').dispatchEvent(new Event('change'))",
      );
      for (const theme of ["tour", "gorge", "ocean", "cyber", "gorge"]) {
        await b.evaluate(
          `document.querySelector('[data-track="${theme}"]').click()`,
        );
        await sleep(150);
        const types = await b.evaluate("view.dataset.surfaceTypes");
        assert.match(types, /paint/);
        assert.match(types, /carbon/);
        assert.match(types, /rubber/);
        const normalCount = Number(
          await b.evaluate("view.dataset.normalMaterials"),
        );
        console.log(theme, {
          types,
          normalCount,
          textures: await b.evaluate("view.dataset.textureCount"),
        });
        assert.ok(
          normalCount >= 4,
          theme + " includes detailed car and course materials",
        );
        if (theme === "tour" || theme === "gorge")
          for (const kind of ["stone", "bark", "leaves"])
            assert.ok(types.includes(kind));
        if (theme === "ocean" || theme === "gorge")
          assert.ok(types.includes("water"));
        assert.ok(
          Number(await b.evaluate("view.dataset.textureCount")) < 80,
          "shared maps and released track textures stay bounded",
        );
      }
      const low = await b.evaluate(
        "document.getElementById('quality').value='low';document.getElementById('quality').dispatchEvent(new Event('change'));view.width/view.clientWidth",
      );
      const high = await b.evaluate(
        "document.getElementById('quality').value='high';document.getElementById('quality').dispatchEvent(new Event('change'));view.width/view.clientWidth",
      );
      assert.ok(
        high >= 1 && high > low,
        "fine mode produces a sharper framebuffer",
      );
      if (process.env.RACING_MATERIALS_DIR) {
        await mkdir(process.env.RACING_MATERIALS_DIR, { recursive: true });
        const p = await b.call("Page.captureScreenshot", { format: "png" });
        await writeFile(
          `${process.env.RACING_MATERIALS_DIR}/fine-garage.png`,
          Buffer.from(p.data, "base64"),
        );
      }
      // Resume the default budget before exercising animated water and the race.
      await b.evaluate(
        "document.getElementById('quality').value='auto';document.getElementById('quality').dispatchEvent(new Event('change'));start.click()",
      );
      for (
        let i = 0;
        i < 150 && Number(await b.evaluate("view.dataset.distance")) < 180;
        i++
      )
        await sleep(150);
      assert.ok(Number(await b.evaluate("speed.textContent")) > 0);
      if (process.env.RACING_MATERIALS_DIR) {
        const p = await b.call("Page.captureScreenshot", { format: "png" });
        await writeFile(
          `${process.env.RACING_MATERIALS_DIR}/detailed-race.png`,
          Buffer.from(p.data, "base64"),
        );
      }
      assert.deepEqual(errors, []);
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);
