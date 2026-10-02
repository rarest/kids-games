import test from 'node:test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {openBrowser,sleep} from './game-browser-harness.mjs';

const position=async b=>b.evaluate('(()=>{const a=document.querySelector("#map");return{x:Number(a.dataset.playerX),y:Number(a.dataset.playerY)}})()');
const rect=async(b,selector)=>b.evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}})()`);
const click=async(b,selector)=>b.evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
const screenshot=async(b,path)=>{const p=await b.call('Page.captureScreenshot',{format:'png'});await writeFile(path,Buffer.from(p.data,'base64'))};
const touch=async(b,type,x,y)=>b.call('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1,radiusX:3,radiusY:3,force:1}]});

for(const action of ['purchase','settlement'])test(`paper territory hero preserves its 8:7 proportions after ${action}`,{timeout:15000},async()=>{
  const b=await openBrowser();
  try{
    await b.size(390,844,true);await b.navigate('games/territory.html');
    const ratio=()=>b.evaluate('(()=>{const s=getComputedStyle(document.getElementById("hero-map"));return parseFloat(s.width)/parseFloat(s.height)})()');
    assert.ok(Math.abs(await ratio()-8/7)<.02,'initial art is 8:7 within subpixel rounding');
    if(action==='purchase'){
      await b.evaluate('localStorage.setItem("paper-territory.profile.v1",JSON.stringify({coins:100,owned:["red"],selected:"red"}))');await b.navigate('games/territory.html');
      await click(b,'#shop');await click(b,'[data-skin="blue"] button');await click(b,'[data-skin="blue"] button');await click(b,'#shop-back');
      assert.equal(await b.evaluate('document.getElementById("home-paper").dataset.skin'),'blue');
    }else{await click(b,'#start');await click(b,'#pause');await click(b,'#finish');await click(b,'#return-home')}
    assert.ok(Math.abs(await ratio()-8/7)<.02,`returning home after ${action} does not stretch the island`);
    assert.deepEqual(b.errors,[]);
  }finally{b.close()}
});

test('paper territory consumes player events before later bot events and keeps reading a bounded queue',{timeout:15000},async()=>{
  const b=await openBrowser();
  try{
    await b.size(390,844,true);await b.navigate('games/territory.html');
    const events=await b.evaluate(`(async()=>{const{readNewEvents}=await import(document.querySelector('script[type=module]').src);const capture={type:'capture',id:0,time:1,cells:8},bot={type:'capture',id:1,time:1};let queue=[capture,bot],cursor=queue.at(-1);const first=readNewEvents(queue,null).map(e=>[e.type,e.id]);const repeated=readNewEvents(queue,cursor).length;for(let i=0;i<100;i++)queue.push({type:'capture',id:2,time:2+i});queue=queue.slice(-100);const afterEviction=readNewEvents(queue,cursor).length;cursor=queue.at(-1);const cut={type:'cut',id:0,time:102};queue.push(cut,{type:'capture',id:3,time:102});queue=queue.slice(-100);const afterRotation=readNewEvents(queue,cursor).map(e=>[e.type,e.id]);return{first,repeated,afterEviction,afterRotation}})()`);
    assert.deepEqual(events,{first:[['capture',0],['capture',1]],repeated:0,afterEviction:100,afterRotation:[['cut',0],['capture',3]]});
    assert.deepEqual(b.errors,[]);
  }finally{b.close()}
});

test('paper territory has real shop categories, folded previews, locked silhouettes and saved equipment',{timeout:30000},async()=>{
  const b=await openBrowser();
  try{
    await b.size(390,844,true);await b.navigate('games/territory.html');
    assert.equal(await b.evaluate('document.body.dataset.screen'),'home','a usable homepage loads');
    assert.equal(await b.evaluate('document.querySelector("#home-paper").dataset.skin'),'red');
    await screenshot(b,'/tmp/territory-home.png');
    await click(b,'#shop');
    for(const tier of ['normal','fine','hidden']){
      await click(b,`[data-tier="${tier}"]`);
      assert.equal(await b.evaluate('document.querySelectorAll(".skin-card").length'),20);
      assert.equal(await b.evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
      if(tier==='hidden'){
        assert.equal(await b.evaluate('document.querySelectorAll(".skin-card[data-locked=true]").length'),20);
        assert.equal(await b.evaluate('new Set([...document.querySelectorAll(".skin-preview")].map(c=>c.toDataURL())).size'),1,'all locked skins conceal their actual appearance');
        assert.equal(await b.evaluate('(()=>{const c=document.querySelector(".skin-preview"),d=c.getContext("2d").getImageData(c.width/2,c.height/2,1,1).data;return d[0]<45&&d[1]<45&&d[2]<45})()'),true,'hidden paper is a black silhouette');
        await screenshot(b,'/tmp/territory-shop.png');
      }
      if(tier==='fine'){
        assert.equal(await b.evaluate('new Set([...document.querySelectorAll(".skin-preview")].map(c=>c.toDataURL())).size'),20,'20 distinct rendered textures');
        assert.equal(await b.evaluate(`(async()=>{const{drawPaper}=await import('../territory/render.js'),{SKINS}=await import('../territory/profile.js');return new Set(SKINS.filter(s=>s.tier==='fine').map(s=>{const c=document.createElement('canvas');c.width=c.height=112;drawPaper(c.getContext('2d'),56,56,72,{...s,color:'#629ca6'});return c.toDataURL()})).size})()`),20,'texture differences remain visible even with identical colors');
      }
    }
    // A legitimate persisted profile is the boundary; no production mutation API.
    await b.evaluate('localStorage.setItem("paper-territory.profile.v1",JSON.stringify({coins:100,wins:1,owned:["red"],selected:"red",settled:[]}))');
    await b.navigate('games/territory.html');await click(b,'#shop');
    await click(b,'[data-skin="blue"] button');
    assert.equal(await b.evaluate('document.querySelector("#wallet").textContent'),'80');
    await click(b,'[data-skin="blue"] button');
    await b.navigate('games/territory.html');
    assert.equal(await b.evaluate('document.querySelector("#home-paper").dataset.skin'),'blue');
    await click(b,'#shop');await click(b,'[data-tier="hidden"]');
    assert.equal(await b.evaluate('document.querySelectorAll(".skin-card[data-locked=true]").length'),19);
    assert.equal(await b.evaluate(`(async()=>{const{drawPaper}=await import('../territory/render.js'),{SKINS}=await import('../territory/profile.js');return new Set(SKINS.filter(s=>s.tier==='hidden').map(s=>{const c=document.createElement('canvas');c.width=c.height=128;drawPaper(c.getContext('2d'),64,64,62,{...s,color:'#629ca6'},1,{active:true});return c.toDataURL()})).size})()`),20,'20 distinct rendered hidden effects');
    await click(b,'[data-tier="normal"]');await b.evaluate('Storage.prototype.setItem=()=>{throw new Error("storage unavailable")}');await click(b,'[data-skin="orange"] button');
    assert.match(await b.evaluate('document.querySelector("#notice").textContent'),/无法保存/,'failed persistence remains visible after purchase');
    assert.deepEqual(b.errors,[]);
  }finally{b.close()}
});

test('paper territory speed selector keeps native keyboard navigation without moving the paper',{timeout:15000},async()=>{
  const b=await openBrowser();
  try{
    await b.size(1440,900,false);await b.navigate('games/territory.html');await click(b,'#start');
    const p=await position(b);await b.evaluate('document.querySelector("#speed").focus()');
    await b.call('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowDown',code:'ArrowDown'});await b.call('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowDown',code:'ArrowDown'});await sleep(100);
    assert.equal(await b.evaluate('document.querySelector("#speed").value'),'5.2','arrow changes the native speed selection');
    assert.deepEqual(await position(b),p,'focused select never steers the player');
    assert.deepEqual(b.errors,[]);
  }finally{b.close()}
});

test('paper territory touch, keyboard and hover steering stop accurately and settlement persists once',{timeout:45000},async()=>{
  const b=await openBrowser();
  try{
    await b.size(390,844,true);await b.navigate('games/territory.html');await click(b,'#start');
    assert.equal(await b.evaluate('document.body.dataset.mode'),'playing');
    assert.match(await b.evaluate('document.querySelector("#input-help").textContent'),/摇杆/,'phone controls describe touch input');
    assert.ok(Number(await b.evaluate('map.dataset.paperSize'))>=16,'active paper stays legible on phone');
    const j=await rect(b,'#joystick'),m=await rect(b,'#map');
    assert.ok(j.w>=112&&j.h>=112);assert.ok(j.y>=m.y+m.h||j.x>=m.x+m.w,'joystick is outside the map');
    const before=await position(b);
    await touch(b,'touchStart',j.x+j.w/2,j.y+j.h/2);await touch(b,'touchMove',j.x+j.w/2+40,j.y+j.h/2+20);await sleep(220);
    const moving=await position(b);assert.ok(moving.x>before.x&&moving.y>before.y,'real touch moves diagonally');
    await touch(b,'touchEnd');await sleep(80);const stopped=await position(b);await sleep(200);assert.deepEqual(await position(b),stopped,'release stops');
    await click(b,'#pause');assert.equal(await b.evaluate('document.body.dataset.mode'),'paused');await sleep(220);assert.deepEqual(await position(b),stopped);
    await click(b,'#resume');await b.size(1440,900,false);
    assert.match(await b.evaluate('document.querySelector("#input-help").textContent'),/鼠标/,'desktop controls describe mouse input');
    const a=await position(b);
    await b.call('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowLeft',code:'ArrowLeft'});await sleep(170);await b.call('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowLeft',code:'ArrowLeft'});
    assert.ok((await position(b)).x<a.x,'keyboard moves');
    const mp=await rect(b,'#map'),p=await position(b);
    const geom=await b.evaluate('({scale:Number(map.dataset.scale),ox:Number(map.dataset.offsetX),oy:Number(map.dataset.offsetY)})');
    const target={x:mp.x+geom.ox+(p.x+.5)*geom.scale,y:mp.y+geom.oy+p.y*geom.scale};
    await b.call('Input.dispatchMouseEvent',{type:'mouseMoved',x:target.x,y:target.y});await sleep(450);
    const arrived=await position(b);assert.ok(arrived.x>p.x+.35,'hover moves without pressing');assert.ok(Math.abs(arrived.x-p.x-.5)<.035,'mouse arrival does not overshoot');
    await sleep(150);assert.deepEqual(await position(b),arrived,'arrival stays still');
    await b.call('Input.dispatchMouseEvent',{type:'mouseMoved',x:target.x+50,y:target.y});await sleep(50);await b.call('Input.dispatchMouseEvent',{type:'mouseMoved',x:2,y:2});await sleep(80);
    const left=await position(b);await sleep(150);assert.deepEqual(await position(b),left,'canvas leave stops');
    await screenshot(b,'/tmp/territory-desktop.png');
    for(const[w,h,t]of [[320,568,true],[390,844,true],[844,390,true],[820,1180,true],[1440,900,false]]){
      await b.size(w,h,t);const r=await rect(b,'#map'),joy=await rect(b,'#joystick');
      assert.equal(await b.evaluate('document.documentElement.scrollWidth<=innerWidth'),true,`${w}x${h}: no overflow`);
      assert.ok(r.w>200&&r.h>150&&r.y+r.h<=h,`${w}x${h}: map remains usable ${JSON.stringify(r)}`);
      assert.ok(joy.w>=112&&joy.h>=112&&joy.y+joy.h<=h,`${w}x${h}: joystick visible`);
      if(w===390)await screenshot(b,'/tmp/territory-phone.png');
    }
    await click(b,'#pause');await click(b,'#finish');
    assert.equal(await b.evaluate('document.body.dataset.screen'),'result');
    const saved=await b.evaluate('JSON.parse(localStorage.getItem("paper-territory.profile.v1"))');
    assert.equal(saved.settled.length,1);assert.equal(saved.coins,Number(await b.evaluate('document.querySelector("#result-coins").textContent.slice(1)')));
    await click(b,'#return-home');await b.navigate('games/territory.html');
    assert.deepEqual(await b.evaluate('JSON.parse(localStorage.getItem("paper-territory.profile.v1"))'),saved,'refresh does not pay twice');
    await b.navigate('index.html');assert.equal(await b.evaluate('document.querySelectorAll(".card").length'),9);assert.equal(await b.evaluate(`document.querySelectorAll('a[href="games/territory.html"]').length`),1);
    assert.deepEqual(b.errors,[]);
  }finally{b.close()}
});

test('paper territory closes a real keyboard loop into owned land and clears canceled input',{timeout:30000},async()=>{
  const b=await openBrowser();
  try{
    await b.size(390,844,true);await b.navigate('games/territory.html');await click(b,'#start');
    const before=Number(await b.evaluate('map.dataset.coverage'));
    for(const[key,ms]of [['ArrowRight',920],['ArrowDown',620],['ArrowLeft',920],['ArrowUp',620]]){
      await b.call('Input.dispatchKeyEvent',{type:'keyDown',key,code:key});await sleep(ms);await b.call('Input.dispatchKeyEvent',{type:'keyUp',key,code:key});
    }
    await sleep(120);assert.ok(Number(await b.evaluate('map.dataset.coverage'))>before+.005,'closing a route increases actual ownership');
    const j=await rect(b,'#joystick');await touch(b,'touchStart',j.x+j.w*.7,j.y+j.h*.5);await sleep(70);await b.call('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await sleep(100);const canceled=await position(b);await sleep(150);assert.deepEqual(await position(b),canceled,'touchCancel clears movement');
    await b.evaluate('window.dispatchEvent(new Event("blur"))');assert.equal(await b.evaluate('document.body.dataset.mode'),'paused');
    const stationary=await position(b);await sleep(120);assert.deepEqual(await position(b),stationary);
    await click(b,'#finish');const saved=await b.evaluate('JSON.parse(localStorage.getItem("paper-territory.profile.v1"))');assert.ok(saved.coins>0,'real expansion earns positive coins');assert.equal(saved.settled.length,1);
    await b.navigate('games/territory.html');assert.deepEqual(await b.evaluate('JSON.parse(localStorage.getItem("paper-territory.profile.v1"))'),saved,'earned expansion coins survive refresh without duplicates');
    assert.deepEqual(b.errors,[]);
  }finally{b.close()}
});
