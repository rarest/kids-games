import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';

async function wait(b,expression){for(let i=0;i<100;i++){if(await b.evaluate(expression))return;await sleep(70)}throw Error(expression)}
test('phone entry exposes both available subjects together with reachable controls',{timeout:60000},async()=>{
 const b=await openBrowser();
 try{
  for(const [width,height] of [[320,568],[390,844],[430,932]]){
   await b.size(width,height,true);await b.navigate('games/classroom.html');await wait(b,'!!window.pearlClassroom');
   await b.evaluate('window.scrollTo(0,0);new Promise(resolve=>requestAnimationFrame(resolve))');
   const layout=await b.evaluate(`(()=>{const r=e=>{const b=e.getBoundingClientRect();return{x:b.x,top:b.top,bottom:b.bottom,width:b.width,height:b.height}};return{subjects:[...document.querySelectorAll('a.subject-card')].map(e=>({card:r(e),action:r(e.querySelector('strong'))})),math:r(document.querySelector('.subject-card[aria-disabled]')),scroll:document.documentElement.scrollWidth}})()`);
   assert.equal(layout.subjects.length,2);
   assert.ok(Math.abs(layout.subjects[0].card.top-layout.subjects[1].card.top)<=1,`${width}: both subjects must appear together`);
   for(const subject of layout.subjects){assert.ok(subject.card.x>=12&&subject.card.x+subject.card.width<=width-12,`${width}: retain side space`);assert.ok(subject.action.height>=44&&subject.action.bottom<=height,`${width}: both entry actions fit the first screen`)}
   assert.ok(layout.math.height<=100,'unavailable mathematics should be a compact notice');
   assert.ok(layout.scroll<=width+1);
   for(const subject of ['chinese','english']){
    const point=await b.evaluate(`(()=>{const r=document.querySelector('.subject-card[data-subject="${subject}"] strong').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await b.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});await b.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await wait(b,`location.pathname.endsWith('/${subject}.html')&&!!window.${subject==='chinese'?'chineseCourse':'englishCourse'}`);
    await b.navigate('games/classroom.html');await wait(b,'!!window.pearlClassroom');
   }
  }
  assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
