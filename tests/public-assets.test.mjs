import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { SOUND_DEFINITIONS } from '../maze/audio.js';
import { gameEventSounds } from '../maze/sound-events.js';

test('main controller imports every rule module and binds the complete event flow', async () => {
  const main = await readFile(new URL('../maze/main.js', import.meta.url), 'utf8');
  for (const module of ['./levels.js','./engine.js','./economy.js','./save.js','./render.js','./audio.js','./sound-events.js']) {
    assert.ok(main.includes(module), module);
  }
  for (const event of ['step','bump','key','coin','door-locked','complete','dynamite','hook']) {
    for(const sound of gameEventSounds({type:event}))assert.ok(SOUND_DEFINITIONS[sound],`${event}:${sound}`);
  }
  assert.match(main, /pointerdown/);
  assert.match(main, /setInterval/);
  assert.match(main, /dataset\.screen/);
  assert.match(main, /dataset\.stage/);
});

test('all HTML-linked public assets exist', async () => {
  const paths = ['../maze/game.css','../maze/main.js','../maze/levels.js','../maze/engine.js','../maze/economy.js','../maze/save.js','../maze/render.js','../maze/audio.js'];
  for (const path of paths) await access(new URL(path, import.meta.url));
});
