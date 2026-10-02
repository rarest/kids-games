const KEYS = [
  {
    left: "KeyA",
    right: "KeyD",
    up: "KeyW",
    down: "KeyS",
    jump: "Space",
    action: "KeyE",
  },
  {
    left: "ArrowLeft",
    right: "ArrowRight",
    up: "ArrowUp",
    down: "ArrowDown",
    jump: "Enter",
    action: "ShiftRight",
  },
];
const pressed = (p, i) =>
  !!(p.buttons?.[i]?.pressed || p.buttons?.[i]?.value > 0.5);
export function createControls({
  target = globalThis.window,
  players = 1,
  gamepads = () => globalThis.navigator?.getGamepads?.() ?? [],
  onPause = () => {},
  capture = () => true,
  joystick = null,
  jump = null,
  action = null,
} = {}) {
  let count = players;
  const held = new Set(),
    blocked = new Set(),
    pending = new Set(),
    bindings = [null, null],
    padHistory = new Map(),
    padBlocked = new Map(),
    cleanups = [];
  const pulses = Array.from({ length: 2 }, () => ({ jump: [], action: [] }));
  const previousPulses = Array.from({ length: 2 }, () => ({
    jump: false,
    action: false,
  }));
  const touch = { move: 0, up: false, down: false, jump: false, action: false },
    touchPending = new Set(),
    touchPointers = new Map(),
    touchBlocked = new Set();
  const listen = (el, type, fn) => {
    el?.addEventListener(type, fn);
    cleanups.push(() => el?.removeEventListener(type, fn));
  };
  const codes = new Set([...KEYS.flatMap((v) => Object.values(v)), "Escape"]);
  listen(target, "keydown", (e) => {
    if (!codes.has(e.code)) return;
    if (capture()) e.preventDefault();
    if (!held.has(e.code) && !blocked.has(e.code)) {
      pending.add(e.code);
      if (e.code === "Escape") onPause();
    }
    held.add(e.code);
  });
  listen(target, "keyup", (e) => {
    held.delete(e.code);
    blocked.delete(e.code);
  });
  function clear() {
    for (const k of held) blocked.add(k);
    pending.clear();
    for (let i = 0; i < 2; i++)
      for (const name of ["jump", "action"]) {
        pulses[i][name].length = 0;
        previousPulses[i][name] = false;
      }
    touch.move = 0;
    touch.up = false;
    touch.down = false;
    touch.jump = false;
    touch.action = false;
    touchPending.clear();
    for (const id of touchPointers.keys()) touchBlocked.add(id);
    for (const p of Array.from(gamepads() ?? []).filter(Boolean)) {
      padBlocked.set(p.index, {
        buttons: new Set(
          p.buttons?.map((_, i) => i).filter((i) => pressed(p, i)) ?? [],
        ),
        axis:
          Math.abs(p.axes?.[0] ?? 0) > 0.2 || Math.abs(p.axes?.[1] ?? 0) > 0.2,
      });
    }
  }
  listen(target, "blur", clear);
  function bindTouch(el, kind) {
    const update = (e) => {
      if (touchBlocked.has(e.pointerId)) return;
      if (kind === "stick") {
        const r = el.getBoundingClientRect(),
          dx = (e.clientX - r.x - r.width / 2) / (r.width * 0.35),
          dy = (e.clientY - r.y - r.height / 2) / (r.height * 0.35);
        touch.move = Math.abs(dx) > 0.25 ? Math.max(-1, Math.min(1, dx)) : 0;
        touch.up = dy < -0.3;
        touch.down = dy > 0.3;
        if (touch.move) touchPending.add(touch.move > 0 ? "right" : "left");
        if (touch.up) touchPending.add("up");
        if (touch.down) touchPending.add("down");
        el.style.setProperty(
          "--stick-x",
          `${Math.max(-30, Math.min(30, dx * 30))}px`,
        );
        el.style.setProperty(
          "--stick-y",
          `${Math.max(-30, Math.min(30, dy * 30))}px`,
        );
      } else if (!touch[kind]) {
        touch[kind] = true;
        touchPending.add(kind);
      }
    };
    listen(el, "pointerdown", (e) => {
      e.preventDefault();
      touchPointers.set(e.pointerId, kind);
      el.setPointerCapture?.(e.pointerId);
      update(e);
    });
    listen(el, "pointermove", (e) => {
      if (touchPointers.get(e.pointerId) === kind) update(e);
    });
    const release = (e) => {
      if (touchPointers.get(e.pointerId) !== kind) return;
      touchPointers.delete(e.pointerId);
      touchBlocked.delete(e.pointerId);
      if (kind === "stick") {
        touch.move = 0;
        touch.up = false;
        touch.down = false;
        el.style.setProperty("--stick-x", "0px");
        el.style.setProperty("--stick-y", "0px");
      } else touch[kind] = false;
    };
    listen(el, "pointerup", release);
    listen(el, "pointercancel", release);
    listen(el, "lostpointercapture", release);
  }
  bindTouch(joystick, "stick");
  bindTouch(jump, "jump");
  bindTouch(action, "action");
  function sample() {
    const pads = Array.from(gamepads() ?? []).filter(
      (p) => p && p.connected !== false && p.mapping === "standard",
    );
    const indices = new Set(pads.map((p) => p.index));
    for (let i = 0; i < 2; i++)
      if (bindings[i] !== null && !indices.has(bindings[i])) {
        for (const name of ["jump", "action"])
          pulses[i][name] = pulses[i][name].filter(
            (edge) => edge.pad !== bindings[i],
          );
        padHistory.delete(bindings[i]);
        padBlocked.delete(bindings[i]);
        bindings[i] = null;
      }
    for (let i = 0; i < count; i++)
      if (bindings[i] === null)
        bindings[i] =
          pads.find((p) => !bindings.includes(p.index))?.index ?? null;
    const inputs = Array.from({ length: count }, (_, i) => {
      const k = KEYS[i],
        active = (c) => !blocked.has(c) && (held.has(c) || pending.has(c));
      const result = {
        move: Number(active(k.right)) - Number(active(k.left)),
        up: active(k.up),
        down: active(k.down),
        jump: pending.has(k.jump) && !blocked.has(k.jump),
        action: pending.has(k.action) && !blocked.has(k.action),
      };
      const p = pads.find((p) => p.index === bindings[i]);
      if (p) {
        const b = padBlocked.get(p.index);
        if (b) {
          for (const n of b.buttons) if (!pressed(p, n)) b.buttons.delete(n);
          if (
            Math.abs(p.axes?.[0] ?? 0) < 0.2 &&
            Math.abs(p.axes?.[1] ?? 0) < 0.2
          )
            b.axis = false;
        }
        const previous = padHistory.get(p.index) ?? new Set(),
          now = new Set(
            p.buttons?.map((_, n) => n).filter((n) => pressed(p, n)) ?? [],
          );
        const edge = (n) =>
          now.has(n) && !previous.has(n) && !b?.buttons.has(n);
        const x = b?.axis ? 0 : (p.axes?.[0] ?? 0),
          y = b?.axis ? 0 : (p.axes?.[1] ?? 0);
        const padMove =
          Number(now.has(15) && !b?.buttons.has(15)) -
            Number(now.has(14) && !b?.buttons.has(14)) ||
          (Math.abs(x) > 0.2 ? x : 0);
        if (Math.abs(padMove) > Math.abs(result.move)) result.move = padMove;
        result.up ||= y < -0.3 || (now.has(12) && !b?.buttons.has(12));
        result.down ||= y > 0.3 || (now.has(13) && !b?.buttons.has(13));
        result.jump ||= edge(0);
        result.action ||= edge(1);
        padHistory.set(p.index, now);
        if (edge(9)) onPause();
      }
      if (i === 0) {
        if (Math.abs(touch.move) > Math.abs(result.move))
          result.move = touch.move;
        else if (!result.move)
          result.move =
            Number(touchPending.has("right")) -
            Number(touchPending.has("left"));
        result.up ||= touch.up || touchPending.has("up");
        result.down ||= touch.down || touchPending.has("down");
        result.jump ||= touchPending.has("jump");
        result.action ||= touchPending.has("action");
      }
      // The core detects rising edges: insert the release sample between fresh taps.
      for (const name of ["jump", "action"]) {
        if (result[name] && pulses[i][name].length < 8) {
          const local =
            (pending.has(k[name]) && !blocked.has(k[name])) ||
            (i === 0 && touchPending.has(name));
          pulses[i][name].push({
            up: result.up,
            down: result.down,
            pad: local ? null : p?.index,
          });
        }
        const edge = previousPulses[i][name] ? null : pulses[i][name].shift();
        result[name] = !!edge;
        if (edge) {
          result.up ||= edge.up;
          result.down ||= edge.down;
        }
        previousPulses[i][name] = result[name];
      }
      return result;
    });
    pending.clear();
    touchPending.clear();
    return inputs;
  }
  return {
    sample,
    clear,
    setPlayers(value) {
      count = Math.max(1, Math.min(2, value));
      if (count === 1) bindings[1] = null;
      clear();
    },
    dispose() {
      clear();
      cleanups.forEach((fn) => fn());
    },
    get bindings() {
      return bindings.slice(0, count);
    },
  };
}
