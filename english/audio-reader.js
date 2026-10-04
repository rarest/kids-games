// Reuse one media element so sequential reading stays unlocked on touch browsers.
export class AudioReader {
 constructor({manifest,words,baseURL,onError}){this.manifest=manifest;this.words=words;this.baseURL=baseURL;this.onError=onError;this.serial=0;this.clip=null;this.finish=null;}
 cancel(){this.serial++;this.finish?.(false);this.finish=null;this.clip?.pause();globalThis.speechSynthesis?.cancel();}
 async speak(text,wordId){this.cancel();return this.play(text,wordId,this.serial);}
 async read(lines){this.cancel();const serial=this.serial;for(const text of lines){if(serial!==this.serial||!await this.play(text,null,serial))return false;}return true;}
 async play(text,wordId,serial){
  if(serial!==this.serial)return false;
  const original=typeof text==='string'?text:text.en,spoken=typeof text==='string'?text:(text.say??text.en);
  const id=wordId&&this.manifest[wordId]?wordId:Object.keys(this.words).find(id=>this.words[id].en===original)||Object.keys(this.words).find(id=>this.words[id].en.toLowerCase()===original.toLowerCase());
  const file=wordId?this.manifest[id]||this.manifest[`sentence:${original}`]:this.manifest[`sentence:${original}`]||this.manifest[id];
  if(file){
   const clip=this.clip??=new Audio();clip.src=new URL(`audio/${file}`,this.baseURL).href;clip.volume=.85;clip.playbackRate=1;clip.preservesPitch=true;
   let finishCurrent;const done=new Promise(resolve=>{
    const finish=ok=>{clip.removeEventListener('ended',ended);clip.removeEventListener('error',error);if(this.finish===finish)this.finish=null;resolve(ok);};
    const ended=()=>finish(true),error=()=>finish(false);finishCurrent=finish;this.finish=finish;clip.addEventListener('ended',ended);clip.addEventListener('error',error);
   });
   try{await clip.play();if(serial!==this.serial)return false;if(await done)return true;}catch{finishCurrent(false);}
  }
  if(serial!==this.serial)return false;
  const synth=globalThis.speechSynthesis,voice=synth?.getVoices().find(v=>/^en[-_]US$/i.test(v.lang));
  if(synth&&voice)return new Promise(resolve=>{const utterance=new SpeechSynthesisUtterance(spoken);utterance.voice=voice;utterance.lang='en-US';utterance.rate=1;const finish=ok=>{if(this.finish===finish)this.finish=null;resolve(ok);};this.finish=finish;utterance.onend=()=>finish(true);utterance.onerror=()=>finish(false);synth.speak(utterance);});
  this.onError?.('这段发音暂时无法播放，请稍后再试。');return false;
 }
}
