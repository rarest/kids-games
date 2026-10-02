const NORMAL = [
  ["red", "朱砂红", "#ed4949"],
  ["orange", "橘子橙", "#f18a3c"],
  ["amber", "琥珀金", "#e6ac28"],
  ["yellow", "柠檬黄", "#e9d344"],
  ["lime", "青柠绿", "#a6ce45"],
  ["green", "草叶绿", "#57ae67"],
  ["jade", "翡翠绿", "#36ad8d"],
  ["teal", "海湾青", "#309eaa"],
  ["cyan", "晴空蓝", "#4dbce0"],
  ["blue", "湖水蓝", "#488dde"],
  ["indigo", "靛青", "#5d6fc8"],
  ["violet", "紫罗兰", "#8e67ce"],
  ["purple", "葡萄紫", "#ad5fbd"],
  ["magenta", "玫红", "#da5b9e"],
  ["pink", "樱花粉", "#ed91b6"],
  ["coral", "珊瑚", "#e97671"],
  ["brown", "可可", "#a57a62"],
  ["sand", "沙滩", "#cbb18a"],
  ["silver", "银灰", "#a4afbd"],
  ["navy", "深海", "#466485"],
];
const FINE = [
  ["宣纸", "rice"],
  ["水彩", "watercolor"],
  ["和纸", "washi"],
  ["亚麻", "linen"],
  ["金箔", "gold-leaf"],
  ["银箔", "silver-leaf"],
  ["珠光", "pearl"],
  ["格纹", "plaid"],
  ["条纹", "stripes"],
  ["点彩", "dots"],
  ["云纹", "clouds"],
  ["波纹", "waves"],
  ["木纹", "wood"],
  ["大理石", "marble"],
  ["星纸", "stars"],
  ["花瓣", "petals"],
  ["雪纹", "snow"],
  ["编织", "woven"],
  ["锦缎", "brocade"],
  ["糖纸", "candy"],
];
const HIDDEN = [
  ["星河", "galaxy"],
  ["极光", "aurora"],
  ["萤火", "fireflies"],
  ["流星", "meteor"],
  ["焰火", "fireworks"],
  ["冰晶", "ice-crystals"],
  ["熔岩", "lava"],
  ["雷光", "lightning"],
  ["樱吹雪", "cherry-fall"],
  ["落叶", "autumn-leaves"],
  ["海泡", "sea-foam"],
  ["月光", "moonlight"],
  ["日冕", "corona"],
  ["彩虹", "rainbow"],
  ["幽灵", "ghost"],
  ["像素", "pixel-sparks"],
  ["爱心", "hearts"],
  ["音符", "music-notes"],
  ["钻石", "diamond"],
  ["时光", "clockwork"],
];
export const SKINS = [
  ...NORMAL.map(([id, name, color], i) => ({
    id,
    name,
    tier: "normal",
    color,
    pattern: "plain",
    price: i ? 20 : 0,
    winsRequired: 0,
    effect: "none",
  })),
  ...FINE.map(([name, pattern], i) => ({
    id: `fine-${pattern}`,
    name,
    tier: "fine",
    color: NORMAL[(i * 7 + 2) % 20][2],
    pattern,
    price: 60,
    winsRequired: 0,
    effect: "sheen",
  })),
  ...HIDDEN.map(([name, effect], i) => ({
    id: `hidden-${effect}`,
    name,
    tier: "hidden",
    color: NORMAL[(i * 3 + 9) % 20][2],
    pattern: "foil",
    price: 100,
    winsRequired: i + 1,
    effect,
  })),
];
const skinById = new Map(SKINS.map((s) => [s.id, s]));
const validNumber = (n) =>
  typeof n === "number" && Number.isFinite(n) && n >= 0;
const integer = (n) =>
  validNumber(n) ? Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n)) : 0;
export function createProfile(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) raw = {};
  const owned = [
    ...new Set([
      "red",
      ...(Array.isArray(raw.owned) ? raw.owned : []).filter((id) =>
        skinById.has(id),
      ),
    ]),
  ];
  const settled = [
    ...new Set(
      (Array.isArray(raw.settled) ? raw.settled : []).filter(
        (id) => typeof id === "string" && id.length > 0 && id.length <= 128,
      ),
    ),
  ];
  const rewardReceipts = [
    ...new Set(
      (Array.isArray(raw.rewardReceipts) ? raw.rewardReceipts : []).filter(
        (id) => typeof id === "string" && id.length <= 160,
      ),
    ),
  ];
  return {
    coins: integer(raw.coins),
    wins: integer(raw.wins),
    owned,
    selected: owned.includes(raw.selected) ? raw.selected : "red",
    settled,
    rewardReceipts,
  };
}
export function buySkin(profile, id) {
  const skin = skinById.get(id);
  if (
    !skin ||
    skin.tier === "hidden" ||
    profile.owned.includes(id) ||
    profile.coins < skin.price
  )
    return false;
  profile.coins -= skin.price;
  profile.owned.push(id);
  return true;
}
export function equipSkin(profile, id) {
  if (!skinById.has(id) || !profile.owned.includes(id)) return false;
  profile.selected = id;
  return true;
}
export function settleRun(profile, game) {
  if (
    !game ||
    game.mode !== "over" ||
    typeof game.runId !== "string" ||
    !game.runId ||
    game.runId.length > 128 ||
    !validNumber(game.peak) ||
    game.peak > 1 ||
    profile.settled.includes(game.runId)
  )
    return 0;
  const won = game.winner === 0,
    reward = Math.floor(game.peak * 100) + (won ? 50 : 0);
  profile.coins = Math.min(Number.MAX_SAFE_INTEGER, profile.coins + reward);
  if (won) profile.wins = Math.min(Number.MAX_SAFE_INTEGER, profile.wins + 1);
  profile.settled.push(game.runId);
  return reward;
}
// Rewards are receipts of actual collected objects, not cumulative win unlocks.
export function collectReward(profile, game, event) {
  if (
    !game ||
    game.winner !== 0 ||
    !["reward", "paused"].includes(game.mode) ||
    (game.mode === "paused" && game.resumeMode !== "reward") ||
    event?.id !== 0 ||
    !["coin", "chest"].includes(event.type) ||
    profile.settled.includes(game.runId)
  )
    return null;
  const item = game.rewards?.[event.type === "coin" ? "coins" : "chests"].find(
    (c) => c.id === event.rewardId,
  );
  if (!item?.collected || !game.events.includes(event)) return null;
  const receipt = game.runId + ":" + event.type + ":" + item.id;
  if (profile.rewardReceipts.includes(receipt)) return null;
  profile.rewardReceipts.push(receipt);
  if (event.type === "chest") {
    const remaining = SKINS.filter(
      (s) => s.tier === "hidden" && !profile.owned.includes(s.id),
    );
    if (remaining.length) {
      const skin = remaining[Math.floor(Math.random() * remaining.length)];
      profile.owned.push(skin.id);
      item.prize = { type: "skin", skin: skin.id };
      return item.prize;
    }
  }
  const amount = event.type === "coin" ? item.amount : 50;
  profile.coins = Math.min(Number.MAX_SAFE_INTEGER, profile.coins + amount);
  item.prize = { type: "coins", amount };
  return item.prize;
}
export function rewardSummary(game) {
  const prizes = [
    ...(game.rewards?.coins || []),
    ...(game.rewards?.chests || []),
  ]
    .map((c) => c.prize)
    .filter(Boolean);
  return {
    coins: prizes
      .filter((p) => p.type === "coins")
      .reduce((n, p) => n + p.amount, 0),
    skins: prizes.filter((p) => p.type === "skin").length,
  };
}
