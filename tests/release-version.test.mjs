import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const RELEASE='20260829f';

test('public HTML and the complete ES module graph share the new cache version',async()=>{
  const html=await readFile(new URL('../games/maze.html',import.meta.url),'utf8');
  assert.match(html,new RegExp(`game\\.css\\?v=${RELEASE}`));
  assert.match(html,new RegExp(`main\\.js\\?v=${RELEASE}`));
  const visited=new Set();
  const visit=async file=>{
    if(visited.has(file))return;
    visited.add(file);
    const source=await readFile(new URL(`../maze/${file}`,import.meta.url),'utf8');
    const specifiers=[...source.matchAll(/from\s+['"](\.\/[^'"]+)['"]/g)].map(match=>match[1]);
    for(const specifier of specifiers){
      assert.ok(specifier.endsWith(`?v=${RELEASE}`),`${file}: ${specifier}`);
      await visit(specifier.slice(2).split('?')[0]);
    }
  };
  await visit('main.js');
  assert.ok(visited.has('generated-levels.js'),'levels must version the checked-in layout module');
});
