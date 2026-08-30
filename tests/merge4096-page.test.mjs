import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const pageUrl = new URL('../games/merge4096.html',import.meta.url);

test('page has the complete screens, controls and five empty columns', async () => {
  const html = await readFile(pageUrl,'utf8');
  for (const id of ['homeScreen','gameScreen','resultScreen','startButton','drawButton','drawCount','pendingCard','columns','bombButton','candleButton','musicButton','exitButton','shopBomb','shopCandle','bestValue','lastResult','winCount','coinCount','comboBanner','fireworks']) assert.match(html,new RegExp(`id="${id}"`));
  assert.equal((html.match(/class="pile-button"/g)||[]).length,5);
  assert.match(html,/id="drawCount">0<\/span>\s*\/\s*10000/);
  assert.doesNotMatch(html,/再抽.*幸运牌|距离.*幸运牌/);
  assert.match(html,/50金币/);
  assert.match(html,/60金币/);
  assert.match(html,/type="module" src="\.\.\/merge4096\/app\.js"/);
});

test('styles preserve top-down piles and reduced-motion support', async () => {
  const css = await readFile(new URL('../merge4096/styles.css',import.meta.url),'utf8');
  assert.match(css,/\.pile\s*\{[^}]*flex-direction:\s*column/s);
  assert.match(css,/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});
