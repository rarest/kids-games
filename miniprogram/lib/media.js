const {origin}=require('../config.js');
const {absolute}=require('./view.js');
const owners=new WeakMap();
const url=path=>path.startsWith('/english/')?absolute(path):path;
function validResult(r){const score=n=>Number.isFinite(n)&&n>=0&&n<=100;return r?.engine==='local-phoneme'&&score(r.score)&&score(r.accuracy)&&score(r.completeness)&&r.duration>0&&r.duration<=20&&Array.isArray(r.words)&&r.words.length&&r.words.every(w=>typeof w.word==='string'&&w.word.trim()&&score(w.score))}
function recordingInfo(data){
 if(Object.prototype.toString.call(data)!=='[object ArrayBuffer]')return{code:'FILE_NOT_BINARY'};
 const byteLength=data.byteLength;if(byteLength<44)return{code:'WAV_TOO_SHORT',byteLength};
 const bytes=new Uint8Array(data),tag=offset=>String.fromCharCode(...bytes.slice(offset,offset+4));
 const riff=tag(0)==='RIFF',wave=tag(8)==='WAVE',container=riff&&wave?'RIFF/WAVE':'OTHER';
 const riffBytes=new DataView(data).getUint32(4,true)+8,info={byteLength,riffBytes,container};
 if(!riff||!wave)return{...info,code:'WAV_HEADER_INVALID'};
 if(byteLength>640044)return{...info,code:'RECORDING_TOO_LARGE'};
 if(riffBytes!==byteLength)return{...info,code:'WAV_LENGTH_MISMATCH'};
 return info;
}
function repairRecording(data){
 const info=recordingInfo(data);
 // Repair only the iOS header patterns observed in production; preserve every sample.
 if(info.code!=='WAV_LENGTH_MISMATCH'||info.riffBytes!==info.byteLength+44)return data;
 const bytes=new Uint8Array(data),view=new DataView(data);let offset=12,format=false,samples;
 const tagAt=offset=>String.fromCharCode(...bytes.slice(offset,offset+4));
 // The native 44-byte header also reports file size as data size and blockAlign 4.
 if(tagAt(12)==='fmt '&&view.getUint32(16,true)===16&&tagAt(36)==='data'&&view.getUint16(20,true)===1&&view.getUint16(22,true)===1&&view.getUint32(24,true)===16000&&view.getUint32(28,true)===32000&&view.getUint16(32,true)===4&&view.getUint16(34,true)===16&&view.getUint32(40,true)===bytes.length){
  const payload=bytes.length-44;if(payload%2||payload<4800||payload>640000)return data;
  const repaired=data.slice(0),header=new DataView(repaired);header.setUint32(4,repaired.byteLength-8,true);header.setUint16(32,2,true);header.setUint32(40,payload,true);return repaired;
 }
 while(offset+8<=bytes.length){
  const tag=String.fromCharCode(...bytes.slice(offset,offset+4)),size=view.getUint32(offset+4,true);offset+=8;
  if(offset+size>bytes.length)return data;
  if(tag==='fmt '){
   if(format||size<16)return data;
   if(view.getUint16(offset,true)!==1||view.getUint16(offset+2,true)!==1||view.getUint32(offset+4,true)!==16000||view.getUint32(offset+8,true)!==32000||view.getUint16(offset+12,true)!==2||view.getUint16(offset+14,true)!==16)return data;
   format=true;
  }
  if(tag==='data'){if(samples!==undefined)return data;samples=size}
  offset+=size+(size%2);
 }
 if(offset!==bytes.length||!format||!samples||samples%2||samples<4800||samples>640000)return data;
 const repaired=data.slice(0);new DataView(repaired).setUint32(4,repaired.byteLength-8,true);return repaired;
}
const serverCodes={'Invalid WAV recording':'INVALID_WAV','Truncated WAV recording':'INVALID_WAV','Invalid WAV format':'INVALID_WAV','Invalid WAV data':'INVALID_WAV','16 kHz mono PCM WAV required':'INVALID_WAV','Recording must last 0.15 to 20 seconds':'INVALID_WAV','Unknown practice target':'UNKNOWN_TARGET','Recording too large':'RECORDING_TOO_LARGE','WAV required':'INVALID_WAV'};
function createMedia(wx,{onState=()=>{},onDiagnostic=diagnostic=>console.warn('Pronunciation submission failed',diagnostic)}={}){
 const state={playing:false,paused:false,source:'',recording:false,requesting:false,assessing:false,clip:false,result:null,message:'',diagnostic:null};
 let epoch=0,playEpoch=0,playKey='',pendingNext=null,dead=false,target=null,audio=null,file=null,task=null,capture=false,discard=false,recorder=null;
 const emit=()=>{if(!dead)onState({...state})};
 const unlink=path=>{if(path)wx.getFileSystemManager().unlink({filePath:path,fail(){}})};
 function stopAudio(){playEpoch++;playKey='';pendingNext=null;if(audio){const old=audio;audio=null;old.stop();old.destroy()}Object.assign(state,{playing:false,paused:false,source:''});emit()}
 function play(paths,source=''){stopAudio();if(dead||state.recording||state.requesting)return;const current=playEpoch,queue=paths.filter(Boolean);playKey=JSON.stringify([source,queue]);state.source=source;function next(){if(dead||current!==playEpoch)return;const path=queue.shift();if(!path){Object.assign(state,{playing:false,paused:false,source:''});playKey='';emit();return}const player=wx.createInnerAudioContext();audio=player;player.src=url(path);player.onEnded(()=>{if(dead||current!==playEpoch||audio!==player)return;audio=null;player.destroy();if(state.paused)pendingNext=next;else next()});player.onError(()=>{if(dead||current!==playEpoch||audio!==player)return;stopAudio();state.message='这段声音暂时无法播放，请重试。';emit()});state.playing=true;state.paused=false;emit();player.play()}next()}
 function toggleAudio(paths,source=''){
  if(dead||state.recording||state.requesting||state.assessing)return;
  if((audio||pendingNext)&&playKey===JSON.stringify([source,paths.filter(Boolean)])){
   if(state.playing){audio.pause();state.playing=false;state.paused=true}
   else if(state.paused){state.paused=false;if(pendingNext){const next=pendingNext;pendingNext=null;next()}else{audio.play();state.playing=true}}
   emit();return;
  }
  play(paths,source);
 }
 function detach(){if(!recorder)return;recorder.offStart(onStart);recorder.offStop(onStop);recorder.offError(onError)}
 function onStart(){if(!capture)return;if(dead||discard){recorder.stop();return}state.requesting=false;state.recording=true;state.message='正在录音，读完后点停止。最长20秒。';emit()}
 function onStop(result){if(!capture)return;capture=false;if(owners.get(recorder)===api)owners.delete(recorder);state.recording=false;state.requesting=false;if(dead||discard){unlink(result.tempFilePath)}else{unlink(file);file=result.tempFilePath;state.clip=!!file&&result.duration>=250;state.result=null;state.message=state.clip?'可以先回听，准备好了再提交练习反馈。':'录音太短，请读完后再停止。'}if(dead)detach();emit()}
 function onError(){if(!capture)return;capture=false;if(owners.get(recorder)===api)owners.delete(recorder);state.recording=false;state.requesting=false;state.message='录音未完成，请检查麦克风权限后重试。';if(dead)detach();emit()}
 const invoke=(name,options={})=>new Promise((resolve,reject)=>wx[name]({...options,success:resolve,fail:reject}));
 async function record(){if(dead||capture||state.requesting||state.assessing||target?.speakable===false)return;cancel();const current=epoch;state.requesting=true;state.message='请同意隐私说明并允许使用麦克风。';emit();try{if(!wx.requirePrivacyAuthorize)throw new Error('请更新微信后再录音。');await invoke('requirePrivacyAuthorize');if(dead||current!==epoch)return;await invoke('authorize',{scope:'scope.record'});if(dead||current!==epoch)return;if(!recorder){recorder=wx.getRecorderManager();recorder.onStart(onStart);recorder.onStop(onStop);recorder.onError(onError)}if(owners.has(recorder))throw new Error('上一次录音正在结束，请稍后重试。');owners.set(recorder,api);capture=true;discard=false;recorder.start({duration:20000,sampleRate:16000,numberOfChannels:1,encodeBitRate:48000,format:'wav'})}catch(error){if(current!==epoch||dead)return;state.requesting=false;state.message=error.message||'还未获得麦克风权限。可以继续听读，或在设置中允许麦克风。';emit()}}
 function stopRecord(){if(capture&&!discard){recorder.stop();state.message='正在结束录音…';emit()}}
 function cancel(){epoch++;task?.abort();task=null;stopAudio();if(capture){discard=true;recorder.stop()}unlink(file);file=null;Object.assign(state,{recording:false,requesting:false,assessing:false,clip:false,result:null,message:'',diagnostic:null});emit()}
 async function submit(){
  if(dead||!file||!state.clip||state.assessing||!target?.id)return;
  stopAudio();const current=++epoch,path=file,id=target.id;let stage='file',info={};
  state.assessing=true;state.result=null;state.diagnostic=null;state.message='正在取得练习反馈…';emit();
  try{
   let data=await new Promise((resolve,reject)=>wx.getFileSystemManager().readFile({filePath:path,success:r=>resolve(r.data),fail:reject}));
   data=repairRecording(data);
   if(dead||current!==epoch)return;info=recordingInfo(data);if(info.code)throw{code:info.code};
   stage='upload';const result=await new Promise((resolve,reject)=>{task=wx.request({url:origin+'/api/miniprogram/pronunciation?target='+encodeURIComponent(id),method:'POST',data,header:{'Content-Type':'audio/wav'},timeout:90000,success:r=>r.statusCode===200?resolve(r.data):reject({status:r.statusCode,code:serverCodes[r.data?.error]||'HTTP_ERROR'}),fail:reject})});
   if(dead||current!==epoch)return;stage='result';if(!validResult(result))throw{code:'INVALID_RESULT'};
   state.result=result;state.message='这是本次跟读的练习反馈。';
  }catch(error){
   if(dead||current!==epoch)return;error=error||{};
   const code=error.code||(stage==='file'?'FILE_READ_FAILED':/timeout/i.test(error.errMsg||'')?'REQUEST_TIMEOUT':'REQUEST_FAILED');
   const diagnostic={stage,code,...info,...(Number.isInteger(error.status)?{status:error.status}:{}),...(Number.isInteger(error.errno)?{errno:error.errno}:{})};
   state.diagnostic=diagnostic;onDiagnostic(diagnostic);
   state.message=error.status===503?'评分服务尚未准备好，仍可录音和回听。':error.status===422?'这次没有听清，请靠近麦克风再读一次。':error.status===429?'请求较多，请稍后再提交。':code==='WAV_LENGTH_MISMATCH'||code==='WAV_TOO_SHORT'||code==='FILE_READ_FAILED'?'录音文件没有保存完整，请重新录音。':code==='INVALID_WAV'||code==='WAV_HEADER_INVALID'||code==='FILE_NOT_BINARY'?'这部手机的录音格式暂不兼容，请重新录音。':code==='RECORDING_TOO_LARGE'||error.status===413?'录音文件太大，请缩短到20秒内再录一次。':code==='UNKNOWN_TARGET'?'这句练习内容已更新，请返回后重新打开。':code==='REQUEST_TIMEOUT'?'提交超时，请检查网络后再提交。':code==='REQUEST_FAILED'?'录音没有传到服务器，请检查网络后再提交。':code==='INVALID_RESULT'?'评分反馈格式异常，请稍后再提交。':'评分请求失败，请稍后再提交。';
  }finally{if(current===epoch&&!dead){task=null;state.assessing=false;emit()}}
 }
 const api={state,play,toggleAudio,stopAudio,record,stopRecord,submit,cancel,replay:()=>file&&toggleAudio([file],'replay'),setTarget(next){cancel();target=next},destroy(){cancel();dead=true;if(!capture)detach()}};return api;
}
module.exports={createMedia,validResult};
