import * as THREE from "three";
import { createMaterials, createAsset } from "./materials.js";
import { createAvatar } from "./avatar.js";
import {
  createObject,
  createEnemy,
  createBoss,
  createPickup,
  createProjectile,
} from "./models.js";
import { createScenery, createBackdrop, THEMES } from "./scenery.js";

// Exact simulation bounds plus screen-space breathing room, including a held teammate.
export function framePlayers(players, aspect = 1) {
  aspect = Math.max(0.2, aspect || 1);
  const active = players.filter((p) => (p.lives ?? 1) > 0);
  if (!active.length) active.push({ x: 2, y: 1, w: 0.8, h: 1.3 });
  const left = Math.min(...active.map((p) => p.x - (p.w ?? 0.8) / 2)) - 2,
    right = Math.max(...active.map((p) => p.x + (p.w ?? 0.8) / 2)) + 2;
  const bottom = Math.min(...active.map((p) => p.y)) - 2.2,
    top = Math.max(...active.map((p) => p.y + (p.h ?? 1.3))) + 3.5;
  const height = Math.max(
      10.5,
      11 / aspect,
      top - bottom,
      (right - left) / aspect,
    ),
    width = height * aspect,
    x = (left + right) / 2,
    y = (top + bottom) / 2;
  return {
    x,
    y,
    width,
    height,
    left: x - width / 2,
    right: x + width / 2,
    bottom: y - height / 2,
    top: y + height / 2,
  };
}
export function createQualityController(deviceDpr = 1) {
  const q = {
    mode: "auto",
    dpr: Math.min(deviceDpr, 1.6),
    shadows: true,
    frameMs: 0,
    samples: 0,
  };
  let slow = 0,
    warmup = 0, fast = 0;
  q.set = (mode) => {
    if (!["auto", "high", "low"].includes(mode))
      throw new RangeError("画质必须为 high、auto 或 low");
    if (mode === "auto" && q.mode === "auto") return;
    q.mode = mode;
    q.dpr =
      mode === "low"
        ? Math.min(deviceDpr, 1)
        : Math.min(deviceDpr, mode === "high" ? 2 : 1.6);
    q.shadows = mode !== "low";
    slow = 0;
    warmup = 0;
    fast = 0;
  };
  q.observe = (ms) => {
    if (!Number.isFinite(ms) || ms <= 0) return;
    q.frameMs = q.samples ? q.frameMs * 0.95 + ms * 0.05 : ms;
    q.samples++;
    warmup++;
    if (q.mode === "auto" && warmup > 30) {
      slow = ms > 28 ? slow + 1 : Math.max(0, slow - 2);
      fast = ms < 20 ? fast + 1 : 0;
      if (slow >= 60) {
        q.dpr = Math.max(0.5, q.dpr * 0.75);
        q.shadows = false;
        slow = 0;
        fast = 0;
      } else if (fast >= 240) {
        // A temporary slow period must not leave a fast device permanently blurry.
        const normal = Math.min(deviceDpr,1.6);
        q.dpr = Math.min(normal,q.dpr/.75);
        fast = 0;
      }
    }
  };
  return q;
}
function platformModel(p, pool, theme) {
  const a = createAsset(pool, `platform:${p.id}`),
    palette = THEMES[theme] ?? THEMES.street;
  const material =
    theme === "tree"
      ? "wood"
      : ["factory", "fatcat", "sewer"].includes(theme)
        ? "metal"
        : "wood";
  if (["branch", "pipe", "wire"].includes(p.kind)) {
    const tube = a.part(
      "cylinder",
      p.kind === "wire"
        ? "#657b79"
        : p.kind === "pipe"
          ? "#b8875e"
          : palette.surface,
      [1, 1, 1],
      [0, 0, 0],
      "platform-body",
      a.group,
      p.kind === "branch" ? "wood" : "metal",
    );
    tube.rotation.z = Math.PI / 2;
  } else
    a.part(
      "round",
      palette.surface,
      [1, 1, 1],
      [0, 0, 0],
      "platform-body",
      a.group,
      material,
    );
  a.part(
    "box",
    p.kind === "conveyor" ? "#495e63" : palette.accent,
    [1, 0.12, 1.04],
    [0, 0.46, 0],
    "walkable-top",
    a.group,
    material,
  );
  if (p.kind === "conveyor")
    for (let i = 0; i < 12; i++)
      a.part(
        "box",
        "#d8bd7c",
        [0.024, 0.13, 1.05],
        [-0.46 + i * 0.084, 0.46, 0],
        "belt-tread",
        a.group,
        "metal",
      );
  if (p.kind === "moving") {
    for (const x of [-0.43, 0.43])
      a.part(
        "sphere",
        "#edcc75",
        [0.09, 0.4, 0.13],
        [x, 0, 0.53],
        "lift-light",
      );
  }
  a.update = (p) => {
    a.group.position.set(p.x + p.w / 2, p.y - p.h / 2, 0);
    a.group.scale.set(p.w, p.h ?? 0.65, 1.5);
  };
  a.update(p);
  return a;
}
function hazardModel(h, pool) {
  const a = createAsset(pool, `hazard:${h.id}`);
  const w = h.w ?? 1,
    height = h.h ?? 1;
  if (h.kind === "spike") {
    const n = Math.max(1, Math.ceil(w / 0.35));
    for (let i = 0; i < n; i++)
      a.part(
        "cone",
        "#bdc8c3",
        [(w / n) * 0.9, height, 0.5],
        [-w / 2 + ((i + 0.5) * w) / n, height / 2, 0],
        "spike",
        a.group,
        "metal",
      );
  } else if (h.kind === "electric") {
    for (let i = 0; i < 5; i++) {
      const mesh = a.part(
        "round",
        "#d4f3a8",
        [(w / 5) * 0.4, height, 0.12],
        [-w / 2 + ((i + 0.5) * w) / 5, height / 2, 0.3],
        "arc",
        a.group,
        "plain",
        { emissive: "#bddd6a", emissiveIntensity: 0.7 },
      );
      mesh.rotation.z = i % 2 ? 0.25 : -0.25;
    }
  } else if (h.kind === "press") {
    a.part(
      "round",
      "#81999c",
      [w, height, 1.2],
      [0, height / 2, 0],
      "press",
      a.group,
      "metal",
    );
    a.part("box", "#e4b661", [w, 0.14, 1.24], [0, 0.08, 0], "press-warning");
  } else
    a.part(
      "round",
      h.kind === "water" ? "#65a9ad" : "#8bced0",
      [w, height, 0.65],
      [0, height / 2, 0],
      "falling-water",
      a.group,
      "plain",
      { transparent: true, opacity: 0.65 },
    );
  a.update = (e) => {
    a.group.position.set(e.x, e.y, 0);
    a.group.visible = e.active !== false;
  };
  return a;
}

