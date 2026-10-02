import test from 'node:test';
import assert from 'node:assert/strict';
import * as c from '../shooter/core.js';
const idle=()=>{const g=c.createGame(720,960,()=>.5);g.mode='playing';g.spawnLeft=1;g.spawnClock=99;return g};
test('campaign has 50 substages, starts gently and grows stronger',()=>{
 assert.equal(c.SUBSTAGES,50);assert.equal(c.MAX_WAVES,10000);
 const first=c.buildWave(1,()=>.5);assert.deepEqual(first.filter(k=>k!=='drone'),['yellow']);assert.ok(first.filter(k=>k==='drone').length>=6);assert.deepEqual(c.buildWave(2).filter(k=>k!=='drone'),['yellow']);assert.deepEqual(c.buildWave(30).filter(k=>k!=='drone'),Array(10).fill('purple'));
 assert.equal(c.buildWave(51).filter(k=>k!=='drone').length,20);
 assert.equal(c.buildWave(52,()=>0).filter(k=>k!=='drone').length,20);
 assert.equal(c.buildWave(101,()=>0).filter(k=>k!=='drone').length,20);
 const hp=wave=>{const g=c.createGame(720,960,()=>.5);g.wave=wave-1;c.startWave(g);g.plan=['purple'];g.spawnLeft=1;g.spawnClock=0;c.stepGame(g,1/60);return g.enemies[0].hp};
 assert.ok(hp(2)>hp(1));assert.ok(hp(52)>hp(2));
});
test('cooperative pilots move and shoot independently; one death does not end a team run',()=>{
 const g=idle(),p=c.addPilot(g,'friend');assert.ok(p);p.invincible=0;g.invincible=0;
 const x=p.player.x;c.stepGame(g,.1,{partners:{friend:{x:1}}});assert.ok(p.player.x>x);assert.equal(g.player.x,360);
 assert.ok(g.bullets.some(b=>b.owner==='friend'));assert.ok(g.bullets.some(b=>b.owner==='host'));
 g.enemyBullets=[{x:p.player.x,y:p.player.y,r:5,vx:0,vy:0,damage:10}];c.stepGame(g,1/60);assert.equal(p.hp,0);assert.equal(g.hp,10);assert.equal(g.mode,'playing');
 g.enemyBullets=[{x:g.player.x,y:g.player.y,r:5,vx:0,vy:0,damage:10}];c.stepGame(g,1/60);assert.equal(g.mode,'over');
});
test('teammates have separate cards and laser charges, all draw before continuation',()=>{
 const g=idle(),p=c.addPilot(g,'friend');assert.equal(c.laser(g,p),true);assert.equal(p.lasers,9);assert.equal(g.lasers,10);
 g.mode='upgrade';g.random=()=>.6;c.drawUpgrade(g,p);assert.equal(p.shield,10);assert.equal(g.shield,0);assert.equal(c.drawUpgrade(g,p),null);
 assert.equal(c.continueWave(g),false);c.drawUpgrade(g);p.hp=0;assert.equal(c.continueWave(g),true);assert.equal(p.hp,10);assert.equal(p.lasers,10);
});
test('at most sixteen pilots join and duplicates cannot replace another pilot',()=>{
 const g=idle();for(let i=1;i<16;i++)assert.ok(c.addPilot(g,String(i)));assert.equal(c.addPilot(g,'extra'),null);assert.equal(c.addPilot(g,'1'),null);
});
test('touching any monster costs exactly one point, shield first',()=>{
 for(const kind of ['drone','yellow','blue','purple']){const g=idle();g.invincible=0;g.enemies=[{kind,x:g.player.x,y:g.player.y,r:35,hp:100,vy:0,vx:0,fire:99,damage:15}];c.stepGame(g,1/60);assert.equal(g.hp,9,kind);}
 const g=idle();g.shield=10;g.enemies=[{kind:'purple',x:g.player.x,y:g.player.y,r:35,hp:100,vy:0,vx:0,fire:99,damage:15}];c.stepGame(g,1/60);assert.equal(g.hp,10);assert.equal(g.shield,9);
});
test('losing the last living teammate triggers defeat instead of an unwinnable battle',()=>{
 const g=idle(),p=c.addPilot(g,'friend');g.hp=0;p.disconnected=true;c.stepGame(g,1/30);assert.equal(g.mode,'over');
});
