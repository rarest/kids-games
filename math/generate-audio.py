#!/usr/bin/env python3
"""Build fixed Mandarin readings from the published math steps; never alter displayed text."""
import asyncio, hashlib, json, subprocess
from pathlib import Path
import edge_tts
HERE=Path(__file__).resolve().parent
VOICE='zh-CN-XiaoxiaoNeural'
RATE='-10%'
def valid(path):
    return path.exists() and path.stat().st_size>500 and subprocess.run(['ffmpeg','-v','error','-i',str(path),'-f','null','-'],capture_output=True).returncode==0
async def main():
    inputs=json.loads(subprocess.check_output(['node',str(HERE/'audio-inputs.mjs')],text=True))['inputs']
    clips={row['text']:{'file':'audio/'+hashlib.sha256((VOICE+'\n'+RATE+'\n'+row['spoken']).encode()).hexdigest()[:24]+'.mp3','spoken':row['spoken']} for row in inputs}
    (HERE/'audio').mkdir(exist_ok=True)
    sem=asyncio.Semaphore(3);done=0
    unique={c['file']:c for c in clips.values()}
    async def generate(clip):
        nonlocal done
        async with sem:
            target=HERE/clip['file']
            if not valid(target):
                for attempt in range(6):
                    try:
                        await edge_tts.Communicate(clip['spoken'],VOICE,rate=RATE).save(str(target))
                        if not valid(target):raise RuntimeError('Invalid MP3')
                        break
                    except Exception:
                        if attempt==5:raise
                        await asyncio.sleep(2*(attempt+1))
            done+=1
            if done%25==0:print(f'{done}/{len(unique)} complete and decoded',flush=True)
    results=await asyncio.gather(*(generate(c) for c in unique.values()),return_exceptions=True)
    failures=[r for r in results if isinstance(r,Exception)]
    if failures:raise RuntimeError(f'{len(failures)} clips failed; rerun to retry')
    (HERE/'audio-manifest.json').write_text(json.dumps({'voice':VOICE,'rate':RATE,'inputs':inputs,'clips':clips},ensure_ascii=False,indent=2)+'\n')
    (HERE/'audio-manifest.js').write_text('export default '+json.dumps({c['spoken']:'/math/'+c['file'] for c in clips.values()},ensure_ascii=False)+';\n')
    print(f'DONE {len(clips)} readings / {len(unique)} decoded assets',flush=True)
asyncio.run(main())