// WebGL-independent scene graph: tests and the renderer consume the same objects.
export function createWorld() {
  const resources = createMaterials(),
    group = new THREE.Group(),
    entities = new Map();
  group.name = "rescue-world";
  let scenery = null,
    backdrop = null,
    level = null,
    stateIdentity = null,
    lastEvent = 0,
    disposed = false;
  const particles = [],
    dummy = new THREE.Object3D(),
    particleMesh = new THREE.InstancedMesh(
      resources.geometry("sphere"),
      resources.material("plain", "#ffe1a0", {
        emissive: "#d5a558",
        emissiveIntensity: 0.2,
      }),
      48,
    );
  particleMesh.name = "hit-particles";
  // At most 48 dynamic instances: bypass the stale sphere cached on empty frames.
  particleMesh.frustumCulled = false;
  particleMesh.count = 0;
  group.add(particleMesh);
  function clear() {
    entities.forEach((a) => a.dispose());
    entities.clear();
    scenery?.dispose();
    scenery = null;
    backdrop?.dispose();
    backdrop = null;
    particles.length = 0;
    particleMesh.count = 0;
  }
  function setLevel(next) {
    if (disposed) throw new Error("Scene has been disposed");
    if (level === next) return;
    clear();
    level = next;
    scenery = createScenery(next, resources);
    group.add(scenery.group);
    backdrop = createBackdrop(next, resources);
    group.add(backdrop.group);
    const exit = createAsset(resources, "exit-marker");
    exit.part(
      "torus",
      "#ead090",
      [1.0, 1.6, 0.25],
      [0, 1.0, 0],
      "exit-ring",
      exit.group,
      "metal",
    );
    exit.part("star", "#f4d888", [0.4, 0.4, 0.4], [0, 1.95, 0], "exit-star");
    exit.group.position.set(next.exit?.x ?? 0, next.exit?.y ?? 1, -0.5);
    entities.set("exit", exit);
    group.add(exit.group);
  }
  function sync(category, list, construct, time, keep = () => true) {
    const seen = new Set();
    for (const e of list ?? []) {
      if (!keep(e)) continue;
      const key = `${category}:${e.id}`;
      seen.add(key);
      let a = entities.get(key);
      if (!a) {
        a = construct(e);
        a.group.name = key;
        entities.set(key, a);
        group.add(a.group);
      }
      a.update?.(e, e.renderTime ?? time);
    }
    for (const [key, a] of entities)
      if (key.startsWith(`${category}:`) && !seen.has(key)) {
        a.dispose();
        entities.delete(key);
      }
  }
  function update(state, dt) {
    if (!level || level.id !== state.level.id) setLevel(state.level);
    if (stateIdentity !== state) {
      stateIdentity = state;
      lastEvent = 0;
      particles.length = 0;
    }
    const t = state.time ?? 0;
    sync(
      "platform",
      state.platforms ?? state.level.platforms,
      (p) => platformModel(p, resources, state.level.theme),
      t,
    );
    sync(
      "player",
      state.players,
      (p) => createAvatar(p.character, resources),
      t,
      (p) => p.lives > 0,
    );
    sync(
      "object",
      state.objects,
      (o) => createObject(o.kind, resources),
      t,
      (o) => o.active !== false,
    );
    sync(
      "enemy",
      state.enemies,
      (e) => createEnemy(e.kind, resources),
      t,
      (e) => e.alive !== false,
    );
    sync(
      "pickup",
      state.pickups,
      (p) => createPickup(p.kind, resources),
      t,
      (p) => !p.collected,
    );
    sync("hazard", state.hazards, (h) => hazardModel(h, resources), t);
    sync(
      "projectile",
      state.projectiles,
      (p) => createProjectile(p.kind, resources),
      t,
      (p) => (p.ttl ?? 1) > 0,
    );
    sync(
      "boss",
      state.boss ? [state.boss] : [],
      (b) => createBoss(b.kind, resources),
      t,
      (b) => !b.defeated,
    );
    for (const event of state.events ?? []) {
      const id = Number(String(event.id).split("-").at(-1));
      if (!Number.isFinite(id) || id <= lastEvent) continue;
      lastEvent = id;
      if (
        ["hit", "break", "collect", "bossHit", "damage"].includes(event.type)
      ) {
        const p =
          state.players.find((p) => p.id === event.player) ?? state.players[0];
        for (let i = 0; i < 6 && particles.length < 48; i++)
          particles.push({
            x: event.x ?? p.x,
            y: (event.y ?? p.y) + 0.7,
            vx: Math.cos(i * 2.4) * 2,
            vy: 1.3 + Math.sin(i) * 2,
            life: 0.45,
          });
      }
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy -= 7 * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
    particleMesh.count = particles.length;
    particles.forEach((p, i) => {
      dummy.position.set(p.x, p.y, 0.3);
      dummy.scale.setScalar((0.08 * p.life) / 0.45);
      dummy.updateMatrix();
      particleMesh.setMatrixAt(i, dummy.matrix);
    });
    particleMesh.instanceMatrix.needsUpdate = true;
  }
  return {
    group,
    resources,
    setLevel,
    update,
    get level() {
      return level;
    },
    get entityCount() {
      return entities.size;
    },
    get particleCount() {
      return particles.length;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      clear();
      particleMesh.dispose();
      group.clear();
      group.removeFromParent();
      resources.dispose();
    },
  };
}

export function createScene(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
  } catch (error) {
    throw new Error(
      "无法启动 WebGL 2 三维画面，请启用浏览器硬件加速或更换支持 WebGL 2 的浏览器。",
      { cause: error },
    );
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(),
    world = createWorld();
  scene.add(world.group);
  const camera = new THREE.OrthographicCamera(-8, 8, 5, -5, 0.1, 180);
  camera.position.set(0, 6, 34);
  const hemi = new THREE.HemisphereLight("#fff7df", "#827363", 2.7);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight("#fff0d5", 3.1);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.normalBias = 0.035;
  sun.shadow.bias = -0.00015;
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 80;
  scene.add(sun, sun.target);
  const rim = new THREE.DirectionalLight("#bfdcdd", 1.2);
  rim.position.set(-8, 8, -10);
  scene.add(rim);
  const q = createQualityController(
    Math.max(1, globalThis.devicePixelRatio ?? 1),
  );
  let width = 1,
    height = 1,
    frame = null,
    disposed = false,
    contextLost = false,
    renderMs = 0,
    frames = 0,
    currentTheme = null,
    lastRenderTime = null,
    bufferSize = null,
    shadowEnabled = null;
  const lost = (e) => {
    e.preventDefault();
    contextLost = true;
  };
  const restored = () => {
    contextLost = false;
    applyQuality(true);
  };
  canvas.addEventListener("webglcontextlost", lost);
  canvas.addEventListener("webglcontextrestored", restored);
  function applyQuality(force = false) {
    // setPixelRatio also calls setSize in Three; update the native buffer once.
    if (force || !bufferSize || bufferSize.width !== width || bufferSize.height !== height || bufferSize.dpr !== q.dpr) {
      renderer.setDrawingBufferSize(width, height, q.dpr);
      bufferSize = {width, height, dpr:q.dpr};
    }
    if (force || shadowEnabled !== q.shadows) {
      renderer.shadowMap.enabled = q.shadows;
      renderer.shadowMap.needsUpdate = true;
      shadowEnabled = q.shadows;
    }
  }
  function resize(w, h) {
    width = Math.max(1, w);
    height = Math.max(1, h);
    applyQuality();
  }
  function setLevel(level) {
    world.setLevel(level);
    frame = null;
    currentTheme = null;
  }
  function update(state, dt = 1 / 60, focusPlayer = null) {
    if (disposed || contextLost) return;
    world.update(state, Math.max(0, Math.min(dt, 0.1)));
    if (currentTheme !== state.level.theme) {
      currentTheme = state.level.theme;
      const palette = THEMES[currentTheme] ?? THEMES.street;
      scene.background = new THREE.Color(palette.sky);
      scene.fog = new THREE.Fog(palette.fog, 40, 95);
    }
    const selected = Number.isInteger(focusPlayer) ? state.players[focusPlayer] : null;
    const focused = selected?.lives===0 ? state.players.find(p=>p.lives>0)??selected : selected;
    const targets = state.players
      .filter((p) => p.lives > 0)
      .filter((p) => !focused || p.id===focused.id || p.id===focused.heldBy || p.heldBy===focused.id)
      .map((p) => ({ ...p }));
    if (state.boss?.active && !state.boss.defeated && (!focused ||
      Math.hypot(state.boss.x-focused.x,state.boss.y-focused.y)<12))
      targets.push({ ...state.boss, lives: 1 });
    const desired = framePlayers(targets, width / height);
    if (!frame) frame = desired;
    else {
      const k = 1 - Math.exp(-Math.max(dt, 0.001) * 8);
      const old = {
        x: frame.x + (desired.x - frame.x) * k,
        y: frame.y + (desired.y - frame.y) * k,
        width: frame.width + (desired.width - frame.width) * k,
        height: frame.height + (desired.height - frame.height) * k,
      };
      // Camera smoothing may never crop a fast player or a newly lifted teammate.
      const h = Math.max(
        old.height,
        2 * Math.max(old.y - desired.bottom, desired.top - old.y),
        (2 * Math.max(old.x - desired.left, desired.right - old.x)) /
          (width / height),
      );
      frame = { x: old.x, y: old.y, height: h, width: (h * width) / height };
    }
    camera.left = -frame.width / 2;
    camera.right = frame.width / 2;
    camera.top = frame.height / 2;
    camera.bottom = -frame.height / 2;
    camera.updateProjectionMatrix();
    camera.position.set(frame.x, frame.y + 3, 34);
    camera.lookAt(frame.x, frame.y, 0);
    const shadowRadius = Math.min(24, Math.max(12, frame.width * 0.6));
    sun.position.set(frame.x - 6, frame.y + 12, 15);
    sun.target.position.set(frame.x, frame.y, 0);
    Object.assign(sun.shadow.camera, {
      left: -shadowRadius,
      right: shadowRadius,
      top: shadowRadius,
      bottom: -shadowRadius,
    });
    sun.shadow.camera.updateProjectionMatrix();
    // Whole landmark culling avoids traversal/draw overhead on 400-unit stages.
    for (const child of world.group.children) {
      if (child.name === "scenery") {
        for (const d of child.children) {
          const half = d.scale.x * 0.7;
          d.visible =
            Math.abs(d.position.x - frame.x) < frame.width / 2 + half + 5 &&
            Math.abs(d.position.y + d.scale.y / 2 - frame.y) <
              frame.height / 2 + d.scale.y / 2 + 5;
        }
      } else if (
        child.name !== "hit-particles" &&
        child.name !== "backdrop" &&
        !child.name.startsWith("player:") &&
        !child.name.startsWith("boss:") &&
        !child.name.startsWith("hazard:")
      ) {
        child.visible =
          Math.abs(child.position.x - frame.x) <
            frame.width / 2 + Math.max(3, child.scale.x / 2) + 4 &&
          Math.abs(child.position.y - frame.y) <
            frame.height / 2 + Math.max(3, child.scale.y / 2) + 4;
      }
    }
    const start = performance.now();
    renderer.render(scene, camera);
    renderMs = performance.now() - start;
    frames++;
    const oldDpr = q.dpr,
      oldShadow = q.shadows;
    const end = performance.now();
    q.observe(
      Math.max(
        renderMs,
        lastRenderTime === null
          ? renderMs
          : Math.min(250, end - lastRenderTime),
      ),
    );
    lastRenderTime = end;
    if (oldDpr !== q.dpr || oldShadow !== q.shadows) applyQuality();
  }
  function diagnostics() {
    return {
      webgl: !contextLost,
      contextLost,
      quality: q.mode,
      dpr: q.dpr,
      shadows: q.shadows,
      frameMs: Number(q.frameMs.toFixed(2)),
      renderMs: Number(renderMs.toFixed(2)),
      fps: q.frameMs ? Number((1000 / q.frameMs).toFixed(1)) : 0,
      frames,
      drawCalls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      geometries: renderer.info.memory.geometries,
      textures: renderer.info.memory.textures,
      resources: world.resources.stats(),
      entities: world.entityCount,
      particles: world.particleCount,
      viewport: { width, height },
      camera: frame ? { ...frame } : null,
    };
  }
  return {
    setLevel,
    update,
    resize,
    setQuality(mode) {
      q.set(mode);
      applyQuality();
    },
    diagnostics,
    dispose() {
      if (disposed) return;
      disposed = true;
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
      world.dispose();
      sun.shadow.map?.dispose();
      renderer.dispose();
      scene.clear();
    },
  };
}
