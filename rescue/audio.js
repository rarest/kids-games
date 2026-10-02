const MELODIES = {
  street: [0, 4, 7, 9, 7, 4, 2, 7],
  tree: [0, 7, 9, 12, 9, 7, 4, 2],
  kitchen: [0, 3, 7, 10, 7, 5, 3, 7],
  study: [0, 4, 9, 7, 4, 2, 5, 7],
  toys: [12, 7, 9, 4, 7, 12, 14, 9],
  river: [0, 5, 7, 9, 7, 5, 2, 4],
  factory: [0, 3, 7, 3, 5, 2, 7, 5],
  casino: [0, 4, 7, 10, 9, 5, 7, 2],
  sewer: [0, 2, 5, 7, 5, 2, -2, 2],
  office: [0, 7, 4, 11, 9, 4, 7, 2],
  fatcat: [0, 3, 6, 7, 6, 3, 2, -2],
  bonus: [0, 4, 7, 12, 11, 7, 9, 12],
};
export function createAudio(options = {}) {
  let context = null,
    enabled = { music: true, sound: true, ...options },
    active = false,
    timer = null,
    step = 0,
    identity = null,
    lastEvent = 0,
    theme = "street";
  const voices = new Map();
  const effects = {};
  function tone(
    note,
    duration = 0.14,
    type = "triangle",
    volume = 0.045,
    effect = true,
  ) {
    if (!context || context.state !== "running") return false;
    const osc = context.createOscillator(),
      gain = context.createGain(),
      now = context.currentTime;
    osc.type = type;
    osc.frequency.value = 261.63 * 2 ** (note / 12);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(context.destination);
    voices.set(osc, effect);
    osc.onended = () => {
      voices.delete(osc);
      osc.disconnect();
      gain.disconnect();
    };
    osc.start(now);
    osc.stop(now + duration + 0.02);
    return true;
  }
  function silence(finishEffects = false) {
    for (const [osc, effect] of voices) {
      if (finishEffects && effect) continue;
      try {
        osc.stop();
      } catch {}
      voices.delete(osc);
    }
  }
  function updateMusic() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    if (active && enabled.music && context?.state === "running")
      timer = setInterval(() => {
        const melody = MELODIES[theme] ?? MELODIES.tree;
        const n = melody[step % melody.length];
        tone(n, 0.16, "triangle", 0.032, false);
        if (step % 2 === 0) tone(n - 24, 0.19, "sine", 0.025, false);
        step++;
      }, 210);
  }
  return {
    async unlock() {
      try {
        if (!context) {
          const Constructor =
            globalThis.AudioContext ?? globalThis.webkitAudioContext;
          if (!Constructor) return;
          context = new Constructor();
        }
        if (context.state === "suspended") await context.resume();
        updateMusic();
      } catch {}
    },
    setOptions(value) {
      enabled = { ...enabled, ...value };
      silence();
      updateMusic();
    },
    setActive(value, { finishEffects = false } = {}) {
      active = !!value;
      if (!active) silence(finishEffects);
      updateMusic();
    },
    consume(state) {
      if (identity !== state) {
        identity = state;
        lastEvent = 0;
        step = 0;
      }
      if (theme !== state.level.theme) {
        theme = state.level.theme;
        step = 0;
      }
      for (const e of state.events) {
        const id = Number(e.id.split("-").at(-1));
        if (id <= lastEvent) continue;
        lastEvent = id;
        if (!active || !enabled.sound) continue;
        const notes = {
          jump: 7,
          pickup: 4,
          throw: 12,
          hit: 14,
          break: 2,
          damage: -12,
          lifeLost: -19,
          collect: 16,
          extraLife: 24,
          bossHit: 19,
          bossDefeated: 24,
          bonus: 21,
          clear: 28,
          stun: -4,
        };
        if (
          notes[e.type] !== undefined &&
          tone(
            notes[e.type],
            ["clear", "bossDefeated", "extraLife"].includes(e.type)
              ? 0.5
              : 0.13,
            e.type === "damage" ? "sawtooth" : "sine",
            0.06,
          )
        )
          effects[e.type] = (effects[e.type] ?? 0) + 1;
      }
    },
    diagnostics() {
      return {
        state: context?.state ?? "locked",
        active,
        music: enabled.music,
        sound: enabled.sound,
        voices: voices.size,
        lastEvent,
        effects: { ...effects },
      };
    },
    dispose() {
      active = false;
      if (timer) clearInterval(timer);
      timer = null;
      silence();
      context?.close().catch(() => {});
      context = null;
    },
  };
}
