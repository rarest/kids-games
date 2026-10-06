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

# The acoustic model emits multilingual IPA labels. Expand compound labels before
# alignment so one model token is not mistaken for multiple missing English sounds.
_COMPOUNDS={'ɚ':['ə','ɹ'],'ɝ':['ɜ','ɹ'],'əl':['ə','l'],'ɑɹ':['ɑ','ɹ'],
            'ɔɹ':['ɔ','ɹ'],'oɹ':['o','ɹ'],'ʊɹ':['ʊ','ɹ'],'əɹ':['ə','ɹ']}
_ALIASES={'g':'ɡ','r':'ɹ','a':'ɑ','ɨ':'ɪ','ᵻ':'ɪ'}
_NEAR={frozenset(pair):cost for pair,cost in [
    (('æ','ɛ'),.35),(('ɑ','ɐ'),.35),(('ʌ','ɑ'),.5),
    (('ʌ','ɐ'),.25),(('ʊ','u'),.35),(('ɪ','i'),.35),
    (('ɔ','o'),.35),(('ə','ɜ'),.35),(('ə','ɐ'),.35),
    (('ɑ','ɔ'),.4),(('ɔ','oʊ'),.45),(('ɛ','ə'),.45),
    (('æ','eɪ'),.8),(('ɡ','k'),.55),(('d','t'),.55),
    (('b','p'),.55),(('s','z'),.55),(('f','v'),.55)]}
_VOWELS=set('ɑɐʌæɛəɜɪiʊuoɔ')|{'aɪ','eɪ','aʊ','oʊ'}
_WEAK_VOWELS={word:{'ə'} for word in ('a','an','of','and','for','are','your')}
_WEAK_VOWELS.update({'the':{'ə','ɪ'},'to':{'ə','ʊ'},'do':{'ə','ʊ'},'you':{'ə','ʊ'}})

def normalize_phones(phones,confidences=None):
    normalized=[];confidence=[]
    if confidences is not None and len(confidences)!=len(phones):
        raise ValueError('Phoneme confidence length mismatch')
    for index,phone in enumerate(phones):
        phone=phone.replace('ː','')
        parts=_COMPOUNDS.get(phone,[phone])
        c=1.0 if confidences is None else confidences[index]
        if not isinstance(c,(int,float)) or not math.isfinite(c) or not 0<=c<=1:
            raise ValueError('Invalid phoneme confidence')
        normalized.extend(_ALIASES.get(p,p) for p in parts)
        confidence.extend([c]*len(parts))
    return normalized,confidence

def align_score(reference,heard,confidences=None):
    reference=[(word,normalize_phones(ps)[0]) for word,ps in reference]
    heard,confidence=normalize_phones(heard,confidences)
    if not heard:raise ValueError('No speech phonemes detected. Please retry.')
    expected=[p for _,ps in reference for p in ps]
    if not expected:raise ValueError('Reference pronunciation unavailable')
    n,m=len(expected),len(heard)
    if n>1000 or m>1500:raise ValueError('Speech is too long')
    owners=[];local=[];deletion=[];optional=[]
    sentence=len(reference)>1
    for word,phones in reference:
        for k,phone in enumerate(phones):
            cost=1.0;allowed=False
            # Coarticulation in the familiar grandparent words: /ndm/ may merge,
            # /ndp/ loses the stop and the nasal can take the following place.
            if word.lower().startswith(('grandma','grandmo','grandpa','grandfa')):
                if phone=='d' and k and phones[k-1]=='n' and k+1<len(phones):
                    cost=0.0;allowed=True
                if phone=='n' and phones[k:k+3]==['n','d','m']:
                    cost=.15;allowed=True
            # Coda r is absent in ordinary non-rhotic English varieties.
            if phone=='ɹ' and k and phones[k-1] in _VOWELS and (k+1==len(phones) or phones[k+1] not in _VOWELS):
                cost=0.0;allowed=True
            owners.append(word.lower());local.append(k);deletion.append(cost);optional.append(allowed)
    def substitution(i,j):
        a,b=expected[i],heard[j]
        if a==b:return 0.0
        word=owners[i];k=local[i]
        if word.startswith('grandpa') and a=='n' and b=='m':return 0.0
        if sentence and word in _WEAK_VOWELS and a in _VOWELS and b in _WEAK_VOWELS[word]:return 0.0
        if a in {'t','d'} and b=='ɾ' and i>0 and expected[i-1] in _VOWELS:return 0.0
        distance=_NEAR.get(frozenset((a,b)),1.0)
        # Keep partial credit tied to phonetic similarity. Uncertain recognition
        # never makes an unrelated sound correct and never creates a missing word.
        if distance<1 and confidence[j]<.65:distance*=.65+.35*confidence[j]/.65
        return distance
    costs=[[0.0]*(m+1) for _ in range(n+1)]
    trace=[bytearray(m+1) for _ in range(n+1)]
    for i in range(1,n+1):costs[i][0]=costs[i-1][0]+deletion[i-1];trace[i][0]=1
    for j in range(1,m+1):costs[0][j]=j;trace[0][j]=2
    for i in range(1,n+1):
        for j in range(1,m+1):
            candidates=(costs[i-1][j-1]+substitution(i-1,j-1),costs[i-1][j]+deletion[i-1],costs[i][j-1]+1)
            direction=min(range(3),key=candidates.__getitem__);costs[i][j]=candidates[direction];trace[i][j]=direction
    pairs=[];i=n;j=m
    while i or j:
        direction=trace[i][j]
        if i and j and direction==0:pairs.append((i-1,heard[j-1],substitution(i-1,j-1),False));i-=1;j-=1
        elif i and direction==1:pairs.append((i-1,None,deletion[i-1],False));i-=1
        else:pairs.append((min(max(i-1,0),n-1),heard[j-1],1.0,True));j-=1
    pairs.reverse();words=[];start=0;covered=0;total_required=0
    for word,phonemes in reference:
        slots=[p for p in pairs if start<=p[0]<start+len(phonemes)]
        observed=[p[1] for p in slots if p[1] is not None]
        required=sum(not optional[i] for i in range(start,start+len(phonemes)))
        present=sum(not p[3] and p[1] is not None and not optional[p[0]] for p in slots)
        total_required+=required;covered+=present
        penalty=sum(p[2] for p in slots)
        denominator=max(required,len(observed),1)
        similarity=round(100*max(0,1-penalty/denominator)) if observed else 0
        words.append({'word':word,'score':similarity,'errorType':'Omission' if not observed else 'None' if similarity>=80 else 'Mispronunciation','expectedPhonemes':' '.join(phonemes),'heardPhonemes':' '.join(observed)})
        start+=len(phonemes)
    score=round(100*max(0,1-costs[n][m]/max(total_required,m,1)))
    return {'score':score,'accuracy':score,'completeness':round(100*covered/max(total_required,1)),'words':words,'engine':'local-phoneme'}
