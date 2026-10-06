import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';
import {BOOKS} from '../english/curriculum.js';
async function wait(b,expr){for(let i=0;i<120;i++){if(await b.evaluate(expr))return;await sleep(100);}throw new Error(expr);}
test('2026 photo pages display all lines and page words on mobile and desktop, with real US audio and cancellable page reading',{timeout:90000},async()=>{
 const b=await openBrowser({chromeFlags:['--autoplay-policy=no-user-gesture-required']});try{
  await b.size(390,844,true);await b.navigate('games/english.html');await wait(b,'!!window.englishApp');
  await b.evaluate(`document.getElementById('englishButton').click();document.getElementById('openStudy').click()`);
  await wait(b,'!!document.getElementById("textbookPage")');
  const book=BOOKS.find(b=>b.id==='g3-upper');
  for(const unit of book.units){
   if(unit.number!==1)await b.evaluate(`document.getElementById('closeStudy').click();document.getElementById('unit').value='${unit.id}';document.getElementById('unit').dispatchEvent(new Event('change',{bubbles:true}));document.getElementById('openStudy').click()`);
   for(const p of unit.textbookPages){await b.evaluate(`document.getElementById('textbookPage').value='${p.page}';document.getElementById('textbookPage').dispatchEvent(new Event('change',{bubbles:true}))`);
    assert.deepEqual(await b.evaluate('Array.from(document.querySelectorAll(".textbook-line strong")).map(e=>e.textContent)'),p.blocks.flatMap(b=>b.lines.map(l=>l.en)),`page ${p.page}`);
    // Grouping changes visual order, while the exact source vocabulary must be preserved.
    assert.deepEqual(await b.evaluate('Array.from(document.querySelectorAll("[data-textbook-word]")).map(e=>e.dataset.textbookWord).sort()'),p.words.map(w=>w.id).sort());
    assert.ok(await b.evaluate('document.getElementById("studyContent").scrollWidth<=document.getElementById("studyContent").clientWidth+1'),p.page);
   }
  }
  await b.evaluate(`document.getElementById('showBookPages').click()`);
  assert.equal(await b.evaluate('document.getElementById("textbookPage").options.length'),book.textbookPages.length);
  for(const p of book.textbookPages.filter(p=>p.page>=74)){await b.evaluate(`document.getElementById('textbookPage').value='${p.page}';document.getElementById('textbookPage').dispatchEvent(new Event('change',{bubbles:true}))`);assert.deepEqual(await b.evaluate('Array.from(document.querySelectorAll(".textbook-line strong")).map(e=>e.textContent)'),p.blocks.flatMap(b=>b.lines.map(l=>l.en)));assert.ok(await b.evaluate('document.getElementById("studyContent").scrollWidth<=document.getElementById("studyContent").clientWidth+1'),p.page);}
  await b.evaluate(`document.getElementById('textbookPage').value='25';document.getElementById('textbookPage').dispatchEvent(new Event('change',{bubbles:true}))`);
  await b.evaluate(`window.__clips=[];const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__clips.push({el:this,src:this.src});return play.call(this)};document.querySelector('[data-textbook-line]').click()`);
  await wait(b,'window.__clips[0]?.el.currentTime>0');assert.equal(await b.evaluate('window.__clips[0].el.playbackRate'),1);assert.match(await b.evaluate('window.__clips[0].src'),/\/english\/audio\/sentence-/);
  await b.evaluate(`document.querySelector('[data-textbook-word]').click()`);await wait(b,'window.__clips.length===2&&window.__clips[1].el.currentTime>0');
  await b.evaluate(`document.getElementById('readTextbookPage').click()`);await wait(b,'window.__clips.length>=4');await b.evaluate(`document.getElementById('stopTextbookReading').click()`);const count=await b.evaluate('window.__clips.length');await sleep(1200);assert.equal(await b.evaluate('window.__clips.length'),count);assert.ok(await b.evaluate('window.__clips.at(-1).el.paused'));
  await b.evaluate(`document.getElementById('readTextbookPage').click();document.getElementById('textbookPage').value='24';document.getElementById('textbookPage').dispatchEvent(new Event('change',{bubbles:true}))`);await sleep(600);assert.ok(await b.evaluate('window.__clips.at(-1).el.paused'));
  for(const pageNumber of [30,73,80,91]){
   await b.evaluate(`document.getElementById('textbookPage').value='${pageNumber}';document.getElementById('textbookPage').dispatchEvent(new Event('change',{bubbles:true}))`);
   const p=book.textbookPages.find(p=>p.page===pageNumber),wanted=p.blocks.flatMap((block,blockIndex)=>block.lines.map((line,lineIndex)=>({line,key:`${blockIndex}:${lineIndex}`}))).find(({line})=>pageNumber===30?line.en.includes('→'):pageNumber===73?line.en.includes('3,000'):pageNumber===80?line.en.includes('/æ/'):line.en==='Aa');
   const before=await b.evaluate('window.__clips.length');await b.evaluate(`document.querySelector('[data-textbook-line="${wanted.key}"]').click()`);await wait(b,`window.__clips.length===${before+1}&&window.__clips.at(-1).el.currentTime>0`);assert.match(await b.evaluate('window.__clips.at(-1).src'),/\/english\/audio\/sentence-/);
  }
  await b.evaluate(`document.getElementById('readTextbookPage').click();document.getElementById('closeStudy').click()`);await sleep(600);assert.ok(await b.evaluate('window.__clips.at(-1).el.paused'));
  await b.size(844,390,true);await b.evaluate(`document.getElementById('openStudy').click()`);assert.ok(await b.evaluate('document.getElementById("studyContent").scrollWidth<=document.getElementById("studyContent").clientWidth+1'));
  await b.size(1366,768,false);assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));assert.equal(await b.evaluate('window.englishApp.save.coins'),0);assert.deepEqual(b.errors,[]);
 }finally{b.close();}
});
