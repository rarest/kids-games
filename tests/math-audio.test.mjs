import test from 'node:test';
import assert from 'node:assert/strict';
import {audioInputs,spokenText} from '../math/audio-inputs.mjs';
import {LESSONS} from '../math/curriculum.js';
test('spoken mathematics preserves fractions, operators, brackets and degrees',()=>{
 for(const [text,want] of [['3/4','4分之3'],['18−6+2','18减6加2'],['（8+4）×3=36','左括号8加4右括号乘以3等于36'],['36÷(3+3)','36除以左括号3加3右括号'],['90°，1/4＜1/2','90度，4分之1小于2分之1'],['第21—24页','第21到24页']])assert.equal(spokenText(text),want);
});
test('every visible Listen step maps to a fixed spoken input without changing curriculum text',()=>{
 const inputs=new Map(audioInputs.map(x=>[x.text,x]));for(const lesson of LESSONS)for(const s of lesson.steps){const text=s.prompt||s.text||'';if(text)assert.equal(inputs.get(text)?.spoken,spokenText(text),lesson.id+' '+s.kind);}assert.ok(audioInputs.length>=400);assert.ok(audioInputs.every(x=>x.source&&x.spoken));
});

test('all published Listen inputs have existing fully decodable fixed audio',async()=>{
 const {readFile}=await import('node:fs/promises');const {spawnSync}=await import('node:child_process');const manifest=JSON.parse(await readFile(new URL('../math/audio-manifest.json',import.meta.url),'utf8'));const decoded=new Set();const {default:paths}=await import('../math/audio-manifest.js');
 for(const input of audioInputs){const clip=manifest.clips[input.text];assert.equal(clip?.spoken,input.spoken,input.source);assert.equal(paths[input.spoken],'/math/'+clip.file);assert.match(clip.file,/^audio\/[a-f0-9]+\.mp3$/);if(decoded.has(clip.file))continue;const path=new URL('../math/'+clip.file,import.meta.url);const result=spawnSync('ffmpeg',['-v','error','-i',path.pathname,'-f','null','-'],{encoding:'utf8'});assert.equal(result.status,0,input.source+' '+result.stderr);decoded.add(clip.file);}assert.ok(decoded.size>=400);
});
