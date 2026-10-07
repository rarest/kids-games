import { LEVELS } from "./levels.js";
import { createState, stepState } from "./core.js";
import {
  SKINS,
  readProfile,
  writeProfile,
  buySkin,
  equipSkin,
  creditCoin,
  creditCustomFinish,
  recordFinish,
} from "./profile.js";
import {
  OUTFITS,
  readWardrobe,
  writeWardrobe,
  buyOutfit,
  equipOutfit,
} from "./wardrobe.js";
import { createScene } from "./scene.js";
import { createControls } from "./controls.js";
import { createEditorUI } from "./editor-ui.js";
import { createAudio } from "./audio.js";
import { createRouteLibrary, readRouteLibrary } from "./route-library.js";
import { createCelebration } from "./celebration.js";

const $ = (id) => document.getElementById(id),
  view = $("view"),
  audio = createAudio();
const celebration = createCelebration($("celebration"));
let storage = null,
  storageMessage = "";
try {
  storage = localStorage;
  storage.getItem("glow-parkour-v1");
} catch {
  storageMessage = "浏览器禁止本地存储：当前仍可游玩，余额和路线无法保存。";
}
const profile = readProfile(storage),
  wardrobe = readWardrobe(storage);
readRouteLibrary(storage); // One-time legacy migration; only durable routes are exposed below.
function savedRoutes() {
  try { return createRouteLibrary(JSON.parse(storage.getItem("glow-parkour-routes-v1"))).routes; }
  catch { return []; }
}
const escapeHTML = text => String(text).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
let scene,
  controls,
  editor,
  state,
  savedRunId = null,
  mode = "home",
  jumpRequested = false,
  skipTutorial = false,
  lastTime = 0,
  lastReadback = 0,
  helpReturn = "home",
  statusTimer = 0,
  shopTab = "skins",
  running = true;
let needsRender = true,
  lastRenderTime = 0,
  frameId = 0;
