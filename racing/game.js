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
import { LIGHT_TIMES } from "./lighting.js";
import { hazardWarning, HAZARD_NAMES } from "./hazards.js";
import { RaceScene } from "./scene.js";
import { RacingClient } from "./online.js";
import { hydrateRace, projectRace } from "./online-state.js";
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
let onlineRoom = null, onlineSource = null, onlineReceived = 0,
  onlineRun = null, controlsPaused = false, onlineInput = {}, awardedRuns = new Set(), roomStamp = "";
const online = new RacingClient({
  onState: receiveRoom,
  onJoined: () => { $("online-panel").hidden=onlineRoom?.mode==="racing"; $("online-message").textContent=""; },
  onStatus: message => { if(!online.hasLiveState)window.GameActivity?.setPlaying(false); $("online-message").textContent=message; $("online-connection").textContent=message; $("online-connection").hidden=!message||!online.session; },
  onError: message => { $("online-message").textContent=message; toast(message); },
  onLeave: () => garage(),
});
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
  if(online.session){toast("请先退出房间，再开始单人比赛。");return;}
  clearInput();
  race = newRace(selectedTrack, profile.car);
  scene.build(race.track);
  scene.setCars(
    race,
    SKINS.find((s) => s.id === profile.skin),
  );
  mode = "racing";
  $("online-panel").hidden=true;
  $("online-connection").hidden=true;
  $("pause-title").textContent="比赛已暂停";
  $("pause-description").textContent="回来以后继续这场比赛。";
  $("again").textContent="再赛一场";
  $("back").textContent="返回车库";
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
  window.GameActivity?.finish();
  online.leave();onlineRoom=null;onlineSource=null;onlineRun=null;controlsPaused=false;roomStamp="";
  $("online-panel").hidden=true;
  $("online-connection").hidden=true;
  $("view").dataset.online="offline";
  $("start").disabled=false;
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
  if (value) window.GameActivity?.setPlaying(false);
  clearInput();
  if(onlineSource) {
    controlsPaused=value;online.input(null,performance.now(),true);
    $("pause-title").textContent="联机比赛正在继续";
    $("pause-description").textContent="已松开你的驾驶控制，其他玩家继续比赛。退出房间后由下一位在线玩家接任小队长。";
    $("paused").hidden=!value;
    return;
  }
  race.paused = value;
  $("paused").hidden = !value;
  accumulator = 0;
  last = performance.now();
}
function finish() {
  window.GameActivity?.finish();
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
function podium(r) {
  const leaders=standings(r).slice(0,3);$("podium").replaceChildren();
  for(const i of [1,0,2]){
    const driver=leaders[i];if(!driver)continue;
    const box=document.createElement("div");if(i===0)box.className="winner";
    const rank=document.createElement("strong");rank.textContent=String(i+1);
    const name=document.createElement("span");name.textContent=driver.name;
    const detail=document.createElement("small");detail.textContent=driver.finished?`◈ ${[3000,1500,700][i]}`:"尚未冲线";
    box.append(rank,name,detail);$("podium").append(box);
  }
}
function onlineFinish() {
  if(!onlineSource?.cars[0].finished)return;
  clearInput();controlsPaused=false;mode="finished";
  $("paused").hidden=true;
  const key=`${online.session.token}:${onlineRoom.run}`;
  let claimed=awardedRuns.has(key);
  try{claimed ||= sessionStorage.getItem(`summit-racing-award:${key}`)==="1";}catch{}
  if(!claimed){
    const prize=settleRace(profile,{...onlineSource,status:"finished",awarded:false});
    awardedRuns.add(key);try{sessionStorage.setItem(`summit-racing-award:${key}`,"1");}catch{}
    save();$("reward").textContent=prize?`+ ${prize} 赛事金币`:"本场没有奖金，再挑战一次！";
  }else $("reward").textContent="本场奖金已记入车库。";
  const p=onlineSource.cars[0];
  $("result-title").textContent=p.finished===1?"冠军，属于你！":`比赛完成 · 第 ${p.finished} 名`;
  $("result-time").textContent=`用时 ${timeText(p.finishTime)} · 金币余额 ${profile.coins}`;
  podium(onlineSource);$("again").textContent="回房间 · 再来一场";$("back").textContent="退出房间";
  $("result").hidden=false;
}
function renderRoom() {
  const room=onlineRoom,slot=online.session?.slot;
  $("online-entry").hidden=!!room;$("online-room").hidden=!room;
  if(!room)return;
  const stamp=JSON.stringify([room,slot,onlineSource?.cars.filter(c=>c.finished).map(c=>c.id)]);
  if(stamp===roomStamp)return;roomStamp=stamp;
  const captain=room.host===slot,me=room.members.find(m=>m.id===slot);
  $("online-code").textContent=room.code;
  $("online-track").value=room.trackId;$("online-track").disabled=!captain||room.mode!=="lobby";
  $("online-route-hint").textContent=captain?"小队长选赛道。换赛道后，朋友需要重新准备。":"赛道由小队长选择，使用你加入时装备的赛车和涂装。";
  $("online-members").replaceChildren();
  for(const member of room.members){
    const li=document.createElement("li"),info=document.createElement("div"),name=document.createElement("span"),car=document.createElement("small"),status=document.createElement("span");
    name.textContent=`${member.id===room.host?"★ 小队长 · ":""}${member.name}${member.id===slot?"（你）":""}`;
    car.textContent=`${CARS.find(c=>c.id===member.car)?.name||"逐风 GT"} · ${SKINS.find(s=>s.id===member.skin)?.name||"流光极光"}`;
    status.className="member-status";status.textContent=!member.connected?"重连中":room.mode==="lobby"?(member.ready?"已准备":"等待准备"):(onlineSource?.cars.find(c=>c.id===member.id)?.finished?"已冲线":"比赛中");
    info.append(name,car);li.append(info,status);$("online-members").append(li);
  }
  const ready=room.members.filter(m=>m.connected);
  $("online-ready").hidden=captain||room.mode!=="lobby";
  $("online-ready").textContent=me?.ready?"取消准备":"我准备好了";
  $("online-start").hidden=room.mode!=="lobby";
  $("online-start").disabled=!captain||ready.length<2||ready.length!==room.members.length||ready.some(m=>!m.ready);
  $("online-start").textContent=captain?"一起出发 →":"等待小队长开赛";
  $("online-lobby").hidden=!captain||room.mode!=="finished";
  $("online-race-status").textContent=room.mode==="lobby"?`${ready.length} / 8 人在线 · 至少2人，大家准备后开始。`:room.mode==="finished"?(captain?"比赛结束，小队长可以准备下一场。":"比赛结束，等待小队长准备下一场。"):"比赛正在进行，等待所有车手冲线后准备下一场。";
  $("view").dataset.captain=String(room.host);
}
function receiveRoom(packet,received) {
  if(!scene||!online.session)return;
  const prior=onlineRoom;onlineRoom=packet.room;onlineReceived=received;
  if(prior&&prior.host!==onlineRoom.host&&onlineRoom.host===online.session.slot)toast("你现在是小队长。比赛结束后，可以选择下一场赛道。");
  $("view").dataset.online=onlineRoom.mode;$("view").dataset.localId=String(online.session.slot);
  $("start").disabled=true;
  if(packet.race){
    const fresh=hydrateRace(packet,online.session.slot,onlineSource);
    const freshRun=onlineRun!==onlineRoom.run||!onlineSource;
    onlineSource=fresh;
    if(freshRun){
      clearInput();onlineRun=onlineRoom.run;controlsPaused=false;
      race=projectRace(fresh,null,0,1/60);mode="racing";
      scene.build(race.track);scene.setCars(race,SKINS.find(s=>s.id===profile.skin));
      $("garage").hidden=true;$("online-panel").hidden=true;$("paused").hidden=true;$("result").hidden=true;$("hud").hidden=false;
      $("gas").hidden=$("auto").checked;$("route-name").textContent=race.track.spec.name;
      last=performance.now();lastHud=0;accumulator=0;
      if(soundEnabled)startSound();
    }
    if(fresh.cars[0].finished){if(mode!=="finished")onlineFinish();else podium(fresh);}
  }else if(onlineRoom.mode==="lobby"){
    onlineSource=null;onlineRun=null;race=null;mode="garage";controlsPaused=false;clearInput();
    $("garage").hidden=false;$("hud").hidden=true;$("paused").hidden=true;$("result").hidden=true;
    if(!prior||prior.mode!=="lobby"||prior.trackId!==onlineRoom.trackId){
      selectedTrack=onlineRoom.trackId;scene.build(makeTrack(selectedTrack));preview();catalog();
    }
    $("online-panel").hidden=false;
  }
  renderRoom();
}
function hud() {
  if (!race) return;
  const p = race.cars[0],
    ranking = standings(race),
    position = ranking.findIndex((c) => c.id === p.id) + 1;
  $("position").textContent = `${position} / ${race.cars.length}`;
  $("lap").textContent =
    `第 ${clamp(Math.floor(Math.max(0, p.s) / race.track.length) + 1, 1, race.laps)} / ${race.laps} 圈`;
  $("timer").textContent = timeText(
    race.cars[0].finished ? race.cars[0].finishTime : race.time,
  );
  $("speed").textContent = Math.round(p.speed * 3.6);
  $("nitro").style.width = `${p.nitro}%`;
  $("surface").textContent =
    Math.abs(p.offset) > 8.3
      ? ["sky", "container", "ocean", "ship"].includes(race.track.spec.theme)
        ? "注意桥边 · 请返回桥面"
        : "驶离道路 · 返回赛道"
      : BIOMES[roadAt(race.track, p.s).biome];
  $("leaderboard").textContent = ranking
    .slice(0, 4)
    .map((c, i) => `${i + 1}   ${c.name}${c.id === p.id ? " ◀" : ""}`)
    .join("\n");
  $("leaderboard").style.whiteSpace = "pre-line";
  $("countdown").textContent =
    race.countdown > 0
      ? Math.ceil(race.countdown)
      : race.time < 0.8
        ? "GO"
        : "";
  const warning = hazardWarning(race.track, race.hazards, p, race.time);
  $("hazard-warning").hidden = !warning;
  $("hazard-warning").textContent = warning
    ? `${HAZARD_NAMES[warning.type]} · 前方 ${Math.ceil(warning.distance)} 米 · 提前避让`
    : "";
  $("penalty").hidden = !(p.respawn > 0);
  $("penalty").textContent =
    p.respawn > 0
      ? `撞毁罚时5秒 · ${Math.ceil(p.respawn)}秒后在本圈T点复活`
      : "";
  $("view").dataset.crashes = String(p.crashes);
  $("view").dataset.respawn = String(p.respawn);
  $("view").dataset.distance = p.s.toFixed(2);
  $("view").dataset.offset = p.offset.toFixed(2);
  $("view").dataset.steer = String(p.steer || 0);
  if(onlineSource)$("view").dataset.players=JSON.stringify(onlineSource.cars.map(({id,s,offset,speed,human,finished,skin})=>({id,s,offset,speed,human,finished,skin})));
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
  const start = roadAt(track, 0);
  c.fillStyle = "#ddf79e";
  c.font = "bold 11px sans-serif";
  c.fillText("T", 14 + (start.x - minX) * scale, 14 + (start.z - minZ) * scale);
  if (race)
    for (const hazard of race.hazards) {
      const q = roadAt(track, hazard.s);
      c.fillStyle = "#ff9e58";
      c.fillRect(12 + (q.x - minX) * scale, 12 + (q.z - minZ) * scale, 4, 4);
    }
  if (race)
    for (const car of [...race.cars].reverse()) {
      const p = roadAt(track, car.s);
      c.fillStyle = car.id === race.cars[0].id ? "#ddf79e" : car.human ? "#7eeaff" : "#edf0ed";
      c.beginPath();
      c.arc(
        14 + (p.x - minX) * scale,
        14 + (p.z - minZ) * scale,
        car.id === race.cars[0].id ? 4 : 2,
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
function readInput() {
  const throttle =
      $("auto").checked ||
      held.has("throttle") ||
      keys.has("ArrowUp") ||
      keys.has("KeyW");
  const steer =
      Number(held.has("left") || keys.has("ArrowLeft") || keys.has("KeyA")) -
      Number(held.has("right") || keys.has("ArrowRight") || keys.has("KeyD"));
  return {
      throttle,
      steer,
      brake: held.has("brake") || keys.has("ArrowDown") || keys.has("KeyS"),
      boost: held.has("boost") || keys.has("Space"),
    };
}
// Network controls must continue between slow graphics frames. A stale frame
// otherwise releases the accelerator on the server after 500ms.
setInterval(() => {
  if (onlineSource && mode === "racing") {
    onlineInput = controlsPaused || document.hidden ? {} : readInput();
    online.input(controlsPaused || document.hidden ? null : onlineInput);
  }
}, 33);
function loop(now) {
  window.GameActivity?.setPlaying(mode === "racing" && !!race && !race.paused && !controlsPaused && race.countdown <= 0 && (!onlineSource || (onlineRoom?.mode === "racing" && online.hasLiveState)));
  const elapsed = (now - last) / 1000,
    dt = clamp(elapsed, 0, 0.25);
  last = now;
  if (mode === "racing" && !race.paused) scene.adapt(elapsed);
  if (mode === "racing" && !race.paused) {
    accumulator += dt;
    const input = readInput();
    if(onlineSource) {
      onlineInput=controlsPaused||document.hidden?{}:input;

    }else while (accumulator >= 1 / 60) {
      stepRace(race, input, 1 / 60);
      accumulator -= 1 / 60;
      if (race.cars[0].finished) {
        completePodium(race);
        finish();
        break;
      }
    }
    if (!onlineSource && now - lastHud > 100) {
      hud();
      lastHud = now;
    }
  }
  if(onlineSource){
    race=projectRace(onlineSource,race,(now-onlineReceived)/1000,dt,onlineInput);
    if(now-lastHud>100){hud();lastHud=now;}
  }
  if (!document.hidden) {
    if (
      scene.dirty ||
      (mode === "garage" && $("online-panel").hidden && now - lastRender > 33) ||
      (mode === "racing" && !race.paused) || !!onlineSource
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
  if(onlineRoom){toast("房间赛道由小队长在房间面板中选择。");return;}
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
$("again").onclick = () => {if(onlineSource){$("result").hidden=true;$("online-panel").hidden=false;renderRoom();}else start();};
$("light-time").innerHTML = Object.entries(LIGHT_TIMES)
  .map(([key, label]) => `<option value="${key}">${label}</option>`)
  .join("");
$("light-time").onchange = () => {
  scene.lightMode = $("light-time").value;
  scene.dirty = true;
};
$("quality").onchange = () => scene.qualityMode($("quality").value);
$("sound").onclick = () => {
  soundEnabled = !soundEnabled;
  $("sound").textContent = soundEnabled ? "声音 开" : "声音 关";
  $("sound").setAttribute("aria-pressed", String(soundEnabled));
  if (soundEnabled) startSound();
};
document.querySelectorAll("[data-control]").forEach((b) => {
  b.onpointerdown = (e) => {
    if (mode !== "racing" || race.paused || controlsPaused) return;
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
  if (e.code !== "Escape" && e.target.matches?.("select,input,summary")) return;
  if (e.code === "Escape" && mode === "racing") {
    e.preventDefault();
    if (!e.repeat) pause(onlineSource ? !controlsPaused : !race.paused);
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
    if (!race.paused && !controlsPaused) keys.add(e.code);
  }
});
window.addEventListener("keyup", (e) => keys.delete(e.code));
window.addEventListener("blur", () => {
  clearInput();
  if(onlineSource)online.input(null,performance.now(),true);
  else if (mode === "racing") pause();
});
document.addEventListener("visibilitychange", () => {
  if(document.hidden&&onlineSource){clearInput();online.input(null,performance.now(),true);}
  else if (document.hidden && mode === "racing") pause();
});
$("online-track").innerHTML=TRACKS.map(t=>`<option value="${t.id}">${t.name}</option>`).join("");
$("online-track").onchange=()=>online.send({type:"settings",trackId:$("online-track").value});
$("online-open").onclick=()=>{renderRoom();$("online-panel").hidden=false;};
$("online-close").onclick=()=>{$("online-panel").hidden=true;};
function entry(type) {
  $("online-message").textContent="";
  const name=$("online-name").value.trim()||"逐风小车手";
  const command={type,name,car:profile.car,skin:profile.skin,trackId:selectedTrack};
  if(type==="join"){
    command.code=$("online-input").value.trim();
    if(!/^[1-9][0-9]{5}$/.test(command.code)){$("online-message").textContent="请输入六位数字房间码。";return;}
  }
  online.enter(command);
}
$("online-create").onclick=()=>entry("create");$("online-join").onclick=()=>entry("join");
$("online-input").oninput=()=>{$("online-input").value=$("online-input").value.replace(/\D/g,"").slice(0,6);};
$("online-input").onkeydown=e=>{if(e.key==="Enter")entry("join");};
$("online-ready").onclick=()=>online.send({type:"ready",value:!onlineRoom?.members.find(m=>m.id===online.session?.slot)?.ready});
$("online-start").onclick=()=>online.send({type:"start"});
$("online-lobby").onclick=()=>online.send({type:"lobby"});
$("online-leave").onclick=garage;
$("online-copy").onclick=async()=>{
  try{await navigator.clipboard.writeText(onlineRoom.code);toast("房间码已复制，发给朋友就能加入。");}
  catch{toast(`房间码：${onlineRoom.code}`);}
};
window.addEventListener("pagehide",()=>online.input(null,performance.now(),true));
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
  online.restore();
} catch (error) {
  console.error(error);
  $("loading").dataset.error = error.stack;
  $("loading").textContent =
    "无法启动3D画面。请启用浏览器硬件加速，或换用支持 WebGL 2 的浏览器。";
}
