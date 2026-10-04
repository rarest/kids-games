import {
  createGame,
  stepGame,
  coverage,
  coverageLabel,
  finishRun,
} from "./core.js?v=20261002animals";
import {
  SKINS,
  createProfile,
  buySkin,
  exchangeDiamonds,
  equipSkin,
  settleRun,
  collectReward,
  rewardSummary,
} from "./profile.js?v=20261002animals";
import { drawPaper, createRenderer } from "./render.js?v=20261002animals";

const $ = (id) => document.getElementById(id),
  KEY = "paper-territory.profile.v1";
let profile,
  game = null,
  tier = "normal",
  mouseTarget = null,
  joy = { x: 0, y: 0 },
  joyPointer = null,
  last = 0,
  hudTime = 0,
  lastEvent = null,
  noticeTimer;
const keys = new Set(),
  renderer = createRenderer($("map"), { follow: true, minimap: $("minimap") });
const coarsePointer = matchMedia("(pointer: coarse)");
function inputHelp(touch = coarsePointer.matches) {
  $("input-help").textContent = touch
    ? "拖动摇杆，自由转向"
    : "鼠标跟随 / WASD";
}
coarsePointer.addEventListener("change", () => inputHelp());
inputHelp();
function notify(message) {
  $("notice").textContent = message;
  $("notice").hidden = false;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => ($("notice").hidden = true), 4200);
}
try {
  profile = createProfile(JSON.parse(localStorage.getItem(KEY)));
} catch {
  profile = createProfile();
  notify("无法读取本机存档，本次使用默认纸片。");
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
    return true;
  } catch {
    notify("浏览器无法保存：本次金币与装备仅保留到页面关闭。");
    return false;
  }
}
const selected = () => SKINS.find((s) => s.id === profile.selected) || SKINS[0];
function paperPreview(canvas, skin, size = 42, locked = false, time = 0) {
  const c = canvas.getContext("2d");
  c.clearRect(0, 0, canvas.width, canvas.height);
  drawPaper(c, canvas.width / 2, canvas.height / 2, size, skin, time, {
    locked,
    active:
      !locked &&
      skin.tier === "hidden" &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches,
  });
  canvas.dataset.skin = skin.id;
}
function clearInput() {
  keys.clear();
  mouseTarget = null;
  joy = { x: 0, y: 0 };
  if (joyPointer !== null) {
    try {
      $("joystick").releasePointerCapture(joyPointer);
    } catch {}
    joyPointer = null;
  }
  $("joy-knob").style.transform = "translate(0px,0px)";
}
function screen(name) {
  clearInput();
  document.body.dataset.screen = name;
  window.GameActivity?.setPlaying(name === "game" && !!game && ["playing", "reward"].includes(game.mode));
  document.body.dataset.mode = name === "game" ? game.mode : name;
  for (const n of ["home", "shop", "game", "result"])
    $(`${n}-screen`).hidden = n !== name;
  $("pause-dialog").hidden = true;
  window.scrollTo(0, 0);
}
function refreshProfile() {
  const skin = selected();
  $("wallet").textContent = profile.coins;
  $("selected-name").textContent = skin.name;
  $("total-score").textContent = profile.score;
  $("diamond-wallet").textContent = profile.diamonds;
  paperPreview($("home-paper"), skin, 38);
  paperPreview($("result-paper"), skin, 75);
  drawHero();
}
const heroGame = createGame({ seed: "paper-hero", cols: 32, rows: 28 }),
  heroRenderer = createRenderer($("hero-map"));
