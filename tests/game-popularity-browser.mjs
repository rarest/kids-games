import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {openBrowser,sleep} from './game-browser-harness.mjs';

const evidence = process.env.POPULARITY_EVIDENCE_DIR || '/home/ubuntu/codex-work/output/game-popularity';
async function until(browser,expression,timeout=25000){
  const deadline=Date.now()+timeout;
  while(Date.now()<deadline){if(await browser.evaluate(expression))return;await sleep(100);}
  throw new Error(`Browser condition: ${expression}; errors: ${JSON.stringify(browser.errors)}`);
}
async function click(browser,selector){
  await until(browser,`!!document.querySelector(${JSON.stringify(selector)})`);
  const point=await browser.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return{x,y,ok:!!r.width&&!!r.height&&!e.disabled&&e.contains(document.elementFromPoint(x,y))};})()`);
  assert.ok(point.ok,`Native clickable ${selector}`);
  for(const type of ['mousePressed','mouseReleased'])await browser.call('Input.dispatchMouseEvent',{type,x:point.x,y:point.y,button:'left',clickCount:1});
}
async function observe(browser){
  await browser.call('Page.addScriptToEvaluateOnNewDocument',{source:`
    window.__activityPlaying=false;window.__activityReceipts=[];
    let activity;Object.defineProperty(window,'GameActivity',{configurable:true,get(){return activity},set(value){activity=value;const play=value.setPlaying,finish=value.finish;value.setPlaying=function(v){window.__activityPlaying=!!v;return play.call(value,v)};value.finish=function(){window.__activityPlaying=false;return finish.call(value)}}});
    const fetchOriginal=window.fetch;window.fetch=function(url,options){return fetchOriginal.call(this,url,options).then(async response=>{if(String(url)==='/api/activity'&&response.ok){const receipt=await response.clone().json();window.__activityReceipts.push({qualified:receipt.qualified,counted:receipt.counted,acceptedSeconds:receipt.acceptedSeconds})}return response})};
  `});
}
async function shot(browser,name){await mkdir(evidence,{recursive:true});const data=await browser.call('Page.captureScreenshot',{format:'png'});await writeFile(`${evidence}/${name}.png`,Buffer.from(data.data,'base64'));}

test('native controls activate all fourteen games; real play ranks, pause and refresh dedup work',{timeout:300000},async()=>{
  let fixture;const browsers=[];
  try {
    if(!process.env.GAMES_TEST_ORIGIN){const {startFixture}=await import('./platform-browser-fixture.mjs');fixture=await startFixture();process.env.GAMES_TEST_ORIGIN=fixture.origin;}
    const b=await openBrowser({chromeFlags:['--enable-unsafe-swiftshader']});browsers.push(b);await observe(b);await b.size(390,844,true);
    await b.navigate('index.html');await until(b,'document.querySelector("[data-popularity-panel]").getAttribute("aria-busy")==="false"');
    assert.equal(await b.evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
    await shot(b,'hall-mobile');
    for(const period of ['week','month','day']){await click(b,`[data-popularity-period="${period}"]`);await until(b,'document.querySelector("[data-popularity-panel]").getAttribute("aria-busy")==="false"');assert.equal(await b.evaluate(`document.querySelector('[data-popularity-period="${period}"]').getAttribute('aria-selected')`),'true');}
    await click(b,'#q');await b.call('Input.insertText',{text:'英语'});await until(b,'document.querySelectorAll("#grid .card").length===1');
    const cases=[
      ['memory',['#start','[data-level="1"]'],'#pause'],
      ['english',['#startCourse'],'#courseExit'],
      ['rescue',['#start'],'#pause'],
      ['parkour',['#start','[data-level]'],'#pause'],
      ['racing',['#start'],'#pause'],
      ['territory',['#start'],'#pause'],
      ['shooter',['#start'],'#pause'],
      ['pinyin',['#startBtn'],null],
      ['snake',['#startBtn'],null],
      ['fish',['#startBtn'],null],
      ['fishing',[],null],
      ['goldminer',['.primary-button'],'.store-button'],
      ['maze',['#startButton','[data-stage="normal-1"]'],'#backToMapButton'],
      ['merge4096',['#startButton','#easyMode'],'#exitButton'],
    ];
    for(const [id,selectors,pause] of cases){
      await b.size(id==='racing'||id==='rescue'||id==='parkour'?844:390,id==='racing'||id==='rescue'||id==='parkour'?390:844,true);
      await b.navigate(`games/${id}.html`);await until(b,'!!window.GameActivity');
      if(id==='racing'){
        await until(b,'document.body.dataset.ready==="true"');
        await click(b,'#visual-settings summary');
        await click(b,'#quality');
        for(const type of ['keyDown','keyUp'])await b.call('Input.dispatchKeyEvent',{type,key:'End',code:'End'});
        for(const type of ['keyDown','keyUp'])await b.call('Input.dispatchKeyEvent',{type,key:'Enter',code:'Enter'});
        await until(b,'document.getElementById("quality").value==="low"');
        await click(b,'#visual-settings summary');
      }
      if(id!=='fishing')assert.equal(await b.evaluate('window.__activityPlaying'),false,`${id} menu must not count`);
      for(const selector of selectors)await click(b,selector);
      await until(b,'window.__activityPlaying===true');
      if(pause){await click(b,pause);await until(b,'window.__activityPlaying===false');}
      assert.deepEqual(b.errors,[],`${id} must have no browser errors`);
      console.log(`native activity hook: ${id}`);
    }
    // A real unfinished memory board stays active without synthetic hooks or clocks.
    await b.size(390,844,true);await b.navigate('games/memory.html');await click(b,'#continue');await click(b,'#resume');
    await until(b,'window.__activityPlaying===true');
    await until(b,'window.__activityReceipts.some(r=>r.counted)',40000);
    await click(b,'#pause');await until(b,'window.__activityPlaying===false');
    await until(b,'window.__activityReceipts.some(r=>r.qualified)');
    await sleep(500);const accepted=await b.evaluate('window.__activityReceipts.at(-1).acceptedSeconds');await sleep(3500);
    assert.equal(await b.evaluate('window.__activityReceipts.at(-1).acceptedSeconds'),accepted,'pause must not add time');
    await b.navigate('games/memory.html');await click(b,'#continue');await click(b,'#resume');await until(b,'window.__activityReceipts.some(r=>r.qualified)',40000);
    assert.equal(await b.evaluate('window.__activityReceipts.some(r=>r.counted)'),false,'refresh must not create another count');
    await click(b,'#pause');
    const peer=await openBrowser();browsers.push(peer);await observe(peer);await peer.size(390,844,true);await peer.navigate('games/english.html');await click(peer,'#startCourse');
    await until(peer,'window.__activityReceipts.some(r=>r.counted)',40000);await click(peer,'#courseExit');
    await b.navigate('index.html');await until(b,'document.querySelector(".popularity-row")!==null');
    assert.ok(await b.evaluate('document.querySelector("[data-popularity-results]").textContent.includes("记忆花园")'));
    assert.ok(await b.evaluate('document.querySelector("[data-popularity-results]").textContent.includes("珠珠学习乐园")'));
    await shot(b,'hall-ranked-mobile');await b.size(844,390,true);assert.equal(await b.evaluate('document.documentElement.scrollWidth<=innerWidth'),true);await shot(b,'hall-ranked-landscape');
    const ranks={};for(const period of ['day','week','month'])ranks[period]=await (await fetch(`${b.origin}/api/popularity?period=${period}`)).json();
    await writeFile(`${evidence}/native-ranks.json`,JSON.stringify(ranks,null,2));
    assert.deepEqual(b.errors,[]);assert.deepEqual(peer.errors,[]);
  } finally {for(const browser of browsers)browser.close();if(fixture){delete process.env.GAMES_TEST_ORIGIN;await fixture.close();}}
});
