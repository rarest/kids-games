import test from 'node:test';
import assert from 'node:assert/strict';
import {validateAssessment} from '../english/speaking.js';
const result = () => ({score:76,accuracy:74,completeness:90,words:[{word:'Hello',score:76,errorType:'substitution'}],duration:1.3,engine:'local-phoneme'});
test('only finite bounded phoneme practice results can reach a score card',()=>{
 assert.equal(validateAssessment(result()).score,76);
 for(const bad of [
  {...result(),score:101}, {...result(),accuracy:null}, {...result(),completeness:NaN},
  {...result(),engine:'asr-confidence'}, {...result(),words:[]},
  {...result(),words:[{word:'Hello',score:-1}]}, {...result(),duration:0}, {...result(),duration:21},
 ]) assert.throws(()=>validateAssessment(bad));
});
