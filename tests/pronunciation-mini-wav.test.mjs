import test from 'node:test';
import assert from 'node:assert/strict';
import * as scoring from '../platform/pronunciation.mjs';

function nativeWav(){
 const b=Buffer.alloc(16044);b.write('RIFF');b.writeUInt32LE(b.length+36,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);
 b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(16000,24);b.writeUInt32LE(32000,28);
 b.writeUInt16LE(4,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(b.length,40);
 for(let i=44;i<b.length;i++)b[i]=i%251;return b;
}
test('known native iPhone header is losslessly canonicalized and unrelated malformed headers stay rejected',()=>{
 const input=nativeWav(),original=Buffer.from(input),output=scoring.normalizeMiniprogramWav(input);
 assert.deepEqual(scoring.validateWav(output),{duration:.5});
 assert.deepEqual(output.subarray(44),input.subarray(44));assert.deepEqual(input,original);
 for(const change of [b=>b.writeUInt16LE(2,22),b=>b.writeUInt32LE(44100,24),b=>b.writeUInt16LE(3,32),b=>b.writeUInt32LE(b.length-2,40)]){
  const bad=nativeWav();change(bad);assert.equal(scoring.normalizeMiniprogramWav(bad),bad);assert.throws(()=>scoring.validateWav(bad));
 }
});
test('mini scoring route corrects the known native header while web route keeps strict WAV requirements',async t=>{
 const {createApi}=await import('../platform/server.mjs');
 let received;
 const api=createApi({store:{},secret:'testing-secret-longer-than-thirty-two-characters',publicOrigin:'https://games.test',getSpeechTarget:id=>id==='cat'?{id,en:'cat'}:null,pronunciation:{assess:async({audio})=>{scoring.validateWav(audio);received=audio;return{score:80}}}});
 await new Promise(r=>api.listen(0,'127.0.0.1',r));t.after(()=>api.close());
 const base=`http://127.0.0.1:${api.address().port}`,input=nativeWav();
 const mini=await fetch(base+'/api/miniprogram/pronunciation?target=cat',{method:'POST',headers:{'Content-Type':'audio/wav'},body:input});
 assert.equal(mini.status,200);assert.deepEqual(received.subarray(44),input.subarray(44));
 const web=await fetch(base+'/api/english/pronunciation?target=cat',{method:'POST',headers:{'Content-Type':'audio/wav',Origin:'https://games.test'},body:input});
 assert.equal(web.status,400);
});
