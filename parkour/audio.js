export function createAudio() {
  let context = null,
    muted = false,
    paused = false,
    authorized = false;
  const active = new Set();
  async function activate() {
    if (!authorized || muted || paused) return;
    try {
      context ??= new (window.AudioContext || window.webkitAudioContext)();
      if (context.state === "suspended") await context.resume();
      // A mode/mute change can arrive while the native resume promise is pending.
      if (muted || paused) await context.suspend();
    } catch {}
  }
  function unlock() {
    authorized = true;
    return activate();
  }
  const stop = () => {
    for (const voice of active) {
      try {
        voice.osc.stop();
      } catch {}
      voice.osc.disconnect();
      voice.gain.disconnect();
    }
    active.clear();
  };
  return {
    unlock,
    play(type) {
      if (
        !context ||
        context.state !== "running" ||
        muted ||
        paused ||
        active.size >= 6
      )
        return;
      const frequencies = type === "finish" ? [523.25, 659.25, 783.99] : [{
          jump: 470,
          coin: 1040,
          land: 160,
          checkpoint: 740,
          powerup: 940,
        }[type]];
      for (const [index, frequency] of frequencies.entries()) {
        if (!frequency) return;
        const osc = context.createOscillator(),
          gain = context.createGain(),
          voice = { osc, gain };
        active.add(voice);
        const now = context.currentTime + index * 0.2;
        osc.type = type === "land" ? "triangle" : "sine";
        osc.frequency.setValueAtTime(frequency, now);
        osc.frequency.exponentialRampToValueAtTime(
          type === "jump" ? 760 : frequency * 0.8,
          now + 0.1,
        );
        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        osc.connect(gain);
        gain.connect(context.destination);
        osc.onended = () => {
          active.delete(voice);
          osc.disconnect();
          gain.disconnect();
        };
        osc.start(now);
        osc.stop(now + 0.17);
      }
    },
    setMuted(value) {
      muted = value;
      if (value) {
        stop();
        context?.suspend().catch(() => {});
      } else activate();
    },
    setPaused(value) {
      paused = value;
      if (value) {
        stop();
        context?.suspend().catch(() => {});
      } else activate();
    },
    dispose() {
      stop();
      context?.close().catch(() => {});
    },
  };
}
