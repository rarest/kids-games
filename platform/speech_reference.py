"""eSpeak reference conversion, using complete UTF-8 lines on stdin."""
import re
import subprocess

def target_words(text):
    return re.findall(r"[A-Za-z]+(?:['’-][A-Za-z]+)*|[0-9]+",text)

def tokenize(ipa,tokens):
    if '_' in ipa:
        return [phone for segment in ipa.split('_') for phone in tokenize(segment,tokens)]
    ipa=re.sub('[ˈˌ\u200d\u200c\s/]','',ipa)
    english_tokens=[p for p in tokens if p not in {'ju','jo','ja','wa','wi','wo','we'}]
    result=[]
    while ipa:
        token=next((p for p in english_tokens if ipa.startswith(p)),None)
        if token:result.append(token);ipa=ipa[len(token):]
        else:ipa=ipa[1:]
    return result

def espeak(text):
    return subprocess.run(['espeak-ng','-q','-v','en-us','--ipa=1','--stdin'],input=text+'\n',text=True,capture_output=True,check=True,timeout=3).stdout.strip()
