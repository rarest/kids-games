const KEY = "glow-parkour-wardrobe-v1";
export const OUTFITS = [
  ["academy", "青藤学园", "#e9eddf", "#324653", "#424f56", "#8daf88", "checks"],
  ["sailor", "晴海水手", "#f4efe4", "#304765", "#be714c", "#507a9b", "striped"],
  [
    "gardener",
    "花房园丁",
    "#eed3a4",
    "#657d58",
    "#805f48",
    "#ed9c94",
    "pocket",
  ],
  ["sprinter", "珊瑚运动", "#df7774", "#48566d", "#efe9d7", "#f5c96c", "trim"],
  [
    "explorer",
    "森林探险",
    "#bbaa7d",
    "#526b60",
    "#745941",
    "#e3ce99",
    "pocket",
  ],
  ["cloud", "云朵休闲", "#e7e9ed", "#86a4b5", "#e9d9c1", "#a1bccb", "solid"],
  [
    "lavender",
    "薰衣草午后",
    "#b7a5cf",
    "#e4dacf",
    "#787087",
    "#ece3f3",
    "checks",
  ],
  [
    "sunflower",
    "向阳花田",
    "#e8c25b",
    "#73866c",
    "#b17d57",
    "#f2e4b6",
    "pocket",
  ],
  ["moon", "月光漫步", "#4d607d", "#343c58", "#9daabf", "#e3d29d", "trim"],
  ["peach", "蜜桃野餐", "#e7a5a0", "#b89b83", "#f1dfc5", "#8baa95", "checks"],
  [
    "mariner",
    "深海领航",
    "#376976",
    "#e4dbca",
    "#525962",
    "#d6b783",
    "striped",
  ],
  ["cocoa", "可可暖冬", "#a57e65", "#594f49", "#c5a085", "#e6cba4", "trim"],
  ["mint", "薄荷骑行", "#8cbbad", "#547789", "#efe5d6", "#ead189", "trim"],
  ["paper", "纸飞机", "#ebe7dc", "#b39978", "#715f53", "#b95150", "solid"],
  ["retro", "复古球场", "#ad6a4d", "#e6d8ad", "#688178", "#eac071", "striped"],
  [
    "orchard",
    "果园工作服",
    "#adb274",
    "#716e52",
    "#785b43",
    "#e9c481",
    "pocket",
  ],
  ["rose", "玫瑰旅人", "#b4768c", "#665976", "#d9c4b7", "#ead7a5", "trim"],
  ["river", "溪谷露营", "#739baa", "#9ba78d", "#5e695e", "#d7c78e", "pocket"],
  [
    "festival",
    "花火夏日",
    "#d09f77",
    "#52577c",
    "#e8dac5",
    "#eee8d5",
    "checks",
  ],
  [
    "starlight",
    "星光舞步",
    "#716993",
    "#b6abbf",
    "#e4d5bb",
    "#efc972",
    "striped",
  ],
].map(([id, name, top, pants, shoes, accent, pattern]) => ({
  id,
  name,
  price: 2,
  top,
  pants,
  shoes,
  accent,
  pattern,
}));
const ids = new Set(OUTFITS.map((o) => o.id)),
  times = new Set(["night", "dawn", "morning"]);
export function createWardrobe(raw) {
  raw = raw && typeof raw === "object" ? raw : {};
  const owned = [
    ...new Set(
      (Array.isArray(raw.owned) ? raw.owned : []).filter((id) => ids.has(id)),
    ),
  ];
  return {
    owned,
    equipped: owned.includes(raw.equipped) ? raw.equipped : null,
    timeOfDay: times.has(raw.timeOfDay) ? raw.timeOfDay : "morning",
  };
}
export function buyOutfit(profile, wardrobe, id) {
  const outfit = OUTFITS.find((o) => o.id === id);
  if (!outfit || wardrobe.owned.includes(id) || profile.coins < 2) return false;
  profile.coins -= 2;
  wardrobe.owned.push(id);
  return true;
}
export function equipOutfit(wardrobe, id) {
  if (id !== null && !wardrobe.owned.includes(id)) return false;
  wardrobe.equipped = id;
  return true;
}
export function readWardrobe(storage) {
  try {
    return createWardrobe(JSON.parse(storage.getItem(KEY)));
  } catch {
    return createWardrobe();
  }
}
export function writeWardrobe(storage, wardrobe) {
  try {
    storage.setItem(KEY, JSON.stringify(createWardrobe(wardrobe)));
    return true;
  } catch {
    return false;
  }
}
