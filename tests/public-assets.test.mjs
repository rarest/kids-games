import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { SOUND_DEFINITIONS } from '../maze/audio.js';
import { gameEventSounds } from '../maze/sound-events.js';

test('main controller imports every rule module and binds the complete event flow', async () => {
  const main = await readFile(new URL('../maze/main.js', import.meta.url), 'utf8');
  for (const module of ['./levels.js','./engine.js','./economy.js','./save.js','./render.js','./audio.js','./sound-events.js','./joystick-controls.js']) {
    assert.ok(main.includes(module), module);
  }
  for (const event of ['step','bump','key','coin','door-locked','complete','dynamite','hook']) {
    for(const sound of gameEventSounds({type:event}))assert.ok(SOUND_DEFINITIONS[sound],`${event}:${sound}`);
  }
  assert.match(main, /pointerdown/);
  assert.match(main, /gesturestart/);
  assert.match(main, /data-access-direction/);
  assert.match(main, /document\.addEventListener\(['"]pointerup['"]/);
  assert.match(main, /window\.addEventListener\(['"]blur['"]/);
  assert.match(main, /dataset\.screen/);
  assert.match(main, /dataset\.stage/);
});

test('the default release gate includes unit and both browser suites',async()=>{
  const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
  assert.match(pkg.scripts.test,/test:unit/);
  assert.match(pkg.scripts.test,/test:browser/);
  assert.match(pkg.scripts['test:browser'],/browser-smoke\.mjs/);
  assert.match(pkg.scripts['test:browser'],/theme-browser-smoke\.mjs/);
});

test('all HTML-linked public assets exist', async () => {
  const paths = ['../maze/game.css','../maze/main.js','../maze/joystick-controls.js','../maze/frame-scheduler.js','../maze/levels.js','../maze/engine.js','../maze/economy.js','../maze/save.js','../maze/render.js','../maze/audio.js','../maze/audio/royal-garden.webm','../maze/audio/royal-garden.m4a'];
  for (const path of paths) await access(new URL(path, import.meta.url));
  for(const definition of Object.values(SOUND_DEFINITIONS))for(const file of definition.files)await access(new URL(`../maze/audio/${file}`,import.meta.url));
});
