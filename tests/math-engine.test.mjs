import test from 'node:test';
import assert from 'node:assert/strict';

const fresh = () => ({version:1,lessons:{},items:{},session:null});
const day = n => Date.parse(`2026-10-${String(n).padStart(2,'0')}T00:00:00+08:00`);
async function modules() {
  let engine, lessons;
  await assert.doesNotReject(async () => {
    engine = await import('../math/engine.js');
    lessons = (await import('../math/curriculum.js')).LESSONS;
  }, 'published math curriculum and canonical engine must be available');
  return {engine,lessons};
}
function finish(engine,progress,session,now=session.startedAt) {
  while(session.index<session.steps.length) {
    const step=session.steps[session.index];
    assert.ok(engine.recordAnswer(progress,session,step,step.kind==='question'?step.answer:step.kind==='expression'?{selfReported:true}:{visited:true},{now}));
    assert.equal(engine.advance(session),true);
  }
}
function reach(engine,progress,session,kind='question') {
  while(session.steps[session.index].kind!==kind) {
    const step=session.steps[session.index];
    assert.ok(engine.recordAnswer(progress,session,step,{visited:true},{now:session.startedAt}));
    assert.equal(engine.advance(session),true);
  }
  return session.steps[session.index];
}

test('math steps rebuild canonical source, preserve widgets and retain stable review identity',async()=>{
  const {engine,lessons}=await modules(),lesson=lessons[0],steps=engine.buildSteps(lesson);
  assert.deepEqual(steps.map(s=>s.kind),lesson.steps.map(s=>s.kind));
  for(const [i,step] of steps.entries()) {
    assert.equal(step.id,`${lesson.id}:${step.kind}:${i}`);
    if(step.kind==='question')assert.equal(step.itemKey,`${lesson.id}:question:${i}`);
    if(step.widget)assert.deepEqual(step.widget,lesson.steps[i].widget);
  }
  const session=engine.createSession({...lesson,steps:[]},{now:day(7)});
  assert.deepEqual(session.steps,steps);
  const question=steps.find(s=>s.kind==='question');
  assert.deepEqual(engine.buildSteps(lesson,{review:true,reviewKeys:[question.itemKey]}),[question]);
  assert.equal(engine.createSession(lesson,{now:day(7),review:true,reviewKeys:['unknown']}),null);
  assert.equal(engine.createSession(lesson,{now:day(7),reviewKeys:[question.itemKey]}),null);
});

test('math integer input uses full NFKC normalized values, rejecting partial numeric parses',async()=>{
  const {engine,lessons}=await modules();
  const step=lessons.flatMap(l=>engine.buildSteps(l)).find(s=>s.kind==='question'&&!s.choices&&/^\d+$/.test(s.answer));
  assert.ok(step,'course provides an integer input question');
  const wide=[...step.answer].map(c=>String.fromCharCode(c.charCodeAt(0)+0xfee0)).join('');
  assert.equal(engine.checkAnswer(step,` ００${wide} `),true);
  for(const selected of [step.answer+'x',step.answer+'.0',step.answer+'e0','',null,Number(step.answer),'Infinity'])assert.equal(engine.checkAnswer(step,selected),false);
  assert.equal(engine.checkAnswer({...step,answer:'evil'},'evil'),false,'answer is recovered from published curriculum');
  assert.equal(engine.checkAnswer({...step,id:'unknown'},step.answer),false);
});

test('fractions accept equivalent values with nonzero denominators and choices retain exact allowlists',async()=>{
  const {engine,lessons}=await modules(),steps=lessons.flatMap(l=>engine.buildSteps(l));
  const fraction=steps.find(s=>s.kind==='question'&&!s.choices&&/^\d+\/\d+$/.test(s.answer));
  assert.ok(fraction,'course provides a fraction input question');
  const [n,d]=fraction.answer.split('/').map(BigInt);
  assert.equal(engine.checkAnswer(fraction,`${n*2n}/${d*2n}`),true);
  assert.equal(engine.checkAnswer(fraction,` ${n} ／ ${d} `),true);
  for(const invalid of ['1/0','1/2/3',fraction.answer+'x','0.5','-1/-2'])assert.equal(engine.checkAnswer(fraction,invalid),false);
  const choice=steps.find(s=>s.kind==='question'&&s.choices);
  assert.ok(choice);
  assert.equal(engine.checkAnswer(choice,choice.answer),true);
  assert.equal(engine.checkAnswer(choice,` ${choice.answer} `),false,'unpublished choices are rejected');
});

test('first wrong answer alone affects mastery; retries preserve error and duplicate correct clicks are ignored',async()=>{
  const {engine,lessons}=await modules(),progress=fresh(),session=engine.createSession(lessons[0],{now:day(7)});
  const step=reach(engine,progress,session);
  const wrong=step.choices?step.choices.find(c=>c!==step.answer):'999999999999999';
  const first=engine.recordAnswer(progress,session,{...step,answer:wrong},wrong,{now:day(7)});
  assert.equal(first.correct,false);assert.equal(first.firstAttempt,true);assert.equal(first.selected,wrong);
  assert.equal(engine.advance(session),false);
  const retry=engine.recordAnswer(progress,session,step,step.answer,{hinted:true,now:day(7)+1});
  assert.equal(retry.correct,true);assert.equal(retry.firstAttempt,false);assert.equal(retry.item,null);
  const before=JSON.stringify({progress,session});
  assert.equal(engine.recordAnswer(progress,session,step,step.answer,{now:day(7)+2}),null);
  assert.equal(JSON.stringify({progress,session}),before);
  assert.equal(session.answers[step.id].correct,false);
  assert.equal(session.answers[step.id].latest.hinted,true);
  assert.equal(progress.items[step.itemKey].incorrect,1);assert.equal(progress.items[step.itemKey].correct,0);
  assert.equal(engine.advance(session),true);finish(engine,progress,session,day(7)+3);
  assert.equal(engine.completeLesson(progress,session,{now:day(7)+4}),true);
  const count=session.steps.filter(s=>s.kind==='question').length;
  assert.equal(progress.lessons[lessons[0].id].bestAccuracy,(count-1)/count);
});

