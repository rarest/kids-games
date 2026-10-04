import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
test('memory assets are local, licensed and included in the browser release gate', async () => {
  const page = await readFile(new URL('../games/memory.html', import.meta.url), 'utf8');
  for (const asset of [...page.matchAll(/(?:src|href)="(\.\.\/memory\/[^"?]+)\?v=([^"]+)"/g)]) {
    assert.match(asset[2], /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/, 'each local asset has a valid cache version'); await access(new URL(`../games/${asset[1]}`, import.meta.url));
  }
  assert.match(page, /memory\/bundle\.js/); assert.doesNotMatch(page, /https?:\/\//);
  const license = await readFile(new URL('../memory/THIRD-PARTY-NOTICES.txt', import.meta.url), 'utf8');
  assert.match(license, /MIT License/); assert.match(license, /Three\.js 0\.186\.1/);
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.match(pkg.scripts['posttest:browser'], /memory-browser\.mjs/);
});
