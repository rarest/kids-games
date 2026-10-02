import test from 'node:test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {openBrowser,sleep} from './game-browser-harness.mjs';

test('all game areas adapt to phone, tablet and desktop, including rotation',{timeout:90000},async()=>{
  const b=await openBrowser();
  try{
    const games=[['pinyin','#stage'],['snake','.stage'],['fish','.stage'],['fishing','#game'],['goldminer','.stage-wrap'],['maze','.canvas-frame'],['merge4096','.board'],['shooter','#arena']];
    for(const [name,selector]of games){
      await b.size(390,844,true);await b.navigate(`games/${name}.html`);
      if(name==='maze')await b.evaluate('startButton.click();document.querySelector(".stage-node:not(:disabled)").click()');
      if(name==='merge4096')await b.evaluate('startButton.click();joyMode.click();autoPauseButton.click()');
      if(name==='shooter')await b.evaluate('document.getElementById("start").click()');
      for(const [w,h,touch]of [[320,568,true],[568,320,true],[390,844,true],[844,390,true],[820,1180,true],[1180,820,true],[1440,900,false]]){
        await b.size(w,h,touch);
        const rect=await b.evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)}),r=el?.getBoundingClientRect();return {width:r?.width,height:r?.height,x:r?.x,y:r?.y,scroll:document.documentElement.scrollWidth,view:innerWidth}})()`);
        assert.ok(rect.scroll<=w+1,`${name} ${w}x${h}: horizontal overflow ${JSON.stringify(rect)}`);
        assert.ok(rect.width>100&&rect.height>90,`${name} ${w}x${h}: usable play area ${JSON.stringify(rect)}`);
        if(['pinyin','fish','fishing','shooter'].includes(name))assert.ok(rect.width>=w*.9,`${name} ${w}: fills width ${JSON.stringify(rect)}`);
        if(name==='pinyin'){
          const k=await b.evaluate('(()=>{const r=keyboard.getBoundingClientRect();return {w:r.width,b:r.bottom,key:document.querySelector(".key").getBoundingClientRect().height}})()');
          assert.ok(k.w>=w*.9&&k.b<=h+1&&k.key>=28,`keyboard ${w}x${h} ${JSON.stringify(k)}`);
        }
        if(['snake','fish','shooter','maze'].includes(name))assert.ok(rect.y+rect.height<=h+2,`${name} ${w}x${h}: clipped play area ${JSON.stringify(rect)}`);
        if(w===1440&&['goldminer','maze','merge4096'].includes(name))assert.ok(rect.width>=w*.55,`${name}: desktop play area too narrow ${rect.width}`);
      }
      assert.deepEqual(b.errors,[],name);
    }
    await b.navigate('index.html');assert.equal(await b.evaluate('document.querySelectorAll(".card").length'),8);
  }finally{b.close()}
});

test('space shooter starts, moves with touch and keys, pauses, rotates and saves the record',{timeout:30000},async()=>{
  const b=await openBrowser();
  try{
    await b.size(390,844,true);await b.navigate('games/shooter.html');
    await b.evaluate('document.getElementById("start").click()');await sleep(150);
    assert.equal(await b.evaluate('document.body.dataset.mode'),'playing');
    await sleep(700);await b.evaluate('document.getElementById("pulse").click()');
    assert.ok(Number(await b.evaluate('best.textContent'))>0,'a real target destruction is saved');
    const before=await b.evaluate('document.getElementById("arena").dataset.playerX');
    const r=await b.evaluate('(()=>{const r=arena.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}})()');
    for(const [type,x]of [['touchStart',r.x+r.w*.5],['touchMove',r.x+r.w*.8]])await b.call('Input.dispatchTouchEvent',{type,touchPoints:[{x,y:r.y+r.h*.8,id:1,radiusX:2,radiusY:2,force:1}]});
    await b.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(80);
    assert.ok(Number(await b.evaluate('arena.dataset.playerX'))>Number(before));
    await b.evaluate('document.getElementById("pause").click()');assert.equal(await b.evaluate('document.body.dataset.mode'),'paused');
    const score=await b.evaluate('score.textContent');await sleep(600);assert.equal(await b.evaluate('score.textContent'),score);
    await b.evaluate('document.getElementById("resume").click()');assert.equal(await b.evaluate('document.body.dataset.mode'),'playing');
    await b.size(1440,900,false);const x=Number(await b.evaluate('arena.dataset.playerX'));
    await b.call('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowLeft',code:'ArrowLeft'});await sleep(150);await b.call('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowLeft',code:'ArrowLeft'});
    assert.ok(Number(await b.evaluate('arena.dataset.playerX'))<x);
    await b.evaluate('document.getElementById("pause").click()');
    const saved=await b.evaluate('best.textContent');await b.navigate('games/shooter.html');assert.equal(await b.evaluate('best.textContent'),saved);
    if(process.env.GAMES_SCREENSHOT){const p=await b.call('Page.captureScreenshot',{format:'png'});await writeFile(process.env.GAMES_SCREENSHOT,Buffer.from(p.data,'base64'))}
    assert.deepEqual(b.errors,[]);
  }finally{b.close()}
});
