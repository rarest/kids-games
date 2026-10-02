"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createVolley, advanceVolley } from "./volley.js";
import {createEconomy,bankMinerals,purchase,winchPrice,mineTheme,applyMineTheme,selectBlastTarget,DYNAMITE_PRICE} from "./progression.js";

type Phase = "ready" | "playing" | "store" | "gameover";
type HookMode = "swing" | "extend" | "retract" | "done";
type MineralKind = "gold" | "diamond" | "rock" | "bone";

type Mineral = {
  id: number;
  kind: MineralKind;
  x: number;
  y: number;
  radius: number;
  value: number;
  weight: number;
  rotation: number;
};

type Hook = {
  angle: number;
  direction: number;
  length: number;
  mode: HookMode;
  grabbedId: number | null;
};

const WIDTH = 900;
const HEIGHT = 560;
const ANCHOR_X = 450;
const ANCHOR_Y = 72;
const MIN_LENGTH = 54;
const MAX_LENGTH = 610;

const palette = {
  gold: "#f8bd24",
  goldDark: "#c67614",
  diamond: "#52e6ff",
  rock: "#6d5a51",
  rockLight: "#9a8174",
  bone: "#dfcda8",
};

function makeMinerals(level: number): Mineral[] {
  const positions = [
    [104, 186], [242, 160], [366, 232], [546, 174], [713, 220],
    [818, 150], [164, 328], [316, 382], [474, 316], [638, 368],
    [786, 352], [86, 474], [410, 492], [570, 470], [738, 494],
  ];
  const pattern: MineralKind[] = [
    "rock", "gold", "diamond", "gold", "rock",
    "gold", "gold", "bone", "rock", "diamond",
    "gold", "rock", "gold", "bone", "gold",
  ];

  return applyMineTheme(positions.slice(0, Math.min(positions.length, 11 + level)).map(([x, y], index) => {
    const kind = pattern[(index + level - 1) % pattern.length];
    const sizeSeed = (index * 7 + level * 3) % 3;
    const data = {
      gold: [
        { radius: 18, value: 80, weight: 1.15 },
        { radius: 27, value: 180, weight: 1.9 },
        { radius: 37, value: 360, weight: 3.1 },
      ],
      diamond: [
        { radius: 16, value: 500, weight: 0.8 },
        { radius: 18, value: 650, weight: 0.9 },
        { radius: 20, value: 800, weight: 1 },
      ],
      rock: [
        { radius: 24, value: 20, weight: 2.8 },
        { radius: 32, value: 30, weight: 4 },
        { radius: 40, value: 45, weight: 5.2 },
      ],
      bone: [
        { radius: 24, value: 35, weight: 1.8 },
        { radius: 28, value: 45, weight: 2 },
        { radius: 30, value: 55, weight: 2.2 },
      ],
    }[kind][sizeSeed];

    return {
      id: level * 100 + index,
      kind,
      x: x + ((level * 29 + index * 13) % 31) - 15,
      y,
      radius: data.radius,
      value: data.value,
      weight: data.weight,
      rotation: ((index * 31) % 90) * (Math.PI / 180),
    };
  }),level);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, r);
}

