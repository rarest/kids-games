import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';
import {startFixture} from './platform-browser-fixture.mjs';
import {createWechat} from '../platform/wechat.mjs';
async function wait(b,expression){for(let i=0;i<100;i++){if(await b.evaluate(expression))return;await sleep(80)}throw new Error(expression)}
async function click(b,selector){const point=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await b.call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await b.call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point})}
test('native parent-center hides unconfigured WeChat and configured QR button starts real OAuth state',{skip:!process.env.PLATFORM_TEST_DATABASE_URL,timeout:60000},async()=>{
 const previous=process.env.GAMES_TEST_ORIGIN;let fixture,b;
 try{
  fixture=await startFixture({family:true,mail:false});process.env.GAMES_TEST_ORIGIN=fixture.origin;b=await openBrowser();await b.size(390,700,true);await b.navigate('account.html');await wait(b,'!!document.querySelector("form[data-form=login]")');
  assert.equal(await b.evaluate('document.querySelector("[data-action=wechat-login]")'),null);assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));assert.deepEqual(b.errors,[]);b.close();b=null;await fixture.close();fixture=null;
  const wechat=createWechat({env:{WECHAT_WEB_APP_ID:'fixture-web',WECHAT_WEB_APP_SECRET:'fixture-only-not-production',WECHAT_WEB_MODE:'website'}});fixture=await startFixture({family:true,mail:false,wechat});process.env.GAMES_TEST_ORIGIN=fixture.origin;b=await openBrowser();await b.size(390,700,true);
  let oauth=null;b.on('Fetch.requestPaused',event=>{oauth=new URL(event.request.url);b.call('Fetch.fulfillRequest',{requestId:event.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/html'}],body:Buffer.from('<html><body>OAuth navigation captured by test</body></html>').toString('base64')}).catch(()=>{})});await b.call('Fetch.enable',{patterns:[{urlPattern:'https://open.weixin.qq.com/*'}]});
  await b.navigate('account.html');await wait(b,'!!document.querySelector("[data-action=wechat-login]")');await click(b,'[data-action=wechat-login]');for(let i=0;i<100&&!oauth;i++)await sleep(80);assert.ok(oauth);assert.equal(oauth.pathname,'/connect/qrconnect');assert.equal(oauth.searchParams.get('appid'),'fixture-web');assert.ok(oauth.searchParams.get('state'));assert.equal(new URL(oauth.searchParams.get('redirect_uri')).origin,fixture.origin);assert.deepEqual(b.errors,[]);
 }finally{b?.close();await fixture?.close();if(previous===undefined)delete process.env.GAMES_TEST_ORIGIN;else process.env.GAMES_TEST_ORIGIN=previous}
});
