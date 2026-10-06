import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser} from './game-browser-harness.mjs';

test('all visible classroom links buttons and selects offer at least 44px native targets',{timeout:30000},async()=>{
 const browser=await openBrowser();
 try{
  for(const [width,height] of [[320,568],[390,844],[768,1024],[1024,768],[1366,900]]){
   await browser.size(width,height,width<=1024);
   for(const page of ['games/chinese.html','games/classroom.html']){
    await browser.navigate(page);
    const targets=await browser.evaluate(`Array.from(document.querySelectorAll('a,button,select')).filter(e=>e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect();return{text:e.textContent.trim(),tag:e.tagName,width:r.width,height:r.height}})`);
    assert.ok(targets.length>=7);
    for(const target of targets){
     assert.ok(target.height>=44,`${page} ${width}px ${target.tag} ${target.text}: height ${target.height}`);
     assert.ok(target.width>=44,`${page} ${width}px ${target.tag} ${target.text}: width ${target.width}`);
    }
    assert.ok(await browser.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
   }
  }
  assert.deepEqual(browser.errors,[]);
 }finally{browser.close();}
});
