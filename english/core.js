const modes=['slide','parkour','bike','race'];
const themes=['forest','cloud','sunset','neon','coast','snow','flowers','space','lava'];
const names={forest:'森林晨光',cloud:'云上彩虹',sunset:'落日峡谷',neon:'霓虹长廊',coast:'碧海大桥',snow:'雪山晶莹',flowers:'花园秘境',space:'星河旅行',lava:'火山探险'};
export const MODES={slide:'珠珠滑梯',parkour:'弹跳跑酷',bike:'轻风骑行',race:'彩虹赛车'};
export const LEVELS=themes.flatMap((theme,index)=>modes.map((mode,i)=>({id:`${theme}-${mode}`,mode,theme,index,seed:101+index*17+i*7,name:`${names[theme]} · ${MODES[mode]}`})));
const palettes=[['#37b8ee','#ffd867'],['#feaf4d','#fff2b8'],['#63d9ae','#ffed7e'],['#fc829e','#96edff'],['#9185ef','#ffb5e8'],['#e2f3ff','#5acaff'],['#ffd568','#ff8a67'],['#a1ed7b','#ffa4d4']];
const accessories=['glasses','crown','flower','ears','halo','star','crystal','wings'];
const patterns=['plain','stripe','stars','marble','dots'];
const tierNames=[['普通',100,'晨光'],['独特',150,'流彩'],['隐藏',200,'秘境'],['神话',300,'星冕']];
const nicknames=['蓝鲸','蜜橘','青柠','桃桃','紫月','冰晶','金芒','森灵'];
export const SKINS=[{id:'pearl',name:'初见珍珠',tier:'免费',price:0,color:'#dceeff',accent:'#8af3d5',accessory:'none',pattern:'plain'},...tierNames.flatMap(([tier,price,prefix],t)=>palettes.map(([color,accent],i)=>({id:`skin-${t}-${i}`,name:`${prefix}·${nicknames[i]}`,tier,price,color,accent,accessory:accessories[(i+t*2)%8],pattern:patterns[(i+t)%5]})))];
export function random(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function shuffle(a,rng){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
export function makeQuestions(unit,words,seed=1){
 const rng=random(seed),pool=unit.words.map(id=>({id,...words[id]})),order=shuffle(pool,rng),result=[];
 function choice(kind,word,answer,alternatives,prompt,explanation){return {id:`${unit.id}-${seed}-${result.length}`,unitId:unit.id,kind,wordId:word?.id,say:word?.en,prompt,answer,choices:shuffle([...new Set([answer,...shuffle(alternatives.filter(x=>x!==answer),rng).slice(0,3)])],rng),explanation,solution:answer};}
 const meanings=word=>word.zh.replace(/[（(][^）)]*[）)]/g,'').split(/[；;,，、]/).map(s=>s.trim()).filter(Boolean);
 for(let i=0;i<3;i++){const w=order[i%order.length],senses=new Set(meanings(w)),distractors=pool.filter(x=>!meanings(x).some(s=>senses.has(s))).map(x=>x.en);result.push(choice('word',w,w.en,distractors,`“${w.zh}”的英语是哪一个？`,`${w.en} 表示“${w.zh}”，美式音标是 ${w.ipa}。`));}
 for(let i=0;i<2;i++){const w=order[(i+3)%order.length];result.push(choice('ipa',w,w.ipa,pool.map(x=>x.ipa),`听一听 ${w.en}（${w.zh}），它的美式音标是哪一个？`,`${w.en} 的美式音标是 ${w.ipa}。ˈ 表示后面的音节重读；音标帮助我们读出单词。`));}
 const sentenceOrder=shuffle(unit.sentences,rng);
 for(let i=0;i<3;i++){const sentence=sentenceOrder[i%sentenceOrder.length];result.push({id:`${unit.id}-${seed}-${result.length}`,unitId:unit.id,kind:'sentence',prompt:`把单词拼成一句话：${sentence.zh}`,answer:sentence.en,acceptedAnswers:sentence.acceptedAnswers||[],tokens:shuffle(sentence.en.replace(/[.,!?]/g,'').split(/\s+/),rng),explanation:sentence.tip,solution:sentence.en,say:sentence.en});}
 const grammarOrder=shuffle(unit.grammar,rng);
 for(let i=0;i<2;i++){const g=grammarOrder[i%grammarOrder.length];result.push(choice('grammar',null,g.answer,g.options,`选词填空：${g.prompt}${g.context?`（${g.context}）`:""}`,g.explanation));result.at(-1).solution=g.prompt.replace(/_{2,}/,g.answer);result.at(-1).say=result.at(-1).solution;}
 return shuffle(result,rng).map((x,i)=>({...x,number:i+1}));
}
export class Run {
 constructor(level){this.level=level;this.progress=0;this.elapsed=0;this.lane=0;this.jump=0;this.jumpAge=-1;this.fall=0;this.fallAge=-1;this.status='playing';this.card=0;this.completed=0;this.slow=0;this.lastHit=null;this.duration=90+level.index*3;
  const rng=random(level.seed);this.rivals=level.mode==='race'?Array.from({length:9},(_,i)=>{const progress=.012+Math.floor(i/3)*.016,speed=.82+rng()*.18;return {progress,lane:-.85+(i%3)*.85,speed,finishTime:this.duration*(1-progress)/speed};}):[];
  this.obstacles=level.mode==='parkour'?[...Array.from({length:21},(_,i)=>({progress:(i+1)/22-.00225,lane:0,kind:'gap',hit:false})),...Array.from({length:9},(_,i)=>({progress:.027+i*.108,lane:[-.8,0,.8][Math.floor(rng()*3)],kind:'block',hit:false}))].sort((a,b)=>a.progress-b.progress):Array.from({length:18},(_,i)=>({progress:.035+i*.051,lane:[-.8,0,.8][Math.floor(rng()*3)],kind:'block',hit:false}));
 }
 step(dt,input={}){if(this.status!=='playing'||!Number.isFinite(dt)||dt<=0)return;
  // Limit at the next card: no playable time or rival motion is consumed while a card is open.
  const gate=this.completed<10?(this.completed+1)/11:1;
  const speed=1/this.duration*(this.slow>0?.5:1);const time=Math.min(dt,Math.max(0,(gate-this.progress)/speed));
  this.elapsed+=time;this.slow=Math.max(0,this.slow-time);this.lane=Math.max(-1,Math.min(1,this.lane+(input.steer||0)*time*1.7));
  if(input.jump&&this.jumpAge<0)this.jumpAge=0;
  if(this.jumpAge>=0){this.jumpAge+=time;this.jump=this.jumpAge<.85?Math.sin(this.jumpAge/.85*Math.PI):0;if(this.jumpAge>=.85)this.jumpAge=-1;}
  if(this.fallAge>=0){this.fallAge+=time;this.fall=this.fallAge<.65?Math.sin(this.fallAge/.65*Math.PI):0;if(this.fallAge>=.65)this.fallAge=-1;}
  const prev=this.progress;this.progress=Math.min(gate,this.progress+speed*time);
  for(const rival of this.rivals)rival.progress=rival.progress+time/this.duration*rival.speed;
  for(const o of this.obstacles)if(!o.hit&&prev<=o.progress&&this.progress>=o.progress){o.hit=true;if((o.kind==='gap'||Math.abs(this.lane-o.lane)<.3)&&this.jump<.3){this.slow=2;this.lastHit=this.elapsed;if(o.kind==='gap')this.fallAge=0;}}
  if(this.progress>=gate-1e-9){this.progress=gate;if(this.completed<10){this.card=this.completed;this.status='question';}else this.status='finished';}
 }
 resumeCard(){if(this.status!=='question')return false;this.completed++;this.status='playing';return true;}
 pause(){if(this.status==='playing'){this.status='paused';return true;}return false;}
 resume(){if(this.status==='paused'){this.status='playing';return true;}return false;}
 get rank(){return 1+this.rivals.filter(r=>this.status==='finished'?r.finishTime<this.elapsed:r.progress>this.progress).length;}
}
function validReviewCard(q){
 if(!q||!['word','ipa','sentence','grammar'].includes(q.kind))return false;
 if(!['id','prompt','answer','explanation','solution'].every(key=>typeof q[key]==='string'))return false;
 if(q.kind==='sentence')return Array.isArray(q.tokens)&&q.tokens.length>1&&q.tokens.every(x=>typeof x==='string')&&(!q.acceptedAnswers||Array.isArray(q.acceptedAnswers)&&q.acceptedAnswers.every(x=>typeof x==='string'));
 return Array.isArray(q.choices)&&q.choices.length>=2&&q.choices.every(x=>typeof x==='string')&&q.choices.includes(q.answer);
}
// Rehydrate only known gameplay fields; a damaged session must not reset the wallet.
export function snapshotRun(run){return {levelId:run.level.id,progress:run.progress,elapsed:run.elapsed,lane:run.lane,jump:run.jump,jumpAge:run.jumpAge,fall:run.fall,fallAge:run.fallAge,status:run.status,card:run.card,completed:run.completed,slow:run.slow,lastHit:run.lastHit,rivals:run.rivals.map(r=>({...r})),hits:run.obstacles.map(o=>o.hit)};}
export function restoreRun(data){
 const level=LEVELS.find(l=>l.id===data?.levelId);if(!level)return null;
 const within=(x,min,max)=>Number.isFinite(x)&&x>=min&&x<=max;
 if(!['playing','paused','question'].includes(data.status)||!Number.isInteger(data.completed)||!within(data.completed,0,10)||!Number.isInteger(data.card)||!within(data.card,0,9))return null;
 const lower=data.completed/11,upper=data.completed<10?(data.completed+1)/11:1;
 if(!within(data.progress,lower,upper)||!within(data.elapsed,0,1000000)||!within(data.lane,-1,1)||!within(data.jump,0,1)||!within(data.jumpAge,-1,.85)||!within(data.fall,0,1)||!within(data.fallAge,-1,.65)||!within(data.slow,0,2)||!(data.lastHit===null||within(data.lastHit,0,data.elapsed)))return null;
 if(data.status==='question'&&(data.completed===10||data.card!==data.completed||Math.abs(data.progress-upper)>1e-9))return null;
 const run=new Run(level);
 if(!Array.isArray(data.rivals)||data.rivals.length!==run.rivals.length||!data.rivals.every(r=>r&&within(r.progress,0,10000)&&within(r.lane,-1,1)&&within(r.speed,.82,1)&&within(r.finishTime,0,1000000)))return null;
 if(!Array.isArray(data.hits)||data.hits.length!==run.obstacles.length||!data.hits.every(x=>typeof x==='boolean'))return null;
 for(const key of ['progress','elapsed','lane','jump','jumpAge','fall','fallAge','status','card','completed','slow','lastHit'])run[key]=data[key];
 run.rivals=data.rivals.map(({progress,lane,speed,finishTime})=>({progress,lane,speed,finishTime}));run.obstacles.forEach((o,i)=>o.hit=data.hits[i]);return run;
}
function loadSession(s){
 if(!s||typeof s.roundId!=='string'||!s.roundId||typeof s.bookId!=='string'||typeof s.unitId!=='string'||!restoreRun(s.run)||!Array.isArray(s.questions)||s.questions.length!==10||!s.questions.every(q=>validReviewCard(q)&&q.unitId===s.unitId)||!Number.isInteger(s.correct)||s.correct<0||s.correct>10||!Array.isArray(s.wrong)||!s.wrong.every(validReviewCard))return null;
 if(!(s.lastAnswer===null||typeof s.lastAnswer==='string')||(s.lastAnswer!==null&&s.run.status!=='question'))return null;
 const q=s.questions[s.run.card];if(!Array.isArray(s.picked)||!s.picked.every(i=>Number.isInteger(i)&&i>=0&&i<(q.tokens?.length||0))||new Set(s.picked).size!==s.picked.length)return null;
 return {roundId:s.roundId,bookId:s.bookId,unitId:s.unitId,run:snapshotRun(restoreRun(s.run)),questions:s.questions,correct:s.correct,wrong:s.wrong,lastAnswer:s.lastAnswer,picked:s.picked};
}
export function loadSave(raw){
 let value;try{value=typeof raw==='string'?JSON.parse(raw):raw;}catch{}
 value=value&&typeof value==='object'?value:{};
 const valid=new Set(SKINS.map(s=>s.id));
 const owned=[...new Set(['pearl',...(Array.isArray(value.owned)?value.owned:[]).filter(x=>valid.has(x))])];
 const records={};
 for(const [key,r] of Object.entries(value.records&&typeof value.records==='object'?value.records:{})){
  if(r&&Number.isInteger(r.correct)&&r.correct>=0&&r.correct<=10&&Number.isFinite(r.time)&&r.time>=0&&Number.isSafeInteger(r.plays)&&r.plays>0)records[key]={correct:r.correct,time:r.time,plays:r.plays};
 }
 return {version:1,session:loadSession(value.session),coins:Number.isSafeInteger(value.coins)&&value.coins>=0?Math.min(value.coins,100000000):0,owned,skin:owned.includes(value.skin)?value.skin:'pearl',claimed:Array.isArray(value.claimed)?value.claimed.filter(x=>typeof x==='string').slice(-10000):[],records,wrong:Array.isArray(value.wrong)?value.wrong.filter(validReviewCard).slice(-100):[]};
}
export function completeCard(save,id){if(save.claimed.includes(id))return false;save.coins+=200;save.claimed.push(id);if(save.claimed.length>10000)save.claimed.shift();return true;}
export function buySkin(save,id){const skin=SKINS.find(s=>s.id===id);if(!skin||save.owned.includes(id)||save.coins<skin.price)return false;save.coins-=skin.price;save.owned.push(id);save.skin=id;return true;}

const normalizeAnswer=s=>String(s).trim().replace(/[.,!?]/g,'').replace(/\s+/g,' ').toLowerCase();
export function answerMatches(question,answer){return [question.answer,...(question.acceptedAnswers||[])].some(x=>normalizeAnswer(x)===normalizeAnswer(answer));}
