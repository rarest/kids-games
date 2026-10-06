import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';

async function wait(browser,expression){
 for(let i=0;i<100;i++){if(await browser.evaluate(expression))return;await sleep(60);}
 throw new Error('Timed out: '+expression);
}

async function cachedBrowser(mode){
 const browser=await openBrowser();
 await browser.call('Page.addScriptToEvaluateOnNewDocument',{source:`
  const owner='identity-fixture-parent',profile={id:'identity-fixture-child',nickname:'离线小竹',avatar:'panda'};
  const progress={version:1,lessons:{},items:{},session:null};
  localStorage.setItem('family-verified-owner-v1',JSON.stringify({id:owner}));
  localStorage.setItem('family-profiles-v1:'+owner,JSON.stringify([profile]));
  localStorage.setItem('family-selected-v1:'+owner,profile.id);
  localStorage.setItem('pearl-chinese-cloud-v1:'+owner+':'+profile.id+':sync',JSON.stringify({verified:true,revision:0,data:progress}));
  window.__identityMode=${JSON.stringify(mode)};window.__identityCalls=0;window.__logoutEvents=0;
  addEventListener('family-logout',()=>window.__logoutEvents++);
  const originalFetch=fetch;
  window.fetch=async(url,options)=>{
   if(!String(url).startsWith('/api/'))return originalFetch(url,options);
   window.__identityCalls++;
   if(window.__identityMode==='offline')throw new TypeError('Network unavailable');
   if(url==='/api/family/status')return Response.json({enabled:true});
   if(url==='/api/auth/get-session')return window.__identityMode==='null'?Response.json(null):
    ['401','403'].includes(window.__identityMode)?Response.json({error:'Invalid session'},{status:Number(window.__identityMode)}):Response.json({user:{id:owner,emailVerified:true}});
   if(url==='/api/family/profiles')return Response.json({profiles:[profile]});
   if(window.__identityMode==='progress401')return Response.json({error:'Invalid session'},{status:401});
   return Response.json({revision:0,data:progress});
  };
 `});
 await browser.size(320,568,true);
 await browser.navigate('games/chinese.html');
 return browser;
}

for(const mode of ['null','401','403','progress401'])test(`server ${mode} invalidation cannot resurrect a cached Chinese child during offline retry`,{timeout:15000},async()=>{
 const browser=await cachedBrowser(mode);
 try{
  await wait(browser,'window.__identityCalls>=2&&!!window.chineseCourseCloud');
  await sleep(150);
  await browser.evaluate("window.__identityMode='offline';dispatchEvent(new Event('online'))");
  await wait(browser,'window.__identityCalls>=3');
  await sleep(150);
  assert.equal(await browser.evaluate('window.chineseCourseCloud.profile'),null,'denied identity must stay in guest mode after retry');
  assert.equal(await browser.evaluate('localStorage.getItem("family-verified-owner-v1")'),null,'shared verified identity must be cleared');
  assert.equal(await browser.evaluate('window.chineseCourse.storageKey'),'pearl-chinese-course-v1');
  assert.equal(await browser.evaluate('window.__logoutEvents'),1,'one invalidation emits one logout event, without recursion');
  assert.deepEqual(browser.errors,[]);
 }finally{browser.close();}
});

test('network loss retains a previously verified Chinese child that the server has not denied',{timeout:15000},async()=>{
 const browser=await cachedBrowser('offline');
 try{
  await wait(browser,'window.chineseCourseCloud?.profile?.id==="identity-fixture-child"');
  assert.equal(await browser.evaluate('window.chineseCourseCloud.status'),'离线待同步');
  assert.equal(await browser.evaluate('window.chineseCourse.storageKey'),'pearl-chinese-cloud-v1:identity-fixture-parent:identity-fixture-child');
  assert.equal(await browser.evaluate('window.__logoutEvents'),0);
  assert.ok(await browser.evaluate('localStorage.getItem("family-verified-owner-v1")'));
  for(const [width,height] of [[320,568],[390,844],[768,1024],[1024,768],[1366,900]]){
   await browser.size(width,height,width<=1024);
   const targets=await browser.evaluate(`Array.from(document.querySelectorAll('#familyBar a,#familyBar button,#familyBar select')).map(e=>{const r=e.getBoundingClientRect();return{tag:e.tagName,text:e.textContent.trim(),height:r.height,width:r.width}})`);
   assert.ok(targets.some(target=>target.tag==='SELECT'),'exercise the real child selector');
   for(const target of targets){assert.ok(target.height>=44,`${width}px ${target.tag} ${target.text}: height ${target.height}`);assert.ok(target.width>=44);}
   assert.ok(await browser.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
  }
  assert.deepEqual(browser.errors,[]);
 }finally{browser.close();}
});
