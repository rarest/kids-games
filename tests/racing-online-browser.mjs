import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { openBrowser, sleep } from './game-browser-harness.mjs';

async function wait(b,expression,timeout=25000) {
  const until=Date.now()+timeout;
  while(Date.now()<until){if(await b.evaluate(expression))return;await sleep(80);}
  console.log('native failure',JSON.stringify({expression,errors:b.errors,state:await b.evaluate('({hidden:document.hidden,view:{...document.querySelector("#view")?.dataset},auto:document.querySelector("#auto")?.checked,message:document.querySelector("#online-message")?.textContent,toast:document.querySelector("#toast")?.textContent,input:window.__lastRacingInput,now:performance.now(),server:window.__lastRacingState})')}));
  assert.ok(await b.evaluate(expression),expression);
}
async function click(b,selector) {
  const p=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)return null;e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();const x=r.x+r.width/2,y=r.y+r.height/2;return {x,y,ok:r.width>0&&r.height>0&&!e.disabled&&e.contains(document.elementFromPoint(x,y))};})()`);
  assert.ok(p?.ok,`native clickable ${selector}: ${JSON.stringify(p)}`);
  for(const type of ['mousePressed','mouseReleased'])await b.call('Input.dispatchMouseEvent',{type,x:p.x,y:p.y,button:'left',clickCount:1});
}
async function type(b,selector,text) {
  await click(b,selector);await b.call('Input.dispatchKeyEvent',{type:'keyDown',key:'a',code:'KeyA',modifiers:2});
  await b.call('Input.dispatchKeyEvent',{type:'keyUp',key:'a',code:'KeyA',modifiers:2});
  await b.call('Input.insertText',{text});
}
async function shot(b,name) {
  const dir=process.env.RACING_EVIDENCE_DIR||'/home/ubuntu/codex-work/output/racing-multiplayer';
  await mkdir(dir,{recursive:true});const r=await b.call('Page.captureScreenshot',{format:'png'});
  await writeFile(`${dir}/${name}.png`,Buffer.from(r.data,'base64'));
}

test('three browsers use a six-digit room, start together, drive independent cars and keep racing after captain exits', {timeout:600000}, async()=>{
  const browsers=[];let server;
  try {
    const host=await openBrowser();browsers.push(host);
    await host.size(390,844,true);await host.navigate('games/racing.html');
    await wait(host,'document.body.dataset.ready==="true"');
    assert.ok(await host.evaluate('!!document.querySelector("#online-open")'),'multiplayer entry exists');
    await host.evaluate('quality.value="low";quality.dispatchEvent(new Event("change"))');
    await click(host,'[data-track="plateau"]');await click(host,'#online-open');
    console.log('native host ready');
    const guest=await openBrowser();browsers.push(guest);
    const third=await openBrowser();browsers.push(third);
    const live=process.env.RACING_PUBLIC_SAME_ORIGIN==='1';
    if(!live) {
      const {createRacingServer}=await import('../racing/server.mjs');
      server=createRacingServer({port:0,origins:browsers.map(b=>b.origin)});await server.ready;
      const target=`ws://127.0.0.1:${server.address().port}/racing-ws`;
      for(const b of browsers)await b.call('Page.addScriptToEvaluateOnNewDocument',{source:`(()=>{const Native=WebSocket;window.__racingSockets=[];window.WebSocket=class extends Native{constructor(url,...args){super(new URL(url,location.href).pathname==='/racing-ws'?${JSON.stringify(target)}:url,...args);window.__racingSockets.push(this);const send=this.send.bind(this);this.send=data=>{const p=JSON.parse(data);if(p.type==="input")window.__lastRacingInput={...p,at:performance.now()};return send(data)};this.addEventListener("message",e=>{const p=JSON.parse(e.data);if(p.type==="state")window.__lastRacingState={room:p.room,acks:p.acks,race:p.race&&{time:p.race.time,countdown:p.race.countdown,cars:p.race.cars.map(c=>({id:c.id,s:c.s,speed:c.speed}))}}});}};})();`});
      await host.call('Page.reload');await wait(host,'document.body.dataset.ready==="true"');
      await host.evaluate('quality.value="low";quality.dispatchEvent(new Event("change"))');
      await click(host,'[data-track="plateau"]');await click(host,'#online-open');
    }
    for(const b of [guest,third]) {await b.size(568,320,true);await b.navigate('games/racing.html');await wait(b,'document.body.dataset.ready==="true"');await b.evaluate('quality.value="low";quality.dispatchEvent(new Event("change"))');await click(b,'#online-open');console.log('native peer ready');}
    for(const b of browsers){await b.call('Emulation.setFocusEmulationEnabled',{enabled:true});await b.evaluate('quality.value="low";quality.dispatchEvent(new Event("change"))');}
    await type(host,'#online-name','小队长');await click(host,'#online-create');
    await wait(host,'/^[1-9][0-9]{5}$/.test(document.querySelector("#online-code").textContent)');
    const code=await host.evaluate('document.querySelector("#online-code").textContent');
    console.log('native room created');
    await shot(host,live?'public-room-mobile':'room-mobile');
    for(const [b,name] of [[guest,'朋友甲'],[third,'朋友乙']]){
      await type(b,'#online-name',name);await type(b,'#online-input',code);await click(b,'#online-join');
      await wait(b,'document.querySelectorAll("#online-members li").length>=2');
    }
    await wait(host,'document.querySelectorAll("#online-members li").length===3');
    console.log('native three peers joined');
    assert.equal(await guest.evaluate('document.querySelector("#online-start").disabled'),true,'only captain starts');
    // Keep real WebGL, but reduce software-renderer pixels while three independent
    // Chrome instances share this CPU. The full phone room is captured above.
    for(const b of browsers)await b.size(320,240,true);
    for(const b of [guest,third])await click(b,'#online-ready');
    await wait(host,'!document.querySelector("#online-start").disabled');await click(host,'#online-start');
    for(const [i,b] of browsers.entries()){
      console.log("native waiting driver",i);
      await wait(b,'view.dataset.online==="racing"');
      // Another car can push a slow starter onto the shoulder. Drive back onto
      // the road using the visitor's steering keys rather than bypassing physics.
      const offset=await b.evaluate('Number(view.dataset.offset)');
      if(Math.abs(offset)>7){
        const key=offset>0?'ArrowRight':'ArrowLeft';
        await b.call('Input.dispatchKeyEvent',{type:'keyDown',key,code:key});
        await wait(b,'Math.abs(Number(view.dataset.offset))<6',20000);
        await b.call('Input.dispatchKeyEvent',{type:'keyUp',key,code:key});
      }
      await wait(b,'Number(view.dataset.distance)>5',25000);
    }
    console.log('native three peers racing');
    assert.deepEqual(await Promise.all(browsers.map(b=>b.evaluate('Number(view.dataset.localId)'))),[0,1,2]);
    for(const b of browsers){assert.match(await b.evaluate('position.textContent'),/\/ 11/);assert.equal(await b.evaluate('JSON.parse(view.dataset.players).filter(p=>p.human).length'),3);}
    const sample=await guest.evaluate('({raw:document.querySelector("#view").dataset.offset,finite:Number.isFinite(Number(document.querySelector("#view").dataset.offset)),players:document.querySelector("#view").dataset.players,phase:document.querySelector("#view").dataset.online})');
    assert.equal(sample.finite,true,`driver offset must be finite before steering: ${JSON.stringify(sample)}`);
    const before=Number(sample.raw);
    const peerBefore=await host.evaluate('JSON.parse(view.dataset.players).find(p=>p.id===1).offset');
    await guest.call('Input.dispatchKeyEvent',{type:'keyDown',code:'ArrowRight',key:'ArrowRight'});
    await wait(guest,`Number(view.dataset.offset)<${before-0.5}`,20000);
    await guest.call('Input.dispatchKeyEvent',{type:'keyUp',code:'ArrowRight',key:'ArrowRight'});
    // Compare the same player's movement direction. A moving car sampled on two
    // different frames need not occupy the same coordinate at both timestamps.
    await wait(host,`JSON.parse(view.dataset.players).find(p=>p.id===1).offset<${peerBefore-0.5}`,15000);
    console.log("native independent steering verified");
    for(const expected of [true,false]){
      for(const type of ['keyDown','keyUp'])await guest.call('Input.dispatchKeyEvent',{type,code:'Escape',key:'Escape'});
      assert.equal(await guest.evaluate('!paused.hidden'),expected,'Escape toggles only the local menu');
    }
    await guest.size(568,320,true);
    await shot(guest,live?'public-driving-guest':'driving-guest');
    // Reload is an actual socket disconnect and reconnect with the private session token.
    await guest.call('Page.reload');await wait(guest,'view.dataset.online==="racing"&&view.dataset.localId==="1"',60000);
    console.log("native refresh rejoined");
    await click(host,'#pause');await click(host,'#quit');
    await wait(guest,'view.dataset.captain==="1"');
    // Traffic may push the unattended third car onto the shoulder while the
    // other device reloads. Steer back using the same native recovery as start.
    const remainingOffset=await third.evaluate('Number(view.dataset.offset)');
    if(Math.abs(remainingOffset)>7){
      const key=remainingOffset>0?'ArrowRight':'ArrowLeft';
      await third.call('Input.dispatchKeyEvent',{type:'keyDown',key,code:key});
      await wait(third,'Math.abs(Number(view.dataset.offset))<6',20000);
      await third.call('Input.dispatchKeyEvent',{type:'keyUp',key,code:key});
    }
    const s=await third.evaluate('Number(view.dataset.distance)');
    await wait(third,`Number(view.dataset.distance)>${s+10}`,20000);
    assert.equal(await host.evaluate('!document.querySelector("#garage").hidden'),true);
    for(const b of browsers)assert.deepEqual(b.errors,[]);
  }finally{for(const b of browsers)b.close();await server?.close();}
});
