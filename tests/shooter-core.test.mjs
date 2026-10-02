import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,startWave,stepGame,resizeGame,drawUpgrade,continueWave,pulse,laser,buildWave,MAX_WAVES,SUBSTAGES,TIERS,fireVolley} from '../shooter/core.js';
const rng=()=>{let n=123;return()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296}};
const enemy=(kind='drone',props={})=>({kind,x:200,y:100,r:18,hp:1,vy:0,vx:0,fire:99,...props});
function idle(){const g=createGame(400,600,()=>.5);g.mode='playing';g.spawnLeft=1;g.spawnClock=99;return g}
test('starts with ten life and ten laser shots per wave',()=>{
 const g=createGame(400,600);startWave(g);assert.equal(g.hp,10);assert.equal(g.shield,0);assert.equal(g.lasers,10);
 g.lasers=0;g.mode='upgrade';g.reward={kind:'shield'};continueWave(g);assert.equal(g.lasers,10);
});
test('each substage has random big bosses; only stage 2 substage 1 has ten',()=>{
 assert.equal(SUBSTAGES,100);assert.equal(MAX_WAVES,20000);
 for(let n=1;n<=MAX_WAVES;n++){const plan=buildWave(n,rng());assert.ok(plan.some(k=>k!=='drone'));const bosses=plan.filter(k=>k!=='drone').length;if(n===101)assert.equal(bosses,10);else assert.ok(bosses>=1&&bosses<=4)}
 assert.notDeepEqual(buildWave(20,()=>0),buildWave(20,()=>.99));
 assert.ok(buildWave(101,()=>.99).filter(k=>k!=='drone').every(k=>k==='purple'));
 assert.ok(buildWave(1,()=>.99).includes('purple'));
 assert.throws(()=>buildWave(MAX_WAVES+1),RangeError);
});
test('damage matches each monster tier and shields absorb it before life',()=>{
 for(const [kind,value]of [['drone',1],['yellow',2],['blue',4],['purple',10]]){
  assert.equal(TIERS[kind].damage,value);const g=idle();g.enemyBullets=[{x:g.player.x,y:g.player.y,r:5,vx:0,vy:0,damage:value}];
  stepGame(g,1/60);assert.equal(g.hp,Math.max(0,10-value));assert.equal(g.mode,value===10?'over':'playing');
 }
 const g=idle();g.shield=6;g.enemyBullets=[{x:g.player.x,y:g.player.y,r:5,vx:0,vy:0,damage:10}];stepGame(g,1/60);assert.equal(g.shield,0);assert.equal(g.hp,6);
 g.enemyBullets=[{x:g.player.x,y:g.player.y,r:5,vx:0,vy:0,damage:10}];stepGame(g,1/60);assert.equal(g.hp,6,'grace period prevents simultaneous hits');
});
test('blue and purple bosses are tougher, shoot more and purple bullets are green',()=>{
 assert.ok(TIERS.blue.hp>TIERS.yellow.hp);assert.ok(TIERS.purple.hp>TIERS.blue.hp);
 assert.ok(TIERS.blue.shots>TIERS.yellow.shots);assert.ok(TIERS.purple.shots>TIERS.blue.shots);assert.ok(TIERS.purple.shots<100);
 const g=idle();g.enemies=[enemy('purple',{hp:100,fire:0})];stepGame(g,1/60);
 assert.equal(g.enemyBullets.length,TIERS.purple.shots);assert.ok(g.enemyBullets.every(b=>b.color==='#7df28b'&&b.damage===10));
});
test('a hit awards points exactly once and offers a card when the stage clears',()=>{
 const g=idle();g.spawnLeft=0;g.enemies=[enemy()];g.bullets=[{x:200,y:110,r:4,vy:-400,vx:0,damage:1}];
 stepGame(g,1/30);assert.equal(g.score,100);assert.equal(g.enemies.length,0);assert.equal(g.mode,'upgrade');stepGame(g,1);assert.equal(g.score,100);
});
test('each cleared stage permits one random card, then one continuation',()=>{
 const g=idle();assert.equal(drawUpgrade(g),null);g.mode='upgrade';g.random=()=>0;
 assert.equal(continueWave(g),false);const card=drawUpgrade(g);assert.equal(card.kind,'spread');assert.equal(g.spread,2);
 assert.equal(drawUpgrade(g),null);assert.equal(g.spread,2);assert.equal(continueWave(g),true);assert.equal(continueWave(g),false);
});
test('shield cards add ten and laser cards strengthen the beam',()=>{
 const g=idle();g.mode='upgrade';g.random=()=>.6;assert.equal(drawUpgrade(g).kind,'shield');assert.equal(g.shield,10);
 g.reward=null;g.random=()=>.99;assert.equal(drawUpgrade(g).kind,'laser');assert.equal(g.laserPower,30);
});
test('hundred-lane spread stays centred and upgrades never exceed the 100-lane limit',()=>{
 const g=idle();g.spread=100;fireVolley(g);assert.equal(g.bullets.length,100);assert.ok(g.bullets.every(b=>b.x===g.player.x));
 assert.ok(g.bullets[0].vx<0&&g.bullets.at(-1).vx>0);
 g.mode='upgrade';g.random=()=>0;drawUpgrade(g);assert.equal(g.spread,100);
 assert.notEqual(g.reward.kind,'spread','maxed spread cards are removed from the draw pool');
});
test('laser pierces aligned monsters, has ten charges and cannot fire while paused',()=>{
 const g=idle();g.enemies=[enemy('yellow',{y:80,hp:15}),enemy('blue',{y:150,hp:15}),enemy('purple',{x:330,hp:100})];
 assert.equal(laser(g),true);assert.equal(g.enemies.length,1);assert.equal(g.lasers,9);assert.ok(g.beam.ttl>0);
 g.mode='paused';assert.equal(laser(g),false);assert.equal(g.lasers,9);g.mode='playing';g.lasers=0;assert.equal(laser(g),false);
});
test('last substage finishes with a victory rather than an extra stage',()=>{
 const g=idle();g.wave=MAX_WAVES;g.spawnLeft=0;stepGame(g,1/60);assert.equal(g.mode,'won');assert.equal(drawUpgrade(g),null);assert.equal(continueWave(g),false);
 startWave(g);assert.equal(g.wave,MAX_WAVES);assert.equal(g.mode,'won');
});
test('slow frames preserve movement, random generation and rewards',()=>{
 const run=fps=>{const g=createGame(400,600,rng());startWave(g);for(let i=0;i<fps*3;i++)stepGame(g,1/fps);return g};
 const a=run(60),b=run(15);assert.equal(a.spawnLeft,b.spawnLeft);assert.equal(a.enemies.length,b.enemies.length);assert.ok(Math.abs(a.enemies[0].y-b.enemies[0].y)<.001);assert.equal(a.score,b.score);
});
test('rotation scales positions and clamps the player',()=>{
 const g=createGame(800,300);g.player.x=780;g.player.y=280;g.enemies=[enemy('blue',{x:400})];resizeGame(g,300,800);
 assert.ok(g.player.x<=282&&g.player.y<=782);assert.equal(g.enemies[0].x,150);
});
test('energy pulse is limited, clears incoming fire and counts destroyed enemies',()=>{
 const g=idle();g.enemies=[enemy()];g.enemyBullets=[{x:200,y:200}];assert.equal(pulse(g),true);assert.equal(g.score,100);assert.equal(g.enemyBullets.length,0);assert.equal(g.pulses,1);
 pulse(g);assert.equal(pulse(g),false);
});

