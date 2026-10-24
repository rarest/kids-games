import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';

test('butterfly import freezes source hashes and configures public standalone without changing source',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'butterfly-build-'));
 try{
  const source=join(dir,'source'),dest=join(dir,'dest');await mkdir(source);await mkdir(dest);
  const html='<!doctype html><title>蜜语花园 · 本地试玩</title><body><script>globalThis.GardenNetwork={path:globalThis.GARDEN_WS_PATH||"/ws"};</script><a href="/">回到小火箭游戏厅</a></body>';
  await writeFile(join(source,'index.html'),html);await writeFile(join(source,'rules.js'),'module.exports={create(){return 1}};');await writeFile(join(source,'server.cjs'),"module.exports=require('./rules.js');");
  await writeFile(join(source,'checkpoint.js'),'module.exports={version:1};');
  await writeFile(join(source,'app.test.cjs'),'private test');await mkdir(join(source,'vendor'));await writeFile(join(source,'vendor/secret'),'private vendor');
  execFileSync(process.execPath,[new URL('../scripts/import-butterfly.mjs',import.meta.url).pathname,source,dest]);
  const page=await readFile(join(dest,'games/butterfly.html'),'utf8');assert.match(page,/GARDEN_WS_PATH='\/butterfly-ws'/);assert.ok(page.indexOf('GARDEN_WS_PATH=')<page.indexOf('globalThis.GardenNetwork'));assert.doesNotMatch(page,/本地试玩/);
  assert.equal(await readFile(join(source,'index.html'),'utf8'),html);
  const manifest=JSON.parse(await readFile(join(dest,'butterfly/source-manifest.json'),'utf8'));assert.equal(manifest.files.length,4);for(const f of manifest.files)assert.match(f.sha256,/^[a-f0-9]{64}$/);
  assert.equal(JSON.parse(await readFile(join(dest,'butterfly/package.json'),'utf8')).type,'commonjs');
  const out=execFileSync(process.execPath,['-e',`console.log(require(${JSON.stringify(join(dest,'butterfly/server.cjs'))}).create())`],{encoding:'utf8'});assert.equal(out.trim(),'1');
  await assert.rejects(readFile(join(dest,'butterfly/app.test.cjs')));await assert.rejects(readFile(join(dest,'butterfly/vendor/secret')));
 }finally{await rm(dir,{recursive:true,force:true});}
});
