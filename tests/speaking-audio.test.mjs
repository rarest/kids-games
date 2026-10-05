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
 const oldNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');let grant,stops=0;
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{mediaDevices:{getUserMedia:()=>new Promise(r=>{grant=r;})}}});
 try{
  const recorder=new MicrophoneRecorder();const started=recorder.start();recorder.cancel();
  grant({getTracks:()=>[{stop(){stops++;}}]});assert.equal(await started,false);assert.equal(stops,1);
 }finally{if(oldNavigator)Object.defineProperty(globalThis,'navigator',oldNavigator);else delete globalThis.navigator;}
});
