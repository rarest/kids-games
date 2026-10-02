import * as THREE from "three";
import { PLAYER_RADIUS } from "./core.js";
import { createAvatar } from "./avatar.js";
import { createScenery } from "./scenery.js";
import { createLighting } from "./lighting.js";

const THEMES = {
  sakura: { ground: 0x7fad78, top: 0xfce9de, edge: 0xb88c92, accent: 0xf18eb4 },
  flowers: {
    ground: 0x76a879,
    top: 0xf9e8bf,
    edge: 0xb5a080,
    accent: 0xe8a452,
  },
  city: { ground: 0x8faaa5, top: 0xd6e5e8, edge: 0x637e88, accent: 0x56c5ce },
  cabin: { ground: 0x6d9472, top: 0xe4be8c, edge: 0x80654c, accent: 0xe6b266 },
};
export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  let renderMs = 0,
    frameMs = 16,
    frameCount = 0,
    slowFrames = 0;
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 220);
  scene.background = new THREE.Color(0xc9e4ef);
  scene.fog = new THREE.Fog(0xc9e4ef, 35, 115);
  const hemi = new THREE.HemisphereLight(0xecf8ff, 0x53665a, 2.4);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe9d0, 3.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, {
    left: -18,
    right: 18,
    top: 18,
    bottom: -18,
    near: 0.1,
    far: 65,
  });
  sun.shadow.normalBias = 0.04;
  sun.shadow.bias = -0.0001;
  scene.add(sun, sun.target);
  const avatar = createAvatar();
  scene.add(avatar.group);
  const lighting = createLighting(scene, sun, hemi);
  lighting.update(2, new THREE.Vector3());
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(PLAYER_RADIUS * 1.8, 24),
    new THREE.MeshBasicMaterial({
      color: 0x263b34,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  scene.add(shadow);
  let level = null,
    lastPlayer = null,
    currentPlatform = 0,
    autoCamera = true,
    world = new THREE.Group(),
    scenery = null,
    yaw = 0,
    pitch = 0.56,
    time = 0;
  scene.add(world);
  const platforms = [],
    coins = [],
    checkpoints = [],
    target = new THREE.Vector3(),
    desired = new THREE.Vector3(),
    direction = new THREE.Vector3(),
    ray = new THREE.Raycaster();
  const disposeWorld = () => {
    const geometries = new Set(),
      materials = new Set();
    world.traverse((o) => {
      if (o.geometry) geometries.add(o.geometry);
      if (o.material)
        for (const m of Array.isArray(o.material) ? o.material : [o.material])
          materials.add(m);
    });
    for (const g of geometries) g.dispose();
    for (const m of materials) m.dispose();
    scene.remove(world);
  };
  function setLevel(next) {
    disposeWorld();
    world = new THREE.Group();
    scene.add(world);
    level = next;
    lastPlayer = null;
    currentPlatform = 0;
    autoCamera = true;
    platforms.length = 0;
    coins.length = 0;
    checkpoints.length = 0;
    const palette = THEMES[level.theme],
      box = new THREE.BoxGeometry(1, 1, 1),
      mats = new Map();
    const add = (geometry, color, x, y, z, sx = 1, sy = 1, sz = 1) => {
      if (!mats.has(color))
        mats.set(
          color,
          new THREE.MeshStandardMaterial({ color, roughness: 0.8 }),
        );
      const m = new THREE.Mesh(geometry, mats.get(color));
      m.position.set(x, y, z);
      m.scale.set(sx, sy, sz);
      m.castShadow = true;
      m.receiveShadow = true;
      world.add(m);
      return m;
    };
    const dummy = new THREE.Object3D();
    const platformBatch = (color, items, castShadow) => {
      const mesh = new THREE.InstancedMesh(
        box,
        new THREE.MeshStandardMaterial({ color, roughness: 0.8 }),
        items.length,
      );
      mesh.castShadow = castShadow;
      mesh.receiveShadow = true;
      items.forEach((item, i) => {
        dummy.position.set(item.x, item.y, item.z);
        dummy.scale.set(item.w, item.h, item.d);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      world.add(mesh);
      return mesh;
    };
    platforms.push(
      platformBatch(
        palette.edge,
        level.platforms.map((p) => ({ ...p, y: p.y - p.h / 2 })),
        true,
      ),
    );
    platformBatch(
      palette.top,
      level.platforms.map((p) => ({ ...p, y: p.y + 0.014, h: 0.028 })),
      false,
    );
    platformBatch(
      palette.accent,
      level.platforms.flatMap((p) =>
        [-1, 1].map((side) => ({
          x: p.x,
          y: p.y + 0.035,
          z: p.z + side * (p.d / 2 - 0.1),
          w: p.w - 0.16,
          h: 0.02,
          d: 0.07,
        })),
      ),
      false,
    );
    scenery = createScenery(world, level, palette);
    const coinGeometry = new THREE.TorusGeometry(0.18, 0.065, 6, 12);
    for (const coin of level.coins)
      coins.push({
        m: add(coinGeometry, 0xf5c54f, coin.x, coin.y, coin.z),
        coin,
      });
    const checkpointGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.04, 20);
    for (const point of level.checkpoints) {
      const m = add(
        checkpointGeometry,
        0x64c2b2,
        point.x,
        point.y + 0.035,
        point.z,
      );
      m.material = m.material.clone();
      checkpoints.push({ m, point });
      add(
        box,
        0xefeede,
        point.x - 0.5,
        point.y + 0.75,
        point.z,
        0.05,
        1.5,
        0.05,
      );
      add(
        box,
        0x72dcca,
        point.x - 0.22,
        point.y + 1.35,
        point.z,
        0.55,
        0.34,
        0.04,
      );
    }
    const g = level.goal;
    for (const x of [-0.7, 0.7])
      add(box, palette.accent, g.x + x, g.y + 1.125, g.z, 0.16, 2.25, 0.2);
    add(box, palette.accent, g.x, g.y + 2.25, g.z, 1.56, 0.2, 0.2);
    const glow = add(
      new THREE.TorusGeometry(0.52, 0.055, 8, 24),
      0xffe8a6,
      g.x,
      g.y + 1.3,
      g.z,
    );
    glow.material.emissive.set(0xe4a648);
    glow.material.emissiveIntensity = 0.5;
    resetCamera();
  }
  function resetCamera() {
    autoCamera = true;
    let index = 0;
    if (lastPlayer) {
      const distances = level.platforms.map(
        (p) =>
          Math.hypot(p.x - lastPlayer.x, p.z - lastPlayer.z) +
          Math.abs(p.y - lastPlayer.y),
      );
      index = distances.indexOf(Math.min(...distances));
    }
    const current = level?.platforms[index],
      next = level?.platforms[index + 1];
    yaw = next ? Math.atan2(next.x - current.x, next.z - current.z) : yaw;
    pitch = 0.56;
  }
  function resize() {
    const r = canvas.getBoundingClientRect();
    renderer.setSize(Math.max(1, r.width), Math.max(1, r.height), false);
    camera.aspect = r.width / Math.max(1, r.height);
    camera.updateProjectionMatrix();
  }
  function update(state, dt, mode, inputActive = false) {
    if (!level) return;
    time += Math.min(dt, 0.05);
    const p = state.player,
      home = ["home", "shop", "levels", "editor"].includes(mode);
    lastPlayer = p;
    if (p.grounded) {
      const support = level.platforms.findIndex(
        (platform) =>
          Math.abs(p.y - platform.y) < 0.08 &&
          Math.abs(p.x - platform.x) <= platform.w / 2 &&
          Math.abs(p.z - platform.z) <= platform.d / 2,
      );
      if (support >= 0) currentPlatform = support;
    }
    const landing = level.platforms[currentPlatform + 1];
    if (
      !home &&
      autoCamera &&
      !inputActive &&
      landing &&
      p.grounded &&
      Math.hypot(p.vx, p.vz) < 0.2
    ) {
      const current = level.platforms[currentPlatform];
      const routeYaw = Math.atan2(landing.x - current.x, landing.z - current.z);
      const turn = Math.atan2(
        Math.sin(routeYaw - yaw),
        Math.cos(routeYaw - yaw),
      );
      yaw += turn * (1 - Math.exp(-dt * 5));
    }
    if ((mode === "home" || mode === "playing") && dt > 0)
      frameMs = frameMs * 0.85 + dt * 1000 * 0.15;
    avatar.update(p, time, home);
    scenery.update(p, dt, time);
    let floor = -2.65;
    for (const platform of level.platforms)
      if (
        Math.abs(p.x - platform.x) <= platform.w / 2 &&
        Math.abs(p.z - platform.z) <= platform.d / 2 &&
        platform.y <= p.y + 0.02
      )
        floor = Math.max(floor, platform.y);
    shadow.position.set(p.x, floor + 0.055, p.z);
    shadow.material.opacity = 0.25 / Math.max(1, p.y - floor + 1);
    shadow.scale.setScalar(Math.min(1.8, 1 + (p.y - floor) * 0.1));
    for (const { m, coin } of coins) {
      m.visible = !state.collected.has(coin.id);
      m.rotation.y = time * 2;
      m.position.y = coin.y + Math.sin(time * 3) * 0.035;
    }
    for (const { m, point } of checkpoints)
      m.material.color.set(
        state.checkpoint.id === point.id ? 0xffd889 : 0x64c2b2,
      );
    const first = level.platforms[1];
    const firstYaw = first
      ? Math.atan2(first.x - level.spawn.x, first.z - level.spawn.z)
      : 0;
    const cameraYaw = home ? yaw - firstYaw : yaw;
    avatar.group.rotation.y = home ? Math.PI + cameraYaw : p.yaw;
    const homeOffset = Math.min(2.4, camera.aspect * 1.6);
    const lookAhead = !home && autoCamera && landing ? 0.15 : 0;
    target.set(
      p.x + (home ? homeOffset : (landing?.x - p.x || 0) * lookAhead),
      p.y + 0.9,
      p.z + (landing?.z - p.z || 0) * lookAhead,
    );
    const distance = home ? 9 : camera.aspect < 0.75 ? 17 : 10.5;
    desired.set(
      target.x - Math.sin(cameraYaw) * distance * Math.cos(pitch),
      target.y + Math.sin(pitch) * distance,
      target.z - Math.cos(cameraYaw) * distance * Math.cos(pitch),
    );
    direction.copy(desired).sub(target).normalize();
    ray.set(target, direction);
    ray.far = target.distanceTo(desired);
    const hit = ray.intersectObjects(platforms, false)[0];
    if (hit && hit.distance > 1) {
      const obstruction = level.platforms[hit.instanceId];
      desired.y = Math.max(desired.y, (obstruction?.y ?? target.y) + 3);
    }
    camera.position.copy(desired);
    camera.lookAt(target);
    lighting.update(dt, avatar.group.position);
  }
  resize();
  return {
    setLevel,
    setSkin: avatar.setSkin,
    setOutfit: avatar.setOutfit,
    setTimeOfDay: lighting.set,
    update,
    render() {
      const start = performance.now();
      renderer.render(scene, camera);
      const duration = performance.now() - start;
      renderMs = frameCount++ ? renderMs * 0.9 + duration * 0.1 : duration;
      if (frameCount > 8 && Math.max(renderMs, frameMs) > 35) slowFrames++;
      else slowFrames = 0;
      if (slowFrames >= 12 && renderer.getPixelRatio() > 0.65) {
        renderer.setPixelRatio(Math.max(0.65, renderer.getPixelRatio() * 0.8));
        resize();
        slowFrames = 0;
      }
      if (slowFrames >= 12 && sun.shadow.mapSize.x > 512) {
        sun.shadow.map?.dispose();
        sun.shadow.map = null;
        sun.shadow.mapSize.set(512, 512);
        renderer.shadowMap.needsUpdate = true;
        slowFrames = 0;
      }
    },
    resize,
    orbit(dx, dy) {
      autoCamera = false;
      yaw -= dx * 0.007;
      pitch = THREE.MathUtils.clamp(pitch + dy * 0.004, 0.2, 1.15);
    },
    resetCamera,
    info() {
      return {
        yaw,
        theme: level?.theme,
        ...lighting.info(),
        grassResponse: scenery?.grassResponse() ?? 0,
        outfit: avatar.outfit(),
        triangles: renderer.info.render.triangles,
        drawCalls: renderer.info.render.calls,
        resources: {
          geometries: renderer.info.memory.geometries,
          textures: renderer.info.memory.textures,
        },
        dpr: renderer.getPixelRatio(),
        renderMs,
        frameMs,
        shadowSize: sun.shadow.mapSize.x,
        cameraDistance: camera.position.distanceTo(target),
      };
    },
    dispose() {
      disposeWorld();
      avatar.dispose();
      shadow.geometry.dispose();
      shadow.material.dispose();
      sun.shadow.dispose();
      renderer.dispose();
    },
  };
}
