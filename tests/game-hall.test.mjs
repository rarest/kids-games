import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('game hall preserves existing games and includes the new space shooter', async () => {
  const index = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(index,/<script src="games\.js\?v=20261002b"><\/script>/);
  const source = await readFile(new URL('../games.js', import.meta.url), 'utf8');
  const context = { window: {} }; vm.runInNewContext(source, context);
  assert.equal(context.window.GAMES.length, 8);
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
