import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { LEVELS, getLevel } from '../maze/levels.js';
import { sceneProfileFor } from '../maze/scenery.js';
import { canvasHasRgbVariation } from './browser-smoke-helpers.mjs';

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const DIRECTIONS=[['up',0,-1],['down',0,1],['left',-1,0],['right',1,0]];
const canvasRgbCheck=`(${canvasHasRgbVariation.toString()})`;

function pathTo(level,target){
  const queue=[{...level.start,path:[]}],seen=new Set([`${level.start.x},${level.start.y}`]);
  for(let cursor=0;cursor<queue.length;cursor++){
    const node=queue[cursor];
    if(node.x===target.x&&node.y===target.y)return node.path;
    for(const [name,dx,dy] of DIRECTIONS){
      const x=node.x+dx,y=node.y+dy,signature=`${x},${y}`;
      if(level.rows[y]?.[x]!=='.'||seen.has(signature))continue;
      seen.add(signature);queue.push({x,y,path:[...node.path,name]});
    }
  }
  throw new Error(`No path to screenshot target ${target.x},${target.y}`);
}

async function waitFor(url,attempts=80){
  for(let index=0;index<attempts;index++){
    try{const response=await fetch(url);if(response.ok)return response}catch{}
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

class Cdp{
  constructor(url){
    this.socket=new WebSocket(url);this.nextId=1;this.pending=new Map();this.events=[];
    this.ready=new Promise((resolve,reject)=>{this.socket.onopen=resolve;this.socket.onerror=reject});
    this.socket.onmessage=message=>{
      const payload=JSON.parse(message.data);
      if(payload.id){const promise=this.pending.get(payload.id);this.pending.delete(payload.id);payload.error?promise.reject(new Error(payload.error.message)):promise.resolve(payload.result)}
      else this.events.push(payload);
    };
  }
  async call(method,params={}){
    await this.ready;const id=this.nextId++,result=new Promise((resolve,reject)=>this.pending.set(id,{resolve,reject}));
    this.socket.send(JSON.stringify({id,method,params}));return result;
  }
  close(){this.socket.close()}
}

const isolatedSaveFor=(level,position)=>({
  version:1,coins:0,inventory:{dynamite:0,hook:0},ownedSkins:['red'],equippedSkin:'red',
  collectedCoinIds:[],completedNormal:[],bestStars:{},bestSteps:{},
  unlockedNormal:level.type==='normal'?level.index:1,journeyPosition:position
});

test('390x844 DPR2 sweep renders all nineteen theme profiles within scene budgets', {timeout:30000}, async t=>{
  const requestedStage=process.env.CROWN_STAGE_ID,requestedLevel=requestedStage?getLevel(requestedStage):null;
  assert.ok(!requestedStage||requestedLevel,`Unknown CROWN_STAGE_ID: ${requestedStage}`);
  const levels=process.env.CROWN_THEME_SWEEP==='1'||!requestedLevel?LEVELS:[requestedLevel];
  const baseUrl=process.env.CROWN_BASE_URL||'http://127.0.0.1:4175';
  const server=process.env.CROWN_BASE_URL?null:spawn('python3',['-m','http.server','4175','--bind','127.0.0.1'],{cwd:new URL('..',import.meta.url),stdio:'ignore'});
  const chrome=spawn('chromium-browser',[
    '--headless','--no-sandbox','--disable-gpu','--hide-scrollbars','--remote-debugging-port=9235',
    '--user-data-dir=/home/ubuntu/snap/chromium/common/crown-maze-theme-cdp','about:blank'
  ],{stdio:'ignore'});
  let cdp;const metrics=[];
  try{
    await waitFor(`${baseUrl}/games/maze.html`);
    const tabs=await(await waitFor('http://127.0.0.1:9235/json')).json();
    cdp=new Cdp(tabs.find(tab=>tab.type==='page').webSocketDebuggerUrl);
    await cdp.call('Runtime.enable');await cdp.call('Page.enable');await cdp.call('Network.enable');await cdp.call('Network.setCacheDisabled',{cacheDisabled:true});
    await cdp.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});
    const evaluate=async expression=>{
      const response=await cdp.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
      if(response.exceptionDetails)throw new Error(response.exceptionDetails.exception?.description||response.exceptionDetails.text);
      return response.result.value;
    };
    const navigate=async url=>{
      await cdp.call('Page.navigate',{url});
      for(let index=0;index<80;index++){
        const state=await evaluate('document.readyState');
        if(state==='complete')return;
        await sleep(100);
      }
      throw new Error(`Timed out loading ${url}`);
    };
    await navigate(`${baseUrl}/games/maze.html?diagnostics=1&sweep=bootstrap`);
    assert.deepEqual(await evaluate('({width:innerWidth,height:innerHeight,dpr:devicePixelRatio})'),{width:390,height:844,dpr:2});
    for(const level of levels){
      const position=LEVELS.findIndex(candidate=>candidate.id===level.id),ordinal=position+1;
      const save=isolatedSaveFor(level,position);
      await evaluate(`localStorage.setItem('crown-maze-save-v1',${JSON.stringify(JSON.stringify(save))})`);
      await navigate(`${baseUrl}/games/maze.html?diagnostics=1&sweep=${ordinal}`);
      if(level.id==='reward-3'){
        const preScroll=await evaluate(`(()=>{document.documentElement.style.overflow='auto';document.body.style.minHeight='1200px';scrollTo(0,180);return new Promise(resolve=>requestAnimationFrame(()=>resolve(scrollY)))})()`);
        assert.ok(preScroll>0,`reward-3:scroll precondition=${preScroll}`);
      }
      await evaluate("document.getElementById('startButton').click()");
      await evaluate(`document.querySelector('[data-stage="${level.id}"]').click()`);
      await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
      if(level.id==='normal-10'){
        const crownPath=pathTo(level,{x:Math.floor(level.rows[0].length/2),y:1});
        await evaluate(`(async()=>{for(const direction of ${JSON.stringify(crownPath)}){const canvas=document.getElementById('mazeCanvas'),rect=canvas.getBoundingClientRect(),start={x:rect.left+rect.width/2,y:rect.top+rect.height/2},delta={up:[0,-42],down:[0,42],left:[-42,0],right:[42,0]}[direction],init={bubbles:true,cancelable:true,pointerId:1,isPrimary:true,button:0,pointerType:'touch'};canvas.dispatchEvent(new PointerEvent('pointerdown',{...init,clientX:start.x,clientY:start.y}));canvas.dispatchEvent(new PointerEvent('pointermove',{...init,clientX:start.x+delta[0],clientY:start.y+delta[1]}));canvas.dispatchEvent(new PointerEvent('pointerup',{...init,clientX:start.x+delta[0],clientY:start.y+delta[1]}));await new Promise(resolve=>requestAnimationFrame(resolve))}})()`);
        await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
        assert.equal(await evaluate("Number(document.getElementById('stepCount').textContent)"),crownPath.length,'normal-10:crown screenshot framing');
      }
      assert.equal(await evaluate('typeof globalThis.__crownMazeDiagnostics'),'object',`${level.id}:diagnostics exposure`);
      const result=await evaluate(`(()=>{
        const canvas=document.getElementById('mazeCanvas');
        const diagnostics=globalThis.__crownMazeDiagnostics;
        const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
        const nonEmpty=${canvasRgbCheck}(pixels);
        const rectFor=id=>{const rect=document.getElementById(id).getBoundingClientRect();return{top:rect.top,bottom:rect.bottom}};
        return {
          stage:document.body.dataset.stage,width:canvas.width,height:canvas.height,nonEmpty,
          noOverflow:document.documentElement.scrollWidth<=innerWidth,scrollY,
          topControl:rectFor('backToMapButton'),bottomControl:rectFor('gestureGuide'),
          wallBuilds:diagnostics.wallModelBuilds,trails:diagnostics.trailCount,actors:diagnostics.actorCount,
          scene:diagnostics.sceneId,paints:diagnostics.paintSignatures
        };
      })()`);
      assert.equal(result.stage,level.id);
      const profile=sceneProfileFor(level);
      assert.equal(result.scene,profile.id);
      assert.equal(result.wallBuilds,1);
      assert.ok(result.width>0&&result.height>0,`${level.id}:canvas dimensions`);
      assert.equal(result.nonEmpty,true,`${level.id}:canvas pixels`);
      assert.equal(result.noOverflow,true,`${level.id}:horizontal overflow`);
      assert.equal(result.scrollY,0,`${level.id}:window scroll reset`);
      assert.ok(result.topControl.top>=0&&result.topControl.bottom<=844,`${level.id}:top control ${JSON.stringify(result.topControl)}`);
      assert.ok(result.bottomControl.top>=0&&result.bottomControl.bottom<=844,`${level.id}:bottom control ${JSON.stringify(result.bottomControl)}`);
      assert.ok(result.trails<=72,`${level.id}:trails=${result.trails}`);
      if(level.id==='normal-10')assert.ok(result.trails>0,`${level.id}:walking trails=${result.trails}`);
      assert.ok(result.actors<=96,`${level.id}:actors=${result.actors}`);
      assert.equal(new Set(result.paints).size,result.paints.length,`${level.id}:unique paint signatures`);
      assert.ok(result.paints.length<=32,`${level.id}:paint signatures=${result.paints.length}`);
      metrics.push({stage:level.id,trails:result.trails,actors:result.actors});
      for(const [field,enabled] of Object.entries(profile))if(enabled===true)assert.ok(result.paints.includes(field),`${level.id}:${field}`);
      const screenshotPositions=new Map([[1,'/tmp/crown-theme-1.png'],[6,'/tmp/crown-theme-6.png'],[11,'/tmp/crown-theme-11.png'],[19,'/tmp/crown-theme-19.png']]);
      const screenshotPath=process.env.CROWN_SCREENSHOT&&levels.length===1?process.env.CROWN_SCREENSHOT:screenshotPositions.get(ordinal);
      if(screenshotPath){const shot=await cdp.call('Page.captureScreenshot',{format:'png',fromSurface:true});await writeFile(screenshotPath,Buffer.from(shot.data,'base64'))}
    }
    const failures=cdp.events.filter(event=>event.method==='Runtime.exceptionThrown'||(event.method==='Runtime.consoleAPICalled'&&event.params.type==='error'));
    assert.deepEqual(failures,[]);
    t.diagnostic(`${metrics.length} stages; max trails=${Math.max(...metrics.map(entry=>entry.trails))}; max actors=${Math.max(...metrics.map(entry=>entry.actors))}; browser errors=${failures.length}`);
  }finally{
    cdp?.close();chrome.kill('SIGTERM');server?.kill('SIGTERM');
  }
});
