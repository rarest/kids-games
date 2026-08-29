export const ITEM_TYPES = Object.freeze({
  smallGold: Object.freeze({ kind: 'smallGold', radius: 18, value: 120, weight: 1, color: '#ffd447' }),
  mediumGold: Object.freeze({ kind: 'mediumGold', radius: 28, value: 260, weight: 2.2, color: '#ffc02f' }),
  largeGold: Object.freeze({ kind: 'largeGold', radius: 42, value: 520, weight: 4.8, color: '#f5a900' }),
  rock: Object.freeze({ kind: 'rock', radius: 31, value: 35, weight: 6.5, color: '#7c6f68' }),
  diamond: Object.freeze({ kind: 'diamond', radius: 16, value: 700, weight: 0.7, color: '#7ff6ff' }),
  mystery: Object.freeze({ kind: 'mystery', radius: 22, value: 0, weight: 2.8, color: '#bd79ff' }),
});

export function pullSpeedFor(type) {
  return 470 / Math.max(1, type.weight);
}

export function levelTarget(level) {
  const n = Math.max(0, level - 1);
  return Math.round(650 + 362.5 * n + 37.5 * n * n);
}

export function circlesOverlap(a, b, padding = 0) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const minimum = a.radius + b.radius + padding;
  return dx * dx + dy * dy < minimum * minimum;
}

export function createHookVolley({ count = 700, minAngle = -Math.PI / 3, maxAngle = Math.PI / 3 } = {}) {
  if (count <= 0) return [];
  if (count === 1) return [{ angle: (minAngle + maxAngle) / 2, length: 78, mode: 'extend', caught: null }];
  const step = (maxAngle - minAngle) / (count - 1);
  return Array.from({ length: count }, (_, index) => ({
    angle: index === count - 1 ? maxAngle : minAngle + step * index,
    length: 78,
    mode: 'extend',
    caught: null,
  }));
}

export function claimTreasure(items, point, padding = 9) {
  const item = items.find((candidate) => !candidate.caught && Math.hypot(point.x - candidate.x, point.y - candidate.y) <= candidate.radius + padding);
  if (!item) return null;
  item.caught = true;
  return item;
}

export function itemReachableByVolley(item, {
  origin,
  count = 700,
  minAngle = -Math.PI / 3,
  maxAngle = Math.PI / 3,
  padding = 9,
} = {}) {
  if (!origin || count <= 0) return false;
  const dx = item.x - origin.x;
  const dy = item.y - origin.y;
  const step = count === 1 ? 0 : (maxAngle - minAngle) / (count - 1);
  const angle = Math.atan2(dx, dy);
  const nearest = count === 1 ? 0 : Math.max(0, Math.min(count - 1, Math.round((angle - minAngle) / step)));
  const radius = item.radius + padding;
  for (let index = Math.max(0, nearest - 1); index <= Math.min(count - 1, nearest + 1); index += 1) {
    const rayAngle = count === 1 ? (minAngle + maxAngle) / 2 : minAngle + step * index;
    const unitX = Math.sin(rayAngle);
    const unitY = Math.cos(rayAngle);
    const projection = dx * unitX + dy * unitY;
    const length = Math.max(78, projection);
    if (projection + radius < 78) continue;
    if (Math.hypot(dx - unitX * length, dy - unitY * length) <= radius) return true;
  }
  return false;
}

export function shouldRefreshMine({ itemCount, hookCount, time }) {
  return itemCount === 0 && hookCount === 0 && time > 0;
}

function typePlan(level) {
  const extra = Math.min(6, Math.floor(level / 2));
  return [
    ...Array(5 + extra).fill(ITEM_TYPES.smallGold),
    ...Array(4).fill(ITEM_TYPES.mediumGold),
    ...Array(2).fill(ITEM_TYPES.largeGold),
    ...Array(4 + extra).fill(ITEM_TYPES.rock),
    ...Array(1 + Math.floor(level / 3)).fill(ITEM_TYPES.diamond),
    ITEM_TYPES.mystery,
  ];
}

export function createLevelItems({
  width,
  height,
  level,
  top = 165,
  origin = { x: width / 2, y: top - 82 },
  bounds = {},
  types,
  random = Math.random,
}) {
  const items = [];
  const plan = types || typePlan(level);
  const safe = {
    left: Math.max(0, Number(bounds.left) || 0),
    right: Math.max(0, Number(bounds.right) || 0),
    bottom: Math.max(0, Number(bounds.bottom) || 0),
  };
  const spots = [];
  for (let y = top + 22; y <= height - 22; y += 45) {
    for (let x = safe.left + 30; x <= width - safe.right - 30; x += 48) spots.push({ x, y });
  }

  for (const type of plan) {
    let placed = false;
    for (let attempt = 0; attempt < 90 && !placed; attempt += 1) {
      const radius = type.radius;
      const minY = top + radius;
      const maxY = height - safe.bottom - radius - 8;
      if (maxY < minY) break;
      const y = minY + random() * (maxY - minY);
      const coneReach = Math.max(0, (y - origin.y) * Math.tan(Math.PI / 3));
      const minX = Math.max(safe.left + radius + 8, origin.x - coneReach);
      const maxX = Math.min(width - safe.right - radius - 8, origin.x + coneReach);
      if (maxX < minX) continue;
      const x = minX + random() * (maxX - minX);
      const candidate = { ...type, x, y, radius, caught: false };
      if (itemReachableByVolley(candidate, { origin }) && !items.some((item) => circlesOverlap(item, candidate, 8))) {
        items.push(candidate);
        placed = true;
      }
    }
    if (!placed) {
      const radius = type.radius;
      const spot = spots.find(({ x, y }) => {
        const candidate = { x, y, radius };
        return x - radius >= safe.left + 8 && x + radius <= width - safe.right - 8 && y - radius >= top && y + radius <= height - safe.bottom - 8 &&
          itemReachableByVolley(candidate, { origin }) &&
          !items.some((item) => circlesOverlap(item, candidate, 8));
      });
      if (spot) items.push({ ...type, ...spot, radius, caught: false });
    }
  }
  return items;
}
