import {
  createEditorLevel,
  validateLevel,
  readEditorLevel,
  writeEditorLevel,
} from "./editor.js";

const THEMES = [
  ["sakura", "樱花林"],
  ["flowers", "百花林"],
  ["city", "城市"],
  ["cabin", "林间木屋"],
];
export function createEditorUI(root, { onPlay, onClose, onStatus }) {
  root.innerHTML = `<section class="editor-header"><div><span class="eyebrow">YOUR LITTLE WORLD</span><h2>搭一条自己的路线</h2></div><button id="editor-close" aria-label="关闭编辑器">✕</button></section>
    <p class="editor-note">自创金币只作练习，不增加商店余额。保存前检查起终点支撑，路线是否可达由你试玩调整。</p>
    <div class="editor-layout"><div class="map-column"><div class="tools" aria-label="编辑工具">
    ${[
      ["platform", "平台"],
      ["spawn", "起点"],
      ["goal", "终点"],
      ["checkpoint", "存档点"],
      ["coin", "金币"],
    ]
      .map(
        ([id, name]) =>
          `<button data-tool="${id}" aria-pressed="${id === "platform"}">${name}</button>`,
      )
      .join("")}
    </div><canvas id="editor-map" aria-label="俯视关卡预览，点击空处放平台，点击平台选择" tabindex="0"></canvas>
    <div class="map-footer"><span id="platform-count"></span><span>拖动平移 · 滚轮缩放</span><button id="zoom-out" aria-label="缩小">−</button><button id="zoom-in" aria-label="放大">＋</button></div></div>
    <form class="editor-fields" onsubmit="return false"><label>路线名称<input id="editor-name" maxlength="80"></label><label>场景<select id="level-theme">${THEMES.map(([id, name]) => `<option value="${id}">${name}</option>`).join("")}</select></label>
    <h3 id="selected-platform">平台</h3><div class="coordinate-fields">${[
      ["x", "横向 x", -100, 100],
      ["z", "纵向 z", -100, 100],
      ["y", "顶面高度", -2, 30],
      ["w", "宽度", 1, 20],
      ["d", "深度", 1, 20],
      ["h", "厚度", 0.2, 10],
    ]
      .map(
        ([key, name, min, max]) =>
          `<label>${name}<input id="platform-${key}" type="number" step="0.1" min="${min}" max="${max}"></label>`,
      )
      .join("")}</div>
    <button id="platform-delete" class="subtle">删除选中平台</button><p id="editor-feedback" role="status"></p>
    <div class="editor-actions"><button id="editor-save">保存到本机</button><button id="editor-load">重新加载</button><button id="editor-play" class="primary">3D 试玩 →</button></div></form></div>`;
  const q = (id) => root.querySelector(`#${id}`),
    canvas = q("editor-map"),
    ctx = canvas.getContext("2d");
  let level = createEditorLevel(),
    selected = level.platforms[0].id,
    tool = "platform",
    scale = 23,
    center = { x: 2.5, z: 0 },
    gesture = null,
    counter = 0;
  let storage,
    savedState = "none";
  try {
    storage = localStorage;
    const raw = storage.getItem("glow-parkour-level-v1");
    if (raw !== null) {
      const saved = readEditorLevel(storage);
      if (saved) {
        level = saved;
        selected = level.platforms.at(-1).id;
        savedState = "loaded";
      } else savedState = "invalid";
    }
  } catch {
    savedState = "blocked";
  }
  const feedback = (text) => {
    q("editor-feedback").textContent = text;
    onStatus(text);
  };
  const platform = () => level.platforms.find((p) => p.id === selected);
  const support = (x, z) =>
    level.platforms
      .filter(
        (p) => Math.abs(x - p.x) <= p.w / 2 && Math.abs(z - p.z) <= p.d / 2,
      )
      .sort((a, b) => b.y - a.y)[0];
  const id = (prefix) => `${prefix}-${Date.now().toString(36)}-${counter++}`;
  function fields() {
    const p = platform();
    q("editor-name").value = level.name;
    q("level-theme").value = level.theme;
    q("selected-platform").textContent = p
      ? `平台 ${level.platforms.indexOf(p) + 1}`
      : "请选择平台";
    for (const field of ["x", "z", "y", "w", "d", "h"]) {
      q(`platform-${field}`).disabled = !p;
      q(`platform-${field}`).value = p?.[field] ?? "";
    }
    q("platform-count").textContent = `${level.platforms.length} / 80`;
  }
  const screen = (x, z) => ({
    x: canvas.clientWidth / 2 + (x - center.x) * scale,
    y: canvas.clientHeight / 2 + (z - center.z) * scale,
  });
  function draw() {
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#ecf4ed";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#d6e4d9";
    ctx.lineWidth = 1;
    const origin = screen(0, 0),
      grid = scale * 2;
    for (let x = ((origin.x % grid) + grid) % grid; x < w; x += grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = ((origin.y % grid) + grid) % grid; y < h; y += grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (const [i, p] of level.platforms.entries()) {
      const point = screen(p.x, p.z),
        x = point.x - (p.w * scale) / 2,
        y = point.y - (p.d * scale) / 2;
      ctx.fillStyle = p.id === selected ? "#edd5b8" : "#c0d4c7";
      ctx.fillRect(x, y, p.w * scale, p.d * scale);
      ctx.strokeStyle = p.id === selected ? "#b78753" : "#739783";
      ctx.lineWidth = p.id === selected ? 3 : 1.5;
      ctx.strokeRect(x, y, p.w * scale, p.d * scale);
      ctx.fillStyle = "#38544a";
      ctx.font = "12px system-ui";
      ctx.textAlign = "left";
      ctx.fillText(`${i + 1} · ${p.y.toFixed(1)}m`, x + 5, y + 17);
    }
    const marker = (point, color, label) => {
      const s = screen(point.x, point.z);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(label, s.x, s.y + 3.5);
    };
    for (const coin of level.coins) marker(coin, "#b7872f", "币");
    for (const cp of level.checkpoints) marker(cp, "#3a9786", "存");
    marker(level.spawn, "#4774a0", "起");
    marker(level.goal, "#d0767e", "终");
  }
  function place(x, z) {
    x = Math.round(x * 2) / 2;
    z = Math.round(z * 2) / 2;
    const p = support(x, z);
    if (tool === "platform") {
      if (p) {
        selected = p.id;
        feedback("已选中平台，可修改位置、大小和高度。");
      } else if (level.platforms.length >= 80)
        feedback("最多放置80个平台，请先删除一个。");
      else if (Math.abs(x) > 100 || Math.abs(z) > 100)
        feedback("平台位置需在 -100 到 100 之间。");
      else {
        const next = { id: id("p"), x, z, y: 0, w: 3, d: 3, h: 0.6 };
        level.platforms.push(next);
        selected = next.id;
        feedback("已新增平台。选择起点、终点等工具，再点击平台放置。");
      }
    } else if (!p) feedback("请点击支撑平台；标记会自动取该平台顶面高度。");
    else if (tool === "spawn" || tool === "goal") {
      level[tool] = { x, y: p.y, z };
      feedback(`已设置${tool === "spawn" ? "起点" : "终点"}。`);
    } else {
      const list = tool === "coin" ? level.coins : level.checkpoints,
        existing = list.findIndex(
          (point) => Math.hypot(point.x - x, point.z - z) < 0.6,
        );
      if (existing >= 0) {
        list.splice(existing, 1);
        feedback("已移除此标记。");
      } else if (list.length >= (tool === "coin" ? 160 : 80))
        feedback("标记数量已达上限。");
      else {
        list.push({
          id: id(tool),
          x,
          y: p.y + (tool === "coin" ? 0.35 : 0),
          z,
        });
        feedback(
          `已放置${tool === "coin" ? "金币" : "存档点"}；再次点击可移除。`,
        );
      }
    }
    fields();
    draw();
  }
  canvas.addEventListener("pointerdown", (event) => {
    canvas.setPointerCapture(event.pointerId);
    gesture = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
  });
  canvas.addEventListener("pointermove", (event) => {
    if (gesture?.id !== event.pointerId) return;
    if (
      Math.hypot(
        event.clientX - gesture.startX,
        event.clientY - gesture.startY,
      ) > 6
    )
      gesture.moved = true;
    if (gesture.moved) {
      center.x -= (event.clientX - gesture.x) / scale;
      center.z -= (event.clientY - gesture.y) / scale;
      draw();
    }
    gesture.x = event.clientX;
    gesture.y = event.clientY;
  });
  canvas.addEventListener("pointerup", (event) => {
    if (gesture?.id !== event.pointerId) return;
    const moved = gesture.moved;
    gesture = null;
    if (!moved) {
      const r = canvas.getBoundingClientRect();
      place(
        center.x + (event.clientX - r.x - r.width / 2) / scale,
        center.z + (event.clientY - r.y - r.height / 2) / scale,
      );
    }
  });
  canvas.addEventListener("pointercancel", () => {
    gesture = null;
  });
  canvas.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      scale = Math.max(
        4,
        Math.min(60, scale * (event.deltaY > 0 ? 0.88 : 1.12)),
      );
      draw();
    },
    { passive: false },
  );
  q("zoom-in").onclick = () => {
    scale = Math.min(60, scale * 1.2);
    draw();
  };
  q("zoom-out").onclick = () => {
    scale = Math.max(4, scale / 1.2);
    draw();
  };
  for (const button of root.querySelectorAll("[data-tool]"))
    button.onclick = () => {
      tool = button.dataset.tool;
      for (const other of root.querySelectorAll("[data-tool]"))
        other.setAttribute("aria-pressed", String(other === button));
      feedback(
        tool === "platform"
          ? "点击空处放平台，点击已有平台选中。"
          : "点击平台放置标记。",
      );
    };
  for (const field of ["x", "z", "y", "w", "d", "h"])
    q(`platform-${field}`).onchange = () => {
      const p = platform();
      if (!p) return;
      const input = q(`platform-${field}`),
        value = Number(input.value);
      if (
        input.value === "" ||
        !Number.isFinite(value) ||
        value < Number(input.min) ||
        value > Number(input.max)
      ) {
        feedback(`数值需在 ${input.min} 到 ${input.max} 之间。`);
        fields();
        return;
      }
      const before = { ...p };
      p[field] = value;
      for (const point of [
        level.spawn,
        level.goal,
        ...level.coins,
        ...level.checkpoints,
      ])
        if (
          Math.abs(point.x - before.x) <= before.w / 2 &&
          Math.abs(point.z - before.z) <= before.d / 2 &&
          point.y >= before.y &&
          point.y <= before.y + 2.25
        ) {
          if (field === "x" || field === "z")
            point[field] += value - before[field];
          if (field === "y") point.y += value - before.y;
        }
      feedback("平台已更新；缩小平台后，请确认所有标记仍有支撑。");
      fields();
      draw();
    };
  q("editor-name").onchange = () => {
    level.name = q("editor-name").value.trim() || "我的微光路线";
  };
  q("level-theme").onchange = () => {
    level.theme = q("level-theme").value;
  };
  q("platform-delete").onclick = () => {
    const p = platform();
    if (!p) return;
    if (level.platforms.length === 1) {
      feedback("至少保留一个平台。");
      return;
    }
    const attached = (point) =>
      Math.abs(point.x - p.x) <= p.w / 2 &&
      Math.abs(point.z - p.z) <= p.d / 2 &&
      Math.abs(point.y - p.y) < 2.26;
    level.platforms = level.platforms.filter((other) => other !== p);
    level.coins = level.coins.filter((point) => !attached(point));
    level.checkpoints = level.checkpoints.filter((point) => !attached(point));
    const first = level.platforms[0];
    for (const key of ["spawn", "goal"])
      if (attached(level[key]))
        level[key] = { x: first.x, y: first.y, z: first.z };
    selected = first.id;
    feedback("平台及其标记已删除，受影响的起终点已移至第一个平台。");
    fields();
    draw();
  };
  const validated = () => {
    const result = validateLevel(level);
    if (!result.ok) {
      feedback(result.errors.join("；"));
      return null;
    }
    return result.level;
  };
  q("editor-save").onclick = () => {
    const valid = validated();
    if (!valid) return;
    if (storage && writeEditorLevel(storage, valid)) {
      savedState = "loaded";
      feedback("已保存到本机，可关闭后重新加载。");
    } else feedback("保存失败：浏览器不允许本地存储。当前路线仍可试玩。");
  };
  q("editor-load").onclick = () => {
    const loaded = storage ? readEditorLevel(storage) : null;
    if (!loaded) {
      feedback("没有可用的本地路线，或保存数据损坏。当前编辑内容已保留。");
      return;
    }
    level = loaded;
    selected = level.platforms.at(-1).id;
    feedback("已从本机重新加载。");
    fields();
    draw();
  };
  q("editor-play").onclick = () => {
    const valid = validated();
    if (valid) onPlay(valid);
  };
  q("editor-close").onclick = onClose;
  new ResizeObserver(() => {
    if (!root.hidden) draw();
  }).observe(canvas);
  return {
    open() {
      root.hidden = false;
      fields();
      draw();
      feedback(
        savedState === "invalid"
          ? "本机路线数据无效，已保留当前编辑内容；点击保存将用当前路线替换。"
          : savedState === "blocked"
            ? "本地存储不可用，当前路线仍可编辑试玩。"
            : savedState === "loaded"
              ? "已读取本机路线。点击空处添加平台，保存后可继续试玩。"
              : "点击空处添加平台；拖动预览平移。自创金币不增加余额。",
      );
    },
    currentLevel() {
      return validateLevel(level).level;
    },
  };
}
