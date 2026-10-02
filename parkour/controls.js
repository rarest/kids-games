// Input is expressed in world space; camera yaw 0 looks toward world +z.
export function createControls(
  canvas,
  joystick,
  jumpButton,
  { onJump, onOrbit, onInteract },
) {
  const abort = new AbortController(),
    keys = new Set(),
    stick = { x: 0, z: 0 };
  const listen = (target, type, handler) =>
    target.addEventListener(type, handler, { signal: abort.signal });
  let drag = null,
    stickId = null;
  const knob = joystick.querySelector("span");
  const resetStick = () => {
    stick.x = 0;
    stick.z = 0;
    stickId = null;
    knob.style.transform = "translate(0px,0px)";
  };
  const clear = () => {
    keys.clear();
    drag = null;
    resetStick();
  };
  listen(window, "keydown", (event) => {
    if (
      event.target.closest?.("input,select,textarea,button,a") ||
      ![
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "KeyW",
        "KeyA",
        "KeyS",
        "KeyD",
        "Space",
      ].includes(event.code)
    )
      return;
    event.preventDefault();
    onInteract();
    keys.add(event.code);
  });
  listen(window, "keyup", (event) => keys.delete(event.code));
  listen(window, "blur", clear);
  listen(document, "visibilitychange", () => {
    if (document.hidden) clear();
  });
  listen(canvas, "pointerdown", (event) => {
    if (drag || event.button > 0) return;
    onInteract();
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    canvas.setPointerCapture(event.pointerId);
  });
  listen(canvas, "pointermove", (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x,
      dy = event.clientY - drag.y;
    if (
      Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 6
    )
      drag.moved = true;
    if (drag.moved) onOrbit(dx, dy);
    drag.x = event.clientX;
    drag.y = event.clientY;
  });
  listen(canvas, "pointerup", (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const moved =
      drag.moved ||
      Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 6;
    drag = null;
    if (!moved) onJump();
  });
  listen(canvas, "pointercancel", () => {
    drag = null;
  });
  const moveStick = (event) => {
    const r = joystick.getBoundingClientRect(),
      radius = r.width * 0.32;
    let x = (event.clientX - r.x - r.width / 2) / radius,
      z = -(event.clientY - r.y - r.height / 2) / radius;
    const m = Math.max(1, Math.hypot(x, z));
    x /= m;
    z /= m;
    stick.x = x;
    stick.z = z;
    knob.style.transform = `translate(${x * radius}px,${-z * radius}px)`;
  };
  listen(joystick, "pointerdown", (event) => {
    if (stickId !== null) return;
    event.preventDefault();
    onInteract();
    stickId = event.pointerId;
    joystick.setPointerCapture(event.pointerId);
    moveStick(event);
  });
  listen(joystick, "pointermove", (event) => {
    if (stickId === event.pointerId) moveStick(event);
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
    listen(joystick, type, (event) => {
      if (stickId === event.pointerId) resetStick();
    });
  listen(jumpButton, "pointerdown", (event) => {
    event.preventDefault();
    onInteract();
    onJump();
  });
  listen(jumpButton, "keydown", (event) => {
    if (event.code === "Space" || event.code === "Enter") {
      event.preventDefault();
      onInteract();
      onJump();
    }
  });
  listen(canvas, "contextmenu", (event) => event.preventDefault());
  return {
    sample(yaw) {
      const x =
        stick.x +
        Number(keys.has("KeyD") || keys.has("ArrowRight")) -
        Number(keys.has("KeyA") || keys.has("ArrowLeft"));
      const z =
        stick.z +
        Number(keys.has("KeyW") || keys.has("ArrowUp")) -
        Number(keys.has("KeyS") || keys.has("ArrowDown"));
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      return { x: -x * c + z * s, z: z * c + x * s, jump: keys.has("Space") };
    },
    clear,
    dispose() {
      clear();
      abort.abort();
    },
  };
}
