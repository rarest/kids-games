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
  constructor(src) { this.src = src; this.volume = 1; this.playbackRate = 1; this.preload = ''; this.loop = false; this.muted = false; this.pauses = 0; this.loads = 0; this.playCalls = 0; this.paused = true; FakeAudio.instances.push(this); }
  cloneNode() { const voice = new FakeAudio(this.src); FakeAudio.voices.push(voice); return voice; }
  play() { FakeAudio.plays += 1; this.playCalls += 1; this.paused = false; return Promise.resolve(); }
  pause() { this.pauses += 1; this.paused = true; }
  load() { this.loads += 1; this.paused = true; }
}

class FakeBufferSource {
  constructor(context) { this.context = context; this.playbackRate = { value: 1 }; this.stopped = false; }
  connect(node) { this.connected = node; return node; }
  start() { this.context.started.push(this); }
  stop() { this.stopped = true; this.onended?.(); }
}

class FakeAudioContext {
  static instances = [];
  constructor() {
    this.state = 'suspended'; this.destination = {}; this.started = [];
    this.resumeCalls = 0; this.suspendCalls = 0; this.decodeCalls = 0;
    FakeAudioContext.instances.push(this);
  }
  createGain() { return { gain: { value: 1 }, connect: node => node }; }
  createBufferSource() { return new FakeBufferSource(this); }
  async decodeAudioData(bytes) { this.decodeCalls += 1; return { byteLength: bytes.byteLength, duration: .5 }; }
  async resume() { this.resumeCalls += 1; this.state = 'running'; }
  async suspend() { this.suspendCalls += 1; this.state = 'suspended'; }
}

const fakeFetch = async url => ({ ok: true, url, arrayBuffer: async () => new Uint8Array([1, 2, 3, 4]).buffer });

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
  FakeAudioContext.instances=[];
  const audio = audioModule.createAudioController({ AudioClass: FakeAudio, AudioContextClass:FakeAudioContext, fetchFn:fakeFetch, now: () => 100, random:()=>.5 });
  await audio.unlock(); await new Promise(resolve=>setTimeout(resolve,0));
  audio.play('footstep');
  audio.play('explosion');
  const started=FakeAudioContext.instances[0].started;
  assert.equal(started.at(-2).connected.gain.value, .65);
  assert.ok(started.at(-1).connected.gain.value >= .34);
});

test('starts a quiet looping royal background track after unlock and follows lifecycle controls',async()=>{
  FakeAudio.instances=[];FakeAudio.plays=0;
  const audio=audioModule.createAudioController({baseUrl:'/audio',AudioClass:FakeAudio});
  assert.equal(FakeAudio.instances.some(item=>item.src?.includes('/royal-garden.m4a?')),false);
  await audio.unlock();
  const music=FakeAudio.instances.find(item=>item.src?.includes('/royal-garden.m4a?'));
  assert.ok(music,'background source');
  assert.equal(music.loop,true);
  assert.equal(music.volume,.12);
  assert.equal(music.playCalls,1);
  assert.equal(music.loads,1);
  assert.equal(music.paused,false);
  await audio.unlock();
  assert.equal(music.loads,1,'repeat unlock must not reload playing music');
  assert.equal(music.playCalls,1,'repeat unlock must not start a duplicate play');
  assert.equal(music.paused,false,'repeat unlock keeps music playing');
  audio.suspend();assert.equal(music.pauses,1);
  audio.resume();assert.equal(music.playCalls,2);
  audio.setEnabled(false);assert.equal(music.pauses,2);
  audio.setEnabled(true);assert.equal(music.playCalls,3);
});

test('primes persistent effect fallbacks during the trusted gesture',async()=>{
  FakeAudio.instances=[];
  const audio=audioModule.createAudioController({baseUrl:'/audio',AudioClass:FakeAudio,AudioContextClass:null,now:()=>100});
  await audio.unlock();await new Promise(resolve=>setTimeout(resolve,0));
  const coin=FakeAudio.instances.find(item=>item.src?.includes('/coin.mp3?'));
  assert.ok(coin,'persistent compatible fallback exists');
  assert.equal(coin.playCalls,1,'fallback was play-unlocked by the gesture');
  assert.equal(coin.paused,true);
  audio.play('coin');
  assert.equal(coin.playCalls,2,'the same unlocked media element plays the event');
});

test('a late priming reset cannot pause the first real fallback effect',async()=>{
  class DeferredAudio extends FakeAudio{
    play(){
      FakeAudio.plays+=1;this.playCalls+=1;this.paused=false;
      let resolve;const promise=new Promise(done=>{resolve=done});
      (this.playResolvers??=[]).push(resolve);return promise;
    }
  }
  FakeAudio.instances=[];
  const audio=audioModule.createAudioController({baseUrl:'/audio',AudioClass:DeferredAudio,AudioContextClass:null,now:()=>100});
  const unlocking=audio.unlock();
  const coin=FakeAudio.instances.find(item=>item.src?.includes('/coin.mp3?'));
  assert.equal(audio.play('coin'),true,'first event starts before the priming promise settles');
  assert.equal(coin.paused,false);
  coin.playResolvers[0]();await Promise.resolve();
  assert.equal(coin.paused,false,'stale prime completion does not pause the newer real event');
  assert.equal(coin.muted,false,'the first real fallback effect is audible after stale priming settles');
  coin.playResolvers[1]();await unlocking;
});

