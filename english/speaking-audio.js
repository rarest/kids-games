const WAV_RATE = 16000;
const MAX_SECONDS = 20;

// Averages samples across each output interval to limit aliasing on downsampling.
export function recordingFromSamples(chunks, sampleRate) {
  if (!Number.isFinite(sampleRate) || sampleRate < WAV_RATE) throw new Error('Unsupported microphone sample rate');
  const length = Math.min(Math.floor(sampleRate * MAX_SECONDS), chunks.reduce((n, c) => n + c.length, 0));
  const source = new Float32Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    const count = Math.min(chunk.length, length - offset);
    if (count <= 0) break;
    source.set(chunk.subarray(0, count), offset); offset += count;
  }
  const outputLength = Math.floor(length * WAV_RATE / sampleRate);
  const buffer = new ArrayBuffer(44 + outputLength * 2);
  const view = new DataView(buffer);
  const text = (at, value) => { for (let i = 0; i < value.length; i++) view.setUint8(at + i, value.charCodeAt(i)); };
  text(0, 'RIFF'); view.setUint32(4, buffer.byteLength - 8, true); text(8, 'WAVE'); text(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, WAV_RATE, true); view.setUint32(28, WAV_RATE * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true); text(36, 'data'); view.setUint32(40, outputLength * 2, true);
  let energy = 0;
  const ratio = sampleRate / WAV_RATE;
  for (let i = 0; i < outputLength; i++) {
    const from = i * ratio, to = (i + 1) * ratio;
    let total = 0;
    for (let j = Math.floor(from); j < Math.ceil(to); j++) {
      const weight = Math.min(to, j + 1) - Math.max(from, j);
      total += (Number.isFinite(source[j]) ? source[j] : 0) * weight;
    }
    const value = Math.max(-1, Math.min(1, total / ratio));
    energy += value * value;
    view.setInt16(44 + i * 2, Math.round(value * (value < 0 ? 32768 : 32767)), true);
  }
  return {blob: new Blob([buffer], {type: 'audio/wav'}), duration: outputLength / WAV_RATE, rms: outputLength ? Math.sqrt(energy / outputLength) : 0};
}

export class MicrophoneRecorder {
  constructor({onProgress = () => {}, onLimit = () => {}, onError = () => {}} = {}) {
    this.onProgress = onProgress; this.onLimit = onLimit; this.onError = onError;
    this.epoch = 0; this.chunks = []; this.samples = 0; this.recording = false;
  }
  async start() {
    this.cancel();
    const epoch = this.epoch;
    const media = globalThis.navigator?.mediaDevices;
    if (!media?.getUserMedia) throw new Error('这个浏览器不能录音。请用支持麦克风的浏览器打开 HTTPS 网页。');
    // Unlock Web Audio while this explicit click still has user activation.
    // Waiting for the permission dialog first can lose activation on iOS.
    const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContext) throw new Error('这个浏览器暂不支持录音。');
    let wakeTimer;
    try {
      this.context = new AudioContext();
      const context = this.context;
      const waking = Promise.resolve(context.resume()).then(() => null, error => error);
      const stream = await media.getUserMedia({audio: {channelCount: 1, echoCancellation: true, noiseSuppression: true}, video: false});
      if (epoch !== this.epoch) { stream.getTracks().forEach(track => track.stop()); return false; }
      this.stream = stream;
      const wakeError = await Promise.race([waking, new Promise(resolve => {wakeTimer = setTimeout(() => resolve(new Error('麦克风音频没有启动，请重新点开始录音。')), 8000);})]);
      clearTimeout(wakeTimer);
      if (epoch !== this.epoch) return false;
      if (wakeError) throw wakeError;
      this.sampleRate = this.context.sampleRate;
      this.source = this.context.createMediaStreamSource(stream);
      this.processor = this.context.createScriptProcessor(4096, 1, 1);
      this.mute = this.context.createGain(); this.mute.gain.value = 0;
      this.source.connect(this.processor); this.processor.connect(this.mute); this.mute.connect(this.context.destination);
      this.processor.onaudioprocess = event => {
        if (epoch !== this.epoch || !this.recording) return;
        const input = event.inputBuffer.getChannelData(0);
        const remaining = Math.floor(this.sampleRate * MAX_SECONDS) - this.samples;
        const chunk = input.slice(0, remaining);
        this.chunks.push(chunk); this.samples += chunk.length;
        let energy = 0;
        for (const value of chunk) energy += value * value;
        this.onProgress({duration: this.samples / this.sampleRate, level: chunk.length ? Math.sqrt(energy / chunk.length) : 0});
        if (this.samples >= this.sampleRate * MAX_SECONDS) this.onLimit();
      };
      if (epoch !== this.epoch) return false;
      this.recording = true;
      this.captureWatchdog = setTimeout(() => {
        if (epoch === this.epoch && this.recording && !this.samples) {
          const error = new Error('麦克风没有传来声音，请重新开始录音。');
          this.cancel(); this.onError(error);
        }
      }, 4000);
      this.timer = setTimeout(() => { if (epoch === this.epoch && this.recording) this.onLimit(); }, MAX_SECONDS * 1000);
      return true;
    } catch (error) {
      clearTimeout(wakeTimer);
      if (epoch === this.epoch) this.cancel();
      throw error;
    }
  }
  stop() {
    if (!this.recording) return null;
    const result = recordingFromSamples(this.chunks, this.sampleRate);
    this.cancel();
    return result;
  }
  cancel() {
    this.epoch++; this.recording = false; clearTimeout(this.timer); clearTimeout(this.captureWatchdog);
    if (this.processor) this.processor.onaudioprocess = null;
    for (const node of [this.source, this.processor, this.mute]) { try { node?.disconnect(); } catch {} }
    this.stream?.getTracks().forEach(track => track.stop());
    if (this.context) this.context.close().catch(() => {});
    this.stream = this.source = this.processor = this.mute = this.context = null;
    this.chunks = []; this.samples = 0;
  }
}
