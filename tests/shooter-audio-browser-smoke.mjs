import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser,sleep} from './game-browser-harness.mjs';

test('real shooter gestures unlock music, mute it and stop audio on pause',{timeout:30000},async()=>{
  const b=await openBrowser();
  try{
    await b.call('Page.addScriptToEvaluateOnNewDocument',{source:`
      globalThis.audioCheck={contexts:0,started:0,live:0};
      const NativeAudio=globalThis.AudioContext;
      globalThis.AudioContext=class extends NativeAudio{
        constructor(){super();audioCheck.contexts++}
        createOscillator(){const node=super.createOscillator(),start=node.start.bind(node);
          node.start=(...args)=>{audioCheck.started++;audioCheck.live++;start(...args)};
          node.addEventListener('ended',()=>audioCheck.live--);return node;
        }
      };
    `});
    await b.size(390,844,true);await b.navigate('games/shooter.html');
    assert.equal(await b.evaluate('audioCheck.contexts'),0);
    const click=async id=>{
      const point=await b.evaluate(`(()=>{const r=document.getElementById('${id}').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
      await b.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,id:1}]});
      await b.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(150);
    };
    await click('start');assert.equal(await b.evaluate('audioCheck.contexts'),1);assert.ok(await b.evaluate('audioCheck.live>0'));
    await click('sound');assert.equal(await b.evaluate('audioCheck.live'),0);assert.equal(await b.evaluate('document.getElementById("sound").getAttribute("aria-pressed")'),'true');
    await click('sound');assert.ok(await b.evaluate('audioCheck.live>0'));
    await click('pause');assert.equal(await b.evaluate('audioCheck.live'),0);
    await click('resume');assert.ok(await b.evaluate('audioCheck.live>0'));
    await b.evaluate('window.dispatchEvent(new Event("blur"))');await sleep(150);assert.equal(await b.evaluate('audioCheck.live'),0);
    assert.deepEqual(b.errors,[]);
  }finally{b.close()}
});
