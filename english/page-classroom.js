import {pageTargets,makePractice,normalizePracticeAnswer} from './page-practice.js';
import {PRACTICE_KEY,PRACTICE_ROUND_SIZE,loadPractice,savePractice,recordPractice,recordPracticeCursor} from './page-practice-progress.js';
import {textbookPage,textbookUnit} from './textbook.js';
import {wordArt} from './course-art.js';
import {mountSpeaking} from './speaking.js';
import {createWebEncouragement} from './encouragement-audio.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalized=normalizePracticeAnswer;
export function mountPageClassroom({root,pages,speak,stopAudio,onError=()=>{},storageKey=PRACTICE_KEY}){
 const encouragement=createWebEncouragement({stopAudio});let praise='',retryQuestionId=null;
 let current=pages.find(page=>String(page.page)===root.querySelector('#textbookPage').value)||pages[0];
 let view='reading',questions=[],index=0,roundStart=0,roundDone=false,paused=false,feedback=null,picked=[],speaking=null,selectedTarget=null,destroyed=false;
 let storage;try{storage=localStorage}catch{}let progress;try{progress=loadPractice(storage?.getItem(storageKey))}catch{progress=loadPractice(null)}
 const body=root.querySelector('#textbookPageContent'),selector=root.querySelector('#textbookPage');
 const tabs=root.querySelector('.page-view-tabs'),studyContent=root.closest('#studyContent'),dialog=root.closest('.study-dialog');
 const fixedTabs=!!(tabs&&studyContent&&dialog);
 if(fixedTabs)dialog.insertBefore(tabs,studyContent);
 const picker=document.createElement('dialog');picker.id='pagePicker';picker.className='page-picker-dialog';picker.setAttribute('aria-labelledby','pagePickerTitle');document.body.append(picker);
 const groups=new Map();for(const page of pages){const unit=textbookUnit(page),key=unit?.id||'other';if(!groups.has(key))groups.set(key,{label:unit?.zh||'复习与附录',pages:[]});groups.get(key).pages.push(page);}
 picker.innerHTML=`<div class="page-picker-heading"><h2 id="pagePickerTitle">选择课本页码</h2><button type="button" id="closePagePicker" class="secondary">关闭</button></div><label class="page-picker-filter">按单元找一找<select id="pagePickerUnit"><option value="all">全册目录 · ${pages.length} 页</option>${Array.from(groups,([key,group])=>`<option value="${esc(key)}">${esc(group.label)}</option>`).join('')}</select></label><div class="page-picker-list">${Array.from(groups,([key,group])=>`<section data-picker-group="${esc(key)}"><h3>${esc(group.label)}</h3>${group.pages.map(page=>`<button type="button" data-pick-page="${page.page}" aria-pressed="false"><span class="page-picker-number">${page.page}</span><span class="page-picker-title">${esc(page.title)}</span><span class="page-picker-check" aria-hidden="true">✓</span></button>`).join('')}</section>`).join('')}</div>`;
 picker.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;if(button.id==='closePagePicker')picker.close();else if(button.dataset.pickPage){goPage(Number(button.dataset.pickPage));if(String(current.page)===button.dataset.pickPage){picker.close();scrollToQuestion();}}});
 picker.addEventListener('change',event=>{if(event.target.id==='pagePickerUnit')for(const section of picker.querySelectorAll('[data-picker-group]'))section.hidden=event.target.value!=='all'&&section.dataset.pickerGroup!==event.target.value;picker.querySelector('.page-picker-list').scrollTop=0;});
 picker.addEventListener('close',()=>root.querySelector('#openPagePicker')?.focus({preventScroll:true}));
 const api={get page(){return current},get targets(){return pageTargets(current)},get question(){return questions[index]},get index(){return index},goPage,canLeave:allowLeave,openSpeaking:id=>chooseView('speaking',id),destroy};window.englishPagePractice=api;
 function save(){if(!storage||!savePractice({setItem:(_key,value)=>storage.setItem(storageKey,value)},progress))onError('本页练习暂时无法保存，当前页面仍可继续。')}
 function clearSpeaking(){speaking?.destroy();speaking=null}
 const roundEnd=()=>Math.min(roundStart+PRACTICE_ROUND_SIZE,questions.length);
 function savePosition({afterAnswer=false}={}){
  if(!questions.length)return;
  const finished=roundDone||(afterAnswer&&index===roundEnd()-1);
  const next=afterAnswer&&!finished?index+1:index;
  recordPracticeCursor(progress,current.page,{questionId:questions[next].id,start:roundStart,completed:finished,...(retryQuestionId===questions[next].id?{retry:true}:{})});save();
 }
 function restorePosition(){encouragement.reset();praise='';
  questions=makePractice(current);feedback=null;picked=[];paused=false;
  const cursor=progress.cursors?.[String(current.page)];
  if(cursor){index=questions.findIndex(q=>q.id===cursor.questionId);roundStart=cursor.start;roundDone=cursor.completed;retryQuestionId=cursor.retry===true?cursor.questionId:null;}
  else {index=Math.max(0,questions.findIndex(q=>progress.answers[q.id]?.lastCorrect!==true));roundStart=index;roundDone=false;retryQuestionId=null;}
 }
 function allowLeave(){if(!speaking||speaking.canLeave())return true;const status=body.querySelector('[data-speaking-status]');if(status){status.tabIndex=-1;status.scrollIntoView({block:'center',behavior:'instant'});status.focus({preventScroll:true});}return false;}
 function scrollToQuestion(){const scroller=root.closest('#studyContent');if(scroller)scroller.scrollTop+=body.getBoundingClientRect().top-scroller.getBoundingClientRect().top;else body.scrollIntoView({block:'start',behavior:'instant'});const heading=body.querySelector('.page-question-card h3,.speaking-target');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
 function chooseView(next,targetId){if(!allowLeave()){const targetSelector=body.querySelector('#pageSpeakingTarget');if(targetSelector)targetSelector.value=selectedTarget;return;}stopAudio();clearSpeaking();view=next;selectedTarget=targetId||selectedTarget;render();scrollToQuestion();}
 function goPage(number){if(!allowLeave()){selector.value=String(current.page);return;}const next=pages.find(page=>page.page===Number(number));if(!next)return;stopAudio();clearSpeaking();current=next;selector.value=String(next.page);selectedTarget=null;restorePosition();render();}
 function directory(action='practice',open=false){return `<details class="page-target-directory" ${open?'open':''}><summary>本页词句目录 · ${pageTargets(current).length} 项</summary><div>${pageTargets(current).map(target=>`<button data-page-${action}="${esc(target.id)}"><strong>${esc(target.en)}</strong><span>${esc(target.zh)}</span></button>`).join('')}</div></details>`}
 function artwork(target){if(target.kind!=='word')return '';const source=current.words.find(word=>word.en===target.en&&word.zh===target.zh);return wordArt(source||{id:target.wordId,en:target.en,zh:target.zh});}
 function renderPractice(){
  const scroller=root.closest('#studyContent')||root.closest('.study-dialog'),scrollTop=scroller?.scrollTop;
  const active=document.activeElement,focusKey=active&&body.contains(active)?{id:active.id,data:{...active.dataset}}:null;
  if(!questions.length){body.innerHTML='<p>本页没有可练习的英文。可以到下一页继续。</p>';return}
  if(roundDone){
   body.innerHTML=`<section class="page-question-card page-round-result" tabindex="-1"><span class="course-kicker">第 ${current.page} 页 · 每次练一点</span><h3>这组完成了！</h3><p>这组 ${roundEnd()-roundStart} 题已经练过。隔一段时间，再试着回忆。</p><div class="page-round-actions">${roundEnd()<questions.length?'<button id="pageRoundNext" class="primary">再练下一组 →</button>':'<p>这一页已经练到最后一题。</p>'}<button id="pagePracticePause" class="secondary">今天先到这里</button><button id="pageRoundDirectory" class="text-button">本页词句目录</button></div></section>`;
  }else if(paused){
   body.innerHTML=`<section class="page-question-card page-round-paused"><h3>这次先练到这里</h3><p>已保存续练位置。下次可以从这一题接着练。</p><button id="pagePracticeResume" class="primary">继续这组练习 →</button>${directory('practice',true)}</section>`;
  }else{
   const q=questions[index],target=pageTargets(current).find(target=>target.id===q.targetId);
   const done=questions.filter(question=>progress.answers[question.id]?.correct).length;
   const compact=q.kind!=='order'&&q.choices.every(choice=>choice.length<=28);
   const answers=q.kind==='order'?`<div class="page-sentence-picked" aria-label="你拼出的句子">${picked.length?picked.map((n,i)=>`<button data-page-remove="${i}" aria-label="撤回 ${esc(q.tokens[n])}">${esc(q.tokens[n])} <span aria-hidden="true">×</span></button>`).join(' '):'<span>点词块组成原句，点上面的词可以撤回。</span>'}</div><div class="page-token-bank">${q.tokens.map((token,i)=>`<button data-page-token="${i}" ${picked.includes(i)?'disabled':''}>${esc(token)}</button>`).join('')}</div><div class="page-question-tools"><button id="pageOrderReset" class="text-button" ${!picked.length?'hidden':''}>重新排列</button></div>`:`<div class="page-answer-choices ${compact?'compact':''}">${q.choices.map(answer=>`<button data-page-answer="${esc(answer)}" class="${feedback?.selected===answer?(feedback.correct?'selected-correct':'selected-wrong'):''}" aria-pressed="${feedback?.selected===answer}" ${feedback?.correct?'disabled':''}>${esc(answer)}${feedback?.selected===answer?`<span class="page-answer-mark">${feedback.correct?'✓ 答对了':'再试一次'}</span>`:''}</button>`).join('')}</div>`;
   body.innerHTML=`<div class="page-practice-layout"><aside class="page-learning-aside"><span class="course-kicker">第 ${current.page} 页</span><h4>${esc(current.title)}</h4><p>本页共 ${questions.length} 题，可以分几次练。</p><div class="page-learning-progress"><span>已练对 ${done} / ${questions.length} 题</span><progress value="${done}" max="${questions.length}"></progress></div>${directory()}<button id="pageWrongReview" class="secondary">重练答错的内容</button></aside><section class="page-question-card"><span class="course-kicker">这组第 ${index-roundStart+1} / ${roundEnd()-roundStart} 题 · ${q.kind==='listening'?'听一听，找答案':q.kind==='order'?'动手排一句话':'词句意思，我知道'}</span><div class="page-practice-picture">${q.kind==='listening'?'':artwork(target)}</div><h3>${esc(q.prompt)}</h3><p class="page-task-instruction">${q.kind==='listening'?'先点「听示范」，再选一个答案。':q.kind==='order'?`按顺序点词块，放完后检查。已放 ${picked.length} / ${q.tokens.length} 个词。`:'选一个意思，答对后继续。'}</p><button id="pageQuestionListen" class="listen-button">🔊 ${q.kind==='listening'?'听示范':'再听一遍'}</button>${answers}${feedback?`<div class="page-practice-feedback ${feedback.correct?'right':'retry'}" role="status"><strong>${esc(praise||(feedback.correct?'答对了！':'再听一遍，再试一次。'))}</strong><span>${esc(target.en)} · ${esc(target.zh)}</span></div>`:''}<div class="page-question-footer"><div class="page-question-actions"><button data-page-speak="${esc(target.id)}" class="text-button">也来读一读 ↗</button>${q.kind==='order'&&!feedback?.correct?`<button id="pageOrderCheck" class="primary" ${picked.length!==q.tokens.length?'disabled':''}>检查句子</button>`:`<button id="pagePracticeNext" class="primary" ${!feedback?.correct?'disabled':''}>${index===roundEnd()-1?'完成这组练习':feedback?.correct?'答对了，下一题 →':'选好答案再继续'}</button>`}</div></div><button id="pageEncouragementSound" class="text-button">鼓励声音：${encouragement.muted?'关':'开'}</button><button id="pagePracticePause" class="text-button page-pause-button">今天先到这里</button></section></div>`;
  }
  if(scroller)scroller.scrollTop=scrollTop;
  if(focusKey){const candidates=body.querySelectorAll('button,select');const next=Array.from(candidates).find(el=>focusKey.id?el.id===focusKey.id:Object.keys(focusKey.data).length&&Object.entries(focusKey.data).every(([key,value])=>el.dataset[key]===value));if(next&&!next.disabled)next.focus({preventScroll:true});else if(feedback?.correct)body.querySelector('#pagePracticeNext')?.focus({preventScroll:true});else if(focusKey.data.pageToken!==undefined||focusKey.data.pageRemove!==undefined)body.querySelector('[data-page-token]:not(:disabled),#pageOrderCheck:not(:disabled)')?.focus({preventScroll:true});}
 }
 function renderSpeaking(){const targets=pageTargets(current);const target=targets.find(target=>target.id===selectedTarget)||targets[0];if(!target){body.innerHTML='<p>本页没有英文朗读目标。</p>';return}selectedTarget=target.id;
  body.innerHTML=`<div class="page-speaking-layout"><aside class="page-learning-aside"><span class="course-kicker">开口，每次一小步</span><h4>本页朗读 ${targets.length} 项</h4><p>先听示范，录下自己的声音。回放听一遍，再请网站给练习反馈。</p><label>选择一个词或句子<select id="pageSpeakingTarget">${targets.map(item=>`<option value="${esc(item.id)}" ${item.id===target.id?'selected':''}>${esc(item.en)}</option>`).join('')}</select></label>${artwork(target)?`<div class="page-practice-picture">${artwork(target)}</div>`:''}</aside><div id="pageSpeakingRoot"></div></div>`;
  speaking=mountSpeaking({root:body.querySelector('#pageSpeakingRoot'),target,speak,stopAudio,onResult:()=>{},onError});
 }
 function render(){if(destroyed)return;const label=root.querySelector('.page-picker-current');if(label)label.innerHTML=`<strong>第 ${current.page} 页</strong><span>${esc(current.title)}</span>`;for(const button of picker.querySelectorAll('[data-pick-page]'))button.setAttribute('aria-pressed',String(Number(button.dataset.pickPage)===current.page));const pageListen=root.querySelector('#readTextbookPage');if(pageListen)pageListen.hidden=view!=='reading';for(const button of tabs?.querySelectorAll('[data-page-view]')||[])button.setAttribute('aria-pressed',String(button.dataset.pageView===view));const position=pages.indexOf(current);root.querySelector('#previousTextbookPage').disabled=position===0;root.querySelector('#nextTextbookPage').disabled=position===pages.length-1;
  if(view==='practice')renderPractice();else if(view==='speaking')renderSpeaking();else body.innerHTML=textbookPage(current,esc);
 }
 function answer(value){const q=questions[index];const correct=normalized(value)===normalized(q.answer),firstTry=retryQuestionId!==q.id;if(!correct)retryQuestionId=q.id;progress=recordPractice(progress,q.id,correct);feedback={correct,selected:value};savePosition({afterAnswer:correct});praise=encouragement.answer(q.id,correct,firstTry).text;renderPractice();}
 function jumpTo(next){encouragement.reset();praise='';retryQuestionId=null;stopAudio();index=next;roundStart=next;roundDone=false;paused=false;feedback=null;picked=[];view='practice';savePosition();render();scrollToQuestion();}
 function click(event){const button=event.target.closest('button');if(!button||button.disabled||(!root.contains(button)&&!tabs?.contains(button))||destroyed)return;
  if(button.dataset.pageView){event.stopPropagation();chooseView(button.dataset.pageView);return}
  if(button.dataset.pageSpeak){event.stopPropagation();chooseView('speaking',button.dataset.pageSpeak);return}
  if(button.dataset.pagePractice){const next=questions.findIndex(q=>q.targetId===button.dataset.pagePractice);if(next>=0)jumpTo(next);return}
  if(button.dataset.pageAnswer!==undefined){answer(button.dataset.pageAnswer);return}
  if(button.dataset.pageToken!==undefined){picked.push(Number(button.dataset.pageToken));feedback=null;savePosition();renderPractice();return}
  if(button.dataset.pageRemove!==undefined){picked.splice(Number(button.dataset.pageRemove),1);feedback=null;savePosition();renderPractice();return}
  const position=pages.indexOf(current);
  switch(button.id){case 'openPagePicker':if(!allowLeave())return;picker.querySelector('#pagePickerUnit').value='all';for(const section of picker.querySelectorAll('[data-picker-group]'))section.hidden=false;picker.showModal();picker.querySelector(`[data-pick-page="${current.page}"]`)?.scrollIntoView({block:'center'});break;case 'previousTextbookPage':goPage(pages[position-1]?.page);break;case 'nextTextbookPage':goPage(pages[position+1]?.page);break;
   case 'pageEncouragementSound':encouragement.toggle();renderPractice();break;case 'pageQuestionListen':{const q=questions[index],target=pageTargets(current).find(t=>t.id===q.targetId);speak(target,target.wordId);break}
   case 'pageOrderCheck':answer(picked.map(i=>questions[index].tokens[i]).join(' '));break;case 'pageOrderReset':picked=[];feedback=null;savePosition();renderPractice();break;
   case 'pagePracticeNext':if(!feedback?.correct)return;stopAudio();if(index===roundEnd()-1){roundDone=true;savePosition();encouragement.complete('page-'+current.page+'-'+roundStart);}else{index++;feedback=null;picked=[];savePosition();}renderPractice();scrollToQuestion();break;
   case 'pageRoundNext':if(roundDone&&roundEnd()<questions.length)jumpTo(roundEnd());break;
   case 'pagePracticePause':stopAudio();restorePosition();paused=true;roundDone=false;renderPractice();scrollToQuestion();break;
   case 'pagePracticeResume':paused=false;restorePosition();renderPractice();scrollToQuestion();break;
   case 'pageRoundDirectory':paused=true;roundDone=false;renderPractice();scrollToQuestion();break;
   case 'pageWrongReview':{const wrong=questions.findIndex(q=>progress.answers[q.id]?.lastCorrect===false);if(wrong<0){onError('本页没有待重练的错题。可以继续挑一项练习。');return}jumpTo(wrong);break}
  }
 }
 function change(event){if(event.target===selector)goPage(selector.value);if(event.target.id==='pageSpeakingTarget')chooseView('speaking',event.target.value)}
 function destroy(){if(destroyed)return;destroyed=true;picker.remove();stopAudio();clearSpeaking();root.removeEventListener('click',click);root.removeEventListener('change',change);if(fixedTabs){tabs.removeEventListener('click',click);root.insertBefore(tabs,body);}if(window.englishPagePractice===api)delete window.englishPagePractice;}
 root.addEventListener('click',click);root.addEventListener('change',change);if(fixedTabs)tabs.addEventListener('click',click);restorePosition();render();return api;
}
