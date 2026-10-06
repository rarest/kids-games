import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {audioInputs,spokenText} from '../chinese/audio-inputs.mjs';
import {LESSONS} from '../chinese/curriculum.js';
const root=new URL('../chinese/',import.meta.url);
test('fixed Mandarin manifest covers every canonical paragraph and word and every exported file decodes',{timeout:180000},()=>{
 const manifest=JSON.parse(readFileSync(new URL('audio-manifest.json',root)));assert.deepEqual(manifest.inputs,audioInputs);assert.equal(manifest.voice,'zh-CN-XiaoxiaoNeural');assert.equal(audioInputs.filter(x=>x.kind==='paragraph').length,255);
 for(const row of audioInputs){const clip=manifest.clips[row.text];assert.ok(clip,row.source);assert.equal(clip.spoken,spokenText(row.text));assert.ok(statSync(new URL(clip.file,root)).size>500);}
 for(const file of new Set(Object.values(manifest.clips).map(x=>x.file))){const path=new URL(file,root).pathname;assert.doesNotThrow(()=>execFileSync('ffmpeg',['-v','error','-i',path,'-f','null','-'],{stdio:'pipe'}),file);}
 const poem=LESSONS.find(l=>l.number===20).paragraphs[0].text;assert.match(manifest.clips[poem].spoken,/鹿寨/);assert.match(manifest.clips[poem].spoken,/返景/);assert.ok(Object.values(manifest.clips).some(c=>c.spoken.includes('区')&&Object.keys(manifest.clips).some(t=>t.includes('㘗')&&manifest.clips[t]===c)));
});
