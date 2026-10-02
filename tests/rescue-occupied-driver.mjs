import { createGame, stepGame } from "../rescue/core.js";
import { getLevel } from "../rescue/levels.js";

// Deterministic input driver for full authored levels. No writes to live state except stepGame.
// Look-ahead only steps clones; cooperative input retains the original player slots.
const observers = new WeakMap();
const dt = 1 / 60,
  clamp = (n, a, b) => Math.max(a, Math.min(b, n));
function supports(s) {
  return [
    ...s.platforms,
    ...s.objects
      .filter(
        (o) =>
          o.active && !o.heldBy && !o.thrown && o.grounded && o.kind !== "ball",
      )
      .map((o) => ({
        id: o.id,
        x: o.x - o.w / 2,
        y: o.y + o.h,
        w: o.w,
        h: o.h,
        oneWay: false,
      })),
  ];
}
function reachable(a, b) {
  const rise = b.y - a.y;
  if (rise > 3.5 || rise < -9) return false;
  const d = 196 - 56 * rise;
  if (d < 0) return false;
  const gap = Math.max(0, b.x - a.x - a.w, a.x - b.x - b.w);
  return gap < (7.2 * (14 + Math.sqrt(d))) / 28 - 0.15;
}
function route(platforms, from, exit) {
  const queue = [[from]],
    seen = new Set([from.id]);
  while (queue.length) {
    const path = queue.shift(),
      a = path.at(-1);
    if (exit.x >= a.x && exit.x <= a.x + a.w && Math.abs(exit.y - a.y) < 0.2)
      return path;
    for (const b of platforms)
      if (!seen.has(b.id) && reachable(a, b)) {
        seen.add(b.id);
        queue.push([...path, b]);
      }
  }
  return null;
}
function hero(s) {
  return s.players.find((p) => p.lives > 0) ?? s.players[0];
}
function tick(s, input = {}) {
  const inputs = s.players.map((p) => (p === hero(s) ? input : {}));
  stepGame(s, inputs, dt);
  observers.get(s)?.(s, inputs);
}
function usefulInput(s, input) {
  if (s.areaLevel.id === "B") return restaurantInput(s, input);
  const p = hero(s);
  const foe = s.enemies.find(
    (e) => e.alive && Math.abs(e.y - p.y) < 2.5 && Math.abs(e.x - p.x) < 4.2,
  );
  const held = s.objects.find((o) => o.id === p.carrying?.id);
  const near = s.objects.find(
    (o) =>
      o.active &&
      !o.heldBy &&
      ["crate", "metal"].includes(o.kind) &&
      Math.abs(o.x - p.x) < 1.4 &&
      Math.abs(o.y - p.y) < 1.4,
  );
  const big = s.objects.find(
    (o) =>
      o.active &&
      o.kind === "bigcrate" &&
      Math.abs(o.x - p.x) < 4 &&
      Math.abs(o.y - p.y) < 1.5,
  );
  if (held && big && !s.previousInputs[s.players.indexOf(hero(s))]?.action)
    input.action = true;
  if (held && foe && !s.previousInputs[s.players.indexOf(hero(s))]?.action)
    input.action = true;
  else if (
    !held &&
    near &&
    !s.previousInputs[s.players.indexOf(hero(s))]?.action
  )
    input.action = true;
  const direction = Math.sign(input.move || 0);
  const hazard = s.hazards.find(
    (h) =>
      h.period &&
      p.y < h.y + h.h &&
      p.y + p.h > h.y &&
      Math.abs(h.x - p.x) < h.w / 2 + 1.4 &&
      direction * (h.x - p.x) > 0.1,
  );
  if (hazard && p.grounded) {
    const phase = (s.time + (hazard.offset ?? 0)) % hazard.period;
    const distance = Math.abs(hazard.x - p.x) + hazard.w / 2 + 0.7;
    if (
      phase < (hazard.activeFor ?? hazard.period / 2) ||
      hazard.period - phase < distance / 7.2 + 0.12
    ) {
      input.move = 0;
      input.jump = false;
    }
  }
  if (
    p.grounded &&
    !s.previousInputs[s.players.indexOf(hero(s))]?.jump &&
    ((foe && Math.abs(foe.x - p.x) < 1.8) ||
      s.projectiles.some(
        (q) =>
          Math.abs(q.x + q.vx * 0.18 - p.x - (input.move || 0) * 7.2 * 0.18) <
            1.1 &&
          q.y + q.vy * 0.18 < p.y + 1.4 &&
          q.y + q.vy * 0.18 + q.h > p.y,
      ))
  )
    input.jump = true;
  return input;
}
function walk(s, target, max = 2400) {
  const p = hero(s),
    startSupport = p.groundId;
  for (let f = 0; f < max && s.status === "playing"; f++) {
    const x = typeof target === "function" ? target() : target;
    if (Math.abs(p.x - x) < 0.15 && p.grounded) return true;
    tick(
      s,
      usefulInput(s, {
        move: Math.abs(p.x - x) < 0.1 ? 0 : Math.sign(x - p.x),
      }),
    );
    if (p.grounded && p.groundId !== startSupport) return true;
  }
  return false;
}
function fight(s, max = 9000) {
  if (s.areaLevel.id === "B") return predictiveFight(s);
  const p = hero(s),
    lives = p.lives;
  for (let f = 0; f < max && s.status === "playing" && !s.boss.defeated; f++) {
    if (p.lives < lives) return;
    const b = s.boss,
      ball = s.objects.find((o) => o.kind === "ball" && o.active),
      held = s.objects.find((o) => o.id === p.carrying?.id);
    let input = {};
    if (held && held.kind !== "ball") {
      input.action = !s.previousInputs[s.players.indexOf(hero(s))]?.action;
      input.move = p.facing;
    } else if (!held) {
      const retrieve =
        b.kind === "robot" && Math.abs(ball.x - b.x) < 3
          ? clamp(ball.x, b.x - 0.68, b.x + 0.68)
          : ball.x;
      input.move =
        Math.abs(retrieve - p.x) < 0.15 ? 0 : Math.sign(retrieve - p.x);
      if (
        (!ball.thrown || ball.grounded) &&
        Math.abs(ball.x - p.x) < 1.4 &&
        Math.abs(ball.y - p.y) < 1.5 &&
        !s.previousInputs[s.players.indexOf(hero(s))]?.action
      )
        input.action = true;
    } else {
      const aim = b.weakpoint?.x ?? b.x;
      input.move = Math.abs(p.x - aim) < 0.2 ? 0 : Math.sign(aim - p.x);
      if (
        Math.abs(p.x - aim) < 0.6 &&
        !s.previousInputs[s.players.indexOf(hero(s))]?.action &&
        b.invulnerable <= 0 &&
        !(b.breakTimer > 0)
      ) {
        const shot = { ...input, action: true, up: true };
        input = shot;
      }
    }
    if (
      p.grounded &&
      s.projectiles.some(
        (q) =>
          Math.abs(q.x + q.vx * 0.15 - p.x) < 0.7 &&
          Math.abs(q.y + q.vy * 0.15 - p.y - 0.6) < 1,
      ) &&
      !s.previousInputs[s.players.indexOf(hero(s))]?.jump
    )
      input.jump = true;
    tick(s, input);
  }
}
export function playOccupied(id, { campaign = null, onStep } = {}) {
  const s = createGame(getLevel(id), { players: id === "D" ? 2 : 1, campaign });
  if (onStep) observers.set(s, onStep);
  let p = hero(s);
  tick(s);
  let iterations = 0,
    reason = "",
    previousLives = p.lives;
  while (s.status === "playing" && iterations++ < 520) {
    p = hero(s);
    if (!p.grounded) {
      for (let f = 0; f < 120 && !p.grounded && s.status === "playing"; f++)
        tick(s);
    }
    if (previousLives !== p.lives) {
      previousLives = p.lives;
      tick(s);
    }
    let ps = supports(s),
      current = ps.find((m) => m.id === p.groundId);
    if (!current) {
      for (let f = 0; f < 12 && !current && s.status === "playing"; f++) {
        tick(s);
        ps = supports(s);
        current = ps.find((m) => m.id === p.groundId);
      }
    }
    if (!current) {
      reason = "lost support";
      break;
    }
    const path = route(ps, current, s.level.exit);
    if (!path) {
      reason = `no path ${current.id}`;
      break;
    }
    if (path.length === 1) {
      if (s.boss && !s.boss.defeated) {
        const hp = s.boss.hp,
          oldLives = p.lives;
        fight(s);
        if (s.boss.hp === hp && p.lives === oldLives) {
          reason = "combat bot stalled";
          break;
        }
      } else walk(s, s.level.exit.x);
      continue;
    }
    const next = path[1],
      margin = Math.min(0.65, current.w / 3),
      aLeft = current.x + margin,
      aRight = current.x + current.w - margin;
    const left = Math.max(aLeft, next.x + 0.65),
      right = Math.min(aRight, next.x + next.w - 0.65);
    let launch =
      left <= right
        ? clamp(p.x, left, right)
        : next.x > current.x
          ? aRight
          : aLeft;
    if (!next.oneWay && next.y > current.y + 0.1) {
      const before = next.x - 0.55,
        after = next.x + next.w + 0.55;
      if (before >= aLeft && before <= aRight) launch = before;
      else if (after >= aLeft && after <= aRight) launch = after;
    }
    for (const ceiling of ps.filter(
      (m) =>
        !m.oneWay &&
        m.id !== current.id &&
        m.y > current.y + 1.3 &&
        m.y < current.y + 4.8,
    )) {
      if (launch + 0.4 > ceiling.x && launch - 0.4 < ceiling.x + ceiling.w) {
        const before = ceiling.x - 0.65,
          after = ceiling.x + ceiling.w + 0.65;
        if (before >= aLeft && before <= aRight) launch = before;
        else if (after >= aLeft && after <= aRight) launch = after;
      }
    }
    walk(s, () =>
      clamp(launch, current.x + margin, current.x + current.w - margin),
    );
    if (!p.grounded || p.groundId !== current.id) continue;
    launch = p.x;
    let landing = clamp(launch, next.x + 0.7, next.x + next.w - 0.7);
    if (next.y <= current.y + 0.15) {
      if (next.x + next.w > current.x + current.w)
        landing = Math.max(landing, current.x + current.w + 0.65);
      else if (next.x < current.x)
        landing = Math.min(landing, current.x - 0.65);
    }
    tick(s, { jump: true });
    for (let f = 0; f < 120 && s.status === "playing"; f++) {
      const clear =
        !next.oneWay &&
        next.y > current.y + 0.1 &&
        p.vy > 0 &&
        p.y < next.y + 0.05;
      tick(s, {
        move: clear
          ? 0
          : Math.abs(landing - p.x) < 0.1
            ? 0
            : Math.sign(landing - p.x),
      });
      if (p.grounded && f > 5) break;
    }
  }
  if (s.status === "bonus")
    for (let f = 0; f < 300 && s.status === "bonus"; f++) tick(s, { move: 1 });
  observers.delete(s);
  return { state: s, reason, iterations };
}
function restaurantInput(s, input) {
  const p = s.players[0];
  const foe = s.enemies.find(
    (e) => e.alive && Math.abs(e.y - p.y) < 2.5 && Math.abs(e.x - p.x) < 4.2,
  );
  const held = s.objects.find((o) => o.id === p.carrying?.id);
  const near = s.objects.find(
    (o) =>
      o.active &&
      !o.heldBy &&
      ["crate", "metal"].includes(o.kind) &&
      Math.abs(o.x - p.x) < 1.4 &&
      Math.abs(o.y - p.y) < 1.4,
  );
  if (held && foe && !s.previousInputs[0]?.action) input.action = true;
  else if (!held && near && !s.previousInputs[0]?.action) input.action = true;
  const direction = Math.sign(input.move || 0);
  const hazard = s.hazards.find(
    (h) =>
      h.period &&
      p.y < h.y + h.h &&
      p.y + p.h > h.y &&
      Math.abs(h.x - p.x) < h.w / 2 + 1.4 &&
      direction * (h.x - p.x) > 0.1,
  );
  if (hazard && p.grounded) {
    const phase = (s.time + (hazard.offset ?? 0)) % hazard.period;
    const distance = Math.abs(hazard.x - p.x) + hazard.w / 2 + 0.7;
    if (
      phase < (hazard.activeFor ?? hazard.period / 2) ||
      hazard.period - phase < distance / 7.2 + 0.12
    ) {
      input.move = 0;
      input.jump = false;
      return input;
    }
  }
  if (
    p.grounded &&
    foe &&
    Math.abs(foe.x - p.x) < 1.8 &&
    !s.previousInputs[0]?.jump
  )
    input.jump = true;
  return input;
}

