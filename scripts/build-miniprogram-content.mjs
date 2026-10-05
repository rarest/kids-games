import { readFile, writeFile, mkdir, readdir, rm, copyFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { Resvg } from '@resvg/resvg-js';
import { BOOKS, WORDS } from '../english/curriculum.js';
import { COURSE, LESSONS } from '../english/course-curriculum.js';
import { buildSteps } from '../english/course-engine.js';
import { makePractice, pageTargets } from '../english/page-practice.js';
import { wordArt, courseArt } from '../english/course-art.js';

const sourceRoot = fileURLToPath(new URL('../', import.meta.url));
const book = BOOKS.find(item => item.id === COURSE.bookId);
const fontPath = join(sourceRoot, 'english/miniprogram-art/font/DejaVuSans.ttf');
const clone = value => JSON.parse(JSON.stringify(value));
const labelFor = svg => svg.match(/aria-label="([^"]+)"/)?.[1] ?? '';

/** Export remote resources. outputRoot has the same /english layout as the website. */
export async function buildMiniprogramContent({ outputRoot = sourceRoot } = {}) {
  outputRoot = resolve(outputRoot);
  const dataRoot = join(outputRoot, 'english/miniprogram-data');
  const artRoot = join(outputRoot, 'english/miniprogram-art');
  const manifest = JSON.parse(await readFile(join(sourceRoot, 'english/audio-manifest.json'), 'utf8'));
  const wordIds = Object.keys(WORDS);
  const imageDefinitions = new Map();
  const usedAudio = new Set();
  function artwork(svg) {
    if (!svg) return {};
    const hash = createHash('sha256').update(svg).digest('hex').slice(0, 24);
    const image = `/english/miniprogram-art/${hash}.png`;
    const imageAlt = labelFor(svg);
    if (!imageAlt) throw new Error(`Artwork has no accessible source label: ${hash}`);
    imageDefinitions.set(image, { svg, label: imageAlt });
    return { image, imageAlt };
  }
  function audioFor(target) {
    // A printed ellipsis is display text; it has neither speech nor a reference clip.
    if (!/[A-Za-z0-9]/.test(target.say ?? target.en)) return { speakable: false, audio: null };
    // Match AudioReader exactly: explicit vocabulary buttons are word-first;
    // sentence buttons are sentence-first, then exact/case-insensitive word lookup.
    const id = target.wordId && manifest[target.wordId] ? target.wordId
      : wordIds.find(id => WORDS[id].en === target.en)
        || wordIds.find(id => WORDS[id].en.toLowerCase() === target.en.toLowerCase());
    const file = target.wordId ? manifest[id] || manifest[`sentence:${target.en}`]
      : manifest[`sentence:${target.en}`] || manifest[id];
    if (!file || !/^[a-z0-9-]+\.mp3$/.test(file)) throw new Error(`Missing source audio for ${target.id}: ${target.en}`);
    usedAudio.add(file);
    return { speakable: true, audio: `/english/audio/${file}` };
  }
  const pages = book.textbookPages.map(original => {
    const page = clone(original);
    const unitId = book.units.find(unit => unit.textbookPages.some(item => item.page === page.page))?.id ?? null;
    const targets = pageTargets(original).map(target => ({ ...target, ...audioFor(target) }));
    const byId = new Map(targets.map(target => [target.id, target]));
    const attach = (item, targetId, art = {}) => {
      const target = byId.get(targetId);
      Object.assign(target, art);
      return { ...item, targetId, ...audioFor(target), ...art };
    };
    page.words = page.words.map((word, index) => attach(word, `p${page.page}-word-${index}`, artwork(wordArt(word))));
    page.blocks = page.blocks.map((block, b) => ({ ...block, lines: block.lines.map((line, i) => attach(line, `p${page.page}-line-${b}-${i}`)) }));
    // Preserve all source exercises except punctuation-only display text: there
    // is no sound to distinguish or record, and the webpage omits its read button.
    const questions = makePractice(original).filter(question => byId.get(question.targetId).speakable);
    return { ...page, unitId, targets, questions };
  });
  const allTargets = pages.flatMap(page => page.targets);

  function lessonResource(original) {
    const lesson = clone(original);
    const referenced = new Map();
    const local = original.pages.flatMap(page => allTargets.filter(target => target.page === page));
    function findSource(item, kind) {
      const candidates = local.filter(target => target.kind === kind && target.en === item.en && (!item.page || target.page === item.page));
      const target = candidates.find(target => (!item.id || target.wordId === item.id) && (!item.zh || target.zh === item.zh) && (!item.ipa || target.ipa === item.ipa))
        ?? candidates.find(target => !item.id || target.wordId === item.id);
      if (!target) throw new Error(`Missing printed ${kind} in ${lesson.id}: ${item.en}`);
      referenced.set(target.id, target);
      return target;
    }
    const media = target => ({ targetId: target.id, audio: target.audio, speakable: target.speakable, ...(target.image ? { image: target.image, imageAlt: target.imageAlt } : {}) });
    const enrich = (item, kind) => ({ ...item, ...media(findSource(item, kind)), ...(kind === 'word' ? artwork(wordArt(item)) : {}) });
    lesson.words = lesson.words.map(item => enrich(item, 'word'));
    lesson.phrases = lesson.phrases.map(item => enrich(item, 'sentence'));
    lesson.reading = lesson.reading.map(item => enrich(item, 'sentence'));
    if (lesson.letters) lesson.letters = lesson.letters.map(item => enrich(item, 'sentence'));
    lesson.steps = buildSteps(original).map(step => {
      const result = { ...step };
      if (step.word) result.word = enrich(step.word, 'word');
      if (step.phrase) result.phrase = enrich(step.phrase, 'sentence');
      if (step.lines) result.lines = step.lines.map(item => enrich(item, 'sentence'));
      if (step.letters) result.letters = step.letters.map(item => enrich(item, 'sentence'));
      let target;
      if (step.word) target = findSource(step.word, 'word');
      else if (step.phrase) target = findSource(step.phrase, 'sentence');
      else if (step.itemKey?.startsWith(`${lesson.id}:word:`)) {
        const word = original.words.find(item => step.itemKey === `${lesson.id}:word:${item.id}`);
        target = findSource(word, 'word');
      } else if (step.kind === 'sentence') {
        const phraseIndex = Number(step.itemKey.split(':').at(-1));
        target = findSource(original.phrases[phraseIndex], 'sentence');
      } else if (step.say) {
        // A check/oral example can quote a line or word outside the main lesson
        // lists, but it still must be an actual printed occurrence in its pages.
        target = local.find(item => item.en === step.say) ?? local.find(item => item.say === step.say);
        if (!target) throw new Error(`Missing spoken source for ${step.id}: ${step.say}`);
        referenced.set(target.id, target);
      }
      if (target) Object.assign(result, media(target), { en: target.en, zh: target.zh });
      return result;
    });
    return { ...lesson, ...artwork(courseArt(lesson.unitId, { story: lesson.type === 'story' })), targets: [...referenced.values()].map(clone) };
  }
  const lessons = LESSONS.map(lessonResource);
  const catalog = {
    schemaVersion: 1, bookId: book.id, title: book.title,
    units: COURSE.units.map(unit => ({
      id: unit.id, title: book.units.find(item => item.id === unit.id).title, zh: unit.title,
      lessons: unit.lessons.map(({ id, title, goal, pages, minutes }) => ({ id, title, goal, pages, minutes })),
    })),
    pages: pages.map(({ page, title, unitId }) => ({ page, title, unitId })),
  };

  // Validate every used source clip before replacing any generated resources.
  for (const file of usedAudio) if ((await stat(join(sourceRoot, 'english/audio', file))).size <= 512) throw new Error(`Invalid source audio: ${file}`);
  await readFile(fontPath);
  await rm(dataRoot, { recursive: true, force: true });
  await mkdir(join(dataRoot, 'pages'), { recursive: true });
  await mkdir(join(dataRoot, 'lessons'), { recursive: true });
  await mkdir(artRoot, { recursive: true });
  for (const entry of await readdir(artRoot)) if (/\.(png|json)$/.test(entry)) await rm(join(artRoot, entry));
  if (outputRoot !== sourceRoot) {
    await mkdir(join(artRoot, 'font'), { recursive: true });
    for (const name of ['DejaVuSans.ttf', 'LICENSE.txt']) await copyFile(join(sourceRoot, 'english/miniprogram-art/font', name), join(artRoot, 'font', name));
  }
  let dataBytes = 0, artBytes = 0;
  async function writeJSON(path, value) {
    const text = `${JSON.stringify(value)}\n`;
    await writeFile(path, text);
    return Buffer.byteLength(text);
  }
  dataBytes += await writeJSON(join(dataRoot, 'catalog.json'), catalog);
  for (const page of pages) dataBytes += await writeJSON(join(dataRoot, `pages/${page.page}.json`), page);
  for (const lesson of lessons) dataBytes += await writeJSON(join(dataRoot, `lessons/${lesson.id}.json`), lesson);
  const images = {};
  for (const [image, { svg, label }] of [...imageDefinitions].sort(([a], [b]) => a.localeCompare(b))) {
    const input = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replaceAll('font-family="sans-serif"', 'font-family="DejaVu Sans"');
    const bytes = new Resvg(input, { fitTo: { mode: 'zoom', value: 2 }, font: { fontFiles: [fontPath], loadSystemFonts: false, defaultFontFamily: 'DejaVu Sans' } }).render().asPng();
    await writeFile(join(outputRoot, image), bytes);
    artBytes += bytes.length;
    images[image] = { label, width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  artBytes += await writeJSON(join(artRoot, 'index.json'), { schemaVersion: 1, images });
  for (const name of ['DejaVuSans.ttf', 'LICENSE.txt']) artBytes += (await stat(join(artRoot, 'font', name))).size;
  return {
    pages: pages.length, lessons: lessons.length, targets: allTargets.length,
    words: allTargets.filter(target => target.kind === 'word').length,
    lines: allTargets.filter(target => target.kind === 'sentence').length,
    spokenTargets: allTargets.filter(target => target.speakable).length,
    questions: pages.reduce((sum, page) => sum + page.questions.length, 0),
    lessonSteps: lessons.reduce((sum, lesson) => sum + lesson.steps.length, 0),
    audioFiles: usedAudio.size, images: imageDefinitions.size,
    dataFiles: 1 + pages.length + lessons.length, dataBytes, artBytes,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--output-root')) throw new Error('Usage: node scripts/build-miniprogram-content.mjs [--output-root DIRECTORY]');
  console.log(JSON.stringify(await buildMiniprogramContent({ ...(args.length ? { outputRoot: args[1] } : {}) }), null, 2));
}
