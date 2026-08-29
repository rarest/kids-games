import { writeFileSync } from 'node:fs';

const output=process.argv[2];
if(!output)throw new Error('Usage: node scripts/generate-royal-garden-bgm.mjs OUTPUT.wav');
const rate=48_000,duration=24,frames=rate*duration,left=new Float64Array(frames),right=new Float64Array(frames);
const midi=note=>440*2**((note-69)/12);
const chords=[[60,64,67,71],[57,60,64,67],[53,57,60,64],[55,60,62,67],[60,64,67,71],[57,60,64,69],[53,57,60,67],[55,59,62,67]];
const roots=[48,45,41,43,48,45,41,43],pattern=[0,2,1,3,2,1,3,2];

function addTone({start,length,note,gain,pan=0,kind='bell'}){
  const from=Math.max(0,Math.floor(start*rate)),to=Math.min(frames,Math.ceil((start+length)*rate)),frequency=midi(note);
  for(let index=from;index<to;index++){
    const age=index/rate-start,phase=2*Math.PI*frequency*age,progress=age/length;
    let envelope,sample;
    if(kind==='pad'){
      envelope=Math.min(1,age/.55,Math.max(0,(length-age)/.7));
      sample=(Math.sin(phase)+.24*Math.sin(phase*2+.3)+.1*Math.sin(phase*.5))*envelope;
    }else if(kind==='bass'){
      envelope=Math.min(1,age/.04)*Math.exp(-age*1.15)*Math.max(0,1-progress);
      sample=(Math.sin(phase)+.18*Math.sin(phase*2))*envelope;
    }else{
      envelope=Math.min(1,age/.012)*Math.exp(-age*3.4)*Math.max(0,1-progress);
      sample=(Math.sin(phase)+.42*Math.sin(phase*2)+.17*Math.sin(phase*3))*envelope;
    }
    left[index]+=sample*gain*Math.sqrt((1-pan)/2);right[index]+=sample*gain*Math.sqrt((1+pan)/2);
  }
}

for(let chordIndex=0;chordIndex<chords.length;chordIndex++){
  const start=chordIndex*3,chord=chords[chordIndex];
  chord.forEach((note,index)=>addTone({start,length:3.12,note:note-12,gain:.052,pan:(index-1.5)*.22,kind:'pad'}));
  for(let beat=0;beat<4;beat++)addTone({start:start+beat*.75,length:1.15,note:roots[chordIndex],gain:.075,pan:-.08,kind:'bass'});
  for(let step=0;step<8;step++){
    const octave=step===6?12:0,note=chord[pattern[step]]+octave;
    addTone({start:start+step*.375,length:.72,note,gain:step%2?.075:.095,pan:(step%4-1.5)*.18});
  }
}

for(const [delay,gain] of [[.28,.17],[.56,.1],[.84,.055]]){
  const offset=Math.round(delay*rate);
  for(let index=offset;index<frames;index++){
    left[index]+=right[index-offset]*gain;right[index]+=left[index-offset]*gain;
  }
}
let peak=0;for(let index=0;index<frames;index++)peak=Math.max(peak,Math.abs(left[index]),Math.abs(right[index]));
const scale=.76/(peak||1),fade=Math.round(.09*rate),pcm=Buffer.alloc(frames*4);
for(let index=0;index<frames;index++){
  const edge=Math.min(1,index/fade,(frames-1-index)/fade),soft=Math.sin(edge*Math.PI/2),l=Math.tanh(left[index]*scale)*soft,r=Math.tanh(right[index]*scale)*soft;
  pcm.writeInt16LE(Math.round(l*32767),index*4);pcm.writeInt16LE(Math.round(r*32767),index*4+2);
}
const header=Buffer.alloc(44),bytesPerSecond=rate*4;
header.write('RIFF',0);header.writeUInt32LE(36+pcm.length,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(2,22);header.writeUInt32LE(rate,24);header.writeUInt32LE(bytesPerSecond,28);header.writeUInt16LE(4,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);
writeFileSync(output,Buffer.concat([header,pcm]));
