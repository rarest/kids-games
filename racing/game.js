import {
  BIOMES,
  TRACKS,
  CARS,
  SKINS,
  makeTrack,
  roadAt,
  newRace,
  stepRace,
  completePodium,
  standings,
  readProfile,
  purchase,
  equip,
  settleRace,
  clamp,
} from "./core.js";
import { RaceScene } from "./scene.js";
const $ = (id) => document.getElementById(id),
  storageKey = "summit-racing-v1";
let raw;
try {
  raw = localStorage.getItem(storageKey);
} catch {}
const profile = readProfile(raw);
let scene,
  race = null,
  selectedTrack = "tour",
  mode = "garage",
  last = 0,
  accumulator = 0,
  lastHud = 0,
  lastRender = 0,
  toastTimer,
  engine = null,
  soundEnabled = false;
const held = new Set(),
  keys = new Set();
function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("show"), 2600);
}
function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(profile));
  } catch {
    toast("浏览器无法保存进度；本次金币会保留到关闭页面。");
  }
  $("coins").textContent = profile.coins;
}
function timeText(seconds) {
  const m = Math.floor(seconds / 60),
    s = (seconds % 60).toFixed(1);
  return `${String(m).padStart(2, "0")}:${s.padStart(4, "0")}`;
}
function catalog() {
  $("tracks").innerHTML = TRACKS.map(
    (t) =>
      `<button data-track="${t.id}" class="${selectedTrack === t.id ? "selected" : ""}"><b>${t.name}</b><small>${t.subtitle}</small><span class="price">${profile.best[t.id] ? `最佳 ${timeText(profile.best[t.id])}` : "自由参赛"}</span></button>`,
  ).join("");
  for (const [key, list, target, current] of [
    ["cars", CARS, "cars", profile.car],
    ["skins", SKINS, "skins", profile.skin],
  ]) {
    $(target).innerHTML = list
      .map((item) => {
        const owned = profile[key].includes(item.id);
        return `<button data-shop="${key}" data-item="${item.id}" class="${item.id === current ? "selected" : ""}" aria-label="${item.name}，${owned ? "已拥有" : item.price + "金币"}">${key === "skins" ? `<span class="swatch" style="background:linear-gradient(120deg,#${item.color.toString(16).padStart(6, "0")},#${item.stripe.toString(16).padStart(6, "0")},#${item.color.toString(16).padStart(6, "0")})"></span>` : ""}<b>${item.name}</b><small>${item.desc}</small><span class="price">${item.id === current ? "✓ 已装备" : owned ? "点击装备" : "◈ " + item.price + " 解锁"}</span></button>`;
      })
      .join("");
  }
  $("coins").textContent = profile.coins;
  $("car-name").textContent = CARS.find((c) => c.id === profile.car).name;
  $("paint-name").textContent =
    SKINS.find((s) => s.id === profile.skin).name + " / 反光赛车纹";
}
function preview() {
  if (!scene) return;
  scene.preview(
    CARS.find((c) => c.id === profile.car),
    SKINS.find((s) => s.id === profile.skin),
  );
}
function clearInput() {
  held.clear();
  keys.clear();
  document
    .querySelectorAll(".pressed")
    .forEach((e) => e.classList.remove("pressed"));
}
function start() {
  clearInput();
  race = newRace(selectedTrack, profile.car);
  scene.build(race.track);
  scene.setCars(
    race,
    SKINS.find((s) => s.id === profile.skin),
  );
  mode = "racing";
  accumulator = 0;
  last = performance.now();
  lastHud = 0;
  $("garage").hidden = true;
  $("result").hidden = true;
  $("paused").hidden = true;
  $("hud").hidden = false;
  $("gas").hidden = $("auto").checked;
  $("route-name").textContent = race.track.spec.name;
  renderMap();
  hud();
  if (soundEnabled) startSound();
}
function garage() {
  clearInput();
  race = null;
  mode = "garage";
  $("garage").hidden = false;
  $("hud").hidden = true;
  $("result").hidden = true;
  $("paused").hidden = true;
  scene.build(makeTrack(selectedTrack));
  preview();
  catalog();
}
function pause(value = true) {
  if (mode !== "racing") return;
  clearInput();
  race.paused = value;
  $("paused").hidden = !value;
  accumulator = 0;
  last = performance.now();
}
function finish() {
  clearInput();
  mode = "finished";
  const prize = settleRace(profile, race);
  save();
  const place = race.cars[0].finished;
  $("result-title").textContent =
    place === 1 ? "冠军，属于你！" : `比赛完成 · 第 ${place} 名`;
  const leaders = standings(race).slice(0, 3);
  const order = [1, 0, 2];
  $("podium").innerHTML = order
    .map(
      (i) =>
        `<div class="${i === 0 ? "winner" : ""}"><strong>${i + 1}</strong>${leaders[i].name}<small>◈ ${[3000, 1500, 700][i]}</small></div>`,
    )
    .join("");
  $("reward").textContent = prize
    ? `+ ${prize} 赛事金币`
    : "本场没有奖金，再挑战一次！";
  $("result-time").textContent =
    `用时 ${timeText(race.cars[0].finishTime)} · 金币余额 ${profile.coins}`;
  $("result").hidden = false;
}
function hud() {
  if (!race) return;
  const p = race.cars[0],
    ranking = standings(race),
    position = ranking.findIndex((c) => c.id === 0) + 1;
  $("position").textContent = `${position} / 11`;
  $("lap").textContent =
    `第 ${clamp(Math.floor(Math.max(0, p.s) / race.track.length) + 1, 1, race.laps)} / ${race.laps} 圈`;
  $("timer").textContent = timeText(
    race.cars[0].finished ? race.cars[0].finishTime : race.time,
  );
  $("speed").textContent = Math.round(p.speed * 3.6);
  $("nitro").style.width = `${p.nitro}%`;
  $("surface").textContent =
    Math.abs(p.offset) > 8.3
      ? "驶入草地 · 返回赛道"
      : BIOMES[roadAt(race.track, p.s).biome];
  $("leaderboard").textContent = ranking
    .slice(0, 4)
    .map((c, i) => `${i + 1}   ${c.name}${c.id === 0 ? " ◀" : ""}`)
    .join("\n");
  $("leaderboard").style.whiteSpace = "pre-line";
  $("countdown").textContent =
    race.countdown > 0
      ? Math.ceil(race.countdown)
      : race.time < 0.8
        ? "GO"
        : "";
  $("view").dataset.distance = p.s.toFixed(2);
  $("view").dataset.offset = p.offset.toFixed(2);
  renderMap();
}
function renderMap() {
  const track = race?.track || scene.track,
    canvas = $("map"),
    c = canvas.getContext("2d"),
    points = track.points,
    xs = points.map((p) => p.x),
    zs = points.map((p) => p.z),
    minX = Math.min(...xs),
    minZ = Math.min(...zs),
    range = Math.max(Math.max(...xs) - minX, Math.max(...zs) - minZ),
    scale = 132 / range;
  c.clearRect(0, 0, 160, 160);
  c.strokeStyle = "#accbc7";
  c.lineWidth = 3;
  c.beginPath();
  points.forEach((p, i) => {
    const x = 14 + (p.x - minX) * scale,
      y = 14 + (p.z - minZ) * scale;
    i ? c.lineTo(x, y) : c.moveTo(x, y);
  });
  c.stroke();
  if (race)
    for (const car of [...race.cars].reverse()) {
      const p = roadAt(track, car.s);
      c.fillStyle = car.id === 0 ? "#ddf79e" : "#edf0ed";
      c.beginPath();
      c.arc(
        14 + (p.x - minX) * scale,
        14 + (p.z - minZ) * scale,
        car.id === 0 ? 4 : 2,
        0,
        Math.PI * 2,
      );
      c.fill();
    }
}
function startSound() {
  try {
    if (!engine) {
      const audio = new (window.AudioContext || window.webkitAudioContext)(),
        osc = audio.createOscillator(),
        gain = audio.createGain(),
        filter = audio.createBiquadFilter();
      osc.type = "sawtooth";
      gain.gain.value = 0;
      filter.type = "lowpass";
      filter.frequency.value = 500;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audio.destination);
      osc.start();
      engine = { audio, osc, gain };
    }
    engine.audio.resume();
  } catch {
    soundEnabled = false;
    $("sound").textContent = "声音 关";
    toast("此浏览器暂不支持声音。");
  }
}
function sound() {
  if (!engine) return;
  const on =
    soundEnabled && mode === "racing" && !race.paused && race.countdown <= 0;
  engine.osc.frequency.setTargetAtTime(
    42 + (race?.cars[0].speed || 0) * 2,
    engine.audio.currentTime,
    0.1,
  );
  engine.gain.gain.setTargetAtTime(
    on ? 0.025 : 0,
    engine.audio.currentTime,
    0.08,
  );
}
function loop(now) {
  const elapsed = (now - last) / 1000,
    dt = clamp(elapsed, 0, 0.25);
  last = now;
  if (mode === "racing" && !race.paused) scene.adapt(elapsed);
  if (mode === "racing" && !race.paused) {
    accumulator += dt;
    const throttle =
      $("auto").checked ||
      held.has("throttle") ||
      keys.has("ArrowUp") ||
      keys.has("KeyW");
    const steer =
      Number(held.has("right") || keys.has("ArrowRight") || keys.has("KeyD")) -
      Number(held.has("left") || keys.has("ArrowLeft") || keys.has("KeyA"));
    const input = {
      throttle,
      steer,
      brake: held.has("brake") || keys.has("ArrowDown") || keys.has("KeyS"),
      boost: held.has("boost") || keys.has("Space"),
    };
    while (accumulator >= 1 / 60) {
      stepRace(race, input, 1 / 60);
      accumulator -= 1 / 60;
      if (race.cars[0].finished) {
        completePodium(race);
        finish();
        break;
      }
    }
    if (now - lastHud > 100) {
      hud();
      lastHud = now;
    }
  }
  if (!document.hidden) {
    if (
      scene.dirty ||
      (mode === "garage" && now - lastRender > 33) ||
      (mode === "racing" && !race.paused)
    ) {
      scene.render(
        race,
        Math.max(dt, (now - lastRender) / 1000),
        mode === "garage",
      );
      lastRender = now;
    }
    sound();
  }
  requestAnimationFrame(loop);
}
$("tracks").onclick = (e) => {
  const b = e.target.closest("[data-track]");
  if (!b) return;
  selectedTrack = b.dataset.track;
  scene.build(makeTrack(selectedTrack));
  preview();
  catalog();
};
for (const id of ["cars", "skins"])
  $(id).onclick = (e) => {
    const b = e.target.closest("[data-shop]");
    if (!b) return;
    const { shop, item } = b.dataset;
    if (!profile[shop].includes(item) && !purchase(profile, shop, item)) {
      toast("金币不足，赢得前三名就能攒奖金。");
      return;
    }
    equip(profile, shop, item);
    save();
    catalog();
    preview();
  };
