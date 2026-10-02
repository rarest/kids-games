import * as THREE from "three";

// Small, reusable PBR tiles. They are generated locally once, with no image CDN.
const SIZE = 256,
  TAU = Math.PI * 2,
  cache = new Map(),
  shared = new Set();
const profiles = {
  asphalt: { rgb: [66, 70, 72], roughness: 0.91, metalness: 0, normal: 0.5 },
  paving: { rgb: [177, 182, 183], roughness: 0.86, metalness: 0, normal: 0.28 },
  stone: { rgb: [171, 165, 149], roughness: 0.9, metalness: 0, normal: 0.65 },
  grass: { rgb: [113, 137, 77], roughness: 0.96, metalness: 0, normal: 0.4 },
  bark: { rgb: [235, 222, 202], roughness: 0.91, metalness: 0, normal: 0.55 },
  leaves: { rgb: [241, 247, 224], roughness: 0.84, metalness: 0, normal: 0.32 },
  metal: {
    rgb: [237, 240, 241],
    roughness: 0.36,
    metalness: 0.88,
    normal: 0.18,
  },
  carbon: {
    rgb: [222, 227, 231],
    roughness: 0.47,
    metalness: 0.18,
    normal: 0.3,
  },
  rubber: { rgb: [221, 222, 218], roughness: 0.96, metalness: 0, normal: 0.65 },
  paint: {
    rgb: [255, 255, 255],
    roughness: 0.22,
    metalness: 0.72,
    normal: 0.035,
  },
  water: {
    rgb: [233, 247, 249],
    roughness: 0.13,
    metalness: 0.06,
    normal: 0.4,
  },
};
const clamp = (n) => Math.max(0, Math.min(1, n));
function hash(x, y) {
  let n = Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}
