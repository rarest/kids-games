import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, mkdtemp, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const probeDuration = path => {
  const result=spawnSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',path],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  return Number(result.stdout.trim());
};

test('ships a long royal loop in streaming and mobile Safari compatible formats', async () => {
  const webm=new URL('../maze/audio/royal-garden.webm',import.meta.url);
  const m4a=new URL('../maze/audio/royal-garden.m4a',import.meta.url);
  await access(m4a);
  assert.ok((await readFile(webm)).length>100_000);
  assert.ok((await readFile(m4a)).length>100_000);
  for(const path of [webm,m4a]){
    const duration=probeDuration(path);
    assert.ok(duration>=71.5&&duration<=72.5,`${path.pathname}: ${duration}`);
  }
});

test('generated loop has audible edges and three measurably different sections', async () => {
  const directory=await mkdtemp(join(tmpdir(),'crown-music-'));
  const wav=join(directory,'royal-garden.wav');
  try{
    const generated=spawnSync(process.execPath,['scripts/generate-royal-garden-bgm.mjs',wav],{encoding:'utf8'});
    assert.equal(generated.status,0,generated.stderr);
    const bytes=await readFile(wav),rate=bytes.readUInt32LE(24),channels=bytes.readUInt16LE(22),bits=bytes.readUInt16LE(34),dataBytes=bytes.readUInt32LE(40);
    assert.equal(rate,48_000);assert.equal(channels,2);assert.equal(bits,16);
    const frames=dataBytes/(channels*bits/8),duration=frames/rate;
    assert.ok(duration>=71.5&&duration<=72.5,`duration=${duration}`);
    const rms=(start,length)=>{
      let sum=0,count=0;const from=Math.floor(start*rate),to=Math.min(frames,Math.floor((start+length)*rate));
      for(let frame=from;frame<to;frame+=8){const sample=bytes.readInt16LE(44+frame*4)/32768;sum+=sample*sample;count++}
      return Math.sqrt(sum/count);
    };
    const edge=[rms(0,.2),rms(duration-.2,.2)];
    assert.ok(edge.every(value=>value>.004),`audible edges=${edge.join(',')}`);
    assert.ok(Math.max(...edge)/Math.min(...edge)<2.5,`balanced seam=${edge.join(',')}`);
    const sections=[rms(8,8),rms(32,8),rms(56,8)];
    assert.ok(Math.max(...sections)-Math.min(...sections)>.004,`sections=${sections.join(',')}`);
  }finally{await rm(directory,{recursive:true,force:true})}
});
