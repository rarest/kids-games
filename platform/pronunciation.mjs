import {problem} from './store.mjs';
export const MAX_WAV_BYTES=640044;
export function validateWav(audio){
  if(!Buffer.isBuffer(audio)||audio.length<44||audio.length>MAX_WAV_BYTES||audio.toString('ascii',0,4)!=='RIFF'||audio.toString('ascii',8,12)!=='WAVE'||audio.readUInt32LE(4)+8!==audio.length)throw problem(400,'Invalid WAV recording');
  let offset=12,format,data;
  while(offset+8<=audio.length){const type=audio.toString('ascii',offset,offset+4),size=audio.readUInt32LE(offset+4);offset+=8;if(offset+size>audio.length)throw problem(400,'Truncated WAV recording');if(type==='fmt '){if(size<16)throw problem(400,'Invalid WAV format');format=[audio.readUInt16LE(offset),audio.readUInt16LE(offset+2),audio.readUInt32LE(offset+4),audio.readUInt32LE(offset+8),audio.readUInt16LE(offset+12),audio.readUInt16LE(offset+14)];}if(type==='data'){if(data!==undefined)throw problem(400,'Invalid WAV data');data=size;}offset+=size+(size%2);}
  if(offset!==audio.length||!format||format.join(',')!=='1,1,16000,32000,2,16'||!data||data%2)throw problem(400,'16 kHz mono PCM WAV required');
  const duration=data/32000;if(duration<.15||duration>20)throw problem(400,'Recording must last 0.15 to 20 seconds');return{duration};
}
function validScore(v){return typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=100;}
export function validateResult(value,target,duration){
  const words=(target.en??target.text??target.english).match(/[A-Za-z]+(?:['’-][A-Za-z]+)*|[0-9]+/g)??[];
  if(!value||value.engine!=='local-phoneme'||!['score','accuracy','completeness'].every(k=>validScore(value[k]))||!Array.isArray(value.words)||value.words.length!==words.length||!Number.isFinite(value.duration)||Math.abs(value.duration-duration)>.1)throw problem(503,'Speech scoring unavailable');
  value.words.forEach((w,i)=>{if(w.word!==words[i]||!validScore(w.score)||!['None','Omission','Mispronunciation'].includes(w.errorType)||['expectedPhonemes','heardPhonemes'].some(k=>w[k]!==undefined&&(typeof w[k]!=='string'||w[k].length>500)))throw problem(503,'Invalid speech scoring response');});
  return{score:value.score,accuracy:value.accuracy,completeness:value.completeness,words:value.words.map(({word,score,errorType,expectedPhonemes,heardPhonemes})=>({word,score,errorType,...(expectedPhonemes!==undefined?{expectedPhonemes,heardPhonemes}:{})})),duration:value.duration,engine:'local-phoneme'};
}
export function createPronunciation({localUrl='',fetchImpl=fetch,perMinute=6,dailyLimit=1000,concurrency=1,now=Date.now}={}){
  let service;try{const u=new URL(localUrl);if(u.protocol==='http:'&&u.hostname==='127.0.0.1'&&!u.username&&!u.password&&u.pathname==='/')service=u.origin;}catch{}
  let health,healthAt=0,active=0,day='',total=0;const buckets=new Map();
  async function status(){if(!service)return{enabled:false,provider:null};if(health&&now()-healthAt<5000)return health;let enabled=false;try{const response=await fetchImpl(`${service}/health`,{signal:AbortSignal.timeout(2000)});const body=await response.json();enabled=response.ok&&body.ready===true&&body.engine==='local-phoneme';}catch{}healthAt=now();return health={enabled,provider:enabled?'local-phoneme':null};}
  async function assess({ip,target,audio}){
    const reference=target?.en??target?.text??target?.english;if(typeof reference!=='string'||!reference.trim()||reference.length>1000||typeof target.id!=='string')throw problem(400,'Unknown practice target');
    const {duration}=validateWav(audio);
    if(!(await status()).enabled)throw problem(503,'Speech scoring unavailable');
    const time=now(),currentDay=new Date(time).toISOString().slice(0,10);if(day!==currentDay){day=currentDay;total=0;}
    for(const[key,b]of buckets)if(b.end<=time)buckets.delete(key);
    if(buckets.size>10000&&!buckets.has(ip))throw problem(429,'Try again later');
    let b=buckets.get(ip);if(!b){b={end:time+60000,count:0};buckets.set(ip,b);}if(b.count>=perMinute||total>=dailyLimit)throw problem(429,'Speech practice limit reached. Try later');
    if(active>=concurrency)throw problem(429,'Speech scorer is busy. Try again shortly');
    b.count++;total++;active++;
    try{
      const response=await fetchImpl(`${service}/score?reference=${encodeURIComponent(reference)}${target.kind==='word'&&/^(read|use|live|lead|wind|tear|close|record|present|object|minute|bass)$/i.test(reference)&&typeof target.ipa==='string'?'&ipa='+encodeURIComponent(target.ipa):''}`,{method:'POST',headers:{'Content-Type':'audio/wav'},body:audio,signal:AbortSignal.timeout(55000)});
      const body=await response.json();if(!response.ok)throw problem(response.status===422?422:503,response.status===422?'No clear speech detected. Please retry':'Speech scoring unavailable');
      return validateResult(body,target,duration);
    }catch(error){if(error.status)throw error;health=null;throw problem(503,'Speech scoring unavailable');}finally{active--;}
  }
  return{status,assess};
}
