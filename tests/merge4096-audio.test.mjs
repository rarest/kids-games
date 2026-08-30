import test from 'node:test';
import assert from 'node:assert/strict';
import {createAudioController} from '../merge4096/audio.js';

test('audio is lazy and safely degrades without AudioContext', async () => {
  const controller = createAudioController({AudioContext:null});
  await controller.unlock();
  controller.setEnabled(false);
  controller.playEffect('merge',64);
  controller.destroy();
  assert.equal(controller.isUnlocked(),false);
});

test('unlock creates one context and disabling stops music scheduling', async () => {
  let contexts=0, intervals=0, clears=0;
  class FakeParam{setValueAtTime(){} exponentialRampToValueAtTime(){}}
  class FakeNode{constructor(){this.gain=new FakeParam();this.frequency=new FakeParam()}connect(){return this}start(){}stop(){}disconnect(){}}
  class FakeContext{constructor(){contexts++;this.currentTime=0;this.destination={}}createGain(){return new FakeNode()}createOscillator(){return new FakeNode()}resume(){return Promise.resolve()}close(){}}
  const controller=createAudioController({AudioContext:FakeContext,setInterval:()=>++intervals,clearInterval:()=>clears++});
  await controller.unlock();
  await controller.unlock();
  assert.equal(contexts,1);
  assert.equal(intervals,1);
  controller.setEnabled(false);
  assert.equal(clears,1);
});
