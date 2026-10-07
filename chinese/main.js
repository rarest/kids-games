import {COURSE,LESSONS} from './curriculum.js';
import {RECOGNIZE,WRITE,WORDS} from './appendices.js';
import {loadProgress,createSession,recordAnswer,advance,completeLesson,recommendLesson,dueItems,buildSteps} from './engine.js';
import {escapeHTML as esc,browserStorage} from '../shared/family-client.js';
import {mountClassroomNav} from '../shared/classroom-nav.js';
import {mountFamily} from './family.js';
import {unitArt} from './art.js';
import {MandarinReader} from './audio.js';
import audioManifest from './audio-manifest.js';
const root=document.querySelector('#courseRoot'),storage=browserStorage(),KEY='pearl-chinese-course-v1';
let raw;try{raw=storage.getItem(KEY);}catch{}
let progress=loadProgress(raw),storageKey=KEY,session=null,cloud,shownHint=false;
const seenHints=new Set();
function hintKey(){return `${storageKey}:hint:${session?.startedAt}:${session?.steps[session.index]?.id}`;}
function usedHint(){try{return seenHints.has(hintKey())||storage.getItem(hintKey())==='1';}catch{return seenHints.has(hintKey());}}
function toggleHint(){shownHint=!shownHint;if(shownHint){seenHints.add(hintKey());try{storage.setItem(hintKey(),'1');}catch{}}renderStep();}
const reader=new MandarinReader({manifest:audioManifest,onState:text=>{document.querySelector('#audioStatus').textContent=text;document.querySelector('#cnStop').hidden=!text;}});
function notice(text){document.querySelector('#notice').textContent=text;}
function save(event=null){if(session)progress.session=session;try{storage.setItem(storageKey,JSON.stringify(progress));}catch{notice('进度暂时无法保存，请保持页面打开。');}cloud?.onSave({progress:JSON.parse(JSON.stringify(progress)),event});}
function replaceProgress(raw,{storageKey:key=KEY,preserveView=false}={}){const wasLearning=!!session,next=loadProgress(raw),keepFinish=preserveView&&key===storageKey&&root.querySelector('.cn-finish')&&!next.session;storageKey=key;progress=next;if(keepFinish)return;if(preserveView&&wasLearning&&next.session){session=next.session;renderStep();}else{session=null;home();}}
function reviewItems() {
  return dueItems(progress).filter(key => progress.lessons[key.split(':')[0]]?.completed);
}
function hasUnfinishedLearning() {
  return progress.session && !progress.session.review && !progress.session.completedAt;
}
function protectLearning() {
  if (!hasUnfinishedLearning()) return false;
  const lesson = LESSONS.find(lesson => lesson.id === progress.session.lessonId);
  notice(`请先继续完成《${lesson.title}》，再来复习。你的学习位置和答题记录已保留。`);
  document.querySelector('#notice').scrollIntoView({block: 'center'});
  return true;
}
function home() {
 reader.cancel();
 if (session) save();
 session = null;
 shownHint = false;
 const lesson = recommendLesson(LESSONS, progress) || LESSONS[0];
 const resume = progress.session;
 const done = Object.values(progress.lessons).filter(lesson => lesson.completed).length;
 const due = (hasUnfinishedLearning() ? dueItems(progress) : reviewItems()).length;
 root.innerHTML=`<section class="cn-hero"><div><span class="cn-kicker">语文 · 三年级上册</span><h1>读课文，<br>发现新世界。</h1><p>听一段，想一想，说说你的发现。</p><span class="cn-progress-label">已走过 ${done} / 26 课</span></div>${unitArt(lesson.unitId)}</section><section class="cn-today"><div><span class="cn-kicker">${resume?'接着上次的小课':'今日小课'}</span><h2>${esc(lesson.title)}</h2><p>${esc(lesson.goal)}</p></div><button id="startChinese" class="cn-primary">${resume?'继续学习':'开始小课'} <span>→</span></button></section><div class="cn-section-title"><div><span class="cn-kicker">八个单元，慢慢发现</span><h2>我的语文旅程</h2></div><button id="cnDirectory">完整目录 ↗</button></div><section class="cn-units">${COURSE.units.map(u=>`<button class="cn-unit" data-unit="${u.id}">${unitArt(u.id)}<span>第${u.number}单元</span><strong>${esc(u.title)}</strong><small>${esc(u.description)}</small></button>`).join('')}</section><section class="cn-review"><div><h2>再想一想，就记得更牢</h2><p>${due?`${due} 个字词或理解练习，等你再试一次。`:'新学的字词和理解练习，会在这里等你回顾。'}</p></div><button id="cnReview" ${due?'':'disabled'}>复习错题与到期内容</button></section><p class="cn-source">${esc(COURSE.edition)}<br>课文按页整理；学习提示与练习为原创。表达与背诵由自己确认尝试。</p>`;
}
function start(id = null, {review = false, reviewKeys = []} = {}) {
  if (review && protectLearning()) return;
  const saved = progress.session;
  const lesson = LESSONS.find(lesson => lesson.id === (id || saved?.lessonId))
    || recommendLesson(LESSONS, progress) || LESSONS[0];
  if (review && !progress.lessons[lesson.id]?.completed) {
    notice(`请先完成《${lesson.title}》，再来复习。`);
    return;
  }
  reader.cancel();
  session = !id && saved ? saved : createSession(lesson, {review, reviewKeys});
  if (!session) return;
  notice('');
  shownHint = false;
  save();
  renderStep();
  focusStep();
}
function startReview() {
  if (protectLearning()) return;
  const keys = reviewItems();
  const lesson = LESSONS.find(lesson => buildSteps(lesson).some(step => keys.includes(step.itemKey)));
  if (lesson) start(lesson.id, {review: true, reviewKeys: keys});
}
function focusStep(){const h=root.querySelector('h1');if(h){h.tabIndex=-1;h.focus({preventScroll:true});h.scrollIntoView({block:'start'});}}
function renderStep(){if(!session)return home();const step=session.steps[session.index],lesson=LESSONS.find(l=>l.id===session.lessonId);if(!step)return finish();const scored=!!step.itemKey,answer=session.answers[step.id],correct=answer?.latest?.correct;const stage=['先想一想','读一段','认字词','读懂意思','说一说','背一背'][step.stage];let body='';
 if(step.kind==='preview')body=`<p class="cn-goal">这次的小目标：${esc(step.goal)}</p><div class="cn-text">${esc(step.prompt)}</div>${unitArt(lesson.unitId)}`;
 if(step.kind==='reading')body=`<div class="cn-text cn-paragraph">${esc(step.text)}</div><button id="cnListen" class="cn-listen">▶ 听这一段</button>`;
 if(step.kind==='word')body=`<div class="cn-word"><span>${esc(step.word.pinyin)}</span><strong>${esc(step.word.text)}</strong><p>${esc(step.word.meaning)}</p></div><p class="cn-example">${esc(step.word.example)}</p><button id="cnListen" class="cn-listen">▶ 听这个词</button>`;
 if(scored)body=`<div class="cn-text">${esc(step.prompt)}</div><div class="cn-choices">${step.choices.map((c,i)=>`<button data-answer="${i}" class="${answer?.latest?.selected===c?(correct?'is-correct':'is-retry'):''}" ${correct?'disabled':''}><span>${['A','B','C'][i]}</span>${esc(c)}</button>`).join('')}</div>${answer?`<div class="cn-feedback" role="status">${correct?`想清楚了！${esc(step.explanation)}`:'这次还没选对。再读题，或看看提示，再试一次。'}</div>`:''}`;
 if(step.kind==='expression')body=`<div class="cn-text">${esc(step.prompt)}</div><p class="cn-honest">先对家人说一说，也可以写在自己的本子上。完成后告诉珠珠：我已尝试。</p>`;
 if(step.kind==='recite')body=`<div class="cn-text">试着背一背：${esc(step.parts.join('、'))}</div><p class="cn-honest">可以先回想画面，再试着背。这里记录的是你的自评尝试。</p><details><summary>需要时，看看原文</summary>${lesson.paragraphs.map(p=>`<p class="cn-text">${esc(p.text)}</p>`).join('')}</details>${step.dictation?`<p>默写要求：${esc(Array.isArray(step.dictation)?step.dictation.join('、'):step.dictation)}</p>`:''}`;
 const hint=step.hint||step.hints?.join(' ');root.innerHTML=`<section class="cn-study"><div class="cn-study-top"><button id="cnExit">← 保存并退出</button><span>${session.index+1} / ${session.steps.length} 步</span></div><progress max="${session.steps.length}" value="${session.index}" aria-label="本课进度"></progress><div class="cn-study-meta"><span>${esc(stage)}</span><span>课本第 ${step.page||step.word?.page||lesson.pages[0]} 页</span></div><h1>${esc(lesson.title)}</h1>${body}${hint?`<button id="cnHint" class="cn-text-button">${shownHint?'收起提示':'给我一个小提示'}</button><p class="cn-hint" ${shownHint?'':'hidden'}>${esc(hint)}</p>`:''}<div class="cn-step-action"><button id="cnNext" class="cn-primary" ${scored&&!correct?'disabled':''}>${['expression','recite'].includes(step.kind)?'我已尝试，继续':scored?'继续 →':step.kind==='preview'?'开始读一段 →':'我读好了，继续 →'}</button></div></section>`;
}
function answer(index){const step=session?.steps[session.index];if(!step?.itemKey)return;const result=recordAnswer(progress,session,step,step.choices[index],{hinted:usedHint()});if(!result)return;save(result.scored&&result.firstAttempt?{contentId:session.lessonId,kind:'answer',result:{itemKey:result.itemKey,correct:result.correct,hinted:result.hinted}}:null);renderStep();}
function next(){const step=session?.steps[session.index];if(!step)return;if(!step.itemKey)recordAnswer(progress,session,step,['expression','recite'].includes(step.kind)?{selfReported:true}:{visited:true});if(!advance(session))return;reader.cancel();shownHint=false;save();renderStep();focusStep();}
function finish() {
  const active = session;
  const lesson = LESSONS.find(lesson => lesson.id === active.lessonId);
  if (!completeLesson(progress, active)) {
    save();
    notice('这次还没有完成，学习记录已保留。请回到语文旅程，继续学习或从目录打开课文。');
    root.innerHTML = `<section class="cn-reader"><h1>还需要继续学习</h1><p>这次还没有完成《${esc(lesson.title)}》，可以回到目录继续学习。</p><button id="cnHome" class="cn-primary">回到语文旅程 →</button></section>`;
    return;
  }
  session = null;
  progress.session = null;
  save({contentId: lesson.id, kind: 'completion', result: {session: active}});
  root.innerHTML = `<section class="cn-finish">${unitArt(lesson.unitId)}<span class="cn-kicker">又多了一点自己的发现</span><h1>${active.review?'这次复习，完成了！':'这一课，完成了！'}</h1><p>${esc(lesson.goal)}</p><p>表达和背诵记录了你的尝试。隔一天，再来回想今天读过的内容。</p><button id="cnHome" class="cn-primary">回到语文旅程 →</button></section>`;
}
const dialog=document.querySelector('#directory');
function directory(unit){dialog.innerHTML=`<div class="cn-dialog-heading"><h2>课本完整目录</h2><button id="cnCloseDirectory" autofocus>关闭</button></div><p>26 篇课文 · 单元配套 · 字词附录</p>${COURSE.units.map(u=>`<section id="dir-${u.id}"><h3>第${u.number}单元 · ${esc(u.title)}</h3><div class="cn-directory-list">${LESSONS.filter(l=>l.unitId===u.id).map(l=>`<button data-lesson="${l.id}"><strong>${l.number}. ${esc(l.title)}</strong><small>第${l.pages[0]}页 ${progress.lessons[l.id]?.completed?'· 已学':''}</small></button>`).join('')}${u.extras.map((x,i)=>`<button data-extra="${u.id}:${i}"><span>${esc(x.kind)} · ${esc(x.title)}</span><small>第${x.pages.join('、')}页</small></button>`).join('')}</div></section>`).join('')}<h3>字词附录</h3><div class="cn-directory-list">${[['recognize','识字表 · 250 个新字 / 27 个已学蓝字'],['write','写字表 · 按课练写'],['words','词语表 · 听读复习']].map(([id,label])=>`<button data-appendix="${id}">${label}</button>`).join('')}</div>`;dialog.showModal();if(unit)dialog.querySelector(`#dir-${unit}`).scrollIntoView({block:'start'});}
function readingView(title,body){reader.cancel();if(session)save();session=null;root.innerHTML=`<section class="cn-reader"><button id="cnHome">← 回到语文旅程</button><h1>${esc(title)}</h1>${body}</section>`;root.scrollIntoView({block:'start'});}
function openExtra(key){const [id,n]=key.split(':'),extra=COURSE.units.find(u=>u.id===id).extras[Number(n)];readingView(extra.title,`<p class="cn-kicker">${esc(extra.kind)} · 课本第${extra.pages.join('、')}页</p>${extra.examples.map((text,i)=>`<div class="cn-extra-paragraph"><p class="cn-text">${esc(text)}</p><button data-extra-listen="${i}" data-extra-key="${key}" aria-label="听第${i+1}段">▶ 听这一段</button></div>`).join('')}<div class="cn-hint"><strong>试一试</strong><p>${esc(extra.prompt)}</p><p>${esc(extra.hints.join(' '))}</p></div>`);}
function appendix(kind){const groups={recognize:RECOGNIZE,write:WRITE,words:WORDS}[kind];readingView({recognize:'识字表',write:'写字表',words:'词语表'}[kind],`${kind==='recognize'?'<p>深色字是本册新识字；<span class="cn-review-character">蓝字</span>是已经学过的字，再认一认。</p>':''}${groups.map(g=>`<section class="cn-appendix-group"><h2>${g.lesson?`第${g.lesson}课 · ${esc(LESSONS.find(l=>l.number===g.lesson).title)}`:`第${g.unitId.slice(1)}单元 · 语文园地`}<small>第${g.page}页</small></h2><div class="cn-character-grid">${g.items.map(text=>kind==='words'?`<button data-word="${esc(text)}">${esc(text)} <small>▶</small></button>`:`<span class="${kind==='recognize'?'cn-new-character':'cn-write-character'}">${esc(text)}</span>`).join('')}${(g.review||[]).map(text=>`<span class="cn-review-character">${esc(text)}</span>`).join('')}</div></section>`).join('')}`);}
root.addEventListener('click', e => {
  const button = e.target.closest('button');
  if (!button || button.disabled) return;
  if (button.dataset.unit) return directory(button.dataset.unit);
  if (button.dataset.answer !== undefined) return answer(Number(button.dataset.answer));
  if (button.dataset.word) return reader.speak(button.dataset.word);
  if (button.dataset.extraListen !== undefined) {
    const [unitId, index] = button.dataset.extraKey.split(':');
    return reader.speak(COURSE.units.find(unit => unit.id === unitId).extras[Number(index)].examples[Number(button.dataset.extraListen)]);
  }
  switch (button.id) {
    case 'startChinese': return start();
    case 'cnNext': return next();
    case 'cnHome':
    case 'cnExit': return home();
    case 'cnDirectory': return directory();
    case 'cnHint': return toggleHint();
    case 'cnListen': {
      const step = session.steps[session.index];
      return reader.speak(step.text || step.word?.text);
    }
    case 'cnReview': return startReview();
  }
});
dialog.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='cnCloseDirectory')return dialog.close();if(b.dataset.lesson){dialog.close();start(b.dataset.lesson);}if(b.dataset.extra){dialog.close();openExtra(b.dataset.extra);}if(b.dataset.appendix){dialog.close();appendix(b.dataset.appendix);}});
const course={root,lessons:LESSONS,get progress(){return progress},get session(){return session},get storageKey(){return storageKey},save,home,start,snapshot:()=>JSON.parse(JSON.stringify(progress)),replaceProgress};window.chineseCourse=course;
document.querySelector('#cnStop').onclick=()=>reader.cancel();mountClassroomNav({subject:'chinese',beforeLeave:()=>{save();reader.cancel();}});home();cloud=mountFamily({course,root:document.querySelector('#familyBar'),notice});window.chineseCourseCloud=cloud;addEventListener('pagehide',()=>{save();reader.cancel();});
