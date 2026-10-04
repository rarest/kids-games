import { LEVEL_COUNT, restoreGame, useItem } from './core.js';
export const SAVE_KEY = 'memory-garden-v1';
export const SHOP = [
  { id: 'peek', item: 'peek', count: 1, price: 500, name: '让我看一眼', description: '所有未配对的牌展示5秒', icon: '◉' },
  { id: 'peek8', item: 'peek', count: 8, price: 1000, name: '让我看八眼', description: '获得8次查看，分开使用', icon: '⑧' },
  { id: 'bomb', item: 'bomb', count: 1, price: 1500, name: '随机炸一对', description: '随机消除一对，计入完成', icon: '✦' },
  { id: 'add', item: 'add', count: 1, price: 100, name: '增加两对', description: '追加4张牌，原牌位置不变', icon: '+2' },
];
const validLevel = n => Number.isInteger(n) && n >= 1 && n <= LEVEL_COUNT;
const number = n => Number.isInteger(n) && n >= 0 ? Math.min(n, 99999999) : 0;
const levels = a => Array.isArray(a) ? [...new Set(a.filter(validLevel))] : [];
export function createProfile(gift = true) {
  return { version: 1, giftClaimed: true, coins: gift ? 1000 : 0, items: { peek: gift ? 1 : 0, bomb: 0, add: gift ? 2 : 0 }, unlocked: [1], completed: [], records: {}, session: null, muted: false };
}
export function readProfile(raw) {
  if (raw === null || raw === undefined) return createProfile();
  let value; try { value = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return createProfile(false); }
  if (!value || typeof value !== 'object') return createProfile(false);
  const p = createProfile(false); p.coins = number(value.coins);
  for (const kind of ['peek', 'bomb', 'add']) p.items[kind] = Math.min(10000, number(value.items?.[kind]));
  p.completed = levels(value.completed);
  p.unlocked = [...new Set([1, ...levels(value.unlocked), ...p.completed, ...p.completed.filter(n => n < LEVEL_COUNT).map(n => n + 1)])].sort((a, b) => a - b);
  p.muted = value.muted === true;
  for (const [key, record] of Object.entries(value.records || {})) {
    if (validLevel(Number(key)) && Number.isFinite(record?.elapsed) && record.elapsed >= 0 && Number.isInteger(record.moves) && record.moves >= 0) p.records[key] = { elapsed: record.elapsed, moves: record.moves };
  }
  p.session = restoreGame(value.session);
  if (p.session && !p.unlocked.includes(p.session.level)) p.session = null;
  return p;
}
export function purchase(p, id) {
  const sku = SHOP.find(s => s.id === id);
  if (!sku || p.coins < sku.price || p.items[sku.item] + sku.count > 10000) return { ok: false, reason: '金币不足或装备数量已满' };
  p.coins -= sku.price; p.items[sku.item] += sku.count; return { ok: true };
}
export function unlockLevel(p, level) {
  if (!validLevel(level) || p.unlocked.includes(level)) return { ok: false, reason: '关卡已开放或不存在' };
  if (p.coins < 100) return { ok: false, reason: '需要100金币' };
  p.coins -= 100; p.unlocked.push(level); p.unlocked.sort((a, b) => a - b); return { ok: true };
}
export function consume(p, game, kind) {
  if (!['peek', 'bomb', 'add'].includes(kind) || !game || !p.unlocked.includes(game.level) || p.items[kind] < 1) return { ok: false, reason: '没有这件装备，请先到商店购买' };
  const event = useItem(game, kind);
  if (event.type === 'ignored') return { ok: false, reason: '请完成当前翻牌，等待观察结束后再使用' };
  p.items[kind]--; p.session = game; return { ok: true, event };
}
export function completeLevel(p, game) {
  if (!game || !p.unlocked.includes(game.level) || game.phase !== 'won' || !game.cards.every(c => c.matched)) return { ok: false, reward: 0 };
  const first = !p.completed.includes(game.level);
  if (first) { p.completed.push(game.level); p.coins += 100; }
  if (game.level < LEVEL_COUNT && !p.unlocked.includes(game.level + 1)) p.unlocked.push(game.level + 1);
  p.unlocked.sort((a, b) => a - b);
  const old = p.records[game.level];
  if (!old || game.moves < old.moves || (game.moves === old.moves && game.elapsed < old.elapsed)) p.records[game.level] = { elapsed: game.elapsed, moves: game.moves };
  p.session = game; return { ok: true, reward: first ? 100 : 0 };
}