function noise(x, y, cells) {
  const px = x * cells,
    py = y * cells,
    ix = Math.floor(px),
    iy = Math.floor(py);
  const smooth = (t) => t * t * (3 - 2 * t),
    fx = smooth(px - ix),
    fy = smooth(py - iy);
  const h = (a, b) => hash((a + cells) % cells, (b + cells) % cells);
  const a = h(ix, iy) * (1 - fx) + h(ix + 1, iy) * fx,
    b = h(ix, iy + 1) * (1 - fx) + h(ix + 1, iy + 1) * fx;
  return a * (1 - fy) + b * fy;
}
export function surfaceTextures(kind) {
  if (cache.has(kind)) return cache.get(kind);
  const p = profiles[kind];
  if (!p) throw new Error("Unknown surface: " + kind);
  const color = new Uint8Array(SIZE * SIZE * 4),
    rough = new Uint8Array(color.length),
    normals = new Uint8Array(color.length),
    heights = new Float32Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++) {
      const u = x / SIZE,
        v = y / SIZE,
        i = y * SIZE + x,
        q = i * 4;
      const coarse = noise(u, v, 4),
        medium = noise(u, v, 16),
        fine = noise(u, v, 64),
        grain = hash(x, y);
      let height = 0.5,
        shade = 0.85 + 0.15 * medium,
        r = 0.7 + 0.3 * fine;
      if (kind === "asphalt") {
        height = 0.28 * medium + 0.65 * grain;
        const wheel =
          Math.exp(-(((u - 0.22) / 0.055) ** 2)) +
          Math.exp(-(((u - 0.78) / 0.055) ** 2));
        shade = 0.73 + 0.28 * fine + 0.12 * grain - 0.13 * wheel;
        r = 0.72 + 0.28 * grain;
      } else if (kind === "paving") {
        // Fine aggregate for slabs, rather than the large strata used on cliffs.
        height = 0.38 * fine + 0.52 * grain + 0.1 * medium;
        shade = 0.82 + 0.12 * fine + 0.05 * grain + 0.025 * coarse;
        r = 0.75 + 0.25 * grain;
      } else if (kind === "stone") {
        const strata =
          0.5 + 0.5 * Math.sin(v * TAU * 7 + 0.65 * Math.sin(u * TAU * 3));
        height = 0.48 * coarse + 0.2 * medium + 0.22 * strata + 0.1 * grain;
        shade = 0.64 + 0.28 * coarse + 0.18 * strata + 0.1 * fine;
      } else if (kind === "grass" || kind === "leaves") {
        const blade = Math.exp(
          -Math.abs(Math.sin(u * TAU * 32 + Math.sin(v * TAU * 4))) * 8,
        );
        height = 0.45 * medium + 0.4 * fine + 0.15 * blade;
        shade = 0.65 + 0.24 * coarse + 0.17 * medium + 0.08 * blade;
      } else if (kind === "bark") {
        const fibre =
          0.5 + 0.5 * Math.sin(u * TAU * 18 + Math.sin(v * TAU * 3));
        height = 0.55 * fibre + 0.3 * medium + 0.15 * fine;
        shade = 0.63 + 0.25 * fibre + 0.17 * coarse;
      } else if (kind === "metal") {
        height = 0.35 * grain + 0.25 * Math.sin(v * TAU * 110);
        shade = 0.84 + 0.12 * grain + 0.04 * medium;
        r = 0.55 + 0.42 * medium + 0.03 * grain;
      } else if (kind === "carbon") {
        const weave = (Math.floor(u * 28) + Math.floor(v * 28)) % 2,
          threads = 0.5 + 0.5 * Math.sin((weave ? u : v) * TAU * 112);
        height = 0.3 * weave + 0.5 * threads;
        shade = 0.5 + 0.18 * weave + 0.23 * threads;
        r = 0.63 + 0.24 * weave + 0.13 * grain;
      } else if (kind === "rubber") {
        const groove = Math.abs(
          Math.sin((u * 24 + Math.sin(v * TAU * 3) * 0.4) * TAU),
        );
        height = clamp(groove * 2.5) * 0.75 + 0.1 * grain;
        shade = 0.64 + 0.24 * height + 0.1 * fine;
        r = 0.79 + 0.21 * grain;
      } else if (kind === "paint") {
        height = grain * 0.25;
        shade = 0.975 + 0.025 * grain;
        r = 0.66 + 0.34 * grain;
      } else if (kind === "water") {
        height =
          0.3 * Math.sin(u * TAU * 5 + Math.sin(v * TAU * 3) * 0.4) +
          0.2 * Math.cos(v * TAU * 9) +
          0.15 * fine;
        shade = 0.84 + 0.12 * coarse + 0.04 * fine;
        r = 0.57 + 0.32 * medium + 0.11 * fine;
      }
      heights[i] = height;
      for (let k = 0; k < 3; k++) {
        color[q + k] = Math.round(Math.min(255, p.rgb[k] * shade));
        rough[q + k] = Math.round(255 * clamp(r));
      }
      color[q + 3] = rough[q + 3] = 255;
    }
  const at = (x, y) =>
    heights[((y + SIZE) % SIZE) * SIZE + ((x + SIZE) % SIZE)];
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++) {
      const q = (y * SIZE + x) * 4,
        dx = (at(x - 1, y) - at(x + 1, y)) * 2,
        dy = (at(x, y - 1) - at(x, y + 1)) * 2,
        length = Math.hypot(dx, dy, 1);
      normals[q] = Math.round(((dx / length) * 0.5 + 0.5) * 255);
      normals[q + 1] = Math.round(((dy / length) * 0.5 + 0.5) * 255);
      normals[q + 2] = Math.round(((1 / length) * 0.5 + 0.5) * 255);
      normals[q + 3] = 255;
    }
  const texture = (data, srgb = false) => {
    const t = new THREE.DataTexture(data, SIZE, SIZE, THREE.RGBAFormat);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.generateMipmaps = true;
    t.needsUpdate = true;
    shared.add(t);
    return t;
  };
  const pack = {
    map: texture(color, true),
    normalMap: texture(normals),
    roughnessMap: texture(rough),
  };
  cache.set(kind, pack);
  return pack;
}
export const isSurfaceTexture = (texture) => shared.has(texture);
let shadow;
export function contactTexture() {
  if (shadow) return shadow;
  const size = 64,
    data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const d = ((x + 0.5) / size - 0.5) ** 2 + ((y + 0.5) / size - 0.5) ** 2;
      data[(y * size + x) * 4 + 3] = Math.round(
        255 * Math.exp(-d * 16) * Math.max(0, 1 - d * 2),
      );
    }
  shadow = new THREE.DataTexture(data, size, size);
  shadow.magFilter = THREE.LinearFilter;
  shadow.minFilter = THREE.LinearMipmapLinearFilter;
  shadow.generateMipmaps = true;
  shadow.needsUpdate = true;
  shared.add(shadow);
  return shadow;
}
export function paintSurface(context, kind) {
  const image = context.createImageData(SIZE, SIZE);
  image.data.set(surfaceTextures(kind).map.image.data);
  context.putImageData(image, 0, 0);
}
export function surfaceMaterial(kind, opts = {}) {
  const p = profiles[kind],
    pack = surfaceTextures(kind);
  const m = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: p.roughness,
    metalness: p.metalness,
    ...pack,
    normalScale: new THREE.Vector2(p.normal, p.normal),
    ...opts,
  });
  // Canvas colors are copied from the unflipped data tiles; align their UVs.
  if (m.map?.isCanvasTexture) m.map.flipY = pack.normalMap.flipY;
  m.userData.surface = kind;
  return m;
}
export function textureQuality(anisotropy) {
  for (const t of shared) {
    if (t.anisotropy !== anisotropy) {
      t.anisotropy = anisotropy;
      t.needsUpdate = true;
    }
  }
}
export function qualitySettings(mode, software, mobile, dpr = 1) {
  const fine = mode === "high",
    low = mode === "low";
  return {
    ratio: software
      ? fine
        ? 1
        : low
          ? 0.5
          : 0.65
      : low
        ? 0.75
        : Math.min(dpr, fine ? 2 : mobile ? 1.25 : 1.6),
    shadowSize: software
      ? fine
        ? 1024
        : 512
      : low
        ? 512
        : mobile
          ? 1024
          : 2048,
    anisotropy: low ? 1 : fine ? 8 : 4,
  };
}
export function rockGeometry() {
  const g = new THREE.CylinderGeometry(0.48, 1, 1, 18, 9),
    p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      y = p.getY(i),
      z = p.getZ(i),
      angle = Math.atan2(z, x),
      erosion =
        0.88 +
        0.055 * Math.sin(angle * 5 + y * 14) +
        0.045 * Math.cos(angle * 9 - y * 21);
    p.setXYZ(i, x * erosion, y, z * erosion);
  }
  g.computeVertexNormals();
  return g;
}
