import test from 'node:test';
import assert from 'node:assert/strict';
import { createCampaign,completeArea,availableAreas } from '../rescue/campaign.js';
import { getLevel } from '../rescue/levels.js';
import { createGame,stepGame,finishBonus } from '../rescue/core.js';

test('branch progression unlocks original route and retains optional replay',()=>{
 const c=createCampaign();assert.deepEqual(availableAreas(c),['0']);assert.equal(completeArea(c,'J'),false);
 completeArea(c,'0');assert.deepEqual(availableAreas(c),['0','A','B']);
 completeArea(c,'A');assert.ok(availableAreas(c).includes('C'));assert.ok(!availableAreas(c).includes('D'));
 completeArea(c,'C');completeArea(c,'D');assert.ok(availableAreas(c).includes('E'));assert.ok(availableAreas(c).includes('F'));
 completeArea(c,'F');for(const id of ['G','H','I','J']){assert.ok(availableAreas(c).includes(id));completeArea(c,id);}
 assert.equal(c.ending,true);assert.ok(!c.completed.includes('B'));assert.ok(availableAreas(c).includes('B'));
 completeArea(c,'B');completeArea(c,'E');assert.equal(c.completed.length,11);
});
test('real exit walk enters bonus, then unlocks next area; J reaches rescue ending directly',()=>{
 const c=createCampaign();
 const initial=getLevel('0');const level={...initial,width:20,platforms:[{id:'f',x:0,y:1,w:20,h:1}],spawn:{x:2,y:1},objects:[],enemies:[],hazards:[],pickups:[],boss:null,exit:{x:5,y:1}};
 const s=createGame(level,{campaign:c});for(let f=0;f<35;f++)stepGame(s,[{move:1}],1/60);
 assert.equal(s.status,'bonus');assert.ok(!c.completed.includes('0'));finishBonus(s);assert.ok(c.completed.includes('0'));assert.ok(availableAreas(c).includes('B'));
 for(const id of ['B','D','F','G','H','I'])completeArea(c,id);
 const j=createGame({...level,id:'J',name:'Fat Cat'},{campaign:c});for(let f=0;f<35;f++)stepGame(j,[{move:1}],1/60);
 assert.equal(j.status,'cleared');assert.equal(j.ending,true);assert.equal(c.ending,true);
});
