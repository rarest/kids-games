import test from 'node:test';
import assert from 'node:assert/strict';
import {openBrowser} from './game-browser-harness.mjs';

test('browser evaluation preserves CDP special numbers, especially rounded negative zero',{timeout:30000},async()=>{
 const b=await openBrowser();try{
  assert.ok(Object.is(await b.evaluate('Number("-0.00")'),-0),'a valid negative-zero offset must not become undefined');
  assert.ok(Number.isNaN(await b.evaluate('NaN')),'real NaN must remain detectable');
  assert.equal(await b.evaluate('Infinity'),Infinity);assert.equal(await b.evaluate('-Infinity'),-Infinity);
  assert.equal(await b.evaluate('42'),42);assert.equal(await b.evaluate('undefined'),undefined);assert.equal(await b.evaluate('null'),null);
 }finally{b.close()}
});
