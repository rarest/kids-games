import * as THREE from "three";
const LIGHTS = {
  morning: {
    hemi: 0xecf8ff,
    sky: 0xc9e4ef,
    sun: 0xffedce,
    ground: 0x647e68,
    ambient: 2.4,
    intensity: 3.4,
    direction: [-8, 17, -10],
  },
  dawn: {
    hemi: 0xffd1b9,
    sky: 0xf3c4b3,
    sun: 0xffb77c,
    ground: 0x826d78,
    ambient: 1.8,
    intensity: 2.3,
    direction: [-22, 6, -15],
  },
  night: {
    hemi: 0x92aed0,
    sky: 0x233750,
    sun: 0xa4c9f6,
    ground: 0x354757,
    ambient: 1.15,
    intensity: 0.65,
    direction: [10, 15, -12],
  },
};
export function createLighting(scene, sun, hemi) {
  let timeOfDay = "morning",
    elapsed = 2,
    from = LIGHTS.morning,
    to = LIGHTS.morning;
  const current = {
    sky: new THREE.Color(),
    sun: new THREE.Color(),
    ground: new THREE.Color(),
    hemi: new THREE.Color(),
    ambient: 2.4,
    intensity: 3.4,
    direction: new THREE.Vector3(),
  };
  const color = new THREE.Color(),
    a = new THREE.Color();
  function blend(dt, position) {
    elapsed = Math.min(2, elapsed + dt);
    let t = elapsed / 2;
    t = t * t * (3 - 2 * t);
    for (const field of ["sky", "sun", "ground", "hemi"])
      current[field].copy(a.set(from[field])).lerp(color.set(to[field]), t);
    current.ambient = from.ambient + (to.ambient - from.ambient) * t;
    current.intensity = from.intensity + (to.intensity - from.intensity) * t;
    for (const [i, axis] of ["x", "y", "z"].entries())
      current.direction[axis] =
        from.direction[i] + (to.direction[i] - from.direction[i]) * t;
    scene.background.copy(current.sky);
    scene.fog.color.copy(current.sky);
    sun.color.copy(current.sun);
    sun.intensity = current.intensity;
    hemi.color.copy(current.hemi);
    hemi.groundColor.copy(current.ground);
    hemi.intensity = current.ambient;
    sun.position.copy(position).add(current.direction);
    sun.target.position.copy(position);
  }
  return {
    set(value) {
      if (!LIGHTS[value]) return;
      from = {
        sky: current.sky.getHex(),
        sun: current.sun.getHex(),
        ground: current.ground.getHex(),
        hemi: current.hemi.getHex(),
        ambient: current.ambient,
        intensity: current.intensity,
        direction: current.direction.toArray(),
      };
      to = LIGHTS[value];
      timeOfDay = value;
      elapsed = 0;
    },
    update: blend,
    info() {
      return { timeOfDay, sunIntensity: current.intensity };
    },
  };
}
