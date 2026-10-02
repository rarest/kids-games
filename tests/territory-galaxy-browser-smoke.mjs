import test from 'node:test';
import assert from 'node:assert/strict';
import{openBrowser}from'./game-browser-harness.mjs';

test('fine and hidden owned land has animated galaxy light without leaking outside or rebuilding each frame',{timeout:30000},async()=>{
  const b=await openBrowser();
  try{
    await b.size(1440,900,false);await b.navigate('games/territory.html');
    const result=await b.evaluate(`(async()=>{
      const release=new URL(document.querySelector('script[type=module]').src).search,{createGame}=await import('../territory/core.js'+release),{createRenderer}=await import('../territory/render.js'+release);
      const c=document.createElement('canvas');c.style.cssText='width:800px;height:600px;position:fixed;left:0;top:0';document.body.append(c);
      const g=createGame({seed:7,cols:88,rows:76,bots:0});g.territories=[[[[ [35,29],[53,29],[53,47],[35,47],[35,29] ]]]];g.areas=[324];g.players[0].x=20.5;g.players[0].y=38.5;
      const renderer=createRenderer(c),skin={color:'#a269db',pattern:'stars',effect:'galaxy',tier:'normal'},ctx=c.getContext('2d');let geom;
      const shot=(tier,time)=>{geom=renderer.draw(g,{...skin,tier},time);return ctx.getImageData(0,0,c.width,c.height).data};
      const difference=(a,b,inside=true)=>{let n=0;for(let y=30;y<46;y+=.25)for(let x=inside?36:56;x<(inside?52:60);x+=.25){const px=Math.floor(geom.ox+x*geom.scale),py=Math.floor(geom.oy+y*geom.scale),i=(py*c.width+px)*4;if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2])n++;}return n};
      const normal=shot('normal',0),normal2=shot('normal',2),fine=shot('fine',0),fineCount=Number(c.dataset.galaxyParticles),builds=c.dataset.baseBuilds,fine2=shot('fine',2),unchangedBuilds=c.dataset.baseBuilds;
      const hidden=shot('hidden',0),hiddenCount=Number(c.dataset.galaxyParticles),hidden2=shot('hidden',2),hiddenBuilds=c.dataset.baseBuilds,times=[];
      for(let n=0;n<180;n++){const t=performance.now();shot('hidden',n*.03);times.push(performance.now()-t);}times.sort((a,b)=>a-b);
      const out={normalMotion:difference(normal,normal2),fineAppearance:difference(normal,fine),fineMotion:difference(fine,fine2),hiddenMotion:difference(hidden,hidden2),fineOutside:difference(normal,fine,false),hiddenOutside:difference(normal,hidden,false),fineCount,hiddenCount,cacheStable:builds===unchangedBuilds&&hiddenBuilds===c.dataset.baseBuilds,finalCount:Number(c.dataset.galaxyParticles),median:times[90]};c.remove();return out;
    })()`);
    assert.equal(result.normalMotion,0);assert.ok(result.fineAppearance>300,'material visibly distinguishes fine owned land');
    assert.ok(result.fineMotion>30,'fine light actually twinkles');assert.ok(result.hiddenMotion>30,'hidden light actually twinkles');
    assert.equal(result.fineOutside,0);assert.equal(result.hiddenOutside,0);
    assert.ok(result.fineCount>0&&result.fineCount<=96);assert.ok(result.hiddenCount>result.fineCount&&result.hiddenCount<=160);
    assert.equal(result.cacheStable,true);assert.equal(result.finalCount,result.hiddenCount);assert.ok(result.median<25,JSON.stringify(result));
    console.log('galaxy renderer',JSON.stringify(result));assert.deepEqual(b.errors,[]);
  }finally{b.close()}
});

test('reduced motion freezes galaxy particles and hidden character effects',{timeout:15000},async()=>{
  const b=await openBrowser();
  try{
    await b.call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await b.size(390,844,true);await b.navigate('games/territory.html');
    const frozen=await b.evaluate(`(async()=>{const release=new URL(document.querySelector('script[type=module]').src).search,{createGame}=await import('../territory/core.js'+release),{createRenderer}=await import('../territory/render.js'+release);const c=document.createElement('canvas');c.style.cssText='width:360px;height:500px';document.body.append(c);const g=createGame({seed:7,bots:0}),renderer=createRenderer(c),skin={color:'#a269db',pattern:'plain',tier:'hidden',effect:'galaxy'};renderer.draw(g,skin,0);const before=c.toDataURL();renderer.draw(g,skin,7);const same=c.toDataURL()===before;c.remove();return same})()`);
    assert.equal(frozen,true);assert.deepEqual(b.errors,[]);
  }finally{b.close()}
});
