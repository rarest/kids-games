import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { BOOKS, WORDS } from '../english/curriculum.js';
import { COURSE, LESSONS } from '../english/course-curriculum.js';
import { buildSteps } from '../english/course-engine.js';
import { makePractice, pageTargets } from '../english/page-practice.js';
import { wordArt, courseArt } from '../english/course-art.js';

const builder = new URL('../scripts/build-miniprogram-content.mjs', import.meta.url);
const book = BOOKS.find(item => item.id === 'g3-upper');
const sourceTargets = book.textbookPages.flatMap(pageTargets);
const sourceById = new Map(sourceTargets.map(target => [target.id, target]));
const json = async path => JSON.parse(await readFile(path, 'utf8'));
function preservesSource(source, output, label) {
  if (Array.isArray(source)) {
    assert.equal(output.length, source.length, label);
    source.forEach((item, index) => preservesSource(item, output[index], `${label}[${index}]`));
  } else if (source && typeof source === 'object') {
    for (const [key, value] of Object.entries(source)) preservesSource(value, output[key], `${label}.${key}`);
  } else assert.deepEqual(output, source, label);
}
async function snapshot(directory, prefix = '') {
  const result = {};
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const name = `${prefix}${entry.name}`;
    if (entry.isDirectory()) Object.assign(result, await snapshot(join(directory, entry.name), `${name}/`));
    else result[name] = createHash('sha256').update(await readFile(join(directory, entry.name))).digest('hex');
  }
  return result;
}

