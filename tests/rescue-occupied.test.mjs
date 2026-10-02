import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createCampaign, availableAreas } from "../rescue/campaign.js";
import { playOccupied } from "./rescue-occupied-driver.mjs";

// Removing real support, breaking ball damage, bonus exits, either branch or final
// clear must fail. Live state is created normally and changed only by stepGame.
test(
  "all eleven occupied authored areas clear with real inputs, eight five-hit Bosses and both branches",
  { timeout: 180000 },
  async () => {
    const campaign = createCampaign(),
      results = [];
    const expectedUnlocks = {
      0: ["A", "B"],
      A: ["C"],
      B: ["D"],
      C: ["D"],
      D: ["E", "F"],
      E: ["F"],
      F: ["G"],
      G: ["H"],
      H: ["I"],
      I: ["J"],
      J: [],
    };
    for (const id of ["0", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]) {
      assert.ok(
        availableAreas(campaign).includes(id),
        `${id} is available through genuine prior clears`,
      );
      const hits = [],
        events = [],
        seen = new Set(),
        slots = new Set();
      let bonusSeen = false;
      const {
        state: s,
        reason,
        iterations,
      } = playOccupied(id, {
        campaign,
        onStep(state, inputs) {
          if (state.status === "bonus") bonusSeen = true;
          inputs.forEach((input, i) => {
            if (Object.keys(input).length) slots.add(i);
          });
          for (const event of state.events)
            if (!seen.has(event.id)) {
              seen.add(event.id);
              if (event.type === "bossHit") hits.push(event.hp);
              if (
                ["bossHit", "bossDefeated", "clear", "lifeLost"].includes(
                  event.type,
                )
              )
                events.push(event);
            }
        },
      });
      assert.equal(
        s.status,
        "cleared",
        `${id}: ${reason}, iterations=${iterations}, lives=${s.players.map((p) => p.lives)}`,
      );
      assert.ok(campaign.completed.includes(id));
      for (const next of expectedUnlocks[id])
        assert.ok(
          availableAreas(campaign).includes(next),
          `${id} opens ${next}`,
        );
      if (["0", "A", "B", "D", "E", "G", "I", "J"].includes(id)) {
        assert.deepEqual(
          hits,
          [4, 3, 2, 1, 0],
          `${id}: exactly five real ball hits`,
        );
        assert.equal(events.filter((e) => e.type === "bossDefeated").length, 1);
      } else assert.deepEqual(hits, []);
      assert.equal(
        bonusSeen,
        id !== "J",
        `${id}: real bonus room before clear, final J ends directly`,
      );
      assert.equal(s.ending, id === "J");
      if (id === "D") {
        assert.equal(s.players.length, 2);
        assert.deepEqual(
          [...slots],
          [0, 1],
          "normal independent P1 then surviving P2 input slots",
        );
        assert.equal(s.players[0].lives, 0);
        assert.ok(s.players[1].lives > 0);
      }
      const result = {
        id,
        mode: id === "D" ? "local two-player" : "solo",
        time: s.time,
        score: s.score,
        flowers: s.flowers,
        stars: s.stars,
        lives: s.players.map((p) => p.lives),
        hearts: s.players.map((p) => p.hearts),
        hits,
        bonusSeen,
        ending: s.ending,
        events,
      };
      results.push(result);
      console.log("occupied area", JSON.stringify(result));
    }
    assert.equal(results.filter((r) => r.hits.length === 5).length, 8);
    assert.equal(campaign.completed.length, 11);
    assert.equal(campaign.ending, true);
    const replay = playOccupied("C", { campaign }).state;
    assert.equal(replay.status, "cleared");
    assert.equal(
      campaign.completed.length,
      11,
      "replay never duplicates completed areas",
    );
    assert.equal(
      campaign.ending,
      true,
      "replay preserves campaign rescue record",
    );
    const root =
      process.env.RESCUE_EVIDENCE_DIR || "/tmp/rescue-evidence/occupied";
    await mkdir(root, { recursive: true });
    await writeFile(
      `${root}/campaign.json`,
      JSON.stringify(
        { results, campaign, replay: { area: "C", status: replay.status } },
        null,
        2,
      ),
    );
  },
);
