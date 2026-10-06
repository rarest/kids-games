import test from 'node:test';
import assert from 'node:assert/strict';
test('cancelled failed clip cannot start fallback or change the newer playback status',async()=>{
 let Reader;await assert.doesNotReject(async()=>{({MandarinReader:Reader}=await import('../chinese/audio.js'))});
 const players=[],spoken=[],states=[];class Player{constructor(){players.push(this)}play(){return new Promise((yes,no)=>{this.yes=yes;this.no=no})}pause(){this.paused=true}removeAttribute(){}load(){}}
 const reader=new Reader({manifest:{old:'audio/old.mp3',new:'audio/new.mp3'},AudioClass:Player,speech:{cancel(){},speak:u=>spoken.push(u)},Utterance:class{constructor(text){this.text=text}},onState:s=>states.push(s)});
 const first=reader.speak('old');const second=reader.speak('new');players[0].no(new Error('late'));await first;assert.equal(spoken.length,0);assert.equal(players[1].paused,undefined);players[1].yes();players[1].onended();await second;assert.equal(states.at(-1),'');
});
test('fixed audio failure uses explicitly labeled device fallback and cancellation settles it',async()=>{
 const {MandarinReader}=await import('../chinese/audio.js');let utterance;const states=[];class Player{play(){return Promise.reject(new Error('decode'))}pause(){}removeAttribute(){}load(){}}
 const reader=new MandarinReader({manifest:{word:'bad'},AudioClass:Player,speech:{cancel(){},speak:u=>utterance=u},Utterance:class{constructor(text){this.text=text}},onState:s=>states.push(s)});const playing=reader.speak('word');await new Promise(r=>setImmediate(r));assert.match(states.at(-1),/设备备用朗读/);assert.equal(utterance.lang,'zh-CN');reader.cancel();await playing;
});
