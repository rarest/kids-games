import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('game hall preserves five existing games and appends crown maze as the sixth', async () => {
  const source = await readFile(new URL('../games.js', import.meta.url), 'utf8');
  const context = { window: {} }; vm.runInNewContext(source, context);
  assert.equal(context.window.GAMES.length, 6);
  for (const file of ['games/pinyin.html','games/snake.html','games/fish.html','games/fishing.html','games/goldminer.html']) {
    assert.ok(context.window.GAMES.some(game => game.file === file), file);
  }
  const maze = context.window.GAMES.find(game => game.file === 'games/maze.html');
  assert.equal(maze.name, '皇冠迷宫');
  assert.ok(maze.tags.includes('迷宫'));
});
