import { cellKey, parseGrid } from './level-tools.js?v=20260830b';

const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const pointAt = (point, direction, distance = 1) => ({
  x: point.x + direction.x * distance,
  y: point.y + direction.y * distance
});

function directionFor(name) {
  const direction = DIRECTIONS[name];
  if (!direction) throw new Error(`Unknown direction: ${name}`);
  return direction;
}

function isFloor(run, point) {
  const key = cellKey(point);
  return run.grid.floors.has(key) || run.removedWalls.has(key);
}

export function canMove(run, directionName) {
  if (!run || run.complete) return false;
  return isFloor(run, pointAt(run.player, directionFor(directionName)));
}

function collectAt(run, point) {
  const key = cellKey(point);
  const result = {};
  if (run.keyCells.has(key) && !run.collectedKeys.has(key)) {
    run.collectedKeys.add(key);
    result.key = key;
  }
  const coin = run.coinCells.get(key);
  if (coin && !run.collectedCoinIds.has(coin.id) && !run.newCoinIds.has(coin.id)) {
    run.newCoinIds.add(coin.id);
    result.coin = coin.id;
  }
  return result;
}

export function createRun(level, collectedCoinIds = new Set()) {
  const grid = parseGrid(level.rows);
  return {
    level,
    grid,
    player: { ...level.start },
    keyCells: new Set((level.keys || []).map(cellKey)),
    coinCells: new Map((level.coins || []).map(coin => [cellKey(coin), coin])),
    breakableWalls: new Set((level.breakableWalls || []).map(cellKey)),
    removedWalls: new Set(),
    collectedKeys: new Set(),
    collectedCoinIds: new Set(collectedCoinIds),
    newCoinIds: new Set(),
    steps: 0,
    complete: false,
    startedAt: Date.now()
  };
}

export function move(run, directionName) {
  if (run.complete) return { state: run, event: { type: 'already-complete' } };
  const target = pointAt(run.player, directionFor(directionName));
  const targetKey = cellKey(target);
  if (!isFloor(run, target)) return { state: run, event: { type: 'bump', at: target } };
  if (targetKey === cellKey(run.level.exit) && run.collectedKeys.size < run.keyCells.size) {
    return { state: run, event: { type: 'door-locked', missing: run.keyCells.size - run.collectedKeys.size } };
  }

  run.player = target;
  run.steps += 1;
  const collected = collectAt(run, target);
  if (targetKey === cellKey(run.level.exit)) {
    run.complete = true;
    return { state: run, event: { type: 'complete', ...collected } };
  }
  if (collected.key) return { state: run, event: { type: 'key', id: collected.key } };
  if (collected.coin) return { state: run, event: { type: 'coin', id: collected.coin } };
  return { state: run, event: { type: 'step' } };
}

export function starsFor(steps, parSteps) {
  if (steps <= parSteps) return 3;
  if (steps <= Math.ceil(parSteps * 1.5)) return 2;
  return 1;
}

export function useDynamite(run, directionName) {
  const target = pointAt(run.player, directionFor(directionName));
  const key = cellKey(target);
  if (!run.breakableWalls.has(key) || !run.grid.walls.has(key) || run.removedWalls.has(key)) {
    return { state: run, consumed: false, event: { type: 'tool-failed', tool: 'dynamite' } };
  }
  run.removedWalls.add(key);
  return { state: run, consumed: true, event: { type: 'dynamite', at: target } };
}

export function useHook(run, directionName) {
  const direction = directionFor(directionName);
  let wallCount = 0;
  for (let distance = 1; distance <= 3; distance += 1) {
    const target = pointAt(run.player, direction, distance);
    const key = cellKey(target);
    const wall = run.grid.walls.has(key) && !run.removedWalls.has(key);
    if (wall) {
      wallCount += 1;
      if (wallCount > 2) break;
      continue;
    }
    if (!isFloor(run, target) || wallCount === 0) break;
    if (key === cellKey(run.level.exit) && run.collectedKeys.size < run.keyCells.size) break;
    run.player = target;
    run.steps += 1;
    const collected = collectAt(run, target);
    if (key === cellKey(run.level.exit)) run.complete = true;
    return { state: run, consumed: true, event: { type: 'hook', from: distance, ...collected, complete: run.complete } };
  }
  return { state: run, consumed: false, event: { type: 'tool-failed', tool: 'hook' } };
}
