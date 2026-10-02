import test from 'node:test';
import assert from 'node:assert/strict';
import {createEconomy,bankMinerals,purchase,winchPrice,mineTheme,applyMineTheme,selectBlastTarget} from '../goldminer-sites/progression.js';
test('starter funds can buy supplies without counting as mined score',()=>{
 const e=createEconomy();assert.equal(e.wallet,5000);assert.equal(e.earned,0);
 bankMinerals(e,650);assert.equal(e.wallet,5650);assert.equal(e.earned,650);
 assert.equal(purchase(e,'dynamite'),true);assert.equal(e.wallet,5500);assert.equal(e.earned,650);
});
test('explosives target the heaviest loaded mineral instead of the first diamond',()=>{
 const minerals=[{id:1,kind:'diamond',weight:.8},{id:2,kind:'rock',weight:5}];
 const hooks=[{grabbedId:1,mode:'retract'},{grabbedId:2,mode:'retract'},{grabbedId:null,mode:'retract'}];
 assert.equal(selectBlastTarget(hooks,minerals).grabbedId,2);
 assert.equal(selectBlastTarget([],minerals),undefined);
});
test('winch upgrades are bounded and cannot overspend',()=>{
 const e=createEconomy();assert.equal(winchPrice(e),400);
 for(let i=0;i<3;i++)assert.equal(purchase(e,'winch'),true);
 assert.equal(e.winch,3);assert.equal(purchase(e,'winch'),false);
 e.wallet=0;assert.equal(purchase(e,'dynamite'),false);
 assert.equal(e.wallet,0);assert.equal(purchase(e,'unknown'),false);
});
test('mine challenges keep target counts and ids while changing relevant rewards or weight',()=>{
 const items=[{id:1,kind:'rock',weight:4,value:30},{id:2,kind:'diamond',weight:.8,value:500}];
 const heavy=applyMineTheme(items,2),gems=applyMineTheme(items,3);
 assert.equal(heavy.length,items.length);assert.deepEqual(heavy.map(i=>i.id),[1,2]);
 assert.equal(heavy[0].weight,5);assert.equal(gems[1].value,750);
 assert.equal(items[0].weight,4);assert.equal(mineTheme(4).name,mineTheme(1).name);
});
