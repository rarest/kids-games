import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

test('gold miner page ships the responsive 700-hook module bundle', async () => {
  const pageUrl = new URL('../games/goldminer.html', import.meta.url);
  const html = await readFile(pageUrl, 'utf8');
  const refs = [...html.matchAll(/(?:href|src)="([^"#]+)"/g)].map(match => match[1]);

  assert.match(html, /一次发射 700 个钩爪/);
  assert.deepEqual(refs, [
    '../goldminer/game.css?v=700-20260829',
    '../goldminer/game.js?v=respawn-20260829'
  ]);
  for (const ref of refs) await access(new URL(ref, pageUrl));

  const game = await readFile(new URL('../goldminer/game.js', import.meta.url), 'utf8');
  assert.match(game, /createHookVolley\(\{count:700/);
  assert.match(game, /shouldRefreshMine/);
  assert.match(game, /visibilitychange/);
  assert.match(game, /state\.items\.length\?state\.items:undefined/);
  await access(new URL('../goldminer/game-core.js', import.meta.url));
});
