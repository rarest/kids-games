import {BOOKS} from './curriculum.js';
import {makePractice} from './page-practice.js';

export const PRACTICE_KEY='english-page-practice-v1';
let knownIds;
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
 return state;
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
