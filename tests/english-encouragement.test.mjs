import test from 'node:test';
import assert from 'node:assert/strict';
import {createEncouragement} from '../english/encouragement.js';
test('streak counts distinct first answers and celebrates three and five without duplicate audio',()=>{const e=createEncouragement();assert.equal(e.answer('a',true).audio,'');e.answer('b',true);assert.equal(e.answer('c',true).audio,'three');assert.equal(e.answer('c',true).audio,'');e.answer('d',true);assert.equal(e.answer('e',true).audio,'five');assert.equal(e.answer('e',false).streak,5)});
test('wrong answer resets streak, recovery receives praise but does not pretend to be first-try streak',()=>{const e=createEncouragement();e.answer('a',true);e.answer('b',true);assert.equal(e.answer('c',false).streak,0);assert.equal(e.answer('c',true).audio,'recovered');assert.equal(e.answer('c',true).audio,'');assert.equal(e.answer('d',true).streak,1)});
test('restored incorrect first answer receives recovery, completion is once per round and resets',()=>{const e=createEncouragement();assert.equal(e.answer('a',true,false).audio,'recovered');assert.equal(e.complete('round').audio,'done');assert.equal(e.complete('round').audio,'');e.reset();assert.equal(e.complete('round').audio,'done');assert.equal(e.answer('b',true).streak,1)});

test('sound preferences apply to already mounted course and page controllers',async()=>{
 const saved=new Map();globalThis.localStorage={getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)};
 const played=[];globalThis.Audio=class{constructor(url){this.url=url}play(){played.push(this.url);return Promise.resolve()}pause(){}};
 const {createWebEncouragement}=await import('../english/encouragement-audio.js');const course=createWebEncouragement(),page=createWebEncouragement();page.toggle();
 course.answer('a',true);course.answer('b',true);course.answer('c',true);assert.equal(course.muted,true);assert.deepEqual(played,[]);
 course.toggle();assert.equal(page.muted,false);page.answer('a',true);page.answer('b',true);page.answer('c',true);assert.deepEqual(played,['/english/encouragement/three.mp3']);
 delete globalThis.localStorage;delete globalThis.Audio;
});

test('finishPrevious queues a new celebration until the current clip ends and cancellation clears the queue',async()=>{
 const saved=new Map();globalThis.localStorage={getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)};
 const clips=[],played=[];globalThis.Audio=class{constructor(url){this.url=url;clips.push(this)}play(){played.push(this.url);return Promise.resolve()}pause(){this.paused=true}};
 const {createWebEncouragement,stopEncouragement}=await import('../english/encouragement-audio.js');stopEncouragement();const e=createWebEncouragement({finishPrevious:true});
 try{e.answer('a',true);e.answer('b',true);e.answer('c',true);e.complete('round');assert.equal(played.length,1,'a second clip must wait');clips[0].onended();assert.deepEqual(played,['/english/encouragement/three.mp3','/english/encouragement/done.mp3']);e.answer('wrong',false);e.answer('wrong',true);const ended=clips[1].onended;e.toggle();assert.equal(clips[1].paused,true);ended();assert.equal(played.length,2,'muted or cancelled queued praise cannot start late');}
 finally{stopEncouragement();delete globalThis.Audio;delete globalThis.localStorage;}
});
