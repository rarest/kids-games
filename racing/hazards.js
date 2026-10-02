import { carSize } from "./contact.js";
// Deterministic obstacle geometry and timing, shared by physics and 3D animation.
const wrap = (x, n) => ((x % n) + n) % n;
export const HAZARD_NAMES = {
  barrier: "路障",
  pendulum: "大摆锤",
  spikes: "尖刺木桩",
  blade: "旋转刀片",
  nails: "升降钉板",
  gazebo: "古亭",
};
export function makeHazards(track) {
  const rows = [
    ["barrier", 0.23, -4.5, 1.7],
    ["pendulum", 0.38, 0, 1.65],
    ["spikes", 0.52, 4.5, 1],
    ["blade", 0.69, -3, 1.55],
    ["nails", 0.83, 4.5, 2],
  ];
  if (["china", "gorge"].includes(track.spec.theme))
    rows.push(["gazebo", 0.6, 11.5, 2.4]);
  return rows
    .map(([type, f, offset, radius], id) => ({
      id,
      type,
      s: track.length * f,
      offset,
      radius,
      phase: id * 0.67,
    }))
    .sort((a, b) => a.s - b.s);
}
export function hazardState(h, time) {
  if (h.type === "pendulum") {
    const angle = Math.sin((time * Math.PI) / 3 + h.phase) * 0.78,
      offset = 9 * Math.sin(angle),
      height = 11 - 9 * Math.cos(angle);
    return { active: height - h.radius < 1.9, offset, angle, height };
  }
  if (h.type === "nails") {
    const phase = wrap(time + h.phase, 6);
    return {
      active: phase >= 3.5,
      offset: h.offset,
      height: phase >= 3.5 ? 0.9 : 0.04,
    };
  }
  if (h.type === "blade") {
    const phase = wrap(time + h.phase, 7);
    return {
      active: phase >= 2.5,
      offset: h.offset,
      height: phase >= 2.5 ? 1.2 : -1.8,
      angle: time * 5,
    };
  }
  return { active: true, offset: h.offset, height: 1 };
}
export function hazardWarning(track, hazards, car, time) {
  if (car.respawn > 0 || car.finished) return null;
  let nearest = null;
  for (const h of hazards) {
    const distance = wrap(h.s - car.s, track.length);
    if (distance < 190 && (!nearest || distance < nearest.distance))
      nearest = { ...h, distance, state: hazardState(h, time) };
  }
  return nearest;
}
export function safeLane(track, hazards, car, time, fallback) {
  const warning = hazardWarning(track, hazards, car, time);
  if (!warning || warning.distance > 150 || warning.type === "gazebo")
    return fallback;
  const arrival = time + warning.distance / Math.max(car.speed, 22),
    state = hazardState(warning, arrival);
  let best = fallback,
    score = -Infinity;
  for (const lane of [-6.5, 0, 6.5]) {
    const clearance = Math.abs(lane - state.offset) - warning.radius - 1;
    const value = Math.min(clearance, 3) - Math.abs(lane - car.offset) * 0.08;
    if (value > score) {
      score = value;
      best = lane;
    }
  }
  return best;
}
export function crashCar(r, car, type) {
  if (car.finished || car.respawn > 0 || car.protection > 0) return false;
  car.crashS = car.s;
  car.crashOffset = car.offset;
  car.s =
    Math.floor(
      Math.min(Math.max(0, car.s), r.track.length * r.laps - 0.001) /
        r.track.length,
    ) * r.track.length;
  car.offset = 0;
  car.speed = 0;
  car.steer = 0;
  car.respawn = 5;
  car.protection = 8;
  car.cooldown = 8;
  car.nitro = 100;
  car.crashes++;
  car.lastCrash = type;
  return true;
}
export function obstacleHit(r, c) {
  if (c.protection > 0 || c.respawn > 0 || c.finished) return false;
  if (
    ["sky", "container", "ocean", "ship"].includes(r.track.spec.theme) &&
    Math.abs(c.offset) > 9
  )
    return crashCar(r, c, "fall");
  for (const h of r.hazards) {
    const d = Math.abs(
        wrap(c.s - h.s + r.track.length / 2, r.track.length) -
          r.track.length / 2,
      ),
      state = hazardState(h, r.time);
    if (
      d < 2.6 &&
      state.active &&
      Math.abs(c.offset - state.offset) < h.radius + carSize(c).width / 2
    )
      return crashCar(r, c, h.type);
  }
  return false;
}
