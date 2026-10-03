import { createGame, stepGame, setPaused, finishBonus } from "./core.js";
import { LEVELS, getLevel } from "./levels.js";
import { availableAreas } from "./campaign.js";
import { createScene } from "./scene.js";
import { createControls } from "./controls.js";
import { presentCompletion } from "./completion.js";
import { createProfile } from "./profile.js";
import { createAudio } from "./audio.js";
import { createRescueClient } from "./net-client.js";
import { updateRoomUI, resetRoomUI } from "./net-ui.js";
import { frameDurations } from "./frame-time.js";
const $ = (id) => document.getElementById(id),
  canvas = $("view");
// The save point is the beginning of a region; replaying never duplicates mid-region earnings.
const profile = createProfile(),
  saved = profile.load(),
  audio = createAudio(saved.options);
let scene,
  state,
  screen = "home",
  panel = null,
  returnPanel = null,
  raf = null,
  last = 0,
  completed = false,
  disposed = false,
  entryRun = null,
  noticeTimer,
  lastSaveOk = !profile.error;
let online = null,
  onlineOriginalOptions = null,
  onlineStatus = null,
  onlineGeneration = 0,
  readySent = false,
  readyFrame = null,
  congestionEpoch = null,
  onlineLayoutPrepared = false,
  lifecycleAvailable = true,
  cachedOnline = false,
  renderedPositions = [];