test('falls back when AudioContext construction or resume fails and drains queued input',async()=>{
  class ConstructorFailure{constructor(){throw new Error('unsupported')}}
  class ResumeFailure extends FakeAudioContext{async resume(){this.resumeCalls+=1;throw new Error('blocked')}}
  for(const AudioContextClass of [ConstructorFailure,ResumeFailure]){
    FakeAudio.instances=[];
    const audio=audioModule.createAudioController({baseUrl:'/audio',AudioClass:FakeAudio,AudioContextClass,fetchFn:fakeFetch,now:()=>100});
    const unlocking=audio.unlock();audio.play('key');await unlocking;await new Promise(resolve=>setTimeout(resolve,0));
    const key=FakeAudio.instances.find(item=>item.src?.includes('/key.mp3?'));
    assert.ok(key.playCalls>=2,'priming plus the real queued/follow-up effect use media fallback');
    assert.equal(audio.diagnostics.usingWebAudio,false);
    assert.equal(audio.diagnostics.pendingEffects,0);
  }
});

test('decode failure drains the event through its persistent fallback',async()=>{
  class DecodeFailure extends FakeAudioContext{async decodeAudioData(){this.decodeCalls+=1;throw new Error('bad codec')}}
  FakeAudio.instances=[];
  const audio=audioModule.createAudioController({baseUrl:'/audio',AudioClass:FakeAudio,AudioContextClass:DecodeFailure,fetchFn:fakeFetch,now:()=>100});
  await audio.unlock();audio.play('door-open');await new Promise(resolve=>setTimeout(resolve,0));
  const source=FakeAudio.instances.find(item=>item.src?.includes('/door-open.mp3?'));
  assert.ok(source.playCalls>=2,'priming plus decoded-buffer fallback playback');
  assert.equal(audio.diagnostics.pendingEffects,0);
});

test('versions every runtime audio URL with the release token',()=>{
  const release=audioModule.AUDIO_RELEASE;
  assert.equal(release,'20260831a');
  for(const definition of Object.values(audioModule.SOUND_DEFINITIONS))for(const file of definition.files)assert.equal(audioModule.audioAssetUrl('/audio',file),`/audio/${file}?v=${release}`);
  for(const candidate of audioModule.MUSIC_DEFINITION.files)assert.equal(audioModule.audioAssetUrl('/audio',candidate.file),`/audio/${candidate.file}?v=${release}`);
});

test('unlocks one shared audio graph and plays effects without cloning media elements', async () => {
  FakeAudio.instances=[]; FakeAudio.voices=[]; FakeAudioContext.instances=[];
  const audio=audioModule.createAudioController({
    baseUrl:'/audio', AudioClass:FakeAudio, AudioContextClass:FakeAudioContext,
    fetchFn:fakeFetch, now:()=>100, random:()=>.5
  });
  assert.equal(audio.play('footstep'),false,'trusted gesture is still required');
  await audio.unlock();
  await new Promise(resolve=>setTimeout(resolve,0));
  assert.equal(audio.play('footstep'),true);
  const context=FakeAudioContext.instances[0];
  assert.ok(context,'one shared context is created');
  assert.equal(context.resumeCalls,1);
  assert.equal(context.started.length,1,'footstep starts a decoded buffer source');
  assert.equal(FakeAudio.voices.length,0,'effect playback never clones a media element');
  assert.equal(audio.diagnostics.activeEffectSources,1);
});

test('suspending audio stops active effects and never replays stale queued events', async () => {
  FakeAudioContext.instances=[];
  const audio=audioModule.createAudioController({AudioClass:FakeAudio,AudioContextClass:FakeAudioContext,fetchFn:fakeFetch,now:()=>200});
  await audio.unlock(); await new Promise(resolve=>setTimeout(resolve,0));
  audio.play('coin');
  const context=FakeAudioContext.instances[0];
  assert.ok(context,'one shared context is created');
  const source=context.started[0];
  audio.suspend();
  assert.equal(source.stopped,true);
  assert.equal(context.suspendCalls,1);
  assert.equal(audio.diagnostics.pendingEffects,0);
  await audio.resume();
  assert.equal(context.started.length,1,'resume does not replay a completed event');
});

test('ships nine distinct non-empty recorded effects and a source ledger', async () => {
  const names = ['footstep','bump','coin','key','door-locked','door-open','purchase','explosion','hook'];
  const hashes = new Set();
  for (const name of names) {
    const bytes = await readFile(new URL(`../maze/audio/${name}.webm`, import.meta.url));
    const compatibleBytes = await readFile(new URL(`../maze/audio/${name}.mp3`, import.meta.url));
    assert.ok(bytes.length > 1000, name);
    assert.ok(compatibleBytes.length > 1000, `${name}.mp3`);
    hashes.add(createHash('sha256').update(bytes).digest('hex'));
  }
  assert.equal(hashes.size, names.length);
  const licenses = await readFile(new URL('../maze/audio/LICENSES.md', import.meta.url), 'utf8');
  for (const name of names) {
    assert.match(licenses, new RegExp(`\\b${name}\\.webm\\b`), name);
    assert.match(licenses, new RegExp(`\\b${name}\\.mp3\\b`), `${name}.mp3`);
  }
  assert.match(licenses, /CC0/i);
});

test('ships the original background loop and documents its origin',async()=>{
  const bytes=await readFile(new URL('../maze/audio/royal-garden.webm',import.meta.url));
  assert.ok(bytes.length>20_000);
  const licenses=await readFile(new URL('../maze/audio/LICENSES.md',import.meta.url),'utf8');
  assert.match(licenses,/royal-garden\.webm/);
  assert.match(licenses,/royal-garden\.m4a/);
  assert.match(licenses,/原创|original/i);
});
