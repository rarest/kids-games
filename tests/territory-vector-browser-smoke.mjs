import test from "node:test";
import assert from "node:assert/strict";
import { openBrowser } from "./game-browser-harness.mjs";
test(
  "actual concave territory is solid, blank overview has only our shape and position, and material is shared",
  { timeout: 20000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.size(1440, 900);
      await b.navigate("games/territory.html");
      const r =
        await b.evaluate(`(async()=>{const release=new URL(document.querySelector('script[type=module]').src).search,{createGame}=await import('../territory/core.js'+release),{createRenderer,material,drawPaper}=await import('../territory/render.js'+release),{SKINS}=await import('../territory/profile.js'+release);
 const c=document.createElement('canvas'),mini=document.createElement('canvas');c.style.cssText='width:800px;height:600px';document.body.append(c);const g=createGame({seed:7,bots:1});g.territories[0]=[[[[35,30],[51,30],[51,37],[45,37],[45,45],[35,45],[35,30]]]];g.areas[0]=192;Object.assign(g.players[0],{x:36,y:31});const skin=SKINS.find(s=>s.id==='fine-brocade'),rr=createRenderer(c,{minimap:mini}),geo=rr.draw(g,skin);
 const pixel=(canvas,x,y)=>[...canvas.getContext('2d').getImageData(Math.round(x),Math.round(y),1,1).data],at=(x,y)=>pixel(c,geo.ox+x*geo.scale,geo.oy+y*geo.scale);let holes=0,inside=0;for(let y=32;y<43;y+=.18)for(let x=37;x<44;x+=.18){const v=at(x,y);inside++;if(v[0]>240&&v[1]>232&&v[2]>215)holes++;}
 const s=120/88,mx=4,my=(128-76*s)/2,bg=[255,249,237];let bad=0;for(let y=0;y<128;y++)for(let x=0;x<128;x++){if(x>=mx+34*s&&x<=mx+52*s&&y>=my+29*s&&y<=my+46*s||Math.hypot(x-(mx+36*s),y-(my+31*s))<4.5)continue;const v=pixel(mini,x,y);if(v.slice(0,3).some((n,i)=>n!==bg[i]))bad++;}
 const normal=at(48,41),filled=at(40,40),sameMaterial=material(skin)===material({...skin}),patternPixels=new Set();const mat=material(skin);for(let y=0;y<192;y+=6)for(let x=0;x<192;x+=6)patternPixels.add(pixel(mat,x,y).join(','));
 const out={holes,inside,bad,normal,filled,sameMaterial,patternPixels:patternPixels.size};c.remove();return out;})()`);
      assert.equal(
        r.holes,
        0,
        "interior contains no cream gaps between circle tiles",
      );
      assert.ok(r.inside > 1000);
      assert.equal(
        r.bad,
        0,
        "overview is entirely blank outside our single shape and marker",
      );
      assert.notDeepEqual(
        r.normal,
        r.filled,
        "actual concave notch remains unfilled",
      );
      assert.equal(r.sameMaterial, true);
      assert.ok(r.patternPixels > 30, "fine material has detailed grain");
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);
test(
  "hidden meteors animate shared material and the movement star trail fades after three game seconds",
  { timeout: 20000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.size(1440, 900);
      await b.navigate("games/territory.html");
      const r = await b.evaluate(
        `(async()=>{const release=new URL(document.querySelector('script[type=module]').src).search,{createGame}=await import('../territory/core.js'+release),{createRenderer,drawPaper}=await import('../territory/render.js'+release),{SKINS}=await import('../territory/profile.js'+release),skin=SKINS.find(s=>s.id==='hidden-galaxy'),g=createGame({seed:7,bots:0}),c=document.createElement('canvas');c.style.cssText='width:800px;height:600px';document.body.append(c);const rr=createRenderer(c,{follow:true}),p=g.players[0];rr.draw(g,skin,0);const a=c.toDataURL();rr.draw(g,skin,1);const moving=a!==c.toDataURL();for(let n=1;n<=90;n++){p.x+=.02;rr.draw(g,skin,1+n*.05);}const count=+c.dataset.starTail;rr.draw(g,skin,8.6);const faded=+c.dataset.starTail;const paper=document.createElement('canvas');paper.width=paper.height=128;drawPaper(paper.getContext('2d'),64,64,65,skin,0,{active:true});const before=paper.toDataURL();paper.getContext('2d').clearRect(0,0,128,128);drawPaper(paper.getContext('2d'),64,64,65,skin,1,{active:true});const avatar=before!==paper.toDataURL();c.remove();return{moving,count,faded,avatar};})()`,
      );
      assert.equal(r.moving, true);
      assert.equal(r.avatar, true);
      assert.ok(r.count > 0 && r.count <= 72);
      assert.equal(r.faded, 0);
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);
test(
  "real victory objects render and touched chests award persistable skins without win-count unlocking",
  { timeout: 20000 },
  async () => {
    const b = await openBrowser();
    try {
      await b.size(1440, 900);
      await b.navigate("games/territory.html");
      const r = await b.evaluate(
        `(async()=>{const release=new URL(document.querySelector('script[type=module]').src).search,{createGame,stepGame,movePlayer}=await import('../territory/core.js'+release),{createRenderer}=await import('../territory/render.js'+release),{createProfile,collectReward,SKINS}=await import('../territory/profile.js'+release),g=createGame({seed:7,bots:0}),c=document.createElement('canvas');c.style.cssText='width:800px;height:600px';document.body.append(c);g.territories[0]=g.world;g.areas[0]=g.worldArea;stepGame(g,.01);const rr=createRenderer(c),skin=SKINS[0],profile=createProfile();rr.draw(g,skin,0);const before=c.toDataURL();for(const chest of g.rewards.chests){movePlayer(g,0,chest.x,chest.y);collectReward(profile,g,g.events.findLast(e=>e.type==='chest'));}rr.draw(g,skin,0);const changed=before!==c.toDataURL();const saved=createProfile(JSON.parse(JSON.stringify(profile)));c.remove();return{mode:g.mode,coins:g.rewards.coins.length,chests:g.rewards.chests.length,owned:saved.owned,wins:saved.wins,changed};})()`,
      );
      assert.equal(r.mode, "reward");
      assert.equal(r.coins, 60);
      assert.equal(r.chests, 3);
      assert.equal(r.wins, 0);
      assert.equal(r.owned.length, 4);
      assert.equal(r.changed, true);
      assert.deepEqual(b.errors, []);
    } finally {
      b.close();
    }
  },
);
