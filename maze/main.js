import { LEVELS, getLevel } from './levels.js?v=20260829f';
import { createRun, move, starsFor, useDynamite, useHook } from './engine.js?v=20260829f';
import { SKINS, availableSkins, awardCoin, canEnterStage, completeStage, equipSkin, purchase, restartJourney } from './economy.js?v=20260829f';
import { loadSave, persistSave } from './save.js?v=20260829f';
import { createRenderer } from './render.js?v=20260829f';
import { createAudioController } from './audio.js?v=20260829f';
import { diagnosticsAllowed } from './diagnostics.js?v=20260829f';
import { gameEventSounds } from './sound-events.js?v=20260829f';
import { createGestureTracker } from './gesture-controls.js?v=20260829f';

const $ = id => document.getElementById(id);
const screens = {
  home: $('homeScreen'), shop: $('shopScreen'), map: $('mapScreen'),
  game: $('gameScreen'), result: $('resultScreen')
};
const canvas = $('mazeCanvas');
const renderer = createRenderer(canvas);
const audio = createAudioController({ baseUrl: '../maze/audio' });
const diagnosticsEnabled = diagnosticsAllowed(location);
let save = loadSave();
let run = null, currentLevel = null, selectedTool = null, shopTab = 'items', soundEnabled = true, toastTimer = 0;
const hasTouchInput=()=>matchMedia('(pointer:coarse)').matches||(navigator.maxTouchPoints||0)>0;

function store(next) {
  save = persistSave(next);
  syncBank();
  return save;
}

function syncBank() {
  $('coinBalance').textContent = save.coins;
  $('dynamiteCount').textContent = save.inventory.dynamite;
  $('hookCount').textContent = save.inventory.hook;
}

function resetPageScroll(){
  window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0;
}

function showScreen(name) {
  for (const [key, screen] of Object.entries(screens)) screen.classList.toggle('active', key === name);
  document.body.dataset.screen = name;
  resetPageScroll();requestAnimationFrame(resetPageScroll);
  if (name === 'map') requestAnimationFrame(() => { $('routeScroll').scrollTop = $('routeScroll').scrollHeight; });
  if (name === 'game') requestAnimationFrame(resizeCanvas);
}

function toast(message) {
  const element = $('toast');
  element.textContent = message;
  element.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('visible'), 1500);
}

function priceLabel(price) { return price ? `◆ ${price}` : '已拥有'; }

function shopCard({ art, title, copy, sku, price, owned = false, locked = false, color }) {
  const card = document.createElement('article');
  card.className = `shop-card${locked ? ' locked' : ''}`;
  const artBox = document.createElement('div');
  artBox.className = 'shop-art'; artBox.textContent = art;
  if (color) artBox.style.background = `radial-gradient(circle at 32% 25%,#fff 0 5%,transparent 28%),linear-gradient(145deg,${color},#301842)`;
  const info = document.createElement('div'); info.className = 'shop-info';
  const heading = document.createElement('h3'); heading.textContent = title;
  const paragraph = document.createElement('p'); paragraph.textContent = copy;
  info.append(heading, paragraph);
  const button = document.createElement('button'); button.type = 'button'; button.className = `buy-button${owned ? ' owned' : ''}`;
  button.textContent = locked ? '未显现' : priceLabel(owned ? 0 : price);
  button.disabled = locked;
  if (!owned) button.addEventListener('click', () => buySku(sku));
  card.append(artBox, info, button);
  return card;
}

