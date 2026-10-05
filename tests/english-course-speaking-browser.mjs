import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';
async function wait(b,expression){for(let i=0;i<100;i++){if(await b.evaluate(expression))return;await sleep(75);}throw new Error(expression);}
test('oral lesson captures real audio, preserves its score and saves only an honest attempt',{timeout:45000},async()=>{
 const b=await openBrowser({chromeFlags:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--autoplay-policy=no-user-gesture-required']});try{
  await b.size(390,844,true);await b.navigate('games/english.html');
  await b.evaluate(`(async()=>{document.body.innerHTML='<main id="courseRoot" class="course-page"></main>';for(const href of ['/english/course.css','/english/speaking.css']){const link=document.createElement('link');link.rel='stylesheet';link.href=href;document.head.append(link);}window.__streams=[];const native=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=(...args)=>native(...args).then(stream=>{window.__streams.push(stream);return stream;});window.__requests=[];window.__saved=[];const priorFetch=window.fetch;window.fetch=async(url,options)=>{if(url==='/api/english/speech-status')return new Response(JSON.stringify({enabled:true,provider:'local-phoneme'}));if(String(url).startsWith('/api/english/pronunciation?')){window.__requests.push({url,size:options.body.size});return new Response(JSON.stringify({score:74,accuracy:74,completeness:100,words:[{word:'Nice',score:74}],duration:1,engine:'local-phoneme'}));}return priorFetch(url,options);};const {mountCourse}=await import('/english/course-ui.js');const {LESSONS}=await import('/english/course-curriculum.js');const {createSession}=await import('/english/course-engine.js');window.__lesson=LESSONS[0];window.__session=createSession(window.__lesson);window.__session.index=window.__session.steps.findIndex(step=>step.kind==='oral');window.__course=mountCourse({root:document.getElementById('courseRoot'),speak(){},read(){},stopAudio(){},openPages(){},onReward(){},notice(){},onSave:payload=>window.__saved.push(payload)});window.__course.replaceProgress({version:1,lessons:{},items:{},session:window.__session});window.__course.start();})()`);
  await wait(b,'!!document.querySelector(".speaking-target")');
  assert.equal(await b.evaluate('document.querySelector(".speaking-target").textContent'),'Nice to meet you.');
  assert.equal(await b.evaluate('document.getElementById("courseNext").disabled'),true);
  assert.equal(await b.evaluate('document.getElementById("courseOral").textContent'),'我已和家人完成活动');
  await b.evaluate('document.querySelector("[data-speaking-action=record]").click()');await wait(b,'!document.querySelector("[data-speaking-action=stop]").hidden');await sleep(1100);
  await b.evaluate('document.querySelector("[data-speaking-action=stop]").click()');await wait(b,'!document.querySelector("[data-speaking-action=submit]").disabled');
  const recordingURL=await b.evaluate('document.querySelector(".speaking-panel audio").src');
  await b.evaluate('document.querySelector("[data-speaking-action=submit]").click()');await wait(b,'!document.getElementById("courseNext").disabled');
  assert.deepEqual(await b.evaluate('window.__course.session.answers[window.__course.session.steps[window.__course.session.index].id]'),{selfReported:true});
  assert.equal(await b.evaluate('document.querySelector(".speaking-panel audio").src'),recordingURL);assert.match(await b.evaluate('document.querySelector("[data-speaking-result]").textContent'),/74/);
  await b.evaluate('window.__course.replaceProgress(window.__course.snapshot(),{preserveView:true})');
  assert.equal(await b.evaluate('document.querySelector(".speaking-panel audio").src'),recordingURL);assert.match(await b.evaluate('document.querySelector("[data-speaking-result]").textContent'),/74/);
  assert.equal(await b.evaluate('Object.values(window.__course.progress.items).length'),0);
  assert.match(await b.evaluate('window.__requests[0].url'),/target=p4-line-/);assert.ok(await b.evaluate('window.__requests[0].size>16000'));
  assert.equal(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),true);
  await b.evaluate('document.querySelector("[data-speaking-action=retry]").click()');await wait(b,'!document.querySelector("[data-speaking-action=stop]").hidden');
  await b.evaluate('window.__course.replaceProgress(window.__course.snapshot(),{preserveView:true})');
  assert.equal(await b.evaluate('window.__streams.at(-1).getTracks().some(track=>track.readyState==="live")'),true);
  assert.equal(await b.evaluate('document.querySelector("[data-speaking-action=stop]").hidden'),false);
  await b.evaluate('window.__course.replaceProgress({version:1,lessons:{},items:{},session:null},{storageKey:"another-child"})');
  assert.equal(await b.evaluate('window.__streams.every(stream=>stream.getTracks().every(track=>track.readyState==="ended"))'),true);
  await b.evaluate('window.__course.replaceProgress({version:1,lessons:{},items:{},session:window.__session});window.__course.start();document.querySelector("[data-speaking-action=record]").click()');
  await wait(b,'!document.querySelector("[data-speaking-action=stop]").hidden');
  await b.evaluate('document.getElementById("courseOpenPage").click()');assert.equal(await b.evaluate('window.__streams.every(stream=>stream.getTracks().every(track=>track.readyState==="ended"))'),true);
  await b.evaluate('window.__course.resumeSpeaking();document.querySelector("[data-speaking-action=record]").click()');
  await wait(b,'!document.querySelector("[data-speaking-action=stop]").hidden');
  await b.evaluate('window.__course.home()');assert.equal(await b.evaluate('window.__streams.every(stream=>stream.getTracks().every(track=>track.readyState==="ended"))'),true);
  assert.deepEqual(b.errors,[]);
 }finally{b.close();}
});
