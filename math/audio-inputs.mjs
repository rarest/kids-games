import {LESSONS} from './curriculum.js';
import {spokenText} from './spoken.js';
export {spokenText};
export const audioInputs=[...new Map(LESSONS.flatMap(l=>l.steps.map((s,i)=>({text:s.prompt||s.text||'',kind:s.kind,source:`${l.id}:${i}`}))).filter(x=>x.text).map(x=>[x.text,{...x,spoken:spokenText(x.text)}])).values()];
if(process.argv[1]?.endsWith('audio-inputs.mjs'))console.log(JSON.stringify({inputs:audioInputs}));
