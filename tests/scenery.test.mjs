import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, getLevel } from '../maze/levels.js';
import {
  actorIsVisible,
  ambientActorsFor,
  sceneProfileFor,
  treeShadowFor
} from '../maze/scenery.js';
import { shadowOffsetFor } from '../maze/wall-geometry.js';
import * as scenery from '../maze/scenery.js';

test('every campaign position exposes trees and its required signature elements', () => {
  const required = [
    ['trees','grass','leaves'], ['trees','bees','honey','lanterns'], ['trees','water','ripples','coral'],
    ['trees','petals','pearls'], ['trees','vines','fireflies'], ['trees','crystals','mapleLeaves'],
    ['trees','crystals','purpleRefraction'], ['trees','roses','petals'], ['trees','goldLeaves','goldTreeShadow'],
    ['trees','crystals','candy'], ['trees','water','ripples','snow'], ['trees','laurelLeaves','lanterns'],
    ['trees','roses','petals'], ['trees','clouds','gems'], ['trees','stars','meteors'],
    ['trees','goldLeaves','stars'], ['trees','clouds','sunsetRefraction'], ['trees','aurora','crownLights'],
    ['trees','goldLeaves','centerCrown']
  ];
  LEVELS.forEach((level, index) => {
    const profile = sceneProfileFor(level);
    for (const field of required[index]) assert.ok(profile[field], `${level.id}:${field}`);
  });
});

test('ambient decoration remains bounded and petals always have a source', () => {
  for (const level of LEVELS) {
    const profile = sceneProfileFor(level), actors = ambientActorsFor(profile, 37);
    assert.ok(actors.length <= 96, level.id);
    if (profile.petals) assert.ok(profile.trees || profile.roses, level.id);
  }
});

test('ambient actors are deterministic visual records with strict per-type caps', () => {
  const profile = sceneProfileFor(getLevel('reward-1'));
  const first = ambientActorsFor(profile, 934), second = ambientActorsFor(profile, 934);
  assert.deepEqual(first, second);
  assert.notDeepEqual(first, ambientActorsFor(profile, 935));
  const counts = Object.groupBy(first, actor => actor.type);
  assert.ok((counts.tree?.length || 0) <= 6);
  assert.ok((counts.bee?.length || 0) <= 10);
  for (const actor of first) {
    assert.deepEqual(Object.keys(actor).sort(), ['phase','scale','speed','type','x','y']);
    assert.ok(Number.isFinite(actor.x) && Number.isFinite(actor.y));
  }
});

test('tree shadows keep the wall-light direction while only scale and alpha breathe', () => {
  const light = sceneProfileFor(getLevel('normal-1'));
  const tree = { type: 'tree', x: .2, y: .4, phase: .8, speed: .1, scale: 1.2 };
  const early = treeShadowFor(tree, light, 0), late = treeShadowFor(tree, light, 1700);
  const expected = shadowOffsetFor(light, tree.scale * .24);
  assert.deepEqual({ x: early.x, y: early.y }, expected);
  assert.deepEqual({ x: late.x, y: late.y }, expected);
  assert.notEqual(early.scaleX, late.scaleX);
  assert.notEqual(early.alpha, late.alpha);
  assert.ok(Math.abs(early.scaleX - 1) <= .04 && Math.abs(late.scaleX - 1) <= .04);
});

test('viewport culling retains a one-tile margin and rejects distant actors', () => {
  const viewport = { width: 390, height: 400 }, tile = 24;
  assert.equal(actorIsVisible({ x: -23, y: 200 }, viewport, tile), true);
  assert.equal(actorIsVisible({ x: 413, y: 200 }, viewport, tile), true);
  assert.equal(actorIsVisible({ x: -25, y: 200 }, viewport, tile), false);
  assert.equal(actorIsVisible({ x: 200, y: 425 }, viewport, tile), false);
});

test('the final crown is routed above maze walls while other ambience stays behind them', () => {
  const actors = ambientActorsFor(sceneProfileFor(getLevel('normal-10')), 37);
  const crown = actors.find(actor => actor.type === 'center-crown');
  assert.equal(scenery.ambientLayerFor(crown), 'decor');
  assert.equal(scenery.ambientLayerFor(actors.find(actor => actor.type === 'tree')), 'ambient');
});

test('coral water actors include the falling drop, ripple rings and fish shadows', () => {
  const types = new Set(ambientActorsFor(sceneProfileFor(getLevel('normal-2')), 37).map(actor => actor.type));
  for (const type of ['water-drop','ripple','bubble','coral','fish-shadow']) assert.ok(types.has(type), type);
});

test('the final crown is anchored to map-top center and leaves view with the world camera',()=>{
  const level=getLevel('normal-10'),viewport={width:390,height:400},tile=24;
  const crown=ambientActorsFor(sceneProfileFor(level),37).find(actor=>actor.type==='center-crown');
  const topCamera={x:-120,y:8},lowerCamera={x:-120,y:-432};
  const top=scenery.actorScreenPointFor(crown,{viewport,now:0,camera:topCamera,tile,level});
  const lower=scenery.actorScreenPointFor(crown,{viewport,now:0,camera:lowerCamera,tile,level});
  assert.deepEqual(top,{x:topCamera.x+level.rows[0].length*tile*.5,y:topCamera.y+tile*.62});
  assert.equal(lower.x,top.x);assert.equal(lower.y,top.y-440);
  assert.equal(actorIsVisible(lower,viewport,tile),false);
});

test('tree palettes visibly distinguish cherry, laurel, ice, crimson and gold sources',()=>{
  const cases=[
    ['reward-2','#f3a6c0'],
    ['reward-6','#879b53'],
    ['normal-6','#9edfff'],
    ['normal-7','#b63c5d'],
    ['normal-5','#e9b83e']
  ];
  for(const [levelId,signature] of cases){
    const level=getLevel(levelId),palette=scenery.treePaletteFor(sceneProfileFor(level),level.theme);
    assert.ok(palette.leaves.includes(signature),`${levelId}:${signature}`);
    assert.equal(palette.leaves.length,4);
    assert.ok(palette.trunk.length>=2);
  }
});

test('water drops and ripples share deterministic impact cycles at the same source point',()=>{
  const actors=ambientActorsFor(sceneProfileFor(getLevel('normal-2')),37);
  const drops=actors.filter(actor=>actor.type==='water-drop'),ripples=actors.filter(actor=>actor.type==='ripple');
  assert.equal(drops.length,2);assert.equal(ripples.length,2);
  for(const drop of drops){
    const ripple=ripples.find(candidate=>candidate.x===drop.x&&candidate.y===drop.y&&candidate.phase===drop.phase);
    assert.ok(ripple,'each drop must own a co-located ripple cycle');
    assert.equal(ripple.speed,drop.speed);assert.equal(ripple.scale,drop.scale);
  }
});

test('a water impact hides the drop then expands two or three faint ripple rings',()=>{
  const actor={type:'water-drop',x:.5,y:.5,phase:0,speed:1,scale:1.2};
  const falling=scenery.waterCycleStateFor(actor,0),impact=scenery.waterCycleStateFor(actor,5000);
  assert.ok(falling.dropAlpha>0);assert.equal(falling.rippleAlpha,0);
  assert.equal(impact.dropAlpha,0);assert.ok(impact.rippleAlpha>0&&impact.rippleAlpha<=.16);
  assert.ok(impact.rippleRadius>0);assert.ok([2,3].includes(impact.rings));
});
