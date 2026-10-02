import test from 'node:test';
import assert from 'node:assert/strict';
import {createAudioController} from '../shooter/audio.js';
import {createSoundObserver} from '../shooter/sound-events.js';
import {createGame,stepGame} from '../shooter/core.js';

function fixture(){
  const sources=[],timers=new Set();let instance,created=0;
  class Param{setValueAtTime(){} exponentialRampToValueAtTime(){}}
  class Node{constructor(){this.gain=new Param();this.frequency=new Param();this.stops=0}connect(){}disconnect(){}start(){this.started=true}stop(){this.stopped=true;this.stops++}}
  class Context{
    constructor(){instance=this;created++;this.state='suspended';this.currentTime=0;this.destination={}}
    createGain(){return new Node()}
    createOscillator(){const node=new Node();sources.push(node);return node}
    async resume(){this.state='running'}
    async close(){this.state='closed'}
  }
  const controller=createAudioController({AudioContext:Context,setInterval:fn=>{timers.add(fn);return fn},clearInterval:fn=>timers.delete(fn)});
  return{controller,sources,timers,get context(){return instance},get created(){return created}};
}
test('shooter music unlocks once and pause or mute stops all scheduled voices',async()=>{
  const f=fixture(),a=f.controller;a.setActive(true);
  assert.equal(f.created,0,'loading the game does not autoplay');
  await a.unlock();await a.unlock();assert.equal(f.created,1);assert.equal(f.timers.size,1);
  assert.ok(f.sources.length>=5,'both ambient chord and melody are audible sources');
  a.setActive(false);assert.equal(f.timers.size,0);assert.ok(f.sources.every(n=>n.stopped));
  assert.equal(a.playEffect('damage'),false);
  a.setActive(true);assert.equal(f.timers.size,1);
  a.setEnabled(false);assert.equal(f.timers.size,0);assert.equal(a.playEffect('hit'),false);
  a.setEnabled(true);assert.equal(f.timers.size,1);a.destroy();assert.equal(f.timers.size,0);
});
test('collision sounds are independent of music and dense hits are throttled',async()=>{
  const f=fixture(),a=f.controller;a.setActive(true);await a.unlock();
  const before=f.sources.length;
  assert.equal(a.playEffect('hit'),true);assert.equal(a.playEffect('hit'),false);
  assert.equal(a.playEffect('damage'),true);assert.equal(f.sources.length,before+2);
  f.context.currentTime=.2;assert.equal(a.playEffect('hit'),true);a.destroy();
});
test('a delayed unlock cannot restart music after a pause',async()=>{
  const f=fixture(),a=f.controller;a.setActive(true);const pending=a.unlock();a.setActive(false);await pending;
  assert.equal(f.timers.size,0);assert.equal(f.sources.length,0);
});
test('unavailable or rejected audio does not break gameplay',async()=>{
  for(const AudioContext of [null,class{constructor(){throw new Error('unavailable')}}]){
    const a=createAudioController({AudioContext});a.setActive(true);assert.equal(await a.unlock(),false);assert.equal(a.playEffect('hit'),false);a.destroy();
  }
});
test('a real nonlethal projectile collision makes sound without awarding points',()=>{
  const game=createGame(400,600);game.mode='playing';game.spawnLeft=1;game.spawnClock=99;
  game.enemies=[{x:200,y:120,r:18,hp:3,vy:0,vx:0,fire:99,kind:'drone'}];
  game.bullets=[{x:200,y:130,r:4,vy:-400,vx:0,damage:1}];
  const observer=createSoundObserver(),heard=[];
  observer.before(game);stepGame(game,1/60);observer.after(game,name=>heard.push(name));
  assert.equal(game.score,0);assert.equal(game.enemies[0].hp,2);assert.deepEqual(heard,['hit']);
});
test('game over stops music but permits the final collision sound to finish',async()=>{
  const f=fixture(),a=f.controller;a.setActive(true);await a.unlock();const music=[...f.sources];
  a.playEffect('damage');const effect=f.sources.at(-1);
  a.setActive(false,{finishEffects:true});assert.equal(f.timers.size,0);
  assert.ok(music.every(source=>source.stops===2));assert.equal(effect.stops,1,'only its natural end remains scheduled');
  a.setEnabled(false);assert.equal(effect.stops,2,'mute still silences the tail immediately');
});
test('campaign hull damage without shields still emits collision audio',()=>{
  const game=createGame(400,600);game.mode='playing';game.spawnLeft=1;game.spawnClock=99;
  game.hp=1;game.shield=0;game.invincible=0;
  game.enemyBullets=[{x:game.player.x,y:game.player.y,r:5,vx:0,vy:0,damage:1}];
  const observer=createSoundObserver(),heard=[];
  observer.before(game);stepGame(game,1/60);observer.after(game,name=>heard.push(name));
  assert.equal(game.mode,'over');assert.deepEqual(heard,['damage']);
});
