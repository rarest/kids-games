"""Practice phoneme similarity, not a calibrated pronunciation probability."""
import array
import io
import math
import wave

def read_wav(data):
    try:
        with wave.open(io.BytesIO(data), 'rb') as audio:
            if (audio.getnchannels(),audio.getsampwidth(),audio.getframerate(),audio.getcomptype()) != (1,2,16000,'NONE'):
                raise ValueError('16 kHz mono PCM WAV required')
            duration=audio.getnframes()/16000
            if not 0.15 <= duration <= 20: raise ValueError('Recording must last 0.15 to 20 seconds')
            raw=audio.readframes(audio.getnframes())
            if len(raw)!=audio.getnframes()*2:raise ValueError('Truncated WAV')
    except (wave.Error,EOFError) as error:
        raise ValueError('Invalid WAV') from error
    samples=array.array('h');samples.frombytes(raw)
    if __import__('sys').byteorder!='little':samples.byteswap()
    values=[x/32768 for x in samples]
    rms=math.sqrt(sum(x*x for x in values)/len(values))
    active=sum(abs(x)>0.012 for x in values)/len(values)
    if rms<0.003 or active<0.015:raise ValueError('No speech detected. Try speaking closer to the microphone.')
    return values,duration

def align_score(reference,heard):
    # English vowel duration varies by accent/context. Keep vowel quality; ignore IPA length.
    reference=[(word,[p.replace("ː","") for p in ps]) for word,ps in reference]
    heard=[p.replace("ː","") for p in heard]
    if not heard:raise ValueError('No speech phonemes detected. Please retry.')
    expected=[p for _,ps in reference for p in ps]
    if not expected:raise ValueError('Reference pronunciation unavailable')
    n,m=len(expected),len(heard)
    if n>1000 or m>1500:raise ValueError('Speech is too long')
    costs=[[0]*(m+1) for _ in range(n+1)]
    for i in range(n+1):costs[i][0]=i
    for j in range(m+1):costs[0][j]=j
    for i in range(1,n+1):
        for j in range(1,m+1):
            costs[i][j]=min(costs[i-1][j]+1,costs[i][j-1]+1,costs[i-1][j-1]+(expected[i-1]!=heard[j-1]))
    pairs=[];i=n;j=m
    while i or j:
        if i and j and costs[i][j]==costs[i-1][j-1]+(expected[i-1]!=heard[j-1]):pairs.append((i-1,heard[j-1]));i-=1;j-=1
        elif i and costs[i][j]==costs[i-1][j]+1:pairs.append((i-1,None));i-=1
        else:pairs.append((min(max(i-1,0),n-1),heard[j-1],True));j-=1
    pairs.reverse();words=[];start=0;covered=0
    for word,phonemes in reference:
        slots=[p for p in pairs if start<=p[0]<start+len(phonemes)]
        observed=[p[1] for p in slots if p[1] is not None]
        matched=sum(len(p)==2 and p[1]==expected[p[0]] for p in slots)
        present=sum(len(p)==2 and p[1] is not None for p in slots);covered+=present
        similarity=round(100*matched/max(len(phonemes),len(observed),1))
        words.append({'word':word,'score':similarity,'errorType':'Omission' if not observed else 'None' if similarity>=80 else 'Mispronunciation','expectedPhonemes':' '.join(phonemes),'heardPhonemes':' '.join(observed)})
        start+=len(phonemes)
    score=round(100*max(0,1-costs[n][m]/max(n,m)))
    return {'score':score,'accuracy':score,'completeness':round(100*covered/n),'words':words,'engine':'local-phoneme'}
