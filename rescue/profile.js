import { createCampaign, completeArea, availableAreas } from "./campaign.js";
export const PROFILE_KEY = "rescue-rangers-3d-v1";
const number = (v, fallback = 0, max = 1e9) =>
  Number.isFinite(v) && v >= 0 ? Math.min(max, Math.floor(v)) : fallback;
export function normalizeProfile(raw = {}) {
  const campaign = createCampaign();
  for (const id of Array.isArray(raw?.campaign?.completed)
    ? raw.campaign.completed
    : [])
    if (typeof id === "string") completeArea(campaign, id);
  if (availableAreas(campaign).includes(raw?.campaign?.current))
    campaign.current = raw.campaign.current;
  const o = raw?.options ?? {},
    options = {
      music: o.music !== false,
      sound: o.sound !== false,
      quality: ["auto", "high", "low"].includes(o.quality) ? o.quality : "auto",
      players: o.players === 2 ? 2 : 1,
      character: o.character === "dale" ? "dale" : "chip",
    };
  const r = raw?.run;
  let run = null;
  if (
    r &&
    availableAreas(campaign).includes(r.areaId) &&
    Array.isArray(r.lives) &&
    r.lives.length > 0 &&
    r.lives.every((n) => Number.isFinite(n) && n >= 0)
  ) {
    const players = r.players === 2 ? 2 : 1;
    run = {
      areaId: r.areaId,
      score: number(r.score),
      flowers: number(r.flowers),
      stars: number(r.stars),
      lives: Array.from({ length: players }, (_, i) =>
        number(r.lives[i], 3, 99),
      ),
      players,
      character: r.character === "dale" ? "dale" : "chip",
    };
    if (run.lives.every((life) => life === 0)) run = null;
  }
  return { version: 1, campaign, options, run };
}
export function createProfile(storage) {
  if (storage === undefined) {
    try {
      storage = globalThis.localStorage;
    } catch {
      storage = {
        getItem() {
          throw new Error("storage denied");
        },
        setItem() {
          throw new Error("storage denied");
        },
      };
    }
  }
  let error = "";
  return {
    load() {
      try {
        const raw = storage.getItem(PROFILE_KEY);
        error = "";
        try {
          return normalizeProfile(raw ? JSON.parse(raw) : {});
        } catch {
          return normalizeProfile();
        }
      } catch {
        error = "进度读取失败，本次从新冒险开始。";
        return normalizeProfile();
      }
    },
    save(value) {
      try {
        storage.setItem(PROFILE_KEY, JSON.stringify(normalizeProfile(value)));
        error = "";
        return { ok: true };
      } catch {
        error = "进度保存失败，请检查浏览器存储空间。";
        return { ok: false, error };
      }
    },
    get error() {
      return error;
    },
  };
}
