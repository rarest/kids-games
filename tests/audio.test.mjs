import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

let audioModule;
try { audioModule = await import('../maze/audio.js'); } catch {}

class FakeAudio {
  static plays = 0;
  static voices = [];
  constructor(src) { this.src = src; this.volume = 1; this.playbackRate = 1; this.preload = ''; }
  cloneNode() { const voice = new FakeAudio(this.src); FakeAudio.voices.push(voice); return voice; }
  play() { FakeAudio.plays += 1; return Promise.resolve(); }
  pause() {}
  load() {}
}

test('stays silent before unlock or when disabled and throttles tiny footsteps', async () => {
  assert.ok(audioModule, 'maze/audio.js should exist');
  let time = 0;
  const audio = audioModule.createAudioController({ baseUrl: '/audio', AudioClass: FakeAudio, now: () => time });
  assert.equal(audio.play('footstep'), false);
  await audio.unlock();
  assert.equal(audio.play('footstep'), true);
  time = 40;
  assert.equal(audio.play('footstep'), false);
  time = 91;
  assert.equal(audio.play('footstep'), true);
  audio.setEnabled(false);
  assert.equal(audio.play('coin'), false);
});

test('plays a clearly audible footstep and audible explosion', async () => {
  FakeAudio.voices = [];
  const audio = audioModule.createAudioController({ AudioClass: FakeAudio, now: () => 100 });
  await audio.unlock();
  audio.play('footstep');
  audio.play('explosion');
  assert.equal(FakeAudio.voices.at(-2).volume, .65);
  assert.ok(FakeAudio.voices.at(-1).volume >= .34);
});

test('ships nine distinct non-empty recorded effects and a source ledger', async () => {
  const names = ['footstep','bump','coin','key','door-locked','door-open','purchase','explosion','hook'];
  const hashes = new Set();
  for (const name of names) {
    const bytes = await readFile(new URL(`../maze/audio/${name}.webm`, import.meta.url));
    assert.ok(bytes.length > 1000, name);
    hashes.add(createHash('sha256').update(bytes).digest('hex'));
  }
  assert.equal(hashes.size, names.length);
  const licenses = await readFile(new URL('../maze/audio/LICENSES.md', import.meta.url), 'utf8');
  for (const name of names) assert.match(licenses, new RegExp(`\\b${name}\\.webm\\b`), name);
  assert.match(licenses, /CC0/i);
});