test('exported native content preserves every source occurrence, exercise and actual media reference', async t => {
  assert.ok(existsSync(builder), 'course exporter must exist before native content can be generated');
  const { buildMiniprogramContent } = await import(builder.href);
  const outputRoot = await mkdtemp(join(tmpdir(), 'mini-content-'));
  t.after(() => rm(outputRoot, { recursive: true, force: true }));
  const result = await buildMiniprogramContent({ outputRoot });
  const dataRoot = join(outputRoot, 'english/miniprogram-data');
  const catalog = await json(join(dataRoot, 'catalog.json'));
  const pages = await Promise.all(catalog.pages.map(item => json(join(dataRoot, `pages/${item.page}.json`))));
  const lessons = await Promise.all(LESSONS.map(item => json(join(dataRoot, `lessons/${item.id}.json`))));
  const manifest = await json(new URL('../english/audio-manifest.json', import.meta.url));

  await t.test('catalog covers the photographed 90 pages and 36 guided lessons', () => {
    assert.equal(catalog.schemaVersion, 1);
    assert.equal(catalog.bookId, 'g3-upper');
    assert.equal(catalog.pages.length, 90);
    assert.deepEqual(catalog.pages.map(item => item.page), book.textbookPages.map(item => item.page));
    assert.deepEqual(catalog.units.flatMap(item => item.lessons.map(lesson => lesson.id)), LESSONS.map(item => item.id));
    assert.equal(catalog.units.length, 6);
    for (const unit of COURSE.units) for (const lesson of unit.lessons) preservesSource({ id: lesson.id, title: lesson.title, goal: lesson.goal, pages: lesson.pages, minutes: lesson.minutes }, catalog.units.find(item => item.id === unit.id).lessons.find(item => item.id === lesson.id), lesson.id);
    assert.equal(result.targets, 4889);
    assert.equal(result.spokenTargets, 4888);
  });

  await t.test('page text, occurrence IDs and questions retain exact source fidelity', () => {
    for (const [index, page] of pages.entries()) {
      const original = book.textbookPages[index];
      preservesSource(original, page, `p${page.page}`);
      assert.equal(page.targets.length, pageTargets(original).length);
      for (const target of page.targets) preservesSource(sourceById.get(target.id), target, target.id);
      assert.deepEqual(page.questions, makePractice(original).filter(item => item.targetId !== 'p57-line-2-3'));
      original.words.forEach((_, i) => assert.equal(page.words[i].targetId, `p${page.page}-word-${i}`));
      original.blocks.forEach((block, b) => block.lines.forEach((_, i) => assert.equal(page.blocks[b].lines[i].targetId, `p${page.page}-line-${b}-${i}`)));
      for (const item of [...page.words, ...page.blocks.flatMap(block => block.lines)]) {
        const target = page.targets.find(target => target.id === item.targetId);
        assert.equal(item.audio, target.audio, item.targetId);
        assert.equal(item.image, target.image, item.targetId);
        assert.equal(item.speakable, target.speakable, item.targetId);
      }
    }
  });

  await t.test('every spoken occurrence selects the same actual clip as AudioReader and preserves say overrides', async () => {
    const files = new Set();
    for (const target of pages.flatMap(page => page.targets)) {
      if (target.id === 'p57-line-2-3') {
        assert.equal(target.en, '...');
        assert.equal(target.speakable, false);
        assert.equal(target.audio, null);
        continue;
      }
      const original = sourceById.get(target.id);
      // Derive independently from the webpage's documented sentence-first / explicit-word-first contract.
      const wordId = original.wordId && manifest[original.wordId] ? original.wordId : Object.keys(WORDS).find(id => WORDS[id].en === original.en) || Object.keys(WORDS).find(id => WORDS[id].en.toLowerCase() === original.en.toLowerCase());
      const file = original.wordId ? manifest[wordId] || manifest[`sentence:${original.en}`] : manifest[`sentence:${original.en}`] || manifest[wordId];
      assert.ok(file, target.id);
      assert.equal(target.audio, `/english/audio/${file}`, target.id);
      assert.equal(target.say, original.say, target.id);
      assert.equal(target.speakable, true);
      if (original.say) {
        // Existing generator encodes the authoritative spoken override in the
        // filename. Catch a valid but wrongly spoken fallback clip too.
        const spokenHash = createHash('sha256').update(original.say).digest('hex').slice(0, 12);
        assert.ok(file.endsWith(`-${spokenHash}.mp3`), `${target.id} must play its say override: ${original.say}`);
      }
      files.add(file);
    }
    for (const file of files) assert.ok((await readFile(new URL(`../english/audio/${file}`, import.meta.url))).length > 512, file);
    const qu = pages.find(page => page.page === 54).targets.find(target => target.en === 'qu');
    assert.equal(qu.say, 'quiet');
    assert.equal(qu.audio, `/english/audio/${manifest['photo-qu']}`);
  });

  await t.test('lesson definitions and deterministic teaching steps retain all words, checks and reading lines', () => {
    for (const [index, lesson] of lessons.entries()) {
      const original = LESSONS[index];
      preservesSource(original, lesson, lesson.id);
      preservesSource(buildSteps(original), lesson.steps, `${lesson.id}.steps`);
      for (const group of ['words', 'phrases', 'reading', 'letters']) for (const item of lesson[group] ?? []) {
        assert.ok(sourceById.has(item.targetId), `${lesson.id}.${group}:${item.en}`);
        assert.equal(item.audio, lesson.targets.find(target => target.id === item.targetId).audio);
      }
      for (const step of lesson.steps) {
        if (step.say) {
          assert.ok(step.targetId, `${step.id}:${step.say}`);
          assert.equal(step.audio, lesson.targets.find(target => target.id === step.targetId).audio, step.id);
        }
        for (const line of step.lines ?? []) assert.ok(line.targetId && line.audio, `${step.id}:${line.en}`);
      }
      for (const target of lesson.targets) {
        preservesSource(sourceById.get(target.id), target, `${lesson.id}:${target.id}`);
        assert.equal(target.audio, pages.find(page => page.page === target.page).targets.find(item => item.id === target.id).audio);
      }
    }
  });

  await t.test('PNG illustrations preserve existing artwork labels and do not invent abstract icons', async () => {
    const art = await json(join(outputRoot, 'english/miniprogram-art/index.json'));
    const allImages = new Set();
    for (const page of pages) for (const word of page.words) {
      const svg = wordArt(word);
      if (!svg) assert.equal(word.image, undefined, `${word.en} must have no invented icon`);
      else {
        assert.equal(word.imageAlt, svg.match(/aria-label="([^"]+)"/)[1]);
        allImages.add(word.image);
      }
    }
    for (const lesson of lessons) {
      assert.equal(lesson.imageAlt, courseArt(lesson.unitId, { story: lesson.type === 'story' }).match(/aria-label="([^"]+)"/)[1]);
      allImages.add(lesson.image);
    }
    for (const path of allImages) {
      assert.match(path, /^\/english\/miniprogram-art\/[a-f0-9]+\.png$/);
      const bytes = await readFile(join(outputRoot, path));
      assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
      assert.ok(art.images[path].label);
      assert.ok(bytes.length > 150);
    }
    const orangeWords = pages.flatMap(page => page.words).filter(word => ['orange', 'oranges'].includes(word.en));
    assert.ok(orangeWords.some(word => word.imageAlt.includes('橙色')));
    assert.ok(orangeWords.some(word => word.imageAlt.includes('橙子')));
    assert.ok(pages.flatMap(page => page.words).some(word => word.en === 'our' && !word.image));
  });

  await t.test('same source build produces identical bytes without timestamps or stale files', async () => {
    const first = await snapshot(outputRoot);
    await writeFile(join(dataRoot, 'pages/obsolete.json'), '{}');
    await writeFile(join(outputRoot, 'english/miniprogram-art/obsolete.png'), 'obsolete');
    await buildMiniprogramContent({ outputRoot });
    assert.deepEqual(await snapshot(outputRoot), first);
  });
});
