import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,statSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
const root=new URL('../',import.meta.url).pathname;
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)]);
test('bundled curriculum exactly preserves every source page and lesson without a network request',async()=>{
 const {createClient}=require('../miniprogram/lib/client.js');
 let requests=0;
 const client=createClient({request(){requests++;throw new Error('offline')},getStorageSync(){}});
 const base=join(root,'english/miniprogram-data');
 const files=walk(base).filter(p=>p.endsWith('.json'));
 assert.equal(files.length,127);
 for(const file of files)assert.deepEqual(await client.content(file.slice(base.length+1)),JSON.parse(readFileSync(file)),file);
 assert.equal(requests,0);
 const catalog=await client.content('catalog.json');catalog.units[0].zh='changed';
 assert.notEqual((await client.content('catalog.json')).units[0].zh,'changed');
});
test('unknown content keeps the network fallback and its real error',async()=>{
 const {createClient}=require('../miniprogram/lib/client.js');
 let request;
 const client=createClient({request(options){request=options;options.fail()},getStorageSync(){}});
 await assert.rejects(client.content('new-book.json'),/网络/);
 assert.ok(request.url.endsWith('/english/miniprogram-data/new-book.json'));
});
test('bundled media maps to real packaged files and stays within a conservative main package budget',()=>{
 const {assets}=require('../miniprogram/lib/bundled-content.js');
 const {absolute}=require('../miniprogram/lib/view.js');
 for(let unit=1;unit<=6;unit++)assert.equal(absolute('/english/illustrations/u'+unit+'.webp'),'/assets/units/u'+unit+'.webp');
 for(const [source,path] of Object.entries(assets)){
  assert.ok(source.startsWith('/english/'));
  assert.ok(statSync(join(root,'miniprogram',path)).size>0,path);
  assert.equal(absolute(source),path);
 }
 assert.ok(Object.keys(assets).filter(p=>p.includes('miniprogram-art')).length>=60);
 assert.ok(Object.keys(assets).filter(p=>p.includes('/audio/')).length>5);
 assert.equal(absolute('/english/not-bundled.mp3'),'https://games.nblord.com/english/not-bundled.mp3');
 const bytes=walk(join(root,'miniprogram')).reduce((n,p)=>n+statSync(p).size,0);
 assert.ok(bytes<1800000,'package grew beyond 1.8 MB: '+bytes);
});
