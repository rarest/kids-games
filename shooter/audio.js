// Original, gently evolving ambient score. No downloads or external audio services.
const CHORDS=[[48,55,60,64],[45,52,60,64],[41,48,57,60],[43,50,59,62]];
const frequency=midi=>440*2**((midi-69)/12);
export function createAudioController({AudioContext=globalThis.AudioContext??globalThis.webkitAudioContext,setInterval=globalThis.setInterval,clearInterval=globalThis.clearInterval}={}){
  let context=null,master=null,timer=null,enabled=true,active=false,beat=0,nextNote=0;
  const voices=new Map(),lastEffect=new Map();
  function tone(hz,time,duration,volume,type='sine',endHz=hz,music=false){
    if(voices.size>=40)return;
    const source=context.createOscillator(),gain=context.createGain();
    source.type=type;source.frequency.setValueAtTime(hz,time);source.frequency.exponentialRampToValueAtTime(endHz,time+duration);
    gain.gain.setValueAtTime(.0001,time);gain.gain.exponentialRampToValueAtTime(volume,time+.025);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
    source.connect(gain);gain.connect(master);voices.set(source,music);
    source.onended=()=>{voices.delete(source);source.disconnect();gain.disconnect()};
    source.start(time);source.stop(time+duration+.03);
  }
  function schedule(){
    if(!active||!enabled||context?.state!=='running')return;
    if(nextNote<context.currentTime)nextNote=context.currentTime+.04;
    while(nextNote<context.currentTime+.25){
      const chord=CHORDS[Math.floor(beat/8)%4],cycle=Math.floor(beat/32)%4;
      if(beat%8===0)for(const midi of chord)tone(frequency(midi),nextNote,4.7,.018,'sine',frequency(midi),true);
      const note=chord[(beat+cycle)%4]+12;
      tone(frequency(note),nextNote,1.5,.023,'sine',frequency(note),true);
      if(cycle===2&&beat%4===2)tone(frequency(note+12),nextNote+.15,1,.009,'sine',frequency(note+12),true);
      beat++;nextNote+=.6;
    }
  }
  function stop(finishEffects=false){
    if(timer!==null){clearInterval(timer);timer=null}
    for(const [source,music] of voices){if(finishEffects&&!music)continue;try{source.stop()}catch{}voices.delete(source)}
    lastEffect.clear();
    if(!finishEffects)master?.gain.setValueAtTime(0,context.currentTime);
  }
  function sync(){
    if(!active||!enabled||context?.state!=='running'){stop();return}
    master.gain.setValueAtTime(.55,context.currentTime);
    if(timer===null){nextNote=context.currentTime+.04;schedule();timer=setInterval(schedule,100)}
  }
  return{
    async unlock(){
      if(!AudioContext)return false;
      try{
        if(!context){context=new AudioContext();master=context.createGain();master.connect(context.destination)}
        await context.resume();sync();return context.state==='running';
      }catch{return false}
    },
    setActive(value,{finishEffects=false}={}){active=Boolean(value);if(!active&&finishEffects)stop(true);else sync()},
    setEnabled(value){enabled=Boolean(value);sync()},
    playEffect(name){
      if(!enabled||!active||context?.state!=='running')return false;
      const now=context.currentTime;
      if(now-(lastEffect.get(name)??-Infinity)<.12)return false;
      lastEffect.set(name,now);
      const effects={hit:[360,.13,.12,'triangle',110],damage:[150,.3,.18,'triangle',45],pulse:[100,.5,.12,'sine',650],upgrade:[520,.45,.08,'sine',780]};
      const effect=effects[name];if(!effect)return false;
      tone(effect[0],now,effect[1],effect[2],effect[3],effect[4]);return true;
    },
    destroy(){active=false;stop();context?.close()?.catch(()=>{})}
  };
}