function combatScore(s) {
  const p = s.players[0],
    b = s.boss;
  if (s.status === "gameover") return -1e6;
  if (!b || b.defeated) return 1e6;
  const ball = s.objects.find((o) => o.kind === "ball"),
    held = p.carrying?.id === ball?.id;
  const target = held ? b.x : (ball?.x ?? p.x);
  const distance = Math.abs(p.x - target);
  return (
    p.lives * 1200 +
    p.hearts * 160 -
    b.hp * 450 +
    (held ? 24 : 0) -
    distance * 3 -
    (p.stun > 0 ? 15 : 0)
  );
}
function combatChoices(s) {
  const p = s.players[0],
    held = !!p.carrying;
  let choices = [];
  for (const move of [-1, 0, 1]) {
    choices.push({ move });
    choices.push({ move, jump: true });
    if (!held) choices.push({ move, action: true });
  }
  if (held)
    choices.push(
      { action: true, up: true },
      { action: true, move: -1 },
      { action: true, move: 1 },
    );
  return choices;
}
function predictiveFight(s, max = 3600) {
  const p = s.players[0],
    lives = p.lives;
  for (let f = 0; f < max && s.status === "playing" && !s.boss.defeated;) {
    if (p.lives < lives) return;
    let beam = [
      { state: structuredClone(s), first: null, score: combatScore(s) },
    ];
    for (let depth = 0; depth < 3; depth++) {
      const next = [];
      for (const node of beam)
        for (const input of combatChoices(node.state)) {
          const clone = structuredClone(node.state);
          for (let n = 0; n < 20 && clone.status === "playing"; n++)
            tick(clone, input);
          next.push({
            state: clone,
            first: node.first ?? input,
            score: combatScore(clone),
          });
        }
      next.sort((a, b) => b.score - a.score);
      beam = next.slice(0, 4);
    }
    const chosen = beam[0].first;
    for (
      let n = 0;
      n < 10 && s.status === "playing" && !s.boss.defeated;
      n++, f++
    )
      tick(s, chosen);
  }
}
