// Body-sized separation runs even during the damage cooldown, preventing cars tunnelling through one another.
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export function carSize(car) {
  const style = car.model?.style;
  const width = style === "hyper" ? 2.78 : style === "muscle" ? 2.72 : 2.66;
  const length = style === "hyper" ? 5.8 : style === "rally" ? 4.8 : 5.3;
  const angle = Math.abs(car.steer || 0) * 0.13;
  return {
    width: width * Math.cos(angle) + length * Math.sin(angle),
    length: length * Math.cos(angle) + width * Math.sin(angle),
  };
}
export function separateCars(a, b, length, edge = 16, stationary = false) {
  if (a.finished || b.finished || a.respawn > 0 || b.respawn > 0) return false;
  const sa = carSize(a),
    sb = carSize(b),
    width = (sa.width + sb.width) / 2,
    body = (sa.length + sb.length) / 2;
  const d =
      ((((a.s - b.s + length / 2) % length) + length) % length) - length / 2,
    side = a.offset - b.offset;
  if (Math.abs(d) >= body || Math.abs(side) >= width) return false;
  if (!stationary && Math.abs(side) < 0.55 && Math.abs(d) > 1) {
    const follower = d > 0 ? b : a,
      front = d > 0 ? a : b;
    follower.s -= body - Math.abs(d) + 0.001;
    follower.speed = Math.min(follower.speed, front.speed * 0.92);
  } else {
    const sign =
        side !== 0 ? Math.sign(side) : (a.id ?? 0) < (b.id ?? 99) ? -1 : 1,
      depth = width - Math.abs(side) + 0.001;
    const moveA = stationary ? depth : depth / 2,
      oldA = a.offset,
      oldB = b.offset;
    a.offset = clamp(a.offset + sign * moveA, -edge, edge);
    if (!stationary)
      b.offset = clamp(b.offset - (sign * depth) / 2, -edge, edge);
    const missing =
      depth - Math.abs(a.offset - oldA) - Math.abs(b.offset - oldB);
    if (missing > 0) {
      if (Math.abs(a.offset) < edge - 0.001)
        a.offset = clamp(a.offset + sign * missing, -edge, edge);
      else if (!stationary)
        b.offset = clamp(b.offset - sign * missing, -edge, edge);
    }
  }
  if (!a.cooldown && !b.cooldown) {
    a.speed *= 0.86;
    if (!stationary) b.speed *= 0.86;
  }
  a.cooldown = 0.25;
  if (!stationary) b.cooldown = 0.25;
  return true;
}
