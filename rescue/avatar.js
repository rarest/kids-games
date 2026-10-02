import { createAsset } from "./materials.js";

export function createAvatar(character = "chip", pool) {
  const a = createAsset(pool, character),
    { group, part, joint } = a;
  const dale = character === "dale";
  const fur = dale ? "#ad652e" : "#85502e",
    cream = "#f4d8aa",
    dark = "#392723";
  const body = joint("body", [0, 0, 0]);
  const tail = joint("striped-tail", [-0.24, 0.41, -0.18], body);
  tail.rotation.z = -0.45;
  part("sphere", fur, [0.27, 0.69, 0.24], [0, 0.13, 0], "tail", tail);
  for (const [x, color] of [
    [-0.065, cream],
    [0, dark],
    [0.065, cream],
  ])
    part(
      "sphere",
      color,
      [0.048, 0.57, 0.035],
      [x, 0.16, 0.116],
      "tail-stripe",
      tail,
    );
  part("sphere", cream, [0.45, 0.58, 0.34], [0, 0.51, 0.02], "belly", body);
  if (dale) {
    const shirt = part(
      "sphere",
      "#db4537",
      [0.54, 0.46, 0.39],
      [0, 0.57, 0],
      "floral-shirt",
      body,
      "fabric",
    );
    for (let i = 0; i < 9; i++) {
      const x = ((i % 3) - 1) * 0.14,
        y = 0.43 + Math.floor(i / 3) * 0.12;
      for (let j = 0; j < 5; j++)
        part(
          "sphere",
          "#ffdc81",
          [0.046, 0.05, 0.02],
          [
            x + Math.cos(j * 1.257) * 0.025,
            y + Math.sin(j * 1.257) * 0.026,
            0.193,
          ],
          "flower-petal",
          body,
        );
    }
    shirt.rotation.z = -0.04;
  } else {
    for (const side of [-1, 1])
      part(
        "sphere",
        "#995e39",
        [0.2, 0.43, 0.37],
        [side * 0.19, 0.57, 0],
        "jacket",
        body,
        "fabric",
      );
    for (const side of [-1, 1]) {
      const lapel = part(
        "round",
        "#c79050",
        [0.1, 0.24, 0.06],
        [side * 0.125, 0.69, 0.18],
        "lapel",
        body,
        "fabric",
      );
      lapel.rotation.z = side * 0.28;
    }
  }
  const head = joint("head", [0, 0.97, 0.025], body);
  part("sphere", fur, [0.66, 0.56, 0.43], [0, 0, 0], "head-fur", head);
  for (const side of [-1, 1]) {
    part(
      "sphere",
      fur,
      [0.23, 0.28, 0.16],
      [side * 0.27, 0.2, -0.025],
      "ear",
      head,
    );
    part(
      "sphere",
      "#daac80",
      [0.14, 0.18, 0.035],
      [side * 0.27, 0.2, 0.061],
      "inner-ear",
      head,
    );
    part(
      "sphere",
      cream,
      [0.32, 0.25, 0.19],
      [side * 0.145, -0.12, 0.18],
      "cheek",
      head,
    );
    part(
      "sphere",
      "#fff8e7",
      [0.18, 0.245, 0.085],
      [side * 0.125, 0.046, 0.214],
      "eye",
      head,
    );
    part(
      "sphere",
      "#292126",
      [0.075, 0.125, 0.045],
      [side * 0.123 + 0.02, 0.037, 0.254],
      "pupil",
      head,
    );
    part(
      "sphere",
      "#ffffff",
      [0.027, 0.038, 0.012],
      [side * 0.123 + 0.033, 0.07, 0.274],
      "eye-glint",
      head,
    );
    const brow = part(
      "sphere",
      dark,
      [0.2, 0.045, 0.04],
      [side * 0.125, 0.185, 0.204],
      "brow",
      head,
    );
    brow.rotation.z = side * (dale ? 0.2 : -0.12);
  }
  part(
    "sphere",
    dale ? "#cd3d36" : "#302125",
    [dale ? 0.18 : 0.125, 0.115, 0.12],
    [0, -0.075, 0.326],
    "nose",
    head,
  );
  part(
    "sphere",
    "#663724",
    [0.18, 0.086, 0.04],
    [0, -0.202, 0.241],
    "smile",
    head,
  );
  for (const side of [-1, 1])
    part(
      "round",
      "#fff6df",
      [0.051, 0.084, 0.04],
      [side * 0.029, -0.18, 0.262],
      "tooth",
      head,
    );
  if (dale) {
    for (const side of [-1, 0, 1]) {
      const hair = part(
        "cone",
        fur,
        [0.13, 0.2, 0.1],
        [side * 0.09, 0.29, 0.015],
        "tuft",
        head,
      );
      hair.rotation.z = side * 0.25;
    }
  } else {
    const hat = joint("fedora", [0, 0.27, 0], head);
    hat.rotation.z = -0.1;
    part(
      "sphere",
      "#b9945c",
      [0.76, 0.09, 0.58],
      [0, 0, 0],
      "hat-brim",
      hat,
      "fabric",
    );
    part(
      "round",
      "#b9945c",
      [0.47, 0.24, 0.36],
      [0, 0.1, -0.025],
      "hat-crown",
      hat,
      "fabric",
    );
    part(
      "round",
      "#57412e",
      [0.485, 0.075, 0.37],
      [0, 0.055, -0.025],
      "hat-ribbon",
      hat,
    );
  }
  const arms = [],
    legs = [];
  for (const side of [-1, 1]) {
    const arm = joint(
      side < 0 ? "left-arm" : "right-arm",
      [side * 0.25, 0.68, 0.01],
      body,
    );
    arms.push(arm);
    part(
      "sphere",
      dale ? "#dc493b" : "#955e39",
      [0.17, 0.31, 0.19],
      [0, -0.11, 0],
      "sleeve",
      arm,
      "fabric",
    );
    part("sphere", cream, [0.18, 0.18, 0.18], [0, -0.29, 0.025], "hand", arm);
    const leg = joint(
      side < 0 ? "left-leg" : "right-leg",
      [side * 0.13, 0.3, 0],
      body,
    );
    legs.push(leg);
    part("sphere", fur, [0.18, 0.26, 0.23], [0, -0.1, 0], "leg", leg);
    part(
      "sphere",
      fur,
      [0.24, 0.13, 0.33],
      [side * 0.025, -0.24, 0.07],
      "foot",
      leg,
    );
  }
  const baseUpdate = a.update;
  a.update = (p, time = 0) => {
    baseUpdate(p);
    group.rotation.y = (p.facing ?? 1) < 0 ? -0.38 : 0.38;
    const run =
        p.animation === "run" || (p.carrying && Math.abs(p.vx ?? 0) > 0.1),
      wave = run ? Math.sin(time * 17) * 0.57 : 0;
    body.scale.y = p.hidden ? 0.38 : 1;
    body.position.y = run
      ? Math.abs(Math.sin(time * 17)) * 0.025
      : Math.sin(time * 3) * 0.008;
    for (let i = 0; i < 2; i++) {
      legs[i].rotation.z = (i ? 1 : -1) * wave;
      arms[i].rotation.z = p.carrying
        ? i
          ? 2.95
          : -2.95
        : (i ? wave : -wave) * 0.7;
      arms[i].position.y = p.carrying ? 0.75 : 0.68;
      const reach = p.carrying ? 2.4 : 1;
      arms[i].getObjectByName("sleeve").scale.y = 0.31 * reach;
      arms[i].getObjectByName("sleeve").position.y = -0.11 * reach;
      arms[i].getObjectByName("hand").position.y = -0.29 * reach;
    }
    if (p.animation === "jump" || p.animation === "held") {
      legs[0].rotation.z = -0.35;
      legs[1].rotation.z = 0.35;
      if (!p.carrying) {
        arms[0].rotation.z = -1;
        arms[1].rotation.z = 1;
      }
    }
    head.rotation.z = p.animation === "hurt" ? 0.2 : Math.sin(time * 2) * 0.018;
    tail.rotation.z = -0.45 + wave * 0.12;
    group.visible =
      (p.lives ?? 1) > 0 &&
      (!(p.invulnerable > 0) || Math.floor(time * 15) % 3 !== 0);
  };
  return a;
}
