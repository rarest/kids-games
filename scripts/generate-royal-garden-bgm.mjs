import { writeFileSync } from 'node:fs';

const output=process.argv[2];
if(!output)throw new Error('Usage: node scripts/generate-royal-garden-bgm.mjs OUTPUT.wav');

const rate=48_000,duration=72,frames=rate*duration,left=new Float64Array(frames),right=new Float64Array(frames);
const midi=note=>440*2**((note-69)/12);
const sections=[
  {
    energy:.88,
    chords:[[60,64,67,71],[57,60,64,67],[53,57,60,64],[55,60,62,67],[60,64,67,71],[57,60,64,69],[53,57,60,67],[55,59,62,67]],
    roots:[48,45,41,43,48,45,41,43],pattern:[0,2,1,3,2,1,3,2]
  },
  {
    energy:1.12,
    chords:[[65,69,72,76],[64,67,72,76],[62,65,69,72],[55,59,62,67],[65,69,72,77],[60,64,67,72],[62,65,69,74],[55,62,67,71]],
    roots:[41,40,38,43,41,36,38,43],pattern:[0,1,3,2,1,3,0,2]
  },
  {
    energy:.96,
    chords:[[57,60,64,69],[53,57,60,65],[60,64,67,72],[55,59,62,67],[57,60,64,69],[53,60,64,69],[55,60,62,67],[55,59,62,67]],
    roots:[45,41,48,43,45,41,43,43],pattern:[2,0,1,3,1,0,2,3]
  }
];

function addTone({start,length,note,gain,pan=0,kind='bell'}){
  const total=Math.ceil(length*rate),frequency=midi(note),from=Math.floor(start*rate);
  for(let offset=0;offset<total;offset++){
    const index=(from+offset)%frames,age=offset/rate,phase=2*Math.PI*frequency*age,progress=age/length;
    let envelope,sample;
    if(kind==='pad'){
      envelope=Math.min(1,age/.55,Math.max(0,(length-age)/.8));
      sample=(Math.sin(phase)+.24*Math.sin(phase*2+.3)+.1*Math.sin(phase*.5))*envelope;
    }else if(kind==='bass'){
      envelope=Math.min(1,age/.04)*Math.exp(-age*1.05)*Math.max(0,1-progress);
      sample=(Math.sin(phase)+.18*Math.sin(phase*2))*envelope;
    }else if(kind==='flute'){
      envelope=Math.min(1,age/.08)*Math.exp(-age*1.55)*Math.max(0,1-progress);
      sample=(Math.sin(phase)+.12*Math.sin(phase*2+.4))*envelope;
    }else{
      envelope=Math.min(1,age/.012)*Math.exp(-age*3.25)*Math.max(0,1-progress);
      sample=(Math.sin(phase)+.42*Math.sin(phase*2)+.17*Math.sin(phase*3))*envelope;
    }
    left[index]+=sample*gain*Math.sqrt((1-pan)/2);
    right[index]+=sample*gain*Math.sqrt((1+pan)/2);
  }
}

for(let sectionIndex=0;sectionIndex<sections.length;sectionIndex++){
  const section=sections[sectionIndex],sectionStart=sectionIndex*24;
  for(let chordIndex=0;chordIndex<section.chords.length;chordIndex++){
    const start=sectionStart+chordIndex*3,chord=section.chords[chordIndex],energy=section.energy;
    chord.forEach((note,index)=>addTone({start,length:3.22,note:note-12,gain:.05*energy,pan:(index-1.5)*.22,kind:'pad'}));
    for(let beat=0;beat<4;beat++)addTone({start:start+beat*.75,length:1.2,note:section.roots[chordIndex],gain:.067*energy,pan:-.08,kind:'bass'});
    for(let step=0;step<8;step++){
      const lift=sectionIndex===1?(step%3===1?12:0):(step===6?12:0),note=chord[section.pattern[step]]+lift;
      addTone({start:start+step*.375,length:.74,note,gain:(step%2?.066:.088)*energy,pan:(step%4-1.5)*.18});
    }
    if(sectionIndex===1&&chordIndex%2===0){
      addTone({start:start+.2,length:1.7,note:chord[3]+12,gain:.038,pan:.32,kind:'flute'});
      addTone({start:start+1.7,length:1.4,note:chord[2]+12,gain:.03,pan:-.24,kind:'flute'});
    }
    if(sectionIndex===2)addTone({start:start+.75,length:1.6,note:chord[(chordIndex+1)%chord.length],gain:.026,pan:.26,kind:'flute'});
  }
}

for(const [delay,gain] of [[.28,.15],[.56,.085],[.84,.045]]){
  const offset=Math.round(delay*rate),sourceLeft=left.slice(),sourceRight=right.slice();
  for(let index=0;index<frames;index++){
    const source=(index-offset+frames)%frames;
    left[index]+=sourceRight[source]*gain;right[index]+=sourceLeft[source]*gain;
  }
}

let peak=0;for(let index=0;index<frames;index++)peak=Math.max(peak,Math.abs(left[index]),Math.abs(right[index]));
const scale=.76/(peak||1),pcm=Buffer.alloc(frames*4);
for(let index=0;index<frames;index++){
  const l=Math.tanh(left[index]*scale),r=Math.tanh(right[index]*scale);
  pcm.writeInt16LE(Math.round(l*32767),index*4);pcm.writeInt16LE(Math.round(r*32767),index*4+2);
}
const header=Buffer.alloc(44),bytesPerSecond=rate*4;
header.write('RIFF',0);header.writeUInt32LE(36+pcm.length,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(2,22);header.writeUInt32LE(rate,24);header.writeUInt32LE(bytesPerSecond,28);header.writeUInt16LE(4,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);
writeFileSync(output,Buffer.concat([header,pcm]));
