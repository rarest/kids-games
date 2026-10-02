import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,movePlayer,stepGame,coverage} from '../territory/core.js';
import {containsRegion,regionArea,disk,difference} from '../territory/regions.js';
import {createProfile,collectReward,settleRun} from '../territory/profile.js';
function coastWin(inset=.2){
 const g=createGame({seed:7,bots:0}),p=g.players[0],home={x:p.x,y:p.y},c=g.boundary;
 for(const [x,y] of g.world[0][0]){const d=Math.hypot(x-c.x,y-c.y);assert.ok(movePlayer(g,0,c.x+(x-c.x)*(1-inset/d),c.y+(y-c.y)*(1-inset/d)));}
 assert.ok(movePlayer(g,0,home.x,home.y));return g;
}
test('visually complete real inner shoreline closure enters rewards instead of displaying 100 with no prize',()=>{
 const g=coastWin();assert.equal(g.mode,'reward');assert.equal(coverage(g,0),1);assert.deepEqual(g.territories[0],g.world);assert.equal(g.rewards.coins.length,60);assert.equal(g.rewards.chests.length,3);
});
test('larger unclaimed coast and a real surviving enemy still prevent victory',()=>{
 const g=coastWin(.3);assert.equal(g.mode,'playing');assert.ok(coverage(g,0)<.99999);
 const h=createGame({seed:7,bots:1}),other=disk(h.boundary.x,h.boundary.y,.03);
 h.territories[0]=difference(h.world,other);h.areas[0]=regionArea(h.territories[0]);h.territories[1]=other;h.areas[1]=regionArea(other);
 stepGame(h,.001);assert.equal(h.mode,'playing');assert.equal(h.players[1].alive,true);
});
test('reward countdown starts at thirty, pauses, expires exactly, and settlements pay score once',()=>{
 const g=coastWin(),profile=createProfile();assert.equal(g.rewards.remaining,30);
 stepGame(g,2);assert.ok(Math.abs(g.rewards.remaining-28)<1e-8);
 g.resumeMode='reward';g.mode='paused';stepGame(g,5);assert.ok(Math.abs(g.rewards.remaining-28)<1e-8);
 g.mode='reward';g.resumeMode=null;for(let i=0;i<6;i++)stepGame(g,5);
 assert.equal(g.mode,'over');assert.equal(g.rewards.remaining,0);assert.equal(g.winner,0);
 assert.equal(settleRun(profile,g),150);assert.equal(profile.score,150);assert.equal(profile.coins,150);assert.equal(profile.wins,1);
 assert.equal(settleRun(profile,g),0);assert.equal(profile.score,150);assert.equal(createProfile(JSON.parse(JSON.stringify(profile))).score,150);
});
test('swept clock pickup adds its labelled seconds just once',()=>{
 for(const seconds of [2,5,10]){
  const g=coastWin(),p=g.players[0],clock=g.rewards.clocks.find(c=>c.seconds===seconds);
  // Isolate a legitimate object route from the other clocks.
  g.rewards.clocks=[clock];const initial=g.rewards.remaining;
  assert.ok(movePlayer(g,0,clock.x,clock.y));assert.equal(g.rewards.remaining,initial+seconds);
  assert.ok(movePlayer(g,0,clock.x,clock.y));assert.equal(g.rewards.remaining,initial+seconds);assert.equal(g.events.filter(e=>e.type==='clock').length,1);
 }
});
test('expiry-frame coin and chest receipts survive automatic finish and cannot be paid twice',()=>{
 const g=coastWin(),profile=createProfile(),coin=g.rewards.coins[0],box=g.rewards.chests[0];
 movePlayer(g,0,coin.x,coin.y);movePlayer(g,0,box.x,box.y);
 g.rewards.remaining=.001;stepGame(g,.02);assert.equal(g.mode,'over');
 for(const e of g.events)if(['coin','chest'].includes(e.type))collectReward(profile,g,e);
 assert.ok(profile.coins>=5);assert.ok(profile.owned.length>=2);const paid=profile.coins;
 settleRun(profile,g);assert.equal(profile.score,paid+150);
 for(const e of g.events)if(['coin','chest'].includes(e.type))assert.equal(collectReward(profile,g,e),null);
 assert.equal(profile.coins,paid+150);
});
test('reward coins have distinct sparse and dense areas with all pickups inside the island',()=>{
 const g=coastWin(),coins=g.rewards.coins;
 for(const item of [...coins,...g.rewards.chests,...g.rewards.clocks])assert.ok(containsRegion(g.world,item.x,item.y));
 const nearest=coins.map((a,i)=>Math.min(...coins.filter((_,j)=>j!==i).map(b=>Math.hypot(a.x-b.x,a.y-b.y))));
 assert.ok(Math.min(...nearest)>=.58-1e-7);assert.ok(nearest.filter(d=>d<1.5).length>=20);assert.ok(nearest.filter(d=>d>2).length>=10);
});
test('token rolls by actual travelled distance and not while standing still or jumping home',()=>{
 const g=createGame({seed:7,bots:0}),p=g.players[0];assert.equal(p.rollAngle,0);
 movePlayer(g,0,p.x+.3,p.y);assert.ok(p.rollAngle>0);const before=p.rollAngle;
 stepGame(g,.3);assert.equal(p.rollAngle,before);
});
