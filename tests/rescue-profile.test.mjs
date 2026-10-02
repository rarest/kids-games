import test from "node:test";
import assert from "node:assert/strict";
let createProfile, PROFILE_KEY;
try {
  ({ createProfile, PROFILE_KEY } = await import("../rescue/profile.js"));
} catch {}
const storage = () => {
  const data = new Map([["other-game", "untouched"]]);
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => data.set(k, v),
    data,
  };
};
function profile(s) {
  assert.equal(
    typeof createProfile,
    "function",
    "production profile must exist",
  );
  return createProfile(s);
}
test("save and reload campaign and normal area-start run without touching other games", () => {
  const s = storage(),
    p = profile(s),
    value = p.load();
  value.campaign = {
    current: "A",
    completed: ["0"],
    unlocked: ["0", "A", "B"],
    ending: false,
  };
  value.run = {
    areaId: "A",
    score: 500,
    flowers: 49,
    stars: 9,
    lives: [4, 3],
    players: 2,
    character: "dale",
  };
  value.options.music = false;
  assert.equal(p.save(value).ok, true);
  const again = profile(s).load();
  assert.deepEqual(again.run, value.run);
  assert.equal(again.options.music, false);
  assert.deepEqual(again.campaign.completed, ["0"]);
  assert.equal(s.getItem("other-game"), "untouched");
});
test("malformed records and unknown/inaccessible areas are filtered", () => {
  const s = storage(),
    p = profile(s);
  s.setItem(PROFILE_KEY, "{");
  assert.deepEqual(p.load().campaign.completed, []);
  s.setItem(
    PROFILE_KEY,
    JSON.stringify({
      campaign: { completed: ["bogus", "J", "0", "A"], current: "unknown" },
      run: { areaId: "J", score: -1, lives: [Infinity] },
      options: { quality: "fake" },
    }),
  );
  const v = p.load();
  assert.deepEqual(v.campaign.completed, ["0", "A"]);
  assert.equal(v.run, null);
  assert.equal(v.options.quality, "auto");
});
test("storage failures stay visible and rejected writes are never success", () => {
  const p = profile({
    getItem() {
      throw Error("denied");
    },
    setItem() {
      throw Error("full");
    },
  });
  assert.deepEqual(p.load().campaign.completed, []);
  assert.match(p.error, /读取失败/);
  assert.equal(p.save(p.load()).ok, false);
  assert.match(p.error, /保存失败/);
});
test("a denied storage getter still returns visible read and save failures", () => {
  assert.equal(typeof createProfile, "function");
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() {
      throw Error("security denied");
    },
  });
  try {
    const p = createProfile();
    const value = p.load();
    assert.match(p.error, /读取失败/);
    assert.equal(p.save(value).ok, false);
    assert.match(p.error, /保存失败/);
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else delete globalThis.localStorage;
  }
});
test("a run with no surviving players is rejected instead of restoring a softlocked region", () => {
  const s = storage(),
    p = profile(s);
  s.setItem(
    PROFILE_KEY,
    JSON.stringify({
      run: { areaId: "0", players: 2, lives: [0, 0], score: 100 },
    }),
  );
  assert.equal(p.load().run, null);
  s.setItem(
    PROFILE_KEY,
    JSON.stringify({
      run: { areaId: "0", players: 2, lives: [0, 4], score: 100 },
    }),
  );
  assert.deepEqual(p.load().run.lives, [0, 4]);
});
