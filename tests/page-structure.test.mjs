import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('maze page contains every screen, control, HUD and store hook', async () => {
  const html = await readFile(new URL('../games/maze.html', import.meta.url), 'utf8');
  const ids = [
    'homeScreen', 'shopScreen', 'mapScreen', 'gameScreen', 'resultScreen',
    'mazeCanvas', 'keyRack', 'gestureGuide', 'inventoryBar', 'startButton', 'shopButton',
    'backHomeButton', 'itemShopTab', 'skinShopTab', 'restartJourneyButton',
    'dynamiteButton', 'hookButton', 'accessibleDirections'
  ];
  for (const id of ids) assert.match(html, new RegExp(`id=["']${id}["']`), id);
  assert.doesNotMatch(html,/class=["']dpad["']/);
  assert.doesNotMatch(html,/data-direction=/);
  for(const direction of ['up','down','left','right'])assert.match(html,new RegExp(`data-access-direction=["']${direction}["']`));
  assert.match(html, /viewport-fit=cover/);
  assert.match(html, /maximum-scale=1/);
  assert.match(html, /user-scalable=no/);
  assert.match(html, /type="module"[^>]+main\.js/);
});

test('mobile layout defines safe areas and generous touch targets', async () => {
  const css = await readFile(new URL('../maze/game.css', import.meta.url), 'utf8');
  assert.match(css, /--touch-size:\s*56px/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /touch-action:\s*none/);
  assert.match(css, /overscroll-behavior:\s*none/);
  assert.match(css, /\.gesture-guide/);
  assert.match(css, /safe-area-inset-left/);
  assert.match(css, /safe-area-inset-right/);
  assert.match(css, /calc\(4px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(css, /\.visually-hidden/);
  assert.match(css, /@media\s*\(max-height:\s*700px\)/);
});
