import {
  union,
  intersection,
  difference,
} from "./vendor/polyclip.js?v=20261002rewards";
export { union, intersection, difference };
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export function disk(x, y, r, segments = 128) {
  const ring = [];
  for (let i = 0; i < segments; i++) {
    const a = (i * Math.PI * 2) / segments;
    ring.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
  }
  ring.push(ring[0]);
  return [[ring]];
}
export function ringArea(r) {
  let n = 0;
  for (let i = 1; i < r.length; i++)
    n += r[i - 1][0] * r[i][1] - r[i][0] * r[i - 1][1];
  return Math.abs(n) / 2;
}
export const regionArea = (s) =>
  s.reduce(
    (n, p) =>
      n + ringArea(p[0]) - p.slice(1).reduce((a, r) => a + ringArea(r), 0),
    0,
  );
export function nearestSegment(p, a, b) {
  const dx = b[0] - a[0],
    dy = b[1] - a[1],
    l = dx * dx + dy * dy,
    t = l ? clamp(((p.x - a[0]) * dx + (p.y - a[1]) * dy) / l, 0, 1) : 0;
  return { x: a[0] + t * dx, y: a[1] + t * dy, t };
}
export function segmentCross(a, b, c, d) {
  const dx = b.x - a.x,
    dy = b.y - a.y,
    ux = d.x - c.x,
    uy = d.y - c.y,
    den = dx * uy - dy * ux;
  if (Math.abs(den) < 1e-12) return null;
  const vx = c.x - a.x,
    vy = c.y - a.y,
    t = (vx * uy - vy * ux) / den,
    u = (vx * dy - vy * dx) / den;
  return t >= -1e-9 && t <= 1 + 1e-9 && u >= -1e-9 && u <= 1 + 1e-9
    ? { x: a.x + t * dx, y: a.y + t * dy, t, u }
    : null;
}
export function segmentDistance(a, b, c, d) {
  if (segmentCross(a, b, c, d)) return 0;
  let best = Infinity;
  for (const [p, u, v] of [
    [a, c, d],
    [b, c, d],
    [c, a, b],
    [d, a, b],
  ]) {
    const q = nearestSegment(p, [u.x, u.y], [v.x, v.y]);
    best = Math.min(best, (p.x - q.x) ** 2 + (p.y - q.y) ** 2);
  }
  return best;
}
function insideRing(r, x, y) {
  let inside = false;
  for (let i = 1; i < r.length; i++) {
    const a = r[i - 1],
      b = r[i],
      q = nearestSegment({ x, y }, a, b);
    if ((q.x - x) ** 2 + (q.y - y) ** 2 < 1e-14) return true;
    if (
      a[1] > y !== b[1] > y &&
      x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]
    )
      inside = !inside;
  }
  return inside;
}
export const containsRegion = (s, x, y) =>
  s.some(
    (p) =>
      insideRing(p[0], x, y) && !p.slice(1).some((r) => insideRing(r, x, y)),
  );
