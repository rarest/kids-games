import test from 'node:test';
import assert from 'node:assert/strict';
import {BOOKS,WORDS} from '../english/curriculum.js';
const book=()=>BOOKS.find(b=>b.id==='g3-upper');
test('grade-three upper catalog matches the user 2026 printed textbook',()=>{
 assert.equal(book().units[2].title,'Our animal friends');
 assert.match(book().edition,/2026年7月/);
 assert.deepEqual(book().textbookEdition,{firstEdition:'2024年7月第1版',printing:'2026年7月第1次印刷',isbn:'978-7-107-38250-5',source:'user-photos'});
});
test('photo textbook has every supplied page with translated lines and page vocabulary',()=>{
 for(const [index,start,end] of [[0,2,13],[1,14,25],[2,26,37],[3,38,49],[4,50,61],[5,62,73]]){
  const u=book().units[index];assert.ok(u.textbookPages?.length,'missing photo pages');
  assert.deepEqual(u.textbookPages.map(p=>p.page),Array.from({length:end-start+1},(_,i)=>start+i));
  for(const p of u.textbookPages){assert.ok(p.title);assert.ok(p.blocks.length,`p${p.page}`);for(const b of p.blocks){assert.ok(b.title);for(const l of b.lines){assert.ok(l.en);assert.ok(/[\u4e00-\u9fff]/.test(l.zh)||/^\.+$/.test(l.en));assert.doesNotMatch(l.en,/[\u4e00-\u9fff]/);}}for(const w of p.words){assert.equal(WORDS[w.id].en,w.en);assert.match(w.zh,/[\u4e00-\u9fff]/);assert.match(w.ipa,/^\/[^/]+\/$/);}}
 }
 assert.deepEqual(book().textbookPages.map(p=>p.page),Array.from({length:90},(_,i)=>i+2));
});
test('missing phonics and extended reading are reachable in supplied page data',()=>{
 const p6=book().units[0].textbookPages.find(p=>p.page===6);
 for(const word of ['apple','bag','bed','Bob','cat','can','dog','sad','bad','cab','dad'])assert.ok(p6.words.some(w=>w.en===word),word);
 const line=page=>book().units.flatMap(u=>u.textbookPages??[]).find(p=>p.page===page).blocks.flatMap(b=>b.lines).map(l=>l.en);
 assert.ok(line(13).includes('We are good friends now.'));
 assert.ok(line(24).includes('I love my small family.'));
 assert.ok(line(25).includes('I love my big family.'));
 assert.ok(line(18).some(l=>l.includes('fed')));
});

test('revision and all appendices are reachable through the full-book page list',()=>{
 for(const p of book().textbookPages){for(const b of p.blocks)for(const l of b.lines){assert.ok(l.en);assert.ok(/[\u4e00-\u9fff]/.test(l.zh)||/^\.+$/.test(l.en));if(l.say)assert.doesNotMatch(l.say,/\//);}for(const w of p.words){assert.equal(WORDS[w.id].en,w.en);assert.match(w.ipa,/^\/[^/]+\/$/);assert.match(w.zh,/[\u4e00-\u9fff]/);}}
 const page=n=>book().textbookPages.find(p=>p.page===n),lines=n=>page(n).blocks.flatMap(b=>b.lines);
 assert.ok(lines(76).some(l=>l.en==='Shh ...'));
 assert.ok(lines(79).some(l=>l.en.includes('How old are you')));
 assert.ok(lines(80).filter(l=>l.en.includes('/')).every(l=>l.say&&l.tip));
 assert.equal(lines(91).filter(l=>/^[A-Z][a-z]$/.test(l.en)).length,26);
});