const deviceAvailable = () => lifecycleAvailable && !document.hidden && !!scene && !scene.diagnostics().contextLost;
const teamReady = () => !!online?.room?.members.every(member => member?.connected && member.ready);
const controls = createControls({
  players: saved.options.players,
  joystick: $("joystick"),
  jump: $("touch-jump"),
  action: $("touch-action"),
  capture: () => screen === "game" && !panel,
  onPause: () => {
    if (screen === "game") {
      if (panel === "pause") closePanel();
      else if (!panel) openPanel("pause");
    }
  },
});
function notify(text, sticky = false) {
  clearTimeout(noticeTimer);
  $("notice").textContent = text;
  if (text && !sticky)
    noticeTimer = setTimeout(() => {
      $("notice").textContent = "";
    }, 5000);
}
function save() {
  if (online) return true;
  const result = profile.save(saved);
  lastSaveOk = result.ok;
  if (!result.ok) notify(result.error, true);
  return result.ok;
}
function optionsUI() {
  $("best-score").textContent = `最高纪录：${saved.bestScore} 分`;
  for (const [id, value] of [
    ["players-one", saved.options.players === 1],
    ["players-two", saved.options.players === 2],
    ["chip", saved.options.character === "chip"],
    ["dale", saved.options.character === "dale"],
    ["music", saved.options.music],
    ["sound", saved.options.sound],
  ])
    $(id).setAttribute("aria-pressed", String(value));
  $("music").textContent = `音乐：${saved.options.music ? "开" : "关"}`;
  $("sound").textContent = `音效：${saved.options.sound ? "开" : "关"}`;
  for (const b of document.querySelectorAll("[data-quality]"))
    b.setAttribute(
      "aria-pressed",
      String(b.dataset.quality === saved.options.quality),
    );
  $("continue").hidden = !saved.run;
  $("saved-label").textContent = saved.run
    ? `${lastSaveOk ? "已保存" : "本次进度未保存"}：${getLevel(saved.run.areaId).name}起点 · ${saved.run.score} 分`
    : "";
}
function resize() {
  if (!scene) return;
  const r = canvas.getBoundingClientRect();
  scene.resize(r.width, r.height);
}
function runValues(areaId, source = state) {
  return {
    areaId,
    score: source.score,
    flowers: source.flowers,
    stars: source.stars,
    lives: source.players.map((p) => p.lives),
    players: source.players.length,
    character: source.players[0].character,
  };
}
function activate(value, finishEffects = false) {
  if (value && scene?.diagnostics().contextLost) {
    openPanel("pause");
    return;
  }
  if (state && !online) setPaused(state, !value);
  controls.clear();
  audio.setActive(value && !document.hidden && (!online || (online.room?.mode === "playing" && deviceAvailable())), {
    finishEffects: finishEffects && !document.hidden,
  });
  last = 0;
  if (scene && state) diagnostics();
}
function hidePanels() {
  for (const e of document.querySelectorAll(".panel")) e.hidden = true;
  $("overlay").hidden = true;
  panel = null;
}
function openPanel(name, finishEffects = false) {
  if (panel === name) return;
  if (online && screen === "game" && online.room?.mode === "playing" && !["complete", "gameover"].includes(name))
    online.command("pause");
  activate(false, finishEffects);
  hidePanels();
  panel = name;
  $(name + "-panel").hidden = false;
  $("overlay").hidden = false;
  if (name === "map") renderMap();
  canvas.dataset.phase = name === "pause" ? "paused" : name;
}
function closePanel() {
  if (online && panel === "pause") {
    controls.clear();
    if (online.slot === 0 && teamReady() && deviceAvailable()) online.command("resume");
    return;
  }
  const previous = returnPanel;
  returnPanel = null;
  hidePanels();
  if (previous) {
    openPanel(previous);
    return;
  }
  if (screen === "game" && ["playing", "bonus"].includes(state.status)) {
    activate(true);
    canvas.focus({ preventScroll: true });
  } else activate(false);
}
function home() {
  congestionEpoch = null;
  if (onlineOriginalOptions) {
    saved.options = onlineOriginalOptions;
    onlineOriginalOptions = null;
    audio.setOptions(saved.options);
    scene?.setQuality(saved.options.quality);
  }
  if (online) {
    const old = online;
    online = null;
    onlineStatus = null;
    onlineGeneration++;
    old.leave();
    old.dispose();
  }
  document.body.dataset.online = "false";
  resetRoomUI();
  controls.setPlayers(saved.options.players);
  returnPanel = null;
  hidePanels();
  screen = "home";
  document.body.dataset.screen = "home";
  $("home-panel").hidden = false;
  $("hud").hidden = true;
  $("touch-controls").hidden = true;
  $("bonus-bar").hidden = true;
  completed = false;
  state = createGame(getLevel("0"), {
    players: 2,
    character: saved.options.character,
  });
  setPaused(state, true);
  scene.setLevel(state.level);
  activate(false);
  optionsUI();
  resize();
}
function startArea(id, { resume = false, reset = false, retry = false } = {}) {
  returnPanel = null;
  hidePanels();
  screen = "game";
  document.body.dataset.screen = "game";
  $("home-panel").hidden = true;
  $("hud").hidden = false;
  $("touch-controls").hidden = false;
  completed = false;
  let run = resume ? saved.run : retry ? entryRun : reset ? null : saved.run;
  const opts =
    resume && run
      ? { players: run.players, character: run.character }
      : saved.options;
  state = createGame(getLevel(id), {
    players: opts.players,
    character: opts.character,
    campaign: saved.campaign,
  });
  if (run) {
    state.score = run.score;
    state.flowers = run.flowers;
    state.stars = run.stars;
    const lives =
      opts.players === 1 && run.players === 2
        ? [run.lives[0] > 0 ? run.lives[0] : run.lives[1]]
        : run.lives;
    state.players.forEach((p, i) => {
      p.lives = retry ? 3 : (lives[i] ?? 3);
      p.hearts = p.lives > 0 ? 3 : 0;
    });
  }
  saved.campaign.current = id;
  entryRun = runValues(id);
  saved.run = structuredClone(entryRun);
  save();
  optionsUI();
  controls.setPlayers(state.players.length);
  scene.setLevel(state.level);
  resize();
  activate(true);
  canvas.focus({ preventScroll: true });
  audio.unlock();
}
function renderMap() {
  const campaign = online ? state.campaign : saved.campaign;
  const allowed = availableAreas(campaign);
  $("area-grid").replaceChildren();
  for (const level of LEVELS) {
    const b = document.createElement("button");
    b.dataset.area = level.id;
    b.disabled = !allowed.includes(level.id) || (!!online && (online.slot !== 0 || state.status !== "cleared" || !teamReady()));
    const title = document.createElement("b");
    title.textContent = level.id;
    const label = document.createElement("span");
    label.textContent = level.name;
    b.append(title, label);
    if (campaign.completed.includes(level.id)) {
      b.setAttribute("aria-label", `${level.id} ${level.name}，已完成，可回玩`);
      b.append(document.createTextNode("✓ 已完成"));
    }
    b.addEventListener("click", () => online ? online.command("next", { areaId: level.id }) : startArea(level.id));
    $("area-grid").append(b);
  }
  $("map-copy").textContent = campaign.ending
    ? "朋友已获救！也可以回到喜欢的区域再冒险。"
    : "完成区域后，新的路线会亮起来。";
}
function complete() {
  if (online) {
    if (!completed) {
      completed = true;
      presentCompletion(state, document);
      openPanel("complete", true);
    }
    return;
  }
  if (completed) return;
  completed = true;
  const next = saved.campaign.current;
  const totals = runValues(next);
  saved.run = totals;
  const ok = save();
  optionsUI();
  presentCompletion(state, document);
  openPanel("complete", true);
  if (ok) notify("进度已保存，可从下一站起点继续。");
}
function hud() {
  const p = state.players;
  $("area-name").textContent = state.areaLevel.name;
  $("hearts").textContent = p
    .map(
      (q, i) =>
        `${p.length > 1 ? `${i + 1}P ` : ""}${q.character === "chip" ? "奇奇" : "蒂蒂"} ${"♥".repeat(q.hearts)}${"♡".repeat(3 - q.hearts)} ×${q.lives}`,
    )
    .join("  ");
  $("score").textContent = `${state.score} 分`;
  $("collectibles").textContent = `花 ${state.flowers} · 星 ${state.stars}`;
  $("bonus-bar").hidden = state.status !== "bonus" || !!panel;
  if (state.bonus)
    $("bonus-count").textContent =
      `奖励时间 ${Math.ceil(state.bonus.remaining)} 秒 · 已收集 ${state.bonus.collected}`;
}
function diagnostics() {
  const d = scene.diagnostics(),
    p = state.players;
  Object.assign(canvas.dataset, {
    webgl: String(d.webgl),
    contextLost: String(d.contextLost),
    phase:
      panel === "pause"
        ? "paused"
        : (panel ?? (screen === "home" ? "home" : state.status)),
    theme: state.level.theme,
    area: state.areaLevel.id,
    level: state.level.id,
    x: String(p[0].x),
    y: String(p[0].y),
    positions: JSON.stringify(
      p.map((q) => ({
        id: q.id,
        character: q.character,
        x: q.x,
        y: q.y,
        hearts: q.hearts,
        lives: q.lives,
        carrying: q.carrying,
        hidden: q.hidden,
        grounded: q.grounded,
        groundId: q.groundId,
        vx: q.vx,
        vy: q.vy,
      })),
    ),
    players: String(p.length),
    carrying: String(p.filter((q) => q.carrying).length),
    hidden: String(p[0].hidden),
    graphics: JSON.stringify(d),
    audio: JSON.stringify(audio.diagnostics()),
    pads: JSON.stringify(controls.bindings),
    score: String(state.score),
    flowers: String(state.flowers),
    stars: String(state.stars),
    simTime: String(state.time),
    completed: JSON.stringify(online ? state.completed : saved.campaign.completed),
    renderPositions: JSON.stringify(renderedPositions),
    network: JSON.stringify(online ? {...online.diagnostics(),room:online.room} : null),
    physics: JSON.stringify({
      platforms: state.platforms,
      objects: state.objects,
      enemies: state.enemies,
      hazards: state.hazards,
      projectiles: state.projectiles,
    }),
  });
}
function frame(now) {
  raf = null;
  if (disposed || !scene || !state || document.hidden) return;
  const duration = frameDurations(now, last), dt = duration.local;
  last = now;
  if (screen === "game") {
    const wasPanel = panel,
      inputs = controls.sample();
    if (online) online.advance(panel || wasPanel ? {} : inputs[0] ?? {}, duration.online);
    else if (!panel && !wasPanel) stepGame(state, inputs, dt);
    if (state.level !== renderedLevel) {
      scene.setLevel(state.level);
      renderedLevel = state.level;
    }
    audio.consume(state);
    if (!online && state.score > saved.bestScore) {
      saved.bestScore = state.score;
      save();
      optionsUI();
    }
    if (state.status === "cleared") complete();
    else if (state.status === "gameover" && !panel) openPanel("gameover", true);
    hud();
  }
  if (screen === "home" && !panel && !online) state.time += dt;
  const visual = online?.render() ?? state;
  const beforeDraw = scene.diagnostics().frames;
  scene.update(visual, dt);
  const afterDraw = scene.diagnostics().frames;
  // A paused/unready update acknowledges ready:false on the same ordered socket.
  // Until it arrives, withheld old playing authority cannot end congestion recovery.
  const congestionCleared = congestionEpoch === null || (
    online?.room?.mode === "paused" &&
    online.room.members[online.slot]?.ready === false &&
    online.diagnostics().epoch > congestionEpoch
  );
  if (online?.authority && !readySent && congestionCleared && deviceAvailable() && onlineStatus?.connection === "connected" && afterDraw > beforeDraw) {
    // Wait for another actual draw after layout/level preparation before advertising readiness.
    if (readyFrame === null) readyFrame = afterDraw;
    else if (afterDraw > readyFrame) {
      readySent = true;
      congestionEpoch = null;
      online.setReady(true);
    }
  }
  renderedPositions = visual.players.map(q => ({id:q.id,x:q.x,y:q.y}));
  diagnostics();
  raf = requestAnimationFrame(frame);
}
let renderedLevel;
function restartLoop() {
  last = 0;
  if (
    scene &&
    state &&
    raf === null &&
    !disposed &&
    !document.hidden &&
    !scene.diagnostics().contextLost
  )
    raf = requestAnimationFrame(frame);
}
function suspend() {
  lifecycleAvailable = false;
  readySent = false;
  readyFrame = null;
  online?.suspend();
  controls.clear();
  audio.setActive(false);
  if (screen === "game" && !panel) openPanel("pause");
  if (raf !== null) cancelAnimationFrame(raf);
  raf = null;
  last = 0;
}
function retry() {
  if (online) { online.command("retry"); return; }
  startArea(state.areaLevel.id, { retry: true });
}
for (const [id, fn] of Object.entries({
  start: () => startArea("0", { reset: true }),
  continue: () => saved.run && startArea(saved.run.areaId, { resume: true }),
  pause: () => openPanel("pause"),
  resume: closePanel,
  retry,
  home,
  "gameover-retry": retry,
  "gameover-home": home,
  "complete-home": home,
  "next-area": () => {
    returnPanel = "complete";
    openPanel("map");
  },
  "map-open": () => openPanel("map"),
  "help-open": () => openPanel("help"),
  "options-open": () => openPanel("options"),
  "paused-options": () => {
    returnPanel = "pause";
    openPanel("options");
  },
  "bonus-finish": () => {
    if (online) online.command("finishBonus");
    else finishBonus(state);
  },
}))
  $(id).addEventListener("click", () => {
    audio.unlock();
    fn();
    if (screen === "game" && !panel) canvas.focus({ preventScroll: true });
  });
