import { viewport } from "./geometry.js?v=20261002animals";
import { containsRegion, regionBounds } from "./regions.js?v=20261002animals";
import { drawAnimal } from './animals.js?v=20261002animals';
const TAU = Math.PI * 2;
function paperPath(c) {
  c.beginPath();
  c.arc(50, 50, 48, 0, TAU);
  c.closePath();
}
function line(c, x, y, u, v) {
  c.beginPath();
  c.moveTo(x, y);
  c.lineTo(u, v);
  c.stroke();
}
function star(c, x, y, r, n = 5) {
  c.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = (i * Math.PI) / n - Math.PI / 2,
      d = i % 2 ? r * 0.42 : r;
    c.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
  }
  c.closePath();
  c.fill();
}
function texture(c, pattern) {
  c.save();
  c.lineWidth = 1;
  c.strokeStyle = "#fff8";
  c.fillStyle = "#fff7";
  switch (pattern) {
    case "rice":
      for (let i = 0; i < 80; i++) {
        const x = (i * 37) % 100,
          y = (i * 61) % 100;
        line(c, x, y, x + 3, y + 1);
      }
      break;
    case "watercolor":
      for (let i = 0; i < 7; i++) {
        c.globalAlpha = 0.1 + i * 0.017;
        c.beginPath();
        c.ellipse((i * 39) % 100, (i * 23) % 100, 30, 15, i, 0, TAU);
        c.fill();
      }
      break;
    case "washi":
      c.lineWidth = 2;
      for (let i = 0; i < 30; i++) {
        const x = (i * 29) % 100,
          y = (i * 47) % 100;
        line(c, x, y, x + 8, y - 6);
      }
      break;
    case "linen":
      c.globalAlpha = 0.3;
      for (let i = 0; i < 100; i += 4) {
        line(c, i, 0, i, 100);
        line(c, 0, i, 100, i);
      }
      break;
    case "gold-leaf":
      c.fillStyle = "#ffe598aa";
      for (let i = 0; i < 24; i++) {
        const x = (i * 31) % 100,
          y = (i * 53) % 100;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + 11, y + 3);
        c.lineTo(x + 5, y + 11);
        c.fill();
      }
      break;
    case "silver-leaf":
      c.fillStyle = "#e7faffb0";
      for (let i = 0; i < 12; i++) {
        const x = (i * 47) % 100,
          y = (i * 29) % 100;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + 14, y - 7);
        c.lineTo(x + 20, y + 12);
        c.lineTo(x + 3, y + 17);
        c.fill();
      }
      break;
    case "pearl": {
      const g = c.createRadialGradient(28, 27, 2, 50, 50, 60);
      g.addColorStop(0, "#fff9");
      g.addColorStop(0.45, "#ffeef42a");
      g.addColorStop(0.7, "#c4f3ed66");
      g.addColorStop(1, "#fff0");
      c.fillStyle = g;
      c.fillRect(0, 0, 100, 100);
      for (let i = 0; i < 8; i++) {
        c.fillStyle = "#fff7";
        c.beginPath();
        c.arc((i * 37) % 100, (i * 67) % 100, 3, 0, TAU);
        c.fill();
      }
      break;
    }
    case "plaid":
      c.lineWidth = 9;
      c.globalAlpha = 0.32;
      for (let i = 12; i < 100; i += 25) {
        line(c, i, 0, i, 100);
        line(c, 0, i, 100, i);
      }
      c.lineWidth = 1;
      c.globalAlpha = 0.65;
      for (let i = 5; i < 100; i += 25) {
        line(c, i, 0, i, 100);
        line(c, 0, i, 100, i);
      }
      break;
    case "stripes":
      c.lineWidth = 6;
      c.globalAlpha = 0.45;
      for (let i = -100; i < 150; i += 17) line(c, i, 0, i + 100, 100);
      break;
    case "dots":
      for (let y = 10; y < 100; y += 18)
        for (let x = 10; x < 100; x += 18) {
          c.beginPath();
          c.arc(x + (y % 36 ? 0 : 7), y, 2.3, 0, TAU);
          c.fill();
        }
      break;
    case "clouds":
      c.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const x = (i * 41) % 95,
          y = 10 + ((i * 27) % 85);
        c.beginPath();
        c.arc(x, y, 7, Math.PI, 0);
        c.arc(x + 10, y, 10, Math.PI, 0);
        c.arc(x + 21, y, 6, Math.PI, 0);
        c.stroke();
      }
      break;
    case "waves":
      c.lineWidth = 2;
      for (let y = 9; y < 100; y += 14) {
        c.beginPath();
        for (let x = 0; x <= 100; x += 2)
          c.lineTo(x, y + Math.sin(x * 0.14) * 3);
        c.stroke();
      }
      break;
    case "wood":
      c.strokeStyle = "#593c3433";
      for (let y = 4; y < 100; y += 8) {
        c.beginPath();
        for (let x = 0; x <= 100; x += 3)
          c.lineTo(x, y + Math.sin(x * 0.07 + y) * 5);
        c.stroke();
      }
      c.beginPath();
      c.ellipse(63, 55, 8, 17, 0.3, 0, TAU);
      c.stroke();
      break;
    case "marble":
      c.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        c.beginPath();
        c.moveTo(i * 25 - 10, 0);
        c.bezierCurveTo(i * 12 + 40, 25, i * 35 - 30, 50, i * 25 + 30, 100);
        c.stroke();
      }
      c.lineWidth = 0.6;
      c.strokeStyle = "#163d5738";
      line(c, 0, 45, 100, 75);
      break;
    case "stars":
      for (let i = 0; i < 13; i++)
        star(c, 8 + ((i * 29) % 90), 8 + ((i * 43) % 85), 3 + (i % 3));
      break;
    case "petals":
      for (let i = 0; i < 15; i++) {
        c.beginPath();
        c.ellipse((i * 31) % 100, (i * 59) % 100, 3, 7, i, 0, TAU);
        c.fill();
      }
      break;
    case "snow":
      for (let i = 0; i < 9; i++) {
        const x = 10 + ((i * 37) % 80),
          y = 10 + ((i * 53) % 80);
        for (let a = 0; a < 3; a++) {
          const dx = Math.cos((a * Math.PI) / 3) * 6,
            dy = Math.sin((a * Math.PI) / 3) * 6;
          line(c, x - dx, y - dy, x + dx, y + dy);
        }
      }
      break;
    case "woven":
      c.lineWidth = 3;
      c.globalAlpha = 0.35;
      for (let y = 0; y < 100; y += 10)
        for (let x = 0; x < 100; x += 10)
          if ((x + y) % 20 === 0) line(c, x, y, x + 8, y + 8);
          else line(c, x + 8, y, x, y + 8);
      break;
    case "brocade":
      c.lineWidth = 1.3;
      for (let y = 14; y < 100; y += 24)
        for (let x = 14; x < 100; x += 24) {
          c.beginPath();
          c.moveTo(x, y - 8);
          c.quadraticCurveTo(x + 11, y, x, y + 8);
          c.quadraticCurveTo(x - 11, y, x, y - 8);
          c.stroke();
          c.fillRect(x - 1, y - 1, 2, 2);
        }
      break;
    case "candy":
      c.lineWidth = 12;
      c.globalAlpha = 0.5;
      c.strokeStyle = "#ffe1eb";
      for (let i = -100; i < 150; i += 28) line(c, i, 0, i + 100, 100);
      c.lineWidth = 4;
      c.strokeStyle = "#fff";
      for (let i = -85; i < 150; i += 28) line(c, i, 0, i + 100, 100);
      break;
    case "foil":
      c.globalAlpha = 0.3;
      for (let i = 0; i < 8; i++) {
        c.fillStyle = ["#ffeaa1", "#b9fff0", "#d9c6ff"][i % 3];
        c.beginPath();
        c.moveTo((i * 19) % 100, 0);
        c.lineTo((i * 19 + 32) % 120, 100);
        c.lineTo((i * 19 + 50) % 120, 100);
        c.fill();
      }
      break;
  }
  c.restore();
}
function effectMark(c, e, x, y, r, a) {
  c.save();
  c.translate(x, y);
  c.rotate(a);
  c.lineWidth = 1.1;
  c.strokeStyle = "#fffbe8cc";
  c.fillStyle = "#fffbe8dc";
  switch (e) {
    case "galaxy":
      star(c, 0, 0, r);
      c.beginPath();
      c.arc(0, 0, r * 1.7, 0, TAU);
      c.stroke();
      break;
    case "aurora":
      c.strokeStyle = "#a7ffd3";
      c.beginPath();
      c.moveTo(-r, -r);
      c.bezierCurveTo(r, -r * 2, -r, r * 2, r, r);
      c.stroke();
      break;
    case "fireflies":
      c.shadowColor = "#eaff79";
      c.shadowBlur = 5;
      c.fillStyle = "#f5ff9b";
      c.beginPath();
      c.arc(0, 0, r * 0.5, 0, TAU);
      c.fill();
      break;
    case "meteor":
      star(c, 0, 0, r);
      line(c, -r * 3, 0, -r, 0);
      break;
    case "fireworks":
      for (let i = 0; i < 6; i++) {
        const angle = (i * TAU) / 6;
        line(
          c,
          Math.cos(angle) * r * 0.5,
          Math.sin(angle) * r * 0.5,
          Math.cos(angle) * r * 1.5,
          Math.sin(angle) * r * 1.5,
        );
      }
      break;
    case "ice-crystals":
      c.fillStyle = "#c3fbff";
      c.beginPath();
      c.moveTo(0, -r * 1.5);
      c.lineTo(r * 0.6, 0);
      c.lineTo(0, r);
      c.lineTo(-r * 0.6, 0);
      c.fill();
      break;
    case "lava":
      c.fillStyle = "#ffd067";
      c.beginPath();
      c.moveTo(-r, r);
      c.quadraticCurveTo(-r, -r, 0, -r * 1.7);
      c.quadraticCurveTo(r * 2, 0, r, r);
      c.fill();
      break;
    case "lightning":
      c.beginPath();
      c.moveTo(r, -r * 2);
      c.lineTo(-r, 0);
      c.lineTo(r * 0.3, 0);
      c.lineTo(-r, r * 2);
      c.stroke();
      break;
    case "cherry-fall":
      c.fillStyle = "#ffd2e0";
      for (let i = 0; i < 5; i++) {
        c.rotate(TAU / 5);
        c.beginPath();
        c.ellipse(0, -r * 0.65, r * 0.45, r * 0.8, 0, 0, TAU);
        c.fill();
      }
      break;
    case "autumn-leaves":
      c.fillStyle = "#ffc783";
      c.beginPath();
      c.ellipse(0, 0, r * 0.6, r * 1.4, 0.5, 0, TAU);
      c.fill();
      break;
    case "sea-foam":
      c.strokeStyle = "#e3ffff";
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.arc(i * r * 0.7, 0, r * 0.55, 0, TAU);
        c.stroke();
      }
      break;
    case "moonlight":
      c.beginPath();
      c.arc(0, 0, r, Math.PI * 0.25, Math.PI * 1.75);
      c.quadraticCurveTo(-r * 0.7, 0, r * 0.7, r * 0.7);
      c.fill();
      break;
    case "corona":
      c.beginPath();
      c.arc(0, 0, r, 0, TAU);
      c.stroke();
      for (let i = 0; i < 8; i++) {
        c.rotate(TAU / 8);
        line(c, r * 1.3, 0, r * 1.7, 0);
      }
      break;
    case "rainbow":
      for (let i = 0; i < 4; i++) {
        c.strokeStyle = ["#ffd6be", "#fff6b4", "#bcebd5", "#d5d4ff"][i];
        c.beginPath();
        c.arc(0, 0, r + i, Math.PI, TAU);
        c.stroke();
      }
      break;
    case "ghost":
      c.globalAlpha = 0.65;
      c.beginPath();
      c.arc(0, -r * 0.2, r, Math.PI, 0);
      c.lineTo(r, r);
      c.lineTo(0, r * 0.5);
      c.lineTo(-r, r);
      c.fill();
      break;
    case "pixel-sparks":
      c.fillRect(-r, -r, r * 2, r * 2);
      c.fillRect(r * 1.8, 0, r, r);
      break;
    case "hearts":
      c.beginPath();
      c.moveTo(0, r);
      c.bezierCurveTo(-r * 2, 0, -r, -r * 2, 0, -r * 0.6);
      c.bezierCurveTo(r, -r * 2, r * 2, 0, 0, r);
      c.fill();
      break;
    case "music-notes":
      c.beginPath();
      c.ellipse(-r * 0.5, r * 0.7, r * 0.8, r * 0.5, -0.3, 0, TAU);
      c.fill();
      line(c, r * 0.15, r * 0.7, r * 0.15, -r * 1.5);
      line(c, r * 0.15, -r * 1.5, r * 1.2, -r);
      break;
    case "diamond":
      c.beginPath();
      c.moveTo(0, -r * 1.3);
      c.lineTo(r, 0);
      c.lineTo(0, r * 1.3);
      c.lineTo(-r, 0);
      c.closePath();
      c.stroke();
      line(c, -r, 0, r, 0);
      break;
    case "clockwork":
      c.beginPath();
      c.arc(0, 0, r, 0, TAU);
      c.stroke();
      line(c, 0, 0, 0, -r * 0.7);
      line(c, 0, 0, r * 0.6, 0);
      break;
  }
  c.restore();
}

