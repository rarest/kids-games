import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {WORDS,BOOKS} from '../english/curriculum.js';
test('bundled US audio covers all word, sentence and completed grammar listening buttons',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../english/audio-manifest.json',import.meta.url),'utf8'));
 const legacy=JSON.parse(await readFile(new URL('../english/legacy-sentences.json',import.meta.url),'utf8'));
 const expected=new Set([...Object.keys(WORDS),...legacy.map(text=>`sentence:${text}`)]);for(const book of BOOKS)for(const unit of book.units){for(const s of unit.sentences)expected.add(`sentence:${s.en}`);for(const g of unit.grammar)expected.add(`sentence:${g.prompt.replaceAll('___',g.answer)}`);}
 for(const book of BOOKS)for(const p of book.textbookPages??[])for(const b of p.blocks)for(const l of b.lines)if(/[A-Za-z0-9]/.test(l.en))expected.add(`sentence:${l.en}`);
 assert.deepEqual(Object.keys(manifest).sort(),[...expected].sort());
 for(const [key,file] of Object.entries(manifest)){assert.match(file,/^[a-z0-9-]+\.mp3$/);const data=await readFile(new URL(`../english/audio/${file}`,import.meta.url));assert.ok(data.length>512,key);}
 const files=(await readdir(new URL('../english/audio/',import.meta.url))).filter(x=>x.endsWith('.mp3'));assert.deepEqual(files.sort(),Object.values(manifest).sort());
 const context=JSON.parse(await readFile(new URL('../english/audio/context-pronunciation.json',import.meta.url),'utf8'));assert.equal(context.read.context,'I read a book every day.');assert.equal(context.use.context,'I use a book.');assert.equal(context['read-past'].context,'I read a book yesterday.');for(const entry of Object.values(context)){assert.equal(entry.voice,'en-US-AriaNeural');assert.ok(entry.end_seconds>entry.start_seconds);}
});
