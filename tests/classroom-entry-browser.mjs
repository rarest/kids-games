import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';

async function wait(b,expression){for(let i=0;i<100;i++){if(await b.evaluate(expression))return;await sleep(70)}throw Error(expression)}
test('classroom entrance retains shared side space on phones tablets and desktop',{timeout:30000},async()=>{
 const b=await openBrowser();try{
  for(const [width,height] of [[320,568],[390,660],[430,740],[768,1024],[1024,768],[1366,900]]){
   await b.size(width,height,width<=1024);await b.navigate('games/classroom.html');await wait(b,'!!window.pearlClassroom');
   const cards=await b.evaluate("[...document.querySelectorAll('.subject-card')].map(e=>{const r=e.getBoundingClientRect();return{left:r.left,right:r.right}})");
   const gutter=width<=700?16:24;
   for(const r of cards){assert.ok(r.left>=gutter,`${width}: retain left gutter`);assert.ok(r.right<=width-gutter,`${width}: retain right gutter`)}
  }
 }finally{b.close()}
});
test('phone entry exposes all three available subjects together with reachable controls',{timeout:60000},async()=>{
 const b=await openBrowser();
 try{
  for(const [width,height] of [[320,568],[390,844],[430,932]]){
   await b.size(width,height,true);await b.navigate('games/classroom.html');await wait(b,'!!window.pearlClassroom');
   await b.evaluate('window.scrollTo(0,0);new Promise(resolve=>requestAnimationFrame(resolve))');
   const layout=await b.evaluate(`(()=>{const r=e=>{const b=e.getBoundingClientRect();return{x:b.x,top:b.top,bottom:b.bottom,width:b.width,height:b.height}};return{subjects:[...document.querySelectorAll('a.subject-card')].map(e=>({card:r(e),action:r(e.querySelector('strong'))})),scroll:document.documentElement.scrollWidth}})()`);
   assert.equal(layout.subjects.length,3);
   for(const subject of layout.subjects){assert.ok(subject.card.x>=12&&subject.card.x+subject.card.width<=width-12,`${width}: retain side space`);assert.ok(subject.action.height>=44&&subject.action.bottom<=height,`${width}: both entry actions fit the first screen`)}
   assert.ok(layout.scroll<=width+1);
   for(const subject of ['chinese','english','math']){
    const point=await b.evaluate(`(()=>{const r=document.querySelector('.subject-card[data-subject="${subject}"] strong').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await b.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});await b.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await wait(b,`location.pathname.endsWith('/${subject}.html')&&!!window.${subject}Course`);
    await b.navigate('games/classroom.html');await wait(b,'!!window.pearlClassroom');
   }
  }
  assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
