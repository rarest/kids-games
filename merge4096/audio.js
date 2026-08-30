const NOTES={D4:293.66,A3:220,B3:246.94,F3:174.61,G3:196,A4:440,F4:349.23,G4:392,E4:329.63};
const CANON=['D4','A3','B3','F3','G3','D4','G3','A3'];

export function createAudioController(deps={}) {
  const AudioContext=deps.AudioContext??globalThis.AudioContext??globalThis.webkitAudioContext;
  const every=deps.setInterval??globalThis.setInterval;
  const cancel=deps.clearInterval??globalThis.clearInterval;
  let context=null,master=null,timer=null,enabled=true,step=0;
  const tone=(frequency,start,duration,volume=.04,type='sine')=>{
    if(!context||!master)return;
    const oscillator=context.createOscillator(),gain=context.createGain();
    oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,start);
    gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(volume,start+.02);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    oscillator.connect(gain).connect(master);oscillator.start(start);oscillator.stop(start+duration+.03);
  };
  const phrase=()=>{
    if(!enabled||!context)return;
    const now=context.currentTime+.03;
    for(let index=0;index<4;index++){
      const root=NOTES[CANON[(step+index)%CANON.length]];
      tone(root,now+index*.42,.38,.025,'triangle');tone(root*2,now+index*.42+.18,.18,.012,'sine');
    }
    step=(step+4)%CANON.length;
  };
  const startMusic=()=>{if(enabled&&context&&!timer){phrase();timer=every(phrase,1680)}};
  const stopMusic=()=>{if(timer){cancel(timer);timer=null}};
  return {
    async unlock(){
      if(!AudioContext)return;
      if(!context){context=new AudioContext();master=context.createGain();master.gain.setValueAtTime(.55,context.currentTime);master.connect(context.destination)}
      try{await context.resume?.()}catch{}
      startMusic();
    },
    setEnabled(value){enabled=Boolean(value);enabled?startMusic():stopMusic()},
    playEffect(name,value=2){
      if(!enabled||!context)return;
      const base=Math.min(880,180+Math.log2(Math.max(2,value))*42),now=context.currentTime;
      const maps={draw:[base,.09,.035,'sine'],place:[base*.8,.1,.035,'triangle'],merge:[base*1.25,.22,.06,'sine'],combo:[660,.36,.07,'triangle'],bomb:[90,.35,.1,'sawtooth'],candle:[520,.28,.045,'sine'],win:[784,.55,.08,'triangle'],lose:[130,.5,.05,'sine']};
      const [frequency,duration,volume,type]=maps[name]??maps.place;tone(frequency,now,duration,volume,type);
      if(name==='win')tone(1046,now+.18,.5,.06,'triangle');
    },
    destroy(){stopMusic();try{context?.close?.()}catch{}context=null;master=null},
    isUnlocked(){return Boolean(context)}
  };
}
