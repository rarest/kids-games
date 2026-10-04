import test from 'node:test';
import assert from 'node:assert/strict';
import {AudioReader} from '../english/audio-reader.js';
test('a cancelled play promise cannot pause or resolve the newer sentence',async()=>{
 const Original=globalThis.Audio;const requests=[];let paused=0;
 class FakeAudio extends EventTarget {play(){return new Promise((resolve,reject)=>requests.push({resolve,reject}));}pause(){paused++;}}
 globalThis.Audio=FakeAudio;
 try{const reader=new AudioReader({manifest:{'sentence:One.':'one.mp3','sentence:Two.':'two.mp3'},words:{},baseURL:'https://example.com/english/'});
  const first=reader.speak('One.');const second=reader.speak('Two.');const before=paused;requests[0].resolve();await Promise.resolve();await Promise.resolve();assert.equal(paused,before,'stale audio must not pause current audio');requests[1].resolve();reader.clip.dispatchEvent(new Event('ended'));assert.equal(await first,false);assert.equal(await second,true);
 }finally{globalThis.Audio=Original;}
});

test('native fallback uses the page phonics example instead of reading its notation',async()=>{
 const oldSynth=globalThis.speechSynthesis,oldUtterance=globalThis.SpeechSynthesisUtterance;const spoken=[];
 globalThis.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
 globalThis.speechSynthesis={cancel(){},getVoices(){return[{lang:'en-US'}];},speak(utterance){spoken.push(utterance.text);utterance.onend();}};
 try{const word={en:'qu',say:'quiet',zh:'字母组合qu',ipa:'/kw/'};const reader=new AudioReader({manifest:{},words:{'photo-qu':word},baseURL:'https://example.com/english/'});assert.equal(await reader.speak(word,'photo-qu'),true);assert.deepEqual(spoken,['quiet']);}finally{globalThis.speechSynthesis=oldSynth;globalThis.SpeechSynthesisUtterance=oldUtterance;}
});
