import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {openBrowser,sleep} from './game-browser-harness.mjs';

const artifacts='/tmp/parkour-creations';
async function wait(b,expression,timeout=15000){const end=Date.now()+timeout;while(Date.now()<end){try{const result=await b.evaluate(expression);if(result)return result}catch(error){if(!/Inspected target navigated or closed|Execution context was destroyed|Cannot find context with specified id/.test(error.message))throw error}await sleep(50)}throw new Error(`Timed out: ${expression}; ${await b.evaluate('document.body.innerText.slice(-1500)')}`)}
async function click(b,selector){const p=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);assert.ok(p,`visible control ${selector}`);await mouse(b,p.x,p.y)}
async function mouse(b,x,y,count=1){await b.call('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:count});await b.call('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:count})}
async function key(b,key,down=true,modifiers=0){await b.call('Input.dispatchKeyEvent',{type:down?'keyDown':'keyUp',key,code:key,modifiers,windowsVirtualKeyCode:({ArrowUp:38,Space:32,Enter:13,Tab:9,KeyA:65}[key]||0)})}
async function input(b,selector,text){await click(b,selector);await key(b,'KeyA',true,2);await key(b,'KeyA',false,2);await b.call('Input.insertText',{text:String(text)});await key(b,'Tab');await key(b,'Tab',false)}
async function point(b,x,z,touch=false){const p=await b.evaluate(`(()=>{const r=document.querySelector('#editor-map').getBoundingClientRect();return {x:r.x+r.width/2+(${x}-2.5)*23,y:r.y+r.height/2+${z}*23}})()`);if(touch){await b.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:1}]});await b.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}else await mouse(b,p.x,p.y);}
async function doublePoint(b,x,z,touch=false){const p=await b.evaluate(`(()=>{const r=document.querySelector('#editor-map').getBoundingClientRect();return {x:r.x+r.width/2+(${x}-2.5)*23,y:r.y+r.height/2+${z}*23}})()`);const timestamp=Date.now()/1000;await Promise.all([0,1,2,3].map(i=>touch?b.call('Input.dispatchTouchEvent',{type:i%2?'touchEnd':'touchStart',touchPoints:i%2?[]:[{...p,id:1}],timestamp:timestamp+i*.055}):b.call('Input.dispatchMouseEvent',{type:i%2?'mouseReleased':'mousePressed',...p,button:'left',clickCount:i<2?1:2,timestamp:timestamp+i*.055})));}
async function shot(b,name){await mkdir(artifacts,{recursive:true});const r=await b.call('Page.captureScreenshot',{format:'png'});await writeFile(`${artifacts}/${name}.png`,Buffer.from(r.data,'base64'))}
async function boot(b){await b.size(1440,900);await b.navigate('games/parkour.html');await wait(b,'document.body.dataset.ready === "true"')}
const library='JSON.parse(localStorage.getItem("glow-parkour-routes-v1"))';