test('checkpoints resume the current substage with upgrades, reject corrupt saves and do not skip stages',async()=>{
 const {checkpoint,restoreCheckpoint}=await import('../shooter/core.js');
 const g=createGame(400,600);g.wave=100;startWave(g);g.spread=100;g.shield=20;g.hp=6;g.score=1234;
 const restored=restoreCheckpoint(800,400,checkpoint(g));assert.equal(restored.wave,101);assert.equal(restored.hp,6);assert.equal(restored.spread,100);assert.equal(restored.shield,20);assert.equal(restored.score,1234);assert.equal(restored.lasers,10);assert.ok(restored.spawnLeft>0);
 for(const bad of [null,{}, {...checkpoint(g),wave:MAX_WAVES+1},{...checkpoint(g),spread:101},{...checkpoint(g),hp:-1}])assert.equal(restoreCheckpoint(400,600,bad),null);
});

test('contact and invulnerability cannot delete a living big boss or skip its stage',()=>{
 const g=idle();g.spawnLeft=0;g.invincible=1;
 g.enemies=[enemy('blue',{x:g.player.x,y:g.player.y,hp:90,r:33})];
 stepGame(g,1/60);assert.equal(g.enemies.length,1);assert.equal(g.hp,10);assert.equal(g.mode,'playing');
 g.invincible=0;stepGame(g,1/60);assert.equal(g.enemies.length,1);assert.equal(g.hp,6);assert.equal(g.mode,'playing');
});