function renderShop() {
  const list = $('shopList'); list.replaceChildren();
  $('itemShopTab').classList.toggle('active', shopTab === 'items');
  $('skinShopTab').classList.toggle('active', shopTab === 'skins');
  $('itemShopTab').setAttribute('aria-selected', String(shopTab === 'items'));
  $('skinShopTab').setAttribute('aria-selected', String(shopTab === 'skins'));
  if (shopTab === 'items') {
    list.append(
      shopCard({ art: '✹', title: '星火炸药', copy: `库存 ${save.inventory.dynamite} · 炸开紧邻的捷径内墙`, sku: 'dynamite', price: 1 }),
      shopCard({ art: '⌁', title: '月桂钩索', copy: `库存 ${save.inventory.hook} · 飞越一至两面墙壁`, sku: 'hook', price: 3 })
    );
    $('shopTip').textContent = '选中道具后再按方向键；没有有效目标时不会消耗。';
    return;
  }
  const visible = new Set(availableSkins(save).map(skin => skin.id));
  for (const skin of SKINS) {
    if (skin.hidden && !visible.has(skin.id)) continue;
    const owned = save.ownedSkins.includes(skin.id), equipped = save.equippedSkin === skin.id;
    const card = shopCard({ art: skin.hidden ? '♛' : '●', title: skin.name, copy: equipped ? '当前穿戴' : owned ? '永久拥有 · 点击穿戴' : skin.hidden ? `秘密华服 · 普通 ${skin.requires} 关显现` : '永久颜色皮肤', sku: `skin-${skin.id}`, price: skin.price, owned, color: skin.color });
    const button = card.querySelector('button');
    if (owned) { button.textContent = equipped ? '穿戴中' : '穿戴'; button.disabled = equipped; button.onclick = null; button.addEventListener('click', () => wearSkin(skin.id)); }
    list.append(card);
  }
  $('shopTip').textContent = '银色、金色和炫彩琉璃会在对应普通关通关后显现，再用 3 枚金币购买。';
}

function buySku(sku) {
  const result = purchase(save, sku);
  if (!result.ok) {
    toast(result.reason === 'not-enough-coins' ? '金币还不够' : result.reason === 'already-owned' ? '已经拥有' : '尚未解锁');
    return;
  }
  store(result.save); audio.play('purchase'); renderShop(); toast('购买成功');
}

function wearSkin(skinId) {
  const result = equipSkin(save, skinId);
  if (!result.ok) return;
  store(result.save); renderer.setSkin(skinId); renderShop(); toast('已换上新皮肤');
}

function renderRoute() {
  const route = $('routePath'); route.replaceChildren();
  const currentId = LEVELS[save.journeyPosition]?.id;
  for (const level of LEVELS) {
    const accessible = canEnterStage(save, level), stars = save.bestStars[level.id] || 0;
    const node = document.createElement('button');
    node.type = 'button'; node.className = `stage-node ${level.type}${accessible ? '' : ' locked'}${currentId === level.id ? ' current' : ''}`;
    node.disabled = !accessible; node.dataset.stage = level.id;
    const medal = document.createElement('span'); medal.className = 'node-medal'; medal.innerHTML = `<span>${accessible ? level.index : '🔒'}</span>`;
    const title = document.createElement('strong'); title.textContent = level.name;
    const subtitle = document.createElement('small'); subtitle.textContent = level.type === 'reward' ? `奖励迷宫 · ${5 + 3 * (level.index - 1)} 金币` : `第 ${level.index} 关 · ${level.index} 把钥匙`;
    const rating = document.createElement('small'); rating.className = 'node-stars'; rating.textContent = stars ? `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}` : accessible ? '等待挑战' : '尚未开启';
    node.append(medal, title, subtitle, rating);
    node.addEventListener('click', () => startStage(level.id)); route.append(node);
  }
  $('normalProgress').textContent = save.completedNormal.length;
  $('coinProgress').textContent = save.collectedCoinIds.length;
}

function syncKeys() {
  const rack = $('keyRack'); rack.replaceChildren();
  for (const key of currentLevel.keys) {
    const slot = document.createElement('span'); slot.className = `key-slot${run.collectedKeys.has(`${key.x},${key.y}`) ? ' collected' : ''}`; slot.textContent = '⚿'; rack.append(slot);
  }
  $('stepCount').textContent = run.steps;
}

