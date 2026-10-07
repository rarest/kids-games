import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('game hall has one unified learning entrance and preserves other games and legacy English URL', async () => {
  const index = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const catalogReferences=[...index.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>\s*<\/script>/gi)].map(match=>new URL(match[1],'https://games.test/index.html')).filter(url=>url.pathname==='/games.js');
  assert.equal(catalogReferences.length,1,'exactly one game catalog is loaded');
  const catalog=catalogReferences[0];assert.equal(catalog.origin,'https://games.test','the catalog is served locally');
  assert.match(catalog.searchParams.get('v')||'',/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/,'a nonempty cache version is present');
  const source = await readFile(new URL(`..${catalog.pathname}`, import.meta.url), 'utf8');
  const context = { window: {} }; vm.runInNewContext(source, context);
  assert.equal(context.window.GAMES.length, 14);
  assert.equal(new Set(context.window.GAMES.map(game=>game.file)).size,14,'all entries are unique');
  assert.deepEqual(Array.from(context.window.GAMES,game=>game.id).sort(),['classroom','fish','fishing','goldminer','maze','memory','merge4096','parkour','pinyin','racing','rescue','shooter','snake','territory']);
  const classroom=context.window.GAMES.find(game=>game.id==='classroom');
  assert.equal(new URL(classroom.file,'https://games.test').pathname,'/games/classroom.html');
  assert.equal(classroom.name,'珠珠课堂');
  await assert.doesNotReject(()=>readFile(new URL('../games/classroom.html',import.meta.url),'utf8'));
  assert.equal(context.window.GAMES.find(game=>game.file==='games/memory.html')?.name,'记忆花园');
  const english=context.window.GAMES.find(game=>new URL(game.file,'https://games.test').pathname==='/games/english.html');
  assert.equal(english,undefined,'English is a subject of the unified classroom, not a second catalog entry');assert.ok(classroom.tags.includes('英语'));
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