document.querySelectorAll("[data-tab]").forEach(
  (b) =>
    (b.onclick = () => {
      document
        .querySelectorAll("[data-tab]")
        .forEach((x) => x.classList.toggle("active", x === b));
      for (const id of ["routes", "models", "paints"])
        $(id).hidden = id !== b.dataset.tab;
    }),
);
$("start").onclick = start;
$("pause").onclick = () => pause();
$("resume").onclick = () => pause(false);
$("quit").onclick = garage;
$("back").onclick = garage;
$("again").onclick = start;
$("quality").onchange = () => scene.qualityMode($("quality").value);
$("sound").onclick = () => {
  soundEnabled = !soundEnabled;
  $("sound").textContent = soundEnabled ? "声音 开" : "声音 关";
  $("sound").setAttribute("aria-pressed", String(soundEnabled));
  if (soundEnabled) startSound();
};
document.querySelectorAll("[data-control]").forEach((b) => {
  b.onpointerdown = (e) => {
    if (mode !== "racing" || race.paused) return;
    e.preventDefault();
    held.add(b.dataset.control);
    b.classList.add("pressed");
    b.setPointerCapture(e.pointerId);
  };
  const release = () => {
    held.delete(b.dataset.control);
    b.classList.remove("pressed");
  };
  b.onpointerup = release;
  b.onpointercancel = release;
  b.onlostpointercapture = release;
});
window.addEventListener("keydown", (e) => {
  if (e.code === "Escape" && mode === "racing") {
    e.preventDefault();
    if (!e.repeat) pause(!race.paused);
    return;
  }
  if (
    mode === "racing" &&
    [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
      "Space",
    ].includes(e.code)
  ) {
    e.preventDefault();
    if (!race.paused) keys.add(e.code);
  }
});
window.addEventListener("keyup", (e) => keys.delete(e.code));
window.addEventListener("blur", () => {
  clearInput();
  if (mode === "racing") pause();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && mode === "racing") pause();
});
window.addEventListener("resize", () => scene?.resize());
$("view").addEventListener("webglcontextlost", (e) => {
  e.preventDefault();
  if (mode === "racing") pause();
  $("loading").hidden = false;
  $("loading").textContent =
    "图形画面中断，请刷新页面恢复。已结算的金币仍然保留。";
});
try {
  scene = new RaceScene($("view"));
  scene.build(makeTrack(selectedTrack));
  preview();
  catalog();
  $("loading").hidden = true;
  $("garage").hidden = false;
  $("start").disabled = false;
  $("start").textContent = "驶上赛道 →";
  document.body.dataset.ready = "true";
  last = performance.now();
  requestAnimationFrame(loop);
} catch (error) {
  console.error(error);
  $("loading").dataset.error = error.stack;
  $("loading").textContent =
    "无法启动3D画面。请启用浏览器硬件加速，或换用支持 WebGL 2 的浏览器。";
}
