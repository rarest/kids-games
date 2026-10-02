import { createAsset } from "./materials.js";
const GOLD = "#e9b952",
  SILVER = "#abbcc2",
  DARK = "#37424c",
  CREAM = "#f5dfae";
function eyes(a, parent, y = 0.7, spread = 0.16, size = 0.12) {
  for (const side of [-1, 1]) {
    a.part(
      "sphere",
      "#fff9df",
      [size, size * 1.2, size * 0.45],
      [side * spread, y, 0.29],
      "eye",
      parent,
    );
    a.part(
      "sphere",
      "#242638",
      [size * 0.45, size * 0.65, size * 0.25],
      [side * spread + 0.015, y, 0.318],
      "pupil",
      parent,
    );
  }
}
function legs(a, parent, color, count = 2) {
  for (let i = 0; i < count; i++) {
    const x = (i - (count - 1) / 2) * (0.65 / count);
    a.part(
      "sphere",
      color,
      [0.18, 0.22, 0.28],
      [x, 0.12, 0.01],
      "foot",
      parent,
    );
  }
}
function tracked(a, w = 1, h = 1) {
  const base = a.update;
  a.update = (e, t = 0) => {
    base(e);
    a.group.scale.set((e.w ?? w) / w, (e.h ?? h) / h, 1);
    a.group.rotation.y = (e.facing ?? 1) < 0 ? -0.22 : 0.22;
  };
  return a;
}
export function createCrate(pool, big = false) {
  const a = createAsset(pool, big ? "bigcrate" : "crate");
  a.part(
    "round",
    "#bf874e",
    [0.96, 0.96, 0.88],
    [0, 0.5, 0],
    "wooden-box",
    a.group,
    "wood",
  );
  for (const side of [-1, 1]) {
    a.part(
      "box",
      "#e2b778",
      [0.12, 0.94, 0.08],
      [side * 0.37, 0.5, 0.47],
      "frame",
      a.group,
      "wood",
    );
    a.part(
      "box",
      "#e2b778",
      [0.94, 0.11, 0.08],
      [0, 0.5 + side * 0.37, 0.47],
      "frame",
      a.group,
      "wood",
    );
  }
  const brace = a.part(
    "box",
    "#deb078",
    [0.12, 1.04, 0.08],
    [0, 0.5, 0.49],
    "diagonal-brace",
    a.group,
    "wood",
  );
  brace.rotation.z = -0.7;
  for (const x of [-0.36, 0.36])
    for (const y of [0.13, 0.87])
      a.part("sphere", DARK, [0.045, 0.045, 0.025], [x, y, 0.527], "nail");
  return tracked(a);
}
export function createMetal(pool) {
  const a = createAsset(pool, "metal");
  a.part(
    "round",
    SILVER,
    [0.96, 0.96, 0.88],
    [0, 0.5, 0],
    "metal-box",
    a.group,
    "metal",
  );
  a.part("round", DARK, [0.67, 0.67, 0.03], [0, 0.5, 0.455], "recess");
  const ring = a.part(
    "torus",
    SILVER,
    [0.56, 0.56, 0.23],
    [0, 0.5, 0.49],
    "vent-ring",
    a.group,
    "metal",
  );
  for (let i = 0; i < 5; i++)
    a.part(
      "box",
      SILVER,
      [0.46, 0.045, 0.06],
      [0, 0.34 + i * 0.08, 0.5],
      "vent",
      a.group,
      "metal",
    );
  return tracked(a);
}
export function createApple(pool) {
  const a = createAsset(pool, "apple");
  for (const x of [-0.14, 0.14])
    a.part("sphere", "#df483b", [0.65, 0.8, 0.75], [x, 0.44, 0], "apple-lobe");
  const stem = a.part(
    "cylinder",
    "#724530",
    [0.06, 0.23, 0.06],
    [0, 0.88, 0],
    "stem",
  );
  stem.rotation.z = -0.25;
  const leaf = a.part(
    "sphere",
    "#77a852",
    [0.35, 0.1, 0.15],
    [0.15, 0.9, 0],
    "leaf",
    a.group,
    "leaf",
  );
  leaf.rotation.z = 0.4;
  return tracked(a);
}
export function createBall(pool) {
  const a = createAsset(pool, "ball");
  a.part("sphere", "#e56337", [0.96, 0.96, 0.96], [0, 0.5, 0], "ball");
  for (const r of [0, Math.PI / 2]) {
    const ring = a.part(
      "torus",
      "#fff0ac",
      [1.02, 1.02, 0.09],
      [0, 0.5, 0],
      "ball-seam",
    );
    ring.rotation.y = r;
  }
  return tracked(a);
}
export function createObject(kind, pool) {
  switch (kind) {
    case "crate":
      return createCrate(pool);
    case "bigcrate":
      return createCrate(pool, true);
    case "metal":
      return createMetal(pool);
    case "apple":
      return createApple(pool);
    case "ball":
      return createBall(pool);
    default:
      throw new Error(`Unknown object ${kind}`);
  }
}

