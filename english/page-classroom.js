import {pageTargets,makePractice,normalizePracticeAnswer} from './page-practice.js';
import {PRACTICE_KEY,loadPractice,savePractice,recordPractice} from './page-practice-progress.js';
import {textbookPage} from './textbook.js';
import {wordArt} from './course-art.js';
import {mountSpeaking} from './speaking.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalized=normalizePracticeAnswer;
export function mountPageClassroom({root,pages,speak,stopAudio,onError=()=>{},storageKey=PRACTICE_KEY}){
 let current=pages.find(page=>String(page.page)===root.querySelector('#textbookPage').value)||pages[0];
 let view='reading',questions=[],index=0,feedback=null,picked=[],speaking=null,selectedTarget=null,destroyed=false;
 let storage;try{storage=localStorage}catch{}let progress;try{progress=loadPractice(storage?.getItem(storageKey))}catch{progress=loadPractice(null)}
 const body=root.querySelector('#textbookPageContent'),selector=root.querySelector('#textbookPage');
 const api={get page(){return current},get targets(){return pageTargets(current)},get question(){return questions[index]},get index(){return index},goPage,openSpeaking:id=>chooseView('speaking',id),destroy};window.englishPagePractice=api;
 function save(){if(!storage||!savePractice({setItem:(_key,value)=>storage.setItem(storageKey,value)},progress))onError('本页练习暂时无法保存，当前页面仍可继续。')}
 function clearSpeaking(){speaking?.destroy();speaking=null}
 function scrollToQuestion(){body.scrollIntoView({block:'start',behavior:'instant'})}
 function chooseView(next,targetId){stopAudio();clearSpeaking();view=next;selectedTarget=targetId||selectedTarget;render();body.scrollIntoView({block:'start',behavior:'instant'});}
 function goPage(number){const next=pages.find(page=>page.page===Number(number));if(!next)return;stopAudio();clearSpeaking();current=next;selector.value=String(next.page);index=0;feedback=null;picked=[];selectedTarget=null;questions=makePractice(current);render();}
 function directory(action='practice'){return `<details class="page-target-directory"><summary>本页词句目录 · ${pageTargets(current).length} 项</summary><div>${pageTargets(current).map(target=>`<button data-page-${action}="${esc(target.id)}"><strong>${esc(target.en)}</strong><span>${esc(target.zh)}</span></button>`).join('')}</div></details>`}
 function artwork(target){if(target.kind!=='word')return '';const source=current.words.find(word=>word.en===target.en&&word.zh===target.zh);return wordArt(source||{id:target.wordId,en:target.en,zh:target.zh});}
 function renderPractice(){
  if(!questions.length){body.innerHTML='<p>本页没有可练习的英文。可以到下一页继续。</p>';return}
  const q=questions[index],target=pageTargets(current).find(target=>target.id===q.targetId);
  const done=questions.filter(question=>progress.answers[question.id]?.correct).length;
  const compact=q.kind!=='order'&&q.choices.every(choice=>choice.length<=28);
  const answers=q.kind==='order'?`<div class="page-sentence-picked" aria-label="你拼出的句子">${picked.length?picked.map(i=>esc(q.tokens[i])).join(' '):'点击下面的词，试着组成原句。'}</div><div class="page-token-bank">${q.tokens.map((token,i)=>`<button data-page-token="${i}" ${picked.includes(i)?'disabled':''}>${esc(token)}</button>`).join('')}</div><div class="page-question-tools"><button id="pageOrderReset" class="text-button" ${!picked.length?'hidden':''}>重新排列</button></div>`:`<div class="page-answer-choices ${compact?'compact':''}">${q.choices.map(answer=>`<button data-page-answer="${esc(answer)}" ${feedback?.correct?'disabled':''}>${esc(answer)}</button>`).join('')}</div>`;
  body.innerHTML=`<div class="page-practice-layout"><aside class="page-learning-aside"><span class="course-kicker">第 ${current.page} 页</span><h4>${esc(current.title)}</h4><p>本页全部 ${pageTargets(current).length} 个词句都有练习。可以分几次完成，也可以从目录挑一项。</p><div class="page-learning-progress"><span>已练对 ${done} / ${questions.length} 题</span><progress value="${done}" max="${questions.length}"></progress></div>${directory()}<button id="pageWrongReview" class="secondary">重练答错的内容</button></aside><section class="page-question-card"><span class="course-kicker">${q.kind==='listening'?'听一听，找答案':q.kind==='order'?'动手排一句话':'词句意思，我知道'} · ${index+1} / ${questions.length}</span><div class="page-practice-picture">${q.kind==='listening'?'':artwork(target)}</div><h3>${esc(q.prompt)}</h3>${q.kind==='listening'?'<p>先听示范，再选出你听到的内容。</p>':''}<button id="pageQuestionListen" class="listen-button">🔊 听示范</button>${answers}${feedback?`<div class="page-practice-feedback ${feedback.correct?'right':'retry'}" role="status"><strong>${feedback.correct?'答对了！':'再听一遍，慢慢来。'}</strong><span>${esc(target.en)} · ${esc(target.zh)}</span></div>`:''}<div class="page-question-footer"><div class="page-question-actions"><button data-page-speak="${esc(target.id)}" class="text-button">也来读一读 ↗</button>${q.kind==='order'&&!feedback?.correct?`<button id="pageOrderCheck" class="primary" ${picked.length!==q.tokens.length?'disabled':''}>检查句子</button>`:`<button id="pagePracticeNext" class="primary" ${!feedback?.correct?'disabled':''}>${index===questions.length-1?'回到本页目录':'下一题 →'}</button>`}</div></div></section></div>`;
 }
 function renderSpeaking(){const targets=pageTargets(current);const target=targets.find(target=>target.id===selectedTarget)||targets[0];if(!target){body.innerHTML='<p>本页没有英文朗读目标。</p>';return}selectedTarget=target.id;
  body.innerHTML=`<div class="page-speaking-layout"><aside class="page-learning-aside"><span class="course-kicker">开口，每次一小步</span><h4>本页朗读 ${targets.length} 项</h4><p>先听示范，录下自己的声音。回放听一遍，再请网站给练习反馈。</p><label>选择一个词或句子<select id="pageSpeakingTarget">${targets.map(item=>`<option value="${esc(item.id)}" ${item.id===target.id?'selected':''}>${esc(item.en)}</option>`).join('')}</select></label>${artwork(target)?`<div class="page-practice-picture">${artwork(target)}</div>`:''}</aside><div id="pageSpeakingRoot"></div></div>`;
  speaking=mountSpeaking({root:body.querySelector('#pageSpeakingRoot'),target,speak,stopAudio,onResult:()=>{},onError});
 }
 function render(){if(destroyed)return;for(const button of root.querySelectorAll('[data-page-view]'))button.setAttribute('aria-pressed',String(button.dataset.pageView===view));const position=pages.indexOf(current);root.querySelector('#previousTextbookPage').disabled=position===0;root.querySelector('#nextTextbookPage').disabled=position===pages.length-1;
  if(view==='practice')renderPractice();else if(view==='speaking')renderSpeaking();else body.innerHTML=textbookPage(current,esc);
 }
 function answer(value){const q=questions[index];const correct=normalized(value)===normalized(q.answer);progress=recordPractice(progress,q.id,correct);save();feedback={correct};renderPractice();}
 function click(event){const button=event.target.closest('button');if(!button||!root.contains(button)||destroyed)return;
  if(button.dataset.pageView){event.stopPropagation();chooseView(button.dataset.pageView);return}
  if(button.dataset.pageSpeak){event.stopPropagation();chooseView('speaking',button.dataset.pageSpeak);return}
  if(button.dataset.pagePractice){stopAudio();index=Math.max(0,questions.findIndex(q=>q.targetId===button.dataset.pagePractice));feedback=null;picked=[];renderPractice();scrollToQuestion();return}
  if(button.dataset.pageAnswer){answer(button.dataset.pageAnswer);return}
  if(button.dataset.pageToken){picked.push(Number(button.dataset.pageToken));renderPractice();return}
  const position=pages.indexOf(current);
  switch(button.id){case 'previousTextbookPage':goPage(pages[position-1]?.page);break;case 'nextTextbookPage':goPage(pages[position+1]?.page);break;
   case 'pageQuestionListen':{const q=questions[index],target=pageTargets(current).find(t=>t.id===q.targetId);speak(target,target.wordId);break}
   case 'pageOrderCheck':answer(picked.map(i=>questions[index].tokens[i]).join(' '));break;case 'pageOrderReset':picked=[];feedback=null;renderPractice();break;
   case 'pagePracticeNext':if(!feedback?.correct)return;stopAudio();feedback=null;picked=[];index=(index+1)%questions.length;renderPractice();scrollToQuestion();break;
   case 'pageWrongReview':{stopAudio();const wrong=questions.findIndex(q=>progress.answers[q.id]?.lastCorrect===false);if(wrong<0){onError('本页没有待重练的错题。可以继续挑一项练习。');return}index=wrong;feedback=null;picked=[];renderPractice();break}
  }
 }
 function change(event){if(event.target===selector)goPage(selector.value);if(event.target.id==='pageSpeakingTarget')chooseView('speaking',event.target.value)}
 function destroy(){if(destroyed)return;destroyed=true;stopAudio();clearSpeaking();root.removeEventListener('click',click);root.removeEventListener('change',change);if(window.englishPagePractice===api)delete window.englishPagePractice;}
 root.addEventListener('click',click);root.addEventListener('change',change);questions=makePractice(current);render();return api;
}
