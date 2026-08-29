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

export function createLevelItems({ width, height, level, top = 165, random = Math.random }) {
  const items = [];
  const plan = typePlan(level);
  const spots = [];
  for (let y = top + 22; y <= height - 22; y += 45) {
    for (let x = 30; x <= width - 30; x += 48) spots.push({ x, y });
  }

  for (const type of plan) {
    let placed = false;
    for (let attempt = 0; attempt < 90 && !placed; attempt += 1) {
      const radius = type.radius;
      const x = 8 + radius + random() * Math.max(1, width - 16 - radius * 2);
      const y = top + radius + random() * Math.max(1, height - top - radius - 8);
      const candidate = { ...type, x, y, radius, caught: false };
      if (!items.some((item) => circlesOverlap(item, candidate, 8))) {
        items.push(candidate);
        placed = true;
      }
    }
    if (!placed) {
      const radius = type.radius;
      const spot = spots.find(({ x, y }) => {
        const candidate = { x, y, radius };
        return x - radius >= 8 && x + radius <= width - 8 && y - radius >= top && y + radius <= height - 8 &&
          !items.some((item) => circlesOverlap(item, candidate, 8));
      });
      if (spot) items.push({ ...type, ...spot, radius, caught: false });
    }
  }
  return items;
}
