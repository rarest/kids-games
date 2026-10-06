// Read-only inventory. No cloud login, upload, bundle generation, or source edits.
import {readdir, readFile, stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const contentRoot = path.join(root, 'english/miniprogram-data');
const media = new Map();
const documents = [];
const content = new Map();

function addMedia(source, use) {
  if (!media.has(source)) media.set(source, new Map());
  media.get(source).set(JSON.stringify(use), use);
}
function inspect(value, document, pointer = '') {
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      const token = key.replace(/~/g, '~0').replace(/\//g, '~1');
      inspect(child, document, pointer + '/' + token);
    }
  } else if (typeof value === 'string' && value.startsWith('/english/')) {
    addMedia(value, {kind: 'json', document, pointer});
  }
}
async function scan(directory) {
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) await scan(target);
    else if (entry.isFile() && entry.name.endsWith('.json')) {
      const bytes = await readFile(target);
      const document = '/' + path.relative(root, target);
      const value = JSON.parse(bytes.toString('utf8'));
      content.set(document, value);
      inspect(value, document);
      documents.push({path: document, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex')});
    }
  }
}
await scan(contentRoot);
// lesson.js derives non-story scene images at runtime; they are absent from JSON.
const catalog = content.get('/english/miniprogram-data/catalog.json');
for (const unit of catalog.units) {
  const unitNumber = unit.id?.match(/-u([1-6])$/)?.[1];
  for (const lessonRef of unit.lessons) {
    const document = '/english/miniprogram-data/lessons/' + lessonRef.id + '.json';
    const lesson = content.get(document);
    if (!lesson) throw new Error('Catalog lesson is missing: ' + lessonRef.id);
    if (lesson.unitId !== unit.id) throw new Error('Catalog and lesson unit disagree: ' + lessonRef.id);
    if (lesson.type !== 'story' && unitNumber) {
      addMedia('/english/illustrations/u' + unitNumber + '.webp', {
        kind: 'dynamic', consumer: 'miniprogram/pages/lesson/lesson.js',
        usage: 'lesson-scene', unitId: unit.id, lessonId: lesson.id,
      });
    }
  }
}
const assets = [];
for (const source of [...media.keys()].sort()) {
  const target = path.resolve(root, source.slice(1));
  if (!target.startsWith(root + path.sep)) throw new Error('Asset path escapes repository');
  if (!(await stat(target)).isFile()) throw new Error('Asset is not a regular file');
  const bytes = await readFile(target);
  assets.push({sourcePath: source, cloudPath: source.slice(1), bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), uses: [...media.get(source).values()]});
}
documents.sort((a,b) => a.path.localeCompare(b.path));
process.stdout.write(JSON.stringify({status: 'inventory_only_not_uploaded', documentCount: documents.length, assetCount: assets.length, assetBytes: assets.reduce((n,a) => n+a.bytes, 0), documents, assets}, null, 2) + '\n');
