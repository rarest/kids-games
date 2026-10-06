const {origin}=require('../config.js');
const {assets}=require('./bundled-content.js');
const absolute=path=>path?(assets[path]||(/^https?:\/\//.test(path)?path:origin+path)):'';
const mediaItem=item=>({...item,imageURL:absolute(item.image)});
function mediaHandlers(){return {
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