function drawMineral(ctx: CanvasRenderingContext2D, item: Mineral, x = item.x, y = item.y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(item.rotation);
  ctx.lineJoin = "round";
  ctx.lineWidth = 4;

  if (item.kind === "gold") {
    const r = item.radius;
    ctx.fillStyle = palette.goldDark;
    ctx.strokeStyle = "#6b360c";
    ctx.beginPath();
    ctx.moveTo(-r * 0.85, -r * 0.15);
    ctx.lineTo(-r * 0.45, -r * 0.8);
    ctx.lineTo(r * 0.25, -r);
    ctx.lineTo(r * 0.92, -r * 0.25);
    ctx.lineTo(r * 0.68, r * 0.62);
    ctx.lineTo(0, r);
    ctx.lineTo(-r * 0.88, r * 0.48);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = palette.gold;
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, -r * 0.12);
    ctx.lineTo(-r * 0.16, -r * 0.62);
    ctx.lineTo(r * 0.45, -r * 0.45);
    ctx.lineTo(r * 0.5, r * 0.2);
    ctx.lineTo(-r * 0.08, r * 0.55);
    ctx.closePath();
    ctx.fill();
  } else if (item.kind === "diamond") {
    const r = item.radius;
    ctx.fillStyle = palette.diamond;
    ctx.strokeStyle = "#0f6f88";
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.9, -r * 0.25);
    ctx.lineTo(r * 0.55, r * 0.82);
    ctx.lineTo(-r * 0.55, r * 0.82);
    ctx.lineTo(-r * 0.9, -r * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.9, -r * 0.25);
    ctx.lineTo(r * 0.9, -r * 0.25);
    ctx.moveTo(0, -r);
    ctx.lineTo(-r * 0.18, -r * 0.25);
    ctx.lineTo(0, r * 0.82);
    ctx.stroke();
  } else if (item.kind === "rock") {
    const r = item.radius;
    ctx.fillStyle = palette.rock;
    ctx.strokeStyle = "#352a28";
    ctx.beginPath();
    ctx.moveTo(-r * 0.9, -r * 0.15);
    ctx.lineTo(-r * 0.45, -r * 0.8);
    ctx.lineTo(r * 0.3, -r * 0.92);
    ctx.lineTo(r * 0.92, -r * 0.2);
    ctx.lineTo(r * 0.55, r * 0.8);
    ctx.lineTo(-r * 0.5, r * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = palette.rockLight;
    ctx.beginPath();
    ctx.ellipse(-r * 0.22, -r * 0.28, r * 0.3, r * 0.18, -0.3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const r = item.radius;
    ctx.strokeStyle = "#5b4430";
    ctx.fillStyle = palette.bone;
    ctx.lineWidth = 3;
    roundRect(ctx, -r * 0.7, -r * 0.18, r * 1.4, r * 0.36, r * 0.18);
    ctx.fill();
    ctx.stroke();
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(side * r * 0.72, -r * 0.2, r * 0.28, 0, Math.PI * 2);
      ctx.arc(side * r * 0.72, r * 0.2, r * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  minerals: Mineral[],
  idleHook: Hook,
  flash: number,
  volley: Hook[] = [],
) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#bd6131");
  sky.addColorStop(0.22, "#7a3e29");
  sky.addColorStop(0.23, "#38251f");
  sky.addColorStop(1, "#171315");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "#8e4b2d";
  ctx.beginPath();
  ctx.moveTo(0, 122);
  ctx.lineTo(92, 90);
  ctx.lineTo(176, 126);
  ctx.lineTo(265, 78);
  ctx.lineTo(362, 122);
  ctx.lineTo(452, 76);
  ctx.lineTo(540, 124);
  ctx.lineTo(648, 84);
  ctx.lineTo(740, 128);
  ctx.lineTo(828, 88);
  ctx.lineTo(900, 116);
  ctx.lineTo(900, 166);
  ctx.lineTo(0, 166);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = "#e3b36e";
  ctx.lineWidth = 2;
  for (let i = 0; i < 26; i += 1) {
    const x = (i * 157) % WIDTH;
    const y = 150 + ((i * 83) % 380);
    ctx.beginPath();
    ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "#513829";
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(18, 150);
  ctx.lineTo(18, 540);
  ctx.moveTo(882, 150);
  ctx.lineTo(882, 540);
  ctx.stroke();

  const active=volley.filter(h=>h.mode!=="done");
  const carried=new Set(active.filter(h=>h.mode==="retract").map(h=>h.grabbedId));
  for (const item of minerals) {
    if (!carried.has(item.id)) drawMineral(ctx, item);
  }
  for (const hook of active.length ? active : [idleHook]) {

  const tipX = ANCHOR_X + Math.sin(hook.angle) * hook.length;
  const tipY = ANCHOR_Y + Math.cos(hook.angle) * hook.length;

  ctx.strokeStyle = "#d9c49a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ANCHOR_X, ANCHOR_Y);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  ctx.save();
  ctx.translate(tipX, tipY);
  ctx.rotate(-hook.angle);
  ctx.strokeStyle = "#2a2020";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.quadraticCurveTo(-3, 17, -17, 24);
  ctx.moveTo(0, -4);
  ctx.quadraticCurveTo(3, 17, 17, 24);
  ctx.stroke();
  ctx.restore();

  if (hook.mode === "retract" && hook.grabbedId !== null) {
    const grabbed = minerals.find((item) => item.id === hook.grabbedId);
    if (grabbed) drawMineral(ctx, grabbed, tipX, tipY + grabbed.radius * 0.75);
  }

  }

  ctx.fillStyle = "#211719";
  ctx.strokeStyle = "#f3b22a";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(ANCHOR_X, ANCHOR_Y, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (flash > 0) {
    ctx.fillStyle = `rgba(255, 196, 46, ${Math.min(0.75, flash / 12)})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mineralsRef = useRef<Mineral[]>(makeMinerals(1));
  const hookRef = useRef<Hook>({
    angle: -0.7,
    direction: 1,
    length: MIN_LENGTH,
    mode: "swing",
    grabbedId: null,
  });
  const volleyRef=useRef<Hook[]>([]);
  const bestRef=useRef(0);
  const audioRef=useRef<AudioContext | null>(null);
  const carryingRef=useRef(false);
  const shownTimeRef=useRef(45);
  const [best,setBest]=useState(0);
  const [hookCount,setHookCount]=useState(0);
  const phaseRef = useRef<Phase>("ready");
  const dynamiteRef = useRef(0);
  const scoreRef = useRef(0);
  const economyRef=useRef(createEconomy());
  const [wallet,setWallet]=useState(5000);
  const [winch,setWinch]=useState(0);
  const timeRef = useRef(45);
  const flashRef = useRef(0);
  const lastTimeRef = useRef(0);

  const [phase, setPhase] = useState<Phase>("ready");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [dynamite, setDynamite] = useState(0);
  const [carrying, setCarrying] = useState(false);
  const [clearedLevel, setClearedLevel] = useState(false);
  const [toast, setToast] = useState("瞄准宝藏，放下抓钩！");
  const [soundOn, setSoundOn] = useState(true);

  useEffect(()=>{
    try {const saved=Math.max(0,Number(localStorage.getItem("goldMinerBest"))||0);bestRef.current=saved;setBest(saved);}catch{}
    const onVisibility=()=>{lastTimeRef.current=0;};
    document.addEventListener("visibilitychange",onVisibility);
    return ()=>{document.removeEventListener("visibilitychange",onVisibility);audioRef.current?.close();};
  },[]);
  const saveBest=useCallback((value:number)=>{
    if(value<=bestRef.current)return;
    bestRef.current=value;setBest(value);
    try{localStorage.setItem("goldMinerBest",String(value));}catch{}
  },[]);

  const target = 650 + (level - 1) * 500;
  const targetRef = useRef(target);
  targetRef.current = target;

  const updatePhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const ping = useCallback((frequency = 360, duration = 0.08) => {
    if (!soundOn) return;
    try {
      const audio = audioRef.current ??= new AudioContext();
      if(audio.state === "suspended")void audio.resume();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.frequency.value = frequency;
      oscillator.type = "square";
      gain.gain.setValueAtTime(0.04, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + duration);
      oscillator.addEventListener("ended", () => {oscillator.disconnect();gain.disconnect();});
    } catch {
      // Audio is optional; the game remains fully playable without it.
    }
  }, [soundOn]);

  const dropHook = useCallback(() => {
    if (phaseRef.current !== "playing" || volleyRef.current.length) return;
    volleyRef.current=createVolley(mineralsRef.current);
    setHookCount(volleyRef.current.length);
    ping(260);
    setToast(`${volleyRef.current.length} 块矿物，${volleyRef.current.length} 钩齐发！`);
  }, [ping]);

  const useDynamite = useCallback(() => {
    const hook = selectBlastTarget(volleyRef.current,mineralsRef.current);
    if (!hook)return;
    if (
      phaseRef.current !== "playing" ||
      hook.mode !== "retract" ||
      hook.grabbedId === null ||
      dynamiteRef.current <= 0
    ) return;

    mineralsRef.current = mineralsRef.current.filter((item) => item.id !== hook.grabbedId);
    hook.grabbedId = null;
    const stillCarrying=volleyRef.current.some(h=>h.mode==="retract"&&h.grabbedId!==null);
    carryingRef.current=stillCarrying;setCarrying(stillCarrying);
    hook.length = Math.max(MIN_LENGTH, hook.length - 80);
    dynamiteRef.current -= 1;
    setDynamite(dynamiteRef.current);
    flashRef.current = 10;
    setToast("砰！障碍清除了");
    ping(90, 0.18);
  }, [ping]);

  const resetLevel = useCallback((nextLevel: number) => {
    mineralsRef.current = makeMinerals(nextLevel);
    volleyRef.current=[];setHookCount(0);carryingRef.current=false;
    targetRef.current=650+(nextLevel-1)*500;
    lastTimeRef.current=0;
    hookRef.current = {
      angle: -0.7,
      direction: 1,
      length: MIN_LENGTH,
      mode: "swing",
      grabbedId: null,
    };
    timeRef.current = Math.max(32, 45 - (nextLevel - 1) * 2);
    shownTimeRef.current=Math.ceil(timeRef.current);
    setTimeLeft(shownTimeRef.current);
    setToast(`第 ${nextLevel} 关 · ${mineTheme(nextLevel).name}：${mineTheme(nextLevel).hint}`);
    setCarrying(false);
    setClearedLevel(false);
    updatePhase("playing");
  }, [updatePhase]);

  const startGame = useCallback(() => {
    scoreRef.current = 0;
    economyRef.current=createEconomy();setWallet(economyRef.current.wallet);setWinch(0);
    dynamiteRef.current = 0;
    setScore(0);
    setDynamite(0);
    setLevel(1);
    resetLevel(1);
    ping(420, 0.12);
  }, [ping, resetLevel]);

  const nextLevel = useCallback(() => {
    const next = level + 1;
    setLevel(next);
    resetLevel(next);
  }, [level, resetLevel]);

  const buyDynamite = useCallback(() => {
    if(dynamiteRef.current>=9)return;
    if (!purchase(economyRef.current,"dynamite")) {
      setToast("金币不够，再挖点好货！");
      ping(120);
      return;
    }
    setWallet(economyRef.current.wallet);
    dynamiteRef.current += 1;
    setDynamite(dynamiteRef.current);
    setToast("炸药包已装进背包");
    ping(620, 0.12);
  }, [ping]);

  const buyWinch=useCallback(()=>{
    if(!purchase(economyRef.current,"winch"))return;
    setWallet(economyRef.current.wallet);setWinch(economyRef.current.winch);
    setToast("绞盘升级！回收速度增加25%");ping(740,.12);
  },[ping]);

  const openStore = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    setClearedLevel(false);
    updatePhase("store");
  }, [updatePhase]);

  const closeStore = useCallback(() => {
    if (phaseRef.current === "store" && !clearedLevel) updatePhase("playing");
  }, [clearedLevel, updatePhase]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "ArrowDown") {
        event.preventDefault();
        dropHook();
      }
      if (event.key.toLowerCase() === "d") useDynamite();
      if (event.key.toLowerCase() === "s" && phaseRef.current === "playing") openStore();
      if (event.key === "Escape" && phaseRef.current === "store") closeStore();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeStore, dropHook, openStore, useDynamite]);

  useEffect(() => {
    let frame = 0;
    const tick = (now: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const dt = document.hidden ? 0 : Math.min(1, Math.max(0,(now - (lastTimeRef.current || now)) / 1000));
      lastTimeRef.current = now;

      if (phaseRef.current === "playing") {
        timeRef.current = Math.max(0, timeRef.current - dt);
        const shownTime = Math.ceil(timeRef.current);
        if(shownTimeRef.current!==shownTime){shownTimeRef.current=shownTime;setTimeLeft(shownTime);}

        const hook=hookRef.current;
        if(!volleyRef.current.length){
          hook.angle+=hook.direction*dt*1.28;
          if(Math.abs(hook.angle)>1.12){hook.angle=Math.sign(hook.angle)*1.12;hook.direction*=-1;}
        }else{
          const result=advanceVolley(volleyRef.current,mineralsRef.current,dt,1+economyRef.current.winch*.25);
          if(result.value){bankMinerals(economyRef.current,result.value);setWallet(economyRef.current.wallet);scoreRef.current=economyRef.current.earned;setScore(scoreRef.current);saveBest(scoreRef.current);setToast(`入账 ${result.value} 金币！`);ping(560,.08);}
          const carrying=volleyRef.current.some(h=>h.mode==="retract"&&h.grabbedId!==null);
          if(carrying!==carryingRef.current){carryingRef.current=carrying;setCarrying(carrying);}
          if(volleyRef.current.every(h=>h.mode==="done")){
            volleyRef.current=[];setHookCount(0);carryingRef.current=false;setCarrying(false);
            if(scoreRef.current>=targetRef.current){
              setClearedLevel(true);updatePhase("store");setToast("目标达成！前往下一关");
            }else if(!mineralsRef.current.length){
              mineralsRef.current=makeMinerals(level);setToast("新矿脉出现，点击继续齐射");
            }
          }
        }

        if (timeRef.current <= 0 && phaseRef.current === "playing") {
          if (scoreRef.current >= targetRef.current) {
            setClearedLevel(true);
            updatePhase("store");
            setToast("目标达成！补给后继续");
            ping(760, 0.18);
          } else {
            updatePhase("gameover");
            setToast("差一点！调整策略再来");
            ping(100, 0.2);
          }
        }
      }

      if (flashRef.current > 0) flashRef.current -= 1;
      if (ctx) drawScene(ctx, mineralsRef.current, hookRef.current, flashRef.current, volleyRef.current);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [ping, updatePhase, saveBest, level]);

  return (
    <main className="game-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true">⛏</div>
          <div>
            <p className="eyebrow">WILD WEST ARCADE</p>
            <h1>黄金矿工</h1>
          </div>
        </div>
        <div className="top-actions">
          <button className="icon-button" onClick={() => setSoundOn((value) => !value)} aria-label={soundOn ? "关闭声音" : "打开声音"}>
            {soundOn ? "♪" : "×"}
          </button>
          <button className="store-button" onClick={openStore} disabled={phase !== "playing"}>
            <span aria-hidden="true">🧨</span>
            商店
            <kbd>S</kbd>
          </button>
        </div>
      </header>

      <section className="status-grid" aria-label="游戏状态">
        <article className="stat-card">
          <span>累计收获</span>
          <strong id="score">{score.toLocaleString()}</strong>
          <small className="best-score">历史最高 <b id="best">{best.toLocaleString()}</b></small>
        </article>
        <article className="stat-card target">
          <span>第 <b id="level">{level}</b> 关目标</span>
          <strong>{target.toLocaleString()}</strong>
          <div className="progress-track" aria-label={`目标进度 ${Math.min(100, Math.round(score / target * 100))}%`}>
            <i style={{ width: `${Math.min(100, score / target * 100)}%` }} />
          </div>
        </article>
        <article className={`stat-card timer ${timeLeft <= 10 ? "urgent" : ""}`}>
          <span>剩余时间</span>
          <strong><b id="time">{timeLeft}</b><small>秒</small></strong>
        </article>
      </section>

      <section className="game-layout">
        <div className="stage-wrap">
          <div className="miner-rig" aria-hidden="true">
            <div className="miner">🤠</div>
            <div className="winch">⚙</div>
            <div className="cart">GOLD</div>
          </div>
          <canvas
            id="canvas"
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            className="game-canvas"
            onPointerDown={dropHook}
            aria-label="黄金矿工游戏区。点击或按空格按矿物数量发射抓钩。"
          />
          <div id="status" className="stage-toast" role="status">{toast}</div>

          {phase === "ready" && (
            <div className="overlay">
              <div className="poster-card">
                <span className="poster-icon" aria-hidden="true">⛏</span>
                <p className="eyebrow">THE GOLD RUSH BEGINS</p>
                <h2>矿脉就在脚下</h2>
                <p>有几块矿物，就发几个钩爪。每钩对应一块。开局补给金5000，可买炸药和升级绞盘；累计收获决定过关。</p>
                <button className="primary-button" onClick={startGame}>开始淘金</button>
                <span className="key-hint">空格 / 点击 · 按矿物数量齐射</span>
              </div>
            </div>
          )}

          {phase === "gameover" && (
            <div className="overlay">
              <div className="poster-card fail-card">
                <span className="poster-icon" aria-hidden="true">⌛</span>
                <p className="eyebrow">SHIFT IS OVER</p>
                <h2>矿灯熄灭了</h2>
                <p>本次收获 {score} 金币，距离目标还差 {Math.max(0, target - score)}。</p>
                <button className="primary-button" onClick={startGame}>重新挑战</button>
              </div>
            </div>
          )}

          {phase === "store" && (
            <div className="overlay store-overlay">
              <div className="shop-card">
                {!clearedLevel && <button className="close-shop" onClick={closeStore} aria-label="关闭商店">×</button>}
                <div className="shop-sign">矿工补给站</div>
                <p className="shop-intro">{clearedLevel ? "干得漂亮！下一片矿区更难挖。" : "暂停一下，给背包补点硬货。"}</p>
                <article className="shop-item">
                  <div className="dynamite-art" aria-hidden="true">
                    <i /><i /><i /><b>⚡</b>
                  </div>
                  <div className="shop-copy">
                    <span>紧急脱钩利器</span>
                    <h3>炸药包</h3>
                    <p>按 D 优先炸掉最重的载货，腾出抓钩。</p>
                  </div>
                  <button className="buy-button" onClick={buyDynamite} disabled={wallet < DYNAMITE_PRICE || dynamite >= 9}>
                    <span>购买</span>
                    <strong>{DYNAMITE_PRICE} 金币</strong>
                  </button>
                </article>
                <article className="shop-item winch-shop">
                  <div className="winch-art" aria-hidden="true">⚙</div>
                  <div className="shop-copy"><span>持续装备升级</span><h3>强化绞盘</h3><p>每级回收速度增加25%，最多三级。本局持续生效。</p></div>
                  <button className="buy-button" onClick={buyWinch} disabled={winch>=3 || wallet<winchPrice(economyRef.current)}><span>{winch>=3?"已满级":"升级绞盘"}</span><strong>{winch>=3?"回收速度 +75%":`${winchPrice(economyRef.current)} 金币`}</strong></button>
                </article>
                <div className="shop-footer">
                  <span>余额 <strong id="wallet">{wallet.toLocaleString()}</strong> · 炸药 {dynamite} 个</span>
                  {clearedLevel ? (
                    <button className="primary-button compact" onClick={nextLevel}>前往第 {level + 1} 关</button>
                  ) : (
                    <button className="secondary-button" onClick={closeStore}>返回矿井</button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="side-panel">
          <div className="bag-card">
            <p className="mine-theme"><strong>{mineTheme(level).name}</strong><small>{mineTheme(level).hint}</small></p>
            <p className="wallet-status">补给金币 <b id="walletBalance">{wallet.toLocaleString()}</b> · 绞盘 <b id="winchLevel">{winch}/3</b></p>
            <div className="panel-heading">
              <span>背包</span>
              <strong>{dynamite}/9</strong>
            </div>
            <div className={`dynamite-slot ${carrying && dynamite > 0 ? "active" : ""}`}>
              <div className="mini-dynamite" aria-hidden="true">🧨</div>
              <div>
                <strong>炸药包</strong>
                <small>{dynamite > 0 ? "按 D 使用" : "前往商店购买"}</small>
              </div>
              <span className="item-count">×{dynamite}</span>
            </div>
            <button
              className="dynamite-button"
              onClick={useDynamite}
              disabled={!carrying || dynamite === 0 || phase !== "playing"}
            >
              使用炸药 <kbd>D</kbd>
            </button>
          </div>

          <div className="legend-card">
            <div className="panel-heading"><span>矿物图鉴</span></div>
            <div className="legend-row"><i className="gem gold-gem" /><span>金块</span><strong>80–360</strong></div>
            <div className="legend-row"><i className="gem diamond-gem" /><span>钻石</span><strong>500+</strong></div>
            <div className="legend-row"><i className="gem rock-gem" /><span>岩石</span><strong>很重</strong></div>
          </div>

          <div className="tip-card">
            <span aria-hidden="true">☞</span>
            <p><strong>矿工诀窍</strong>大金块价值高，但回收更慢。钻石才是冲关捷径。</p>
          </div>
        </aside>
      </section>

      <section className="mobile-controls" aria-label="触屏操作">
        <button className="drop-button" onClick={dropHook} disabled={phase !== "playing" || hookCount > 0}>
          <span>↓</span> {hookCount ? `${hookCount} 钩回收中` : "一发多钩"}
        </button>
        <button className="mobile-bomb" onClick={useDynamite} disabled={!carrying || dynamite === 0 || phase !== "playing"}>
          🧨 ×{dynamite}
        </button>
      </section>

      <footer>
        <span>空格 / ↓ 投放</span>
        <span>D 使用炸药</span>
        <span>S 打开商店</span>
      </footer>
    </main>
  );
}
