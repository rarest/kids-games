import test from 'node:test';
import assert from 'node:assert/strict';
import {mountCourse} from '../english/course-ui.js';
import {LESSONS} from '../english/course-curriculum.js';
import {createSession} from '../english/course-engine.js';
import {getTarget} from '../english/page-practice.js';
function mount(){let handler;const routes=[];globalThis.localStorage={getItem:()=>null,setItem(){}};globalThis.window={};globalThis.addEventListener=()=>{};const root={innerHTML:'',addEventListener(type,fn){handler=fn},scrollIntoView(){}};const course=mountCourse({root,speak(){},read(){},stopAudio(){},openPages:(...args)=>routes.push(args),onReward(){},notice(){}});return{course,root,routes,click:button=>handler({target:{closest:()=>button}})};}
test('every guided word, phrase and read line opens its actual photographed source speaking target',()=>{
 const {course,root,routes,click}=mount();let count=0;
 for(const lesson of LESSONS){const session=createSession(lesson);
  for(let index=0;index<session.steps.length;index++){
   const step=session.steps[index];if(!['word','phrase','reading'].includes(step.kind))continue;
   course.replaceProgress({version:1,lessons:{},items:{},session:{...session,index}},{storageKey:'speaking-test'});course.start();
   const rendered=[...root.innerHTML.matchAll(/data-course-speaking="([^"]+)"/g)].map(match=>match[1]);
   const sources=step.kind==='word'?[step.word]:step.kind==='phrase'?[step.phrase]:step.lines;
   assert.equal(rendered.length,sources.length,`${lesson.id} ${step.kind}`);
   rendered.forEach((id,i)=>{const target=getTarget(id);assert.ok(target,id);assert.equal(target.en,sources[i].en);assert.ok(lesson.pages.includes(target.page));click({dataset:{courseSpeaking:id}});assert.deepEqual(routes.at(-1),[target.page,lesson.unitId,{speakingTarget:id}]);count++;});
  }
 }
 assert.ok(count>300);
});
