import test from 'node:test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {openBrowser,sleep} from './game-browser-harness.mjs';
test('twenty animal portraits share territory motifs and real diamond exchange buys and equips persistably',{timeout:20000},async()=>{
 const b=await openBrowser();try{
  await b.size(390,844,true);await b.navigate('games/territory.html');
  await b.evaluate('localStorage.setItem("paper-territory.profile.v1",JSON.stringify({coins:50,score:77,owned:["red"],selected:"red"}))');await b.navigate('games/territory.html');
  await b.evaluate('document.getElementById("shop").click();document.querySelector("[data-tier=special]").click()');
  assert.equal(await b.evaluate('document.querySelectorAll(".skin-card").length'),20);
  assert.equal(await b.evaluate('new Set([...document.querySelectorAll(".skin-preview")].map(c=>c.toDataURL())).size'),20);
  assert.equal(await b.evaluate('document.querySelector("[data-skin=animal-elephant] button").disabled'),true);
  await b.evaluate('document.getElementById("exchange-fifty").click()');assert.equal(await b.evaluate('document.getElementById("diamond-wallet").textContent'),'100');assert.equal(await b.evaluate('document.getElementById("wallet").textContent'),'0');
  await b.evaluate('document.querySelector("[data-skin=animal-elephant] button").click()');assert.equal(await b.evaluate('document.getElementById("diamond-wallet").textContent'),'0');
  await b.evaluate('document.querySelector("[data-skin=animal-elephant] button").click()');await b.navigate('games/territory.html');
  assert.equal(await b.evaluate('document.getElementById("home-paper").dataset.skin'),'animal-elephant');assert.equal(await b.evaluate('document.getElementById("total-score").textContent'),'77');
  const art=await b.evaluate(`(async()=>{const release=new URL(document.querySelector('script[type=module]').src).search,{SKINS}=await import('../territory/profile.js'+release),{drawPaper,material,createRenderer}=await import('../territory/render.js'+release),{createGame}=await import('../territory/core.js'+release),c=document.createElement('canvas');c.width=700;c.height=600;c.style.cssText='width:700px;height:600px;position:fixed;left:0;top:0;z-index:999;background:#f7f2e6';document.body.append(c);const ctx=c.getContext('2d');ctx.fillStyle='#f7f2e6';ctx.fillRect(0,0,700,600);const animals=SKINS.filter(s=>s.tier==='special'),textures=new Set();for(let i=0;i<animals.length;i++){const s=animals[i],x=70+(i%5)*140,y=62+Math.floor(i/5)*145;drawPaper(ctx,x,y,95,s);ctx.fillStyle='#294a4b';ctx.font='16px system-ui';ctx.textAlign='center';ctx.fillText(s.name,x,y+64);textures.add(material(s).toDataURL())}globalThis.animalGallery=c;return{textures:textures.size,same:material(animals[0])===material({...animals[0]})}})()`);
  assert.equal(art.textures,20);assert.equal(art.same,true);
  const trunk=await b.evaluate(`(async()=>{const {drawAnimal}=await import('../territory/animals.js'+new URL(document.querySelector('script[type=module]').src).search);const c=document.createElement('canvas');c.width=c.height=100;const ctx=c.getContext('2d');ctx.fillStyle='#9bb2c4';ctx.fillRect(0,0,100,100);drawAnimal(ctx,50,50,100,'elephant');return [...ctx.getImageData(44,75,1,1).data]})()`);
  assert.ok(Math.max(...trunk.slice(0,3).map((v,i)=>Math.abs(v-[155,178,196][i])))>=20,'the elephant trunk outline must contrast with its head and token color');
  await b.size(740,660);const shot=await b.call('Page.captureScreenshot',{format:'png'});await writeFile('/tmp/territory-animals-gallery.png',Buffer.from(shot.data,'base64'));await b.evaluate('animalGallery.remove()');
  await b.size(320,720,true);await b.evaluate('document.getElementById("shop").click();document.querySelector("[data-tier=special]").click()');assert.ok(await b.evaluate('document.documentElement.scrollWidth')<=320);
  await b.evaluate('document.getElementById("shop-back").click();document.getElementById("start").click()');await sleep(100);
  assert.equal(await b.evaluate('document.getElementById("map").dataset.skin'),'animal-elephant');assert.deepEqual(b.errors,[]);
 }finally{b.close()}
});
