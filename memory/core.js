export const LEVEL_COUNT = 200;
export function levelSpec(level) {
  if (!Number.isInteger(level) || level < 1 || level > LEVEL_COUNT) throw new RangeError('关卡必须为1至200');
  const pairs = level === 40 ? 2 : level < 40 ? level * 2 : (level - 1) * 2;
  return { level, pairs, theme: Math.floor((level - 1) / 40), rest: level === 40 };
}
function shuffled(cards, rng) {
  for (let i = cards.length - 1; i > 0; i--) {
    const n = Math.min(1 - Number.EPSILON, Math.max(0, Number(rng()) || 0));
    const j = Math.floor(n * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}
function pairsFrom(first, count, rng) {
  return shuffled(Array.from({ length: count * 2 }, (_, i) => ({ symbol: first + Math.floor(i / 2), matched: false })), rng);
}
export function createGame(level, rng = Math.random) {
  const { pairs } = levelSpec(level);
  return { level, cards: pairsFrom(0, pairs, rng), columns: Math.min(16, Math.ceil(Math.sqrt(pairs * 2))),
    phase: 'preview', remaining: 5, selected: [], matched: 0, moves: 0, elapsed: 0, paused: false, revealFrom: 0 };
}
export function pause(game) { if (game.phase !== 'won') game.paused = true; }
export function resume(game) { game.paused = false; }
export function advance(game, seconds) {
  if (game.paused || game.phase === 'won' || !Number.isFinite(seconds) || seconds <= 0) return { type: 'ignored' };
  if (game.phase !== 'preview' && game.phase !== 'add-preview') game.elapsed += seconds;
  if (game.remaining > 0) {
    game.remaining = Math.max(0, game.remaining - seconds);
    if (game.remaining < 1e-8) {
      game.remaining = 0;
      if (game.phase === 'mismatch') game.selected = [];
      game.phase = 'playing'; return { type: 'ready' };
    }
  }
  return { type: 'tick' };
}
function finishPair(game, indexes, type) {
  for (const i of indexes) game.cards[i].matched = true;
  game.matched++; game.selected = [];
  if (game.matched === game.cards.length / 2) { game.phase = 'won'; game.remaining = 0; return { type: 'win', indexes }; }
  return { type, indexes };
}
export function flip(game, index) {
  if (game.paused || game.phase !== 'playing' || !Number.isInteger(index) || !game.cards[index] || game.cards[index].matched || game.selected.includes(index)) return { type: 'ignored' };
  game.selected.push(index);
  if (game.selected.length === 1) return { type: 'flip', indexes: [index] };
  game.moves++;
  if (game.cards[game.selected[0]].symbol === game.cards[index].symbol) return finishPair(game, [...game.selected], 'match');
  game.phase = 'mismatch'; game.remaining = 1;
  return { type: 'mismatch', indexes: [...game.selected] };
}
export function useItem(game, kind, rng = Math.random) {
  if (game.paused || game.phase !== 'playing' || (kind !== 'peek' && game.selected.length > 0)) return { type: 'ignored' };
  if (kind === 'peek') { game.phase = 'peek'; game.remaining = 5; return { type: 'peek' }; }
  if (kind === 'add' && game.cards.length < 2000) {
    const first = game.cards.length / 2; game.revealFrom = game.cards.length;
    game.cards.push(...pairsFrom(first, 2, rng)); game.phase = 'add-preview'; game.remaining = 5;
    return { type: 'add', indexes: [game.revealFrom, game.revealFrom + 1, game.revealFrom + 2, game.revealFrom + 3] };
  }
  if (kind === 'bomb') {
    const symbols = [...new Set(game.cards.filter(c => !c.matched).map(c => c.symbol))];
    if (!symbols.length) return { type: 'ignored' };
    const choice = symbols[Math.min(symbols.length - 1, Math.max(0, Math.floor((Number(rng()) || 0) * symbols.length)))];
    const indexes = game.cards.flatMap((c, i) => c.symbol === choice ? [i] : []);
    return finishPair(game, indexes, 'bomb');
  }
  return { type: 'ignored' };
}
export function faceUp(game, index) {
  return game.cards[index].matched || game.selected.includes(index) || game.phase === 'preview' || game.phase === 'peek' || (game.phase === 'add-preview' && index >= game.revealFrom);
}
export function restoreGame(raw) {
  if (!raw || typeof raw !== 'object') return null;
  try { levelSpec(raw.level); } catch { return null; }
  const phases = ['preview', 'playing', 'mismatch', 'peek', 'add-preview', 'won'];
  if (!phases.includes(raw.phase) || !Array.isArray(raw.cards) || raw.cards.length < 4 || raw.cards.length > 2004 || raw.cards.length % 4 || !Number.isInteger(raw.columns) || raw.columns < 2 || raw.columns > 16) return null;
  const counts = new Map(); let matchedCards = 0;
  for (const c of raw.cards) {
    if (!c || !Number.isInteger(c.symbol) || c.symbol < 0 || c.symbol >= raw.cards.length / 2 || typeof c.matched !== 'boolean') return null;
    const previous = counts.get(c.symbol);
    if (previous && previous.matched !== c.matched) return null;
    counts.set(c.symbol, { count: (previous?.count || 0) + 1, matched: c.matched });
    if (c.matched) matchedCards++;
  }
  if ([...counts.values()].some(c => c.count !== 2) || raw.matched !== matchedCards / 2) return null;
  if (!Array.isArray(raw.selected) || raw.selected.length > 2 || new Set(raw.selected).size !== raw.selected.length || raw.selected.some(i => !Number.isInteger(i) || !raw.cards[i] || raw.cards[i].matched)) return null;
  if (raw.phase === 'mismatch' ? raw.selected.length !== 2 : raw.selected.length > 1) return null;
  if (raw.phase === 'won' && raw.matched !== raw.cards.length / 2) return null;
  if (!Number.isFinite(raw.remaining) || raw.remaining < 0 || raw.remaining > 5 || !Number.isFinite(raw.elapsed) || raw.elapsed < 0 || !Number.isInteger(raw.moves) || raw.moves < 0 || typeof raw.paused !== 'boolean' || !Number.isInteger(raw.revealFrom) || raw.revealFrom < 0 || raw.revealFrom >= raw.cards.length) return null;
  if (!['playing', 'won'].includes(raw.phase) && raw.remaining === 0) return null;
  return structuredClone(raw);
}
