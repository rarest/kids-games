import * as THREE from "three";
import { roadAt } from "./core.js";
// All racers share a single dynamic draw call; no sprite allocation in the animation loop.
export function makeTrails(parent, track, cars, skins) {
  const count = 25,
    capacity = cars.length * 2 * (count - 1) * 6,
    positions = new Float32Array(capacity * 3),
    colors = new Float32Array(capacity * 4),
    geo = new THREE.BufferGeometry();
  geo.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage),
  );
  geo.setAttribute(
    "color",
    new THREE.BufferAttribute(colors, 4).setUsage(THREE.DynamicDrawUsage),
  );
  geo.setDrawRange(0, 0);
  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    }),
  );
  mesh.frustumCulled = false;
  parent.add(mesh);
  const histories = cars.map(() => []),
    palette = skins.map((s) => new THREE.Color(s.stripe)),
    corners = [0, 1, 2, 2, 1, 3];
  let last = -Infinity;
  return (race, time) => {
    let v = 0;
    if (time < last) histories.forEach((h) => (h.length = 0));
    const sample = time - last >= 1 / 45;
    if (sample) last = time;
    race.cars.forEach((car, i) => {
      const history = histories[i];
      if (car.finished || car.respawn > 0 || car.speed < 5) {
        history.length = 0;
        return;
      }
      const boost = car.boosting === true,
        road = roadAt(track, car.s - 2.9),
        point = {
          x: road.x + road.nx * car.offset,
          y: road.y + 0.52,
          z: road.z + road.nz * car.offset,
          nx: road.nx,
          nz: road.nz,
          width: boost ? 0.42 : 0.17,
          color: palette[i % palette.length],
          s: car.s,
        };
      if (sample) {
        if (history[0] && Math.abs(history[0].s - car.s) > 30)
          history.length = 0;
        history.unshift(point);
        history.length = Math.min(count, history.length);
      }
      for (const side of [-1, 1])
        for (let j = 0; j < history.length - 1; j++) {
          const a = history[j],
            b = history[j + 1];
          for (const k of corners) {
            const p = k < 2 ? a : b,
              sign = k % 2 ? 1 : -1,
              width = side * 0.52 + sign * p.width,
              alpha =
                Math.pow(
                  1 - (j + (k < 2 ? 0 : 1)) / (history.length - 1),
                  1.4,
                ) * (boost ? 0.9 : 0.6);
            positions[v * 3] = p.x + p.nx * width;
            positions[v * 3 + 1] = p.y;
            positions[v * 3 + 2] = p.z + p.nz * width;
            colors[v * 4] = p.color.r;
            colors[v * 4 + 1] = p.color.g;
            colors[v * 4 + 2] = p.color.b;
            colors[v * 4 + 3] = alpha;
            v++;
          }
        }
    });
    geo.setDrawRange(0, v);
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
    return v;
  };
}