function drawHero(time = 0) {
  heroRenderer.draw(heroGame, selected(), time);
}
function renderShop() {
  $("wallet").textContent = profile.coins;
  $("diamond-wallet").textContent = profile.diamonds;
  $("exchange-one").disabled = profile.coins < 1;
  $("exchange-fifty").disabled = profile.coins < 50;
  for (const tab of document.querySelectorAll("[data-tier]"))
    tab.setAttribute("aria-selected", String(tab.dataset.tier === tier));
  $("shop-description").textContent =
    tier === "normal"
      ? "20 种纯色。朱砂红免费，其余每张 20 金币。"
      : tier === "fine"
        ? "20 种细密纹理，人物和领地使用同一张材质，每张 60 金币。"
        : tier === 'special'
          ? "20 种卡通小动物，每款100钻石。1金币可兑换2钻石；人物和领地拥有相同的动物纹章。"
          : "占满全岛后，触碰散落的三个宝箱，直接获得三款未拥有的动态隐藏纸。";
  $("skin-grid").replaceChildren();
  for (const skin of SKINS.filter((s) => s.tier === tier)) {
    const owned = profile.owned.includes(skin.id),
      locked = skin.tier === "hidden" && !owned,
      equipped = skin.id === profile.selected;
    const card = document.createElement("article");
    card.className = "skin-card";
    card.dataset.skin = skin.id;
    card.dataset.locked = locked;
    card.dataset.equipped = equipped;
    const c = document.createElement("canvas");
    c.className = "skin-preview";
    c.width = 112;
    c.height = 112;
    c.setAttribute("aria-label", locked ? "未解锁的黑色纸片" : skin.name);
    paperPreview(c, skin, 64, locked);
    const h = document.createElement("h2");
    h.textContent = locked
      ? "秘密纸片 " + String(skin.winsRequired).padStart(2, "0")
      : skin.name;
    const info = document.createElement("p");
    info.textContent = locked
      ? "全岛胜利后触碰宝箱获得"
      : owned
        ? "已收入纸片册"
        : `${skin.price} ${skin.currency === 'diamonds' ? '钻石' : '金币'}`;
    const button = document.createElement("button");
    button.textContent = locked
      ? "尚未解锁"
      : equipped
        ? "正在装备"
        : owned
          ? "装备"
          : `购买 · ${skin.price}${skin.currency === 'diamonds' ? ' ◇' : ''}`;
    button.disabled =
      locked || equipped || (!owned && profile[skin.currency === 'diamonds' ? 'diamonds' : 'coins'] < skin.price);
    button.addEventListener("click", () => {
      if (owned) {
        if (equipSkin(profile, skin.id)) {
          const saved = save();
          refreshProfile();
          renderShop();
          if (saved) notify(`已装备${skin.name}`);
        }
      } else if (buySkin(profile, skin.id)) {
        const saved = save();
        refreshProfile();
        renderShop();
        if (saved) notify(`${skin.name}已收入纸片册，可点击装备`);
      }
    });
    card.append(c, h, info, button);
    if (locked) {
      const lock = document.createElement("span");
      lock.className = "lock-symbol";
      lock.textContent = "●";
      lock.setAttribute("aria-hidden", "true");
      card.append(lock);
    }
    $("skin-grid").append(card);
  }
}
export function readNewEvents(events, cursor) {
  return events.slice(cursor ? events.indexOf(cursor) + 1 : 0);
}
function updateHud() {
  const p = game.players[0];
  $("map").dataset.playerX = p.x.toFixed(5);
  $("map").dataset.playerY = p.y.toFixed(5);
  $("map").dataset.coverage = coverage(game, 0).toFixed(5);
  $("map").dataset.skin = selected().id;
  $("coverage").innerHTML =
    `${coverageLabel(game, 0)}<span>%</span>`;
  $("rankings").replaceChildren();
  for (const p of [...game.players].sort(
    (a, b) => coverage(game, b.id) - coverage(game, a.id),
  )) {
    const amount = coverage(game, p.id) * 100,
      color = p.id === 0 ? selected().color : p.color,
      node = document.createElement("div");
    node.className = "rank-item";
    const dot = document.createElement("i");
    dot.style.background = color;
    const label = document.createElement("span");
    label.textContent = p.id === 0 ? "你" : p.name;
    const pct = document.createElement("strong");
    pct.textContent = p.alive ? coverageLabel(game, p.id) + "%" : "出局";
    const bar = document.createElement("div");
    bar.className = "rank-track";
    const fill = document.createElement("span");
    fill.style.width = amount + "%";
    fill.style.background = color;
    bar.append(fill);
    node.append(dot, label, pct, bar);
    $("rankings").append(node);
  }
  let playerNotice = false;
  for (const event of readNewEvents(game.events, lastEvent)) {
    lastEvent = event;
    if (event.id !== 0) continue;
    if (event.type === "cut") {
      playerNotice = true;
      $("map-hint").textContent = "这次路被切断了，旧领地还在";
      notify("回到自己的紙上，再试一次。");
    } else if (event.type === "capture") {
      playerNotice = true;
      $("map-hint").textContent = "圈住的这一片，已填满你的颜色";
    } else if (event.type === "win") {
      clearInput();
      document.body.dataset.mode = "reward";
      $("reward-finish").hidden = false;
      notify("整座岛都归你了！去捡金币和三个宝箱吧。");
    } else if (event.type === "coin" || event.type === "chest") {
      const prize = collectReward(profile, game, event);
      if (prize) {
        save();
        $("wallet").textContent = profile.coins;
        if (prize.type === "skin")
          notify(
            "宝箱赠予：" +
              SKINS.find((s) => s.id === prize.skin).name +
              "动态纸片",
          );
      }
    } else if (event.type === "clock") {
      notify(`拾到钟表，领奖时间 +${event.seconds} 秒`);
    }
  }
  if (game.mode === "reward")
    $("map-hint").textContent =
      `胜利奖励 · 金币 ${game.rewards.coins.filter((c) => !c.collected).length} · 宝箱 ${game.rewards.chests.filter((c) => !c.collected).length} · 钟表可加时`;
  const rewarding = game.mode === "reward" || game.resumeMode === "reward";
  $("reward-clock").hidden = !rewarding;
  $("reward-seconds").textContent = Math.ceil(game.rewards?.remaining || 0);
  $("map").dataset.rewardRemaining = game.rewards?.remaining || 0;
  $("run-score").textContent = Math.floor(game.peak * 100) + (game.winner === 0 ? 50 : 0) + rewardSummary(game).coins;
  if (!playerNotice && game.players[0].trail.length)
    $("map-hint").textContent = "回到自己的颜色，闭合这条路";
}
const playable = () => game && ["playing", "reward"].includes(game.mode);
function start() {
  game = createGame({ cols: 88, rows: 76 });
  game.speed = Number($("speed").value);
  lastEvent = null;
  hudTime = 0;
  $("reward-finish").hidden = true;
  screen("game");
  $("map-hint").textContent = "画弧线，绕一圈，再回到自己的颜色";
  updateHud();
  renderer.draw(game, selected());
  last = performance.now();
}
function pause() {
  if (!playable()) return;
  clearInput();
  game.resumeMode = game.mode;
  game.mode = "paused";
  window.GameActivity?.setPlaying(false);
  document.body.dataset.mode = "paused";
  $("pause-dialog").hidden = false;
  $("resume").focus();
}
function resume() {
  if (!game || game.mode !== "paused") return;
  clearInput();
  game.mode = game.resumeMode || "playing";
  window.GameActivity?.setPlaying(playable());
  game.resumeMode = null;
  document.body.dataset.mode = game.mode;
  $("pause-dialog").hidden = true;
  last = performance.now();
}
function end() {
  window.GameActivity?.finish();
  if (!game) return;
  updateHud();
  clearInput();
  finishRun(game);
  const reward = settleRun(profile, game),
    prizes = rewardSummary(game),
    extra = prizes.coins;
  save();
  refreshProfile();
  const won = game.winner === 0;
  screen("result");
  $("result-title").textContent = won
    ? "整座岛，都是你的了。"
    : !game.players[0].alive
      ? "小纸片，下次再来。"
      : "把这一片风景带回家。";
  $("result-copy").textContent = won
    ? `100% 占地达成！胜场 +1，获得 ${prizes.skins} 款隐藏纸，领奖金币 +${extra}。`
    : !game.players[0].alive
      ? "领地被夺完了。这次的最好成绩已经结算。"
      : "本局已结束，按最高占地结算金币。";
  $("result-peak").textContent = (game.peak * 100).toFixed(1) + "%";
  $("result-coins").textContent = "+" + (reward + extra);
  $("result-score").textContent = reward + extra;
}
function direction(dt) {
  const x =
      (keys.has("ArrowRight") || keys.has("d") ? 1 : 0) -
      (keys.has("ArrowLeft") || keys.has("a") ? 1 : 0),
    y =
      (keys.has("ArrowDown") || keys.has("s") ? 1 : 0) -
      (keys.has("ArrowUp") || keys.has("w") ? 1 : 0);
  if (keys.size) return { x, y };
  if (joyPointer !== null) return joy;
  if (mouseTarget) {
    const p = game.players[0],
      dx = mouseTarget.x - p.x,
      dy = mouseTarget.y - p.y,
      d = Math.hypot(dx, dy);
    if (d < 0.006) {
      mouseTarget = null;
      return { x: 0, y: 0 };
    }
    const travel = Math.max(0.0001, game.speed * dt),
      scale = Math.min(1, d / travel);
    return { x: (dx / d) * scale, y: (dy / d) * scale };
  }
  return { x: 0, y: 0 };
}
let previewTime = 0;
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (document.body.dataset.screen === "game" && game) {
    if (playable()) {
      stepGame(game, dt, direction(dt));
      if (game.mode === "over") {
        end();
        requestAnimationFrame(frame);
        return;
      }
    }
    renderer.draw(game, selected(), game.time);
    if (now - hudTime > 80) {
      updateHud();
      hudTime = now;
    }
  } else if (!document.hidden && now - previewTime > 80) {
    previewTime = now;
    const s = document.body.dataset.screen;
    if (s === "home") {
      drawHero(now / 1000);
      paperPreview($("home-paper"), selected(), 38, false, now / 1000);
    } else if (s === "result")
      paperPreview($("result-paper"), selected(), 75, false, now / 1000);
    else if (s === "shop")
      for (const c of document.querySelectorAll(".skin-preview")) {
        const skin = SKINS.find((s) => s.id === c.dataset.skin),
          r = c.getBoundingClientRect();
        if (
          skin.tier === "hidden" &&
          profile.owned.includes(skin.id) &&
          r.bottom > 0 &&
          r.top < innerHeight
        )
          paperPreview(c, skin, 64, false, now / 1000);
      }
  }
  requestAnimationFrame(frame);
}
$("start").addEventListener("click", start);
$("shop").addEventListener("click", () => {
  screen("shop");
  renderShop();
});
$("shop-back").addEventListener("click", () => {
  screen("home");
  refreshProfile();
});
$("return-home").addEventListener("click", () => {
  game = null;
  screen("home");
  refreshProfile();
});
$("pause").addEventListener("click", pause);
$("resume").addEventListener("click", resume);
$("finish").addEventListener("click", end);
$("speed").addEventListener("change", () => {
  if (game) game.speed = Number($("speed").value);
  mouseTarget = null;
});
for (const tab of document.querySelectorAll("[data-tier]"))
  tab.addEventListener("click", () => {
    tier = tab.dataset.tier;
    renderShop();
  });
