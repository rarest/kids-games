import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

let audioModule;
try { audioModule = await import('../maze/audio.js'); } catch {}

class FakeAudio {
  static plays = 0;
  static voices = [];
  static instances = [];
  constructor(src) { this.src = src; this.volume = 1; this.playbackRate = 1; this.preload = ''; this.loop = false; this.pauses = 0; this.loads = 0; this.paused = true; FakeAudio.instances.push(this); }
  cloneNode() { const voice = new FakeAudio(this.src); FakeAudio.voices.push(voice); return voice; }
  play() { FakeAudio.plays += 1; this.paused = false; return Promise.resolve(); }
  pause() { this.pauses += 1; this.paused = true; }
  load() { this.loads += 1; this.paused = true; }
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

test('starts a quiet looping royal background track after unlock and follows lifecycle controls',async()=>{
  FakeAudio.instances=[];FakeAudio.plays=0;
  const audio=audioModule.createAudioController({baseUrl:'/audio',AudioClass:FakeAudio});
  assert.equal(FakeAudio.instances.some(item=>item.src?.endsWith('/royal-garden.webm')),false);
  await audio.unlock();
  const music=FakeAudio.instances.find(item=>item.src?.endsWith('/royal-garden.webm'));
  assert.ok(music,'background source');
  assert.equal(music.loop,true);
  assert.equal(music.volume,.12);
  assert.equal(FakeAudio.plays,1);
  assert.equal(music.loads,1);
  assert.equal(music.paused,false);
  await audio.unlock();
  assert.equal(music.loads,1,'repeat unlock must not reload playing music');
  assert.equal(FakeAudio.plays,1,'repeat unlock must not start a duplicate play');
  assert.equal(music.paused,false,'repeat unlock keeps music playing');
  audio.suspend();assert.equal(music.pauses,1);
  audio.resume();assert.equal(FakeAudio.plays,2);
  audio.setEnabled(false);assert.equal(music.pauses,2);
  audio.setEnabled(true);assert.equal(FakeAudio.plays,3);
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

test('ships the original background loop and documents its origin',async()=>{
  const bytes=await readFile(new URL('../maze/audio/royal-garden.webm',import.meta.url));
  assert.ok(bytes.length>20_000);
  const licenses=await readFile(new URL('../maze/audio/LICENSES.md',import.meta.url),'utf8');
  assert.match(licenses,/royal-garden\.webm/);
  assert.match(licenses,/原创|original/i);
});
