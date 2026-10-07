import test from 'node:test';
import assert from 'node:assert/strict';
import {COURSE,LESSONS} from '../math/curriculum.js';

test('every lesson can complete with six stable independent questions and an explanation sequence',()=>{
 assert.ok(LESSONS.length>=32&&LESSONS.length<=40);const ids=new Set();let numeric=false,fraction=false;
 for(const l of LESSONS){assert.ok(!ids.has(l.id));ids.add(l.id);assert.ok(COURSE.units.some(u=>u.id===l.unitId));assert.ok(l.pages.length&&l.goal);
 for(const k of ['preview','explore','learn','expression','recap'])assert.ok(l.steps.some(s=>s.kind===k),`${l.id}: ${k}`);
 const qs=l.steps.filter(s=>s.kind==='question');assert.ok(qs.length>=6,l.id);assert.ok(qs[0].choices,`${l.id} starts with choice`);
 l.steps.forEach((s,i)=>{assert.equal(s.id,`${l.id}:${s.kind}:${i}`);if(s.kind!=='question')return;assert.equal(typeof s.answer,'string');assert.ok(s.prompt&&s.hint&&s.explanation);assert.notEqual(s.hint,s.explanation);assert.notEqual(s.explanation,s.answer);if(s.choices){assert.equal(new Set(s.choices).size,s.choices.length);assert.equal(s.choices.filter(x=>x===s.answer).length,1);}else{numeric ||= /^\d+$/.test(s.answer);fraction ||= /^\d+\/\d+$/.test(s.answer);}});
 }assert.ok(numeric&&fraction,'both numeric and fraction keyboard input exist');
});
test('every textbook page and activity can be found from course units and lessons',()=>{
 const pages=new Set(LESSONS.flatMap(l=>l.pages));for(let i=1;i<=103;i++)assert.ok(pages.has(i),`missing page ${i}`);
 assert.deepEqual(COURSE.units.filter(u=>Number.isInteger(u.number)).map(u=>u.number),[1,2,3,4,5,6,7]);assert.equal(COURSE.units.filter(u=>u.number===null).length,2);
 const topics=new Set(LESSONS.flatMap(l=>l.topics));for(const t of ['不同方向观察','小正方体投影','附页折叠','同级运算','先乘除后加减','小括号','两步问题','毫米','分米','千米','估测','克','千克','吨','曹冲称象','口算乘法','笔算乘法','连续进位','中间有0','末尾有0','估算乘法','乘法问题','编码','线段射线直线','角','直角','锐角钝角','画角','等分','分子分母','单位分数比较','同分母比较','同分母加减','1减分数','一组物体的分数','搭配','综合复习'])assert.ok(topics.has(t),`missing ${t}`);
});
test('explore configurations produce the same mathematical object as the teaching situation',()=>{
 const types=new Set(['view','order','ruler','units','mass','multiply','code','angle','fraction','groups','match','net']);
 for(const l of LESSONS)for(const s of l.steps){if(!s.widget)continue;assert.ok(types.has(s.widget.type));if(s.widget.type==='fraction'){assert.ok(s.widget.numerator<=s.widget.denominator);assert.ok(s.widget.denominator>0);}if(s.widget.type==='groups')assert.equal(s.widget.total%s.widget.denominator,0);}
});