function resizeCanvas() {
  if (!run) return;
  const frame = canvas.parentElement.getBoundingClientRect();
  renderer.resize({ width: Math.round(frame.width || 370), height: Math.round(frame.height || 400) }, devicePixelRatio);
}

function startStage(levelId) {
  const level = getLevel(levelId);
  if (!canEnterStage(save, level)) { toast('这座宫殿还锁着'); return; }
  currentLevel = level;
  run = createRun(level, new Set(save.collectedCoinIds));
  renderer.setLevel(level); renderer.setSkin(save.equippedSkin);
  document.body.dataset.stage = level.id;
  $('stageKind').textContent = level.type === 'reward' ? '温馨闪耀 · 奖励迷宫' : `皇家迷宫 · 第 ${level.index} 关`;
  $('stageName').textContent = level.name;
  selectedTool = null; syncToolSelection(); syncKeys(); syncBank(); showScreen('game');
}

function syncToolSelection() {
  $('dynamiteButton').classList.toggle('selected', selectedTool === 'dynamite');
  $('hookButton').classList.toggle('selected', selectedTool === 'hook');
  $('toolHint').textContent=hasTouchInput()?'滑动选择使用方向':'拖动选择使用方向';
  $('toolHint').classList.toggle('visible', Boolean(selectedTool));
}

function chooseTool(tool) {
  if (!run || run.complete) return;
  if (save.inventory[tool] <= 0) { toast(tool === 'dynamite' ? '没有炸药，去商店看看' : '没有钩子，去商店看看'); return; }
  selectedTool = selectedTool === tool ? null : tool; syncToolSelection();
}

function applyDirection(direction) {
  if (!run || run.complete || document.body.dataset.screen !== 'game') return;
  let result;
  if (selectedTool) {
    const tool = selectedTool;
    result = tool === 'dynamite' ? useDynamite(run, direction) : useHook(run, direction);
    if (!result.consumed) { audio.play('bump', { volume: .7 }); toast('这个方向不能使用'); return; }
    save.inventory[tool] -= 1; store(save); selectedTool = null; syncToolSelection();
  } else result = move(run, direction);
  handleGameEvent(result.event);
  syncKeys();
}

function handleGameEvent(event) {
  for(const sound of gameEventSounds(event))audio.play(sound);
  if (event.type === 'bump') renderer.emit({ type: 'bump', at: run.player });
  if (event.type === 'key') renderer.emit({ type: 'key', at: run.player });
  if (event.type === 'coin') {
    renderer.emit({ type: 'coin', at: run.player });
    store(awardCoin(save, event.id));
  }
  if (event.type === 'door-locked') toast(`还差 ${event.missing} 把钥匙`);
  if (event.type === 'dynamite') renderer.emit({ type: 'explosion', at: event.at });
  if (event.type === 'hook') {
    renderer.emit({ type: 'hook', at: run.player });
    if (event.coin) store(awardCoin(save, event.coin));
    if (event.key) renderer.emit({ type: 'key', at: run.player });
  }
  if (event.type === 'complete' || event.complete) finishStage();
}

function finishStage() {
  if (!run?.complete) return;
  const stars = starsFor(run.steps, currentLevel.parSteps);
  const elapsed = Math.max(1, Math.round((Date.now() - run.startedAt) / 1000));
  save = completeStage(save, { levelId: currentLevel.id, stars, steps: run.steps, coinIds: [...run.newCoinIds] }); store(save);
  renderer.emit({ type: 'complete', at: run.player });
  $('resultStars').textContent = `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`;
  $('resultSteps').textContent = run.steps;
  $('resultTime').textContent = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;
  $('resultCoins').textContent = run.newCoinIds.size;
  $('replayButton').hidden = currentLevel.type === 'reward';
  setTimeout(() => showScreen('result'), 420);
}

