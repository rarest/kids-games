import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';
import {BOOKS,WORDS} from '../english/curriculum.js';
async function wait(b,expr){for(let i=0;i<100;i++){if(await b.evaluate(expr))return;await sleep(100);}throw new Error(expr);}
test('study shows every curriculum word, sentence and grammar point across all 46 units',{timeout:150000},async()=>{
 const b=await openBrowser({chromeFlags:['--autoplay-policy=no-user-gesture-required']});try{await b.size(390,844,true);await b.navigate('games/english.html');await wait(b,'!!window.englishApp');await b.evaluate('document.getElementById("englishButton").click()');
 for(const book of BOOKS){await b.evaluate(`document.getElementById('grade').value=${JSON.stringify(String(book.grade))};document.getElementById('term').value=${JSON.stringify(book.term==='upper'?'上':'下')};document.getElementById('grade').dispatchEvent(new Event('change'))`);
 for(const unit of book.units){await b.evaluate(`document.getElementById('unit').value=${JSON.stringify(unit.id)};document.getElementById('unit').dispatchEvent(new Event('change'));document.getElementById('openStudy').click()`);
 assert.deepEqual(await b.evaluate('Array.from(document.querySelectorAll("[data-say-word]")).map(b=>b.dataset.sayWord)'),unit.words,unit.id);assert.equal(await b.evaluate('document.querySelectorAll(".study-sentence").length'),unit.sentences.length,unit.id);assert.equal(await b.evaluate('document.querySelectorAll(".study-grammar").length'),unit.grammar.length,unit.id);assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),unit.id);assert.ok(await b.evaluate('document.getElementById("studyContent").scrollWidth<=document.getElementById("studyContent").clientWidth+1'),unit.id);
 const grammar=unit.grammar[0];await b.evaluate(`document.querySelector('[data-study-grammar="0"][data-study-option="${grammar.options.indexOf(grammar.answer)}"]').click()`);assert.ok((await b.evaluate('document.querySelector(".study-explanation").textContent')).startsWith('答对了！'),unit.id);
 await b.evaluate('document.getElementById("closeStudy").click()');}}
 await b.evaluate(`window.__clips=[];const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__clips.push(this);return play.call(this)};document.getElementById('openStudy').click();document.querySelector('[data-study-grammar="0"]').click();document.querySelector('[data-say-grammar="0"]').click()`);await wait(b,'window.__clips[0]?.currentTime>0');assert.equal(await b.evaluate('window.__clips[0].playbackRate'),1);assert.deepEqual(b.errors,[]);
 }finally{b.close();}
});
