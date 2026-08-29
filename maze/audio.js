export const SOUND_DEFINITIONS = {
  footstep: { file: 'footstep.webm', volume: .65 },
  bump: { file: 'bump.webm', volume: .14 },
  coin: { file: 'coin.webm', volume: .22 },
  key: { file: 'key.webm', volume: .24 },
  'door-locked': { file: 'door-locked.webm', volume: .30 },
  'door-open': { file: 'door-open.webm', volume: .30 },
  purchase: { file: 'purchase.webm', volume: .25 },
  explosion: { file: 'explosion.webm', volume: .34 },
  hook: { file: 'hook.webm', volume: .26 }
};
export const MUSIC_DEFINITION={file:'royal-garden.webm',volume:.12};

const clamp = value => Math.max(0, Math.min(1, value));

export function createAudioController({ baseUrl = './audio', enabled = true, AudioClass = globalThis.Audio, now = () => performance.now() } = {}) {
  const sources = new Map();
  const active = new Set();
  let music=null,musicActive=false;
  let unlocked = false, soundEnabled = enabled, lastFootstep = -Infinity;

  function sourceFor(name) {
    if (!SOUND_DEFINITIONS[name] || !AudioClass) return null;
    if (!sources.has(name)) {
      const audio = new AudioClass(`${baseUrl}/${SOUND_DEFINITIONS[name].file}`);
      audio.preload = 'auto';
      sources.set(name, audio);
    }
    return sources.get(name);
  }

  function musicSource(){
    if(!AudioClass)return null;
    if(!music){music=new AudioClass(`${baseUrl}/${MUSIC_DEFINITION.file}`);music.preload='auto';music.loop=true;music.volume=MUSIC_DEFINITION.volume}
    return music;
  }

  function startMusic(){
    if(!unlocked||!soundEnabled||musicActive)return musicActive;
    const source=musicSource();if(!source)return false;
    musicActive=true;
    try{const result=source.play();if(result?.catch)result.catch(()=>{musicActive=false})}catch{musicActive=false;return false}
    return true;
  }

  async function unlock() {
    if(unlocked){startMusic();return true}
    unlocked = true;
    for (const name of Object.keys(SOUND_DEFINITIONS)) {
      const source = sourceFor(name);
      if (source?.load) source.load();
    }
    const background=musicSource();if(background?.load)background.load();startMusic();
    return true;
  }

  function play(name, { volume = 1, rate } = {}) {
    if (!unlocked || !soundEnabled) return false;
    const definition = SOUND_DEFINITIONS[name], source = sourceFor(name);
    if (!definition || !source) return false;
    const timestamp = now();
    if (name === 'footstep' && timestamp - lastFootstep < 90) return false;
    if (name === 'footstep') lastFootstep = timestamp;
    const voice = source.cloneNode ? source.cloneNode() : new AudioClass(source.src);
    voice.volume = clamp(definition.volume * volume);
    voice.playbackRate = rate || (.97 + Math.random() * .06);
    active.add(voice);
    voice.onended = () => active.delete(voice);
    try {
      const result = voice.play();
      if (result?.catch) result.catch(() => active.delete(voice));
    } catch { active.delete(voice); return false; }
    return true;
  }

  function setEnabled(value) {
    soundEnabled = Boolean(value);
    if (!soundEnabled) suspend();else startMusic();
    return soundEnabled;
  }
  function suspend() { for (const voice of active) voice.pause?.(); active.clear();if(musicActive){music?.pause?.();musicActive=false} }
  function resume() { return startMusic(); }
  return { unlock, play, setEnabled, suspend, resume, get enabled() { return soundEnabled; }, get unlocked() { return unlocked; } };
}
