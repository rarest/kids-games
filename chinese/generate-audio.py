#!/usr/bin/env python3
"""Reproducible fixed Mandarin clips. Run in the prepared edge-tts environment.
Stable voice/input hashes; bounded concurrency; reuse only decodable assets.
"""
import asyncio, hashlib, json, subprocess
from pathlib import Path
import edge_tts
HERE=Path(__file__).resolve().parent
VOICE='zh-CN-XiaoxiaoNeural'
RATE='-10%'
def valid(path):
    if not path.exists() or path.stat().st_size<500:return False
    return subprocess.run(['ffmpeg','-v','error','-i',str(path),'-f','null','-'],capture_output=True).returncode==0
async def main():
    data=json.loads(subprocess.check_output(['node',str(HERE/'audio-inputs.mjs')],text=True))
    clips={}
    for row in data['inputs']:
        text=row['text'];spoken=text
        for change in data['overrides']:spoken=spoken.replace(change['from'],change['to'])
        name=hashlib.sha256((VOICE+'\n'+RATE+'\n'+spoken).encode()).hexdigest()[:24]+'.mp3'
        clips[text]={'file':'audio/'+name,'spoken':spoken,'voice':VOICE,'rate':RATE}
        if text=='……':clips[text]['silence_seconds']=0.8
    (HERE/'audio').mkdir(exist_ok=True)
    manifest={'voice':VOICE,'rate':RATE,'inputs':data['inputs'],'overrides':data['overrides'],'clips':clips}
    (HERE/'audio-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    (HERE/'audio-manifest.js').write_text('export default '+json.dumps({t:c['file'] for t,c in clips.items()},ensure_ascii=False)+';\n')
    sem=asyncio.Semaphore(3);done=0
    async def generate(clip):
        nonlocal done
        async with sem:
            target=HERE/clip['file']
            if clip['spoken']=='……' and not valid(target):
                subprocess.run(['ffmpeg','-v','error','-y','-f','lavfi','-i','anullsrc=r=24000:cl=mono','-t','0.8','-c:a','libmp3lame',str(target)],check=True)
            if not valid(target):
                for attempt in range(6):
                    try:
                        await edge_tts.Communicate(clip['spoken'],VOICE,rate=RATE).save(str(target))
                        if not valid(target):raise RuntimeError('Invalid MP3 '+str(target))
                        break
                    except Exception:
                        if attempt==5:
                            print('FAILED '+clip['spoken'],flush=True)
                            raise
                        await asyncio.sleep(2*(attempt+1))
            done+=1
            if done%50==0:print(f'{done}/{len(clips)} validated',flush=True)
    results=await asyncio.gather(*(generate(c) for c in {c['file']:c for c in clips.values()}.values()),return_exceptions=True)
    failures=[r for r in results if isinstance(r,Exception)]
    if failures:raise RuntimeError(f'{len(failures)} clips failed; rerun to retry missing assets')
    print(f'DONE {len(clips)} distinct texts; all clips decoded',flush=True)
asyncio.run(main())
