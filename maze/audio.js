export const SOUND_DEFINITIONS = {
  footstep: { files: ['footstep.mp3','footstep.webm'], volume: .65 },
  bump: { files: ['bump.mp3','bump.webm'], volume: .14 },
  coin: { files: ['coin.mp3','coin.webm'], volume: .22 },
  key: { files: ['key.mp3','key.webm'], volume: .24 },
  'door-locked': { files: ['door-locked.mp3','door-locked.webm'], volume: .30 },
  'door-open': { files: ['door-open.mp3','door-open.webm'], volume: .30 },
  purchase: { files: ['purchase.mp3','purchase.webm'], volume: .25 },
  explosion: { files: ['explosion.mp3','explosion.webm'], volume: .34 },
  hook: { files: ['hook.mp3','hook.webm'], volume: .26 }
};
export const MUSIC_DEFINITION={
  files:[
    {file:'royal-garden.m4a',type:'audio/mp4; codecs="mp4a.40.2"'},
    {file:'royal-garden.webm',type:'audio/webm; codecs="opus"'}
  ],
  volume:.12
};
export const MAX_ACTIVE_EFFECTS=12;
export const PENDING_EFFECT_TTL=400;
export const AUDIO_RELEASE='20260831a';
export const audioAssetUrl=(baseUrl,file)=>`${baseUrl}/${file}?v=${AUDIO_RELEASE}`;

const clamp = value => Math.max(0, Math.min(1, value));
const resolvedFetch=fetchFn=>typeof fetchFn==='function'?fetchFn:null;

