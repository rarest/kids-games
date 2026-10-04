import test from 'node:test';
import assert from 'node:assert/strict';
import { createAudio } from '../memory/audio.js';
test('a pending audio resume cannot recreate a scheduler after pause', async () => {
  const oldWindow = globalThis.window, oldDocument = globalThis.document, oldInterval = globalThis.setInterval;
  let release, intervals = 0;
  class DelayedAudio {
    constructor() { this.state = 'suspended'; this.currentTime = 0; this.destination = {}; }
    createGain() { return { gain: { value: 0 }, connect() {} }; }
    resume() { return new Promise(resolve => release = resolve); }
    suspend() { return Promise.resolve(); }
  }
  globalThis.window = { AudioContext: DelayedAudio }; globalThis.document = { hidden: false };
  globalThis.setInterval = () => { intervals++; return 1; };
  try { const audio = createAudio(); const pending = audio.start(); audio.stop(); release(); await pending; assert.equal(intervals, 0); }
  finally { globalThis.window = oldWindow; globalThis.document = oldDocument; globalThis.setInterval = oldInterval; }
});
