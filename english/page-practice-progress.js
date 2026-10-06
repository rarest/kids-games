import {BOOKS} from './curriculum.js';
import {makePractice} from './page-practice.js';

export const PRACTICE_KEY='english-page-practice-v1';
export const PRACTICE_ROUND_SIZE=6;
let knownIds;
let pageQuestions;
function questionsFor(page){
 pageQuestions??=new Map(BOOKS.find(book=>book.id==='g3-upper').textbookPages.map(page=>[String(page.page),makePractice(page)]));
 return pageQuestions.get(String(page));
}
function validId(id){
 if(typeof id!=='string'||!/^p\d+-(?:word-\d+|line-\d+-\d+)-(?:listening|meaning|order)$/.test(id))return false;
 knownIds??=new Set(BOOKS.find(book=>book.id==='g3-upper').textbookPages.flatMap(page=>makePractice(page).map(question=>question.id)));
 return knownIds.has(id);
}
const plain=value=>value!==null&&typeof value==='object'&&!Array.isArray(value)&&(Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null);
function validEntry(entry){
 return plain(entry)&&Number.isSafeInteger(entry.attempts)&&entry.attempts>0&&typeof entry.correct==='boolean'&&typeof entry.lastCorrect==='boolean'&&(!entry.lastCorrect||entry.correct)&&(!entry.correct||entry.lastCorrect||entry.attempts>1);
}
export function loadPractice(raw){
 let value;try{value=typeof raw==='string'?JSON.parse(raw):raw;}catch{}
 const state={version:1,answers:{}};
 if(!plain(value)||value.version!==1||!plain(value.answers))return state;
 for(const [id,entry]of Object.entries(value.answers))if(validId(id)&&validEntry(entry))state.answers[id]={attempts:entry.attempts,correct:entry.correct,lastCorrect:entry.lastCorrect};
 if(plain(value.cursors))for(const [page,cursor]of Object.entries(value.cursors)){
  const valid=validCursor(page,cursor,state.answers);if(valid){state.cursors??={};state.cursors[page]=valid;}
 }
 return state;
}
function validCursor(page,cursor,answers){
 const questions=questionsFor(page);
 if(!questions||!plain(cursor)||!Number.isSafeInteger(cursor.start)||cursor.start<0||cursor.start>=questions.length||typeof cursor.completed!=='boolean')return null;
 const end=Math.min(cursor.start+PRACTICE_ROUND_SIZE,questions.length),index=questions.findIndex(q=>q.id===cursor.questionId);
 if(index<cursor.start||index>=end)return null;
 if(cursor.completed&&(index!==end-1||questions.slice(cursor.start,end).some(q=>answers[q.id]?.lastCorrect!==true)))return null;
 return {questionId:cursor.questionId,start:cursor.start,completed:cursor.completed,...(cursor.retry===true&&answers[cursor.questionId]?.lastCorrect===false?{retry:true}:{})};
}
export function recordPracticeCursor(state,page,cursor){
 if(!plain(state)||state.version!==1||!plain(state.answers))return state;
 const valid=validCursor(page,cursor,state.answers);if(valid){state.cursors??={};state.cursors[String(page)]=valid;}return state;
}
export function recordPractice(state,id,isCorrect){
 if(!plain(state)||state.version!==1||!plain(state.answers))state={version:1,answers:{}};
 if(!validId(id)||typeof isCorrect!=='boolean')return state;
 const previous=validEntry(state.answers[id])?state.answers[id]:{attempts:0,correct:false};
 state.answers[id]={attempts:Math.min(Number.MAX_SAFE_INTEGER,previous.attempts+1),correct:previous.correct||isCorrect,lastCorrect:isCorrect};
 return state;
}
export function savePractice(storage,state){
 try{storage.setItem(PRACTICE_KEY,JSON.stringify(loadPractice(state)));return true;}catch{return false;}
}
