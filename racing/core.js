import { routePoint } from "./routes.js";
import { separateCars } from "./contact.js";
import { makeHazards, safeLane, obstacleHit } from "./hazards.js";
// Pure race, route and garage rules. Distances are metres; speeds are metres/second.
export const BIOMES = [
  "高原草甸",
  "盘山峡谷",
  "废弃工厂",
  "旧日公路",
  "城市快速路",
  "霓虹长廊",
  "赛博夜城",
  "凌空桥廊",
  "云海仙境",
  "集装箱港区",
  "跨海长桥",
  "双层船桥",
  "中国风山峡",
];
export const TRACKS = [
  {
    id: "tour",
    name: "五境环线",
    subtitle: "草甸 → 峡谷 → 旧厂 → 荒路 → 城市",
    radius: 205,
    height: 24,
    phase: 0,
  },
  {
    id: "plateau",
    name: "云端高原",
    subtitle: "开阔草甸 · 高低起伏 · 长直道",
    radius: 225,
    height: 35,
    phase: 0,
  },
  {
    id: "mountain",
    name: "峡谷回旋",
    subtitle: "连续弯道 · 山地落差 · 护栏",
    radius: 185,
    height: 45,
    phase: 1,
  },
  {
    id: "factory",
    name: "钢铁余晖",
    subtitle: "废弃厂房 · 锈蚀烟囱 · 橙色落日",
    radius: 210,
    height: 20,
    phase: 2,
  },
  {
    id: "abandoned",
    name: "旧路重生",
    subtitle: "开裂旧路 · 野草 · 断垣",
    radius: 215,
    height: 27,
    phase: 3,
  },
  {
    id: "highway",
    name: "城市脉动",
    subtitle: "车流穿梭 · 楼群 · 山间快速路",
    radius: 245,
    height: 18,
    phase: 4,
  },
  {
    id: "tunnel",
    name: "霓虹长廊",
    subtitle: "环形灯带 · 滑梯式管廊 · 夜色",
    radius: 210,
    height: 22,
    theme: "tunnel",
    biome: 5,
  },
  {
    id: "cyber",
    name: "赛博夜城",
    subtitle: "霓虹高楼 · 光轨 · 繁忙夜路",
    radius: 235,
    height: 20,
    theme: "cyber",
    biome: 6,
  },
  {
    id: "sky",
    name: "凌空桥廊",
    subtitle: "半边透明玻璃 · 半边金属网格 · 云海",
    radius: 215,
    height: 42,
    theme: "sky",
    biome: 7,
  },
  {
    id: "china",
    name: "云海仙途",
    subtitle: "祥云 · 古亭 · 山间仙路",
    radius: 205,
    height: 40,
    theme: "china",
    biome: 8,
  },
  {
    id: "container",
    name: "箱港穿梭",
    subtitle: "箱顶跑道 · 箱内通道 · 港区吊机",
    radius: 250,
    height: 30,
    theme: "container",
    biome: 9,
  },
  {
    id: "ocean",
    name: "碧海长桥",
    subtitle: "海上斜拉桥 · 波光 · 岛屿",
    radius: 250,
    height: 30,
    theme: "ocean",
    biome: 10,
  },
  {
    id: "ship",
    name: "航海双层",
    subtitle: "轮船相连 · 上下两层 · 立体交叉",
    radius: 280,
    height: 30,
    theme: "ship",
    biome: 11,
  },
  {
    id: "gorge",
    name: "山河入画",
    subtitle: "中国风山峡 · 河水环绕 · 迎客松",
    radius: 240,
    height: 40,
    theme: "gorge",
    biome: 12,
  },
];
export const CARS = [
  {
    id: "apex",
    name: "逐风 GT",
    style: "gt",
    price: 0,
    max: 66,
    accel: 17,
    handling: 1,
    desc: "流线双门 · 均衡好开",
  },
  {
    id: "rally",
    name: "山猫 RX",
    style: "rally",
    price: 3000,
    max: 63,
    accel: 18,
    handling: 1.22,
    desc: "拉力宽体 · 草地损失更小",
  },
  {
    id: "muscle",
    name: "雷霆 V8",
    style: "muscle",
    price: 4500,
    max: 70,
    accel: 16,
    handling: 0.9,
    desc: "长机盖 · 直道强劲",
  },
  {
    id: "hyper",
    name: "极光 X",
    style: "hyper",
    price: 7000,
    max: 73,
    accel: 19,
    handling: 1.1,
    desc: "低趴超跑 · 碳纤维尾翼",
  },
];
export const SKINS = [
  {
    id: "aurora",
    name: "流光极光",
    color: 0x184c61,
    stripe: 0x83e8e8,
    iridescence: 1,
    price: 0,
    desc: "光线与视角改变时呈现青紫流光",
  },
  {
    id: "silver",
    name: "液态银",
    color: 0xa4b4be,
    stripe: 0x17222b,
    iridescence: 0.25,
    price: 0,
    desc: "冷银金属 · 黑色双条纹",
  },
  {
    id: "ember",
    name: "熔岩红",
    color: 0xb92620,
    stripe: 0xffcf72,
    iridescence: 0.45,
    price: 800,
    desc: "深红珠光 · 金色闪电",
  },
  {
    id: "midnight",
    name: "暗夜紫",
    color: 0x36224f,
    stripe: 0xcf81fa,
    iridescence: 1,
    price: 1200,
    desc: "紫黑渐变 · 幻彩赛车纹",
  },
  {
    id: "mint",
    name: "翡翠绿",
    color: 0x13714e,
    stripe: 0xb8f4c2,
    iridescence: 0.7,
    price: 1600,
    desc: "祖母绿金属 · 白金线条",
  },
  {
    id: "sunset",
    name: "日落金",
    color: 0xc88a28,
    stripe: 0x29222f,
    iridescence: 0.55,
    price: 2000,
    desc: "金铜色车漆 · 深色竞速纹",
  },
];
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const wrap = (n, m) => ((n % m) + m) % m;
export function makeTrack(id) {
  const spec = TRACKS.find((t) => t.id === id) || TRACKS[0],
    points = [],
    count = 720;
  let length = 0;
  for (let i = 0; i <= count; i++) {
    const a = (i / count) * Math.PI * 2,
      r = spec.radius + 28 * Math.sin(a * 3) + 16 * Math.sin(a * 5 + 0.7);
    const custom = routePoint(spec.id, i / count);
    const p = {
      x: custom?.[0] ?? Math.sin(a) * r,
      z: custom?.[2] ?? Math.cos(a) * r,
      y:
        custom?.[1] ??
        spec.height * (0.65 * Math.sin(a * 2) + 0.35 * Math.sin(a * 3)),
      biome:
        spec.biome ??
        (spec.id === "tour"
          ? Math.floor(((i % count) / count) * 5)
          : spec.phase),
    };
    if (i)
      length += Math.hypot(
        p.x - points[i - 1].x,
        p.y - points[i - 1].y,
        p.z - points[i - 1].z,
      );
    p.s = length;
    points.push(p);
  }
  return { spec, points, length };
}
export function roadAt(track, s) {
  const d = wrap(s, track.length),
    p = track.points;
  let low = 0,
    high = p.length - 1;
  while (high - low > 1) {
    const mid = (low + high) >> 1;
    if (p[mid].s <= d) low = mid;
    else high = mid;
  }
  const a = p[low],
    b = p[high],
    f = (d - a.s) / (b.s - a.s),
    dx = b.x - a.x,
    dz = b.z - a.z,
    l = Math.hypot(dx, dz),
    prev = p[(low - 1 + p.length - 1) % (p.length - 1)],
    next = p[(high + 1) % (p.length - 1)];
  const theta = Math.atan2(dx, dz),
    previousAngle = Math.atan2(a.x - prev.x, a.z - prev.z),
    nextAngle = Math.atan2(next.x - b.x, next.z - b.z),
    diff = Math.atan2(
      Math.sin(nextAngle - previousAngle),
      Math.cos(nextAngle - previousAngle),
    );
  return {
    x: a.x + (b.x - a.x) * f,
    y: a.y + (b.y - a.y) * f,
    z: a.z + (b.z - a.z) * f,
    tx: dx / l,
    tz: dz / l,
    nx: dz / l,
    nz: -dx / l,
    theta,
    pitch: Math.atan2(b.y - a.y, l),
    curvature: diff / (2 * (b.s - a.s)),
    biome: a.biome,
  };
}
export function newRace(trackId, carId) {
  const track = makeTrack(trackId),
    model = CARS.find((c) => c.id === carId) || CARS[0];
  const city = track.points
      .slice(0, -1)
      .filter((p) => p.biome === 4 || p.biome === 6),
    cityStart = city[0]?.s || 0,
    cityEnd = city.length
      ? track.points[track.points.indexOf(city.at(-1)) + 1].s
      : 0;
  return {
    hazards: makeHazards(track),
    trafficStart: cityStart,
    trafficLength: cityEnd - cityStart,
    track,
    laps: 2,
    time: 0,
    countdown: 3,
    status: "racing",
    paused: false,
    awarded: false,
    cars: Array.from({ length: 11 }, (_, i) => ({
      id: i,
      name: i === 0 ? "你" : `车手 ${String(i).padStart(2, "0")}`,
      model: i === 0 ? model : CARS[i % 4],
      s: -8 - Math.floor(i / 3) * 8,
      offset: [0, -4, 4][i % 3],
      speed: 0,
      nitro: 100,
      cooldown: 0,
      respawn: 0,
      protection: 0,
      crashes: 0,
      finished: 0,
      finishTime: Infinity,
      skill: 0.78 + (i % 5) * 0.035,
      phase: i * 0.71,
    })),
    traffic: Array.from({ length: city.length ? 20 : 0 }, (_, i) => ({
      s: cityStart + ((i + 0.5) / 20) * (cityEnd - cityStart),
      offset: (i % 2 ? 1 : -1) * 5.8,
      speed: 21 + (i % 4) * 2,
    })),
  };
}
export function standings(race) {
  return [...race.cars].sort(
    (a, b) => a.finishTime - b.finishTime || b.s - a.s || a.id - b.id,
  );
}
export function newOnlineRace(trackId, members) {
  if (!TRACKS.some((track) => track.id === trackId)) throw Error("赛道不存在");
  if (!Array.isArray(members) || members.length < 2 || members.length > 8)
    throw Error("联机比赛需要2到8位玩家");
  const slots = new Set();
  for (const member of members) {
    if (!member || !Number.isInteger(member.id) || member.id < 0 || member.id > 7 || slots.has(member.id))
      throw Error("玩家槽位无效");
    if (!CARS.some((car) => car.id === member.car) || !SKINS.some((skin) => skin.id === member.skin))
      throw Error("车辆或车漆不存在");
    slots.add(member.id);
  }
  const race = newRace(trackId, members[0].car);
  race.online = true;
  for (const car of race.cars) {
    const member = members.find((member) => member.id === car.id);
    car.human = Boolean(member);
    car.model = member ? CARS.find((model) => model.id === member.car) : CARS[car.id % CARS.length];
    car.car = car.model.id;
    car.skin = member ? member.skin : SKINS[car.id % SKINS.length].id;
    if (member) car.name = member.name;
    else car.name = `AI ${String(car.id + 1).padStart(2, "0")}`;
  }
  return race;
}
export function stepRace(r, input, delta) {
  if (r.paused || r.status !== "racing") return;
  const dt = clamp(delta, 0, 0.05);
  if (r.countdown > 0) {
    r.countdown = Math.max(0, r.countdown - dt);
    return;
  }
  const crossed = [];
  const finish = r.track.length * r.laps;
  for (const c of r.cars) {
    if (c.finished) continue;
    c.protection = Math.max(0, c.protection - dt);
    if (c.respawn > 0) {
      c.respawn = Math.max(0, c.respawn - dt);
      c.cooldown = Math.max(0, c.cooldown - dt);
      continue;
    }
    const road = roadAt(r.track, c.s),
      before = c.s;
    c.cooldown = Math.max(0, c.cooldown - dt);
    let accel,
      brake,
      boost = false;
    if (r.online ? c.human : c.id === 0) {
      const controls = (r.online ? input?.[c.id] : input) || {};
      const steer = Number.isFinite(controls.steer) ? clamp(controls.steer, -1, 1) : 0;
      accel = controls.throttle ? 1 : 0;
      brake = !!controls.brake;
      boost = !!controls.boost && c.nitro > 2 && !brake && accel > 0;
      c.nitro = clamp(c.nitro + (boost ? -27 : 11) * dt, 0, 100);
      c.offset +=
        steer *
        (2 + c.speed * 0.115) *
        c.model.handling *
        dt;
      c.steer = steer;
      // Inertia pushes the car towards the outside of fast corners.
      c.offset -= road.curvature * c.speed * c.speed * 0.02 * dt;
      c.offset = clamp(c.offset, -16, 16);
    } else {
      const target = safeLane(
        r.track,
        r.hazards,
        c,
        r.time,
        Math.sin(c.s * 0.004 + c.phase) * 4.7,
      );
      c.offset += (target - c.offset) * Math.min(1, dt * 1.3);
      const corner = clamp(1 - Math.abs(road.curvature) * 22, 0.66, 1),
        targetSpeed = c.model.max * c.skill * corner;
      accel = c.speed < targetSpeed ? 1 : 0;
      brake = c.speed > targetSpeed + 3;
      const ahead = r.cars.find(
        (o) =>
          o.id !== c.id &&
          !o.finished &&
          o.s > c.s &&
          o.s - c.s < 16 &&
          Math.abs(o.offset - c.offset) < 2.2,
      );
      if (ahead) c.offset += dt * 3 * (c.offset <= 0 ? -1 : 1);
      c.offset = clamp(c.offset, -7, 7);
    }
    c.boosting = boost;
    const offroad = Math.abs(c.offset) > 8.3,
      grass = c.model.style === "rally" ? 9 : 19;
    c.speed = clamp(
      c.speed +
        (accel * c.model.accel +
          (boost ? 22 : 0) -
          (brake ? 36 : 0) -
          2.4 -
          (offroad ? grass : 0) -
          c.speed * c.speed * 0.00065 -
          Math.sin(road.pitch) * 4) *
          dt,
      0,
      c.model.max + (boost ? 18 : 0),
    );
    if (offroad)
      c.speed = Math.min(c.speed, c.model.style === "rally" ? 44 : 34);
    c.s += c.speed * dt;
    if (obstacleHit(r, c)) continue;
    if (c.s >= finish) {
      c.finishTime =
        r.time + (dt * (finish - before)) / Math.max(0.0001, c.s - before);
      crossed.push(c);
    }
  }
  // Same-frame crossings must be sorted, not awarded in array order.
  crossed.sort((a, b) => a.finishTime - b.finishTime || a.id - b.id);
  let place = r.cars.filter((c) => c.finished).length;
  for (const c of crossed) {
    c.finished = ++place;
    c.s = finish;
  }
  const edge = ["sky", "container", "ocean", "ship"].includes(
    r.track.spec.theme,
  )
    ? 8.7
    : 16;
  for (let pass = 0; pass < 3; pass++)
    for (let i = 0; i < r.cars.length; i++)
      for (let j = i + 1; j < r.cars.length; j++)
        separateCars(r.cars[i], r.cars[j], r.track.length, edge);
  for (const t of r.traffic) {
    t.s =
      r.trafficStart +
      wrap(t.s - r.trafficStart + t.speed * dt, r.trafficLength);
    if (![4, 6].includes(roadAt(r.track, t.s).biome)) continue;
    for (const p of r.cars) {
      if (separateCars(p, t, r.track.length, edge, true)) {
        p.speed = Math.min(p.speed, t.speed) * 0.95;
        p.cooldown = 0.9;
      }
    }
  }
  r.time += dt;
  if (r.online
    ? r.cars.filter((car) => car.human).every((car) => car.finished)
    : r.cars[0].finished && r.cars.filter((c) => c.finished).length >= 3)
    r.status = "finished";
}
// Finish the remaining podium competitors using the same rules, without making the player wait.
export function completePodium(r) {
  if (r.online) return;
  if (!r.cars[0].finished) return;
  for (let i = 0; i < 18000 && r.status === "racing"; i++)
    stepRace(r, {}, 1 / 60);
}
export function newProfile() {
  return {
    version: 1,
    coins: 0,
    cars: ["apex"],
    skins: ["aurora", "silver"],
    car: "apex",
    skin: "aurora",
    races: 0,
    wins: 0,
    best: {},
  };
}
export function readProfile(raw) {
  const p = newProfile();
  try {
    const x = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!x || typeof x !== "object") return p;
    p.coins =
      Number.isSafeInteger(x.coins) && x.coins >= 0
        ? Math.min(x.coins, 100000000)
        : 0;
    for (const [key, catalog] of [
      ["cars", CARS],
      ["skins", SKINS],
    ])
      p[key] = [
        ...new Set([
          ...p[key],
          ...(Array.isArray(x[key]) ? x[key] : []).filter((id) =>
            catalog.some((c) => c.id === id),
          ),
        ]),
      ];
    if (p.cars.includes(x.car)) p.car = x.car;
    if (p.skins.includes(x.skin)) p.skin = x.skin;
    for (const k of ["races", "wins"])
      p[k] =
        Number.isSafeInteger(x[k]) && x[k] >= 0 ? Math.min(x[k], 1000000) : 0;
    if (x.best && typeof x.best === "object")
      for (const t of TRACKS) {
        const v = x.best[t.id];
        if (Number.isFinite(v) && v > 0) p.best[t.id] = v;
      }
  } catch {}
  return p;
}
export function purchase(p, key, id) {
  const catalog = key === "cars" ? CARS : key === "skins" ? SKINS : [];
  const item = catalog.find((c) => c.id === id);
  if (!item || p[key].includes(id) || p.coins < item.price) return false;
  p.coins -= item.price;
  p[key].push(id);
  return true;
}
export function equip(p, key, id) {
  if (!["cars", "skins"].includes(key) || !p[key].includes(id)) return false;
  p[key === "cars" ? "car" : "skin"] = id;
  return true;
}
export function settleRace(p, r) {
  if (r.status !== "finished" || !r.cars[0].finished || r.awarded) return 0;
  r.awarded = true;
  const reward = [0, 3000, 1500, 700][r.cars[0].finished] || 0;
  p.coins += reward;
  p.races++;
  if (r.cars[0].finished === 1) p.wins++;
  const id = r.track.spec.id,
    time = r.cars[0].finishTime;
  if (!p.best[id] || time < p.best[id]) p.best[id] = time;
  return reward;
}
