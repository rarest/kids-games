import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {validateWav} from '../platform/pronunciation.mjs';
const require=createRequire(import.meta.url);
const {createMedia}=require('../miniprogram/lib/media.js');
function wav(){const b=Buffer.alloc(16044);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(16000,24);b.writeUInt32LE(32000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(16000,40);return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)}
async function recorded(data=wav()){
 let recorder,request;const diagnostics=[],players=[];
 const wx={requirePrivacyAuthorize:o=>o.success(),authorize:o=>o.success(),getRecorderManager:()=>recorder??={onStart(f){this.started=f},onStop(f){this.stopped=f},onError(){},offStart(){},offStop(){},offError(){},start(){this.started()},stop(){}},getFileSystemManager:()=>({unlink(){},readFile:o=>o.success({data})}),request:o=>{request=o;return{abort(){}}},createInnerAudioContext:()=>{const a={onEnded(){},onError(){},play(){},stop(){},destroy(){}};players.push(a);return a}};
 const media=createMedia(wx,{onDiagnostic:d=>diagnostics.push(d)});media.setTarget({id:'p4-line-1-3',en:'Nice to meet you.'});await media.record();media.stopRecord();recorder.stopped({tempFilePath:'wxfile://temp/record.wav',duration:500});
 return {media,diagnostics,players,get request(){return request}};
}
test('incomplete native WAV is caught before upload and remains available for replay',async()=>{
 const data=wav();new DataView(data).setUint32(4,0,true);const h=await recorded(data);const pending=h.media.submit();await Promise.resolve();h.request?.success({statusCode:400,data:{error:'Invalid WAV recording'}});await pending;
 assert.equal(h.request,undefined);assert.match(h.media.state.message,/录音.*完整|重新录音/);assert.equal(h.media.state.clip,true);assert.equal(h.media.state.assessing,false);h.media.replay();assert.equal(h.players[0].src,'wxfile://temp/record.wav');
 assert.deepEqual(h.diagnostics.at(-1),{stage:'file',code:'WAV_LENGTH_MISMATCH',byteLength:16044,riffBytes:8,container:'RIFF/WAVE'});
});
test('server WAV rejection retains safe status and known reason instead of generic feedback',async()=>{
 const h=await recorded();const pending=h.media.submit();await Promise.resolve();h.request.success({statusCode:400,data:{error:'Invalid WAV recording'}});await pending;
 assert.match(h.media.state.message,/录音.*格式|重新录音/);assert.equal(h.media.state.result,null);assert.equal(h.media.state.clip,true);
 assert.deepEqual(h.diagnostics.at(-1),{stage:'upload',code:'INVALID_WAV',status:400,byteLength:16044,riffBytes:16044,container:'RIFF/WAVE'});
});
test('network timeout is distinguished and does not publish a score',async()=>{
 const h=await recorded();const pending=h.media.submit();await Promise.resolve();h.request.fail({errMsg:'request:fail timeout',errno:5});await pending;
 assert.match(h.media.state.message,/超时/);assert.equal(h.media.state.result,null);assert.equal(h.media.state.clip,true);assert.equal(h.diagnostics.at(-1).code,'REQUEST_TIMEOUT');assert.equal(h.diagnostics.at(-1).errno,5);
});
test('failed upload stays replayable and explicit retry submits the same saved recording',async()=>{
 const h=await recorded();let pending=h.media.submit();await Promise.resolve();const first=h.request;first.fail({errMsg:'request:fail timeout'});await pending;
 assert.equal(h.media.state.clip,true);assert.equal(h.media.state.assessing,false);h.media.replay();assert.equal(h.players.at(-1).src,'wxfile://temp/record.wav');assert.equal(h.request,first,'replay must not upload');
 pending=h.media.submit();await Promise.resolve();assert.notEqual(h.request,first);assert.deepEqual(h.request.data,first.data);h.request.success({statusCode:200,data:{engine:'local-phoneme',score:80,accuracy:80,completeness:90,duration:.5,words:[{word:'Nice',score:80}]}});await pending;
 assert.equal(h.media.state.result.score,80);assert.equal(h.media.state.diagnostic,null);assert.equal(h.media.state.assessing,false);
});
test('successful upload validates genuine result while malformed feedback stays rejected',async()=>{
 const h=await recorded();const good={engine:'local-phoneme',score:80,accuracy:80,completeness:90,duration:.5,words:[{word:'Nice',score:80},{word:'to',score:80},{word:'meet',score:80},{word:'you',score:80}]};
 let pending=h.media.submit();await Promise.resolve();h.request.success({statusCode:200,data:good});await pending;assert.deepEqual(h.media.state.result,good);assert.equal(h.diagnostics.length,0);
 pending=h.media.submit();await Promise.resolve();h.request.success({statusCode:200,data:{...good,score:999}});await pending;assert.equal(h.media.state.result,null);assert.equal(h.diagnostics.at(-1).code,'INVALID_RESULT');
});
test('iOS WAV with RIFF length 44 bytes too large uploads a lossless valid copy',async()=>{
 const input=wav(),view=new DataView(input);view.setUint32(4,input.byteLength+36,true);
 const samples=new Uint8Array(input,44);for(let i=0;i<samples.length;i++)samples[i]=i%251;
 const h=await recorded(input),pending=h.media.submit();await Promise.resolve();
 assert.equal(!!h.request,true,'complete PCM with the observed iOS RIFF size error should upload');
 assert.notEqual(h.request.data,input);assert.deepEqual(validateWav(Buffer.from(h.request.data)),{duration:.5});
 assert.deepEqual(new Uint8Array(h.request.data,8),new Uint8Array(input,8));assert.equal(view.getUint32(4,true),16080,'original recording stays unchanged');
 h.request.success({statusCode:422,data:{error:'No clear speech detected. Please retry'}});await pending;
});
test('RIFF repair refuses malformed chunks, incompatible PCM and unrelated size mismatches',async()=>{
 const cases=[{name:'truncated PCM',change:v=>v.setUint32(40,16044,true)},{name:'wrong sample rate',change:v=>v.setUint32(24,44100,true)},{name:'stereo',change:v=>v.setUint16(22,2,true)},{name:'8-bit samples',change:v=>v.setUint16(34,8,true)},{name:'unrelated length',change:v=>v.setUint32(4,16045,true)}];
 for(const c of cases){const input=wav(),view=new DataView(input);view.setUint32(4,input.byteLength+36,true);c.change(view);const h=await recorded(input),pending=h.media.submit();await Promise.resolve();h.request?.success({statusCode:400,data:{error:'Invalid WAV recording'}});await pending;assert.equal(!!h.request,false,c.name);assert.equal(h.media.state.result,null);assert.equal(h.diagnostics.at(-1).code,'WAV_LENGTH_MISMATCH',c.name)}
});
test('observed iOS 44-byte WAV header repairs all three fields without changing PCM samples',async()=>{
 const input=wav(),view=new DataView(input);view.setUint32(4,input.byteLength+36,true);view.setUint16(32,4,true);view.setUint32(40,input.byteLength,true);
 const samples=new Uint8Array(input,44);for(let i=0;i<samples.length;i++)samples[i]=(i*17)%251;
 const original=input.slice(0),h=await recorded(input),pending=h.media.submit();await Promise.resolve();
 assert.equal(!!h.request,true,'the exact observed iOS header should be canonicalized');
 const output=h.request.data,canonical=new DataView(output);assert.deepEqual(validateWav(Buffer.from(output)),{duration:.5});
 assert.equal(canonical.getUint32(4,true),16036);assert.equal(canonical.getUint16(32,true),2);assert.equal(canonical.getUint32(40,true),16000);
 assert.deepEqual(new Uint8Array(output,44),new Uint8Array(input,44));assert.deepEqual(new Uint8Array(input),new Uint8Array(original));
 h.request.success({statusCode:422,data:{error:'No clear speech detected. Please retry'}});await pending;
});
test('iOS three-field repair does not accept other alignment, sizes or encodings',async()=>{
 const changes=[v=>v.setUint16(32,3,true),v=>v.setUint32(40,16042,true),v=>v.setUint32(16,18,true),v=>v.setUint16(20,3,true),v=>v.setUint32(28,64000,true),v=>v.setUint16(22,2,true)];
 for(const change of changes){const input=wav(),v=new DataView(input);v.setUint32(4,input.byteLength+36,true);v.setUint16(32,4,true);v.setUint32(40,input.byteLength,true);change(v);const h=await recorded(input),pending=h.media.submit();await Promise.resolve();h.request?.success({statusCode:400,data:{error:'Invalid WAV recording'}});await pending;assert.equal(!!h.request,false);assert.equal(h.media.state.result,null)}
});
