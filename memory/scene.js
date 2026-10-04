import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { COLORS, createModelFactory, editionSegments, roundedSlab } from './models.js';
import { faceUp, levelSpec } from './core.js';
import { CARD_STEP_X as X, CARD_STEP_Z as Z, CAMERA_SLOPE, fitBoard } from './layout.js';

const THEMES = [
  { name: '阳光花园', sky: 0xe8f0dd, ground: 0xb5c4a0, leaf: 0x799f7d, blossom: 0xf3ceb4, back: 0x759a85, night: false },
  { name: '樱花庭院', sky: 0xf0e3e8, ground: 0xc9b5b4, leaf: 0xc498aa, blossom: 0xf2cad7, back: 0xa4829b, night: false },
  { name: '水晶温室', sky: 0xddebe9, ground: 0xa7c3bb, leaf: 0x6f9e96, blossom: 0xabd5d5, back: 0x608e9a, night: false },
  { name: '月光池塘', sky: 0x363e59, ground: 0x59697d, leaf: 0x768b9d, blossom: 0xc6bfdc, back: 0x777994, night: true },
  { name: '星云花园', sky: 0xa8afca, ground: 0x9a97b2, leaf: 0x9490b7, blossom: 0xd7c7e5, back: 0x9481b2, night: false },
];
export const FEEDBACK_HEIGHT = .28;
export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.35));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.18;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;
  const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-5, 5, 5, -5, .1, 300);
  const hemi = new THREE.HemisphereLight(0xfff8e8, 0x718875, 2.5); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffedcf, 3.5); sun.castShadow = true; sun.shadow.mapSize.set(768, 768);
  Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: .1, far: 80 }); sun.shadow.normalBias = .045;
  scene.add(sun, sun.target);
  const factory = createModelFactory(), bodyGeo = roundedSlab(1.72, 2.13, .14), faceGeo = roundedSlab(1.6, 2.01, .012, .15);
  const compactFactory = createModelFactory({ compact: true });
  const bodyMaterial = factory.material(0xdfcda9), frontMaterial = factory.material(0xfff8e9);
  const backMaterial = new THREE.MeshStandardMaterial({ color: THEMES[0].back, roughness: .7 });
  const emblemGeo = new THREE.TorusGeometry(.29, .025, 6, 20); emblemGeo.rotateX(Math.PI / 2);
  const petalGeo = new THREE.OctahedronGeometry(.13);
  const instances = [bodyGeo, faceGeo, faceGeo, emblemGeo, petalGeo].map((g, i) => {
    const mesh = new THREE.InstancedMesh(g, [bodyMaterial, frontMaterial, backMaterial, factory.material(0xe3c782, true), factory.material(0xe3c782, true)][i], 2010);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.frustumCulled = false; mesh.count = 0;
    mesh.castShadow = i === 0; mesh.receiveShadow = i < 3; scene.add(mesh); return mesh;
  });
  const detailedCardGeometries = instances.map(mesh => mesh.geometry);
  const compactEmblem = new THREE.TorusGeometry(.29, .025, 3, 8); compactEmblem.rotateX(Math.PI / 2);
  const compactCardGeometries = [new THREE.BoxGeometry(1.72, .14, 2.13), new THREE.BoxGeometry(1.6, .012, 2.01), new THREE.BoxGeometry(1.6, .012, 2.01), compactEmblem, petalGeo];
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), vec = new THREE.Vector3(), dummy = new THREE.Object3D();
  let game = null, theme = 0, center = { x: 0, z: 0 }, span = 7, overviewMode = false, home = true;
  let renderDirty = true, lastFaces = '', animating = false;
  const active = new Map(), effects = [];
  const symbolTemplates = new Map(), symbolBatches = new Map();
  const modelMatrix = new THREE.Matrix4(), segmentMatrix = new THREE.Matrix4();
  const accentMaterial = factory.material(0xffffff), accentColor = new THREE.Color();
  let editionBatch = null;
  let decoration = new THREE.Group(); scene.add(decoration);
  function cardPosition(index) { return { x: ((index % game.columns) - (game.columns - 1) / 2) * X, z: Math.floor(index / game.columns) * Z }; }
  function addMesh(geo, color, x, y, z, sx = 1, sy = sx, sz = sx, rotation = null) {
    const m = new THREE.Mesh(geo, factory.material(color)); m.position.set(x, y, z); m.scale.set(sx, sy, sz);
    if (rotation) m.rotation.set(...rotation); m.castShadow = true; m.receiveShadow = true; decoration.add(m); return m;
  }
  function environment() {
    decoration.traverse(o => { if (o.userData.ownedGeometry) o.geometry.dispose(); }); scene.remove(decoration); decoration = new THREE.Group(); scene.add(decoration);
    const t = THEMES[theme], width = game.columns * X + 5, rows = Math.ceil(game.cards.length / game.columns), depth = Math.max(9, rows * Z + 5);
    scene.background = new THREE.Color(t.sky); hemi.intensity = t.night ? 1.7 : 2.5; sun.intensity = t.night ? 2 : 3.5;
    sun.color.set(t.night ? 0xc6d5fa : 0xffedcf); backMaterial.color.set(t.back);
    addMesh(factory.box, t.ground, 0, -.55, (rows - 1) * Z / 2, width + 12, .2, depth + 10);
    const slab = roundedSlab(width, depth, .35, .55), desk = addMesh(slab, t.night ? 0x9b9da9 : 0xe3d8bf, 0, -.24, (rows - 1) * Z / 2); desk.userData.ownedGeometry = true;
    // Inset walkway and rails are geometry, with a restrained brass trim.
    for (const side of [-1, 1]) {
      addMesh(factory.box, 0xcbb98c, side * (width / 2 - .16), -.02, (rows - 1) * Z / 2, .035, .04, depth - .65);
      for (let row = -1; row < rows + 2; row += 5) {
        const x = side * (width / 2 + 1.1), z = row * Z;
        addMesh(factory.cylinder, 0xc59e7d, x, -.16, z, .48, .7, .48);
        addMesh(factory.cylinder, 0xe1c6a2, x, .19, z, .55, .12, .55);
        const stem = addMesh(factory.cylinder, 0x7f795d, x, 1, z, .09, 1.5, .09); stem.rotation.z = side * .1;
        for (let k = 0; k < 5; k++) {
          const a = k * 2.4; addMesh(factory.sphere, k % 2 ? t.blossom : t.leaf, x + Math.sin(a) * .36, 1.75 + Math.cos(a) * .22, z + Math.cos(a) * .25, .6, .42, .55);
        }
        for (let k = 0; k < 4; k++) { const a = k * 1.57; const grass = addMesh(factory.cone, t.leaf, x + Math.sin(a) * .45, .4, z + Math.cos(a) * .45, .14, .6, .12); grass.rotation.z = Math.sin(a) * .3; }
      }
    }
    for (let i = 0; i < 3; i++) {
      const x = -width / 2 + .7 + i * 1.25, z = -2.8;
      const flower = factory.build(theme === 2 ? 9 : 1); flower.position.set(x, 0, z); flower.scale.setScalar(.75); flower.userData.flower = true; decoration.add(flower);
    }
    if (theme >= 3) {
      const pond = addMesh(factory.cylinder, 0x8da9bc, width / 2 + 2.1, -.38, 3, 2, .04, 3); pond.castShadow = false;
      for (let i = 0; i < 4; i++) addMesh(factory.cylinder, t.leaf, width / 2 + 1.3 + i * .42, -.34, 2.4 + Math.sin(i) * .5, .27, .018, .22);
    }
    // Static scenery is batched by material so long boards do not multiply draw calls.
    decoration.updateMatrixWorld(true);
    const batches = new Map(), owned = new Set();
    decoration.traverse(o => {
      if (!o.isMesh) return;
      const copy = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()).applyMatrix4(o.matrixWorld);
      const batch = batches.get(o.material) || []; batch.push(copy); batches.set(o.material, batch);
      if (o.userData.ownedGeometry || o.parent.userData.flower) owned.add(o.geometry);
    });
    scene.remove(decoration); decoration = new THREE.Group(); scene.add(decoration);
    for (const [mat, geos] of batches) {
      const mesh = new THREE.Mesh(mergeGeometries(geos), mat); geos.forEach(g => g.dispose());
      mesh.castShadow = true; mesh.receiveShadow = true; mesh.userData.ownedGeometry = true; decoration.add(mesh);
    }
    owned.forEach(g => g.dispose());
    renderer.shadowMap.needsUpdate = true;
  }
  function clearObjects() {
    renderDirty = true;
    active.clear();
    for (const batch of symbolBatches.values()) for (const mesh of batch) { scene.remove(mesh); mesh.dispose(); }
    symbolBatches.clear();
    if (editionBatch) { scene.remove(editionBatch); editionBatch.dispose(); editionBatch = null; }
  }
  function symbolBatch(symbol, compact) {
    const family = symbol % 16;
    const key = `${compact ? 'compact' : 'detailed'}:${family}`, maker = compact ? compactFactory : factory;
    if (!symbolTemplates.has(key)) symbolTemplates.set(key, maker.build(family, { edition: false }));
    if (!symbolBatches.has(key)) {
      const capacity = game.cards.filter(c => c.symbol % 16 === family).length;
      const batch = symbolTemplates.get(key).children.map(part => {
        const accent = part.material === maker.material(COLORS[0]);
        const mesh = new THREE.InstancedMesh(part.geometry, accent ? accentMaterial : part.material, capacity);
        mesh.userData.accent = accent;
        mesh.count = 0; mesh.frustumCulled = false; mesh.castShadow = true; mesh.receiveShadow = true;
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(mesh); return mesh;
      });
      symbolBatches.set(key, batch);
    }
    return symbolBatches.get(key);
  }
  function drawSymbol(symbol, position, angle, compact) {
    dummy.position.set(position.x, .12, position.z); dummy.rotation.set(angle, 0, 0); dummy.scale.setScalar(.9);
    dummy.translateY(.04); dummy.updateMatrix(); modelMatrix.copy(dummy.matrix);
    accentColor.setHex(COLORS[Math.floor(symbol / 16) % COLORS.length]);
    for (const mesh of symbolBatch(symbol, compact)) {
      if (mesh.userData.accent) mesh.setColorAt(mesh.count, accentColor);
      mesh.setMatrixAt(mesh.count++, modelMatrix);
    }
    const segments = editionSegments(symbol);
    if (segments.length && !editionBatch) {
      editionBatch = new THREE.InstancedMesh(factory.box, factory.material(0x617356, true), game.cards.length * 21);
      editionBatch.count = 0; editionBatch.frustumCulled = false; editionBatch.castShadow = true;
      editionBatch.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(editionBatch);
    }
    for (const [x, y, z, w, h] of segments) {
      dummy.position.set(x, y, z); dummy.rotation.set(0, 0, 0); dummy.scale.set(w, .028, h); dummy.updateMatrix();
      segmentMatrix.multiplyMatrices(modelMatrix, dummy.matrix); editionBatch.setMatrixAt(editionBatch.count++, segmentMatrix);
    }
  }
  function resize() {
    const width = canvas.clientWidth, height = canvas.clientHeight;
    if (width < 1 || height < 1) return;
    renderer.setSize(width, height, false);
    if (overviewMode && game) ({ span, center } = fitBoard({ count: game.cards.length, columns: game.columns, width, height }));
    else span = Math.min(game ? game.columns * X + 3 : 7, Math.max(6.4, width / 90 * X));
    updateCamera();
  }
  function updateCamera() {
    renderDirty = true;
    const aspect = Math.max(.2, canvas.clientWidth / Math.max(1, canvas.clientHeight));
    camera.left = -span / 2; camera.right = span / 2; camera.top = span / aspect / 2; camera.bottom = -camera.top;
    // Overview frusta can be taller than 100 units. Keep every ray origin above
    // the table and extend the far plane instead of clipping the bottom rows.
    const altitude = Math.max(25, camera.top + 25);
    camera.far = altitude * 4 + 300;
    camera.position.set(center.x, altitude, center.z + altitude * CAMERA_SLOPE); camera.lookAt(center.x, 0, center.z); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    sun.position.set(center.x - 8, 20, center.z - 9); sun.target.position.set(center.x, 0, center.z); sun.target.updateMatrixWorld(); renderer.shadowMap.needsUpdate = true;
  }
  function planePoint(nx, ny) { ray.setFromCamera(new THREE.Vector2(nx, ny), camera); return ray.ray.intersectPlane(plane, new THREE.Vector3()); }
  function bounds() {
    const a = planePoint(-1, -1), b = planePoint(1, 1);
    return { minX: Math.min(a.x, b.x) - 2, maxX: Math.max(a.x, b.x) + 2, minZ: Math.min(a.z, b.z) - 3, maxZ: Math.max(a.z, b.z) + 2 };
  }
  function focus(index) { const p = cardPosition(index); center = { x: p.x, z: p.z }; overviewMode = false; resize(); }
  function setGame(next, isHome = false) {
    clearObjects(); game = next; home = isHome; theme = levelSpec(next.level).theme; overviewMode = !home;
    const rows = Math.ceil(game.cards.length / game.columns);
    center = { x: 0, z: rows <= 5 ? (rows - 1) * Z / 2 : 2.2 };
    if (home && canvas.clientWidth > 700) center.x = -3.2;
    if (home && canvas.clientWidth <= 700) center.z = -2.2;
    environment(); resize();
  }
  function pan(dx, dy) {
    if (!game || home) return;
    if (overviewMode) { overviewMode = false; resize(); }
    const rows = Math.ceil(game.cards.length / game.columns), scale = span / canvas.clientWidth;
    center.x = THREE.MathUtils.clamp(center.x - dx * scale, -game.columns * X / 2 + 1, game.columns * X / 2 - 1);
    center.z = THREE.MathUtils.clamp(center.z - dy * scale * 1.1, -1.8, (rows - 1) * Z + 1.8);
    updateCamera();
  }
  function overview() {
    overviewMode = !overviewMode;
    if (overviewMode) resize();
    else focus(0);
  }
  function reset() { overviewMode = true; resize(); }
  function pick(clientX, clientY) {
    if (!game || home) return null;
    const r = canvas.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2((clientX - r.left) / r.width * 2 - 1, -(clientY - r.top) / r.height * 2 + 1), camera);
    const p = ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -.1), vec); if (!p) return null;
    const col = Math.round(p.x / X + (game.columns - 1) / 2), row = Math.round(p.z / Z), index = row * game.columns + col;
    if (col < 0 || col >= game.columns || row < 0 || !game.cards[index]) return null;
    const location = cardPosition(index); return Math.abs(location.x - p.x) <= .86 && Math.abs(location.z - p.z) <= 1.07 ? index : null;
  }
  function pulse(indexes) {
    renderDirty = true;
    for (const index of indexes) {
      if (effects.length >= 6) break;
      const geo = new THREE.RingGeometry(.45, .5, 24); geo.rotateX(-Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({ color: 0xdaba77, transparent: true, opacity: .65, depthWrite: false });
      const ring = new THREE.Mesh(geo, mat), p = cardPosition(index); ring.position.set(p.x, FEEDBACK_HEIGHT, p.z); scene.add(ring); effects.push({ ring, life: .7 });
    }
  }
  function render(next, dt) {
    game = next; if (!game) return;
    const faces = game.cards.map((_, index) => faceUp(game, index) ? '1' : '0').join('');
    // The table is static between flips: keep the last frame instead of repeatedly
    // drawing hundreds of unchanged sculptures during the preview or a pause.
    if (!renderDirty && faces === lastFaces && (dt === 0 || (!animating && !effects.length))) return;
    animating = false;
    const b = bounds(), visible = [], live = new Set(), rect = canvas.getBoundingClientRect();
    const small = canvas.clientWidth * 1.72 / span < 36;
    const cardGeometries = small ? compactCardGeometries : detailedCardGeometries;
    for (const [i, mesh] of instances.entries()) mesh.geometry = cardGeometries[i];
    for (const batch of symbolBatches.values()) for (const mesh of batch) mesh.count = 0;
    if (editionBatch) editionBatch.count = 0;
    let count = 0;
    for (let index = 0; index < game.cards.length; index++) {
      const p = cardPosition(index); if (p.x < b.minX || p.x > b.maxX || p.z < b.minZ || p.z > b.maxZ) continue;
      const up = faceUp(game, index);
      let item = active.get(index);
      if (!item) { item = { angle: up ? 0 : Math.PI }; active.set(index, item); }
      let angle = up ? 0 : Math.PI;
      if (item) {
        live.add(index); const step = Math.min(1, dt * 16); item.angle += (angle - item.angle) * step;
        if (Math.abs(angle - item.angle) < .002) item.angle = angle;
        else animating = true;
        angle = item.angle;
        const shown = angle < Math.PI / 2;
        if (item.shown !== shown) renderer.shadowMap.needsUpdate = true;
        item.shown = shown;
        if (shown) drawSymbol(game.cards[index].symbol, p, angle, small);
      }
      for (let i = 0; i < instances.length; i++) {
        dummy.position.set(p.x, .13, p.z); dummy.rotation.set(angle, 0, 0); dummy.scale.set(1, 1, 1);
        if (i === 1) dummy.translateY(.085);
        if (i === 2) dummy.translateY(-.085);
        if (i >= 3) { dummy.translateY(-.105); if (i === 4) dummy.scale.set(.85, .25, .85); }
        dummy.updateMatrix(); instances[i].setMatrixAt(count, dummy.matrix);
      }
      const screen = new THREE.Vector3(p.x, .25, p.z).project(camera);
      visible.push({ index, x: rect.left + (screen.x + 1) / 2 * rect.width, y: rect.top + (1 - screen.y) / 2 * rect.height }); count++;
    }
    for (const index of active.keys()) if (!live.has(index)) active.delete(index);
    for (const mesh of instances) { mesh.count = count; mesh.instanceMatrix.needsUpdate = true; }
    for (const batch of symbolBatches.values()) for (const mesh of batch) {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
    if (editionBatch) editionBatch.instanceMatrix.needsUpdate = true;
    // Dense overviews retain their raised symbols, with shadow work disabled at tiny sizes.
    renderer.shadowMap.enabled = !small;
    for (let i = effects.length - 1; i >= 0; i--) {
      const e = effects[i]; e.life -= dt; e.ring.scale.setScalar(1 + (.7 - e.life) * 1.1); e.ring.material.opacity = Math.max(0, e.life / .7 * .6);
      if (e.life <= 0) { scene.remove(e.ring); e.ring.geometry.dispose(); e.ring.material.dispose(); effects.splice(i, 1); }
    }
    renderer.render(scene, camera);
    renderDirty = false; lastFaces = faces;
    canvas.dataset.cards = JSON.stringify(visible); canvas.dataset.resources = JSON.stringify(stats()); canvas.dataset.center = `${center.x.toFixed(2)},${center.z.toFixed(2)}`;
    canvas.dataset.overview = String(overviewMode); canvas.dataset.theme = THEMES[theme].name;
  }
  function stats() { return { geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures, calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, objects: active.size }; }
  new ResizeObserver(resize).observe(canvas);
  return { setGame, render, pick, pan, reset, overview, focus, pulse, stats, isOverview: () => overviewMode, themeName: () => THEMES[theme].name };
}