const gestureTracker=createGestureTracker({threshold:28,minInterval:90});
function bindGestureSurface(element){
  element.addEventListener('pointerdown',event=>{
    if(document.body.dataset.screen!=='game')return;
    if(!gestureTracker.start({pointerId:event.pointerId,x:event.clientX,y:event.clientY,time:event.timeStamp,isPrimary:event.isPrimary,button:event.button}))return;
    event.preventDefault();audio.unlock();
    try{element.setPointerCapture(event.pointerId)}catch{}
  });
  element.addEventListener('pointermove',event=>{
    const direction=gestureTracker.move({pointerId:event.pointerId,x:event.clientX,y:event.clientY,time:event.timeStamp});
    if(!direction)return;
    event.preventDefault();applyDirection(direction);
  });
  const stop=event=>gestureTracker.end(event.pointerId);
  element.addEventListener('pointerup',stop);element.addEventListener('pointercancel',stop);element.addEventListener('lostpointercapture',stop);
}

function syncGestureGuide(){
  const touch=hasTouchInput();
  $('gestureGuide').querySelector('b').textContent=touch?'滑动迷宫移动':'拖动迷宫或使用方向键';
  $('gestureGuide').querySelector('small').textContent=touch?'拖动可连续行走':'鼠标、方向键和 WASD 均可';
}

$('startButton').addEventListener('click', () => { renderRoute(); showScreen('map'); });
$('shopButton').addEventListener('click', () => { renderShop(); showScreen('shop'); });
for (const button of document.querySelectorAll('[data-back="home"]')) button.addEventListener('click', () => showScreen('home'));
$('backToMapButton').addEventListener('click', () => { renderRoute(); showScreen('map'); });
$('itemShopTab').addEventListener('click', () => { shopTab = 'items'; renderShop(); });
$('skinShopTab').addEventListener('click', () => { shopTab = 'skins'; renderShop(); });
$('dynamiteButton').addEventListener('click', () => chooseTool('dynamite'));
$('hookButton').addEventListener('click', () => chooseTool('hook'));
$('continueButton').addEventListener('click', () => { renderRoute(); showScreen('map'); });
$('replayButton').addEventListener('click', () => startStage(currentLevel.id));
$('restartJourneyButton').addEventListener('click', () => {
  if (!confirm('从普通第 1 关重新走旅程？已获得金币、皮肤和普通关不会丢失。')) return;
  store(restartJourney(save)); renderRoute(); toast('旅程已回到第一关');
});
$('soundButton').addEventListener('click', () => { soundEnabled = !soundEnabled; audio.setEnabled(soundEnabled); $('soundButton').textContent = soundEnabled ? '♪' : '×'; toast(soundEnabled ? '声音已开启' : '声音已关闭'); });
bindGestureSurface(canvas);syncGestureGuide();
window.addEventListener('keydown', event => {
  const direction = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' }[event.key];
  if (direction) { event.preventDefault(); audio.unlock(); applyDirection(direction); }
});
const preventGameGesture=event=>{if(document.body.dataset.screen==='game')event.preventDefault()};
for(const type of ['gesturestart','gesturechange','gestureend'])document.addEventListener(type,preventGameGesture,{passive:false});
document.addEventListener('dblclick',preventGameGesture,{passive:false});
window.addEventListener('resize',()=>{resizeCanvas();syncGestureGuide()});
document.addEventListener('visibilitychange', () => document.hidden ? audio.suspend() : audio.resume());
document.addEventListener('pointerdown', () => audio.unlock(), { once: true, capture: true });

function frame(now) {
  if (run && document.body.dataset.screen === 'game') renderer.draw(run, now);
  if (diagnosticsEnabled) globalThis.__crownMazeDiagnostics = renderer.diagnostics;
  requestAnimationFrame(frame);
}

syncBank(); renderer.setSkin(save.equippedSkin); showScreen('home'); requestAnimationFrame(frame);
