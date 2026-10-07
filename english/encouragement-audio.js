import {createEncouragement} from './encouragement.js';
let active=null,pending=[];
const preference='pearl-encouragement-muted';
export function stopEncouragement(){const audio=active;active=null;pending=[];if(audio){audio.onended=audio.onerror=null;audio.pause()}}
function launch(job){
 if(job.muted())return;
 job.stopAudio();const audio=new Audio(job.url);active=audio;audio.volume=.7;
 const finish=()=>{if(active!==audio)return;active=null;audio.onended=audio.onerror=null;const next=pending.shift();if(next)launch(next)};
 audio.onended=audio.onerror=finish;audio.play().catch(finish);
}
export function createWebEncouragement({stopAudio=()=>{},finishPrevious=false}={}){
 const state=createEncouragement();let muted=false;
 function currentMuted(){try{muted=localStorage.getItem(preference)==='1'}catch{}return muted}
 function play(result){
  if(result.audio&&!currentMuted()){
   const job={url:'/english/encouragement/'+result.audio+'.mp3',stopAudio,muted:currentMuted};
   if(finishPrevious&&active)pending.push(job);else{stopEncouragement();launch(job)}
  }
  return result;
 }
 return {...state,answer:(...args)=>play(state.answer(...args)),complete:key=>play(state.complete(key)),get muted(){return currentMuted()},toggle(){muted=!currentMuted();try{localStorage.setItem(preference,muted?'1':'0')}catch{}if(muted)stopEncouragement();return muted},reset(){stopEncouragement();state.reset()}};
}
