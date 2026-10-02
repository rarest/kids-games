import test from 'node:test';
import assert from 'node:assert/strict';
import {SKINS,createProfile,buySkin,equipSkin,exchangeDiamonds} from '../territory/profile.js';
test('fifty coins exchange for one hundred diamonds and buy one permanent animal without touching score',()=>{
 const p=createProfile({coins:60,score:99});assert.equal(exchangeDiamonds(p,50),true);assert.equal(p.coins,10);assert.equal(p.diamonds,100);assert.equal(p.score,99);
 const s=SKINS.find(s=>s.id==='animal-elephant');assert.ok(buySkin(p,s.id));assert.equal(p.diamonds,0);assert.equal(p.coins,10);assert.equal(buySkin(p,s.id),false);assert.ok(equipSkin(p,s.id));
 const loaded=createProfile(JSON.parse(JSON.stringify(p)));assert.equal(loaded.selected,s.id);assert.equal(loaded.score,99);assert.equal(loaded.diamonds,0);assert.ok(loaded.owned.includes(s.id));
});
test('animal purchases never spend coins as a substitute and invalid exchanges change nothing',()=>{
 const p=createProfile({coins:1000,diamonds:99});const saved=JSON.stringify(p);assert.equal(buySkin(p,'animal-rabbit'),false);
 for(const amount of [0,-1,.5,NaN,Infinity,'50',1001]){assert.equal(exchangeDiamonds(p,amount),false);assert.equal(JSON.stringify(p),saved)}
});
test('animal catalog adds twenty real species while original sixty and hidden gift pool remain unchanged',()=>{
 assert.equal(SKINS.length,80);const animals=SKINS.filter(s=>s.tier==='special');assert.equal(animals.length,20);assert.equal(new Set(animals.map(s=>s.animal)).size,20);
 for(const s of animals){assert.equal(s.currency,'diamonds');assert.equal(s.price,100)}
 for(const tier of ['normal','fine','hidden'])assert.equal(SKINS.filter(s=>s.tier===tier).length,20);
 assert.equal(createProfile({diamonds:Infinity}).diamonds,0);assert.equal(createProfile().diamonds,0);assert.equal(createProfile({diamonds:3.7}).diamonds,3);
});
