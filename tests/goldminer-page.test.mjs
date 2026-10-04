import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
test('gold miner serves the self-hosted Sites edition without external runtime assets',async()=>{
 const url=new URL('../games/goldminer.html',import.meta.url),html=await readFile(url,'utf8');
 const refs=[...html.matchAll(/(?:href|src)="([^"#]+)"/g)].map(m=>m[1]);
 const assets=refs.map(ref=>new URL(ref,url));
 assert.deepEqual(assets.map(asset=>asset.pathname.replace(new URL('../',import.meta.url).pathname,'')),['goldminer-sites/style.css','responsive.css','shared/game-activity.js','goldminer-sites/bundle.js']);
 for(const asset of assets){assert.equal(asset.protocol,'file:');assert.match(asset.searchParams.get('v'),/^\d{8}[a-z0-9-]+$/);}
 assert.ok(html.indexOf('../shared/game-activity.js')<html.indexOf('../goldminer-sites/bundle.js'),'activity client loads before gameplay');
 for(const ref of refs)await access(new URL(ref,url));
});
