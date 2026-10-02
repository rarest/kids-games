import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
test('gold miner serves the self-hosted Sites edition without external runtime assets',async()=>{
 const url=new URL('../games/goldminer.html',import.meta.url),html=await readFile(url,'utf8');
 const refs=[...html.matchAll(/(?:href|src)="([^"#]+)"/g)].map(m=>m[1]);
 assert.deepEqual(refs,['../goldminer-sites/style.css?v=20261002a','../responsive.css?v=20261002a','../goldminer-sites/bundle.js?v=20261002a']);
 for(const ref of refs)await access(new URL(ref,url));
});