test('saved sessions reconstruct feedback and discard forged steps, skipped visits and correctness',async()=>{
  const {engine,lessons}=await modules(),progress=fresh(),session=engine.createSession(lessons[0],{now:day(7)});
  const step=reach(engine,progress,session),wrong=step.choices?step.choices.find(c=>c!==step.answer):'999999999999999';
  engine.recordAnswer(progress,session,step,wrong,{now:day(7)});progress.session=session;
  const raw=structuredClone(progress);raw.session.steps=[];raw.session.feedback={correct:true};raw.session.answers[step.id].correct=true;
  const restored=engine.loadProgress(raw);
  assert.deepEqual(restored.session.steps,engine.buildSteps(lessons[0]));
  assert.equal(restored.session.feedback.correct,false);
  assert.equal(restored.session.answers[step.id].correct,false);
  assert.equal(engine.recordAnswer(restored,restored.session,step,step.answer,{now:day(7)+1}).firstAttempt,false);
  assert.equal(restored.items[step.itemKey].incorrect,1);
  const forged=engine.createSession(lessons[0],{now:day(7)});forged.index=forged.steps.length;
  forged.answers=Object.fromEntries(forged.steps.map(s=>[s.id,{correct:true}]));
  assert.equal(engine.completeLesson(fresh(),forged,{now:day(8)}),false);
  assert.equal(engine.loadProgress({...fresh(),session:forged}).session.index,0);
});

test('explicit expression self-report, complete learning and targeted review roundtrip for all math lessons',async()=>{
  const {engine,lessons}=await modules(),original=JSON.stringify(lessons),progress=fresh();
  for(const [i,lesson] of lessons.entries()) {
    const session=engine.createSession(lesson,{now:day(7)+i});
    assert.equal(engine.advance(session),false);
    finish(engine,progress,session);
    assert.deepEqual(session.answers[session.steps.find(s=>s.kind==='expression').id],{attempted:true,selfReported:true});
    assert.equal(engine.completeLesson(progress,session,{now:day(8)}),true);
    assert.equal(engine.completeLesson(progress,session,{now:day(8)}),false);
    progress.session=session;assert.deepEqual(engine.loadProgress(JSON.stringify(progress)),progress);
  }
  assert.equal(JSON.stringify(lessons),original);
  const lesson=lessons[0],review=engine.createSession(lesson,{now:day(9),review:true});
  finish(engine,progress,review);
  assert.equal(engine.completeLesson(fresh(),review,{now:day(9)}),false);
  assert.equal(engine.completeLesson(progress,review,{now:day(9)}),true);
  assert.equal(progress.lessons[lesson.id].attempts,1);assert.equal(progress.lessons[lesson.id].reviews,1);
  assert.equal(engine.recommendLesson(lessons,progress),null);
});

test('China-day spaced review advances 1, 3, 7 days and hints stay due',async()=>{
  const {engine,lessons}=await modules(),key=engine.buildSteps(lessons[0]).find(s=>s.itemKey).itemKey,progress=fresh();
  engine.recordItemAnswer(progress,key,true,{now:day(7)});
  assert.equal(progress.items[key].nextReview,day(8));
  engine.recordItemAnswer(progress,key,true,{now:day(7)+1});assert.equal(progress.items[key].streak,1);
  engine.recordItemAnswer(progress,key,true,{now:day(8)});assert.equal(progress.items[key].nextReview,day(11));
  engine.recordItemAnswer(progress,key,true,{now:day(11)});assert.equal(progress.items[key].nextReview,day(18));
  engine.recordItemAnswer(progress,key,true,{hinted:true,now:day(12)});
  assert.deepEqual(engine.dueItems(progress,day(12)),[key]);
  assert.equal(engine.recordItemAnswer(progress,'__proto__',true,{now:day(12)}),null);
  assert.deepEqual(engine.loadProgress('{broken'),fresh());
});

test('invalid math selections, fake step IDs and future steps cannot change a session',async()=>{
  const {engine,lessons}=await modules();
  const lesson=lessons.find(l=>engine.buildSteps(l).some(s=>s.kind==='question'&&!s.choices&&/^\d+$/.test(s.answer)));
  const progress=fresh(),session=engine.createSession(lesson,{now:day(7)});
  const original=JSON.stringify({progress,session});
  assert.equal(engine.recordAnswer(progress,session,session.steps[1],{visited:true},{now:day(7)}),null);
  assert.equal(engine.recordAnswer(progress,session,{...session.steps[0],id:'__proto__'},{visited:true},{now:day(7)}),null);
  assert.equal(engine.recordAnswer(progress,session,session.steps[0],{visited:true},{now:day(6)}),null);
  assert.equal(JSON.stringify({progress,session}),original);
  while(session.steps[session.index].kind!=='question'||session.steps[session.index].choices) {
    const step=session.steps[session.index];
    assert.ok(engine.recordAnswer(progress,session,step,step.kind==='question'?step.answer:{visited:true},{now:day(7)}));
    assert.equal(engine.advance(session),true);
  }
  const step=session.steps[session.index],before=JSON.stringify({progress,session});
  for(const invalid of [step.answer+'x',step.answer+'.0',step.answer+'e0','',0])assert.equal(engine.recordAnswer(progress,session,step,invalid,{now:day(7)}),null);
  assert.equal(JSON.stringify({progress,session}),before);
});
