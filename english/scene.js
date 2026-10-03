import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const UP = new THREE.Vector3(0, 1, 0);
const PALETTES = {
  forest: { sky: '#bce9ed', fog: '#d4eeed', floor: '#6cae7a', track: '#f4bd67', edge: '#ff7859', foliage: '#2c8868', accent: '#ffe79b' },
  cloud: { sky: '#b4d9ff', fog: '#dfecff', floor: '#c9dbef', track: '#f8f3ff', edge: '#af86ff', foliage: '#c6b7ed', accent: '#ffcb82' },
  sunset: { sky: '#f3b2aa', fog: '#f5d0ba', floor: '#d8a080', track: '#ffcd79', edge: '#e56788', foliage: '#bc7188', accent: '#ffe6a0' },
  neon: { sky: '#151835', fog: '#292047', floor: '#2b3151', track: '#42436c', edge: '#3ce8f0', foliage: '#565e8b', accent: '#ff57ce' },
  coast: { sky: '#a3def6', fog: '#cbecf4', floor: '#efdbad', track: '#fce9a7', edge: '#29a8bc', foliage: '#388e73', accent: '#ff9774' },
  snow: { sky: '#bed9ed', fog: '#e8f1f9', floor: '#eff5fb', track: '#b7dafa', edge: '#528cc7', foliage: '#779ca9', accent: '#ffeab6' },
  flowers: { sky: '#e3d3f5', fog: '#f1e3f4', floor: '#95bf93', track: '#ffe4c7', edge: '#e777b0', foliage: '#6eae84', accent: '#fee375' },
  space: { sky: '#101b36', fog: '#1e2944', floor: '#353f64', track: '#7783ac', edge: '#83ecff', foliage: '#576897', accent: '#ca94ff' },
  lava: { sky: '#57354a', fog: '#79505b', floor: '#59475a', track: '#a797a3', edge: '#ff9964', foliage: '#73667e', accent: '#ffca79' },
};

