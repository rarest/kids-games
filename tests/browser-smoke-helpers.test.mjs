import test from 'node:test';
import assert from 'node:assert/strict';
import { canvasHasRgbVariation } from './browser-smoke-helpers.mjs';

const opaquePixels=(red=0,green=0,blue=0)=>{
  const pixels=new Uint8ClampedArray(194*4);
  for(let offset=0;offset<pixels.length;offset+=4){pixels[offset]=red;pixels[offset+1]=green;pixels[offset+2]=blue;pixels[offset+3]=255}
  return pixels;
};

test('canvas content guard rejects opaque blank pixels and requires RGB variation',()=>{
  assert.equal(canvasHasRgbVariation(opaquePixels()),false,'alpha:false black canvas is still blank');
  assert.equal(canvasHasRgbVariation(opaquePixels(24,16,37)),false,'a single known background color has no rendered detail');
  const rendered=opaquePixels(24,16,37);rendered[388]=93;
  assert.equal(canvasHasRgbVariation(rendered),true,'a second sampled RGB value proves paint variation');
});
