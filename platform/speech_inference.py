#!/usr/bin/env python3
"""Loopback-only in-memory acoustic phoneme practice assessment."""
import json
import os
import re
import subprocess
import threading
from functools import lru_cache
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs,urlsplit
import numpy as np
import onnxruntime as ort
from speech_scoring import align_score,read_wav
from speech_reference import espeak,target_words,tokenize

MODEL=Path(os.environ.get('SPEECH_MODEL_DIR',Path.home()/'.local/share/games-speech/model'))
VOCAB=json.loads((MODEL/'vocab.json').read_text())
ID_TO_PHONEME=VOCAB['id_to_phoneme'];BLANK=VOCAB['blank_id']
TOKENS=sorted((x for x in ID_TO_PHONEME.values() if not x.startswith('<') and x!='|'),key=len,reverse=True)
options=ort.SessionOptions();options.intra_op_num_threads=4;options.inter_op_num_threads=1
options.execution_mode=ort.ExecutionMode.ORT_SEQUENTIAL
SESSION=ort.InferenceSession(str(MODEL/'model.fp32.onnx'),sess_options=options,providers=['CPUExecutionProvider'])
INPUT=SESSION.get_inputs()[0].name
if SESSION.get_outputs()[0].shape[-1]!=len(ID_TO_PHONEME):raise RuntimeError('Model vocabulary mismatch')
LOCK=threading.BoundedSemaphore(1)

@lru_cache(maxsize=3000)
def reference(text,ipa=""):
    words=target_words(text)
    if not words or len(words)>100:raise ValueError('Reference text unavailable')
    parts=[ipa.replace('r','ɹ').replace('g','ɡ')] if ipa and len(words)==1 else espeak(' '.join(words)).split()
    if len(parts)!=len(words):parts=[espeak(w) for w in words]
    result=[(w,tokenize(p,TOKENS)) for w,p in zip(words,parts)]
    if any(not ps for _,ps in result):raise ValueError('Reference pronunciation unavailable')
    return result

def assess(data,text,ipa=""):
    signal,duration=read_wav(data)
    # Decode once with full sentence context. Padding keeps very short words usable.
    signal=np.pad(np.asarray(signal,dtype=np.float32),(1600,1600))
    x=((signal-signal.mean())/np.sqrt(signal.var()+1e-7))[None,:]
    logits=SESSION.run(None,{INPUT:x.astype(np.float32)})[0][0]
    ids=logits.argmax(-1);heard=[];confidence=[]
    probabilities=np.exp(logits-logits.max(axis=-1,keepdims=True))
    probabilities/=probabilities.sum(axis=-1,keepdims=True)
    start=0
    while start<len(ids):
        current=int(ids[start]);end=start+1
        while end<len(ids) and ids[end]==current:end+=1
        if current!=BLANK:
            p=ID_TO_PHONEME[str(current)]
            if p not in {'<unk>','|','<s>','</s>','<pad>'}:
                heard.append(p);confidence.append(float(probabilities[start:end,current].mean()))
        start=end
    if len(heard)<1 or np.count_nonzero(ids!=BLANK)<2:raise ValueError('No speech phonemes detected')
    result=align_score(reference(text,ipa),heard,confidence);result['duration']=round(duration,4)
    return result

class Handler(BaseHTTPRequestHandler):
    protocol_version='HTTP/1.1'
    def log_message(self,*args):pass
    def send(self,status,value):
        body=json.dumps(value,ensure_ascii=False).encode();self.send_response(status)
        self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(body)))
        self.send_header('Cache-Control','no-store');self.send_header('Connection','close');self.end_headers();self.wfile.write(body)
    def do_GET(self):
        if self.path=='/health':self.send(200,{'ready':True,'engine':'local-phoneme'})
        else:self.send(404,{'error':'Not found'})
    def do_POST(self):
        self.connection.settimeout(10)
        url=urlsplit(self.path);query=parse_qs(url.query);text=query.get('reference',[''])[0];ipa=query.get('ipa',[''])[0]
        if url.path!='/score':return self.send(404,{'error':'Not found'})
        if len(text)>1000 or len(ipa)>100 or not text:return self.send(400,{'error':'Invalid reference'})
        try:length=int(self.headers.get('Content-Length','0'))
        except ValueError:return self.send(400,{'error':'Invalid length'})
        if not 44<=length<=640044:return self.send(413,{'error':'Recording too large'})
        if not LOCK.acquire(blocking=False):return self.send(429,{'error':'Busy'})
        try:
            data=self.rfile.read(length)
            if len(data)!=length:return self.send(400,{'error':'Truncated recording'})
            self.send(200,assess(data,text,ipa))
        except ValueError:self.send(422,{'error':'No clear speech detected. Please retry'})
        except Exception:self.send(503,{'error':'Speech inference unavailable'})
        finally:LOCK.release()

if __name__=='__main__':
    print('Local phoneme model ready on 127.0.0.1:8769',flush=True)
    ThreadingHTTPServer(('127.0.0.1',8769),Handler).serve_forever()
