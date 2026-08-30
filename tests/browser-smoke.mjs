import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { LEVELS, getLevel } from '../maze/levels.js';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const DIRECTIONS = [['up',0,-1],['down',0,1],['left',-1,0],['right',1,0]];
const DELTAS = Object.fromEntries(DIRECTIONS.map(([name,dx,dy])=>[name,[dx,dy]]));
const DEVICES = [
  { name:'phone portrait',width:390,height:844,dpr:2,mobile:true,pointerType:'touch',insets:{top:0,left:0,bottom:0,right:0},screenshot:'/tmp/crown-gesture-phone.png' },
  { name:'phone landscape notch',width:844,height:390,dpr:2,mobile:true,pointerType:'touch',insets:{top:0,left:47,bottom:21,right:47},screenshot:'/tmp/crown-gesture-landscape.png' },
  { name:'tablet portrait',width:820,height:1180,dpr:2,mobile:true,pointerType:'pen',insets:{top:0,left:0,bottom:0,right:0},screenshot:'/tmp/crown-gesture-tablet.png' },
  { name:'desktop',width:1440,height:900,dpr:1,mobile:false,pointerType:'mouse',insets:{top:0,left:0,bottom:0,right:0},screenshot:'/tmp/crown-gesture-desktop.png' }
];

function solutionFor(level) {
  const keyIndex = new Map(level.keys.map((key, index) => [`${key.x},${key.y}`, index]));
  const allKeys = (1 << level.keys.length) - 1;
  const queue = [{ ...level.start, mask: 0, path: [] }], seen = new Set([`${level.start.x},${level.start.y}|0`]);
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const node = queue[cursor];
    if (node.x === level.exit.x && node.y === level.exit.y && node.mask === allKeys) return node.path;
    for (const [name, dx, dy] of DIRECTIONS) {
      const x = node.x + dx, y = node.y + dy;
      if (level.rows[y]?.[x] !== '.') continue;
      const key = keyIndex.get(`${x},${y}`), mask = key === undefined ? node.mask : node.mask | (1 << key), signature = `${x},${y}|${mask}`;
      if (!seen.has(signature)) { seen.add(signature); queue.push({ x, y, mask, path: [...node.path, name] }); }
    }
  }
  throw new Error('No browser solution');
}

function pathsFromStart(level){
  const exit=`${level.exit.x},${level.exit.y}`,queue=[{...level.start,path:[]}],paths=new Map([[`${level.start.x},${level.start.y}`,[]]]);
  for(let cursor=0;cursor<queue.length;cursor++){
    const node=queue[cursor];
    for(const [name,dx,dy] of DIRECTIONS){
      const x=node.x+dx,y=node.y+dy,key=`${x},${y}`;
      if(level.rows[y]?.[x]!=='.'||key===exit||paths.has(key))continue;
      const path=[...node.path,name];paths.set(key,path);queue.push({x,y,path});
    }
  }
  return paths;
}

function toolPlansFor(level){
  const paths=pathsFromStart(level);
  let dynamite=null,hook=null;
  for(const wall of level.breakableWalls){
    for(const [direction,dx,dy] of DIRECTIONS){
      const origin={x:wall.x-dx,y:wall.y-dy},path=paths.get(`${origin.x},${origin.y}`);
      if(path&&(!dynamite||path.length<dynamite.path.length))dynamite={path,direction};
    }
  }
  for(const [key,path] of paths){
    const [x,y]=key.split(',').map(Number);
    for(const [direction,dx,dy] of DIRECTIONS){
      let walls=0;
      for(let distance=1;distance<=3;distance++){
        const targetX=x+dx*distance,targetY=y+dy*distance,target=level.rows[targetY]?.[targetX];
        if(target==='#'){walls++;if(walls>2)break;continue}
        if(target==='.'&&walls>0&&`${targetX},${targetY}`!==`${level.exit.x},${level.exit.y}`)hook={path,direction};
        break;
      }
      if(hook)break;
    }
    if(hook)break;
  }
  assert.ok(dynamite,'dynamite browser plan');assert.ok(hook,'hook browser plan');
  return {dynamite,hook};
}