function seeded(seed) {
  let value = 2166136261;
  for (const char of String(seed ?? 1)) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return () => { value += 0x6D2B79F5; let t = Math.imul(value ^ (value >>> 15), 1 | value); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/** Rendering only: Run owns movement, timing, questions, collisions and rewards. */
export class AdventureScene {
  constructor(canvas, { onError } = {}) {
    this.canvas = canvas;
    this.onError = onError;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(57, 1, 0.1, 420);
    this.world = new THREE.Group();
    this.scene.add(this.world);
    this.resources = new Set();
    this.materials = new Map();
    this.geometries = new Map();
    this.rivals = [];
    this.mergeStats = { sourceMeshes: 0, mergedMeshes: 0 };
    this.renderStats = {};
    this.previewTime = 0;
    this.isPreview = false;
    this.disposed = false;
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
      this.renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 1.5));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.13;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.setClearColor('#bce9ed');
      this.contextLost = (event) => { event.preventDefault(); this.onError?.(new Error('3D 画面暂时中断，请重新进入关卡。')); };
      this.canvas.addEventListener('webglcontextlost', this.contextLost);
    } catch (error) { this.onError?.(error); throw error; }
    this.resize();
  }

  material(color, options = {}) {
    const key = `${color}:${JSON.stringify(options)}`;
    if (!this.materials.has(key)) {
      const material = new THREE.MeshStandardMaterial({ color, roughness: 0.68, ...options });
      this.materials.set(key, material);
      this.resources.add(material);
    }
    return this.materials.get(key);
  }

  geometry(kind) {
    if (!this.geometries.has(kind)) {
      const shapes = {
        sphere: () => new THREE.SphereGeometry(1, 24, 16),
        orb: () => new THREE.SphereGeometry(1, 10, 8),
        box: () => new THREE.BoxGeometry(1, 1, 1),
        cylinder: () => new THREE.CylinderGeometry(1, 1, 1, 12),
        cone: () => new THREE.ConeGeometry(1, 1, 9),
        rock: () => new THREE.IcosahedronGeometry(1, 0),
        torus: () => new THREE.TorusGeometry(1, 0.11, 7, 28),
      };
      const geometry = shapes[kind]();
      this.geometries.set(kind, geometry);
      this.resources.add(geometry);
    }
    return this.geometries.get(kind);
  }

  mesh(parent, kind, color, position, scale, options = {}) {
    const mesh = new THREE.Mesh(this.geometry(kind), this.material(color, options));
    if (position) mesh.position.set(...position);
    if (scale) mesh.scale.set(...scale);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  bar(parent, from, to, radius, color, options = {}) {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const bar = this.mesh(parent, 'cylinder', color, a.clone().add(b).multiplyScalar(0.5).toArray(), [radius, a.distanceTo(b), radius], options);
    bar.quaternion.setFromUnitVectors(UP, b.sub(a).normalize());
    return bar;
  }

  // Bake static parts into the local coordinates of their moving parent.
  // Shells and wheels retain their own transforms and shared source geometry.
  mergeStatic(parent, excluded = new Set()) {
    parent.updateWorldMatrix(true, true);
    const inverse = parent.matrixWorld.clone().invert();
    const batches = new Map();
    const visit = object => {
      if (excluded.has(object)) return;
      if (object !== parent && object.isMesh && !object.isInstancedMesh && !Array.isArray(object.material)) {
        const attributes = Object.entries(object.geometry.attributes).map(([name, attribute]) => `${name}:${attribute.itemSize}:${attribute.normalized}`).sort().join(',');
        const key = `${object.material.uuid}:${object.castShadow}:${object.receiveShadow}:${object.renderOrder}:${Boolean(object.geometry.index)}:${attributes}`;
        if (!batches.has(key)) batches.set(key, []);
        batches.get(key).push(object);
      }
      for (const child of object.children) visit(child);
    };
    visit(parent);
    for (const meshes of batches.values()) {
      if (meshes.length < 2) continue;
      const transformed = meshes.map(mesh => mesh.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, mesh.matrixWorld)));
      const geometry = mergeGeometries(transformed, false);
      for (const clone of transformed) clone.dispose();
      if (!geometry) continue;
      geometry.computeBoundingSphere();
      this.resources.add(geometry);
      const merged = new THREE.Mesh(geometry, meshes[0].material);
      merged.castShadow = meshes[0].castShadow;
      merged.receiveShadow = meshes[0].receiveShadow;
      merged.renderOrder = meshes[0].renderOrder;
      for (const mesh of meshes) mesh.removeFromParent();
      parent.add(merged);
      this.mergeStats.sourceMeshes += meshes.length;
      this.mergeStats.mergedMeshes += 1;
    }
  }

  recordRenderStats() {
    const info = this.renderer.info;
    this.renderStats = {
      calls: info.render.calls,
      triangles: info.render.triangles,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      sourceMeshes: this.mergeStats.sourceMeshes,
      mergedMeshes: this.mergeStats.mergedMeshes,
      meshesRemoved: this.mergeStats.sourceMeshes - this.mergeStats.mergedMeshes,
    };
  }

  clear() {
    this.sun?.shadow.dispose();
    this.world.clear();
    for (const resource of this.resources) resource.dispose();
    this.resources.clear();
    this.materials.clear();
    this.geometries.clear();
    this.mergeStats = { sourceMeshes: 0, mergedMeshes: 0 };
    this.player = null;
    this.rivals = [];
    this.obstacles = null;
    this.obstacleBatches = [];
    this.obstacleNodes = [];
    this.obstacleInstances = [];
    this.obstacleHits = [];
    this.obstacleKey = '';
    this.trail = null;
  }

  lighting(palette, preview = false) {
    this.scene.background = new THREE.Color(palette.sky);
    this.scene.fog = new THREE.Fog(palette.fog, preview ? 26 : 48, preview ? 65 : 210);
    this.world.add(new THREE.HemisphereLight('#fff8ef', palette.floor, 2.25));
    this.sun = new THREE.DirectionalLight('#fff4db', 3.0);
    this.sun.position.set(-18, 35, -12);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(512, 512);
    Object.assign(this.sun.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25, near: 1, far: 85 });
    this.sun.shadow.bias = -0.0005;
    this.sun.shadow.normalBias = 0.04;
    this.world.add(this.sun, this.sun.target);
    this.world.add(new THREE.DirectionalLight('#bcdcff', 0.85));
  }

  makePath(level) {
    const random = seeded(`${level.seed}:${level.id}:${level.mode}`);
    const length = 205 + random() * 45;
    const phase = random() * Math.PI * 2;
    const bends = 1.45 + random() * 1.45;
    const amplitude = level.mode === 'race' ? 11 + random() * 5 : 7 + random() * 8;
    const points = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const x = Math.sin(t * Math.PI * bends * 2 + phase) * amplitude * Math.sin(t * Math.PI * 0.85) + Math.sin(t * 17 + phase) * 2.2;
      let y = Math.sin(t * Math.PI * 3 + phase) * 1.25;
      if (level.mode === 'slide') y += 22 * (1 - t) + Math.sin(t * 13 + phase) * 1.6;
      if (level.mode === 'parkour') y += Math.sin(t * 21 + phase) * 1.5 + t * 3;
      if (level.mode === 'bike') y += Math.sin(t * 11 + phase) * 2.4;
      points.push(new THREE.Vector3(x, y + 2, t * length));
    }
    this.curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
    this.curve.arcLengthDivisions = 800;
    this.curve.updateArcLengths();
    this.pathLength = this.curve.getLength();
  }

  frame(progress, lane = 0, height = 0) {
    const t = clamp(progress, 0, 1);
    const position = this.curve.getPointAt(t);
    const forward = this.curve.getTangentAt(t).normalize();
    const right = new THREE.Vector3().crossVectors(UP, forward).normalize();
    const up = new THREE.Vector3().crossVectors(forward, right).normalize();
    // The rear-follow camera faces +forward, so model +X projects screen-left.
    position.addScaledVector(right, -lane * 2.3);
    position.y += height;
    return { position, forward, right, up };
  }

  ribbon(start, end, width, color, { pipe = false, thickness = 0 } = {}) {
    const steps = Math.max(2, Math.ceil((end - start) * 240));
    const across = pipe ? 14 : 1;
    const vertices = [], indices = [];
    for (let i = 0; i <= steps; i++) {
      const frame = this.frame(start + (end - start) * i / steps);
      for (let j = 0; j <= across; j++) {
        const fraction = j / across * 2 - 1;
        const angle = fraction * 1.13;
        const lateral = pipe ? Math.sin(angle) * 3.6 : fraction * width;
        const rise = pipe ? (1 - Math.cos(angle)) * 3.6 : 0;
        const point = frame.position.clone().addScaledVector(frame.right, lateral);
        vertices.push(point.x, point.y + rise, point.z);
      }
    }
    for (let i = 0; i < steps; i++) for (let j = 0; j < across; j++) {
      const a = i * (across + 1) + j, b = a + across + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    this.resources.add(geometry);
    const surface = new THREE.Mesh(geometry, this.material(color, { side: THREE.DoubleSide, roughness: 0.52 }));
    surface.receiveShadow = true;
    this.world.add(surface);
    if (thickness) {
      const edge = new THREE.Mesh(geometry, this.material(this.palette.edge, { side: THREE.DoubleSide }));
      edge.position.y = -thickness;
      this.world.add(edge);
      for (const side of [-1, 1]) this.lineAlong(start, end, side * width, -thickness * 0.4, this.palette.edge, thickness * 0.55);
    }
    return surface;
  }

  lineAlong(start, end, lateral, rise, color, radius = 0.07) {
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const frame = this.frame(start + (end - start) * i / 100);
      points.push(frame.position.addScaledVector(frame.right, lateral).add(new THREE.Vector3(0, rise, 0)));
    }
    const geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 100, radius, 5, false);
    this.resources.add(geometry);
    const line = new THREE.Mesh(geometry, this.material(color, { emissive: color, emissiveIntensity: 0.15, roughness: 0.4 }));
    this.world.add(line);
  }

  buildTrack() {
    const { mode } = this.level;
    if (mode === 'slide') {
      this.ribbon(0, 1, 3.6, this.palette.track, { pipe: true });
      const x = Math.sin(1.13) * 3.6, y = (1 - Math.cos(1.13)) * 3.6;
      this.lineAlong(0, 1, -x, y, this.palette.edge, 0.12);
      this.lineAlong(0, 1, x, y, this.palette.edge, 0.12);
      this.lineAlong(0, 1, 0, 0.025, this.palette.accent, 0.04);
    } else if (mode === 'parkour') {
      const trims = new THREE.InstancedMesh(this.geometry('box'), this.material(this.palette.edge), 22);
      for (let i = 0; i < 22; i++) {
        const start = i / 22, end = Math.min(1, (i + 1) / 22 - (i === 21 ? 0 : 0.0045));
        this.ribbon(start, end, 3.6, i % 3 === 1 ? this.palette.accent : this.palette.track, { thickness: 0.45 });
        const f = this.frame(start);
        trims.setMatrixAt(i, new THREE.Matrix4().compose(f.position.clone().add(new THREE.Vector3(0, 0.03, 0)), new THREE.Quaternion().setFromAxisAngle(UP, Math.atan2(f.forward.x, f.forward.z)), new THREE.Vector3(7.2, 0.09, 0.17)));
      }
      trims.computeBoundingSphere(); this.resources.add(trims); this.world.add(trims);
    } else {
      const width = mode === 'race' ? 4.0 : 3.6;
      this.ribbon(0, 1, width, this.palette.track);
      this.lineAlong(0, 1, -width, 0.1, this.palette.edge, 0.1);
      this.lineAlong(0, 1, width, 0.1, this.palette.edge, 0.1);
      const markings = new THREE.InstancedMesh(this.geometry('box'), this.material('#fff8e6'), 65);
      for (let i = 0; i < 65; i++) {
        const f = this.frame((i + 0.5) / 65);
        markings.setMatrixAt(i, new THREE.Matrix4().compose(f.position.clone().add(new THREE.Vector3(0, 0.028, 0)), new THREE.Quaternion().setFromAxisAngle(UP, Math.atan2(f.forward.x, f.forward.z)), new THREE.Vector3(0.11, 0.035, 1.5)));
      }
      markings.computeBoundingSphere(); this.resources.add(markings); this.world.add(markings);
    }
    // The striped gates show forward direction from the very first frame.
    for (const [progress, finish] of [[0.008, false], [0.986, true]]) {
      const f = this.frame(progress);
      const gate = new THREE.Group();
      gate.position.copy(f.position);
      gate.rotation.y = Math.atan2(f.forward.x, f.forward.z);
      const top = this.level.mode === 'slide' ? 5.7 : 4.5;
      for (const x of [-4.25, 4.25]) this.mesh(gate, 'cylinder', this.palette.edge, [x, top / 2, 0], [0.16, top, 0.16]);
      this.mesh(gate, 'box', finish ? '#fff9e9' : this.palette.accent, [0, top, 0], [8.8, 0.55, 0.3]);
      for (let x = -4; x < 4; x++) this.mesh(gate, 'box', finish && x % 2 === 0 ? '#3e4358' : this.palette.edge, [x + 0.5, top, 0.18], [0.85, 0.4, 0.04]);
      this.mergeStatic(gate);
      this.world.add(gate);
    }
  }

  scatter() {
    const random = seeded(`${this.level.seed}:scenery:${this.level.theme}`);
    const batches = new Map();
    const add = (kind, color, position, scale, rotation = 0, options = {}) => {
      const key = `${kind}:${color}:${JSON.stringify(options)}`;
      if (!batches.has(key)) batches.set(key, { kind, color, options, transforms: [] });
      const matrix = new THREE.Matrix4().compose(new THREE.Vector3(...position), new THREE.Quaternion().setFromAxisAngle(UP, rotation), new THREE.Vector3(...scale));
      batches.get(key).transforms.push(matrix);
    };
    const theme = this.level.theme;
    // Close objects are small; tall landmarks sit farther from the playable lanes.
    for (let i = 0; i < 102; i++) {
      const progress = (i + random() * 0.65) / 102;
      const f = this.frame(progress);
      const side = i % 2 ? -1 : 1;
      const offset = side * (7.5 + random() * 15);
      const p = f.position.clone().addScaledVector(f.right, offset);
      const y = this.level.mode === 'slide' ? -3 : p.y - 1.15;
      const size = 0.8 + random() * 1.8;
      if (theme === 'cloud') {
        for (let c = 0; c < 3; c++) add('orb', c % 2 ? '#e9eaff' : '#fff9ff', [p.x + c * size, y + random(), p.z], [size * 1.8, size * 0.7, size]);
        if (i % 10 === 0) add('cone', this.palette.edge, [p.x, y + 3, p.z], [size, 5, size]);
      } else if (theme === 'neon') {
        const height = 3 + random() * 9;
        add('box', this.palette.foliage, [p.x, y + height / 2, p.z], [size * 1.5, height, size * 1.5]);
        add('box', i % 2 ? this.palette.edge : this.palette.accent, [p.x, y + height - 0.25, p.z], [size * 1.57, 0.13, size * 1.57], 0, { emissive: i % 2 ? this.palette.edge : this.palette.accent, emissiveIntensity: 0.65 });
        for (let row = 0; row < 3; row++) add('box', '#c7e7ff', [p.x, y + height * (0.25 + row * 0.22), p.z - size * 0.76], [size * 0.8, 0.17, 0.04]);
      } else if (theme === 'space' || theme === 'lava') {
        add('rock', this.palette.foliage, [p.x, y + size * 0.65, p.z], [size * 1.5, size, size], random() * 6);
        if (i % 3 === 0) add('cone', this.palette.accent, [p.x + 1.5, y + 1.9, p.z], [0.65, 3.4, 0.65], random(), { emissive: this.palette.accent, emissiveIntensity: 0.4, metalness: 0.25 });
      } else {
        add('cylinder', theme === 'snow' ? '#8e919d' : '#a58164', [p.x, y + size, p.z], [0.2 * size, size * 2, 0.2 * size]);
        if (theme === 'coast') {
          for (let leaf = 0; leaf < 5; leaf++) {
            const a = leaf / 5 * Math.PI * 2;
            add('orb', this.palette.foliage, [p.x + Math.cos(a) * size, y + size * 2.15, p.z + Math.sin(a) * size], [1.4 * size, 0.16, 0.46 * size], -a);
          }
        } else {
          add('cone', this.palette.foliage, [p.x, y + size * 2.3, p.z], [size * 1.4, size * 2.8, size * 1.4]);
          if (theme === 'snow') add('cone', '#f9fcff', [p.x, y + size * 2.8, p.z], [size * 1.12, size * 2, size * 1.12]);
        }
        add('rock', theme === 'snow' ? '#e8f0f7' : '#c0ae99', [p.x + 2, y + 0.35, p.z + 1.8], [0.7, 0.5, 0.8], random() * 6);
      }
      if (theme === 'flowers' || theme === 'forest' || theme === 'sunset') {
        const q = f.position.clone().addScaledVector(f.right, side * (5.1 + random() * 2));
        if (this.level.mode === 'slide') q.y = -2.45;
        const flowerColor = ['#ffe386', '#f58bab', '#bd9ce4'][i % 3];
        add('orb', this.palette.foliage, [q.x, q.y - 0.5, q.z], [0.65, 0.35, 0.65]);
        if (theme === 'flowers' || i % 3 === 0) {
          add('cylinder', '#69a374', [q.x, q.y - 0.1, q.z], [0.045, 0.7, 0.045]);
          for (let petal = 0; petal < 4; petal++) {
            const a = petal * Math.PI / 2;
            add('orb', flowerColor, [q.x + Math.sin(a) * 0.2, q.y + 0.26, q.z + Math.cos(a) * 0.2], [0.22, 0.09, 0.22]);
          }
          add('orb', '#ffe9a8', [q.x, q.y + 0.3, q.z], [0.12, 0.1, 0.12]);
        }
      }
    }
    for (const batch of batches.values()) {
      const mesh = new THREE.InstancedMesh(this.geometry(batch.kind), this.material(batch.color, batch.options), batch.transforms.length);
      batch.transforms.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.computeBoundingSphere();
      this.resources.add(mesh);
      this.world.add(mesh);
    }
    const ground = this.level.mode === 'slide'
      ? this.mesh(this.world, 'box', this.palette.floor, [0, -3.5, 120], [180, 1, 310])
      : this.ribbon(0, 1, 65, this.palette.floor);
    if (this.level.mode !== 'slide') ground.position.y = -1.2;
    ground.castShadow = false;
    if (theme === 'coast') this.mesh(this.world, 'box', '#6ac4d6', [-50, -2.8, 120], [40, 0.1, 310], { roughness: 0.25, metalness: 0.18 });
    if (theme === 'lava') this.mesh(this.world, 'box', '#da765c', [-42, -2.8, 120], [22, 0.1, 310], { emissive: '#fe6c36', emissiveIntensity: 0.25 });
    if (theme === 'space') {
      for (let i = 0; i < 45; i++) add('orb', '#e9f8ff', [(random() - 0.5) * 160, 24 + random() * 42, random() * 250], [0.15, 0.15, 0.15]);
      // Stars have one draw call and remain still when a question opens.
      const stars = batches.get('orb:#e9f8ff:{}');
      const mesh = new THREE.InstancedMesh(this.geometry('orb'), this.material('#e9f8ff', { emissive: '#d9efff', emissiveIntensity: 1 }), stars.transforms.length);
      stars.transforms.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
      mesh.computeBoundingSphere(); this.resources.add(mesh); this.world.add(mesh);
    }
  }

  skinTexture(skin) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = skin.color || '#62bbee'; ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = skin.accent || '#fff1ba'; ctx.strokeStyle = skin.accent || '#fff1ba';
    const random = seeded(skin.id);
    if (skin.pattern === 'stripe') {
      ctx.lineWidth = 15;
      for (let x = -240; x < 500; x += 55) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 170, 256); ctx.stroke(); }
    } else if (skin.pattern === 'dots' || skin.pattern === 'stars') {
      for (let i = 0; i < 32; i++) {
        const x = random() * 256, y = random() * 256, radius = 5 + random() * 7;
        ctx.beginPath();
        if (skin.pattern === 'dots') ctx.arc(x, y, radius, 0, Math.PI * 2);
        else for (let v = 0; v < 10; v++) { const angle = v * Math.PI / 5 - Math.PI / 2; const r = v % 2 ? radius * 0.4 : radius; ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r); }
        ctx.closePath(); ctx.fill();
      }
    } else if (skin.pattern === 'marble') {
      ctx.lineWidth = 5; ctx.globalAlpha = 0.6;
      for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(0, i * 28 - 30); ctx.bezierCurveTo(80, i * 21 + 20, 160, i * 31 - 70, 256, i * 26 + 20); ctx.stroke(); }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.resources.add(texture);
    return texture;
  }

  makeBall(skin) {
    const ball = new THREE.Group();
    const shellMaterial = new THREE.MeshStandardMaterial({ map: this.skinTexture(skin), roughness: 0.24, metalness: 0.2, color: '#ffffff' });
    this.resources.add(shellMaterial);
    const shell = new THREE.Mesh(this.geometry('sphere'), shellMaterial);
    shell.scale.setScalar(0.64); shell.castShadow = true; shell.receiveShadow = true; ball.add(shell);
    // The face is mounted on the front (+Z), which also matches vehicle direction.
    for (const x of [-0.2, 0.2]) {
      this.mesh(ball, 'orb', '#fffdf6', [x, 0.13, 0.585], [0.14, 0.18, 0.055]).castShadow = false;
      this.mesh(ball, 'orb', '#273449', [x, 0.13, 0.633], [0.055, 0.085, 0.025]).castShadow = false;
      this.mesh(ball, 'orb', '#ffffff', [x - 0.018, 0.16, 0.66], [0.018, 0.025, 0.01]).castShadow = false;
      this.mesh(ball, 'orb', '#f9a6aa', [x * 1.65, -0.11, 0.54], [0.11, 0.055, 0.025]).castShadow = false;
    }
    const smile = this.mesh(ball, 'torus', '#694b62', [0, -0.08, 0.64], [0.12, 0.12, 0.12]);
    smile.scale.y = 0.07;
    smile.castShadow = false;
    const gold = '#f7c35e', accent = skin.accent || '#a6f4ff';
    const accessory = skin.accessory;
    if (accessory === 'crown') {
      const ring = this.mesh(ball, 'torus', gold, [0, 0.55, 0], [0.38, 0.38, 0.38], { metalness: 0.65, roughness: 0.22 }); ring.rotation.x = Math.PI / 2;
      for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; this.mesh(ball, 'cone', gold, [Math.sin(a) * 0.29, 0.76, Math.cos(a) * 0.29], [0.14, 0.43, 0.14]); this.mesh(ball, 'orb', accent, [Math.sin(a) * 0.29, 0.98, Math.cos(a) * 0.29], [0.065, 0.065, 0.065], { emissive: accent, emissiveIntensity: 0.25 }); }
    } else if (accessory === 'glasses') {
      for (const x of [-0.2, 0.2]) this.mesh(ball, 'torus', '#3e435f', [x, 0.14, 0.66], [0.18, 0.2, 0.13]);
      this.bar(ball, [-0.07, 0.15, 0.67], [0.07, 0.15, 0.67], 0.025, '#3e435f');
      for (const side of [-1, 1]) this.bar(ball, [side * 0.38, 0.14, 0.6], [side * 0.54, 0.17, 0], 0.025, '#3e435f');
    } else if (accessory === 'halo') {
      const halo = this.mesh(ball, 'torus', '#ffe788', [0, 0.9, 0], [0.5, 0.5, 0.5], { emissive: '#ffe788', emissiveIntensity: 0.8 }); halo.rotation.x = Math.PI / 2;
      this.mesh(ball, 'orb', '#fff3bd', [0.39, 1.02, 0], [0.055, 0.055, 0.055]);
    } else if (accessory === 'ears') {
      for (const x of [-0.35, 0.35]) { const ear = this.mesh(ball, 'cone', skin.color, [x, 0.68, 0], [0.24, 0.48, 0.18]); ear.rotation.z = -x * 0.6; this.mesh(ball, 'cone', accent, [x, 0.7, 0.12], [0.12, 0.3, 0.03]); }
    } else if (accessory === 'star' || accessory === 'crystal') {
      if (accessory === 'crystal') { this.mesh(ball, 'rock', accent, [0, 0.83, 0], [0.27, 0.5, 0.27], { metalness: 0.35, emissive: accent, emissiveIntensity: 0.32 }); }
      else {
        this.mesh(ball, 'orb', gold, [0, 0.81, 0], [0.19, 0.19, 0.11]);
        for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; const point = this.mesh(ball, 'cone', gold, [Math.sin(a) * 0.18, 0.81 + Math.cos(a) * 0.18, 0], [0.11, 0.28, 0.09], { emissive: gold, emissiveIntensity: 0.3 }); point.rotation.z = -a; }
      }
    } else if (accessory === 'flower') {
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; this.mesh(ball, 'orb', accent, [Math.sin(a) * 0.24, 0.77 + Math.cos(a) * 0.19, 0.11], [0.17, 0.16, 0.1]); }
      this.mesh(ball, 'orb', gold, [0, 0.77, 0.2], [0.13, 0.13, 0.08]);
    } else if (accessory === 'wings') {
      for (const side of [-1, 1]) for (let i = 0; i < 4; i++) { const feather = this.mesh(ball, 'orb', i % 2 ? '#fff6f5' : accent, [side * (0.62 + i * 0.12), 0.2 + i * 0.13, -0.1], [0.18, 0.48 - i * 0.065, 0.09], { roughness: 0.35 }); feather.rotation.z = side * (0.55 + i * 0.12); }
    }
    ball.userData.shell = shell;
    this.mergeStatic(ball, new Set([shell]));
    return ball;
  }

  vehicle(mode, color, accent) {
    const vehicle = new THREE.Group();
    vehicle.userData.wheels = [];
    if (mode === 'bike') {
      const tireMaterial = '#384456';
      for (const z of [-0.78, 0.85]) {
        const wheel = this.mesh(vehicle, 'torus', tireMaterial, [0, 0.47, z], [0.48, 0.48, 0.48], { roughness: 0.85 }); wheel.rotation.y = Math.PI / 2;
        const rim = this.mesh(wheel, 'torus', '#d4e6ee', [0, 0, 0], [0.78, 0.78, 0.78], { metalness: 0.6, roughness: 0.25 });
        for (let i = 0; i < 5; i++) { const a = i * Math.PI / 5; this.bar(wheel, [-Math.cos(a) * 0.76, -Math.sin(a) * 0.76, 0], [Math.cos(a) * 0.76, Math.sin(a) * 0.76, 0], 0.025, '#e5edf2'); }
        vehicle.userData.wheels.push(wheel);
      }
      for (const [from, to] of [ [[0,0.48,-0.78],[0,0.65,0]], [[0,0.65,0],[0,1.17,-0.38]], [[0,1.17,-0.38],[0,0.48,-0.78]], [[0,1.17,-0.38],[0,1.19,0.57]], [[0,1.19,0.57],[0,0.65,0]], [[0,1.19,0.57],[0,0.48,0.85]] ]) this.bar(vehicle, from, to, 0.075, color, { metalness: 0.25, roughness: 0.32 });
      this.mesh(vehicle, 'box', '#4e526d', [0, 1.28, -0.27], [0.4, 0.1, 0.48]);
      this.bar(vehicle, [0,1.18,0.57], [0,1.56,0.68], 0.065, '#e2e9ef');
      this.bar(vehicle, [-0.46,1.56,0.68], [0.46,1.56,0.68], 0.055, '#e2e9ef');
      for (const x of [-0.43,0.43]) this.mesh(vehicle, 'cylinder', '#464e69', [x, 1.55, 0.7], [0.07, 0.21, 0.07]).rotation.x = Math.PI / 2;
      this.mesh(vehicle, 'orb', '#fff2b5', [0,1.36,0.91], [0.12,0.1,0.08], { emissive: '#fff2b5', emissiveIntensity: 0.3 });
      this.mesh(vehicle, 'box', accent, [0,0.74,-0.96], [0.17,0.1,0.06]);
      this.bar(vehicle, [-0.18,0.65,0], [0.18,0.65,0], 0.06, '#c5d2df');
    } else {
      this.mesh(vehicle, 'box', color, [0,0.6,0], [1.56,0.5,2.15], { metalness: 0.22, roughness: 0.3 });
      const hood = this.mesh(vehicle, 'box', color, [0,0.83,0.57], [1.38,0.28,0.95], { metalness: 0.22, roughness: 0.3 }); hood.rotation.x = 0.12;
      this.mesh(vehicle, 'box', '#405269', [0,0.89,-0.2], [1.1,0.2,0.78]);
      this.mesh(vehicle, 'box', '#bbebf2', [0,1.09,0.13], [1.11,0.36,0.08], { transparent: true, opacity: 0.65, roughness: 0.15 });
      for (const x of [-0.81,0.81]) for (const z of [-0.69,0.7]) {
        const wheel = this.mesh(vehicle, 'cylinder', '#344153', [x,0.39,z], [0.36,0.23,0.36]); wheel.rotation.z = Math.PI / 2;
        this.mesh(wheel, 'cylinder', '#c8d7e9', [0, x > 0 ? 0.53 : -0.53, 0], [0.6,0.06,0.6], { metalness: 0.65, roughness: 0.2 });
        vehicle.userData.wheels.push(wheel);
      }
      for (const x of [-0.48,0.48]) {
        this.mesh(vehicle, 'box', '#fff7c2', [x,0.68,1.09], [0.3,0.17,0.05], { emissive: '#fff7c2', emissiveIntensity: 0.5 });
        this.mesh(vehicle, 'box', '#f28baa', [x,0.61,-1.09], [0.28,0.13,0.04], { emissive: '#f28baa', emissiveIntensity: 0.2 });
      }
      this.mesh(vehicle, 'box', accent, [0,0.996,0.53], [0.2,0.035,0.86]);
      this.mesh(vehicle, 'box', accent, [0,1.09,-0.88], [1.65,0.12,0.22]);
      for (const x of [-0.5,0.5]) this.mesh(vehicle, 'box', '#526073', [x,0.9,-0.88], [0.08,0.4,0.08]);
      this.mesh(vehicle, 'box', '#e1e9ef', [0,0.45,1.1], [1.2,0.12,0.07]);
    }
    for (const wheel of vehicle.userData.wheels) {
      wheel.traverse(part => { if (part.isMesh) part.castShadow = false; });
      this.mergeStatic(wheel);
    }
    this.mergeStatic(vehicle, new Set(vehicle.userData.wheels));
    return vehicle;
  }

  avatar(skin, mode) {
    const group = new THREE.Group();
    const ball = this.makeBall(skin);
    group.userData.ball = ball;
    if (mode === 'bike' || mode === 'race') {
      const vehicle = this.vehicle(mode, skin.color || '#78b7e4', skin.accent || '#ffcf72');
      group.add(vehicle); group.userData.vehicle = vehicle;
      ball.position.set(0, mode === 'bike' ? 1.92 : 1.38, mode === 'bike' ? -0.22 : -0.24);
    } else ball.position.y = 0.67;
    group.add(ball);
    this.world.add(group);
    return group;
  }

  makeTrail() {
    this.trail = new THREE.InstancedMesh(this.geometry('orb'), this.material('#ffffff', { emissive: '#ffffff', emissiveIntensity: 0.6, roughness: 0.25, transparent: true, opacity: 0.72, depthWrite: false }), 16);
    for (let i = 0; i < 16; i++) this.trail.setColorAt(i, new THREE.Color().setHSL((i / 16 + 0.06) % 1, 0.76, 0.64));
    this.trail.frustumCulled = false;
    this.resources.add(this.trail);
    this.world.add(this.trail);
  }

  start(level, skin) {
    if (this.disposed) return;
    this.clear();
    this.isPreview = false;
    this.level = { ...level };
    this.palette = PALETTES[level.theme] || PALETTES.forest;
    this.lighting(this.palette);
    this.makePath(level);
    this.buildTrack();
    this.scatter();
    this.mergeStatic(this.world);
    this.player = this.avatar(skin, level.mode);
    this.makeTrail();
    this.resize();
    this.render({ progress: 0, elapsed: 0, lane: 0, jump: 0, rivals: [], status: 'paused' }, {}, 0);
  }

  syncObstacles(obstacles = []) {
    const key = obstacles.map(item => `${item.progress}:${item.lane}:${item.kind}`).join('|');
    if (key !== this.obstacleKey) {
      if (this.obstacles) this.world.remove(this.obstacles);
      for (const batch of this.obstacleBatches || []) {
        batch.dispose(); batch.geometry.dispose();
        this.resources.delete(batch); this.resources.delete(batch.geometry);
      }
      this.obstacles = new THREE.Group(); this.world.add(this.obstacles); this.obstacleKey = key;
      this.obstacleBatches = []; this.obstacleNodes = []; this.obstacleInstances = obstacles.map(() => []); this.obstacleHits = [];
      const kinds = new Map();
      obstacles.forEach((item, index) => {
        const f = this.frame(item.progress, item.lane || 0);
        const group = new THREE.Group(); group.position.copy(f.position); group.rotation.y = Math.atan2(f.forward.x, f.forward.z);
        if (this.level.mode === 'slide') group.position.y += 3.6 - Math.sqrt(3.6 ** 2 - ((item.lane || 0) * 2.3) ** 2);
        group.updateMatrix();
        this.obstacleNodes.push(group); this.obstacles.add(group);
        const kind = item.kind === 'gap' ? 'gap' : 'block';
        if (!kinds.has(kind)) kinds.set(kind, []);
        kinds.get(kind).push(index);
      });
      for (const [kind, indices] of kinds) {
        const model = new THREE.Group();
        if (kind === 'gap') {
          this.mesh(model, 'box', '#93e6f9', [0,0.07,0], [7.2,0.08,0.4], { emissive: '#73e9fb', emissiveIntensity: 0.5 });
          for (const x of [-3,-1.5,0,1.5,3]) { const arrow = this.mesh(model, 'cone', '#f8dc78', [x,0.22,0], [0.15,0.38,0.11]); arrow.rotation.x = Math.PI / 2; }
        } else {
          this.mesh(model, 'box', '#f28e90', [0,0.48,0], [1.2,0.88,0.65], { roughness: 0.45 });
          this.mesh(model, 'box', '#fff2ba', [0,0.76,-0.335], [1.22,0.19,0.025]);
          for (const x of [-0.4,0.4]) this.mesh(model, 'orb', '#ffe88e', [x,0.98,0], [0.1,0.1,0.1], { emissive: '#ffe88e', emissiveIntensity: 0.45 });
        }
        this.mergeStatic(model);
        for (const part of model.children) {
          part.updateMatrix();
          const geometry = part.geometry.clone().applyMatrix4(part.matrix);
          this.resources.add(geometry);
          const batch = new THREE.InstancedMesh(geometry, part.material, indices.length);
          batch.castShadow = part.castShadow; batch.receiveShadow = part.receiveShadow;
          batch.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
          indices.forEach((index, instance) => {
            const matrix = this.obstacleNodes[index].matrix.clone();
            batch.setMatrixAt(instance, matrix);
            this.obstacleInstances[index].push({ batch, instance, matrix });
          });
          batch.computeBoundingSphere(); this.obstacles.add(batch);
          this.resources.add(batch); this.obstacleBatches.push(batch);
        }
      }
    }
    // Upload only the instances whose hit state changed, including the first frame.
    const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
    obstacles.forEach((item, index) => {
      const hit = Boolean(item.hit);
      if (this.obstacleHits[index] === hit) return;
      this.obstacleHits[index] = hit;
      this.obstacleNodes[index].visible = !hit;
      for (const { batch, instance, matrix } of this.obstacleInstances[index]) {
        batch.setMatrixAt(instance, hit ? hidden : matrix);
        batch.instanceMatrix.needsUpdate = true;
      }
    });
  }

  placeAvatar(avatar, progress, lane, jump, fall = 0, steer = 0) {
    const height = clamp(jump || 0, 0, 1) * 1.8 - clamp(fall || 0, 0, 1) * 1.4;
    const f = this.frame(progress, lane, height);
    if (this.level.mode === 'slide') f.position.y += 3.6 - Math.sqrt(3.6 ** 2 - (clamp(lane, -1, 1) * 2.3) ** 2);
    avatar.position.copy(f.position);
    const basis = new THREE.Matrix4().makeBasis(f.right, f.up, f.forward);
    avatar.quaternion.setFromRotationMatrix(basis);
    const ball = avatar.userData.ball;
    // A slight lean communicates steering without changing the simulation.
    ball.rotation.z = -clamp(steer || 0, -1, 1) * 0.12;
    if (this.level.mode === 'slide' || this.level.mode === 'parkour') ball.userData.shell.rotation.x = progress * this.pathLength / 0.64;
    const vehicle = avatar.userData.vehicle;
    if (vehicle) vehicle.userData.wheels.forEach(wheel => {
      // Local Y is the wheel axle for both vehicle constructions.
      const axis = this.level.mode === 'bike' ? new THREE.Vector3(0, 0, 1) : UP;
      const fixed = new THREE.Quaternion().setFromAxisAngle(this.level.mode === 'bike' ? UP : new THREE.Vector3(0,0,1), Math.PI / 2);
      wheel.quaternion.copy(fixed).multiply(new THREE.Quaternion().setFromAxisAngle(axis, -progress * this.pathLength / 0.43));
    });
    return f;
  }

  render(run, input = {}, dt = 0) {
    if (!this.renderer || this.disposed || !this.player) return;
    if (this.isPreview) {
      this.previewTime += Math.max(0, Math.min(dt || 0, 0.05));
      this.player.rotation.y = this.previewTime * 0.55;
      this.renderer.render(this.scene, this.camera);
      this.recordRenderStats();
      return;
    }
    if (!run) return;
    const progress = clamp(run.progress || 0, 0, 1);
    const lane = clamp(run.lane || 0, -1, 1);
    this.syncObstacles(run.obstacles || []);
    if (run.status === 'playing' && dt > 0) this.player.userData.steering = input.steer || 0;
    const steering = this.player.userData.steering || 0;
    const f = this.placeAvatar(this.player, progress, lane, run.jump || 0, run.fall || 0, steering);
    const rivals = run.rivals || [];
    while (this.rivals.length < rivals.length) {
      const i = this.rivals.length;
      const colors = ['#fa9dbb', '#a49cfa', '#80d5a2', '#f2c46b'];
      this.rivals.push(this.avatar({ id: `rival-${i}`, color: colors[i % 4], accent: '#fff4bc', pattern: 'stripe', accessory: 'none' }, this.level.mode));
    }
    this.rivals.forEach((avatar, i) => {
      avatar.visible = Boolean(rivals[i]) && rivals[i].progress < 1;
      if (rivals[i]) this.placeAvatar(avatar, clamp(rivals[i].progress || 0,0,1), clamp(rivals[i].lane || 0,-1,1), rivals[i].jump || 0);
    });
    for (let i = 0; i < 16; i++) {
      const tailProgress = progress - (i + 1) * 0.0015;
      const tail = this.frame(Math.max(0, tailProgress), lane, this.level.mode === 'bike' || this.level.mode === 'race' ? 0.75 : 0.52);
      if (this.level.mode === 'slide') tail.position.y += 3.6 - Math.sqrt(3.6 ** 2 - (lane * 2.3) ** 2);
      const size = tailProgress < 0 ? 0 : 0.18 * (1 - i / 20);
      this.trail.setMatrixAt(i, new THREE.Matrix4().compose(tail.position, new THREE.Quaternion(), new THREE.Vector3(size,size,size)));
    }
    this.trail.instanceMatrix.needsUpdate = true;
    // Camera has no autonomous interpolation: paused Run always produces the same view.
    const cameraFrame = this.frame(progress);
    const distance = this.level.mode === 'slide' ? 10.4 : 9.7;
    this.camera.position.copy(cameraFrame.position).addScaledVector(cameraFrame.forward, -distance).add(new THREE.Vector3(0, this.level.mode === 'slide' ? 7 : 5.9, 0));
    this.camera.position.addScaledVector(cameraFrame.right, -lane * 0.42);
    const look = this.frame(Math.min(1, progress + 0.024)).position;
    look.y += this.level.mode === 'slide' ? 0.8 : 1.0;
    this.camera.lookAt(look);
    this.sun.position.copy(f.position).add(new THREE.Vector3(-18,35,-12));
    this.sun.target.position.copy(f.position);
    this.renderer.render(this.scene, this.camera);
    this.recordRenderStats();
  }

  preview(skin) {
    if (this.disposed) return;
    this.clear(); this.isPreview = true; this.previewTime = 0;
    this.palette = PALETTES.cloud;
    this.lighting(this.palette, true);
    this.player = this.avatar(skin, 'parkour');
    this.player.position.y = 0.15;
    const base = this.mesh(this.world, 'cylinder', '#c5b7ed', [0,-0.16,0], [1.55,0.32,1.55], { metalness: 0.15, roughness: 0.4 }); base.receiveShadow = true;
    const ring = this.mesh(this.world, 'torus', '#fee4a0', [0,0.01,0], [1.44,1.44,1.44], { emissive: '#fee4a0', emissiveIntensity: 0.3 }); ring.rotation.x = Math.PI / 2;
    const floor = this.mesh(this.world, 'box', '#e6e6f5', [0,-0.4,0], [50,0.2,50]); floor.castShadow = false;
    this.camera.position.set(2.6,2.1,4.5); this.camera.lookAt(0,0.85,0);
    this.resize(); this.renderer?.render(this.scene, this.camera);
    if (this.renderer) this.recordRenderStats();
  }

  resize() {
    if (!this.renderer || this.disposed) return;
    const width = Math.max(1, this.canvas.clientWidth || this.canvas.parentElement?.clientWidth || this.canvas.width || 640);
    const height = Math.max(1, this.canvas.clientHeight || this.canvas.parentElement?.clientHeight || this.canvas.height || 480);
    this.camera.aspect = width / height;
    this.camera.fov = width < height ? 66 : 57;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  dispose() {
    if (this.disposed) return;
    this.clear();
    if (this.contextLost) this.canvas.removeEventListener('webglcontextlost', this.contextLost);
    this.renderer?.dispose();
    this.disposed = true;
  }
}
