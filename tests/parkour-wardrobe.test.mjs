import test from "node:test";
import assert from "node:assert/strict";
import {
  OUTFITS,
  createWardrobe,
  buyOutfit,
  equipOutfit,
  readWardrobe,
  writeWardrobe,
} from "../parkour/wardrobe.js";

test("twenty complete outfits have distinct designs and cost two coins", () => {
  assert.equal(OUTFITS.length, 20);
  assert.equal(new Set(OUTFITS.map((o) => o.id)).size, 20);
  for (const o of OUTFITS) {
    assert.equal(o.price, 2);
    for (const field of ["top", "pants", "shoes", "accent"])
      assert.match(o[field], /^#[a-f0-9]{6}$/i);
    assert.ok(o.name && o.pattern);
  }
  assert.ok(new Set(OUTFITS.map((o) => o.pattern)).size >= 3);
});
test("outfit balance and ownership transactions reject shortage and repeat purchases", () => {
  const profile = { coins: 1 },
    wardrobe = createWardrobe();
  assert.equal(buyOutfit(profile, wardrobe, OUTFITS[0].id), false);
  assert.equal(profile.coins, 1);
  profile.coins = 2;
  assert.equal(buyOutfit(profile, wardrobe, OUTFITS[0].id), true);
  assert.equal(profile.coins, 0);
  profile.coins = 4;
  assert.equal(buyOutfit(profile, wardrobe, OUTFITS[0].id), false);
  assert.equal(profile.coins, 4);
  assert.equal(buyOutfit(profile, wardrobe, "bad"), false);
  assert.equal(equipOutfit(wardrobe, OUTFITS[1].id), false);
  assert.equal(equipOutfit(wardrobe, OUTFITS[0].id), true);
  assert.equal(wardrobe.equipped, OUTFITS[0].id);
  assert.equal(equipOutfit(wardrobe, null), true);
  assert.equal(wardrobe.equipped, null);
});
test("wardrobe normalizes bad data and persists in its own key without changing skin data", () => {
  const data = new Map([["glow-parkour-v1", "skin-original"]]);
  const storage = {
    getItem: (k) => data.get(k),
    setItem: (k, v) => data.set(k, v),
  };
  assert.deepEqual(
    createWardrobe({
      owned: ["bad", OUTFITS[0].id, OUTFITS[0].id],
      equipped: OUTFITS[1].id,
      timeOfDay: "bad",
    }),
    { owned: [OUTFITS[0].id], equipped: null, timeOfDay: "morning" },
  );
  const wardrobe = createWardrobe({
    owned: [OUTFITS[0].id],
    equipped: OUTFITS[0].id,
    timeOfDay: "night",
  });
  assert.equal(writeWardrobe(storage, wardrobe), true);
  assert.deepEqual(readWardrobe(storage), wardrobe);
  assert.equal(data.get("glow-parkour-v1"), "skin-original");
  data.set("glow-parkour-wardrobe-v1", "{bad");
  assert.deepEqual(readWardrobe(storage), {
    owned: [],
    equipped: null,
    timeOfDay: "morning",
  });
  const blocked = {
    getItem() {
      throw Error("blocked");
    },
    setItem() {
      throw Error("blocked");
    },
  };
  assert.deepEqual(readWardrobe(blocked), createWardrobe());
  assert.equal(writeWardrobe(blocked, wardrobe), false);
});
