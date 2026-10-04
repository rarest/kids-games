import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {openBrowser,sleep} from './game-browser-harness.mjs';

// Run against an isolated local site by default, or the real deployment with
// GAMES_TEST_ORIGIN=https://games.nblord.com npm run test:catalog.
test('every catalog destination loads real content and resources on a tablet',{timeout:300000},async()=>{
 const startupChecks={
  'goldminer':"!!document.querySelector('.primary-button')",
  'memory':"document.body.dataset.ready==='true'",
  'racing':"document.body.dataset.ready==='true'",
  'parkour':"document.body.dataset.ready==='true'",
  'rescue':"document.querySelector('#view')?.dataset.phase==='home'",
  'english':'!!window.englishApp',
  'merge4096':"document.body.dataset.screen==='home'&&document.querySelectorAll('.pile-button').length===5",
 };
 const b=await openBrowser({chromeFlags:['--enable-unsafe-swiftshader']});
 let failures=[];
 const report=[];
 b.on('Network.responseReceived',({response:r})=>{
  const path=new URL(r.url).pathname;
  // The default Python fixture serves static assets only. API behavior has its
  // own real-database browser test; deployed-site audits still require API success.
  if(!process.env.GAMES_TEST_ORIGIN&&path.startsWith('/api/')&&[404,501].includes(r.status))return;
  if(r.status>=400&&path!=='/favicon.ico')failures.push(`${r.status} ${r.url}`);
 });
 b.on('Network.loadingFailed',p=>{if(!p.canceled)failures.push(`${p.type}: ${p.errorText}`)});
 try{
  await b.size(820,1180,true);await b.navigate('index.html');
  const games=await b.evaluate('window.GAMES');assert.ok(games.length>0);
  assert.equal(await b.evaluate('document.querySelectorAll(".card").length'),games.length);
  assert.deepEqual(b.errors,[],'home: runtime errors');assert.deepEqual(failures,[],'home: resource failures');
  for(const g of games){
   failures=[];const errorStart=b.errors.length;
   const url=new URL(g.file,b.origin+'/');
   const name=url.pathname.split('/').pop().replace('.html','');
   const started=startupChecks[name]||'!!document.querySelector("canvas, #keyboard")';
   assert.equal(url.origin,b.origin,'catalog links stay on this site');
   // Navigate to the exact versioned catalog link, not a reconstructed filename.
   await b.call('Page.navigate',{url:url.href});
   let ready=false;
   for(let n=0;n<200;n++){
    ready=await b.evaluate(`location.href===${JSON.stringify(url.href)}&&document.readyState==='complete'&&document.body.innerText.trim().length>30&&(${started})`);
    if(ready)break;await sleep(100);
   }
   assert.ok(ready,`${g.name}: page loaded with visible content`);await sleep(250);
   const state=await b.evaluate(`({title:document.title,overflow:document.documentElement.scrollWidth>innerWidth+1,text:document.body.innerText.slice(0,140),bodyReady:document.body.dataset.ready,links:[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'))})`);
   const row={name:g.name,url:url.href,...state,errors:b.errors.slice(errorStart),failedResources:[...failures]};report.push(row);
   assert.ok(state.title,`${g.name}: title`);assert.equal(state.overflow,false,`${g.name}: no horizontal overflow`);
   assert.deepEqual(row.errors,[],`${g.name}: runtime errors`);assert.deepEqual(row.failedResources,[],`${g.name}: resource failures`);
   console.log(`Loaded ${g.name}: ${state.title}`);
  }
 }finally{
  if(process.env.GAMES_AUDIT_DIR){await mkdir(process.env.GAMES_AUDIT_DIR,{recursive:true});await writeFile(`${process.env.GAMES_AUDIT_DIR}/catalog.json`,JSON.stringify(report,null,2));}
  b.close();
 }
});
