import { createGame, advance, flip, pause, resume, levelSpec, LEVEL_COUNT } from './core.js';
import { SAVE_KEY, SHOP, readProfile, purchase, unlockLevel, consume, completeLevel } from './profile.js';
import { createScene } from './scene.js';
import { createAudio } from './audio.js';

const $ = id => document.getElementById(id);
let raw = null, storageAvailable = true;
try { raw = localStorage.getItem(SAVE_KEY); } catch { storageAvailable = false; }
const profile = readProfile(raw), audio = createAudio();
let game = null, scene, mode = 'home', pendingLevel = null, shopReturn = 'home', focusIndex = 0;
let lastTime = 0, saveTime = 0, toastTimer;
const demo = createGame(3); demo.cards.forEach(c => c.matched = true); demo.matched = demo.cards.length / 2; demo.phase = 'won';
function toast(message) { $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').hidden = true, 3200); }
function save() {
  if (!storageAvailable) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(profile)); }
  catch { storageAvailable = false; toast('浏览器不能保存进度，请不要关闭页面。'); }
}
function closeDialogs() { document.querySelectorAll('.overlay').forEach(e => e.hidden = true); }
function setMode(next) {
  mode = next; document.body.dataset.mode = next;
  document.body.dataset.night = String(next !== 'home' && game !== null && levelSpec(game.level).theme === 3);
  const home = next === 'home';
  for (const id of ['home', 'home-footer']) $(id).hidden = !home;
  for (const id of ['hud', 'inventory', 'board-tools', 'board-location']) $(id).hidden = home;
  $('continue').hidden = !profile.session || profile.session.phase === 'won';
  $('phase-banner').hidden = home || next !== 'playing';
}
function update() {
  $('coins').textContent = profile.coins;
  $('mute').textContent = profile.muted ? '♪̸' : '♫'; $('mute').setAttribute('aria-pressed', String(profile.muted)); $('mute').setAttribute('aria-label', profile.muted ? '开启声音' : '关闭声音');
  if (!game) return;
  $('view').dataset.phase = game.phase;
  $('theme-name').textContent = scene.themeName(); $('level-label').textContent = `第 ${game.level} 关`;
  $('matched').textContent = `${game.matched} / ${game.cards.length / 2}`;
  $('moves').textContent = `${game.moves}次翻牌 · ${Math.floor(game.elapsed)}秒`;
  const texts = { preview: '先看看，记住它们', peek: '看一眼', 'add-preview': '看看新来的两对', mismatch: '再试一次' };
  $('phase-banner').hidden = mode !== 'playing' || game.phase === 'playing' || game.phase === 'won';
  $('phase-banner').textContent = `${texts[game.phase] || ''}${game.remaining ? ` · ${Math.ceil(game.remaining)}秒` : ''}`;
  for (const kind of ['peek', 'bomb', 'add']) {
    $(`${kind}-count`).textContent = profile.items[kind];
    $(`use-${kind}`).disabled = mode !== 'playing' || game.phase !== 'playing' || !profile.items[kind] || (kind !== 'peek' && game.selected.length > 0) || (kind === 'add' && game.cards.length >= 2000);
  }
  $('board-location').textContent = `${game.cards.length}张牌 · 拖动浏览`;
}
function start(level) {
  closeDialogs(); game = createGame(level); profile.session = game; focusIndex = 0;
  setMode('playing'); scene.setGame(game); audio.start(); save(); update(); $('view').focus({ preventScroll: true });
}
function home() { if (game && game.phase !== 'won') { pause(game); profile.session = game; } save(); closeDialogs(); setMode('home'); scene.setGame(demo, true); audio.stop(); update(); }
function paused(show = true) {
  if (!game || game.phase === 'won' || mode === 'home') return;
  pause(game); setMode('paused'); audio.stop(); save(); update(); if (show) $('pause-dialog').hidden = false;
}
function continued() { closeDialogs(); resume(game); setMode('playing'); audio.start(); lastTime = performance.now(); save(); update(); }
function win() {
  const receipt = completeLevel(profile, game); save(); setMode('result');
  $('result-stats').textContent = `${game.cards.length / 2}对图案 · ${game.moves}次翻牌 · ${Math.floor(game.elapsed)}秒`;
  $('result-reward').textContent = receipt.reward ? '+100 金币 · 首次通关奖励' : '已完成过这一关，金币不重复领取';
  $('next').hidden = game.level >= LEVEL_COUNT; $('result-dialog').hidden = false; audio.effect('win'); update();
}
function event(e) {
  if (e.type === 'ignored') return;
  audio.effect(e.type);
  if (e.indexes && ['match', 'bomb', 'win'].includes(e.type)) scene.pulse(e.indexes);
  if (e.type === 'win') win(); else { save(); update(); }
}
function select(index) { if (mode === 'playing' && index !== null) event(flip(game, index)); }
function levels() {
  closeDialogs(); $('levels').replaceChildren();
  for (let n = 1; n <= LEVEL_COUNT; n++) {
    const b = document.createElement('button'), open = profile.unlocked.includes(n), complete = profile.completed.includes(n);
    b.dataset.level = n; b.className = complete ? 'completed' : open ? 'unlocked' : 'locked';
    b.innerHTML = `<strong>${open ? complete ? '✓' : n : '🔒'} <span>${n}</span></strong><small>${levelSpec(n).pairs}对${n === 40 ? ' · 休息关' : ''}</small>`;
    b.addEventListener('click', () => {
      if (open) start(n);
      else { pendingLevel = n; $('unlock-title').textContent = `开放第${n}关？`; $('confirm-unlock').disabled = profile.coins < 100; $('unlock-dialog').hidden = false; }
    }); $('levels').append(b);
  }
  $('levels-dialog').hidden = false;
}
function shopUpdate() {
  $('shop-wallet').textContent = `可用金币：${profile.coins}`; $('shop-list').replaceChildren();
  for (const sku of SHOP) {
    const row = document.createElement('div'); row.className = 'shop-item';
    row.innerHTML = `<span class="shop-icon">${sku.icon}</span><div><h3>${sku.name}</h3><p>${sku.description}</p></div>`;
    const b = document.createElement('button'); b.dataset.buy = sku.id; b.textContent = `${sku.price}金币`;
    b.disabled = profile.coins < sku.price || profile.items[sku.item] + sku.count > 10000;
    b.addEventListener('click', () => { const result = purchase(profile, sku.id); if (result.ok) { save(); audio.effect('buy'); shopUpdate(); update(); toast(`已获得${sku.name}`); } else toast(result.reason); });
    row.append(b); $('shop-list').append(row);
  }
}
function shop() { shopReturn = mode; if (mode === 'playing') paused(false); closeDialogs(); shopUpdate(); $('shop-dialog').hidden = false; }
$('start').onclick = levels; $('close-levels').onclick = () => closeDialogs();
$('confirm-unlock').onclick = () => { const result = unlockLevel(profile, pendingLevel); if (result.ok) { save(); start(pendingLevel); } else toast(result.reason); };
$('cancel-unlock').onclick = () => $('unlock-dialog').hidden = true;
$('shop').onclick = shop; $('play-shop').onclick = shop;
$('close-shop').onclick = () => { closeDialogs(); if (shopReturn === 'playing' || shopReturn === 'paused') { setMode('paused'); $('pause-dialog').hidden = false; } };
$('help').onclick = () => $('help-dialog').hidden = false; $('close-help').onclick = () => $('help-dialog').hidden = true;
$('pause').onclick = () => paused(); $('resume').onclick = continued; $('leave').onclick = home;
$('result-home').onclick = home; $('replay').onclick = () => start(game.level); $('next').onclick = () => start(game.level + 1);
$('continue').onclick = () => { game = profile.session; closeDialogs(); scene.setGame(game); setMode('playing'); paused(); };
$('overview').onclick = () => { scene.overview(); toast('总览中牌太小时，点牌放大到该区域，再点翻牌。'); };
$('reset').onclick = () => scene.reset();
$('mute').onclick = () => { profile.muted = !profile.muted; audio.setMuted(profile.muted); if (!profile.muted && mode === 'playing') audio.start(); save(); update(); };
for (const kind of ['peek', 'bomb', 'add']) $(`use-${kind}`).onclick = () => {
  const result = consume(profile, game, kind);
  if (!result.ok) return toast(result.reason);
  if (kind === 'add') { scene.setGame(game); scene.focus(result.event.indexes[0]); }
  event(result.event);
};
let pointer = null;
$('view').addEventListener('pointerdown', e => {
  if (mode !== 'playing' || pointer || !e.isPrimary || e.button !== 0) return;
  pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, lastX: e.clientX, lastY: e.clientY, drag: false };
  $('view').setPointerCapture(e.pointerId); audio.start(); e.preventDefault();
});
$('view').addEventListener('pointermove', e => {
  if (!pointer || pointer.id !== e.pointerId) return;
  if (Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y) > 8) pointer.drag = true;
  if (pointer.drag) scene.pan(e.clientX - pointer.lastX, e.clientY - pointer.lastY);
  pointer.lastX = e.clientX; pointer.lastY = e.clientY;
});
$('view').addEventListener('pointerup', e => { if (!pointer || pointer.id !== e.pointerId) return; const drag = pointer.drag; pointer = null; if (!drag) select(scene.pick(e.clientX, e.clientY)); });
$('view').addEventListener('pointercancel', () => pointer = null);
$('view').addEventListener('lostpointercapture', () => pointer = null);
$('view').addEventListener('keydown', e => {
  if (mode !== 'playing') return;
  const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -game.columns, ArrowDown: game.columns };
  if (e.key in offsets) { e.preventDefault(); focusIndex = Math.max(0, Math.min(game.cards.length - 1, focusIndex + offsets[e.key])); scene.focus(focusIndex); $('view').setAttribute('aria-label', `第${focusIndex + 1}张牌，回车翻牌`); }
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(focusIndex); }
  if (e.key === 'Escape') paused();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) { audio.stop(); paused(); } });
window.addEventListener('blur', () => { audio.stop(); if (mode === 'playing') paused(); });
window.addEventListener('pagehide', () => { if (game && game.phase !== 'won') pause(game); save(); audio.stop(); });
save(); audio.setMuted(profile.muted);
try {
  scene = createScene($('view')); scene.setGame(demo, true); update(); setMode('home');
  if (!storageAvailable) toast('浏览器不能保存进度，请不要关闭页面。');
  document.body.dataset.ready = 'true';
  let nextUi = 0;
  function frame(now) {
    const dt = lastTime ? Math.min(.1, (now - lastTime) / 1000) : 0; lastTime = now;
    if (mode === 'playing') advance(game, dt);
    scene.render(mode === 'home' ? demo : game, mode === 'paused' ? 0 : dt);
    if (now >= nextUi) { update(); nextUi = now + 100; }
    if (mode === 'playing' && now - saveTime > 1000) { save(); saveTime = now; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
} catch (error) { $('home').hidden = true; $('error').hidden = false; $('error-text').textContent = '浏览器没有可用的WebGL 3D支持，请更新浏览器后重试。'; console.error(error); }
