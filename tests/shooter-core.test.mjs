import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame, startWave, stepGame, resizeGame, chooseUpgrade, pulse} from '../shooter/core.js';

test('a projectile destroys a target and awards points exactly once',()=>{
  const g=createGame(400,600);g.mode='playing';g.spawnLeft=0;
  g.enemies=[{x:200,y:120,r:18,hp:1,vy:0,vx:0,fire:99,kind:'drone'}];
  g.bullets=[{x:200,y:130,r:4,vy:-400,vx:0,damage:1}];
  stepGame(g,1/30);
  assert.equal(g.score,100);assert.equal(g.enemies.length,0);assert.equal(g.mode,'upgrade');
  stepGame(g,1);assert.equal(g.score,100);
});
test('hits consume one shield and a grace period blocks repeated damage',()=>{
  const g=createGame(400,600);g.mode='playing';g.spawnLeft=1;g.spawnClock=99;
  g.enemyBullets=[{x:g.player.x,y:g.player.y,r:5,vx:0,vy:0}];
  stepGame(g,1/60);assert.equal(g.shield,2);
  g.enemyBullets=[{x:g.player.x,y:g.player.y,r:5,vx:0,vy:0}];
  stepGame(g,1/60);assert.equal(g.shield,2);
  g.invincible=0;g.shield=1;g.enemyBullets=[{x:g.player.x,y:g.player.y,r:5,vx:0,vy:0}];
  stepGame(g,1/60);assert.equal(g.mode,'over');
});
test('cleared waves offer one upgrade and cannot be skipped or bought repeatedly',()=>{
  const g=createGame(400,600);startWave(g);const wave=g.wave;
  assert.equal(chooseUpgrade(g,'spread'),false);
  g.spawnLeft=0;g.enemies=[];stepGame(g,1/60);assert.equal(g.mode,'upgrade');
  assert.equal(chooseUpgrade(g,'spread'),true);assert.equal(g.spread,2);
  assert.equal(g.wave,wave+1);assert.equal(chooseUpgrade(g,'power'),false);
  assert.equal(g.power,1);
});
test('low frame rates advance the same simulation and do not tunnel through targets',()=>{
  const run=fps=>{const g=createGame(400,600);startWave(g);for(let i=0;i<fps*3;i++)stepGame(g,1/fps);return g};
  const a=run(60),b=run(15);
  assert.equal(a.spawnLeft,b.spawnLeft);assert.equal(a.enemies.length,b.enemies.length);
  assert.ok(Math.abs(a.enemies[0].y-b.enemies[0].y)<0.001);
  assert.equal(a.score,b.score);
});
test('rotation scales positions and clamps the player to the new screen',()=>{
  const g=createGame(800,300);g.player.x=780;g.player.y=280;
  g.enemies=[{x:400,y:100,r:18}];resizeGame(g,300,800);
  assert.equal(g.width,300);assert.ok(g.player.x<=282);assert.ok(g.player.y<=782);
  assert.equal(g.enemies[0].x,150);assert.ok(Math.abs(g.enemies[0].y-800/3)<0.01);
});
test('pulse is a limited tool, clears incoming projectiles and awards destroyed targets',()=>{
  const g=createGame(400,600);startWave(g);
  g.enemies=[{x:200,y:120,r:18,hp:1,vy:0,vx:0,fire:99,kind:'drone'}];
  g.enemyBullets=[{x:200,y:200}];assert.equal(pulse(g),true);
  assert.equal(g.score,100);assert.equal(g.enemyBullets.length,0);assert.equal(g.pulses,1);
  pulse(g);assert.equal(pulse(g),false);assert.equal(g.pulses,0);
});
