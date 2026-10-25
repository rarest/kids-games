import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {openBrowser,sleep} from './game-browser-harness.mjs';
const dir=new URL('../output/butterfly-flight/',import.meta.url);await fs.mkdir(dir,{recursive:true});
const b=await openBrowser({chromeFlags:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}),out={},shaderErrors=[];
b.on('Runtime.consoleAPICalled',e=>{if(e.type==='error')shaderErrors.push(e.args.map(a=>a.value||a.description).join(' '));});
async function wait(code,ms=18000){const until=Date.now()+ms;while(Date.now()<until){if(await b.evaluate(code))return;await sleep(90);}throw Error('Timeout '+code);}
async function clickAt(p){await b.call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...p});await b.call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...p});}
async function tap(selector){await clickAt(await b.evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`));await sleep(100);}
async function key(k,down){await b.call('Input.dispatchKeyEvent',{type:down?'keyDown':'keyUp',key:k,code:'Key'+k.toUpperCase(),windowsVirtualKeyCode:k.toUpperCase().charCodeAt(0)});}
const read=()=>b.evaluate('({altitude:GardenGame.state.player.altitude??GardenRules.altitudeOf(GardenGame.state,GardenGame.state.player),view:GardenGame.view,bodyY:GardenGame.scene.hero[0].root.position.y,cameraY:GardenGame.scene.camera.position.y,p:GardenGame.state.player})');
try{
 await b.size(1024,768,true);await b.navigate(process.env.GARDEN_GAME_PATH||'games/butterfly.html');await wait('!!window.GardenGame');
 await tap('[data-action="choose"]');await tap('[data-start="1"]');await tap('[data-map="meadow"]');await wait('GardenGame.view==="playing"');
 assert.equal(await b.evaluate('GardenGame.scene.cameraView'),'follow');assert.equal(await b.evaluate('GardenGame.scene.hero[0].root.visible'),true);
 // All gameplay state remains read only. Use native controls to leave the hut,
 // hover, lower, collect a real flower and display the own-home guidance.
 out.before=await read();const upButton=await b.evaluate(`(()=>{const r=document.querySelector('[data-rise="1"]').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await b.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...upButton,id:51}]});await sleep(1700);await b.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(150);out.up=await read();assert.ok(out.up.altitude>out.before.altitude+3);assert.ok(Math.abs(out.up.bodyY-out.up.altitude)<.04);assert.ok(out.up.cameraY>out.up.altitude);
 await sleep(500);out.hover=await read();assert.equal(out.hover.altitude,out.up.altitude,'release hovers');
 // Native touch swipe: right side vertical drag changes altitude, not pitch.
 const start={x:620,y:350};await b.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...start,id:41}]});await b.call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:620,y:260,id:41}]});await sleep(1200);await b.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(250);out.swipe=await read();assert.ok(out.swipe.altitude>out.hover.altitude+2);const stopped=out.swipe.altitude;await sleep(400);assert.equal((await read()).altitude,stopped);
 await key('g',true);await sleep(4700);await key('g',false);await sleep(150);out.down=await read();assert.ok(out.down.altitude<1.6);
 // At low altitude, pick an actually visible nearby flower and use the native
 // click-to-fly route; collection was explicitly armed via its real button.
 await tap('[data-action="collect"]');
 const target=await b.evaluate(`(()=>{const g=GardenGame,p=g.state.player,rect=document.querySelector('.ng-world').getBoundingClientRect();return g.state.flowers.filter(f=>!f.done).map(f=>({f,q:g.scene.project(f.x,1.3,f.z),d:Math.hypot(f.x-p.x,f.z-p.z)})).filter(a=>a.q.visible&&a.q.y>170&&a.q.y<innerHeight-340&&a.q.x>180&&a.q.x<innerWidth-150).sort((a,b)=>a.d-b.d).map(a=>({x:rect.x+a.q.x,y:rect.y+a.q.y,flower:a.f,distance:a.d}))[0]})()`);
 assert.ok(target,'a flower must be visible and clickable from the default follow camera');out.target=target;await clickAt({x:target.x,y:target.y});await wait('GardenGame.state.player.bag>0',20000);
 out.honey=await b.evaluate(`(()=>{const g=GardenGame,p=g.state.player,h=GardenRules.hutFor(p),a=Math.atan2(h.x-p.x,-(h.z-p.z))-g.look.yaw,arrow=document.querySelector('.ng-home-arrow');return{bag:p.bag,arrow:!arrow.hidden,rotation:Number(arrow.style.transform.match(/rotate\\(([-.\\d]+)deg/)[1]),expected:Math.atan2(Math.sin(a),Math.cos(a))*180/Math.PI,label:document.querySelector('.ng-mission-text').textContent}})()`);
 assert.equal(out.honey.arrow,true);assert.ok(Math.abs(out.honey.rotation-out.honey.expected)<.01);assert.match(out.honey.label,/小屋/);

 out.final=await b.evaluate('({species:[...new Set(GardenGame.scene.vegetation.snapshot().map(t=>t.species))],flowers:[...new Set(GardenGame.scene.flowers.map(f=>f.flowerSpecies))],valid:GardenGame.scene.renderer.info.programs.every(p=>p.diagnostics?.runnable!==false),audio:GardenGame.music.context?.state,calls:GardenGame.scene.renderer.info.render.calls,triangles:GardenGame.scene.renderer.info.render.triangles})');assert.equal(out.final.species.length,4);assert.ok(out.final.flowers.length>=4);assert.equal(out.final.valid,true);assert.equal(out.final.audio,'running');
 const shot=await b.call('Page.captureScreenshot',{format:'png'});await fs.writeFile(new URL('lush-flight.png',dir),Buffer.from(shot.data,'base64'));assert.deepEqual(b.errors,[]);assert.deepEqual(shaderErrors,[]);console.log(JSON.stringify(out));
}finally{await fs.writeFile(new URL('native-flight.json',dir),JSON.stringify({...out,errors:b.errors,shaderErrors},null,2));await b.close();}