export function createAudioController({
  baseUrl='./audio',enabled=true,AudioClass=globalThis.Audio,
  AudioContextClass=globalThis.AudioContext||globalThis.webkitAudioContext,
  fetchFn=globalThis.fetch?.bind(globalThis),now=()=>performance.now(),random=Math.random
}={}){
  const mediaSources=new Map(),mediaGenerations=new WeakMap(),activeMedia=new Set(),effectBuffers=new Map(),decodeSettled=new Set(),decodeTasks=new Map(),activeSources=new Set(),pendingEffects=[];
  const load=resolvedFetch(fetchFn),prefetched=new Map();
  let music=null,musicActive=false,context=null,masterGain=null,unlocked=false,soundEnabled=Boolean(enabled),lastFootstep=-Infinity,decodeStarted=false,webAudioFailed=false;

  const effectUrl=(name,file)=>audioAssetUrl(baseUrl,file||SOUND_DEFINITIONS[name]?.files?.[0]);

  function prefetch(name){
    if(prefetched.has(name))return prefetched.get(name);
    const task=Promise.all((SOUND_DEFINITIONS[name]?.files||[]).map(async file=>{
      if(!load)return null;
      try{
        const response=await load(effectUrl(name,file));
        if(!response?.ok)return null;
        return{file,bytes:await response.arrayBuffer()};
      }catch{return null}
    }));
    prefetched.set(name,task);return task;
  }
  for(const name of Object.keys(SOUND_DEFINITIONS))prefetch(name);

  function mediaSourceFor(name){
    if(!SOUND_DEFINITIONS[name]||!AudioClass)return null;
    if(!mediaSources.has(name)){
      const source=new AudioClass(effectUrl(name));source.preload='auto';mediaSources.set(name,source);
    }
    return mediaSources.get(name);
  }

  function chosenMusicFile(){
    const candidates=MUSIC_DEFINITION.files;
    if(typeof AudioClass?.prototype?.canPlayType!=='function')return candidates[0].file;
    try{
      const probe=new AudioClass();
      return candidates.find(candidate=>probe.canPlayType(candidate.type)!=='')?.file||candidates.at(-1).file;
    }catch{return candidates[0].file}
  }

  function musicSource(){
    if(!AudioClass)return null;
    if(!music){music=new AudioClass(audioAssetUrl(baseUrl,chosenMusicFile()));music.preload='auto';music.loop=true;music.volume=MUSIC_DEFINITION.volume}
    return music;
  }

  function startMusic(){
    if(!unlocked||!soundEnabled||musicActive)return musicActive;
    const source=musicSource();if(!source)return false;
    musicActive=true;
    try{const result=source.play();if(result?.catch)result.catch(()=>{musicActive=false})}catch{musicActive=false;return false}
    return true;
  }

  function removeSource(source){activeSources.delete(source)}

  function startBuffer(name,{volume=1,rate}={}){
    const definition=SOUND_DEFINITIONS[name],buffer=effectBuffers.get(name);
    if(!definition||!buffer||!context||!masterGain||webAudioFailed||context.state!=='running')return false;
    while(activeSources.size>=MAX_ACTIVE_EFFECTS){
      const oldest=activeSources.values().next().value;activeSources.delete(oldest);
      try{oldest.stop()}catch{}
    }
    try{
      const source=context.createBufferSource(),gain=context.createGain();
      source.buffer=buffer;gain.gain.value=clamp(definition.volume*volume);
      source.playbackRate.value=rate||(.97+random()*.06);
      source.connect(gain);gain.connect(masterGain);source.onended=()=>removeSource(source);
      activeSources.add(source);source.start(0);return true;
    }catch{return false}
  }

  function playMedia(name,{volume=1,rate}={}){
    const definition=SOUND_DEFINITIONS[name],source=mediaSourceFor(name);
    if(!definition||!source)return false;
    mediaGenerations.set(source,(mediaGenerations.get(source)||0)+1);
    source.muted=false;source.volume=clamp(definition.volume*volume);source.playbackRate=rate||(.97+random()*.06);
    try{source.currentTime=0}catch{}
    activeMedia.add(source);source.onended=()=>activeMedia.delete(source);
    try{
      const result=source.play();
      if(result?.catch)result.catch(()=>activeMedia.delete(source));
      return true;
    }catch{activeMedia.delete(source);return false}
  }

  function primeMediaSource(source){
    if(!source)return;
    const generation=(mediaGenerations.get(source)||0)+1;mediaGenerations.set(source,generation);
    const reset=()=>{if(mediaGenerations.get(source)!==generation)return;try{source.pause?.();source.currentTime=0}catch{}source.muted=false};
    source.muted=true;source.volume=0;
    try{
      const result=source.play();
      if(result?.then)result.then(reset,reset);else reset();
    }catch{reset()}
  }

  function primeFallbacks(){for(const name of Object.keys(SOUND_DEFINITIONS))primeMediaSource(mediaSourceFor(name))}

  function drainPending(name){
    for(let index=pendingEffects.length-1;index>=0;index--){
      const event=pendingEffects[index];
      if(event.name!==name)continue;
      pendingEffects.splice(index,1);
      if(!soundEnabled||now()-event.at>PENDING_EFFECT_TTL)continue;
      if(webAudioFailed||context?.state!=='running'||!startBuffer(name,event.options))playMedia(name,event.options);
    }
  }

  function failWebAudio(){
    webAudioFailed=true;
    for(const name of Object.keys(SOUND_DEFINITIONS))drainPending(name);
  }

  function decodeEffect(name){
    if(decodeTasks.has(name))return decodeTasks.get(name);
    const task=(async()=>{
      const candidates=await prefetch(name);
      for(const candidate of candidates){
        if(!candidate||!context)continue;
        try{
          const buffer=await context.decodeAudioData(candidate.bytes.slice(0));
          if(buffer){effectBuffers.set(name,buffer);break}
        }catch{}
      }
      decodeSettled.add(name);drainPending(name);return effectBuffers.get(name)||null;
    })();
    decodeTasks.set(name,task);return task;
  }

  function startDecoding(){
    if(decodeStarted||!context)return;
    decodeStarted=true;
    for(const name of Object.keys(SOUND_DEFINITIONS))decodeEffect(name);
  }

  async function unlock(){
    if(unlocked){resume();return true}
    unlocked=true;
    for(const name of Object.keys(SOUND_DEFINITIONS)){const source=mediaSourceFor(name);source?.load?.()}
    primeFallbacks();
    const background=musicSource();background?.load?.();
    if(AudioContextClass){
      try{
        context=new AudioContextClass();masterGain=context.createGain();masterGain.gain.value=soundEnabled?1:0;masterGain.connect(context.destination);
        const resumed=context.resume?.();startMusic();if(resumed?.then)await resumed;
        if(context.state==='running')startDecoding();else failWebAudio();
      }catch{failWebAudio();startMusic()}
    }else{failWebAudio();startMusic()}
    return true;
  }

  function play(name,options={}){
    if(!unlocked||!soundEnabled||!SOUND_DEFINITIONS[name])return false;
    const timestamp=now();
    if(name==='footstep'&&timestamp-lastFootstep<90)return false;
    if(name==='footstep')lastFootstep=timestamp;
    if(context&&!webAudioFailed){
      if(effectBuffers.has(name)){if(startBuffer(name,options))return true;return playMedia(name,options)}
      if(!decodeSettled.has(name)){
        if(pendingEffects.length>=MAX_ACTIVE_EFFECTS)pendingEffects.shift();
        pendingEffects.push({name,options,at:timestamp});return true;
      }
    }
    return playMedia(name,options);
  }

  function suspend(){
    pendingEffects.length=0;
    for(const source of [...activeSources]){try{source.stop()}catch{}activeSources.delete(source)}
    for(const source of activeMedia){source.pause?.()}activeMedia.clear();
    if(context?.state==='running'){const result=context.suspend?.();result?.catch?.(()=>{})}
    if(musicActive){music?.pause?.();musicActive=false}
    return true;
  }

  function resume(){
    if(!unlocked||!soundEnabled)return false;
    if(context&&!webAudioFailed&&context.state!=='running'){
      try{const result=context.resume?.();result?.then?.(()=>startDecoding(),failWebAudio)}catch{failWebAudio()}
    }
    if(masterGain)masterGain.gain.value=1;
    return startMusic();
  }

  function setEnabled(value){
    soundEnabled=Boolean(value);
    if(masterGain)masterGain.gain.value=soundEnabled?1:0;
    if(!soundEnabled)suspend();else resume();
    return soundEnabled;
  }

  return{
    unlock,play,setEnabled,suspend,resume,
    get enabled(){return soundEnabled},get unlocked(){return unlocked},
    get diagnostics(){return{
      unlocked,musicActive,usingWebAudio:Boolean(context&&!webAudioFailed),decodedEffects:effectBuffers.size,
      activeEffectSources:activeSources.size+activeMedia.size,pendingEffects:pendingEffects.length,
      maxActiveEffects:MAX_ACTIVE_EFFECTS
    }}
  };
}
