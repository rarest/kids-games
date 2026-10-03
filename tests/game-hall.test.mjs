import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('game hall loads a versioned local catalog and preserves all thirteen games including paper territory', async () => {
  const index = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const catalogReferences=[...index.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>\s*<\/script>/gi)].map(match=>new URL(match[1],'https://games.test/index.html')).filter(url=>url.pathname==='/games.js');
  assert.equal(catalogReferences.length,1,'exactly one game catalog is loaded');
  const catalog=catalogReferences[0];assert.equal(catalog.origin,'https://games.test','the catalog is served locally');
  assert.match(catalog.searchParams.get('v')||'',/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/,'a nonempty cache version is present');
  const source = await readFile(new URL(`..${catalog.pathname}`, import.meta.url), 'utf8');
  const context = { window: {} }; vm.runInNewContext(source, context);
  assert.equal(context.window.GAMES.length, 13);
  assert.equal(new Set(context.window.GAMES.map(game=>game.file)).size,13,'all thirteen entries are unique');
  const english=context.window.GAMES.find(game=>game.file==='games/english.html');
  assert.equal(english?.name,'珠珠学习乐园');assert.ok(english.tags.includes('英语'));
  await assert.doesNotReject(()=>readFile(new URL('../games/english.html',import.meta.url),'utf8'));
  const territory=context.window.GAMES.find(game=>game.file==='games/territory.html');
  assert.equal(territory?.name,'纸片领地');assert.ok(territory.tags.includes('圈地'));
  const territoryPage=await readFile(new URL(`../${territory.file}`,import.meta.url),'utf8');
  assert.match(territoryPage,/<title>纸片领地/);assert.match(territoryPage,/<script type="module" src="\.\.\/territory\/game\.js\?v=[^"]+"><\/script>/);
  const shooter = context.window.GAMES.find(game => game.file === 'games/shooter.html');
  assert.equal(shooter.name, '星际小队');
  assert.ok(shooter.tags.includes('射击'));
  for (const file of ['games/pinyin.html','games/snake.html','games/fish.html','games/fishing.html','games/goldminer.html']) {
    assert.ok(context.window.GAMES.some(game => game.file === file), file);
  }
  const goldMiner = context.window.GAMES.find(game => game.file === 'games/goldminer.html');
  assert.match(goldMiner.desc, /几块矿物就发几钩/);
  assert.ok(goldMiner.tags.includes('手机'));
  const maze = context.window.GAMES.find(game => game.file === 'games/maze.html');
  assert.equal(maze.name, '皇冠迷宫');
  assert.ok(maze.tags.includes('迷宫'));
  const merge = context.window.GAMES.find(game => game.file === 'games/merge4096.html');
  assert.equal(merge.name, '合成4096');
  assert.ok(merge.tags.includes('合成'));
  await assert.doesNotReject(()=>readFile(new URL('../games/merge4096.html',import.meta.url),'utf8'));
});
