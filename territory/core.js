import {
  disk,
  smoothCoast,
  coastRoute,
  segmentInside,
  regionArea,
  containsRegion,
  nearestBoundary,
  crossing,
  captureShape,
  union,
  difference,
  segmentCross,
  segmentDistance,
  nearestSegment,
  simplifyPath,
  clamp,
} from "./regions.js?v=20261002vector";
const COLORS = ["#ed4949", "#4189ee", "#f3b63a", "#a269db"];
export function random(g) {
  g.rng = (g.rng + 0x6d2b79f5) >>> 0;
  let t = g.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function event(g, type, id, data = {}) {
  g.events.push({ type, id, time: g.time, ...data });
  if (g.events.length > 100) g.events.splice(0, g.events.length - 100);
}
export function createGame({
  seed = Date.now(),
  cols = 88,
  rows = 76,
  bots = 3,
} = {}) {
  cols = clamp(Math.floor(Number(cols) || 88), 7, 100);
  rows = clamp(Math.floor(Number(rows) || 76), 7, 100);
  const numeric =
    typeof seed === "number"
      ? seed
      : Array.from(String(seed)).reduce(
          (n, c) => Math.imul(n, 31) + c.charCodeAt(0),
          0,
        );
  const g = {
    seed,
    cols,
    rows,
    rng: numeric >>> 0,
    players: [],
    territories: [],
    areas: [],
    mode: "playing",
    winner: null,
    time: 0,
    peak: 0,
    events: [],
    revision: 1,
    speed: 4.5,
    runId:
      globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
  };
  const r = Math.min(cols, rows) * (0.345 + random(g) * 0.025),
    c = { x: cols / 2, y: rows / 2, r };
  g.boundary = c;
  g.world = smoothCoast(
    c.x,
    c.y,
    r,
    random(g) * Math.PI * 2,
    random(g) * Math.PI * 2,
  );
  g.worldArea = regionArea(g.world);
  g.initialDisks = [];
  const n = 1 + clamp(Math.floor(Number(bots) || 0), 0, 3),
    startRadius = Math.min(1.45, r * 0.15);
  for (let id = 0; id < n; id++) {
    const a = Math.PI + (id * Math.PI * 2) / n,
      d = r * (r > 8 ? 0.66 : 0.5),
      x = c.x + Math.cos(a) * d,
      y = c.y + Math.sin(a) * d;
    g.players.push({
      id,
      x,
      y,
      color: COLORS[id],
      name: id ? `纸片 ${id}` : "你",
      alive: true,
      cooldown: 0,
      trail: [],
      stroke: [],
      pending: [],
      route: [],
      hunt: null,
      retreat: false,
      thinkAt: 0,
    });
    g.initialDisks.push({ x, y, r: startRadius });
    g.territories.push(disk(x, y, startRadius));
    g.areas.push(regionArea(g.territories[id]));
  }
  g.startTerritories = g.territories.slice();
  g.peak = coverage(g, 0);
  return g;
}
export const coverage = (g, id) =>
  clamp((g.areas[id] || 0) / g.worldArea, 0, 1);
function clear(p) {
  p.trail = [];
  p.stroke = [];
  p.pending = [];
  p.exit = null;
}
function homePoint(g, p) {
  const own = g.territories[p.id];
  if (containsRegion(own, p.x, p.y)) return { x: p.x, y: p.y };
  return nearestBoundary(own, p);
}
function cut(g, p) {
  if (!p.stroke.length) return;
  clear(p);
  p.route = [];
  p.hunt = null;
  p.retreat = false;
  const q = homePoint(g, p);
  if (q) {
    p.x = q.x;
    p.y = q.y;
    p.cooldown = 0.8;
  } else p.alive = false;
  event(g, "cut", p.id);
}
function rewards(g) {
  if (g.rewards) return;
  const c = g.boundary,
    phase = random(g) * Math.PI * 2;
  g.rewards = { coins: [], chests: [] };
  for (let i = 0; i < 60; i++) {
    const a = i * 2.399 + phase;
    let r = Math.sqrt((i + 0.5) / 60) * (c.r - 1);
    while (
      !containsRegion(g.world, c.x + Math.cos(a) * r, c.y + Math.sin(a) * r)
    )
      r *= 0.96;
    g.rewards.coins.push({
      id: i,
      x: c.x + Math.cos(a) * r,
      y: c.y + Math.sin(a) * r,
      collected: false,
      amount: 5,
    });
  }
  for (let i = 0; i < 3; i++) {
    const a = phase + (i * Math.PI * 2) / 3;
    g.rewards.chests.push({
      id: i,
      x: c.x + Math.cos(a) * c.r * 0.65,
      y: c.y + Math.sin(a) * c.r * 0.65,
      collected: false,
    });
  }
}
function result(g) {
  g.peak = Math.max(g.peak, coverage(g, 0));
  for (const p of g.players)
    if (p.alive && g.areas[p.id] < 1e-7) {
      p.alive = false;
      clear(p);
      p.route = [];
      event(g, "eliminated", p.id);
    }
  if (g.mode !== "playing") return;
  const winner = g.areas.findIndex((a) => g.worldArea - a < 1e-6);
  if (winner >= 0) {
    g.winner = winner;
    if (winner === 0) g.peak = 1;
    g.mode = winner === 0 ? "reward" : "over";
    for (const p of g.players) clear(p);
    if (winner === 0) rewards(g);
    event(g, "win", winner);
  } else if (!g.players[0].alive) {
    g.mode = "over";
    event(g, "end", 0);
  }
}
function capture(g, p) {
  const before = g.areas[p.id],
    next = captureShape(g.territories[p.id], p.stroke, p.pending, g.world);
  g.territories[p.id] = next;
  g.areas[p.id] = regionArea(next);
  for (const other of g.players)
    if (other.id !== p.id) {
      g.territories[other.id] = difference(g.territories[other.id], next);
      g.areas[other.id] = regionArea(g.territories[other.id]);
    }
  clear(p);
  g.revision++;
  if (g.areas[p.id] > before + 1e-7)
    event(g, "capture", p.id, { area: g.areas[p.id] - before });
  result(g);
  for (const other of g.players)
    if (
      other.id !== p.id &&
      other.alive &&
      !other.stroke.length &&
      !containsRegion(g.territories[other.id], other.x, other.y)
    ) {
      const q = homePoint(g, other);
      if (q) {
        other.x = q.x;
        other.y = q.y;
        other.cooldown = 0.8;
        other.route = [];
        event(g, "displaced", other.id);
      }
    }
}
function trace(p, q) {
  const last = p.stroke.at(-1);
  if (last && Math.hypot(last.x - q.x, last.y - q.y) < 1e-7) return;
  if (last)
    for (let i = 1; i < p.stroke.length - 2; i++) {
      const a = p.stroke[i - 1],
        b = p.stroke[i],
        cross = segmentCross(a, b, last, q);
      if (!cross || cross.t < 1e-7 || cross.u < 1e-7) continue;
      const ring = [
        [cross.x, cross.y],
        ...p.stroke.slice(i).map((v) => [v.x, v.y]),
        [cross.x, cross.y],
      ];
      if (regionArea([[ring]]) > 1e-5) p.pending = union(p.pending, [[ring]]);
    }
  const previous = p.stroke.at(-2);
  if (previous && last) {
    const ax = last.x - previous.x,
      ay = last.y - previous.y,
      bx = q.x - last.x,
      by = q.y - last.y;
    if (ax * bx + ay * by >= 0 && Math.abs(ax * by - ay * bx) < 1e-8)
      p.stroke.pop();
  }
  p.stroke.push({ x: q.x, y: q.y });
  if (p.stroke.length > 4096) {
    let tolerance = 0.003;
    do {
      p.stroke = simplifyPath(p.stroke, tolerance);
      tolerance *= 2;
    } while (p.stroke.length > 4096);
  }
  p.trail = p.stroke;
}
function collectAlong(g, a, b) {
  for (const [type, items, radius] of [
    ["coin", g.rewards.coins, 0.65],
    ["chest", g.rewards.chests, 0.85],
  ])
    for (const item of items) {
      const q = nearestSegment(item, [a.x, a.y], [b.x, b.y]);
      if (!item.collected && Math.hypot(q.x - item.x, q.y - item.y) < radius) {
        item.collected = true;
        event(g, type, 0, {
          rewardId: item.id,
          ...(type === "coin" ? { amount: item.amount } : {}),
        });
      }
    }
}
export function movePlayer(g, id, x, y) {
  const p = g.players[id];
  if (
    !["playing", "reward"].includes(g.mode) ||
    !p?.alive ||
    p.cooldown > 0 ||
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !containsRegion(g.world, x, y)
  )
    return false;
  const from = { x: p.x, y: p.y },
    to = { x, y };
  if (!segmentInside(g.world, from, to)) return false;
  if (g.mode === "reward") {
    p.x = x;
    p.y = y;
    if (id === 0) collectAlong(g, from, to);
    return true;
  }
  // Split at every actual boundary crossing, including thin remnants. Sampling
  // frame endpoints misses narrow land and creates invisible return gaps.
  const times = [0, 1],
    dx = x - from.x,
    dy = y - from.y;
  for (const poly of g.territories[id])
    for (const ring of poly)
      for (let i = 1; i < ring.length; i++) {
        const q = segmentCross(
          from,
          to,
          { x: ring[i - 1][0], y: ring[i - 1][1] },
          { x: ring[i][0], y: ring[i][1] },
        );
        if (q && q.t > 1e-9 && q.t < 1 - 1e-9) times.push(q.t);
      }
  times.sort((a, b) => a - b);
  const distinct = times.filter((t, i) => !i || t - times[i - 1] > 1e-9);
  for (let n = 1; n < distinct.length; n++) {
    const ta = distinct[n - 1],
      tb = distinct[n],
      a = { x: from.x + dx * ta, y: from.y + dy * ta },
      b = { x: from.x + dx * tb, y: from.y + dy * tb };
    const inside = containsRegion(
      g.territories[id],
      (a.x + b.x) / 2,
      (a.y + b.y) / 2,
    );
    if (inside && p.stroke.length) {
      trace(p, a);
      p.x = a.x;
      p.y = a.y;
      capture(g, p);
      if (g.mode === "over" || !p.alive) return false;
      return movePlayer(g, id, x, y); // Recompute crossings after the union.
    }
    for (const other of g.players)
      if (other.id !== id && other.alive && other.stroke.length > 1)
        for (let i = 1; i < other.stroke.length; i++)
          if (
            segmentDistance(a, b, other.stroke[i - 1], other.stroke[i]) <=
            0.25 ** 2
          ) {
            cut(g, other);
            break;
          }
    if (!inside) {
      if (!p.stroke.length) {
        p.exit = a;
        p.stroke = [{ x: a.x, y: a.y }];
        p.trail = p.stroke;
      }
      trace(p, b);
    }
    p.x = b.x;
    p.y = b.y;
  }
  // Ending exactly on an outer boundary is already a real return.
  if (p.stroke.length && containsRegion(g.territories[id], x, y)) {
    trace(p, to);
    capture(g, p);
  }
  return g.mode !== "over" && p.alive;
}
function huntPoint(g, p) {
  let best = null,
    distance = 14;
  for (const other of g.players)
    if (other.id !== p.id && other.alive && other.stroke.length > 1)
      for (let i = 1; i < other.stroke.length; i++) {
        const a = other.stroke[i - 1],
          b = other.stroke[i],
          q = nearestSegment(p, [a.x, a.y], [b.x, b.y]),
          d = Math.hypot(q.x - p.x, q.y - p.y);
        if (d < distance) {
          distance = d;
          best = { x: q.x, y: q.y, id: other.id };
        }
      }
  return best;
}
function safeRoute(g, p, points) {
  const route = [];
  let from = { x: p.x, y: p.y };
  for (let q of points) {
    if (!containsRegion(g.world, q.x, q.y)) q = nearestBoundary(g.world, q);
    if (!q) continue;
    if (!segmentInside(g.world, from, q))
      route.push({ x: g.boundary.x, y: g.boundary.y });
    route.push({ x: q.x, y: q.y });
    from = q;
  }
  return route;
}
function steer(g, p, x, y, budget) {
  const wanted = { x, y };
  if (containsRegion(g.world, x, y) && segmentInside(g.world, p, wanted)) {
    movePlayer(g, p.id, x, y);
    return;
  }
  const q = nearestBoundary(g.world, wanted);
  if (!q) return;
  const points = segmentInside(g.world, p, q) ? [q] : coastRoute(g.world, p, q);
  for (const target of points) {
    const dx = target.x - p.x,
      dy = target.y - p.y,
      d = Math.hypot(dx, dy);
    if (d < 1e-9) continue;
    const travel = Math.min(d, budget);
    if (!movePlayer(g, p.id, p.x + (dx / d) * travel, p.y + (dy / d) * travel))
      break;
    budget -= travel;
    if (budget <= 1e-8) break;
  }
}
function plan(g, p) {
  if (p.retreat || p.stroke.length) {
    const home = homePoint(g, p);
    p.route = home ? safeRoute(g, p, [{ x: home.x, y: home.y }]) : [];
    p.retreat = true;
    return;
  }
  const b = g.boundary,
    a = random(g) * Math.PI * 2,
    own = g.territories[p.id],
    boundary = nearestBoundary(own, {
      x: p.x + Math.cos(a) * b.r,
      y: p.y + Math.sin(a) * b.r,
    });
  if (!boundary) return;
  const dx = Math.cos(a),
    dy = Math.sin(a),
    len = 2.5 + random(g) * 3,
    side = random(g) > 0.5 ? 1 : -1;
  const route = [
    { x: boundary.x, y: boundary.y },
    { x: boundary.x + dx * len, y: boundary.y + dy * len },
    {
      x: boundary.x + dx * len - dy * 2 * side,
      y: boundary.y + dy * len + dx * 2 * side,
    },
    { x: boundary.x - dy * 2 * side, y: boundary.y + dx * 2 * side },
    { x: p.x, y: p.y },
  ];
  p.route = safeRoute(g, p, route);
}
export function stepGame(g, dt, input = { x: 0, y: 0 }) {
  if (
    !["playing", "reward"].includes(g.mode) ||
    !Number.isFinite(dt) ||
    dt <= 0
  )
    return;
  result(g);
  let remaining = Math.min(dt, 5);
  while (remaining > 1e-8 && ["playing", "reward"].includes(g.mode)) {
    const slice = Math.min(remaining, 1 / 30);
    remaining -= slice;
    g.time += slice;
    for (const p of g.players) p.cooldown = Math.max(0, p.cooldown - slice);
    const dx = Number(input.x) || 0,
      dy = Number(input.y) || 0,
      length = Math.hypot(dx, dy),
      p = g.players[0];
    if (length && p.alive) {
      const speed = g.speed * (input.slow ? 0.65 : 1);
      steer(
        g,
        p,
        p.x + (dx / Math.max(1, length)) * speed * slice,
        p.y + (dy / Math.max(1, length)) * speed * slice,
        speed * slice,
      );
    }
    if (g.mode !== "playing") continue;
    for (const bot of g.players.slice(1))
      if (bot.alive && bot.cooldown <= 0) {
        if (bot.retreat && !bot.stroke.length) bot.retreat = false;
        if (g.time >= bot.thinkAt) {
          bot.thinkAt = g.time + 0.35 + bot.id * 0.04;
          const target =
            !bot.retreat && bot.stroke.length < 180 ? huntPoint(g, bot) : null;
          if (target) {
            bot.hunt = target.id;
            bot.route = safeRoute(g, bot, [target]);
          } else if (bot.hunt !== null) {
            bot.hunt = null;
            bot.retreat = true;
            plan(g, bot);
          }
        }
        if (!bot.route.length) plan(g, bot);
        const target = bot.route[0];
        if (!target) continue;
        const dx = target.x - bot.x,
          dy = target.y - bot.y,
          d = Math.hypot(dx, dy),
          travel = Math.min(d, g.speed * 0.78 * slice);
        if (d < 1e-7) {
          bot.route.shift();
          continue;
        }
        const moved = movePlayer(
          g,
          bot.id,
          bot.x + (dx / d) * travel,
          bot.y + (dy / d) * travel,
        );
        if (!moved) bot.route = [];
        else if (d <= travel + 1e-8) bot.route.shift();
      }
  }
}
export function finishRun(g) {
  if (g.mode === "over") return false;
  result(g);
  if (g.mode !== "over") {
    g.mode = "over";
    event(g, "end", 0);
  }
  return true;
}