export function createEnemy(kind, pool) {
  const a = kind === "mimic" ? createCrate(pool) : createAsset(pool, kind),
    { part, group } = a;
  group.userData.silhouette = kind;
  switch (kind) {
    case "dog":
      part(
        "round",
        "#699bb0",
        [0.73, 0.43, 0.44],
        [0, 0.47, 0],
        "robot-dog-body",
        group,
        "metal",
      );
      part(
        "round",
        SILVER,
        [0.48, 0.4, 0.44],
        [0.24, 0.71, 0.02],
        "head",
        group,
        "metal",
      );
      part("round", DARK, [0.26, 0.15, 0.28], [0.45, 0.65, 0.18], "muzzle");
      for (const s of [-1, 1]) {
        part(
          "cone",
          DARK,
          [0.16, 0.25, 0.19],
          [0.15 + s * 0.19, 0.95, 0],
          "ear",
        );
        part(
          "cylinder",
          DARK,
          [0.22, 0.13, 0.22],
          [s * 0.27, 0.17, 0],
          "wheel",
        ).rotation.x = Math.PI / 2;
      }
      part("sphere", "#ec7856", [0.09, 0.1, 0.05], [0.33, 0.79, 0.26], "eye");
      break;
    case "bird":
    case "pelican":
      part(
        "sphere",
        kind === "bird" ? "#ab75c0" : "#e9e6d4",
        [0.62, 0.64, 0.44],
        [0, 0.49, 0],
        "bird-body",
      );
      part(
        "sphere",
        "#eee4c9",
        [0.42, 0.4, 0.42],
        [0.12, 0.78, 0.07],
        "bird-head",
      );
      part(
        "cone",
        "#e9b047",
        [kind === "pelican" ? 0.57 : 0.3, 0.25, 0.19],
        [0.32, 0.7, 0.2],
        "beak",
      ).rotation.z = -Math.PI / 2;
      for (const s of [-1, 1]) {
        const wing = part(
          "sphere",
          kind === "bird" ? "#77549b" : "#a6bcc6",
          [0.42, 0.2, 0.19],
          [s * 0.35, 0.53, 0],
          `wing-${s}`,
        );
        wing.rotation.z = s * 0.4;
      }
      eyes(a, group, 0.83, 0.1, 0.085);
      legs(a, group, "#dfac52");
      break;
    case "caterpillar":
      for (let i = 0; i < 4; i++) {
        part(
          "sphere",
          i === 3 ? "#c4d955" : "#73a54d",
          [0.35, 0.48, 0.42],
          [-0.33 + i * 0.22, 0.36, 0],
          `segment-${i}`,
        );
        part(
          "sphere",
          "#bd7845",
          [0.16, 0.12, 0.23],
          [-0.33 + i * 0.22, 0.08, 0.1],
          "foot",
        );
      }
      part("sphere", "#243428", [0.06, 0.09, 0.035], [0.38, 0.49, 0.2], "eye");
      break;
    case "mouse":
    case "kangaroo": {
      const color = kind === "mouse" ? "#b1a3bf" : "#b88763";
      part("sphere", color, [0.52, 0.64, 0.4], [0, 0.45, 0], "body");
      part("sphere", color, [0.5, 0.38, 0.4], [0.1, 0.78, 0.03], "head");
      for (const s of [-1, 1])
        part(
          "sphere",
          "#cfabb4",
          [0.22, kind === "mouse" ? 0.25 : 0.45, 0.12],
          [s * 0.17, 0.94, -0.02],
          "ear",
        );
      part("sphere", CREAM, [0.36, 0.2, 0.2], [0.12, 0.69, 0.23], "muzzle");
      part("sphere", "#49303a", [0.1, 0.07, 0.065], [0.13, 0.75, 0.33], "nose");
      eyes(a, group, 0.84, 0.1, 0.09);
      legs(a, group, color);
      const tail = part(
        "sphere",
        color,
        [0.58, 0.12, 0.12],
        [-0.37, 0.23, -0.1],
        "tail",
      );
      tail.rotation.z = 0.4;
      break;
    }
    case "mimic":
      eyes(a, group, 0.63, 0.2, 0.13);
      part("round", "#452a30", [0.53, 0.13, 0.08], [0, 0.31, 0.5], "mouth");
      for (const x of [-0.18, 0, 0.18])
        part(
          "cone",
          "#fff6df",
          [0.08, 0.11, 0.06],
          [x, 0.33, 0.55],
          "tooth",
        ).rotation.z = Math.PI;
      break;
    case "toy":
      part(
        "round",
        "#d66556",
        [0.55, 0.5, 0.4],
        [0, 0.48, 0],
        "body",
        group,
        "metal",
      );
      part(
        "round",
        "#e7ba65",
        [0.52, 0.34, 0.43],
        [0, 0.85, 0.02],
        "head",
        group,
        "metal",
      );
      eyes(a, group, 0.87, 0.14, 0.11);
      legs(a, group, DARK);
      for (const s of [-1, 1])
        part(
          "sphere",
          SILVER,
          [0.16, 0.39, 0.18],
          [s * 0.36, 0.5, 0],
          "arm",
          group,
          "metal",
        );
      part("torus", GOLD, [0.28, 0.28, 0.15], [0.4, 0.65, -0.22], "windup-key");
      break;
    case "bee":
      part("sphere", "#e8b94d", [0.55, 0.58, 0.45], [0, 0.5, 0], "bee-body");
      for (const y of [0.36, 0.54])
        part(
          "torus",
          DARK,
          [0.61, 0.25, 0.61],
          [0, y, 0],
          "stripe",
        ).rotation.x = Math.PI / 2;
      for (const s of [-1, 1])
        part(
          "sphere",
          "#d5f6f5",
          [0.4, 0.51, 0.065],
          [s * 0.31, 0.79, -0.04],
          `wing-${s}`,
          group,
          "plain",
          { transparent: true, opacity: 0.72 },
        );
      eyes(a, group, 0.69, 0.12, 0.11);
      break;
    case "rhino":
      part("sphere", "#909daf", [0.87, 0.67, 0.55], [0, 0.47, 0], "rhino");
      part("sphere", "#a8b2bc", [0.5, 0.44, 0.51], [0.31, 0.57, 0.09], "head");
      part("cone", CREAM, [0.17, 0.37, 0.17], [0.49, 0.85, 0.15], "horn");
      legs(a, group, "#6d798d", 4);
      part("sphere", "#273040", [0.065, 0.09, 0.04], [0.36, 0.68, 0.35], "eye");
      break;
    case "crab":
      part("sphere", "#ce6147", [0.69, 0.44, 0.52], [0, 0.35, 0], "shell");
      for (const s of [-1, 1]) {
        part(
          "sphere",
          "#db7454",
          [0.26, 0.3, 0.23],
          [s * 0.4, 0.66, 0.04],
          "claw",
        );
        part(
          "cylinder",
          "#d97d53",
          [0.07, 0.3, 0.07],
          [s * 0.15, 0.66, 0.19],
          "eye-stalk",
        );
        part(
          "sphere",
          "#202a32",
          [0.1, 0.12, 0.1],
          [s * 0.15, 0.82, 0.2],
          "eye",
        );
      }
      legs(a, group, "#c96046", 6);
      break;
    case "lizard":
      part("sphere", "#6ba96b", [0.8, 0.43, 0.35], [0, 0.4, 0], "body");
      part("sphere", "#a3c577", [0.4, 0.33, 0.38], [0.35, 0.57, 0.03], "head");
      part(
        "cone",
        "#559361",
        [0.25, 0.72, 0.24],
        [-0.57, 0.31, -0.07],
        "tail",
      ).rotation.z = Math.PI / 2;
      legs(a, group, "#619757", 4);
      part("sphere", "#292c2d", [0.07, 0.09, 0.045], [0.38, 0.63, 0.22], "eye");
      break;
    default:
      throw new Error(`Unknown enemy ${kind}`);
  }
  const base = tracked(a).update;
  a.update = (e, t = 0) => {
    base(e, t);
    for (const s of [-1, 1]) {
      const wing = group.getObjectByName(`wing-${s}`);
      if (wing) wing.rotation.z = s * (0.3 + Math.sin(t * 20) * 0.6);
    }
    if (kind === "mimic") {
      for (const mesh of group.children)
        if (["eye", "pupil", "mouth", "tooth"].includes(mesh.name))
          mesh.visible = e.animation !== "disguise";
    }
  };
  return a;
}

