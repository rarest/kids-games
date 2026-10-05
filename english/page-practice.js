import {BOOKS} from './curriculum.js';

// IDs identify source occurrences, so repeated words and song lines are covered.
export function pageTargets(page){
 if(!page)return [];
 return [
  ...(page.words??[]).map((word,index)=>({id:`p${page.page}-word-${index}`,page:page.page,kind:'word',en:word.en,zh:word.zh,ipa:word.ipa,...(word.say?{say:word.say}:{}),wordId:word.id})),
  ...(page.blocks??[]).flatMap((block,blockIndex)=>(block.lines??[]).map((line,lineIndex)=>({id:`p${page.page}-line-${blockIndex}-${lineIndex}`,page:page.page,kind:'sentence',en:line.en,zh:line.zh,...(line.say?{say:line.say}:{})}))),
 ];
}
const pages=BOOKS.find(book=>book.id==='g3-upper').textbookPages;
const allTargets=pages.flatMap(pageTargets);
const targetsById=new Map(allTargets.map(target=>[target.id,target]));
export function getTarget(id){return targetsById.get(id)??null;}
const hash=text=>{let value=2166136261;for(const character of text)value=Math.imul(value^character.charCodeAt(0),16777619);return value>>>0;};
export const normalizePracticeAnswer=value=>String(value).replace(/[.,!?]/g,'').trim().replace(/\s+/g,' ').toLowerCase();
const senses=text=>text.replace(/[（(][^）)]*[）)]/g,'').split(/[；;,，、]/).map(sense=>sense.trim()).filter(Boolean);
function options(target,kind,local){
 const key=kind==='listening'?'en':'zh',answer=target[key],candidates=[];
 const meanings=new Set(senses(target.zh));
 for(const other of [...local,...allTargets]){
  if(other.kind!==target.kind||other.en===target.en||normalizePracticeAnswer(other[key])===normalizePracticeAnswer(answer)||candidates.some(value=>normalizePracticeAnswer(value)===normalizePracticeAnswer(other[key])))continue;
  if(kind==='listening'&&normalizePracticeAnswer(other.say??other.en)===normalizePracticeAnswer(target.say??target.en))continue;
  if(kind==='listening'&&target.ipa&&target.ipa===other.ipa)continue;
  if(kind==='meaning'&&senses(other.zh).some(sense=>meanings.has(sense)))continue;
  candidates.push(other[key]);if(candidates.length===3)break;
 }
 const choices=[...candidates];choices.splice(hash(`${target.id}-${kind}`)%(choices.length+1),0,answer);return choices;
}
export function makePractice(page){
 const local=pageTargets(page),questions=[];
 for(const target of local){
  for(const kind of ['listening','meaning'])questions.push({id:`${target.id}-${kind}`,targetId:target.id,kind,prompt:kind==='listening'?'听录音，选出你听到的英文。':`“${target.en}”在这一页是什么意思？`,answer:kind==='listening'?target.en:target.zh,choices:options(target,kind,local)});
  if(target.kind!=='sentence')continue;
  const [,blockIndex]=target.id.match(/-line-(\d+)-/)??[];
  const block=page.blocks[Number(blockIndex)];
  const answer=target.en.replace(/[.!?]+$/,'').trim(),tokens=answer.split(/\s+/);
  // Phoneme notation, alphabet pairs and incomplete prompts remain listen/read targets.
  if(!['dialogue','reading','chant','song'].includes(block?.kind)||tokens.length<2||tokens.length>16||/\.{2}|___|\//.test(answer)||!/^[A-Za-z][A-Za-z ,;:'’\-]*$/.test(answer)||/^[A-Z] [a-z]$/.test(answer))continue;
  const offset=1+hash(target.id)%(tokens.length-1);
  questions.push({id:`${target.id}-order`,targetId:target.id,kind:'order',prompt:`按课本原句排列：${target.zh}`,answer,tokens:[...tokens.slice(offset),...tokens.slice(0,offset)]});
 }
 return questions;
}
