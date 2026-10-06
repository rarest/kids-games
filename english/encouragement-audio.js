import {createEncouragement} from './encouragement.js';
let active=null;
const preference='pearl-encouragement-muted';
export function stopEncouragement(){if(active){active.pause();active=null}}
export function createWebEncouragement({stopAudio=()=>{}}={}){
 const state=createEncouragement();let muted=false;
 function currentMuted(){try{muted=localStorage.getItem(preference)==='1'}catch{}return muted}
 function play(result){
  if(result.audio&&!currentMuted()){stopAudio();stopEncouragement();const audio=new Audio('/english/encouragement/'+result.audio+'.mp3');active=audio;audio.volume=.7;audio.onended=()=>{if(active===audio)active=null};audio.play().catch(()=>{if(active===audio)active=null})}
  return result;
 }
 return {...state,answer:(...args)=>play(state.answer(...args)),complete:key=>play(state.complete(key)),get muted(){return currentMuted()},toggle(){muted=!currentMuted();try{localStorage.setItem(preference,muted?'1':'0')}catch{}if(muted)stopEncouragement();return muted},reset(){stopEncouragement();state.reset()}};
}