// One circular token shared by the hero, shop, results and live players.
export function drawPaper(
  ctx,
  x,
  y,
  size,
  skin,
  time = 0,
  { locked = false, active = false, roll = 0 } = {},
) {
  ctx.save();
  ctx.translate(x - size / 2, y - size / 2);
  ctx.scale(size / 100, size / 100);
  paperPath(ctx);
  ctx.shadowColor = "#27484d3a";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = locked ? "#202727" : skin.color;
  ctx.fill();
  ctx.shadowColor = "transparent";
  if (!locked) {
    ctx.save();
    paperPath(ctx);
    ctx.clip();
    ctx.translate(50, 50);
    ctx.rotate(roll);
    ctx.translate(-50, -50);
    if (skin.tier !== "normal" && skin.tier !== 'special') ctx.drawImage(material(skin), 0, 0, 100, 100);
    if (skin.tier === 'special') drawAnimal(ctx, 50, 53, 80, skin.animal);
    const shine = ctx.createRadialGradient(28, 24, 0, 50, 50, 68);
    shine.addColorStop(0, "#ffffff75");
    shine.addColorStop(0.48, "#ffffff08");
    shine.addColorStop(1, "#173b4035");
    ctx.fillStyle = shine;
    ctx.fillRect(0, 0, 100, 100);
    if (skin.tier === "hidden")
      for (let i = 0; i < 5; i++)
        effectMark(
          ctx,
          skin.effect,
          14 + ((i * 29) % 75),
          18 + ((i * 37) % 70),
          3 + (i % 2),
          (active ? time * 0.3 : 0) + i,
        );
    if (active && skin.tier === "hidden" && skin.effect === "galaxy")
      meteor(ctx, time);
    ctx.restore();
    ctx.strokeStyle = "#fff9";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(50, 50, 44, -Math.PI * 0.9, -Math.PI * 0.3);
    ctx.stroke();
  }
  paperPath(ctx);
  ctx.strokeStyle = locked ? "#151c1c" : "#293c4235";
  ctx.lineWidth = 0.9;
  ctx.stroke();
  if (active && !locked && skin.tier === "hidden")
    for (let i = 0; i < 12; i++) {
      const a = i * 2.399 + time * 0.38,
        r = 58 + (i % 3) * 8,
        px = 50 + Math.cos(a) * r,
        py = 50 + Math.sin(a) * r;
      ctx.globalAlpha = 0.35 + 0.35 * Math.sin(time * 1.4 + i) ** 2;
      ctx.fillStyle = ["#fffbe8", "#e9ffff", "#ffe3ed"][i % 3];
      ctx.beginPath();
      ctx.arc(px, py, 2.5 + (i % 2), 0, TAU);
      ctx.fill();
    }
  ctx.restore();
}

