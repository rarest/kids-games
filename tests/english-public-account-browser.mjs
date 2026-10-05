import test from 'node:test';import assert from 'node:assert/strict';import {openBrowser,sleep} from './game-browser-harness.mjs';
test('published parent account offers username signup without email and rejects five characters',{skip:!process.env.GAMES_TEST_ORIGIN,timeout:30000},async()=>{
 const b=await openBrowser();try{await b.size(390,844,true);await b.navigate('account.html');for(let i=0;i<100&&!await b.evaluate('!!document.querySelector("[data-tab=register]")');i++)await sleep(100);
 await b.evaluate('document.querySelector("[data-tab=register]").click()');assert.equal(await b.evaluate('document.querySelector("input[name=username]").minLength'),6);assert.equal(await b.evaluate('!!document.querySelector("form[data-form=register] input[type=email]")'),false);assert.equal(await b.evaluate('document.querySelector("form[data-form=register] button[type=submit]").disabled'),false);
 const status=await b.evaluate('(async()=>{const r=await fetch("/api/auth/sign-up/username",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:"abcde",password:"invalid-fixture-password-42"})});return r.status})()');assert.equal(status,400,'invalid username cannot pass public server validation');assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