$("reward-finish").addEventListener("click", end);
for (const [id, coins] of [['exchange-one', 1], ['exchange-fifty', 50]])
  $(id).addEventListener('click', () => {
    if (!exchangeDiamonds(profile, coins)) return;
    const saved = save();
    refreshProfile();
    renderShop();
    if (saved) notify(`兑换成功：${coins} 金币 → ${coins * 2} 钻石`);
  });
$("map").addEventListener("pointermove", (e) => {
  if (
    e.pointerType !== "mouse" ||
    !playable() ||
    keys.size ||
    joyPointer !== null
  )
    return;
  inputHelp(false);
  const r = $("map").getBoundingClientRect(),
    { scale, ox, oy } = renderer.getGeometry();
  mouseTarget = {
    x: (e.clientX - r.left - ox) / scale,
    y: (e.clientY - r.top - oy) / scale,
  };
});
$("map").addEventListener("pointerleave", () => {
  mouseTarget = null;
});
$("map").addEventListener("pointercancel", () => {
  mouseTarget = null;
});
function joystickMove(e) {
  if (e.pointerId !== joyPointer) return;
  const r = $("joystick").getBoundingClientRect(),
    dx = e.clientX - r.left - r.width / 2,
    dy = e.clientY - r.top - r.height / 2,
    d = Math.hypot(dx, dy),
    limit = r.width * 0.34,
    factor = d > limit ? limit / d : 1;
  joy = { x: (dx * factor) / limit, y: (dy * factor) / limit };
  if (d < 5) joy = { x: 0, y: 0 };
  $("joy-knob").style.transform =
    `translate(${dx * factor}px,${dy * factor}px)`;
  e.preventDefault();
}
$("joystick").addEventListener("pointerdown", (e) => {
  if (!playable() || joyPointer !== null) return;
  inputHelp(e.pointerType === "touch" || coarsePointer.matches);
  joyPointer = e.pointerId;
  mouseTarget = null;
  keys.clear();
  $("joystick").setPointerCapture(e.pointerId);
  joystickMove(e);
});
$("joystick").addEventListener("pointermove", joystickMove);
for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
  $("joystick").addEventListener(event, (e) => {
    if (e.pointerId === joyPointer) clearInput();
  });
window.addEventListener("keydown", (e) => {
  if (
    document.body.dataset.screen !== "game" ||
    e.target.closest("input,select,textarea,[contenteditable=true]")
  )
    return;
  if (e.key === "Escape") {
    playable() ? pause() : resume();
    return;
  }
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (
    [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "w",
      "a",
      "s",
      "d",
    ].includes(key) &&
    playable()
  ) {
    e.preventDefault();
    mouseTarget = null;
    joy = { x: 0, y: 0 };
    keys.add(key);
  }
});
window.addEventListener("keyup", (e) => {
  keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);
});
window.addEventListener("blur", pause);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pause();
});
window.addEventListener("resize", () => {
  mouseTarget = null;
  if (document.body.dataset.screen === "home") drawHero();
});
refreshProfile();
requestAnimationFrame(frame);
