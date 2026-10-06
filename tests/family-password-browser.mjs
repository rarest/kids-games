import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';
import {startFixture} from './platform-browser-fixture.mjs';
async function wait(browser,expression){for(let i=0;i<100;i++){if(await browser.evaluate(expression))return;await sleep(80);}throw new Error('Browser state timed out: '+expression+' '+await browser.evaluate('document.getElementById("accountNotice")?.textContent'));}
async function click(browser,selector){const point=await browser.evaluate(`(()=>{const element=document.querySelector(${JSON.stringify(selector)});if(!element||element.disabled)return null;element.scrollIntoView({block:'center'});const rect=element.getBoundingClientRect();return{x:rect.x+rect.width/2,y:rect.y+rect.height/2}})()`);assert.ok(point,selector);await browser.call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await browser.call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});await sleep(80);}
async function fill(browser,selector,value){await click(browser,selector);await browser.call('Input.dispatchKeyEvent',{type:'keyDown',key:'a',code:'KeyA',modifiers:2,commands:['selectAll']});await browser.call('Input.dispatchKeyEvent',{type:'keyUp',key:'a',code:'KeyA',modifiers:2});await browser.call('Input.insertText',{text:value});}

test('native registration accepts six digits and six letters, rejects five characters and allows login',{skip:!process.env.PLATFORM_TEST_DATABASE_URL,timeout:60000},async()=>{
 const fixture=await startFixture({family:true,mail:false}),previous=process.env.GAMES_TEST_ORIGIN;process.env.GAMES_TEST_ORIGIN=fixture.origin;let browser;
 try{
  browser=await openBrowser();await browser.size(390,844,true);await browser.navigate('account.html');await wait(browser,'!!document.querySelector("[data-tab=register]")');
  for(const [username,password] of [['digitparent','123456'],['letterparent','abcdef']]){
   await click(browser,'[data-tab=register]');await fill(browser,'input[name=username]',username);await fill(browser,'input[name=password]',password.slice(0,5));
   assert.equal(await browser.evaluate('document.querySelector("input[name=password]").minLength'),6);
   assert.equal(await browser.evaluate('document.querySelector("input[name=password]").hasAttribute("pattern")'),false);
   await click(browser,'form[data-form=register] button[type=submit]');assert.equal(await browser.evaluate('document.querySelector("input[name=password]").validity.tooShort'),true);
   await fill(browser,'input[name=password]',password);await click(browser,'form[data-form=register] button[type=submit]');await wait(browser,'!!document.querySelector("form[data-form=profile]")');
   await click(browser,'[data-action=logout]');await wait(browser,'!!document.querySelector("form[data-form=login]")');await fill(browser,'input[name=identifier]',username);await fill(browser,'input[name=password]','12345');
   assert.equal(await browser.evaluate('document.querySelector("input[name=password]").minLength'),-1,'login has no new-password minimum');
   assert.equal(await browser.evaluate('document.querySelector("form[data-form=login]").checkValidity()'),true,'existing short passwords can be submitted');
   await fill(browser,'input[name=password]',password);await click(browser,'form[data-form=login] button[type=submit]');await wait(browser,'!!document.querySelector("form[data-form=profile]")');
   assert.equal(await browser.evaluate('document.body.textContent.includes('+JSON.stringify(username)+')'),true);
   await click(browser,'[data-action=logout]');await wait(browser,'!!document.querySelector("form[data-form=login]")');
  }
  assert.equal(fixture.mailbox.length,0);assert.deepEqual(browser.errors,[]);
 }finally{browser?.close();await fixture.close();if(previous===undefined)delete process.env.GAMES_TEST_ORIGIN;else process.env.GAMES_TEST_ORIGIN=previous;}
});
