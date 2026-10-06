const {origin}=require('../config.js');
const {assets}=require('./bundled-content.js');
const {createEncouragement}=require('./encouragement.js');
const absolute=path=>path?(assets[path]||(path.startsWith('/assets/')?path:/^https?:\/\//.test(path)?path:origin+path)):'';
const mediaItem=item=>({...item,imageURL:absolute(item.image)});
function mediaHandlers(wx){return {
 refreshEncouragementSound(){this.encourageMuted=wx.getStorageSync('mini-encourage-muted')===true;this.setData({encourageMuted:this.encourageMuted});return this.encourageMuted},
 resetEncouragement(){this.encourager=createEncouragement();this.refreshEncouragementSound();this.setData({encouragement:'',streak:0})},
 encourage(result){this.setData({encouragement:result.text,streak:result.streak});const m=this.data.media||{};if(result.audio&&!this.refreshEncouragementSound()&&!m.recording&&!m.requesting&&!m.assessing)this.media.toggleAudio(['/assets/encouragement/'+result.audio+'.mp3'],'encouragement')},
 encourageAnswer(key,correct,firstTry=true){if(!this.encourager)this.resetEncouragement();this.encourage(this.encourager.answer(key,correct,firstTry))},
 encourageComplete(key){if(!this.encourager)this.resetEncouragement();this.encourage(this.encourager.complete(key))},
 toggleEncouragementSound(){this.encourageMuted=!this.refreshEncouragementSound();wx.setStorageSync('mini-encourage-muted',this.encourageMuted);this.setData({encourageMuted:this.encourageMuted});if(this.data.media?.source==='encouragement')this.media.stopAudio()},
 toggleSpeakingHelp(){this.setData({showSpeakingHelp:!this.data.showSpeakingHelp})},
 listenTarget(event){const target=this.targets.find(t=>t.id===event.currentTarget.dataset.id);if(target?.audio&&target.speakable!==false)this.media.toggleAudio([target.audio],target.id)},
 chooseTarget(event){const target=this.targets.find(t=>t.id===event.currentTarget.dataset.id);if(!target||target.speakable===false||!target.audio)return;this.media.setTarget(target);this.setData({speakingTarget:target})},
 toggleSpeakingAudio(){this.listenSpeaking()},
 listenSpeaking(){if(this.data.speakingTarget?.audio)this.media.toggleAudio([this.data.speakingTarget.audio],'speaking')},
 record(){return this.media.record()},stopRecord(){this.media.stopRecord()},replay(){this.media.replay()},submitRecording(){return this.media.submit()},cancelRecording(){this.media.cancel()},stopAudio(){this.media.stopAudio()},
 openPrivacy(){wx.openPrivacyContract({fail:()=>this.setData({error:'隐私说明暂时无法打开，请稍后重试。'})})},
 openMicSettings(){wx.openSetting({})},
 onHide(){this.hidden=true;this.media?.cancel()},onUnload(){this.hidden=true;this.loadEpoch=(this.loadEpoch||0)+1;this.media?.destroy()}
}}
module.exports={absolute,mediaItem,mediaHandlers};