export function nearestBoundary(s, p) {
  let best = null,
    d = Infinity;
  for (const poly of s)
    for (const ring of poly)
      for (let i = 1; i < ring.length; i++) {
        const q = nearestSegment(p, ring[i - 1], ring[i]),
          dd = (q.x - p.x) ** 2 + (q.y - p.y) ** 2;
        if (dd < d) {
          d = dd;
          best = { ...q, ring, i: i - 1, distance: Math.sqrt(dd) };
        }
      }
  return best;
}
export function crossing(s, a, b) {
  let best = null;
  for (const poly of s)
    for (const ring of poly)
      for (let i = 1; i < ring.length; i++) {
        const q = segmentCross(
          a,
          b,
          { x: ring[i - 1][0], y: ring[i - 1][1] },
          { x: ring[i][0], y: ring[i][1] },
        );
        if (q && q.t >= -1e-9 && (!best || q.t < best.t)) best = q;
      }
  return best;
}
export function regionBounds(s) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of s)
    for (const r of p)
      for (const [x, y] of r) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
  return Number.isFinite(minX) ? { minX, minY, maxX, maxY } : null;
}
// Remove only sub-pixel deviations, preserving all corners rather than blindly
// discarding every other route vertex.
export function simplifyPath(points, epsilon = 0.003) {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length),
    stack = [[0, points.length - 1]];
  keep[0] = keep[points.length - 1] = 1;
  while (stack.length) {
    const [a, b] = stack.pop();
    let best = epsilon * epsilon,
      index = -1;
    for (let i = a + 1; i < b; i++) {
      const q = nearestSegment(
          points[i],
          [points[a].x, points[a].y],
          [points[b].x, points[b].y],
        ),
        d = (q.x - points[i].x) ** 2 + (q.y - points[i].y) ** 2;
      if (d > best) {
        best = d;
        index = i;
      }
    }
    if (index >= 0) {
      keep[index] = 1;
      stack.push([a, index], [index, b]);
    }
  }
  return points.filter((_, i) => keep[i]);
}
export function smoothCoast(x, y, r, phase, second) {
  const ring = [];
  for (let i = 0; i < 512; i++) {
    const a = (i * Math.PI * 2) / 512,
      d =
        r *
        (1 +
          0.14 * Math.sin(a * 3 + phase) +
          0.08 * Math.cos(a * 2 + second) +
          0.045 * Math.sin(a * 5 - second));
    ring.push([x + Math.cos(a) * d, y + Math.sin(a) * d]);
  }
  ring.push(ring[0]);
  return [[ring]];
}
export function segmentInside(s, a, b) {
  const times = [0, 1];
  for (const p of s)
    for (const r of p)
      for (let i = 1; i < r.length; i++) {
        const q = segmentCross(
          a,
          b,
          { x: r[i - 1][0], y: r[i - 1][1] },
          { x: r[i][0], y: r[i][1] },
        );
        if (q) times.push(clamp(q.t, 0, 1));
      }
  times.sort((a, b) => a - b);
  for (let i = 1; i < times.length; i++) {
    const t = (times[i] + times[i - 1]) / 2;
    if (!containsRegion(s, a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t))
      return false;
  }
  return true;
}
export function ribbon(points, r = 0.25) {
  if (points.length < 2) return [];
  // A 180-degree turn has no averaged normal. Split at cusps so the
  // outbound/inbound ribbons unite rather than cancel each other.
  const pieces = [];
  let start = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1],
      p = points[i],
      b = points[i + 1],
      ax = p.x - a.x,
      ay = p.y - a.y,
      bx = b.x - p.x,
      by = b.y - p.y;
    if (ax * bx + ay * by < -0.95 * Math.hypot(ax, ay) * Math.hypot(bx, by)) {
      pieces.push(points.slice(start, i + 1));
      start = i;
    }
  }
  if (pieces.length) {
    pieces.push(points.slice(start));
    return union(...pieces.map((p) => ribbon(p, r)));
  }
  const left = [],
    right = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i],
      a = points[Math.max(0, i - 1)],
      b = points[Math.min(points.length - 1, i + 1)],
      d = Math.hypot(b.x - a.x, b.y - a.y);
    if (d < 1e-8) continue;
    const nx = (-(b.y - a.y) / d) * r,
      ny = ((b.x - a.x) / d) * r;
    left.push([p.x + nx, p.y + ny]);
    right.push([p.x - nx, p.y - ny]);
  }
  if (left.length < 2) {
    const a = points[0],
      b = points.find((p) => Math.hypot(p.x - a.x, p.y - a.y) > 1e-8);
    if (!b) return [];
    return ribbon([a, b], r);
  }
  const ring = [...left, ...right.reverse(), left[0]],
    a = points[0],
    b = points.at(-1);
  return union([[ring]], disk(a.x, a.y, r, 16), disk(b.x, b.y, r, 16));
}
function arc(r, a, b) {
  if (a.i === b.i && a.t <= b.t)
    return [
      [a.x, a.y],
      [b.x, b.y],
    ];
  const out = [[a.x, a.y]],
    n = r.length - 1;
  let i = (a.i + 1) % n;
  for (let k = 0; k < n; k++, i = (i + 1) % n) {
    if (i === (b.i + 1) % n) break;
    out.push(r[i]);
  }
  out.push([b.x, b.y]);
  return out;
}
export function coastRoute(s, from, to) {
  const a = nearestBoundary(s, from),
    b = nearestBoundary(s, to);
  if (!a || !b || a.ring !== b.ring) return [];
  const routes = [arc(a.ring, a, b), arc(b.ring, b, a).reverse()];
  const length = (r) =>
    r
      .slice(1)
      .reduce((n, p, i) => n + Math.hypot(p[0] - r[i][0], p[1] - r[i][1]), 0);
  return routes
    .sort((u, v) => length(u) - length(v))[0]
    .map(([x, y]) => ({ x, y }));
}
export function captureShape(owned, stroke, pending, world) {
  const band = ribbon(stroke),
    exit = nearestBoundary(owned, stroke[0]),
    entry = nearestBoundary(owned, stroke.at(-1));
  let cap = [];
  if (
    exit &&
    entry &&
    exit.ring === entry.ring &&
    exit.distance < 0.002 &&
    entry.distance < 0.002
  ) {
    let best = Infinity;
    for (const home of [
      arc(entry.ring, entry, exit),
      arc(exit.ring, exit, entry).reverse(),
    ]) {
      const ring = [...stroke.map((p) => [p.x, p.y]), ...home];
      ring.push(ring[0]);
      const candidate = intersection(union([[ring]]), world),
        gain = regionArea(difference(candidate, owned));
      if (gain < best) {
        best = gain;
        cap = candidate;
      }
    }
  }
  return intersection(union(owned, cap, band, pending), world);
}
