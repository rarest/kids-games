// Original, locally synthesized music. No remote audio, recording or tracking.
export function createAudio() {
  let context = null, output = null, timer = null, next = 0, beat = 0, muted = false, active = false;
  const notes = [60, 62, 64, 67, 69, 72, 74, 76], voices = new Set();
  function tone(note, when, duration, volume, type = 'sine') {
    if (!context || muted || voices.size > 28) return;
    const osc = context.createOscillator(), gain = context.createGain(); osc.type = type;
    osc.frequency.value = 440 * 2 ** ((note - 69) / 12); gain.gain.setValueAtTime(.0001, when);
    gain.gain.exponentialRampToValueAtTime(volume, when + .025); gain.gain.exponentialRampToValueAtTime(.0001, when + duration);
    osc.connect(gain); gain.connect(output); osc.start(when); osc.stop(when + duration + .02); voices.add(osc);
    osc.onended = () => { voices.delete(osc); osc.disconnect(); gain.disconnect(); };
  }
  function schedule() {
    if (!context || !active || muted || context.state !== 'running') return;
    while (next < context.currentTime + .7) {
      // A 128-beat phrase changes its voicing and melody between sections.
      const section = Math.floor(beat / 16) % 8, chords = [0, 2, 4, 1, 3, 0, 4, 2];
      if (beat % 4 === 0) { const base = notes[chords[section]] - 12; tone(base, next, 3.1, .023); tone(base + 7, next + .06, 2.8, .014); }
      if (beat % 2 === 0) tone(notes[(beat * 3 + section + Math.floor(beat / 128)) % notes.length], next, 1.2, .023, 'triangle');
      beat++; next += .74;
    }
  }
  async function start() {
    active = true;
    if (!context) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; context = new C(); output = context.createGain(); output.gain.value = .5; output.connect(context.destination); }
    if (muted || document.hidden) return;
    try { await context.resume(); } catch { return; }
    if (!active || muted || document.hidden || context.state !== 'running') return;
    next = Math.max(next, context.currentTime + .03); schedule();
    if (!timer) timer = setInterval(schedule, 300);
  }
  function stop() { active = false; clearInterval(timer); timer = null; context?.suspend().catch(() => {}); }
  function setMuted(value) {
    muted = value; if (output) output.gain.value = value ? 0 : .5;
    if (value) { clearInterval(timer); timer = null; }
    else if (active) start();
  }
  function effect(kind) {
    if (!context || context.state !== 'running' || muted) return;
    const now = context.currentTime;
    if (kind === 'flip') tone(76, now, .095, .09, 'triangle');
    if (kind === 'mismatch') tone(58, now, .22, .055);
    if (kind === 'match' || kind === 'bomb') { tone(72, now, .24, .12); tone(79, now + .08, .4, .1); }
    if (kind === 'win') for (const [i, n] of [72, 76, 79, 84].entries()) tone(n, now + i * .13, .7, .1);
    if (kind === 'buy') { tone(79, now, .14, .075); tone(84, now + .08, .26, .06); }
  }
  return { start, stop, setMuted, effect };
}
