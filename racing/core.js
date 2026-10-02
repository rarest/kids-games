// Pure race, route and garage rules. Distances are metres; speeds are metres/second.
export const BIOMES = [
  "高原草甸",
  "盘山峡谷",
  "废弃工厂",
  "旧日公路",
  "城市快速路",
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
    const p = {
      x: Math.sin(a) * r,
      z: Math.cos(a) * r,
      y: spec.height * (0.65 * Math.sin(a * 2) + 0.35 * Math.sin(a * 3)),
      biome:
        spec.id === "tour"
          ? Math.floor(((i % count) / count) * 5)
          : (i % count) / count < 0.6
            ? spec.phase
            : (spec.phase + 1 + Math.floor(((i % count) / count - 0.6) / 0.1)) %
              5,
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
  const city = track.points.slice(0, -1).filter((p) => p.biome === 4),
    cityStart = city[0].s,
    cityEnd = track.points[track.points.indexOf(city.at(-1)) + 1].s;
  return {
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
      finished: 0,
      finishTime: Infinity,
      skill: 0.78 + (i % 5) * 0.035,
      phase: i * 0.71,
    })),
    traffic: Array.from({ length: 20 }, (_, i) => ({
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
    const road = roadAt(r.track, c.s),
      before = c.s;
    c.cooldown = Math.max(0, c.cooldown - dt);
    let accel,
      brake,
      boost = false;
    if (c.id === 0) {
      accel = input.throttle ? 1 : 0;
      brake = !!input.brake;
      boost = !!input.boost && c.nitro > 2 && !brake && accel > 0;
      c.nitro = clamp(c.nitro + (boost ? -27 : 11) * dt, 0, 100);
      c.offset +=
        clamp(input.steer || 0, -1, 1) *
        (2 + c.speed * 0.115) *
        c.model.handling *
        dt;
      c.steer = clamp(input.steer || 0, -1, 1);
      // Inertia pushes the car towards the outside of fast corners.
      c.offset -= road.curvature * c.speed * c.speed * 0.02 * dt;
      c.offset = clamp(c.offset, -16, 16);
    } else {
      const target = Math.sin(c.s * 0.004 + c.phase) * 4.7;
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
  for (let i = 0; i < r.cars.length; i++)
    for (let j = i + 1; j < r.cars.length; j++) {
      const a = r.cars[i],
        b = r.cars[j];
      if (a.finished || b.finished || a.cooldown || b.cooldown) continue;
      if (Math.abs(a.s - b.s) < 4.4 && Math.abs(a.offset - b.offset) < 1.9) {
        a.speed *= 0.83;
        b.speed *= 0.83;
        a.cooldown = b.cooldown = 0.7;
        const sign = a.offset >= b.offset ? 1 : -1;
        a.offset = clamp(a.offset + sign * 0.45, -16, 16);
        b.offset = clamp(b.offset - sign * 0.45, -16, 16);
      }
    }
  for (const t of r.traffic) {
    t.s =
      r.trafficStart +
      wrap(t.s - r.trafficStart + t.speed * dt, r.trafficLength);
    if (roadAt(r.track, t.s).biome !== 4) continue;
    for (const p of r.cars) {
      const distance = Math.abs(
        wrap(p.s - t.s + r.track.length / 2, r.track.length) -
          r.track.length / 2,
      );
      if (
        distance < 4.5 &&
        Math.abs(p.offset - t.offset) < 2 &&
        !p.cooldown &&
        !p.finished
      ) {
        p.speed *= 0.6;
        p.cooldown = 0.9;
      }
    }
  }
  r.time += dt;
  if (r.cars[0].finished && r.cars.filter((c) => c.finished).length >= 3)
    r.status = "finished";
}
// Finish the remaining podium competitors using the same rules, without making the player wait.
export function completePodium(r) {
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