export function createPickup(kind, pool) {
  const a = createAsset(pool, kind),
    { part, group } = a;
  switch (kind) {
    case "flower":
      part("cylinder", "#5d914b", [0.055, 0.5, 0.055], [0, 0.25, 0], "stem");
      for (let i = 0; i < 6; i++) {
        const r = (i * Math.PI) / 3;
        part(
          "sphere",
          "#f2c851",
          [0.25, 0.25, 0.14],
          [Math.cos(r) * 0.19, 0.68 + Math.sin(r) * 0.19, 0],
          "petal",
        );
      }
      part(
        "sphere",
        "#986539",
        [0.2, 0.2, 0.15],
        [0, 0.68, 0.06],
        "flower-heart",
      );
      break;
    case "star":
      part("star", GOLD, [0.9, 0.9, 1], [0, 0.5, 0], "star", group, "metal", {
        emissive: "#946626",
        emissiveIntensity: 0.22,
      });
      break;
    case "acorn":
      part("sphere", "#b37b43", [0.59, 0.65, 0.5], [0, 0.4, 0], "acorn");
      part(
        "sphere",
        "#694b31",
        [0.66, 0.3, 0.55],
        [0, 0.68, 0],
        "cap",
        group,
        "wood",
      );
      part("cylinder", "#61472f", [0.09, 0.19, 0.09], [0, 0.88, 0], "stem");
      break;
    case "zipper":
      part("sphere", "#4dbca6", [0.4, 0.65, 0.35], [0, 0.5, 0], "zipper-body");
      for (const s of [-1, 1]) {
        part(
          "sphere",
          "#e8ffff",
          [0.45, 0.5, 0.06],
          [s * 0.24, 0.61, -0.12],
          "wing",
          group,
          "plain",
          { transparent: true, opacity: 0.7 },
        );
        part(
          "sphere",
          "#ffffff",
          [0.23, 0.3, 0.12],
          [s * 0.1, 0.77, 0.12],
          "eye",
        );
        part(
          "sphere",
          "#222d3e",
          [0.075, 0.14, 0.05],
          [s * 0.1, 0.79, 0.19],
          "pupil",
        );
      }
      break;
    default:
      throw new Error(`Unknown pickup ${kind}`);
  }
  const base = tracked(a).update;
  a.update = (e, t = 0) => {
    base(e, t);
    group.rotation.y = Math.sin(t * 2) * 0.35;
  };
  return a;
}
export function createProjectile(kind, pool) {
  if (kind === "alien") {
    const a = createEnemy("mouse", pool);
    a.group.traverse((o) => {
      if (o.isMesh && ["body", "head", "ear"].includes(o.name))
        o.material = a.pool.material("plain", "#9dbb63");
    });
    return a;
  }
  if (kind === "colorBall") {
    const a = createBall(pool),
      base = a.update;
    let shell;
    a.group.traverse((o) => {
      if (o.isMesh && o.name === "ball") shell = o;
    });
    a.update = (e, t) => {
      base(e, t);
      shell.material = a.pool.material(
        "plain",
        { red: "#dc6253", blue: "#649fcb", green: "#92b968" }[e.color] ??
          "#e56337",
      );
    };
    return a;
  }
  if (kind === "segment") {
    const a = createAsset(pool, "segment");
    a.part(
      "sphere",
      "#98bd54",
      [0.9, 0.78, 0.65],
      [0, 0.46, 0],
      "segment-body",
    );
    for (const x of [-0.3, 0.3])
      a.part("sphere", "#cba277", [0.24, 0.18, 0.27], [x, 0.12, 0.08], "foot");
    return tracked(a);
  }
  const a = createAsset(pool, kind),
    { part, group } = a;
  switch (kind) {
    case "lightning":
    case "spark":
      for (let i = 0; i < 4; i++) {
        const m = part(
          "round",
          "#d9f7a2",
          [0.16, 0.35, 0.13],
          [Math.sin(i * 2) * 0.14, 0.15 + i * 0.22, 0],
          "electric-bolt",
          group,
          "plain",
          { emissive: "#bcff55", emissiveIntensity: 1 },
        );
        m.rotation.z = i % 2 ? 0.7 : -0.7;
      }
      break;
    case "feather":
      part("sphere", "#d2a873", [0.32, 0.85, 0.12], [0, 0.5, 0], "feather");
      part("cylinder", "#fff3d5", [0.05, 0.9, 0.05], [0, 0.5, 0.04], "shaft");
      break;
    case "token":
      part(
        "cylinder",
        GOLD,
        [0.83, 0.15, 0.83],
        [0, 0.5, 0],
        "coin",
        group,
        "metal",
      ).rotation.x = Math.PI / 2;
      part("star", "#fff2b1", [0.43, 0.43, 0.5], [0, 0.5, 0.1], "coin-star");
      break;
    case "ash":
      part(
        "sphere",
        "#a99889",
        [0.65, 0.7, 0.5],
        [0, 0.45, 0],
        "ash",
        group,
        "plain",
        { emissive: "#d95b29", emissiveIntensity: 0.25 },
      );
      for (let i = 0; i < 3; i++)
        part(
          "sphere",
          "#ddc3a9",
          [0.32, 0.32, 0.28],
          [Math.sin(i * 3) * 0.2, 0.65 + i * 0.15, -0.1],
          "smoke",
        );
      break;
    case "gear":
      part(
        "torus",
        SILVER,
        [0.8, 0.8, 0.3],
        [0, 0.5, 0],
        "gear",
        group,
        "metal",
      );
      for (let i = 0; i < 8; i++) {
        const r = (i * Math.PI) / 4,
          m = part(
            "box",
            SILVER,
            [0.18, 0.23, 0.15],
            [Math.sin(r) * 0.4, 0.5 + Math.cos(r) * 0.4, 0],
            "cog",
            group,
            "metal",
          );
        m.rotation.z = -r;
      }
      break;
    case "drop":
      part("sphere", "#88cbd2", [0.6, 0.73, 0.55], [0, 0.36, 0], "drop");
      part("cone", "#a9e1e2", [0.46, 0.48, 0.44], [0, 0.8, 0], "drop-tip");
      break;
    default:
      throw new Error(`Unknown projectile ${kind}`);
  }
  return tracked(a);
}