function status(text) {
  $("status").textContent = text;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    $("status").textContent = "";
  }, 6000);
}
function saveAppearance() {
  let saved = false;
  try {
    const previousProfile = storage.getItem("glow-parkour-v1");
    if (writeProfile(storage, profile)) {
      saved = writeWardrobe(storage, wardrobe);
      if (!saved) {
        // Native setItem is atomic per key; only the successful first write needs undo.
        if (previousProfile === null) storage.removeItem("glow-parkour-v1");
        else storage.setItem("glow-parkour-v1", previousProfile);
      }
    }
  } catch {}
  if (!saved)
    status("本地保存失败：当前外观与余额仍可使用，关闭页面后可能丢失。");
  $("coins").textContent = String(profile.coins);
  return saved;
}
function commitShopChange(previousProfile, previousWardrobe) {
  if (!saveAppearance()) {
    Object.assign(profile, previousProfile);
    Object.assign(wardrobe, previousWardrobe);
    status(
      "本地保存失败：本次购买或装备已取消，金币未扣除。请释放存储空间后重试。",
    );
  }
  appearance();
  renderShop();
}
const panels = [
  "home-panel",
  "home-tip",
  "hud",
  "tutorial",
  "touch-controls",
  "level-overlay",
  "shop-overlay",
  "editor-overlay",
  "editor-panel",
  "pause-overlay",
  "help-overlay",
];
function setMode(next) {
  if (mode === "complete" && next !== "complete") {
    celebration.stop();
    audio.stop();
  }
  mode = next;
  window.GameActivity?.setPlaying(next === "playing");
  document.body.dataset.mode = next;
  controls?.clear();
  jumpRequested = false;
  lastTime = performance.now();
  audio.setPaused(next !== "home" && next !== "playing" && next !== "complete");
  needsRender = true;
  for (const id of panels) $(id).hidden = true;
  if (next === "home") {
    $("home-panel").hidden = false;
    $("home-tip").hidden = false;
  }
  if (next === "playing") {
    $("hud").hidden = false;
    $("touch-controls").hidden = false;
  }
  if (next === "levels") $("level-overlay").hidden = false;
  if (next === "shop") $("shop-overlay").hidden = false;
  if (next === "editor") {
    $("editor-overlay").hidden = false;
    $("editor-panel").hidden = false;
  }
  if (next === "paused" || next === "complete")
    $("pause-overlay").hidden = false;
  if (next === "help") $("help-overlay").hidden = false;
  if (next === "playing") view.focus({ preventScroll: true });
  else if (next !== "home")
    document
      .querySelector(".overlay:not([hidden]) button")
      ?.focus({ preventScroll: true });
  if (scene && state) readback();
}
function appearance() {
  needsRender = true;
  scene.setSkin(SKINS.find((s) => s.id === profile.equipped));
  scene.setOutfit(OUTFITS.find((o) => o.id === wardrobe.equipped) ?? null);
  $("coins").textContent = String(profile.coins);
}
function showHome() {
  state = createState(LEVELS[0]);
  scene.setLevel(state.level);
  appearance();
  setMode("home");
}
const themeNames = {
  sakura: "樱花林",
  flowers: "百花林",
  city: "城市天桥",
  cabin: "林间木屋",
};
function renderLevels() {
  $("levels").innerHTML = LEVELS.map(
    (level, i) =>
      `<button class="level-card" data-level="${level.id}" data-theme="${level.theme}"><span class="level-theme">${themeNames[level.theme]}</span><span class="level-number">${String(i + 1).padStart(2, "0")}</span><strong>${level.name}</strong><small>${profile.progress[level.id] ? `✓ 最快 ${profile.progress[level.id].bestTime.toFixed(1)} 秒` : `${level.platforms.length} 个落点 · 难度 ${i + 1}`}</small></button>`,
  ).join("");
  const custom = savedRoutes();
  $("levels").insertAdjacentHTML("beforeend", custom.map(route =>
    `<div class="custom-level"><button class="level-card" data-level="${route.id}" data-theme="${route.level.theme}"><span class="level-theme">我的作品</span><strong>${escapeHTML(route.name)}</strong><small>${route.level.platforms.length} 个落点 · 通关金币可购买外观</small></button><button data-edit="${route.id}">编辑作品</button></div>`).join(""));
  for (const button of $("levels").querySelectorAll("[data-level]"))
    button.onclick = () => {
      const route = custom.find(r => r.id === button.dataset.level);
      startLevel(route?.level ?? LEVELS.find(l => l.id === button.dataset.level), route?.id);
    };
  for (const button of $("levels").querySelectorAll("[data-edit]"))
    button.onclick = () => { setMode("editor"); editor.open(button.dataset.edit); };
}
function startLevel(level, savedId = null) {
  savedRunId = level.custom && savedRoutes().some(r => r.id === savedId && JSON.stringify(r.level) === JSON.stringify(level)) ? savedId : null;
  state = createState(level);
  scene.setLevel(level);
  appearance();
  skipTutorial = false;
  $("level-name").textContent = level.name;
  $("practice-note").textContent = level.custom
    ? savedRunId ? "已保存作品：通关后收集的金币计入商店余额。" : "未保存试玩：金币不计入余额。保存作品后再挑战吧。"
    : "";
  setMode("playing");
}
function renderShop() {
  $("skins").innerHTML = SKINS.map(
    (s) =>
      `<button class="skin-card" data-skin="${s.id}" aria-pressed="${profile.equipped === s.id}"><span class="skin-swatch" style="background:${s.id === "rainbow" ? "linear-gradient(135deg,#e77c9a,#e6c568,#88b891,#71acc3,#b49ecb)" : s.color}"></span><strong>${s.name}</strong><small>${profile.equipped === s.id ? "已装备" : profile.owned.includes(s.id) ? "换上它" : "◈ 2 金币"}</small></button>`,
  ).join("");
  $("outfits").innerHTML = OUTFITS.map(
    (o) =>
      `<button class="outfit-card" data-outfit="${o.id}" aria-pressed="${wardrobe.equipped === o.id}"><span class="outfit-icon" style="display:block;--top:${o.top};--pants:${o.pants};--shoes:${o.shoes};--accent:${o.accent}"><i></i></span><strong>${o.name}</strong><small>${wardrobe.equipped === o.id ? "已穿上" : wardrobe.owned.includes(o.id) ? "穿上整套" : "◈ 2 金币"}</small></button>`,
  ).join("");
  for (const button of $("skins").querySelectorAll("[data-skin]"))
    button.onclick = () => {
      const id = button.dataset.skin;
      const previousProfile = structuredClone(profile),
        previousWardrobe = structuredClone(wardrobe);
      if (!profile.owned.includes(id) && !buySkin(profile, id)) {
        status("金币不足，需要 2 金币。先去旅途中收集吧。");
        return;
      }
      equipSkin(profile, id);
      commitShopChange(previousProfile, previousWardrobe);
    };
  for (const button of $("outfits").querySelectorAll("[data-outfit]"))
    button.onclick = () => {
      const id = button.dataset.outfit;
      const previousProfile = structuredClone(profile),
        previousWardrobe = structuredClone(wardrobe);
      if (!wardrobe.owned.includes(id) && !buyOutfit(profile, wardrobe, id)) {
        status("金币不足，需要 2 金币购买整套衣服。");
        return;
      }
      equipOutfit(wardrobe, id);
      commitShopChange(previousProfile, previousWardrobe);
    };
  $("skins").hidden = shopTab !== "skins";
  $("outfits").hidden = shopTab !== "outfits";
  $("outfit-remove").hidden = shopTab !== "outfits";
}
function pause() {
  if (mode !== "playing") return;
  $("pause-heading").textContent = "风景在这里等你";
  $("pause-caption").textContent = "TAKE A BREATH";
  $("pause-details").textContent = "休息一下，随时继续。";
  $("resume").hidden = false;
  $("next-level").hidden = true;
  $("quit").textContent = "返回关卡选择";
  $("edit-current").hidden = !state.level.custom;
  $("retry-reward").hidden = true;
  setMode("paused");
}
function settleFinish() {
  const previous = structuredClone(profile), receipts = new Set(state.receipts);
  const saved = Boolean(savedRunId && savedRoutes().some(r => r.id === savedRunId));
  const amount = creditCustomFinish(profile, state, { saved });
  recordFinish(profile, state, { saved });
  if (!saveAppearance()) {
    Object.assign(profile, previous);
    state.receipts = receipts;
    $("coins").textContent = String(profile.coins);
    $("retry-reward").hidden = false;
    status("通关保存失败，金币尚未入账。释放本机空间后点击重试领取。");
  } else {
    $("retry-reward").hidden = true;
    if (amount) status(`通关金币 +${amount}，已存入本机余额。`);
  }
}
function finish() {
  settleFinish();
  $("pause-caption").textContent = "YOU FOUND YOUR GLOW";
  $("pause-heading").textContent = "这一程，漂亮！";
  $("pause-details").textContent =
    `用时 ${state.elapsed.toFixed(1)} 秒 · 收集 ${state.collected.size} 枚金币 · 掉落 ${state.falls} 次`;
  $("resume").hidden = true;
  $("next-level").hidden = state.level.custom || state.level === LEVELS.at(-1);
  $("quit").textContent = "返回关卡选择";
  $("edit-current").hidden = !state.level.custom;
  setMode("complete");
  audio.play("finish");
  celebration.start(() => { if (mode === "complete") audio.setPaused(true); });
}
function tutorial() {
  if (!state.level.tutorial || skipTutorial || mode !== "playing") {
    $("tutorial").hidden = true;
    return;
  }
  const flags = state.tutorial,
    steps = [
      ["moved", "用 WASD / 方向键或摇杆移动。方向跟随镜头，向前就是首个落点。"],
      ["jumped", "空格、单击场景或右下按钮跳跃；跳过平台间的小缺口。"],
      ["camera", "拖动场景看看四周。也可直接继续旅程，↺ 镜头随时复位。"],
      ["collected", "走近金色圆环收集金币，一枚就是 1 金币。"],
      ["checkpoint", "薄荷色旗帜是存档点，踩上后掉落从这里继续。"],
      ["finished", "走进前方发光门，完成这一程。"],
    ];
  const next = steps.find(
    ([key]) => !flags[key] && !(key === "camera" && flags.collected),
  );
  $("tutorial").hidden = !next;
  if (next) $("tutorial-text").textContent = next[1];
}
function readback() {
  const info = scene.info();
  for (const key of ["x", "y", "z"])
    view.dataset[key] = state.player[key].toFixed(3);
  for (const key of [
    "theme",
    "triangles",
    "drawCalls",
    "timeOfDay",
    "sunIntensity",
    "grassResponse",
    "outfit",
  ])
    view.dataset[key] = String(info[key]);
  view.dataset.mode = mode;
  view.dataset.resources = JSON.stringify(info.resources);
  view.dataset.dpr = String(info.dpr);
  view.dataset.renderMs = info.renderMs.toFixed(2);
  view.dataset.frameMs = info.frameMs.toFixed(2);
  view.dataset.shadowSize = String(info.shadowSize);
  view.dataset.cameraDistance = info.cameraDistance.toFixed(2);
  view.dataset.cameraYaw = info.yaw.toFixed(3);
  $("run-info").textContent =
    `${state.elapsed.toFixed(1)} 秒 · ${state.collected.size} / ${state.level.coins.length} 金币`;
  $("effect-status").textContent = [
    state.effects.speed && `加速 ×1.6 · ${Math.ceil(state.effects.speed.expiresAt - state.elapsed)}秒`,
    state.effects.jump && `高跳 ×1.5 · ${Math.ceil(state.effects.jump.expiresAt - state.elapsed)}秒`,
  ].filter(Boolean).join("　");
}
function frame(now) {
  if (!running) return;
  frameId = requestAnimationFrame(frame);
  const dt = Math.min(0.25, (now - lastTime) / 1000 || 0.016);
  lastTime = now;
  if (document.hidden) return;
  if (["paused", "complete", "help"].includes(mode) && !needsRender) return;
  if (
    !["home", "playing"].includes(mode) &&
    now - lastRenderTime < 100 &&
    !needsRender
  )
    return;
  let inputActive = false;
  if (mode === "playing" || mode === "home") {
    const input =
      mode === "playing"
        ? controls.sample(scene.info().yaw)
        : { x: 0, z: 0, jump: false };
    input.jump ||= jumpRequested;
    inputActive = Math.hypot(input.x, input.z) > 0;
    jumpRequested = false;
    stepState(state, input, dt);
    if (mode === "playing")
      for (const event of state.events) {
        if (event.type !== "finish") audio.play(event.type);
        if (event.type === "coin") {
          if (creditCoin(profile, state, event.id)) saveAppearance();
          else if (state.level.custom)
            status(savedRunId ? "金币 +1 · 通关后存入商店余额" : "试玩金币 +1 · 保存作品后通关可获得余额");
        }
        if (event.type === "checkpoint")
          status("存档点已点亮，掉落会从这里继续。");
        if (event.type === "fall") status("再试一次，微光还在前面。");
        if (event.type === "finish") finish();
      }
    else for (const event of state.events) audio.play(event.type);
  }
  // Menus do not advance physics. Paused scenes hold animation as well.
  scene.update(
    state,
    mode === "paused" || mode === "complete" || mode === "help" ? 0 : dt,
    mode,
    inputActive,
  );
  scene.render();
  needsRender = false;
  lastRenderTime = now;
  if (now - lastReadback > 80) {
    readback();
    tutorial();
    lastReadback = now;
  }
}
try {
  scene = createScene(view);
  controls = createControls(view, $("joystick"), $("jump"), {
    onJump() {
      if (mode === "home" || mode === "playing") jumpRequested = true;
    },
    onOrbit(dx, dy) {
      if (mode === "home" || mode === "playing") {
        scene.orbit(dx, dy);
        state.tutorial.camera = true;
      }
    },
    onInteract: audio.unlock,
  });
  editor = createEditorUI($("editor-panel"), {
    onPlay: startLevel,
    onClose: showHome,
    onStatus: status,
    onSaved: renderLevels,
  });
  $("start").onclick = () => {
    renderLevels();
    setMode("levels");
  };
  $("home-return").onclick = showHome;
  $("shop").onclick = () => {
    renderShop();
    setMode("shop");
  };
  $("shop-close").onclick = () => setMode("home");
  $("editor").onclick = () => {
    setMode("editor");
    editor.open();
  };
  $("pause").onclick = pause;
  $("resume").onclick = () => setMode("playing");
  $("quit").onclick = () => {
    renderLevels();
    setMode("levels");
  };
  $("edit-current").onclick = () => { setMode("editor"); editor.open(savedRunId); };
  $("retry-reward").onclick = settleFinish;
  $("restart").onclick = () => startLevel(state.level, savedRunId);
  for (const link of document.querySelectorAll('a[href="../index.html"]'))
    link.addEventListener("click", event => { if (!editor.confirmLeave()) event.preventDefault(); });
  $("pause-home").onclick = showHome;
  $("next-level").onclick = () =>
    startLevel(LEVELS[LEVELS.indexOf(state.level) + 1]);
  $("reset-camera").onclick = () => {
    scene.resetCamera();
    controls.clear();
    view.focus({ preventScroll: true });
  };
  $("skip-tutorial").onclick = () => {
    skipTutorial = true;
    $("tutorial").hidden = true;
    view.focus({ preventScroll: true });
  };
  $("help").onclick = () => {
    helpReturn = mode;
    if (mode === "playing") pause();
    setMode("help");
  };
  $("help-close").onclick = () => {
    if (helpReturn === "playing") {
      setMode("playing");
      pause();
    } else setMode(helpReturn);
  };
  $("mute").onclick = () => {
    const value = $("mute").getAttribute("aria-pressed") !== "true";
    $("mute").setAttribute("aria-pressed", String(value));
    $("mute").textContent = value ? "♪̸" : "♫";
    $("mute").setAttribute("aria-label", value ? "打开声音" : "静音");
    audio.setMuted(value);
    if (mode === "playing") view.focus({ preventScroll: true });
  };
  for (const button of document.querySelectorAll("[data-shop-tab]"))
    button.onclick = () => {
      shopTab = button.dataset.shopTab;
      for (const other of document.querySelectorAll("[data-shop-tab]"))
        other.setAttribute("aria-pressed", String(other === button));
      renderShop();
    };
  $("outfit-remove").onclick = () => {
    equipOutfit(wardrobe, null);
    appearance();
    saveAppearance();
    renderShop();
  };
  for (const button of document.querySelectorAll("[data-time]"))
    button.onclick = () => {
      wardrobe.timeOfDay = button.dataset.time;
      scene.setTimeOfDay(wardrobe.timeOfDay);
      for (const other of document.querySelectorAll("[data-time]"))
        other.setAttribute("aria-pressed", String(other === button));
      saveAppearance();
    };
  document
    .querySelector(`[data-time="${wardrobe.timeOfDay}"]`)
    .setAttribute("aria-pressed", "true");
  document.addEventListener("pointerdown", audio.unlock);
  document.addEventListener("keydown", (event) => {
    audio.unlock();
    if (event.code === "Escape") {
      if (mode === "playing") pause();
      else if (mode === "paused") setMode("playing");
      else if (mode === "help") $("help-close").click();
      else if (mode === "editor") $("editor-close").click();
      else if (mode === "shop" || mode === "levels") showHome();
    }
    if (event.code === "Tab" && !["home", "playing"].includes(mode)) {
      const panel = document.querySelector(
        '.overlay:not([hidden]) [role="dialog"]',
      );
      const targets = [
        ...(panel?.querySelectorAll("button,input,select,a") ?? []),
      ].filter((el) => !el.disabled && el.getClientRects().length);
      if (targets.length) {
        const first = targets[0],
          last = targets.at(-1);
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            !panel.contains(document.activeElement))
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last ||
            !panel.contains(document.activeElement))
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    }
  });
  window.addEventListener("blur", () => {
    controls.clear();
    jumpRequested = false;
    pause();
    audio.setPaused(true);
  });
  window.addEventListener("focus", () => {
    if (mode === "home") audio.setPaused(false);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      controls.clear();
      jumpRequested = false;
      pause();
      audio.setPaused(true);
    } else {
      lastTime = performance.now();
      if (mode === "home") audio.setPaused(false);
    }
  });
  window.addEventListener("resize", () => {
    scene.resize();
    needsRender = true;
  });
  view.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    pause();
    $("loading").hidden = false;
    $("loading").innerHTML =
      '3D画面暂时中断，请重新加载。<a href="../index.html">返回游戏厅</a>';
    running = false;
  });
  window.addEventListener("pagehide", (event) => {
    editor.persistDraft();
    celebration.stop();
    running = false;
    cancelAnimationFrame(frameId);
    controls.clear();
    jumpRequested = false;
    audio.setPaused(true);
    if (event.persisted) {
      pause();
    } else {
      controls.dispose();
      audio.dispose();
      scene.dispose();
    }
  });
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    controls.clear();
    jumpRequested = false;
    lastTime = performance.now();
    needsRender = true;
    running = true;
    scene.resize();
    if (mode === "home") audio.setPaused(false);
    frameId = requestAnimationFrame(frame);
  });
  showHome();
  scene.setTimeOfDay(wardrobe.timeOfDay);
  scene.update(state, 0.016, "home");
  scene.render();
  readback();
  $("loading").hidden = true;
  document.body.dataset.ready = "true";
  if (storageMessage) {
    $("storage-note").textContent = storageMessage;
    status(storageMessage);
  }
  frameId = requestAnimationFrame(frame);
} catch (error) {
  $("loading").innerHTML =
    `<p>无法启动3D画面。${error.message.includes("WebGL") ? "当前浏览器无法使用 WebGL。" : "请重新加载后再试。"}</p><a href="../index.html">返回游戏厅</a>`;
  controls?.dispose();
  audio.dispose();
  scene?.dispose();
}
