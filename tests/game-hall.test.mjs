import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('game hall preserves existing games and appends merge 4096 as the seventh', async () => {
  const source = await readFile(new URL('../games.js', import.meta.url), 'utf8');
  const context = { window: {} }; vm.runInNewContext(source, context);
  assert.equal(context.window.GAMES.length, 7);
  for (const file of ['games/pinyin.html','games/snake.html','games/fish.html','games/fishing.html','games/goldminer.html']) {
    assert.ok(context.window.GAMES.some(game => game.file === file), file);
  }
  const goldMiner = context.window.GAMES.find(game => game.file === 'games/goldminer.html');
  assert.match(goldMiner.desc, /700/);
  assert.ok(goldMiner.tags.includes('手机'));
  const maze = context.window.GAMES.find(game => game.file === 'games/maze.html');
  assert.equal(maze.name, '皇冠迷宫');
  assert.ok(maze.tags.includes('迷宫'));
  const merge = context.window.GAMES.find(game => game.file === 'games/merge4096.html');
  assert.equal(merge.name, '合成4096');
  assert.ok(merge.tags.includes('合成'));
  await assert.doesNotReject(()=>readFile(new URL('../games/merge4096.html',import.meta.url),'utf8'));
});
