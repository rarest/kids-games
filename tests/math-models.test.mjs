import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateExpression,multiplicationTrace,convertLength,classifyAngle,fractionParts,groupShare,projectBlocks} from '../math/models.js';

test('mixed calculations keep equal-priority order and bracket priority',()=>{
 for(const [s,w] of [['18-6+2',14],['24÷3×2',16],['8+4×3',20],['(8+4)×3',36],['36÷(3+3)',6],['40－12÷3',36],['20-(5-2)',17]]) assert.equal(evaluateExpression(s),w);
});
test('calculation parser rejects script, incomplete input and zero division',()=>{
 for(const s of ['globalThis.x=1','2+','(3+4','4/0','1.5+2','','2(3+1)']) assert.throws(()=>evaluateExpression(s));
});
test('multiplication trace preserves place value through repeated carries',()=>{
 const t=multiplicationTrace(268,4);assert.equal(t.result,1072);
 assert.deepEqual(t.steps,[{digit:8,carryIn:0,product:32,write:2,carryOut:3,place:1},{digit:6,carryIn:3,product:27,write:7,carryOut:2,place:10},{digit:2,carryIn:2,product:10,write:0,carryOut:1,place:100}]);assert.equal(t.finalCarry,1);
});
test('zero digit multiplication includes incoming carry',()=>{
 const t=multiplicationTrace(507,6);assert.equal(t.result,3042);assert.deepEqual(t.steps[1],{digit:0,carryIn:4,product:4,write:4,carryOut:0,place:10});assert.equal(multiplicationTrace(0,9).result,0);assert.equal(multiplicationTrace(240,3).result,720);
 assert.throws(()=>multiplicationTrace(2.5,3));assert.throws(()=>multiplicationTrace(12,10));
});
test('lengths convert through millimetres, with a kilometre thousand-metre step',()=>{
 for(const [v,f,t,w] of [[3,'km','m',3000],[45,'mm','cm',4.5],[7,'dm','cm',70],[120,'cm','m',1.2],[1,'m','mm',1000]])assert.equal(convertLength(v,f,t),w);
 assert.throws(()=>convertLength(1,'kg','cm'));assert.throws(()=>convertLength(-1,'cm','mm'));
});
test('angle boundaries are classified by opening only',()=>{
 for(const [d,w] of [[0,'零角'],[1,'锐角'],[89,'锐角'],[90,'直角'],[91,'钝角'],[179,'钝角'],[180,'平角'],[270,'优角'],[360,'周角']])assert.equal(classifyAngle(d),w);
 assert.throws(()=>classifyAngle(361));assert.throws(()=>classifyAngle(-1));
});
test('fraction parts preserve denominator and equally sized part count',()=>{
 const p=fractionParts(2,6);assert.equal(p.numerator,2);assert.equal(p.denominator,6);assert.deepEqual(p.parts,[true,true,false,false,false,false]);assert.equal(p.value,1/3);
 assert.deepEqual(fractionParts(0,4).parts,[false,false,false,false]);assert.deepEqual(fractionParts(4,4).parts,[true,true,true,true]);
 for(const x of [[1,0],[4,3],[1.5,3],[-1,3]])assert.throws(()=>fractionParts(...x));
});
test('group shares first divide the whole, then count selected groups',()=>{
 assert.deepEqual(groupShare(12,2,3),{groups:3,perGroup:4,selectedGroups:2,selected:8,total:12});assert.equal(groupShare(20,3,5).selected,12);assert.equal(groupShare(6,0,3).selected,0);assert.throws(()=>groupShare(10,1,3));
});
test('projections hide depth duplicates without losing height or width',()=>{
 const b=[[0,0,0],[1,0,0],[0,1,0],[0,0,1]];
 assert.deepEqual(projectBlocks(b,'front'),[[0,0],[1,0],[0,1]]);assert.deepEqual(projectBlocks(b,'right'),[[0,0],[1,0],[0,1]]);assert.deepEqual(projectBlocks(b,'top'),[[0,0],[1,0],[0,1]]);
 assert.equal(projectBlocks([[0,0,0],[0,1,0]],'front').length,1);assert.equal(projectBlocks([[0,0,0],[0,1,0]],'top').length,2);for(const d of ['back','constructor','__proto__'])assert.throws(()=>projectBlocks(b,d));
});

test('expression animation reduces only the next permitted operation',async()=>{
 const {expressionTrace}=await import('../math/models.js');
 assert.equal(typeof expressionTrace,'function');
 assert.deepEqual(expressionTrace('8+4×3'),[{before:'8+4×3',operation:'4×3',result:12,after:'8+12'},{before:'8+12',operation:'8+12',result:20,after:'20'}]);
 assert.deepEqual(expressionTrace('(8+4)×3').map(x=>[x.operation,x.after]),[['8+4','12×3'],['12×3','36']]);
 assert.deepEqual(expressionTrace('24÷3×2').map(x=>x.operation),['24÷3','8×2']);
 assert.deepEqual(expressionTrace('96−(14+15)').map(x=>[x.operation,x.after]),[['14+15','96−29'],['96−29','67']]);
});