test('native mouse dblclick honors a 450ms interval and removes only one overlapping platform', {timeout:60000},async()=>{
 const b=await openBrowser();try{await boot(b);await click(b,'#editor');
 await b.evaluate('window.nativeDoubleClicks=0;document.querySelector("#editor-map").addEventListener("dblclick",e=>{if(e.isTrusted)nativeDoubleClicks++})');
 const p=await b.evaluate('(()=>{const r=document.querySelector("#editor-map").getBoundingClientRect();return {x:r.x+r.width/2+57.5,y:r.y+r.height/2}})()');
 await mouse(b,p.x,p.y);await sleep(450);await mouse(b,p.x,p.y,2);
 assert.equal(await b.evaluate('nativeDoubleClicks'),1,'browser dispatched one real dblclick');assert.match(await b.evaluate('document.querySelector("#platform-count").textContent'),/^1 /,'native dblclick deletes even above the touch interval');
 await click(b,'#editor-new');await point(b,5,0);await input(b,'#platform-x',0);await doublePoint(b,0,0);assert.match(await b.evaluate('document.querySelector("#platform-count").textContent'),/^1 /,'one mouse gesture deletes only top overlapping platform');
 await click(b,'#editor-new');await point(b,5,0);await input(b,'#platform-x',0);await b.size(820,1180,true);await doublePoint(b,0,0,true);assert.match(await b.evaluate('document.querySelector("#platform-count").textContent'),/^1 /,'touch compatibility mouse events cannot delete underlying platform');assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});

for(const exitTarget of ['pause-home','restart']) test(`native completion exit via ${exitTarget} stops pending finish voices`, {timeout:60000},async()=>{
 const b=await openBrowser();try{
 await b.call('Page.addScriptToEvaluateOnNewDocument',{source:`window.audioVoices=[];window.audioContexts=[];const Native=window.AudioContext;window.AudioContext=class extends Native{constructor(...args){super(...args);audioContexts.push(this)}createOscillator(){const osc=super.createOscillator(),voice={stops:[]};audioVoices.push(voice);const set=osc.frequency.setValueAtTime.bind(osc.frequency),stop=osc.stop.bind(osc);osc.frequency.setValueAtTime=(value,time)=>{voice.frequency=value;return set(value,time)};osc.stop=at=>{voice.stops.push({at:at??null,now:this.currentTime});return stop(at)};return osc}}`});
 await boot(b);await click(b,'#editor');await click(b,'[data-tool=goal]');await point(b,1.5,0);
 b.on('Runtime.consoleAPICalled',event=>{if(event.args[0]?.value==='native-finish-exit'){const p=JSON.parse(event.args[1].value);void Promise.all(['mousePressed','mouseReleased'].map(type=>b.call('Input.dispatchMouseEvent',{type,...p,button:'left',clickCount:1})))}});
 // Suspend the real native context at completion so slow CDP machines cannot
 // let every scheduled note end before the native exit click arrives.
 await b.evaluate(`window.exitAt=null;document.addEventListener('click',e=>{if(e.target.closest('#${exitTarget}')&&e.isTrusted)window.exitAt=audioContexts[0].currentTime},{capture:true});new MutationObserver(()=>{if(document.body.dataset.mode==='complete'&&!window.exitRequested){window.exitRequested=true;const r=document.querySelector('#${exitTarget}').getBoundingClientRect();audioContexts[0].suspend().then(()=>console.log('native-finish-exit',JSON.stringify({x:r.x+r.width/2,y:r.y+r.height/2})))}}).observe(document.body,{attributes:true,attributeFilter:['data-mode']})`);
 await click(b,'#editor-play');await wait(b,'audioContexts[0].state === "running"');await key(b,'ArrowUp');await wait(b,'window.exitAt !== null');await key(b,'ArrowUp',false);
 const pending=await b.evaluate('audioVoices.filter(v=>[523.25,659.25,783.99].includes(v.frequency)&&v.stops[0]?.at>exitAt).map(v=>({frequency:v.frequency,stops:v.stops,exitAt}))');
 assert.ok(pending.length>0,`native exit before notes ended: ${JSON.stringify(await b.evaluate('({voices:audioVoices,exitAt,context:audioContexts.map(c=>({state:c.state,time:c.currentTime}))})'))}`);assert.ok(pending.every(v=>v.stops.some(s=>s.at===null)),`leaving completion cancels every pending voice: ${JSON.stringify(pending)}`);assert.equal(await b.evaluate('document.querySelector("#celebration").hidden'),true);assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});

test('explicit hall links and native double deletion retain empty draft across refresh', {timeout:90000},async()=>{
 const b=await openBrowser();try{await boot(b);assert.equal(await b.evaluate('document.querySelector("#home-hall")?.textContent.trim()'),'回到小火箭游戏厅');await click(b,'#editor');
 await doublePoint(b,5,0);await doublePoint(b,0,0);
 assert.match(await b.evaluate('document.querySelector("#platform-count").textContent'),/^0 /);
 await click(b,'#editor-close');await b.navigate('games/parkour.html');await wait(b,'document.body.dataset.ready === "true"');await click(b,'#editor');assert.match(await b.evaluate('document.querySelector("#platform-count").textContent'),/^0 /);
 for(const [w,h] of [[320,568],[568,320],[390,844],[844,390],[820,1180],[1180,820],[1440,900]]){await b.size(w,h,true);assert.equal(await b.evaluate('document.documentElement.scrollWidth>innerWidth'),false);const r=await b.evaluate('(()=>{const e=document.querySelector("#editor-hall");e.scrollIntoView();const r=e.getBoundingClientRect(),s=document.querySelector("#status").getBoundingClientRect();return {w:r.width,h:r.height,covered:s.width>0&&s.height>0&&s.left<r.right&&s.right>r.left&&s.top<r.bottom&&s.bottom>r.top}})()');assert.ok(r.w>=48&&r.h>=48);assert.equal(r.covered,false,'inline editor feedback must not obscure hall control');await shot(b,`editor-${w}x${h}`)}
 await click(b,'#editor-hall');await wait(b,'location.pathname.endsWith("/index.html") && document.readyState === "complete" && document.querySelector("a[href*=parkour]") && window.GAMES?.length === document.querySelectorAll(".card").length');assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});

test('two native saved routes, powerups, real completion wallet and paid skin persist', {timeout:180000},async()=>{
 const b=await openBrowser();try{
 await b.call('Page.addScriptToEvaluateOnNewDocument',{source:`window.audioVoices=[];window.audioContexts=[];const Native=window.AudioContext;window.AudioContext=class extends Native{constructor(...args){super(...args);audioContexts.push(this)}createOscillator(){const osc=super.createOscillator(),voice={};audioVoices.push(voice);const set=osc.frequency.setValueAtTime.bind(osc.frequency);osc.frequency.setValueAtTime=(value,time)=>{voice.frequency=value;voice.start=time;return set(value,time)};osc.addEventListener('ended',()=>voice.ended=true);return osc}}`});
 await boot(b);await click(b,'#editor');
 assert.ok(await b.evaluate('document.querySelector("[data-tool=speed]") && document.querySelector("[data-tool=jump]")'),'speed and jump tools');
 // One supported runway, built only through native inputs.
 await point(b,5,0);await click(b,'#platform-delete');await point(b,0,0);await input(b,'#platform-w',20);
 await click(b,'[data-tool=goal]');await point(b,7,0);
 for(const [tool,x] of [['coin',1],['coin',3],['speed',2],['jump',4]]){await click(b,`[data-tool=${tool}]`);await point(b,x,0);await sleep(350)}
 await click(b,'#editor-save');assert.equal(await b.evaluate(`${library}.routes.length`),1);const first=await b.evaluate(`${library}.routes[0].id`);
 assert.equal(await b.evaluate(`${library}.routes[0].name`),'自创路线一');
 await click(b,'#editor-new');await click(b,'#editor-save');assert.equal(await b.evaluate(`${library}.routes.length`),2);assert.equal(await b.evaluate(`${library}.routes[1].name`),'自创路线二');
 await click(b,'#editor-close');await b.navigate('games/parkour.html');await wait(b,'document.body.dataset.ready === "true"');await click(b,'#start');assert.equal(await b.evaluate('document.querySelectorAll("[data-level]").length'),14);
 await click(b,`[data-level="${first}"]`);await key(b,'ArrowUp');await wait(b,'document.querySelector("#effect-status").textContent.includes("加速")');await click(b,'#pause');const frozen=await b.evaluate('view.dataset.x');await sleep(500);assert.equal(await b.evaluate('view.dataset.x'),frozen);await key(b,'ArrowUp',false);await click(b,'#resume');await key(b,'ArrowUp');await wait(b,'document.querySelector("#effect-status").textContent.includes("高跳")');await wait(b,'view.dataset.mode === "complete"');await key(b,'ArrowUp',false);
 assert.equal(await b.evaluate('coins.textContent'),'2');assert.match(await b.evaluate('document.querySelector("#pause-details").textContent'),/收集 2 枚/);assert.equal(await b.evaluate('document.querySelector("#celebration").hidden'),false);assert.equal(await b.evaluate('audioContexts[0].state'),'running');await shot(b,'native-finish');await sleep(3200);assert.equal(await b.evaluate('document.querySelector("#celebration").hidden'),true);
 const notes=await b.evaluate('audioVoices.filter(v=>[523.25,659.25,783.99].includes(v.frequency))');assert.deepEqual(notes.map(n=>n.frequency),[523.25,659.25,783.99]);assert.ok(notes.every(n=>n.ended));assert.ok(Math.abs(notes[2].start-notes[0].start-.4)<.01);console.log('native completed celebration notes',notes);
 await click(b,'#quit');assert.equal(await b.evaluate('document.body.dataset.mode'),'levels');await click(b,'#home-return');await click(b,'#shop');await click(b,'[data-skin=orange]');assert.equal(await b.evaluate('coins.textContent'),'0');await b.navigate('games/parkour.html');await wait(b,'document.body.dataset.ready === "true"');assert.equal(await b.evaluate('JSON.parse(localStorage.getItem("glow-parkour-v1")).equipped'),'orange');assert.equal(await b.evaluate(`${library}.routes.length`),2);assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});

test('native clear asks confirmation and touch double tap deletes one platform without tool side effects', {timeout:90000},async()=>{
 const b=await openBrowser();try{await boot(b);await b.size(820,1180,true);await click(b,'#editor');assert.equal(await b.evaluate('document.querySelector("#editor-clear").textContent'),'全部删除');assert.ok(await b.evaluate('(()=>{const r=document.querySelector("#editor-clear").getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})()'),'clear action visible on entry');
 await click(b,'[data-tool=coin]');await doublePoint(b,0,0,true);assert.match(await b.evaluate('document.querySelector("#platform-count").textContent'),/^1 /);
 await click(b,'#editor-clear');assert.equal(await b.evaluate('document.querySelector("#clear-confirm").hidden'),false);await click(b,'#clear-cancel');assert.match(await b.evaluate('document.querySelector("#platform-count").textContent'),/^1 /);await click(b,'#editor-clear');await click(b,'#clear-accept');assert.match(await b.evaluate('document.querySelector("#platform-count").textContent'),/^0 /);assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});

test('large saved route draws with bounded batches; failed update preserves previous work and draft', {timeout:120000},async()=>{
 const b=await openBrowser();try{await boot(b);
 // Fixture is limited to large-volume render/storage coverage; normal creation above is native.
 await b.evaluate(`(()=>{const id='a70fb52e-78d4-49f8-923c-d2f544f28133';const level={id,name:'Large route',custom:true,theme:'city',difficulty:1,tutorial:false,platforms:Array.from({length:1000},(_,i)=>({id:'p'+i,x:i*5,z:0,y:0,w:4,d:4,h:.6})),spawn:{x:0,y:0,z:0},goal:{x:4995,y:0,z:0},coins:[],checkpoints:[],powerups:[]};localStorage.setItem('glow-parkour-routes-v1',JSON.stringify({version:1,nextNumber:2,routes:[{id,name:level.name,level,updatedAt:1}],draft:null}))})()`);
 await b.navigate('games/parkour.html');await wait(b,'document.body.dataset.ready === "true"');await click(b,'#start');await click(b,'[data-level="a70fb52e-78d4-49f8-923c-d2f544f28133"]');await wait(b,'view.dataset.mode === "playing" && view.dataset.theme === "city"');await sleep(500);
 const rendered=await b.evaluate('({triangles:Number(view.dataset.triangles),calls:Number(view.dataset.drawCalls),resources:JSON.parse(view.dataset.resources)})');assert.ok(rendered.triangles>40000);assert.ok(rendered.calls<150);console.log('1000-platform actual draw',rendered);await shot(b,'large-route');await click(b,'#pause');await click(b,'#edit-current');
 await input(b,'#platform-x',6000);assert.equal(await b.evaluate('document.querySelector("#platform-x").value'),'6000');
 await input(b,'#editor-name','<img src=x onerror=alert(1)>');
 await b.evaluate('window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==="glow-parkour-routes-v1")throw new DOMException("Full","QuotaExceededError");return originalSet.call(this,k,v)}');
 await click(b,'#editor-save');assert.match(await b.evaluate('document.querySelector("#editor-feedback").textContent'),/保存失败/);assert.equal(await b.evaluate(`${library}.routes[0].name`),'Large route');assert.equal(await b.evaluate('document.querySelector("#editor-name").value'),'<img src=x onerror=alert(1)>');
 await b.evaluate('Storage.prototype.setItem=originalSet');await click(b,'#editor-save');assert.equal(await b.evaluate(`${library}.routes.length`),1);await click(b,'#editor-close');await click(b,'#start');assert.equal(await b.evaluate('document.querySelectorAll("#levels img").length'),0);assert.ok(await b.evaluate('document.querySelector("#levels").textContent.includes("<img src=x onerror=alert(1)>")'));assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});

for(const failedKey of ['glow-parkour-v1','glow-parkour-wardrobe-v1']) test(`real custom finish retries wallet transaction after ${failedKey} failure`, {timeout:120000},async()=>{
 const b=await openBrowser();try{await b.call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await boot(b);await click(b,'#mute');await click(b,'#editor');await point(b,5,0);await click(b,'#platform-delete');await point(b,0,0);await input(b,'#platform-w',20);await click(b,'[data-tool=goal]');await point(b,7,0);await click(b,'[data-tool=coin]');await point(b,2,0);await click(b,'#editor-save');
 await b.evaluate(`window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===${JSON.stringify(failedKey)})throw new DOMException('Full','QuotaExceededError');return originalSet.call(this,k,v)}`);
 await click(b,'#editor-play');await key(b,'ArrowUp');await wait(b,'view.dataset.mode === "complete"');await key(b,'ArrowUp',false);assert.equal(await b.evaluate('coins.textContent'),'0');assert.equal(await b.evaluate('document.querySelector("#retry-reward").hidden'),false);assert.equal(await b.evaluate('JSON.parse(localStorage.getItem("glow-parkour-v1")||"{}").coins||0'),0);
 assert.equal(await b.evaluate('document.querySelectorAll("#celebration i").length'),0,'reduced motion suppresses fireworks');assert.equal(await b.evaluate('mute.getAttribute("aria-pressed")'),'true');await b.evaluate('Storage.prototype.setItem=originalSet');await click(b,'#retry-reward');assert.equal(await b.evaluate('coins.textContent'),'1');assert.equal(await b.evaluate('document.querySelector("#retry-reward").hidden'),true);await click(b,'#quit');assert.equal(await b.evaluate('document.querySelector("#celebration").hidden'),true,'leaving completion cleans celebration');await b.navigate('games/parkour.html');await wait(b,'document.body.dataset.ready === "true"');assert.equal(await b.evaluate('coins.textContent'),'1');assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});

test('stale editor preserves a work written by another local tab when saving its draft', {timeout:60000},async()=>{
 const b=await openBrowser();try{await boot(b);await b.size(390,844,true);await click(b,'#editor');assert.ok(await b.evaluate('(()=>{const r=document.querySelector("#editor-clear").getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})()'),'all-delete visible on small-phone entry');await shot(b,'editor-entry-390x844');await b.size(1440,900);
 // The other writer uses the real durable storage boundary while this editor remains open.
 await b.evaluate(`(async()=>{const {createEditorLevel}=await import('../parkour/editor.js');const {createRouteLibrary,saveRoute,writeRouteLibrary}=await import('../parkour/route-library.js');const other=createRouteLibrary();saveRoute(other,createEditorLevel());writeRouteLibrary(localStorage,other)})()`);
 await input(b,'#platform-x',1);assert.equal(await b.evaluate(`${library}.routes.length`),1,'draft persistence retains the other writer work');await click(b,'#editor-save');assert.equal(await b.evaluate(`${library}.routes.length`),2,'native Save must retain the other writer work');assert.deepEqual(await b.evaluate(`${library}.routes.map(r=>r.name)`),['自创路线一','自创路线二']);
 let accept=false;const dialogs=[];b.on('Page.javascriptDialogOpening',async event=>{dialogs.push(event.message);await b.call('Page.handleJavaScriptDialog',{accept})});
 await b.evaluate('Storage.prototype.setItem=function(){throw new DOMException("Full","QuotaExceededError")}');await click(b,'#editor-hall');assert.equal(dialogs.length,1,'failed draft write warns before leaving');assert.match(dialogs[0],/保存失败/);assert.equal(await b.evaluate('document.body.dataset.mode'),'editor','cancel retains editing');assert.equal(await b.evaluate('document.querySelector("#platform-x").value'),'1');accept=true;await click(b,'#editor-hall');await wait(b,'location.pathname.endsWith("/index.html") && document.querySelector("a[href*=parkour]")');assert.equal(dialogs.length,2);assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