export function createBoss(kind, pool) {
  const a = createAsset(pool, kind),
    { part, joint, group } = a;
  group.userData.silhouette = kind;
  switch (kind) {
    case "robot": {
      part(
        "cylinder",
        "#d65f72",
        [0.25, 0.79, 0.35],
        [0, 0.43, 0],
        "coil-core",
        group,
        "metal",
      );
      for (let i = 0; i < 13; i++)
        part(
          "torus",
          i % 2 ? "#df8cab" : "#4e6d9f",
          [0.35, 0.11, 0.4],
          [0, 0.1 + i * 0.055, 0],
          "coil-ring",
          group,
          "metal",
        ).rotation.x = Math.PI / 2;
      for (const side of [-1, 1]) {
        const arm = joint(side < 0 ? "contact-arm-left" : "contact-arm-right", [
          side * 0.38,
          0.45,
          0,
        ]);
        for (let i = 0; i < 3; i++) {
          const link = part(
            "cylinder",
            SILVER,
            [0.04, 0.22, 0.08],
            [side * -0.03, (i - 1) * 0.27, 0],
            "arm-link",
            arm,
            "metal",
          );
          link.rotation.z = side * (i % 2 ? 0.8 : -0.8);
          part(
            "sphere",
            SILVER,
            [0.1, 0.1, 0.12],
            [side * 0.06, (i - 1) * 0.27 + 0.05, 0],
            "elbow",
            arm,
            "metal",
          );
          part(
            i === 0 ? "round" : "sphere",
            i === 0 ? "#c88a55" : "#ede4d2",
            [0.18, 0.12, 0.2],
            [side * 0.025, (i - 1) * 0.27, 0],
            "hand-brush",
            arm,
          );
        }
      }
      for (const side of [-1, 1])
        for (const y of [0.2, 0.47, 0.74]) {
          const connector = part(
            "cylinder",
            SILVER,
            [0.035, 0.34, 0.055],
            [side * 0.22, y, -0.05],
            "arm-connector",
            group,
            "metal",
          );
          connector.rotation.z = Math.PI / 2;
        }
      part(
        "sphere",
        "#aeef54",
        [0.15, 0.12, 0.23],
        [0, 0.92, 0],
        "weakpoint",
        group,
        "plain",
        { emissive: "#64ad19", emissiveIntensity: 0.6 },
      );
      break;
    }
    case "toyRobot":
      part(
        "round",
        "#6f8a90",
        [0.56, 0.57, 0.43],
        [0, 0.46, 0],
        "armour",
        group,
        "metal",
      );
      part(
        "round",
        SILVER,
        [0.48, 0.24, 0.42],
        [0, 0.83, 0],
        "head",
        group,
        "metal",
      );
      part("round", DARK, [0.34, 0.07, 0.04], [0, 0.85, 0.23], "visor");
      for (const x of [-0.11, 0.11])
        part("sphere", "#d7eea6", [0.07, 0.07, 0.04], [x, 0.85, 0.26], "eye");
      part(
        "round",
        "#e8bd53",
        [0.2, 0.14, 0.06],
        [0, 0.53, 0.24],
        "weakpoint",
        group,
        "plain",
        { emissive: "#f4a828", emissiveIntensity: 0.6 },
      );
      for (const side of [-1, 1]) {
        part(
          "sphere",
          SILVER,
          [0.22, 0.37, 0.3],
          [side * 0.36, 0.44, 0],
          "arm",
          group,
          "metal",
        );
        part(
          "round",
          DARK,
          [0.35, 0.18, 0.48],
          [side * 0.2, 0.1, 0],
          "tank-tread",
        );
        for (let i = 0; i < 4; i++)
          part(
            "sphere",
            SILVER,
            [0.07, 0.1, 0.06],
            [side * 0.2 - 0.11 + i * 0.075, 0.1, 0.25],
            "tread-wheel",
            group,
            "metal",
          );
      }
      break;
    case "owl":
      part("sphere", "#a97144", [0.56, 0.69, 0.42], [0, 0.43, 0], "owl-body");
      part("sphere", CREAM, [0.39, 0.49, 0.06], [0, 0.4, 0.23], "breast");
      for (const s of [-1, 1]) {
        part(
          "sphere",
          "#8b5739",
          [0.45, 0.26, 0.18],
          [s * 0.37, 0.56, 0],
          `wing-${s}`,
        );
        part(
          "sphere",
          "#ead8b1",
          [0.29, 0.33, 0.1],
          [s * 0.14, 0.77, 0.18],
          "eye-mask",
        );
        part(
          "sphere",
          "#f8e874",
          [0.14, 0.17, 0.08],
          [s * 0.14, 0.78, 0.25],
          "eye",
        );
        part(
          "sphere",
          "#2e2830",
          [0.07, 0.1, 0.03],
          [s * 0.14, 0.78, 0.3],
          "pupil",
        );
        part("cone", "#744732", [0.19, 0.26, 0.2], [s * 0.2, 0.98, 0], "ear");
      }
      part(
        "cone",
        "#e4ad43",
        [0.17, 0.22, 0.14],
        [0, 0.61, 0.27],
        "beak",
      ).rotation.z = Math.PI;
      legs(a, group, GOLD);
      break;
    case "ufo":
      part(
        "sphere",
        "#90aa9c",
        [0.99, 0.29, 0.72],
        [0, 0.39, 0],
        "saucer",
        group,
        "metal",
      );
      part(
        "sphere",
        "#9ce6d5",
        [0.51, 0.47, 0.44],
        [0, 0.65, 0],
        "dome",
        group,
        "plain",
        { metalness: 0.35, roughness: 0.2 },
      );
      part(
        "torus",
        GOLD,
        [1, 0.34, 0.7],
        [0, 0.4, 0],
        "rim",
        group,
        "metal",
      ).rotation.x = Math.PI / 2;
      for (const x of [-0.3, 0, 0.3])
        part(
          "sphere",
          "#f8c66c",
          [0.11, 0.11, 0.07],
          [x, 0.38, 0.35],
          "navigation-light",
          group,
          "plain",
          { emissive: "#f9c457", emissiveIntensity: 0.5 },
        );
      eyes(a, group, 0.66, 0.13, 0.12);
      break;
    case "electricFish":
      part("sphere", "#a4bf4c", [0.72, 0.61, 0.45], [0, 0.5, 0], "fish-body");
      part("sphere", CREAM, [0.6, 0.34, 0.1], [0, 0.4, 0.24], "belly");
      for (const s of [-1, 1]) {
        part(
          "cone",
          "#738d36",
          [0.28, 0.43, 0.17],
          [s * 0.4, 0.53, 0],
          "fin",
        ).rotation.z = (s * Math.PI) / 2;
        part(
          "sphere",
          "#f8f0ce",
          [0.2, 0.23, 0.12],
          [s * 0.16, 0.68, 0.19],
          "eye",
        );
        part(
          "sphere",
          "#27342e",
          [0.08, 0.11, 0.04],
          [s * 0.16, 0.7, 0.27],
          "pupil",
        );
      }
      for (let i = 0; i < 5; i++)
        part(
          "cone",
          GOLD,
          [0.08, 0.25, 0.1],
          [-0.2 + i * 0.1, 0.88, 0],
          "spine",
        );
      break;
    case "casinoCat":
    case "fatCat": {
      const fat = kind === "fatCat";
      part(
        "sphere",
        fat ? "#7b6a83" : "#648cbe",
        [0.83, 0.66, 0.48],
        [0, 0.36, 0],
        "suit",
        group,
        "fabric",
      );
      part("sphere", "#e5d6ba", [0.42, 0.5, 0.07], [0, 0.43, 0.26], "shirt");
      for (const s of [-1, 1]) {
        part(
          "round",
          fat ? "#654e6a" : "#315788",
          [0.19, 0.45, 0.09],
          [s * 0.23, 0.43, 0.25],
          "lapel",
        ).rotation.z = s * 0.25;
        part(
          "sphere",
          fat ? "#95847d" : "#938e98",
          [0.26, 0.34, 0.27],
          [s * 0.4, 0.47, 0.07],
          "hand",
        );
        part(
          "cone",
          fat ? "#928078" : "#817780",
          [0.21, 0.27, 0.19],
          [s * 0.2, 0.96, 0],
          "cat-ear",
        );
      }
      part(
        "sphere",
        fat ? "#a99b89" : "#a3a0a7",
        [0.59, 0.43, 0.4],
        [0, fat ? 0.835 : 0.78, 0],
        "head",
      );
      for (const s of [-1, 1])
        part(
          "sphere",
          CREAM,
          [0.27, 0.17, 0.1],
          [s * 0.13, fat ? 0.775 : 0.7, 0.22],
          "muzzle",
        );
      eyes(a, group, fat ? 0.905 : 0.82, 0.135, 0.12);
      part(
        "sphere",
        "#785157",
        [0.14, 0.09, 0.08],
        [0, fat ? 0.815 : 0.74, 0.29],
        "nose",
      );
      part("round", "#be6860", [0.15, 0.16, 0.06], [0, 0.53, 0.32], "tie");
      legs(a, group, DARK);
      if (fat) {
        const chair = joint("chair", [0, 0, -0.16]);
        part(
          "round",
          "#65516a",
          [0.96, 0.06, 0.62],
          [0, 0, 0],
          "chair-seat",
          chair,
          "fabric",
        );
        part(
          "round",
          "#8b6c51",
          [0.96, 0.8, 0.1],
          [0, 0.38, -0.28],
          "chair-back",
          chair,
          "wood",
        );
        part(
          "round",
          "#775c72",
          [0.8, 0.65, 0.06],
          [0, 0.38, -0.215],
          "chair-cushion",
          chair,
          "fabric",
        );
        for (const x of [-0.39, 0.39])
          for (const z of [-0.23, 0.23])
            part(
              "cylinder",
              GOLD,
              [0.055, 0.15, 0.055],
              [x, -0.11, z],
              "chair-leg",
              chair,
              "metal",
            );
        for (const x of [-0.45, 0.45])
          part(
            "sphere",
            GOLD,
            [0.08, 0.08, 0.08],
            [x, 0.82, -0.28],
            "chair-finial",
            chair,
            "metal",
          );
        part(
          "sphere",
          "#5b3b37",
          [0.13, 0.055, 0.06],
          [-0.16, 0.78, 0.29],
          "mouth",
        );
        for (const side of [-1, 1]) {
          const brow = part(
            "round",
            "#5c5355",
            [0.19, 0.035, 0.035],
            [side * 0.135, 0.98, 0.28],
            "brow",
          );
          brow.rotation.z = side * 0.25;
        }
        const cigar = joint("cigar-tip", [-0.16, 0.78, 0.32]);
        part(
          "cylinder",
          "#875237",
          [0.04, 0.19, 0.04],
          [-0.09, 0, 0],
          "cigar",
          cigar,
        ).rotation.z = Math.PI / 2;
        part(
          "sphere",
          "#f1a366",
          [0.035, 0.04, 0.04],
          [0, 0, 0],
          "ember",
          cigar,
          "plain",
          { emissive: "#ec591a", emissiveIntensity: 0.8 },
        );
      } else {
        part(
          "cylinder",
          "#344960",
          [0.58, 0.1, 0.47],
          [0, 0.99, 0],
          "hat-brim",
        );
        part("cylinder", "#344960", [0.4, 0.21, 0.35], [0, 1.08, 0], "top-hat");
      }
      break;
    }
    case "caterpillar":
      for (let i = 0; i < 5; i++) {
        const g = joint(`body-segment-${i}`, [0, 0.1 + i * 0.2, 0]);
        part(
          "sphere",
          i === 4 ? "#c98a58" : "#97bf50",
          [0.98, 0.87, 0.48],
          [0, 0.48, 0],
          "segment",
          g,
        );
        for (const s of [-1, 1])
          part(
            "sphere",
            "#d2a86e",
            [0.19, 0.15, 0.23],
            [s * 0.27, 0.08, 0.08],
            "foot",
            g,
          );
        if (i === 4) eyes(a, g, 0.63, 0.17, 0.19);
      }
      break;
    default:
      throw new Error(`Unknown Boss ${kind}`);
  }
  a.update = (b, t = 0) => {
    group.position.set(b.x, b.y, 0);
    group.scale.set(b.w ?? 2, b.h ?? 2.4, Math.min(b.w ?? 2, 3));
    group.visible = !b.defeated && b.phase !== "separated";
    const weak = group.getObjectByName("weakpoint");
    if (weak && b.weakpoint) {
      weak.position.x = (b.weakpoint.x - b.x) / b.w;
      weak.position.y = (b.weakpoint.y + b.weakpoint.h / 2 - b.y) / b.h;
      weak.scale.x = b.weakpoint.w / b.w;
      weak.scale.y = b.weakpoint.h / b.h;
    }
    if (kind === "robot")
      for (const [i, name] of [
        "contact-arm-left",
        "contact-arm-right",
      ].entries()) {
        const r = b.contactRegions?.[i];
        if (r) {
          const arm = group.getObjectByName(name);
          arm.position.x = (r.x - b.x) / b.w;
          arm.position.y = (r.y + r.h / 2 - b.y) / b.h;
        }
      }
    const chair = group.getObjectByName("chair");
    if (chair) {
      const floor = ((b.arena?.y ?? b.y - 1.2) - b.y) / b.h;
      chair.traverse((o) => {
        if (o.name === "chair-leg") {
          o.position.y = (floor - 0.03) / 2;
          o.scale.y = Math.max(0.01, -0.03 - floor);
        }
      });
    }
    const cigar = group.getObjectByName("cigar-tip");
    if (cigar && b.anchors?.mouth) {
      cigar.position.x = (b.anchors.mouth.x - b.x) / b.w;
      cigar.position.y = (b.anchors.mouth.y - b.y) / b.h;
      const mouth = group.getObjectByName("mouth");
      mouth.position.x = cigar.position.x;
      mouth.position.y = cigar.position.y;
    }
    if (kind === "caterpillar")
      for (let i = 0; i < 5; i++) {
        const segment = group.getObjectByName(`body-segment-${i}`),
          s = b.segments?.[i];
        segment.visible = !!s;
        if (s) {
          segment.position.set((s.x - b.x) / b.w, (s.y - b.y) / b.h, 0);
          segment.scale.set(s.w / b.w, s.h / b.h, 1);
        }
      }
    for (const s of [-1, 1]) {
      const wing = group.getObjectByName(`wing-${s}`);
      if (wing) wing.rotation.z = s * Math.sin(t * 6) * 0.45;
    }
  };
  return a;
}
export const createRobot = (pool) => createBoss("robot", pool);
export const createOwl = (pool) => createBoss("owl", pool);
export const createUFO = (pool) => createBoss("ufo", pool);
export const createToyRobot = (pool) => createBoss("toyRobot", pool);
export const createElectricFish = (pool) => createBoss("electricFish", pool);
export const createCasinoCat = (pool) => createBoss("casinoCat", pool);
export const createCaterpillarBoss = (pool) => createBoss("caterpillar", pool);
export const createFatCat = (pool) => createBoss("fatCat", pool);
export const createBigCrate = (pool) => createCrate(pool, true);
export const createDog = (pool) => createEnemy("dog", pool);
export const createBird = (pool) => createEnemy("bird", pool);
export const createCaterpillar = (pool) => createEnemy("caterpillar", pool);
export const createMouse = (pool) => createEnemy("mouse", pool);
export const createKangaroo = (pool) => createEnemy("kangaroo", pool);
export const createMimic = (pool) => createEnemy("mimic", pool);
export const createToy = (pool) => createEnemy("toy", pool);
export const createBee = (pool) => createEnemy("bee", pool);
export const createRhino = (pool) => createEnemy("rhino", pool);
export const createCrab = (pool) => createEnemy("crab", pool);
export const createLizard = (pool) => createEnemy("lizard", pool);
export const createPelican = (pool) => createEnemy("pelican", pool);