async function waitFor(url, attempts = 80) {
  for (let index = 0; index < attempts; index++) {
    try { const response = await fetch(url); if (response.ok) return response; } catch {}
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

class Cdp {
  constructor(url) {
    this.socket = new WebSocket(url); this.nextId = 1; this.pending = new Map(); this.events = [];
    this.ready = new Promise((resolve, reject) => { this.socket.onopen = resolve; this.socket.onerror = reject; });
    this.socket.onmessage = message => {
      const payload = JSON.parse(message.data);
      if (payload.id) { const promise = this.pending.get(payload.id); this.pending.delete(payload.id); payload.error ? promise.reject(new Error(payload.error.message)) : promise.resolve(payload.result); }
      else this.events.push(payload);
    };
  }
  async call(method, params = {}) {
    await this.ready; const id = this.nextId++;
    const result = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.socket.send(JSON.stringify({ id, method, params })); return result;
  }
  close() { this.socket.close(); }
}

test('real phone, tablet and desktop input reaches a stage without zoom or browser errors', { timeout: 90000 }, async () => {
  const stageId = process.env.CROWN_STAGE_ID || 'normal-1', level = getLevel(stageId);
  assert.ok(level, `Unknown CROWN_STAGE_ID: ${stageId}`);
  const baseUrl = process.env.CROWN_BASE_URL || 'http://127.0.0.1:4174';
  const server = process.env.CROWN_BASE_URL ? null : spawn('python3', ['-m', 'http.server', '4174', '--bind', '127.0.0.1'], { cwd: new URL('..', import.meta.url), stdio: 'ignore' });
  const chrome = spawn('chromium-browser', [
    '--headless', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=9234',
    '--user-data-dir=/home/ubuntu/snap/chromium/common/crown-maze-cdp', 'about:blank'
  ], { stdio: 'ignore' });
  let cdp;
  try {
    await waitFor(`${baseUrl}/games/maze.html`);
    const tabs = await (await waitFor('http://127.0.0.1:9234/json')).json();
    cdp = new Cdp(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
    await cdp.call('Runtime.enable'); await cdp.call('Page.enable'); await cdp.call('Network.enable'); await cdp.call('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.call('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
    await cdp.call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await cdp.call('Page.navigate', { url: `${baseUrl}/games/maze.html?v=202608291449&diagnostics=1` });
    for (let index = 0; index < 80; index++) {
      const state = await cdp.call('Runtime.evaluate', { expression: 'document.readyState', returnByValue: true });
      if (state.result.value === 'complete') break; await sleep(100);
    }
    const evaluate = async expression => (await cdp.call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value;
    const position = LEVELS.findIndex(candidate => candidate.id === stageId);
    const isolatedSave = { version:1, coins:0, inventory:{dynamite:2,hook:2}, ownedSkins:['red'], equippedSkin:'red', collectedCoinIds:[], completedNormal:[], bestStars:{}, bestSteps:{}, unlockedNormal:level.type==='normal'?level.index:1, journeyPosition:position };
    await evaluate(`localStorage.setItem('crown-maze-save-v1',${JSON.stringify(JSON.stringify(isolatedSave))});location.reload()`);
    for (let index = 0; index < 80; index++) {
      if (await evaluate('document.readyState') === 'complete') break; await sleep(100);
    }
    assert.equal(await evaluate('document.body.dataset.screen'), 'home');
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
    await evaluate("document.getElementById('shopButton').click()");
    assert.equal(await evaluate('document.body.dataset.screen'), 'shop');
    assert.equal(await evaluate("document.querySelectorAll('.shop-card').length"), 2);
    await evaluate("document.querySelector('[data-back=home]').click()");
    await evaluate("document.getElementById('startButton').click()");
    assert.equal(await evaluate('document.body.dataset.screen'), 'map');
    assert.equal(await evaluate("document.querySelectorAll('.stage-node').length"), 19);
    await evaluate(`document.querySelector('[data-stage=${stageId}]').click()`);
    await sleep(250);
    assert.equal(await evaluate('document.body.dataset.screen'), 'game');
    assert.equal(await evaluate('document.body.dataset.stage'), stageId);
    assert.equal(await evaluate("document.getElementById('keyRack').children.length"), level.keys.length);
    assert.equal(await evaluate("document.getElementById('mazeCanvas').width > 0"), true);
    assert.equal(await evaluate("document.getElementById('dpad')===null"),true);
    assert.equal(await evaluate("document.getElementById('joystick')!==null"),true);
    const solution = solutionFor(level);
    const canvasCenter=()=>evaluate(`(()=>{const rect=document.getElementById('mazeCanvas').getBoundingClientRect();return{x:rect.left+rect.width/2,y:rect.top+rect.height/2}})()`);
    const joystickPoint=direction=>evaluate(`(()=>{const rect=document.getElementById('joystick').getBoundingClientRect(),delta=${JSON.stringify(DELTAS)}['${direction}'];return{x:rect.left+rect.width/2+delta[0]*rect.width*.3,y:rect.top+rect.height/2+delta[1]*rect.height*.3}})()`);
    const realJoystick=async(direction,pointerType='touch',holdMs=0)=>{
      const point=await joystickPoint(direction);
      if(pointerType==='touch'){
        await cdp.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,id:1,radiusX:1,radiusY:1,force:1}]});
        if(holdMs)await sleep(holdMs);
        await cdp.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      }else{
        await cdp.call('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',buttons:1,clickCount:1,pointerType});
        if(holdMs)await sleep(holdMs);
        await cdp.call('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',buttons:0,clickCount:1,pointerType});
      }
    };
    const realJoystickVector=async(dxRatio,dyRatio,pointerType='touch',holdMs=0)=>{
      const point=await evaluate(`(()=>{const rect=document.getElementById('joystick').getBoundingClientRect();return{x:rect.left+rect.width*(.5+${dxRatio}),y:rect.top+rect.height*(.5+${dyRatio})}})()`);
      if(pointerType==='touch'){
        await cdp.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,id:1,radiusX:1,radiusY:1,force:1}]});
        if(holdMs)await sleep(holdMs);
        await cdp.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      }else{
        await cdp.call('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',buttons:1,clickCount:1,pointerType});
        if(holdMs)await sleep(holdMs);
        await cdp.call('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',buttons:0,clickCount:1,pointerType});
      }
    };
    const realTap=async()=>{
      const point=await canvasCenter();
      await cdp.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,id:1,radiusX:1,radiusY:1,force:1}]});
      await cdp.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    };
    const realPinch=async()=>{
      const center=await canvasCenter(),first={x:center.x-18,y:center.y,id:1,radiusX:1,radiusY:1,force:1},second={x:center.x+18,y:center.y,id:2,radiusX:1,radiusY:1,force:1};
      await cdp.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[first,second]});
      await cdp.call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...first,x:first.x-48},{...second,x:second.x+48}]});
      await cdp.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    };
    const realSecondPointerCancel=async direction=>{
      const joystick=await joystickPoint(direction),outside=await canvasCenter();
      const first={...joystick,id:1,radiusX:1,radiusY:1,force:1},second={...outside,id:2,radiusX:1,radiusY:1,force:1};
      await cdp.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[first]});
      await sleep(40);
      await cdp.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[first,second]});
      await sleep(180);
      await cdp.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    };
    const resetStage=async()=>{
      const reset=JSON.parse(await evaluate(`JSON.stringify((()=>{document.getElementById('backToMapButton').click();const node=document.querySelector('.stage-node[data-stage="${stageId}"]');if(!node)return{found:false,screen:document.body.dataset.screen};node.click();return{found:true,disabled:node.disabled,screen:document.body.dataset.screen,stage:document.body.dataset.stage}})())`));
      assert.equal(reset.found,true,'reset stage node exists');
      assert.equal(reset.disabled,false,'reset stage remains available');
      assert.equal(reset.screen,'game','reset stage re-enters the game');
      await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    };
    if(stageId==='normal-1'){
      const plans=toolPlansFor(level);
      await evaluate("document.getElementById('dynamiteButton').click()");
      await realJoystick('up','touch');
      assert.equal(await evaluate("document.getElementById('dynamiteCount').textContent"),'2','invalid dynamite is not consumed');
      assert.equal(await evaluate("document.getElementById('dynamiteButton').classList.contains('selected')"),true,'invalid dynamite stays selected');
      assert.equal(await evaluate("document.getElementById('stepCount').textContent"),'0','invalid dynamite does not move');
      await evaluate("document.getElementById('dynamiteButton').click();document.getElementById('hookButton').click()");
      for(const direction of plans.hook.path)await realJoystick(direction,'touch');
      await realJoystick(plans.hook.direction,'touch',240);
      assert.equal(await evaluate("document.getElementById('hookCount').textContent"),'1','valid hook consumes exactly one');
      assert.equal(await evaluate("document.getElementById('hookButton').classList.contains('selected')"),false,'valid hook clears selection');
      assert.equal(await evaluate("document.getElementById('stepCount').textContent"),String(plans.hook.path.length+1),'hook counts one move');
      await resetStage();
      for(const direction of plans.dynamite.path)await realJoystick(direction,'touch');
      assert.equal(await evaluate("document.getElementById('stepCount').textContent"),String(plans.dynamite.path.length),'dynamite setup reaches the planned wall');
      await evaluate("document.getElementById('dynamiteButton').click()");
      await realJoystick(plans.dynamite.direction,'touch',240);
      assert.equal(await evaluate("document.getElementById('dynamiteCount').textContent"),'1','valid dynamite consumes exactly one');
      assert.equal(await evaluate("document.getElementById('dynamiteButton').classList.contains('selected')"),false,'valid dynamite clears selection');
      assert.equal(await evaluate("document.getElementById('stepCount').textContent"),String(plans.dynamite.path.length),'dynamite does not count a move');
      await resetStage();
    }
    for(let index=0;index<5;index++)await realJoystick('down','touch');
    await realJoystickVector(.18,.35,'touch',260);
    const junctionSteps=Number(await evaluate("document.getElementById('stepCount').textContent"));
    assert.ok(junctionSteps>=7,'a held diagonal pre-turns right at the first opening after six downward cells');
    await sleep(180);
    assert.equal(Number(await evaluate("document.getElementById('stepCount').textContent")),junctionSteps,'release clears the queued turn and repeat timer');
    await resetStage();
    const heldDirections=solution.slice(0,2);
    assert.equal(new Set(heldDirections).size,1,'browser fixture starts with a continuous corridor');
    await realJoystick(heldDirections[0],'touch',130);
    assert.equal(await evaluate("document.getElementById('stepCount').textContent"),'2','one held joystick direction makes consecutive moves');
    const runtimeDiagnostics=await evaluate('globalThis.__crownMazeDiagnostics');
    assert.equal(runtimeDiagnostics.audio.unlocked,true,'trusted gesture unlocks the shared audio controller');
    assert.equal(runtimeDiagnostics.audio.musicActive,true,'background music remains active beside effects');
    assert.ok(runtimeDiagnostics.audio.decodedEffects>=1,'at least one recorded effect is decoded');
    assert.equal(runtimeDiagnostics.frames.targetFps,30,'phone rendering is capped at 30 fps');
    await resetStage();
    await realSecondPointerCancel(heldDirections[0]);
    assert.equal(await evaluate("document.getElementById('stepCount').textContent"),'1','a second pointer outside the joystick cancels hold-repeat');
    await resetStage();
    const accessiblePanel=await evaluate(`(()=>{
      const panel=document.getElementById('accessibleDirections'),button=document.querySelector('[data-access-direction=${solution[0]}]');
      button.focus();const rect=panel.getBoundingClientRect();
      return{width:rect.width,height:rect.height,visibility:getComputedStyle(panel).visibility};
    })()`);
    assert.ok(accessiblePanel.width>200,'keyboard focus reveals accessible direction controls');
    assert.ok(accessiblePanel.height>=44,'revealed accessible controls have a usable height');
    assert.equal(accessiblePanel.visibility,'visible','revealed accessible controls are visible');
    await evaluate(`document.querySelector('[data-access-direction=${solution[0]}]').click()`);
    assert.equal(await evaluate("document.getElementById('stepCount').textContent"),'1','accessible direction control moves');
    await evaluate('document.activeElement.blur()');
    await resetStage();
    let stepIndex=0;
    for(const device of DEVICES){
      await cdp.call('Emulation.setTouchEmulationEnabled',{enabled:device.mobile,maxTouchPoints:device.mobile?5:1});
      await cdp.call('Emulation.setSafeAreaInsetsOverride',{insets:device.insets});
      await cdp.call('Emulation.setDeviceMetricsOverride',{width:device.width,height:device.height,deviceScaleFactor:device.dpr,mobile:device.mobile});
      await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
      const layout=await evaluate(`(()=>{
        const canvas=document.getElementById('mazeCanvas'),joystick=document.getElementById('joystick'),title=document.querySelector('.stage-title h2'),keys=document.querySelector('.key-panel');
        const canvasRect=canvas.getBoundingClientRect(),joystickRect=joystick.getBoundingClientRect(),titleRect=title.getBoundingClientRect(),keyRect=keys.getBoundingClientRect();
        const toolRects=[...document.querySelectorAll('.item-button')].map(button=>button.getBoundingClientRect());
        return {width:innerWidth,height:innerHeight,scale:visualViewport?.scale||1,noOverflow:document.documentElement.scrollWidth<=innerWidth,
          canvasVisible:canvasRect.width>0&&canvasRect.height>100,joystickVisible:joystickRect.top>=canvasRect.bottom&&joystickRect.bottom<=innerHeight,
          toolsVisible:toolRects.every(rect=>rect.top>=0&&rect.bottom<=innerHeight),titleClear:titleRect.bottom<=keyRect.top,titleBottom:titleRect.bottom,keyTop:keyRect.top,
          canvasLeft:canvasRect.left,canvasRight:canvasRect.right,
          safeHorizontal:canvasRect.left>=${device.insets.left}&&canvasRect.right<=innerWidth-${device.insets.right},
          safeBottom:Math.max(joystickRect.bottom,...toolRects.map(rect=>rect.bottom))<=innerHeight-${device.insets.bottom},
          label:document.querySelector('.joystick-copy b').textContent,canvasTouchAction:getComputedStyle(canvas).touchAction,joystickTouchAction:getComputedStyle(joystick).touchAction};
      })()`);
      assert.deepEqual({width:layout.width,height:layout.height},{width:device.width,height:device.height},device.name);
      assert.equal(layout.scale,1,`${device.name}:scale`);
      assert.equal(layout.noOverflow,true,`${device.name}:overflow`);
      assert.equal(layout.canvasVisible,true,`${device.name}:canvas`);
      assert.equal(layout.joystickVisible,true,`${device.name}:joystick remains below the canvas`);
      assert.equal(layout.toolsVisible,true,`${device.name}:tools`);
      assert.equal(layout.titleClear,true,`${device.name}:title ${layout.titleBottom} / keys ${layout.keyTop}`);
      assert.equal(layout.safeHorizontal,true,`${device.name}:horizontal safe area ${layout.canvasLeft}/${layout.canvasRight}`);
      assert.equal(layout.safeBottom,true,`${device.name}:bottom safe area`);
      assert.equal(layout.label,'虚拟摇杆',`${device.name}:input label`);
      assert.equal(layout.canvasTouchAction,'none',`${device.name}:canvas touch action`);
      assert.equal(layout.joystickTouchAction,'none',`${device.name}:joystick touch action`);
      assert.equal(await evaluate("getComputedStyle(document.body).userSelect"),'none',`${device.name}:body selection disabled`);
      assert.equal(await evaluate("getComputedStyle(document.getElementById('mazeCanvas')).userSelect"),'none',`${device.name}:canvas selection disabled`);
      if(device.pointerType==='touch'){
        const before=await evaluate("document.getElementById('stepCount').textContent");
        await realPinch();await realTap();await realTap();await sleep(180);
        assert.equal(await evaluate("document.getElementById('stepCount').textContent"),before,`${device.name}:pinch does not move`);
        assert.equal(await evaluate("visualViewport.scale"),1,`${device.name}:real pinch/double-tap scale`);
        assert.deepEqual(await evaluate("({x:scrollX,y:scrollY})"),{x:0,y:0},`${device.name}:real touch scroll`);
      }
      if(device.pointerType==='mouse'){
        const before=await evaluate("document.getElementById('stepCount').textContent"),start=await evaluate(`(()=>{const rect=document.getElementById('joystick').getBoundingClientRect();return{x:rect.left+rect.width/2,y:rect.top+rect.height/2}})()`);
        await evaluate("document.getElementById('joystick').setPointerCapture=()=>{throw new Error('capture unavailable')}");
        await cdp.call('Input.dispatchMouseEvent',{type:'mousePressed',...start,button:'left',buttons:1,clickCount:1,pointerType:'mouse'});
        await cdp.call('Input.dispatchMouseEvent',{type:'mouseReleased',x:2,y:2,button:'left',buttons:0,clickCount:1,pointerType:'mouse'});
        await evaluate("delete document.getElementById('joystick').setPointerCapture");
        assert.equal(await evaluate("document.getElementById('stepCount').textContent"),before,`${device.name}:outside release does not move`);
        const textDrag=await evaluate(`(()=>{const rect=document.querySelector('.key-panel').getBoundingClientRect();return{start:{x:rect.left+8,y:rect.top+rect.height/2},end:{x:rect.right-8,y:rect.top+rect.height/2}}})()`);
        await cdp.call('Input.dispatchMouseEvent',{type:'mousePressed',...textDrag.start,button:'left',buttons:1,clickCount:1,pointerType:'mouse'});
        await cdp.call('Input.dispatchMouseEvent',{type:'mouseMoved',...textDrag.end,button:'none',buttons:1,pointerType:'mouse'});
        await cdp.call('Input.dispatchMouseEvent',{type:'mouseReleased',...textDrag.end,button:'left',buttons:0,clickCount:1,pointerType:'mouse'});
      }
      if(device.name==='phone portrait'||device.name==='tablet portrait'){
        await resetStage();
        for(let index=0;index<5;index++)await realJoystick('down',device.pointerType);
        await realJoystickVector(.18,.35,device.pointerType,260);
        const deviceJunctionSteps=Number(await evaluate("document.getElementById('stepCount').textContent"));
        assert.ok(deviceJunctionSteps>=7,`${device.name}:normalized diagonal pre-turns at the same junction`);
        await sleep(180);
        assert.equal(Number(await evaluate("document.getElementById('stepCount').textContent")),deviceJunctionSteps,`${device.name}:release stops buffered movement`);
        await resetStage();
        stepIndex=0;
      }
      await realJoystick(solution[stepIndex],device.pointerType);stepIndex+=1;
      assert.equal(await evaluate("Number(document.getElementById('stepCount').textContent)"),stepIndex,`${device.name}:joystick step`);
      assert.equal(await evaluate("getSelection().toString()"),'',`${device.name}:joystick leaves no browser selection`);
      const deviceShot=await cdp.call('Page.captureScreenshot',{format:'png',fromSurface:true});
      await writeFile(device.screenshot,Buffer.from(deviceShot.data,'base64'));
    }
    if (process.env.CROWN_SCREENSHOT) {
      const shot = await cdp.call('Page.captureScreenshot', { format: 'png', fromSurface: true });
      await writeFile(process.env.CROWN_SCREENSHOT, Buffer.from(shot.data, 'base64'));
    }
    for (const direction of solution.slice(stepIndex)) await realJoystick(direction,'mouse');
    await sleep(600);
    assert.equal(await evaluate('document.body.dataset.screen'), 'result');
    assert.equal(await evaluate(`Object.hasOwn(JSON.parse(localStorage.getItem('crown-maze-save-v1')).bestStars,'${stageId}')`), true);
    const failures = cdp.events.filter(event => event.method === 'Runtime.exceptionThrown' || (event.method === 'Runtime.consoleAPICalled' && event.params.type === 'error'));
    assert.deepEqual(failures, []);
  } finally {
    cdp?.close(); chrome.kill('SIGTERM'); server?.kill('SIGTERM');
  }
});