function circlePath(circles, tile) {
  const path = new Path2D();
  for (const c of circles) {
    path.moveTo((c.x + c.r) * tile, c.y * tile);
    path.arc(c.x * tile, c.y * tile, c.r * tile, 0, TAU);
    path.closePath();
  }
  return path;
}
const materials = new Map();
export function material(skin) {
  const key = [skin.color, skin.tier, skin.pattern, skin.effect, skin.animal].join(":");
  if (materials.has(key)) return materials.get(key);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 192;
  const c = canvas.getContext("2d");
  c.scale(1.92, 1.92);
  c.fillStyle = skin.color;
  c.fillRect(0, 0, 100, 100);
  texture(c, skin.pattern);
  if (skin.tier === 'special') {
    for (const x of [25, 75]) for (const y of [25, 75]) drawAnimal(c, x, y, 43, skin.animal);
  }
  for (let i = 0; i < 650; i++) {
    const x = (i * 47.713) % 100,
      y = (i * 31.419) % 100;
    c.fillStyle = i % 3 ? "#ffffff26" : "#16394318";
    c.beginPath();
    c.ellipse(
      x,
      y,
      0.17 + (i % 2) * 0.09,
      0.5 + (i % 3) * 0.2,
      i * 0.17,
      0,
      TAU,
    );
    c.fill();
  }
  c.strokeStyle = "#ffffff16";
  c.lineWidth = 0.25;
  for (let i = 0; i < 100; i++) {
    const x = (i * 37.27) % 100,
      y = (i * 57.49) % 100;
    c.beginPath();
    c.moveTo(x, y);
    c.quadraticCurveTo(x + 3, y - 1, x + 7, y + 0.6);
    c.stroke();
  }
  if (skin.tier === "hidden")
    for (let i = 0; i < 7; i++)
      effectMark(
        c,
        skin.effect,
        10 + ((i * 23) % 85),
        10 + ((i * 37) % 85),
        2.3 + (i % 2),
        i,
      );
  if (materials.size >= 64) materials.delete(materials.keys().next().value);
  materials.set(key, canvas);
  return canvas;
}
function meteor(c, time) {
  for (let i = 0; i < 2; i++) {
    const t = (time * 0.22 + i * 0.53) % 1,
      x = -25 + t * 155,
      y = 5 + i * 24 + t * 70,
      tail = 18;
    const g = c.createLinearGradient(x - tail, y - tail * 0.45, x, y);
    g.addColorStop(0, "#e7f9ff00");
    g.addColorStop(1, "#ffffffdd");
    c.strokeStyle = g;
    c.lineWidth = 1.15;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(x - tail, y - tail * 0.45);
    c.lineTo(x, y);
    c.stroke();
    c.fillStyle = "#fffdf2";
    c.beginPath();
    c.arc(x, y, 1.2, 0, TAU);
    c.fill();
  }
}
function regionPath(shape, scale = 1) {
  const p = new Path2D();
  for (const poly of shape)
    for (const ring of poly) {
      if (!ring.length) continue;
      p.moveTo(ring[0][0] * scale, ring[0][1] * scale);
      for (const [x, y] of ring.slice(1)) p.lineTo(x * scale, y * scale);
      p.closePath();
    }
  return p;
}
export function createRenderer(
  canvas,
  { follow = false, minimap = null } = {},
) {
  const ctx = canvas.getContext("2d"),
    base = document.createElement("canvas"),
    miniBase = document.createElement("canvas"),
    tile = 18,
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let previous = "",
    geometry = { scale: 1, ox: 0, oy: 0 },
    width = 0,
    height = 0,
    baseBuilds = 0,
    ownLand = null,
    coastClip = null,
    particles = [],
    bounds = null,
    tail = [],
    tailKey = "",
    lastTail = null;
  function draw(game, skin, time = 0) {
    if (reducedMotion.matches) time = 0;
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    if (!w || !h) return geometry;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (width !== w || height !== h || canvas.width !== Math.round(w * dpr)) {
      width = w;
      height = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    geometry = viewport(game, w, h, follow);
    const { scale, ox, oy } = geometry;
    const key = `${game.runId}:${game.revision}:${skin.id}:${skin.color}:${skin.tier}:${skin.pattern}:${skin.effect}:${skin.animal}`;
    if (key !== previous) {
      previous = key;
      base.width = game.cols * tile;
      base.height = game.rows * tile;
      baseBuilds++;
      const c = base.getContext("2d"),
        bw = base.width,
        bh = base.height;
      const water = c.createLinearGradient(0, 0, bw, bh);
      water.addColorStop(0, "#b2dcd5");
      water.addColorStop(0.5, "#83c5c8");
      water.addColorStop(1, "#64aeb9");
      c.fillStyle = water;
      c.fillRect(0, 0, bw, bh);
      c.lineWidth = 1;
      c.strokeStyle = "#e9fffa34";
      for (let i = 0; i < 350; i++) {
        const x = (i * 137.31) % bw,
          y = (i * 87.47) % bh;
        c.beginPath();
        c.moveTo(x, y);
        c.quadraticCurveTo(x + 7, y + 3, x + 15, y);
        c.stroke();
      }
      const coast = regionPath(game.world, tile);
      coastClip = regionPath(game.world);
      ownLand = regionPath(game.territories[0]);
      bounds = regionBounds(game.territories[0]);
      particles = [];
      c.shadowColor = "#3f6b6955";
      c.shadowBlur = 13;
      c.shadowOffsetY = 8;
      c.fillStyle = "#fff9e7";
      c.fill(coast, "evenodd");
      c.shadowColor = "transparent";
      c.shadowOffsetY = 0;
      c.save();
      c.clip(coast, "evenodd");
      for (const p of game.players) {
        const initial =
            game.startTerritories?.[p.id] === game.territories[p.id],
          land = initial
            ? circlePath([game.initialDisks[p.id]], tile)
            : regionPath(game.territories[p.id], tile);
        if (p.id === 0 && skin.tier !== "normal") {
          const pattern = c.createPattern(material(skin), "repeat");
          pattern.setTransform(new DOMMatrix().scale((tile * 4) / 192));
          c.fillStyle = pattern;
        } else c.fillStyle = (p.id === 0 ? skin.color : p.color) + "bc";
        c.fill(land, "evenodd");
      }
      c.restore();
      c.strokeStyle = "#fff8";
      c.lineWidth = 1.5;
      c.stroke(coast);
      if (bounds && ['fine', 'hidden'].includes(skin.tier)) {
        const count = Math.min(
          skin.tier === "hidden" ? 160 : 96,
          Math.max(
            skin.tier === "hidden" ? 40 : 24,
            Math.floor(game.areas[0] * 3),
          ),
        );
        for (let n = 0; n < count * 30 && particles.length < count; n++) {
          const x =
              bounds.minX +
              ((n * 0.61803398875 + 0.31) % 1) * (bounds.maxX - bounds.minX),
            y =
              bounds.minY +
              ((n * 0.41421356237 + 0.17) % 1) * (bounds.maxY - bounds.minY);
          if (containsRegion(game.territories[0], x, y))
            particles.push({
              x,
              y,
              phase: n * 2.399,
              r: 0.035 + (n % 3) * 0.014,
            });
        }
      }
      if (minimap) {
        miniBase.width = miniBase.height = 128;
        const m = miniBase.getContext("2d"),
          s = 120 / Math.max(game.cols, game.rows),
          mx = (128 - game.cols * s) / 2,
          my = (128 - game.rows * s) / 2;
        m.fillStyle = "#fff9ed";
        m.fillRect(0, 0, 128, 128);
        m.translate(mx, my);
        m.fillStyle = skin.color;
        m.fill(regionPath(game.territories[0], s), "evenodd");
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#83c5c8";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(base, ox, oy, game.cols * scale, game.rows * scale);
    if (particles.length) {
      ctx.save();
      ctx.translate(ox, oy);
      ctx.scale(scale, scale);
      ctx.clip(coastClip, "evenodd");
      ctx.clip(ownLand, "evenodd");
      for (const p of particles) {
        const x = p.x + Math.sin(time * 0.5 + p.phase) * 0.035,
          y = p.y + Math.cos(time * 0.4 + p.phase) * 0.035;
        if (
          ox + x * scale < -8 ||
          oy + y * scale < -8 ||
          ox + x * scale > w + 8 ||
          oy + y * scale > h + 8
        )
          continue;
        ctx.globalAlpha =
          (skin.tier === "hidden" ? 0.5 : 0.22) +
          0.4 * (0.5 + 0.5 * Math.sin(time * 1.8 + p.phase)) ** 2;
        ctx.fillStyle = skin.tier === "hidden" ? "#d5f7ff66" : "#fffef555";
        ctx.beginPath();
        ctx.arc(x, y, p.r * (skin.tier === "hidden" ? 4 : 2), 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#fffef5";
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, TAU);
        ctx.fill();
      }
      if (skin.tier === "hidden") {
        for (const p of particles.filter((_, i) => i % 20 === 0)) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.scale(0.032, 0.032);
          effectMark(ctx, skin.effect, 0, 0, 3, time * 0.3 + p.phase);
          ctx.restore();
        }
        if (skin.effect === "galaxy") {
          const span = Math.min(9, Math.max(2, bounds.maxX - bounds.minX)),
            center = follow
              ? game.players[0]
              : {
                  x: (bounds.minX + bounds.maxX) / 2,
                  y: (bounds.minY + bounds.maxY) / 2,
                };
          ctx.save();
          ctx.translate(center.x - span / 2, center.y - span / 2);
          ctx.scale(span / 100, span / 100);
          meteor(ctx, time);
          ctx.restore();
        }
      }
      ctx.restore();
    }
    const p0 = game.players[0],
      tkey = game.runId + ":" + skin.id;
    if (tailKey !== tkey) {
      tail = [];
      lastTail = null;
      tailKey = tkey;
    }
    if (skin.tier === "hidden" && !reducedMotion.matches) {
      if (
        lastTail &&
        Math.hypot(p0.x - lastTail.x, p0.y - lastTail.y) > 0.12 &&
        time - lastTail.time > 0.04
      ) {
        if (Math.hypot(p0.x - lastTail.x, p0.y - lastTail.y) < 2)
          tail.push({ x: lastTail.x, y: lastTail.y, time });
        lastTail = { x: p0.x, y: p0.y, time };
      } else if (!lastTail) lastTail = { x: p0.x, y: p0.y, time };
      tail = tail.filter((p) => time - p.time < 3).slice(-72);
      for (const p of tail) {
        ctx.save();
        ctx.translate(ox + p.x * scale, oy + p.y * scale);
        ctx.globalAlpha = (1 - (time - p.time) / 3) * 0.7;
        ctx.fillStyle = skin.color;
        ctx.beginPath();
        ctx.arc(0, 0, scale * 0.11, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#fff5e5";
        star(ctx, 0, 0, scale * 0.07);
        ctx.restore();
      }
    } else {
      tail = [];
      lastTail = null;
    }
    for (const p of game.players) {
      if (!p.alive) continue;
      const color = p.id === 0 ? skin.color : p.color,
        stroke = p.stroke?.length ? p.stroke : p.trail;
      if (stroke.length) {
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(ox + stroke[0].x * scale, oy + stroke[0].y * scale);
        for (const t of stroke.slice(1))
          ctx.lineTo(ox + t.x * scale, oy + t.y * scale);
        ctx.lineTo(ox + p.x * scale, oy + p.y * scale);
        ctx.strokeStyle = color + "55";
        ctx.lineWidth = Math.max(5, scale * 0.5);
        ctx.stroke();
        ctx.restore();
      }
      if (
        p.x * scale + ox < -30 ||
        p.x * scale + ox > w + 30 ||
        p.y * scale + oy < -30 ||
        p.y * scale + oy > h + 30
      )
        continue;
      const size = Math.max(16, scale * 1.45);
      drawPaper(
        ctx,
        ox + p.x * scale,
        oy + p.y * scale,
        size,
        p.id === 0
          ? skin
          : { color: p.color, pattern: "plain", tier: "normal" },
        time,
        { active: !reducedMotion.matches, roll: reducedMotion.matches ? 0 : p.rollAngle || 0 },
      );
      if (p.id === 0) {
        ctx.fillStyle = "#fffef1";
        ctx.font = `700 ${Math.max(9, scale * 0.6)}px system-ui`;
        ctx.textAlign = "center";
        ctx.shadowColor = "#356c69";
        ctx.shadowBlur = 3;
        ctx.fillText("你", ox + p.x * scale, oy + p.y * scale - size * 0.8);
        ctx.shadowBlur = 0;
      }
    }
    if (game.mode === "reward" || game.resumeMode === "reward") {
      ctx.save();
      ctx.translate(ox, oy);
      ctx.scale(scale, scale);
      ctx.clip(coastClip, "evenodd");
      for (const coin of game.rewards?.coins || [])
        if (!coin.collected) {
          ctx.save();
          ctx.translate(coin.x, coin.y);
          ctx.shadowColor = "#ffe082";
          ctx.shadowBlur = 5;
          ctx.fillStyle = "#f8c64e";
          ctx.beginPath();
          ctx.arc(0, 0, 0.27, 0, TAU);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = "#fff1a0";
          ctx.lineWidth = 0.055;
          ctx.stroke();
          ctx.fillStyle = "#b98a22";
          ctx.fillRect(-0.03, -0.13, 0.06, 0.26);
          ctx.restore();
        }
      for (const box of game.rewards?.chests || [])
        if (!box.collected) {
          ctx.save();
          ctx.translate(box.x, box.y);
          ctx.fillStyle = "#73513e";
          ctx.strokeStyle = "#f5d477";
          ctx.lineWidth = 0.09;
          ctx.beginPath();
          ctx.roundRect(-0.5, -0.37, 1, 0.75, 0.12);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#ffde7e";
          ctx.fillRect(-0.09, -0.12, 0.18, 0.3);
          ctx.fillStyle = "#fff7d8";
          star(ctx, 0.55, -0.5, 0.12 * (1 + 0.2 * Math.sin(time * 2 + box.id)));
          ctx.restore();
        }
      for (const clock of game.rewards?.clocks || [])
        if (!clock.collected) {
          ctx.save();
          ctx.translate(clock.x, clock.y);
          ctx.shadowColor = "#d5f9ff";
          ctx.shadowBlur = 5;
          ctx.fillStyle = "#f5fcff";
          ctx.strokeStyle = "#488ca9";
          ctx.lineWidth = 0.06;
          ctx.beginPath();
          ctx.arc(0, 0, 0.4, 0, TAU);
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;
          line(ctx, 0, 0, 0, -0.23);
          line(ctx, 0, 0, 0.18, 0.07);
          ctx.fillStyle = "#fff";
          ctx.strokeStyle = "#245168";
          ctx.lineWidth = 0.075;
          ctx.font = "bold 0.32px system-ui";
          ctx.textAlign = "center";
          ctx.strokeText("+" + clock.seconds + "s", 0, 0.76);
          ctx.fillText("+" + clock.seconds + "s", 0, 0.76);
          ctx.restore();
        }
      ctx.restore();
    }
    if (minimap) {
      if (minimap.width !== 128 || minimap.height !== 128)
        minimap.width = minimap.height = 128;
      const m = minimap.getContext("2d"),
        s = 120 / Math.max(game.cols, game.rows),
        mx = (128 - game.cols * s) / 2,
        my = (128 - game.rows * s) / 2;
      m.drawImage(miniBase, 0, 0);
      m.beginPath();
      m.arc(mx + p0.x * s, my + p0.y * s, 2.3, 0, TAU);
      m.fillStyle = "#fff";
      m.fill();
      m.strokeStyle = skin.color;
      m.lineWidth = 1.3;
      m.stroke();
      minimap.dataset.playerX = p0.x;
      minimap.dataset.playerY = p0.y;
      minimap.dataset.viewX = -ox / scale;
      minimap.dataset.viewY = -oy / scale;
      minimap.dataset.viewWidth = w / scale;
      minimap.dataset.viewHeight = h / scale;
    }
    canvas.dataset.scale = scale;
    canvas.dataset.offsetX = ox;
    canvas.dataset.offsetY = oy;
    canvas.dataset.paperSize = Math.max(16, scale * 1.45);
    canvas.dataset.tokenShape = "circle";
    canvas.dataset.worldCols = game.cols;
    canvas.dataset.worldRows = game.rows;
    canvas.dataset.viewWidth = w / scale;
    canvas.dataset.viewHeight = h / scale;
    canvas.dataset.baseBuilds = baseBuilds;
    canvas.dataset.galaxyParticles = particles.length;
    canvas.dataset.starTail = tail.length;
    canvas.dataset.rollAngle = reducedMotion.matches ? 0 : p0.rollAngle || 0;
    canvas.dataset.trailPoints = p0.stroke?.length || 0;
    return geometry;
  }
  return { draw, getGeometry: () => geometry };
}
