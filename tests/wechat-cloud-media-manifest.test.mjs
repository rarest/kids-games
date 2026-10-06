import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, statSync, mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import path from 'node:path';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const catalog = JSON.parse(readFileSync(new URL('english/miniprogram-data/catalog.json', root)));
const manifest = JSON.parse(execFileSync(process.execPath, [new URL('deploy/wechat-cloud/media-manifest.mjs', root).pathname], {maxBuffer: 16*1024*1024}));

async function nativeLesson(id) {
  const file = new URL('miniprogram/pages/lesson/lesson.js', root);
  const client = {
    identity: 'guest', profile: null,
    content: async path => JSON.parse(readFileSync(new URL('english/miniprogram-data/'+path, root))),
    progress: () => ({version:1, lessons:{}, items:{}, session:null}),
    saveProgress() {}, flush: async () => {},
  };
  let page;
  vm.runInNewContext(readFileSync(file, 'utf8'), {
    require: createRequire(file), wx:{}, getApp:()=>({client}), console,
    Page: definition => {page=definition; page.setData=patch=>Object.assign(page.data,patch);},
  });
  page.onLoad({id});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(page.data.loading, false, page.data.error);
  return {lesson:page.lesson, image:new URL(page.data.lesson.imageURL).pathname};
}

// Removing dynamically derived scene resources must break this native-client comparison.
test('media inventory covers images selected by real story and non-story lesson pages', async()=>{
  const assets = new Map(manifest.assets.map(asset=>[asset.sourcePath, asset]));
  let stories=0, scenes=0;
  for (const unit of catalog.units) for (const lessonRef of unit.lessons) {
    const {lesson, image} = await nativeLesson(lessonRef.id);
    assert.ok(assets.has(image), 'native lesson '+lesson.id+' image missing: '+image);
    assert.ok(statSync(new URL(image.slice(1), root)).isFile(), image);
    if (lesson.type==='story') stories++; else scenes++;
  }
  assert.ok(stories>0 && scenes>0, 'exercise both image selection branches');
});

// Losing provenance or emitting duplicate uploads must break the deployment inventory.
test('inventory deduplicates existing media and records dynamic or JSON consumers', async()=>{
  assert.equal(new Set(manifest.assets.map(asset=>asset.sourcePath)).size, manifest.assetCount);
  let bytes=0;
  for (const asset of manifest.assets) {
    assert.equal(statSync(new URL(asset.sourcePath.slice(1), root)).size, asset.bytes);
    assert.ok(Array.isArray(asset.uses) && asset.uses.length>0, asset.sourcePath+' has no consumers');
    bytes+=asset.bytes;
  }
  assert.equal(bytes, manifest.assetBytes);
  for (const unit of catalog.units) for (const lessonRef of unit.lessons) {
    const {lesson,image}=await nativeLesson(lessonRef.id);
    const asset=manifest.assets.find(asset=>asset.sourcePath===image);
    if (lesson.type==='story') assert.ok(asset.uses.some(use=>use.kind==='json' && use.document==='/english/miniprogram-data/lessons/'+lesson.id+'.json'), lesson.id);
    else assert.ok(asset.uses.some(use=>use.kind==='dynamic' && use.unitId===unit.id && use.lessonId===lesson.id && use.usage==='lesson-scene'), lesson.id);
  }
});

// Fixed six-image loops and index-based unit numbering must fail on sparse catalogs.
test('sparse catalog derives its actual unit scene and retains story JSON image only', ()=>{
  const fixture=mkdtempSync(path.join(tmpdir(),'wechat-media-manifest-'));
  try {
    mkdirSync(path.join(fixture,'deploy/wechat-cloud'),{recursive:true});
    mkdirSync(path.join(fixture,'english/miniprogram-data/lessons'),{recursive:true});
    copyFileSync(new URL('deploy/wechat-cloud/media-manifest.mjs',root),path.join(fixture,'deploy/wechat-cloud/media-manifest.mjs'));
    const ids=['g3-upper-u5-l1','g3-upper-u2-l6'];
    const lessons=ids.map(id=>{
      const actual=JSON.parse(readFileSync(new URL('english/miniprogram-data/lessons/'+id+'.json',root)));
      return {id:actual.id,unitId:actual.unitId,type:actual.type,image:actual.image};
    });
    const fixtureCatalog={units:lessons.map(lesson=>({id:lesson.unitId,lessons:[{id:lesson.id}]}))};
    writeFileSync(path.join(fixture,'english/miniprogram-data/catalog.json'),JSON.stringify(fixtureCatalog));
    for (const lesson of lessons) writeFileSync(path.join(fixture,'english/miniprogram-data/lessons/'+lesson.id+'.json'),JSON.stringify(lesson));
    const paths=new Set([...lessons.map(lesson=>lesson.image),'/english/illustrations/u5.webp']);
    for (const source of paths) {
      const destination=path.join(fixture,source.slice(1));
      mkdirSync(path.dirname(destination),{recursive:true});
      copyFileSync(new URL(source.slice(1),root),destination);
    }
    const sparse=JSON.parse(execFileSync(process.execPath,[path.join(fixture,'deploy/wechat-cloud/media-manifest.mjs')]));
    assert.deepEqual(sparse.assets.filter(asset=>asset.uses.some(use=>use.kind==='dynamic')).map(asset=>asset.sourcePath),['/english/illustrations/u5.webp']);
    assert.ok(sparse.assets.some(asset=>asset.sourcePath===lessons[1].image && asset.uses.some(use=>use.kind==='json')));
    assert.equal(sparse.assetCount,paths.size);
  } finally {rmSync(fixture,{recursive:true,force:true});}
});
