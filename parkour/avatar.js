import * as THREE from "three";
import { PLAYER_HEIGHT } from "./core.js";

export function createAvatar() {
  const group = new THREE.Group(),
    bodyMaterial = new THREE.MeshStandardMaterial({
      color: "#ef4444",
      roughness: 0.65,
    }),
    dark = new THREE.MeshStandardMaterial({ color: 0x352b35 });
  const rod = new THREE.CylinderGeometry(0.055, 0.055, 1, 8),
    ball = new THREE.SphereGeometry(1, 14, 10),
    box = new THREE.BoxGeometry(1, 1, 1),
    limbs = [],
    clothes = [];
  let skin = { id: "red", color: "#ef4444" },
    outfit = null;
  const mesh = (
    geometry,
    material,
    parent,
    x,
    y,
    z,
    sx = 1,
    sy = 1,
    sz = 1,
  ) => {
    const m = new THREE.Mesh(geometry, material);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    m.castShadow = true;
    parent.add(m);
    return m;
  };
  mesh(rod, bodyMaterial, group, 0, 0.96, 0, 1, 0.52, 1);
  const head = mesh(
    ball,
    bodyMaterial,
    group,
    0,
    PLAYER_HEIGHT - 0.25,
    0,
    0.25,
    0.25,
    0.25,
  );
  for (const x of [-0.08, 0.08])
    mesh(ball, dark, group, x, PLAYER_HEIGHT - 0.2, 0.228, 0.024, 0.031, 0.016);
  const points = Array.from({ length: 13 }, (_, i) => {
    const angle = Math.PI + (i * Math.PI) / 12;
    return new THREE.Vector3(
      Math.cos(angle) * 0.105,
      PLAYER_HEIGHT - 0.27 + Math.sin(angle) * 0.075,
      0.236,
    );
  });
  const smile = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points),
    16,
    0.015,
    5,
    false,
  );
  mesh(smile, dark, group, 0, 0, 0);
  for (const [x, y, length] of [
    [-0.19, 1.15, 0.43],
    [0.19, 1.15, 0.43],
    [-0.12, 0.73, 0.65],
    [0.12, 0.73, 0.65],
  ]) {
    const p = new THREE.Group();
    p.position.set(x, y, 0);
    group.add(p);
    mesh(rod, bodyMaterial, p, 0, -length / 2, 0, 1, length, 1);
    mesh(ball, bodyMaterial, p, 0, -length, 0, 0.07, 0.07, 0.07);
    limbs.push(p);
  }
  function setOutfit(value) {
    if (value?.id === outfit?.id) return;
    for (const m of clothes) {
      m.parent.remove(m);
      m.material.dispose();
    }
    clothes.length = 0;
    outfit = value;
    if (!value) return;
    const cloth = (parent, color, x, y, z, sx, sy, sz) => {
      const m = mesh(
        box,
        new THREE.MeshStandardMaterial({ color, roughness: 0.9 }),
        parent,
        x,
        y,
        z,
        sx,
        sy,
        sz,
      );
      clothes.push(m);
      return m;
    };
    cloth(group, value.top, 0, 0.97, 0, 0.36, 0.46, 0.22);
    cloth(group, value.accent, 0, 1.18, 0.025, 0.3, 0.04, 0.23); // collar
    for (let i = 0; i < 2; i++)
      cloth(limbs[i], value.top, 0, -0.12, 0, 0.16, 0.25, 0.18);
    for (let i = 2; i < 4; i++) {
      cloth(limbs[i], value.pants, 0, -0.26, 0, 0.17, 0.5, 0.19);
      cloth(limbs[i], value.shoes, 0, -0.6, 0.055, 0.21, 0.14, 0.32);
      cloth(limbs[i], value.accent, 0, -0.66, 0.055, 0.215, 0.025, 0.33);
    }
    if (value.pattern === "striped")
      for (let i = 0; i < 3; i++)
        cloth(
          group,
          value.accent,
          0,
          0.83 + i * 0.11,
          0.115,
          0.36,
          0.028,
          0.012,
        );
    if (value.pattern === "checks")
      for (let i = 0; i < 3; i++) {
        cloth(
          group,
          value.accent,
          -0.12 + i * 0.12,
          0.97,
          0.115,
          0.025,
          0.43,
          0.012,
        );
        cloth(
          group,
          value.accent,
          0,
          0.84 + i * 0.12,
          0.12,
          0.36,
          0.025,
          0.012,
        );
      }
    if (value.pattern === "trim") {
      cloth(group, value.accent, 0, 0.98, 0.12, 0.025, 0.4, 0.012);
      for (let i = 0; i < 2; i++)
        cloth(limbs[i], value.accent, 0, -0.23, 0, 0.17, 0.035, 0.19);
    }
    if (value.pattern === "pocket") {
      cloth(group, value.accent, -0.09, 0.99, 0.125, 0.1, 0.11, 0.025);
      cloth(group, value.pants, 0, 0.78, 0.13, 0.25, 0.11, 0.025);
    }
  }
  return {
    group,
    setOutfit,
    setSkin(value) {
      skin = value;
      bodyMaterial.color.set(value.id === "rainbow" ? "#ed738c" : value.color);
    },
    update(player, time, home) {
      group.position.set(player.x, player.y, player.z);
      group.rotation.y = home ? Math.PI + 0.15 : player.yaw;
      const speed = Math.hypot(player.vx, player.vz),
        swing =
          Math.sin(time * (speed > 0.1 ? 12 : 2.5)) *
          (speed > 0.1 ? 0.65 : 0.12);
      limbs.forEach((p, i) => {
        p.rotation.x = (i % 2 ? -1 : 1) * swing;
        p.rotation.z = i < 2 ? (i ? -0.12 : 0.12) : 0;
      });
      head.rotation.z = Math.sin(time * 2) * 0.04;
      if (skin.id === "rainbow")
        bodyMaterial.color.setHSL((time * 0.13) % 1, 0.75, 0.53);
    },
    outfit() {
      return outfit?.id ?? "";
    },
    dispose() {
      setOutfit(null);
      for (const g of [rod, ball, box, smile]) g.dispose();
      bodyMaterial.dispose();
      dark.dispose();
    },
  };
}