for (const b of document.querySelectorAll(".close-panel"))
  b.addEventListener("click", closePanel);
for (const [id, key, value] of [
  ["players-one", "players", 1],
  ["players-two", "players", 2],
  ["chip", "character", "chip"],
  ["dale", "character", "dale"],
])
  $(id).addEventListener("click", () => {
    saved.options[key] = value;
    save();
    optionsUI();
    if (screen === "home" && scene && state) home();
  });
for (const key of ["music", "sound"])
  $(key).addEventListener("click", () => {
    saved.options[key] = !saved.options[key];
    audio.unlock();
    audio.setOptions(saved.options);
    save();
    optionsUI();
  });
for (const b of document.querySelectorAll("[data-quality]"))
  b.addEventListener("click", () => {
    saved.options.quality = b.dataset.quality;
    scene?.setQuality(saved.options.quality);
    save();
    optionsUI();
  });
window.addEventListener("resize", resize);
const observer = new ResizeObserver(resize);
observer.observe($("stage"));
window.addEventListener("blur", () => {
  controls.clear();
  audio.setActive(false);
  if (online) suspend();
  else if (screen === "game" && !panel) openPanel("pause");
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) suspend();
  else recover();
});
window.addEventListener("focus", () => { if (online) recover(); });
document.addEventListener("freeze", suspend);
document.addEventListener("resume", recover);
window.addEventListener("pagehide", (e) => {
  cachedOnline = !!online && e.persisted;
  suspend();
  if (!e.persisted) {
    disposed = true;
    clearTimeout(noticeTimer);
    observer.disconnect();
    controls.dispose();
    audio.dispose();
    scene?.dispose();
  }
});
window.addEventListener("pageshow", () => {
  if (!disposed) {
    if (cachedOnline) {
      cachedOnline = false;
      const previous = online;
      online = null;
      onlineGeneration++;
      previous?.dispose();
      enterOnline();
    }
    resize();
    recover();
  }
});
function recover() {
  lifecycleAvailable = true;
  controls.clear();
  if (online) { readySent = false; readyFrame = null; }
  refreshOnlineUI();
  restartLoop();
}
function refreshOnlineUI() {
  if (onlineStatus) updateRoomUI(onlineStatus, deviceAvailable() && congestionEpoch === null);
}
function receiveOnline(authority, packet) {
  state = authority;
  if (!scene) return;
  if (!onlineLayoutPrepared) {
    onlineLayoutPrepared = true;
    document.body.dataset.screen = "game";
    $("home-panel").hidden = true;
    resize();
  }
  if (state.level !== renderedLevel) {
    scene.setLevel(state.level);
    renderedLevel = state.level;
  }
  if (packet.room.mode === "lobby") {
    if (panel !== "online") openPanel("online");
  } else {
    const newRun = screen !== "game" || onlineRun !== packet.room.run;
    onlineRun = packet.room.run;
    screen = "game";
    document.body.dataset.screen = "game";
    $("home-panel").hidden = true;
    $("hud").hidden = false;
    $("touch-controls").hidden = false;
    if (newRun) { completed = false; returnPanel = null; hidePanels(); resize(); activate(packet.room.mode === "playing" && congestionEpoch === null); }
    if (congestionEpoch !== null && packet.room.mode === "playing") {
      if (panel !== "pause") openPanel("pause");
      activate(false);
    } else if (packet.room.mode === "paused") {
      if (!panel || panel === "online") openPanel("pause");
      activate(false);
    } else if (packet.room.mode === "playing" && ["pause", "online"].includes(panel)) {
      hidePanels();
      activate(true);
      canvas.focus({preventScroll:true});
    } else if (!panel && audio.diagnostics().active !== deviceAvailable()) audio.setActive(deviceAvailable());
    if (state.status === "cleared") complete();
    else if (state.status === "gameover" && !panel) openPanel("gameover", true);
    hud();
  }
  diagnostics();
  if (raf === null) restartLoop();
}
let onlineRun = null;
function enterOnline() {
  if (online) return online;
  // Preserve the first snapshot across BFCache transport reconstruction.
  onlineOriginalOptions ??= {...saved.options};
  const generation = ++onlineGeneration;
  readySent = false;
  readyFrame = null;
  congestionEpoch = null;
  onlineLayoutPrepared = false;
  onlineRun = null;
  controls.setPlayers(1);
  document.body.dataset.online = "true";
  $("online-leave").hidden = false;
  $("home").hidden = true;
  // Construction may synchronously report a saved-session reconnect. Callbacks do not
  // dereference a not-yet-assigned client; accepted states arrive asynchronously.
  online = createRescueClient({
    onState(authority, packet) { if (generation === onlineGeneration) receiveOnline(authority, packet); },
    onStatus(status) {
      if (generation !== onlineGeneration) return;
      // Explicit page/GPU suspension clears readySent before client.suspend().
      // A new suspended status while ready is therefore the client's internal guard.
      const internallySuspended = status.suspended && !onlineStatus?.suspended && readySent && deviceAvailable();
      onlineStatus = status;
      if (internallySuspended) {
        congestionEpoch = online.diagnostics().epoch;
        readySent = false;
        readyFrame = null;
        controls.clear();
        audio.setActive(false);
        if (screen === "game" && panel !== "pause") openPanel("pause");
      }
      if (status.connection === "reconnecting") { readySent = false; readyFrame = null; congestionEpoch = null; }
      if (["reconnecting", "closed", "error"].includes(status.connection)) {
        controls.clear();
        audio.setActive(false);
      }
      refreshOnlineUI();
      if (status.message && status.connection === "error") notify(status.message);
      // dispose keeps authority for BFCache; a server-closed room clears it.
      if (status.connection === "closed" && online && !online.authority && !cachedOnline) {
        const message = status.message;
        home();
        notify(message);
      } else if (status.connection === "reconnecting" && screen === "game" && !panel) openPanel("pause");
    },
  });
  return online;
}
$("online-open").addEventListener("click", () => { openPanel("online"); $("online-hud").hidden = true; });
$("online-create").addEventListener("click", () => { audio.unlock(); enterOnline().create(); });
$("online-join").addEventListener("click", () => { audio.unlock(); enterOnline().join($("online-input").value); });
$("online-start").addEventListener("click", () => { audio.unlock(); if (teamReady() && deviceAvailable()) online?.command("start"); });
for (const b of document.querySelectorAll("[data-online-leave]")) b.addEventListener("click", home);
for (const event of ["contextmenu", "selectstart"]) $("app").addEventListener(event, e => e.preventDefault());
try {
  scene = createScene(canvas);
  canvas.addEventListener("webglcontextlost", suspend);
  canvas.addEventListener("webglcontextrestored", () => {
    resize();
    recover();
  });
  scene.setQuality(saved.options.quality);
  home();
  renderedLevel = state.level;
  try { if (sessionStorage.getItem("rescue.online.session.v1")) { openPanel("online"); enterOnline(); } } catch { /* Session storage may be unavailable. */ }
  if (profile.error) notify(profile.error, true);
  restartLoop();
} catch (error) {
  notify(error.message, true);
  $("start").disabled = true;
  $("continue").disabled = true;
  $("map-open").disabled = true;
}
