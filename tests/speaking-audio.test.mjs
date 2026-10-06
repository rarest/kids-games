import test from 'node:test';
import assert from 'node:assert/strict';
import {recordingFromSamples, MicrophoneRecorder} from '../english/speaking-audio.js';

test('captured PCM is resampled to 16 kHz mono signed little endian WAV',async()=>{
 const capture=Float32Array.from({length:48000},(_,i)=>0.5*Math.sin(2*Math.PI*440*i/48000));
 const result=recordingFromSamples([capture],48000);
 const bytes=await result.blob.arrayBuffer(),v=new DataView(bytes);
 assert.equal(new TextDecoder().decode(bytes.slice(0,4)),'RIFF');
 assert.equal(v.getUint16(22,true),1);assert.equal(v.getUint32(24,true),16000);
 assert.equal(v.getUint16(34,true),16);assert.equal(v.getUint32(40,true),32000);
 assert.equal(result.duration,1);assert.ok(result.rms>0.3&&result.rms<0.4);
 assert.ok(Math.abs(v.getInt16(44+2*100,true)+16384)<500);
});

test('duration cannot exceed 20 seconds and silence stays silent',async()=>{
 const result=recordingFromSamples([new Float32Array(44100*21)],44100);
 assert.equal(result.duration,20);assert.equal(result.rms,0);
 assert.equal(result.blob.size,640044);
 const bytes=new Uint8Array(await result.blob.arrayBuffer());assert.ok(bytes.slice(44).every(n=>n===0));
});

test('permission granted after cancellation stops the late microphone tracks',async()=>{
 const oldNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator'),oldContext=globalThis.AudioContext;let grant,stops=0;globalThis.AudioContext=class{resume(){return Promise.resolve()}close(){return Promise.resolve()}};
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{mediaDevices:{getUserMedia:()=>new Promise(r=>{grant=r;})}}});
 try{
  const recorder=new MicrophoneRecorder();const started=recorder.start();recorder.cancel();
  grant({getTracks:()=>[{stop(){stops++;}}]});assert.equal(await started,false);assert.equal(stops,1);
 }finally{if(oldNavigator)Object.defineProperty(globalThis,'navigator',oldNavigator);else delete globalThis.navigator;globalThis.AudioContext=oldContext;}
});

test('audio engine is unlocked inside the record gesture before waiting for microphone permission',async()=>{
 const nav=Object.getOwnPropertyDescriptor(globalThis,'navigator'),ctx=globalThis.AudioContext;let grant,stops=0;const order=[];
 const node=()=>({connect(){},disconnect(){},gain:{value:1}});
 class Context{sampleRate=48000;state='running';constructor(){order.push('context')}resume(){order.push('resume');return Promise.resolve()}createMediaStreamSource(){return node()}createScriptProcessor(){return node()}createGain(){return node()}close(){return Promise.resolve()}}
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{mediaDevices:{getUserMedia:()=>{order.push('permission');return new Promise(r=>grant=r)}}}});globalThis.AudioContext=Context;
 try{const recorder=new MicrophoneRecorder(),pending=recorder.start();assert.deepEqual(order,['context','resume','permission']);grant({getTracks:()=>[{stop(){stops++}}]});assert.equal(await pending,true);recorder.cancel();assert.equal(stops,1)}finally{if(nav)Object.defineProperty(globalThis,'navigator',nav);else delete globalThis.navigator;globalThis.AudioContext=ctx}
});

test('a started audio engine that sends no samples releases the microphone and reports a recoverable error',async()=>{
 const saved={navigator:Object.getOwnPropertyDescriptor(globalThis,'navigator'),context:globalThis.AudioContext,timer:globalThis.setTimeout,clear:globalThis.clearTimeout};let stops=0,error;const timers=new Map(),node=()=>({connect(){},disconnect(){},gain:{value:1}});
 globalThis.setTimeout=(fn,delay)=>{timers.set(delay,fn);return delay};globalThis.clearTimeout=id=>timers.delete(id);
 globalThis.AudioContext=class{sampleRate=48000;resume(){return Promise.resolve()}createMediaStreamSource(){return node()}createScriptProcessor(){return node()}createGain(){return node()}close(){return Promise.resolve()}};
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{mediaDevices:{getUserMedia:async()=>({getTracks:()=>[{stop(){stops++}}]})}}});
 try{const recorder=new MicrophoneRecorder({onError:e=>error=e});assert.equal(await recorder.start(),true);timers.get(4000)();assert.equal(recorder.recording,false);assert.equal(stops,1);assert.match(error.message,/麦克风没有传来声音/);assert.equal(timers.size,0)}finally{if(saved.navigator)Object.defineProperty(globalThis,'navigator',saved.navigator);else delete globalThis.navigator;globalThis.AudioContext=saved.context;globalThis.setTimeout=saved.timer;globalThis.clearTimeout=saved.clear}
});
