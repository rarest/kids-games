import * as THREE from "three";

function petalGeometry(sections = 2) {
  const vertices = [],
    indices = [];
  for (let j = 0; j <= sections; j++)
    for (let i = 0; i <= 2; i++) {
      const t = j / sections,
        u = (i / 2 - 0.5) * 2,
        width = Math.sin(t * Math.PI) * 0.55 + 0.04;
      vertices.push(u * width, t, Math.sin(t * Math.PI) * 0.2 + u * u * 0.08);
    }
  for (let j = 0; j < sections; j++)
    for (let i = 0; i < 2; i++) {
      const a = j * 3 + i;
      indices.push(a, a + 1, a + 3, a + 1, a + 4, a + 3);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
function grassGeometry() {
  const geometry = new THREE.BufferGeometry();
  // A curved, tapered leaf. Its tip is a single point, not a rectangular strip.
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        -0.5, -0.5, 0, 0.5, -0.5, 0, -0.32, -0.12, 0.03, 0.32, -0.12, 0.03,
        -0.12, 0.24, 0.11, 0.12, 0.24, 0.11, 0.04, 0.5, 0.21,
      ],
      3,
    ),
  );
  geometry.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4, 4, 5, 6]);
  geometry.computeVertexNormals();
  return geometry;
}
export function createScenery(world, level, palette) {
  const dummy = new THREE.Object3D(),
    batches = new Map(),
    grassData = [],
    cars = [],
    ps = level.platforms;
  let grass = null,
    falling = null,
    response = 0;
  const geometry = {
    box: new THREE.BoxGeometry(1, 1, 1),
    ball: new THREE.SphereGeometry(1, 6, 4),
    branch: new THREE.CylinderGeometry(0.12, 1, 1, 7),
    petal: petalGeometry(),
    blossom: petalGeometry(4),
    cone: new THREE.ConeGeometry(1, 1, 7),
    blade: grassGeometry(),
  };
  const minX = Math.min(...ps.map((p) => p.x)) - 35,
    maxX = Math.max(...ps.map((p) => p.x)) + 35,
    minZ = Math.min(...ps.map((p) => p.z)) - 35,
    maxZ = Math.max(...ps.map((p) => p.z)) + 35;
  const clearOfRoute = (x, z, radius) =>
    ps.every(
      (p) =>
        Math.abs(x - p.x) > p.w / 2 + radius ||
        Math.abs(z - p.z) > p.d / 2 + radius,
    );
  const add = (kind, color, x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0) => {
    const key = `${kind}-${color}`;
    if (!batches.has(key)) batches.set(key, { kind, color, items: [] });
    batches.get(key).items.push({ x, y, z, sx, sy, sz, rx, ry, rz });
  };
  const pose = (v, i, mesh) => {
    dummy.position.set(v.x, v.y, v.z);
    dummy.rotation.set(v.rx || 0, v.ry || 0, v.rz || 0);
    dummy.scale.set(v.sx, v.sy, v.sz);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  };
  const branch = (x, y, z, length, radius, lean, angle) =>
    add(
      "branch",
      0x775344,
      x,
      y,
      z,
      radius,
      length,
      radius,
      Math.sin(angle) * lean,
      0,
      Math.cos(angle) * lean,
    );
  function tree(x, z, i, sakura) {
    const height = 3.8 + (i % 3) * 0.55,
      ground = -2.67;
    branch(x, ground + height / 2, z, height, 0.2, 0, 0);
    for (let k = 0; k < 4; k++)
      add(
        "branch",
        0x936c51,
        x + Math.sin(k * 1.257) * 0.16,
        ground + height * 0.47,
        z + Math.cos(k * 1.257) * 0.16,
        0.035,
        height * 0.68,
        0.035,
      );
    const connect = (start, end, radius) => {
      const axis = new THREE.Vector3().subVectors(end, start);
      const rotation = new THREE.Euler().setFromQuaternion(
        new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          axis.clone().normalize(),
        ),
      );
      const middle = start.clone().add(end).multiplyScalar(0.5);
      add(
        "branch",
        0x775344,
        middle.x,
        middle.y,
        middle.z,
        radius,
        axis.length(),
        radius,
        rotation.x,
        rotation.y,
        rotation.z,
      );
    };
    for (let k = 0; k < 5; k++) {
      const angle = k * 2.399 + i * 0.5,
        y = ground + height * (0.56 + k * 0.052),
        dx = Math.cos(angle),
        dz = Math.sin(angle);
      const joint = new THREE.Vector3(x + dx * 0.95, y + 0.6, z + dz * 0.95);
      connect(new THREE.Vector3(x, y, z), joint, 0.1);
      for (let split = 0; split < 2; split++) {
        const tipAngle = angle + (split ? 0.38 : -0.38);
        const bx = joint.x + Math.cos(tipAngle) * 0.8,
          bz = joint.z + Math.sin(tipAngle) * 0.8,
          by = joint.y + 0.6 + split * 0.15;
        connect(joint, new THREE.Vector3(bx, by, bz), 0.055);
        if (sakura) {
          for (let flower = 0; flower < (i < 3 ? 8 : 3); flower++) {
            const a = flower * 2.399 + k,
              fx = bx + Math.cos(a) * (0.18 + (flower % 3) * 0.17),
              fy = by + Math.sin(flower * 1.7) * 0.35,
              fz = bz + Math.sin(a) * (0.18 + (flower % 3) * 0.17);
            for (let p = 0; p < 5; p++)
              add(
                i < 3 ? "blossom" : "petal",
                [0xf5b8cc, 0xf0a5bf, 0xf9c7d8][(flower + k) % 3],
                fx,
                fy,
                fz,
                0.23,
                0.29,
                0.24,
                1.1,
                p * 1.257,
                0,
              );
            add("box", 0xd88ea8, fx, fy + 0.015, fz, 0.04, 0.03, 0.04);
          }
        } else
          for (let leaf = 0; leaf < 7; leaf++)
            add(
              "petal",
              [0x507d58, 0x6b945e, 0x85a467][(leaf + i) % 3],
              bx + Math.sin(leaf * 2.399) * 0.6,
              by + Math.cos(leaf) * 0.3,
              bz + Math.cos(leaf * 2.399) * 0.6,
              0.6,
              0.85,
              0.65,
              1.15,
              leaf * 2.399,
              0,
            );
      }
    }
  }
  add(
    "box",
    palette.ground,
    (minX + maxX) / 2,
    -3.2,
    (minZ + maxZ) / 2,
    maxX - minX,
    1,
    maxZ - minZ,
  );
  if (level.theme !== "city") {
    const river = (width, y, color) => {
      const vertices = [],
        indices = [];
      for (let i = 0; i <= 30; i++) {
        const x = minX + ((maxX - minX) * i) / 30,
          center = 6 + Math.sin(x * 0.12) * 2.3,
          half = width * (1 + Math.sin(x * 0.18) * 0.08);
        vertices.push(x, y, center - half, x, y, center + half);
        if (i < 30) {
          const a = i * 2;
          indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
        }
      }
      const ribbon = new THREE.BufferGeometry();
      ribbon.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3),
      );
      ribbon.setIndex(indices);
      ribbon.computeVertexNormals();
      const mesh = new THREE.Mesh(
        ribbon,
        new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }),
      );
      mesh.receiveShadow = true;
      world.add(mesh);
    };
    river(2.4, -2.66, 0xbac6a0);
    river(1.8, -2.64, 0x82bbc2);
    for (let i = 0; i < 30; i++) {
      const x = minX + (i * (maxX - minX)) / 30;
      add(
        "ball",
        [0xb0b6a0, 0xa4ac99][i % 2],
        x,
        -2.63,
        3.6 + Math.sin(x * 0.12) * 2.3,
        0.65,
        0.16,
        0.4,
      );
    }
    for (let i = 0; i < 8; i++) {
      add(
        "ball",
        [0x8dad7d, 0x96b585, 0xa7c091][i % 3],
        minX + (i * (maxX - minX)) / 7,
        -3,
        maxZ - 10 + (i % 2) * 5,
        12,
        4 + (i % 3),
        10,
      );
      add(
        "ball",
        [0x9ab78a, 0xb0c29a][i % 2],
        maxX - 9,
        -3,
        minZ + (i * (maxZ - minZ)) / 7,
        11,
        3 + (i % 4),
        13,
      );
    }
    if (level.theme === "cabin")
      for (let i = 0; i < 16; i++) {
        const x = minX + 5 + (i * (maxX - minX)) / 16,
          z = maxZ - 12 + (i % 3) * 3;
        add("branch", 0x745a45, x, -0.6, z, 0.12, 4.2, 0.12);
        for (let tier = 0; tier < 3; tier++)
          add(
            "cone",
            [0x547b60, 0x648a68][i % 2],
            x,
            0.2 + tier * 0.7,
            z,
            1.4 - tier * 0.25,
            2.2,
            1.4 - tier * 0.25,
          );
      }
  }
  for (let i = 0; i < 12; i++) {
    const p = ps[i < 3 ? 0 : i % ps.length],
      side = i < 3 ? -1 : i % 2 ? -1 : 1;
    let z = p.z + (i < 3 ? 3 + i * 3 : ((i * 7) % 9) + 2);
    let x = p.x + side * (i < 3 ? 5.5 + i * 2 : 6.5 + (i % 3) * 2);
    if (level.theme === "city" && i < 3) {
      x = level.spawn.x + 10 + i * 6;
      z = level.spawn.z - 4.8;
    }
    for (
      let tries = 0;
      tries < 16 && !clearOfRoute(x, z, level.theme === "city" ? 2 : 2.8);
      tries++
    )
      x += side * 2;
    if (!clearOfRoute(x, z, level.theme === "city" ? 2 : 2.8)) continue;
    if (level.theme === "city") {
      const h = i < 3 ? 5.5 + i : 3 + (i % 5) * 1.35;
      add(
        "box",
        [0x91a9b3, 0xb6c7cc, 0x7d929d][i % 3],
        x,
        -2.7 + h / 2,
        z,
        3,
        h,
        3.1,
      );
      add("box", 0x526c77, x, -2.65 + h, z, 3.3, 0.2, 3.4);
      for (let row = 0; row < Math.floor(h / 0.7); row++)
        for (let col = 0; col < 3; col++) {
          const windowColor = (row + col) % 3 ? 0xc6e9ee : 0xf5dba0;
          add(
            "box",
            windowColor,
            x - 1 + col,
            -2 + row * 0.7,
            z + 1.56,
            0.43,
            0.35,
            0.025,
          );
          add(
            "box",
            windowColor,
            x - 1.51,
            -2 + row * 0.7,
            z - 1 + col,
            0.025,
            0.35,
            0.43,
          );
        }
      add("box", 0x627c88, x + 0.6, -2.5 + h, z + 0.5, 0.7, 0.4, 0.8);
    } else tree(x, z, i, level.theme === "sakura");
  }
  if (level.theme === "flowers")
    for (let i = 0; i < 160; i++) {
      const p = ps[i % ps.length],
        angle = i * 2.399,
        x =
          i < 48
            ? level.spawn.x + 5 + (i % 8) * 0.4
            : p.x + Math.cos(angle) * (4 + (i % 5)),
        z =
          i < 48
            ? level.spawn.z - 3.4 - Math.floor(i / 8) * 0.35
            : p.z + Math.sin(angle) * (4 + (i % 5)),
        y = -2.06 + (i % 3) * 0.09;
      add("branch", 0x49804b, x, -2.35, z, 0.025, 0.7, 0.025);
      for (let p = 0; p < 6; p++)
        add(
          "petal",
          [0xf7baca, 0xf6d15c, 0xb3a4df, 0xf4f1df][i % 4],
          x,
          y,
          z,
          0.24,
          0.27,
          0.24,
          1.25,
          p * 1.047,
          0,
        );
      add("ball", 0xdfa733, x, y + 0.015, z, 0.075, 0.065, 0.075);
      for (let side of [-1, 1])
        add(
          "petal",
          0x4d895f,
          x,
          -2.33,
          z,
          0.22,
          0.35,
          0.25,
          0.8,
          side,
          side * 0.8,
        );
    }
  if (level.theme === "cabin")
    for (let i = 0; i < 4; i++) {
      const p = ps[(i * 3) % ps.length],
        z = i < 2 ? level.spawn.z - 4.8 : p.z + 5;
      let x = i < 2 ? level.spawn.x + 5.5 + i * 8 : p.x - 7;
      for (let tries = 0; tries < 16 && !clearOfRoute(x, z, 3); tries++) x -= 3;
      add("box", 0xb88c61, x, -1.3, z, 3.8, 2.8, 3);
      for (let y = 0; y < 8; y++)
        add(
          "branch",
          0x8c684a,
          x,
          -2.5 + y * 0.32,
          z + 1.53,
          0.13,
          3.9,
          0.13,
          0,
          0,
          Math.PI / 2,
        );
      for (let side of [-1, 1])
        add(
          "box",
          0x734f45,
          x + side * 0.98,
          0.65,
          z,
          2.8,
          0.16,
          3.8,
          0,
          0,
          -side * 0.55,
        );
      add("box", 0x587c82, x - 1, -1.25, z + 1.55, 0.7, 0.7, 0.05);
      add("box", 0x587c82, x - 1.92, -1.25, z, 0.05, 0.7, 0.7);
      add("box", 0x6e4e3c, x + 0.8, -1.65, z + 1.55, 0.8, 1.7, 0.06);
      add("box", 0x7a6e64, x + 0.9, 1.1, z + 0.6, 0.4, 1.4, 0.4);
      add("box", 0xd0aa77, x, -2.5, z + 2.2, 4.4, 0.22, 1.1);
    }
  if (level.theme === "city") {
    add("box", 0x536269, (minX + maxX) / 2, -2.63, -8.5, maxX - minX, 0.12, 4);
    for (let x = minX; x < maxX; x += 4)
      add("box", 0xf5e8bd, x, -2.55, -8.5, 2, 0.025, 0.1);
    for (let i = 0; i < 5; i++) {
      const car = new THREE.Group();
      world.add(car);
      for (const [color, x, y, z, sx, sy, sz] of [
        [0xe4ad91, 0, 0.35, 0, 1.6, 0.5, 0.8],
        [0x49606b, 0, 0.7, 0, 0.75, 0.3, 0.65],
        [0x303c43, -0.5, 0.15, -0.43, 0.3, 0.3, 0.12],
        [0x303c43, 0.5, 0.15, -0.43, 0.3, 0.3, 0.12],
        [0x303c43, -0.5, 0.15, 0.43, 0.3, 0.3, 0.12],
        [0x303c43, 0.5, 0.15, 0.43, 0.3, 0.3, 0.12],
      ]) {
        const m = new THREE.Mesh(
          geometry.box,
          new THREE.MeshStandardMaterial({ color }),
        );
        m.position.set(x, y, z);
        m.scale.set(sx, sy, sz);
        m.castShadow = true;
        car.add(m);
      }
      car.position.set(
        level.spawn.x + 3 + i * 7,
        -2.5,
        -8.5 + ((i % 2) - 0.5) * 1.6,
      );
      cars.push({ car, speed: 1 + i * 0.2 });
    }
    for (const p of ps)
      for (const side of [-1, 1]) {
        add(
          "box",
          0x72848e,
          p.x,
          p.y + 0.5,
          p.z + (side * p.d) / 2,
          p.w,
          0.05,
          0.05,
        );
        for (const x of [-0.4, 0.4])
          add(
            "box",
            0x72848e,
            p.x + p.w * x,
            p.y + 0.25,
            p.z + (side * p.d) / 2,
            0.04,
            0.5,
            0.04,
          );
      }
  }
  for (const { kind, color, items } of batches.values()) {
    const mat = new THREE.MeshLambertMaterial({
        color,
        side:
          kind === "petal" || kind === "blossom"
            ? THREE.DoubleSide
            : THREE.FrontSide,
      }),
      mesh = new THREE.InstancedMesh(geometry[kind], mat, items.length);
    mesh.castShadow =
      kind !== "petal" && kind !== "blossom" && color !== 0xd88ea8;
    mesh.receiveShadow = kind !== "petal" && kind !== "blossom";
    items.forEach((v, i) => pose(v, i, mesh));
    world.add(mesh);
  }
  if (level.theme !== "city") {
    for (const p of ps)
      for (let i = 0; i < 28; i++) {
        const side = i % 2 ? -1 : 1,
          along = (i / 28 - 0.5) * 0.82;
        grassData.push({
          x: p.x + (i % 4 < 2 ? side * p.w * 0.43 : along * p.w),
          y: p.y + 0.13,
          z: p.z + (i % 4 < 2 ? along * p.d : side * p.d * 0.43),
          sx: 0.07,
          sy: 0.18 + (i % 5) * 0.035,
          sz: 1,
          ry: i * 2.399,
          bend: 0,
        });
      }
    for (let i = 0; i < 320; i++) {
      const p = ps[i % ps.length],
        a = i * 2.399,
        r = 4 + (i % 9);
      grassData.push({
        x: p.x + Math.cos(a) * r,
        y: -2.43,
        z: p.z + Math.sin(a) * r,
        sx: 0.12,
        sy: 0.3 + (i % 7) * 0.035,
        sz: 1,
        ry: a,
        bend: 0,
      });
    }
    grass = new THREE.InstancedMesh(
      geometry.blade,
      new THREE.MeshLambertMaterial({
        color: 0x7c9e64,
        side: THREE.DoubleSide,
      }),
      grassData.length,
    );
    grass.receiveShadow = true;
    grass.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    world.add(grass);
    falling = new THREE.InstancedMesh(
      geometry.petal,
      new THREE.MeshLambertMaterial({
        color: level.theme === "sakura" ? 0xffc4d8 : 0xa7b76f,
        side: THREE.DoubleSide,
      }),
      72,
    );
    falling.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    world.add(falling);
  }
  return {
    update(player, dt, time) {
      response = 0;
      if (grass) {
        const walking =
          player.grounded && Math.hypot(player.vx, player.vz) > 0.2;
        for (const [i, v] of grassData.entries()) {
          const near = Math.max(
            0,
            1 - Math.hypot(v.x - player.x, v.z - player.z) / 1.35,
          );
          v.bend *= Math.exp(-dt * 5);
          if (walking && Math.abs(v.y - player.y) < 0.8)
            v.bend = Math.min(0.7, v.bend + near * dt * 8);
          response = Math.max(response, v.bend);
          v.rz = Math.sin(time * 1.8 + i) * 0.07 + v.bend;
          pose(v, i, grass);
        }
        grass.instanceMatrix.needsUpdate = true;
      }
      if (falling) {
        for (let i = 0; i < falling.count; i++) {
          const anchor = ps[i % ps.length],
            t = time + i * 0.43;
          dummy.position.set(
            anchor.x + Math.sin(t * 0.38 + i) * 5,
            5 - ((t * 0.55) % 7.5),
            anchor.z + Math.cos(t * 0.25 + i) * 5,
          );
          dummy.rotation.set(t, i, t * 0.7);
          dummy.scale.set(0.12, 0.18, 0.13);
          dummy.updateMatrix();
          falling.setMatrixAt(i, dummy.matrix);
        }
        falling.instanceMatrix.needsUpdate = true;
      }
      for (const { car, speed } of cars) {
        car.position.x += dt * speed;
        if (car.position.x > maxX) car.position.x = minX;
      }
    },
    grassResponse() {
      return response;
    },
  };
}
