import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';

async function wait(b,expression){for(let i=0;i<120;i++){if(await b.evaluate(expression))return;await sleep(75)}throw Error(expression)}
async function press(b,selector,touch){
 await b.evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);
 const point=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return{x,y,hit:e.contains(document.elementFromPoint(x,y))}})()`);
 assert.ok(point.hit,selector+' must receive the tap');
 if(touch){await b.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:point.x,y:point.y}]});await b.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}
 else{await b.call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,x:point.x,y:point.y});await b.call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,x:point.x,y:point.y})}
 await sleep(100);
}
test('subjects share one navigation and compact identity strip, with the next lesson reachable on the first phone screen',{timeout:90000},async()=>{
 const b=await openBrowser();try{
  // The static local server has no account API. Model disabled cloud learning only
  // in this layout test; authenticated profile flows use the real database suite.
  if(!process.env.GAMES_TEST_ORIGIN)await b.call('Page.addScriptToEvaluateOnNewDocument',{source:`const originalFetch=window.fetch;window.fetch=(url,...args)=>new URL(url,location.href).pathname==='/api/family/status'?Promise.resolve(new Response(JSON.stringify({enabled:false}),{status:200,headers:{'Content-Type':'application/json'}})):originalFetch(url,...args);`});
  for(const [w,h] of [[320,568],[390,660],[430,740],[768,1024],[1024,768],[1366,900]]){
   await b.size(w,h,w<=1024);const subjects=[];
   for(const subject of ['english','chinese']){
    await b.navigate(`games/${subject}.html`);await wait(b,`!!window.${subject}Course`);await b.evaluate('scrollTo(0,0)');
    const geometry=await b.evaluate(`(()=>{const r=e=>{const b=e.getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,height:b.height,bottom:b.bottom}};const visible=e=>!!e.getClientRects().length;return{nav:r(document.querySelector('.classroom-nav')),family:r(document.querySelector('.classroom-family')||document.querySelector('.family-toolbar,.cn-family')),hero:r(document.querySelector('.course-heading,.cn-hero')),start:r(document.querySelector('#startCourse,#startChinese')),parents:[...document.querySelectorAll('a[href="/account.html"]')].filter(visible).length,oldHeader:!!document.querySelector('.topbar')&&visible(document.querySelector('.topbar')),guest:document.querySelector('.family-toolbar,.cn-family').innerText,overflow:document.documentElement.scrollWidth>innerWidth+1,tabs:[...document.querySelectorAll('.classroom-nav [data-subject]')].map(e=>({current:e.getAttribute('aria-current'),...r(e)}))}})()`);
    assert.equal(geometry.oldHeader,false,`${subject} ${w}: classroom must not show the legacy game header`);
    assert.equal(geometry.parents,1,`${subject} ${w}: one parent entrance`);
    assert.ok(geometry.family.height<=54,`${subject} ${w}: guest identity should occupy one short line`);
    assert.equal((geometry.guest.match(/此设备/g)||[]).length,1,`${subject}: no repeated device status`);
    assert.ok(Math.abs(geometry.hero.x-geometry.family.x)<=1,`${subject}: align hero and profile to the same content gutter`);
    if(w<=600)assert.ok(geometry.start.bottom<=h,`${subject} ${w}: primary learning action must fit first screen: ${geometry.start.bottom}`);
    for(const tab of geometry.tabs)assert.ok(tab.height>=44&&tab.width>=44);
    assert.equal(geometry.tabs.filter(t=>t.current==='page').length,1);assert.equal(geometry.overflow,false);
    subjects.push(geometry);
   }
   assert.ok(Math.abs(subjects[0].nav.height-subjects[1].nav.height)<=1,`${w}: identical header heights`);
   assert.ok(Math.abs(subjects[0].family.x-subjects[1].family.x)<=1,`${w}: identical content gutters`);
   assert.ok(Math.abs(subjects[0].family.y-subjects[1].family.y)<=1,`${w}: profile strip begins in the same place`);
  }
  await b.size(390,660,true);await b.navigate('games/classroom.html');await wait(b,'!!window.pearlClassroom');
  assert.equal(await b.evaluate(`[...document.querySelectorAll('a[href="/account.html"]')].filter(e=>e.getClientRects().length).length`),1,'hub also has one parent entry');
  await press(b,'[data-subject="english"]',true);await wait(b,'!!window.englishCourse');await press(b,'#startCourse',true);await press(b,'#courseNext',true);
  const index=await b.evaluate('englishCourse.session.index');await press(b,'[data-subject="chinese"]',true);await wait(b,'!!window.chineseCourse');await press(b,'#startChinese',true);await press(b,'#cnNext',true);
  const chinese=await b.evaluate('chineseCourse.session.index');await press(b,'[data-subject="english"]',true);await wait(b,'!!window.englishCourse');await press(b,'#startCourse',true);assert.equal(await b.evaluate('englishCourse.session.index'),index);
  await press(b,'[data-subject="chinese"]',true);await wait(b,'!!window.chineseCourse');await press(b,'#startChinese',true);assert.equal(await b.evaluate('chineseCourse.session.index'),chinese);
  assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
