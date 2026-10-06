import {COURSE,LESSONS} from './curriculum.js';
import {WORDS} from './appendices.js';
// Spoken-only substitutions. The printed edition remains untouched.
export const pronunciationOverrides=[
 {from:'鹿柴',to:'鹿寨',reading:'lù zhài',source:'教材第84页注释：柴，在这里读zhài'},
 {from:'㘗',to:'区',reading:'qū',source:'商务印书馆《新华字典》第12版修订说明 https://www.cp.com.cn/Content/2020/09-03/1424594527.html'},
 {from:'查慎行',to:'渣慎行',reading:'zhā shèn xíng',source:'教育部《重編國語辭典》查：zhā，姓 https://dict.revised.moe.edu.tw/dictView.jsp?ID=8258&la=0&powerMode=0'},
];
export const audioInputs=[...LESSONS.flatMap(l=>[{kind:'title',text:l.title,source:l.id},...l.paragraphs.map((p,i)=>({kind:'paragraph',text:p.text,source:`${l.id}:${i}`,page:p.page})),...l.words.map(w=>({kind:'word',text:w.text,source:l.id,pinyin:w.pinyin}))]),...COURSE.units.flatMap(u=>u.extras.flatMap((x,i)=>[{kind:'extra-title',text:x.title,source:`${u.id}:extra:${i}`},...x.examples.map((text,j)=>({kind:'extra',text,source:`${u.id}:extra:${i}:${j}`}))])),...WORDS.flatMap(g=>g.items.map(text=>({kind:'appendix-word',text,source:`appendix:${g.lesson}`,page:g.page})))];
export const spokenText=text=>pronunciationOverrides.reduce((s,o)=>s.replaceAll(o.from,o.to),text);
if(process.argv[1]?.endsWith('audio-inputs.mjs'))console.log(JSON.stringify({inputs:audioInputs,overrides:pronunciationOverrides}));
