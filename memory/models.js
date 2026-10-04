import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const COLORS = [0xf4a895, 0xa4c8b0, 0xcbb7de, 0xf0cc7d, 0x94c7d1, 0xe5a8bd, 0xb4c184, 0xaaaed5];
export const NAMES = ['小兔', '花朵', '草莓', '星星', '月亮', '贝壳', '蘑菇', '樱桃', '苹果', '水晶', '蝴蝶', '小鸭', '星球', '四叶草', '蛋糕', '小鱼'];
export function symbolName(symbol) { return `${NAMES[symbol % 16]}${symbol >= 16 ? ` · ${Math.floor(symbol / 16) + 1}` : ''}`; }
export function roundedSlab(width, height, depth, radius = .18) {
  const s = new THREE.Shape(), x = -width / 2, y = -height / 2, r = Math.min(radius, width / 2, height / 2);
  s.moveTo(x + r, y); s.lineTo(x + width - r, y); s.quadraticCurveTo(x + width, y, x + width, y + r);
  s.lineTo(x + width, y + height - r); s.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  s.lineTo(x + r, y + height); s.quadraticCurveTo(x, y + height, x, y + height - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: .025, bevelSize: .025, bevelSegments: 2, curveSegments: 4, steps: 1 });
  g.rotateX(-Math.PI / 2); g.translate(0, -depth / 2, 0); return g;
}
export function createModelFactory() {
  const sphere = new THREE.SphereGeometry(1, 12, 8), cylinder = new THREE.CylinderGeometry(1, 1, 1, 16), cone = new THREE.ConeGeometry(1, 1, 12);
  const torus = new THREE.TorusGeometry(1, .13, 6, 24), box = new THREE.BoxGeometry(1, 1, 1), crystal = new THREE.OctahedronGeometry(1);
  const materials = new Map();
  function material(color, metal = false) {
    const key = `${color}:${metal}`;
    if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: metal ? .32 : .67, metalness: metal ? .5 : .02 }));
    return materials.get(key);
  }
  function build(symbol) {
    const group = new THREE.Group(), pieces = new Map();
    const accent = COLORS[Math.floor(symbol / 16) % COLORS.length], white = 0xfff4e1, green = 0x6c927d, dark = 0x46554e, gold = 0xdfb866;
    const part = (geo, color, position, scale = [1, 1, 1], rotation = [0, 0, 0], metal = false) => {
      const mesh = new THREE.Mesh(geo); mesh.position.set(...position); mesh.scale.set(...scale); mesh.rotation.set(...rotation); mesh.updateMatrix();
      const copy = (geo.index ? geo.toNonIndexed() : geo.clone()).applyMatrix4(mesh.matrix), mat = material(color, metal);
      const list = pieces.get(mat) || []; list.push(copy); pieces.set(mat, list);
    };
    const orb = (color, x, y, z, sx, sy = sx, sz = sx) => part(sphere, color, [x, y, z], [sx, sy, sz]);
    const eyes = (x = .13, y = .47, z = .25) => { orb(dark, -x, y, z, .035); orb(dark, x, y, z, .035); };
    switch (symbol % 16) {
      case 0: // Separate sculpted ears, muzzle, cheeks and a tiny tail.
        orb(white, 0, .3, .06, .28, .3, .26); orb(white, 0, .58, -.03, .25);
        orb(white, -.14, .93, -.08, .085, .28, .09); orb(white, .14, .93, -.08, .085, .28, .09);
        orb(accent, -.14, .94, -.015, .043, .2, .035); orb(accent, .14, .94, -.015, .043, .2, .035);
        eyes(.1, .65, .2); orb(accent, 0, .56, .22, .04); orb(accent, -.18, .54, .17, .06, .025, .03); orb(accent, .18, .54, .17, .06, .025, .03);
        orb(white, -.28, .17, -.12, .1); break;
      case 1:
      case 13: {
        const petals = symbol % 16 === 13 ? 4 : 6;
        for (let i = 0; i < petals; i++) { const a = i / petals * Math.PI * 2; orb(accent, Math.cos(a) * .25, .24, Math.sin(a) * .25, .22, .14, .23); }
        orb(gold, 0, .28, 0, .16, .13); part(cylinder, green, [0, .11, 0], [.035, .15, .035]); break;
      }
      case 2:
        orb(accent, 0, .35, 0, .31, .39, .29);
        for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; orb(green, Math.cos(a) * .12, .72, Math.sin(a) * .12, .16, .025, .065); }
        for (let i = 0; i < 9; i++) { const a = i * 2.4; orb(white, Math.sin(a) * .26, .16 + i % 3 * .17, Math.cos(a) * .24, .018, .025); } break;
      case 3: {
        const shape = new THREE.Shape();
        for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 - Math.PI / 2, r = i % 2 ? .19 : .45; const x = Math.cos(a) * r, y = Math.sin(a) * r; i ? shape.lineTo(x, y) : shape.moveTo(x, y); }
        shape.closePath(); const g = new THREE.ExtrudeGeometry(shape, { depth: .12, bevelEnabled: true, bevelSize: .035, bevelThickness: .035, bevelSegments: 2, steps: 1 });
        g.rotateX(-Math.PI / 2); part(g, gold, [0, .16, 0]); g.dispose(); orb(accent, 0, .27, 0, .085, .05); break;
      }
      case 4:
        for (let i = 0; i < 12; i++) { const a = (i / 11 * 1.4 + .3) * Math.PI; const r = .38; orb(gold, Math.cos(a) * r + .09, .18, Math.sin(a) * r, .085 + Math.sin(i / 11 * Math.PI) * .055, .1); } break;
      case 5:
        for (let i = 0; i < 7; i++) { const a = -.8 + i / 6 * 1.6; part(sphere, i % 2 ? white : accent, [Math.sin(a) * .21, .16, -.05], [.085, .12, .42], [0, a, 0]); }
        orb(white, 0, .12, .28, .18, .09, .13); break;
      case 6:
        part(cylinder, white, [0, .24, 0], [.1, .38, .1]); orb(accent, 0, .48, 0, .38, .2, .36);
        for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28; orb(white, Math.cos(a) * .2, .63, Math.sin(a) * .2, .06, .025); } break;
      case 7:
        orb(accent, -.19, .22, .06, .19); orb(accent, .19, .22, .06, .19);
        part(cylinder, green, [-.1, .52, 0], [.019, .55, .019], [0, 0, -.4]); part(cylinder, green, [.1, .52, 0], [.019, .55, .019], [0, 0, .4]);
        orb(green, .16, .77, 0, .19, .025, .08); break;
      case 8:
        orb(accent, -.1, .32, 0, .29, .3, .27); orb(accent, .1, .32, 0, .29, .3, .27);
        part(cylinder, dark, [0, .66, 0], [.03, .2, .03], [0, 0, -.15]); orb(green, .15, .72, 0, .17, .035, .08); break;
      case 9:
        part(crystal, accent, [0, .44, 0], [.3, .58, .27]); part(crystal, white, [-.28, .23, .06], [.12, .28, .12]); part(crystal, gold, [.26, .21, -.03], [.13, .26, .13]); break;
      case 10:
        for (const side of [-1, 1]) { orb(accent, side * .25, .23, -.12, .26, .08, .22); orb(white, side * .23, .2, .18, .21, .065, .18); }
        orb(dark, 0, .25, 0, .045, .06, .32); break;
      case 11:
        orb(gold, 0, .25, .05, .33, .25, .3); orb(gold, .13, .52, -.08, .2);
        orb(accent, -.17, .31, .08, .17, .045, .18); part(cone, 0xe5a36e, [.15, .5, -.33], [.09, .18, .07], [Math.PI / 2, 0, 0]); orb(dark, .25, .58, -.15, .025); break;
      case 12:
        orb(accent, 0, .35, 0, .3); part(torus, gold, [0, .35, 0], [.47, .47, .47], [Math.PI / 2 - .35, 0, 0], true); break;
      case 14:
        part(cylinder, accent, [0, .17, 0], [.25, .25, .25]);
        for (let i = 0; i < 3; i++) orb(white, 0, .32 + i * .1, 0, .28 - i * .065, .1);
        orb(0xd88b8c, 0, .59, 0, .07); break;
      case 15:
        orb(accent, 0, .28, 0, .32, .15, .22); part(cone, accent, [-.34, .28, 0], [.17, .25, .14], [0, 0, Math.PI / 2]); orb(dark, .2, .37, .14, .03); break;
    }
    // Raised seven-segment edition number keeps late-game lookalikes unambiguous, without a flat image.
    if (symbol >= 16) {
      const segments = ['abcedf', 'bc', 'abged', 'abgcd', 'fgbc', 'afgcd', 'afgecd', 'abc', 'abcdefg', 'abfgcd'];
      const digits = String(Math.floor(symbol / 16) + 1);
      for (let i = 0; i < digits.length; i++) {
        const x = (i - (digits.length - 1) / 2) * .22;
        const slots = { a: [x, .18, .52, .16, .032], g: [x, .18, .68, .16, .032], d: [x, .18, .84, .16, .032], f: [x - .08, .18, .60, .032, .13], b: [x + .08, .18, .60, .032, .13], e: [x - .08, .18, .76, .032, .13], c: [x + .08, .18, .76, .032, .13] };
        for (const k of segments[Number(digits[i])]) { const [a, b, c, w, h] = slots[k]; part(box, 0x617356, [a, b, c], [w, .028, h], [0, 0, 0], true); }
      }
    }
    for (const [mat, geometries] of pieces) {
      const merged = mergeGeometries(geometries); geometries.forEach(g => g.dispose());
      const mesh = new THREE.Mesh(merged, mat); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh);
    }
    return group;
  }
  function disposeObject(group) { group.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  return { build, disposeObject, materials, sphere, cylinder, cone, box, material };
}
