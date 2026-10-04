import {BOOKS} from './curriculum.js';

// Curriculum content comes from the user's printed book. Chinese teaching
// goals, questions and activities are original; English examples are quoted
// verbatim from a page and retain that page's translation and speech override.
const book=BOOKS.find(book=>book.id==='g3-upper');
const page=number=>book.textbookPages.find(page=>page.page===number);
const line=(number,en)=>{
 const original=page(number).blocks.flatMap(block=>block.lines).find(line=>line.en===en);
 if(!original)throw new Error(`Missing printed line on page ${number}: ${en}`);
 return {...original,page:number};
};
const word=(id,number,visual)=>{
 const original=page(number).words.find(word=>word.id===id);
 if(!original)throw new Error(`Missing page vocabulary ${id} on page ${number}`);
 return {...original,visual};
};
const words=entries=>entries.map(([id,number,visual])=>word(id,number,visual));
const lines=entries=>entries.map(([number,en])=>line(number,en));
const omittedLabels=new Set(["Let's talk","Let's learn",'Start to read','Reading time','SCHOOL']);
function reading(numbers,kinds=['dialogue','reading']){
 return numbers.flatMap(number=>page(number).blocks.filter(block=>kinds.includes(block.kind)).flatMap(block=>block.lines.filter(line=>!omittedLabels.has(line.en)).map(line=>({...line,page:number}))));
}
const check=(prompt,choices,answer,why,say)=>({prompt,choices,answer,why,...(say?{say}:{})});
const activity=(title,prompt,example)=>({title,prompt,...(example?{example}:{})});
function lesson(unit,number,title,goal,pages,wordEntries,phraseEntries,checks,task,options={}){
 return {id:`${unit}-l${number}`,unitId:unit,number,title,goal,type:'words',pages,minutes:18,words:words(wordEntries),phrases:lines(phraseEntries),reading:reading(pages.filter(number=>number<74)),checks,activity:task,...options};
}
function phonics(unit,number,title,pageNumber,letterEntries,checks,task){
 const letters=letterEntries.map(([upper,ipa,example,sound])=>({en:`${upper} ${upper.toLowerCase()}`,say:`${upper}.`,ipa,example,sound}));
 const wordEntries=letterEntries.map(([, ,en])=>{
  const original=page(pageNumber).words.find(word=>word.en===en);
  if(!original)throw new Error(`Missing phonics example ${en}`);
  return {...original,visual:phonicsVisuals[en]??'🔎'};
 });
 return {id:`${unit}-l${number}`,unitId:unit,number,title,goal:'认出字母的大写和小写，听课本例词并尝试跟读。',type:'phonics',pages:[pageNumber],minutes:18,words:wordEntries,phrases:[],reading:letters.flatMap(letter=>[line(pageNumber,letter.en),line(pageNumber,letter.example)]),checks,activity:task,letters};
}
const phonicsVisuals={apple:'🍎',bag:'🎒',cat:'🐈',dog:'🐕',egg:'🥚',fish:'🐟',girl:'👧',hot:'🔥',ill:'🤒',job:'🧑‍💼',kite:'🪁',leg:'🦵',map:'🗺️',new:'✨',orange:'🍊',fox:'🦊',pen:'🖊️',quiet:'🤫',ruler:'📏',see:'👀',Ted:'🧒',up:'⬆️',van:'🚐',we:'🧑‍🤝‍🧑',box:'📦',yellow:'🟨',Zip:'🐿️'};

const u1='g3-upper-u1',u2='g3-upper-u2',u3='g3-upper-u3',u4='g3-upper-u4',u5='g3-upper-u5',u6='g3-upper-u6';
const units=[
 {id:u1,title:'交朋友',icon:'🤝',description:'先问候新朋友，再用倾听、微笑和分享表达友好。',lessons:[
  lesson(u1,1,'你好，新朋友！','听懂介绍名字的对话，和别人互相问好。',[3,4],
   [['name',4,'🏷️'],['nice',4,'😊'],['friend',4,'🤝'],['good',3,'👍']],
   [[4,'Hi! My name is Wu Binbin.'],[4,'Nice to meet you.']],
   [check('斌斌在对话里介绍了什么？',['自己的名字','自己的年龄','喜欢的水果'],'自己的名字','My name is 用来介绍自己的名字。','Hi! My name is Wu Binbin.'),check('初次见到朋友，哪句话表达友好？',['很高兴认识你','请给我蛋糕','我要去动物园'],'很高兴认识你','Nice to meet you. 表达初次见面的高兴。','Nice to meet you.')],
   activity('轮流介绍名字','先听一次，再和家人轮流打招呼。指着自己说名字，听完对方的名字后表达见面很高兴。','Nice to meet you.')),
  lesson(u1,2,'身体会打招呼','指认五个身体部位，配合动作听懂问候。',[5],
   [['ear',5,'👂'],['hand',5,'✋'],['eye',5,'👁️'],['mouth',5,'👄'],['arm',5,'💪']],
   [[5,'Wave your hand. Hello!'],[5,'Point to your ear. Listen!']],
   [check('听到“挥挥你的手”，应该动哪里？',['手','耳朵','嘴巴'],'手','hand 是手，wave 是挥动。','Wave your hand. Hello!'),check('课本请你指向耳朵，然后做什么？',['听一听','跳起来','画一幅画'],'听一听','Point to your ear. Listen! 让我们指向耳朵并倾听。','Point to your ear. Listen!')],
   activity('动作小老师','找一个同伴。听课本的两条指令，各做一次动作；交换角色，由你播放指令，让同伴指出正确部位。','Wave your hand. Hello!'),
   {reading:lines([[5,'Wave your hand. Hello!'],[5,'Look into my eyes. Hi!'],[5,'Point to your ear. Listen!'],[5,'Point to your mouth. Smile!'],[5,'Wave your arm. Bye!']])}),
  phonics(u1,3,'A、B、C、D找朋友',6,[['A','/eɪ/','apple','/æ/'],['B','/bi/','bag','/b/'],['C','/si/','cat','/k/'],['D','/di/','dog','/d/']],
   [check('听 apple，课本用哪种水果示范字母A？',['苹果','香蕉','葡萄'],'苹果','apple 是苹果，是这页A的例词。','apple'),check('听 bag，课本用哪个字母示范它的开头音？',['字母B','字母D','字母A'],'字母B','bag 是书包，课本把它放在B的例词中。','bag')],
   activity('字母和图画配对','在纸上写A a、B b、C c、D d。画苹果、书包、猫和狗，把每幅图连到对应字母，播放例词后跟读。')),
  lesson(u1,4,'一起分享吧','听懂安慰和分享的对话，知道好朋友会做什么。',[7,8],
   [['can',7,'💪'],['share',7,'👐'],['smile',8,'😊'],['listen',8,'👂'],['help',8,'🤲']],
   [[7,'We can share.'],[7,"It's OK."]],
   [check('朋友遇到小麻烦，课本怎样安慰她？',['没关系','快跑','再见'],'没关系',"It's OK. 表达没关系，可以用来安慰朋友。","It's OK."),check('这段对话中，好朋友决定怎么做？',['一起分享','把东西藏起来','各自离开'],'一起分享','We can share. 表示我们可以分享。','We can share.')],
   activity('把分享演出来','拿两张画或两支彩笔。和家人演一演课本里的分享情景，先安慰对方，再邀请对方一起使用。','We can share.')),
  lesson(u1,5,'我的好朋友海报','读懂好朋友海报，选出自己能做的一件友好行动。',[9,10,76,77],
   [['say',9,'🗣️'],['and',9,'➕'],['goodbye',77,'👋'],['toy',76,'🧸']],
   [[9,'I am a good friend!'],[9,'I am nice to my friends.']],
   [check('海报中的好朋友会怎样对待朋友？',['友善地对待他们','不听他们说话','不愿帮助他们'],'友善地对待他们','海报最后说 I am nice to my friends.','I am nice to my friends.'),check('在课本海报中，哪件事属于友好行动？',['听朋友说话','抢走朋友的东西','嘲笑朋友'],'听朋友说话','海报里有 I listen.，表示我倾听。','I listen.')],
   activity('做一张行动海报','画一幅自己帮助或倾听朋友的小图。在图旁抄一条海报里的英文，指着图读给家人听。','I am a good friend!')),
  lesson(u1,6,'Zip和Zoom成为朋友','完整听读故事，按顺序讲出他们怎样成为好朋友。',[12,13],
   [['friend',12,'🤝'],['share',12,'👐'],['help',13,'🤲'],['good',13,'👍']],
   [[12,'Zoom is my new friend.'],[13,'We are good friends now.']],
   [check('Zoom和Zip一起分享了什么？',['食物','家庭树','生日卡'],'食物','故事里说 We share food.','We share food.'),check('朋友嘴巴疼的时候，另一位朋友怎样帮助？',['让他握住自己的手','请他独自离开','让他去买水果'],'让他握住自己的手','故事中的 Hold my hand. 表达关心和帮助。','Hold my hand.')],
   activity('三幅图讲故事','画认识朋友、分享食物、伸手帮助三幅小图。按顺序摆好，用课本的原句给家人讲一次故事。','We are good friends now.'),{type:'story',reading:reading([12,13])})
 ]},
 {id:u2,title:'不同的家庭',icon:'🏠',description:'认识家人，介绍自己的家庭，理解大小不同的家庭都有爱。',lessons:[
  lesson(u2,1,'这是我的家人','听懂陈杰介绍祖辈的对话，用一句话介绍家人。',[16],
   [['mum',16,'👩'],['dad',16,'👨'],['grandma',16,'👵'],['grandpa',16,'👴']],
   [[16,'This is my grandma.'],[16,'This is my grandpa.']],
   [check('对话中的孩子说 grandma 时，介绍的是谁？',['奶奶或外婆','堂兄弟姐妹','妹妹'],'奶奶或外婆','grandma 表示奶奶或外婆。','This is my grandma.'),check('对话中的孩子把Sarah介绍成自己的什么人？',['朋友','姑姑','姐妹'],'朋友','开头的 my friend, Sarah Miller 表明Sarah是这位孩子的朋友。',"Mum! Dad! This is my friend, Sarah Miller.")],
   activity('照片里的家人','选一张家人的照片或画一张小图。先指认两位家人，再照着课本的介绍方法，对家人说一说。','This is my grandma.')),
  lesson(u2,2,'家人的不同称呼','认识祖辈、父母的完整称呼，找到照片中的自己。',[17],
   [['grandmother',17,'👵'],['mother',17,'👩'],['father',17,'👨'],['grandfather',17,'👴'],['me',17,'🙋']],
   [[17,'This is my mum.'],[17,'This is my dad.']],
   [check('mother 和 mum 指的是同一位家人吗？',['是，都可以称呼妈妈','不是，一个是姐姐','不是，一个是外公'],'是，都可以称呼妈妈','课本的 mother (mum) 把两种称呼放在一起。'),check('家庭图里的 me 指向谁？',['介绍家庭的自己','所有朋友','动物园的动物'],'介绍家庭的自己','me 表示我，家庭图用它标出介绍者自己。')],
   activity('给家庭照片贴词卡','在纸上写mother、father、grandmother、grandfather和me。把适合自己家庭的词卡放到照片或画旁，边指边读。','This is my mum.'),{reading:lines([[17,'This is my mum.'],[17,'This is my dad.'],[17,'This is my sister.'],[17,'This is my grandma.'],[17,'This is my grandpa.']])}),
  phonics(u2,3,'E、F、G、H找朋友',18,[['E','/i/','egg','/ɛ/'],['F','/ɛf/','fish','/f/'],['G','/dʒi/','girl','/ɡ/'],['H','/eɪtʃ/','hot','/h/']],
   [check('课本用 egg 示范E。egg 是什么？',['鸡蛋','鱼','帽子'],'鸡蛋','egg 表示鸡蛋，课本用它示范字母E。','egg'),check('听 fish，它在课本里和哪个字母配对？',['字母F','字母H','字母E'],'字母F','fish 是鱼，是F的例词。','fish')],
   activity('做四张字母卡','写E e、F f、G g、H h，旁边画鸡蛋、鱼、女孩和表示热的太阳。逐张播放例词，指着卡片跟读。')),
  lesson(u2,4,'姐妹还是堂表亲？','听懂询问家人的对话，区分兄弟姐妹和堂表亲。',[19,20],
   [['have',19,'👐'],['sister',19,'👧'],['cousin',19,'🧑‍🤝‍🧑'],['brother',19,'👦'],['baby',20,'👶']],
   [[19,'Is this your sister?'],[19,"No, it's my cousin."]],
   [check('Sarah回答：这不是她的姐妹，而是谁？',['堂或表兄弟姐妹','奶奶','妈妈'],'堂或表兄弟姐妹','cousin 指堂或表兄弟姐妹。',"No, it's my cousin."),check('对话中问到的人是Sarah的哥哥或弟弟吗？',['是的','不是，是她的爷爷','不是，是她的叔叔'],'是的','问 Is that your brother? 后，Sarah回答 Yes, it is.','Yes, it is.')],
   activity('照片问答小游戏','和家人轮流指着照片提问。先听完对方的问题，再回答；指到堂表亲时，试着用课本里的否定回答。',"No, it's my cousin.")),
  lesson(u2,5,'画出我的家庭树','认识更多家人，用家庭树表示彼此的关系。',[20,21,22,23,84],
   [['uncle',20,'👨'],['aunt',20,'👩'],['family',21,'🏠'],['big',21,'↔️'],['some',84,'🔢']],
   [[20,'My family is big.'],[21,'This is my family.']],
   [check('课本中的大家庭和小家庭有什么共同点？',['家人彼此相爱','人数完全相同','都只有一个孩子'],'家人彼此相爱','阅读用 They love each other. 表达家人之间的爱。','They love each other.'),check('家庭树主要用来介绍什么？',['家人和他们的关系','水果的颜色','动物的速度'],'家人和他们的关系','这一课的家庭树把不同家人放到相应位置。')],
   activity('自己的家庭树','在纸上画自己和几位家人，用线连接。每指一位家人就读一个课本词语，最后把整张家庭树介绍给家人。','This is my family.')),
  lesson(u2,6,'小家庭，大爱意','完整听读两首家庭诗，找出家人共同做的事情。',[24,25],
   [['small',24,'🤏'],['family',24,'🏠'],['have',24,'👐'],['big',25,'↔️']],
   [[24,'I love my small family.'],[25,'I love my big family.']],
   [check('第一首家庭诗中，孩子和谁一起玩？',['兄弟','老师','爷爷'],'兄弟','第一首诗写 I play with my brother.','I play with my brother.'),check('两首诗中，家人都会怎样倾听？',['关心地倾听','一边争吵一边听','完全不听'],'关心地倾听','两首诗都有 We listen with care.','We listen with care.')],
   activity('配图读家庭诗','给自己喜欢的一首诗画一张配图。选两行课本原文读给家人听，再用中文说说为什么喜欢自己的家庭。','I love my small family.'),{type:'story',reading:reading([24,25])})
 ]},
 {id:u3,title:'我们的动物朋友',icon:'🐾',description:'从宠物到野生动物，学会介绍动物，并发现它们的特点。',lessons:[
  lesson(u3,1,'你有宠物吗？','听懂询问宠物的对话，回答有没有宠物。',[28],
   [['like',28,'❤️'],['dog',28,'🐕'],['pet',28,'🐾'],['cat',28,'🐈']],
   [[28,'Thanks. Do you have a pet?'],[28,'Yes, I do. I have a cat.']],
   [check('课本问 Do you have a pet?，是在问什么？',['你有没有宠物','你几岁了','你喜欢什么颜色'],'你有没有宠物','pet 是宠物，have 表示有。','Thanks. Do you have a pet?'),check('回答 Yes, I do. I have a cat. 的孩子有什么宠物？',['猫','狗','兔子'],'猫','I have a cat. 表示我有一只猫。','Yes, I do. I have a cat.')],
   activity('宠物小调查','向家人询问有没有宠物。听完回答后，用图画记录；如果没有，也可以画一种想了解的宠物，再读课本的对应回答。','Yes, I do. I have a cat.')),
  lesson(u3,2,'宠物动作秀','认识鱼、鸟和兔子，听句子做动物动作。',[29,26,18],
   [['fish',18,'🐟'],['bird',29,'🐦'],['rabbit',29,'🐇'],['animal',26,'🐾']],
   [[29,'I like fish.'],[29,'I like rabbits.']],
   [check('课本让你像兔子一样做什么？',['跳一跳','游泳','唱歌'],'跳一跳','Hop, hop, hop like a rabbit. 是模仿兔子跳。','Hop, hop, hop like a rabbit.'),check('课本里会在水中游的宠物是哪种？',['鱼','猫','鸟'],'鱼','Swim, swim, swim like a fish. 用鱼示范游泳。','Swim, swim, swim like a fish.')],
   activity('动物动作猜谜','先听鸟、兔子、鱼的三条动作句。选一个动作演给家人看，让家人猜；交换角色后，再说出自己喜欢的动物。','I like rabbits.'),
   {reading:lines([[29,'I like fish.'],[29,'I like cats.'],[29,'I like birds.'],[29,'I like rabbits.'],[29,'I like my dog.'],[29,'Run, run, run like a dog.'],[29,'Sleep, sleep, sleep like a cat.'],[29,'Sing, sing, sing like a bird.'],[29,'Hop, hop, hop like a rabbit.'],[29,'Swim, swim, swim like a fish.']])}),
  phonics(u3,3,'I、J、K、L找朋友',30,[['I','/aɪ/','ill','/ɪ/'],['J','/dʒeɪ/','job','/dʒ/'],['K','/keɪ/','kite','/k/'],['L','/ɛl/','leg','/l/']],
   [check('听 kite，课本用哪个字母示范它的开头音？',['字母K','字母J','字母I'],'字母K','kite 是风筝，是这页K的例词。','kite'),check('听 leg，它指的是哪个身体部位？',['腿','嘴巴','耳朵'],'腿','leg 是腿，是这页L的例词。','leg')],
   activity('边听边找字母','写I i、J j、K k、L l，画风筝和腿，把它们和字母配对。逐个听课本例词，先指字母，再跟读单词。')),
  lesson(u3,4,'动物园里有什么？','听懂辨认动物的对话，知道近处和远处都可以提问。',[31,84],
   [['go',31,'🚶'],['zoo',31,'🦁'],['fox',31,'🦊'],['miss',31,'👩‍🏫'],['red-panda',84,'🐾']],
   [[31,"Look! What's this?"],[31,"It's a red panda."]],
   [check('Miss White说远处的动物是什么？',['小熊猫','狐狸','老虎'],'小熊猫','red panda 是小熊猫，和大熊猫不是同一种动物。',"It's a red panda."),check('对话中的孩子准备去哪里？',['动物园','商店','农场'],'动物园',"Let's go to the zoo! 是邀请大家去动物园。","Let's go to the zoo!")],
   activity('手影动物园','用手影或玩具摆出两种动物。轮流指着它们提问，另一人用课本原句回答；也可以先播放对话，再演一遍。',"Look! What's this?")),
  lesson(u3,5,'给动物做图画书','认识五种野生动物，按图片介绍它们。',[32,33,34,35],
   [['panda',32,'🐼'],['monkey',32,'🐒'],['tiger',32,'🐅'],['elephant',32,'🐘'],['lion',32,'🦁']],
   [[32,"It's an elephant."],[32,"It's a lion."]],
   [check('课本用哪句话介绍大象？',['这是一头大象','我没有宠物','这是我的姐姐'],'这是一头大象',"It's an elephant. 表示这是一头大象。","It's an elephant."),check('动物特点页里，哪种动物被说成跑得快？',['狮子','长颈鹿','鱼'],'狮子','The lion is fast! 表示狮子跑得快。','The lion is fast!')],
   activity('两页动物图画书','把纸对折，画两种课本动物。每页写一个动物词，指着其中一幅图，用本课的介绍句读给家人听。',"It's an elephant.")),
  lesson(u3,6,'鲸鱼的了不起之处','完整听读鲸鱼母子的故事，找出鲸鱼与其他动物的相同点。',[33,35,36,37],
   [['giraffe',33,'🦒'],['tall',33,'📏'],['fast',36,'💨'],['cute',35,'🥰']],
   [[36,'We are big.'],[37,'Yes! We can sing nice songs.']],
   [check('故事中的哪种动物也很大？',['大象','猫','兔子'],'大象','鲸鱼说自己很大，接着说 Elephants are big too.','Elephants are big too.'),check('最后，小鲸鱼发现它们能做什么？',['唱好听的歌','画家庭树','买水果'],'唱好听的歌','最后说 We can sing nice songs.','Yes! We can sing nice songs.')],
   activity('鲸鱼发现卡','画一只鲸鱼，旁边画出“大”“快”“会唱歌”三个符号。听完故事后，选两句原文指着符号读给家人听。','We are big.'),{type:'story',reading:reading([36,37])})
 ]},
 {id:u4,title:'身边的植物',icon:'🌱',description:'说说喜欢的水果，了解植物需要什么，并学习照料植物。',lessons:[
  lesson(u4,1,'你喜欢苹果吗？','听懂询问水果喜好的对话，表达喜欢或不喜欢。',[39,40,84],
   [['apple',39,'🍎'],['banana',84,'🍌'],['farm',40,'🚜'],['air',40,'🌬️']],
   [[40,'Do you like apples?'],[40,'I like bananas.']],
   [check('I like bananas. 表达了什么？',['我喜欢香蕉','我需要水','我有一只狗'],'我喜欢香蕉','like 表示喜欢，bananas 是香蕉的复数。','I like bananas.'),check('课本对话中，孩子在农场喜欢什么？',['新鲜空气','生日蛋糕','紫色小鸟'],'新鲜空气','I like the fresh air. 表示喜欢新鲜空气。','I like the fresh air.')],
   activity('水果喜好调查','画苹果和香蕉两幅小图。和家人轮流指图提问，听完回答后，在喜欢的水果旁画一颗心。','Do you like apples?')),
  lesson(u4,2,'水果是植物的礼物','认识水果词语，听懂植物给我们的东西。',[41,84],
   [['orange',84,'🍊'],['grape',84,'🍇'],['give',41,'🎁'],['us',41,'🧑‍🤝‍🧑']],
   [[41,"No, I don't. I like bananas."],[41,'Trees grow and give us things:']],
   [check('课本歌谣把葡萄说成怎样的？',['小小的','很长的','会走路的'],'小小的','Grapes are small. Bananas are long. 把葡萄和香蕉作比较。','Grapes are small. Bananas are long.'),check('歌谣中，树生长后会怎样帮助我们？',['给我们一些东西','变成玩具熊','唱生日歌'],'给我们一些东西','give us 表示给我们。','Trees grow and give us things:')],
   activity('水果礼物篮','画苹果、香蕉、橙子和葡萄，把自己喜欢的水果圈起来。播放歌谣，边指图边读词，再说说树给我们的礼物。',"No, I don't. I like bananas."),{reading:reading([41],['dialogue','chant'])}),
  phonics(u4,3,'M、N、O、P找朋友',42,[['M','/ɛm/','map','/m/'],['N','/ɛn/','new','/n/'],['O','/oʊ/','fox','/ɑ/'],['P','/pi/','pen','/p/']],
   [check('听 map，课本用哪个字母示范它的开头音？',['字母M','字母P','字母O'],'字母M','map 是地图，是这页M的例词。','map'),check('听 pen，它指的是什么？',['笔','葡萄','树'],'笔','pen 是笔，是这页P的例词。','pen')],
   activity('我的字母地图','在纸上写M m、N n、O o、P p。给地图、狐狸和笔画小图，连到对应字母；播放例词，指着图跟读，注意fox里的o在词中间。')),
  lesson(u4,4,'帮一帮学校花园','听懂照料植物的对话，选择自己能做的事。',[43,44,46,84],
   [['school',43,'🏫'],['garden',46,'🌷'],['water',84,'💧'],['grass',43,'🌿'],['plant',43,'🌱']],
   [[43,'We can water the flowers.'],[43,'We can plant new trees.']],
   [check('课本里的学校花园需要什么？',['大家的帮助','更多玩具','生日蜡烛'],'大家的帮助','The school gardens need help. 说明花园需要帮助。','The school gardens need help.'),check('We can water the flowers. 是哪项行动？',['给花浇水','把花送给朋友','给花涂色'],'给花浇水','water 在这句话里作动词，表示浇水。','We can water the flowers.')],
   activity('植物照料计划','找到家里或附近的一盆植物。先问家人怎样照料，再画出一件自己能做的事，读课本的对应句子给家人听。','We can water the flowers.')),
  lesson(u4,5,'植物需要什么？','理解植物需要空气、水和阳光，做一张需要卡。',[44,45,47,84],
   [['need',44,'👐'],['flower',84,'🌼'],['sun',44,'☀️'],['them',45,'👉']],
   [[44,'Plants need air, water and sun.'],[45,'We need plants.']],
   [check('课本说植物生长需要哪三样东西？',['空气、水和阳光','玩具、蛋糕和书包','帽子、鞋子和衣服'],'空气、水和阳光','原句列出 air, water and sun。','Plants need air, water and sun.'),check('为什么我们也需要植物？',['植物可以给我们许多东西','植物会帮我们写作业','植物都会走路'],'植物可以给我们许多东西','Plants can give us many things. 说明植物对我们的帮助。','Plants can give us many things.')],
   activity('植物需要卡','画一朵花，旁边画空气、水滴和太阳三个符号。指着图读需要句，再向家人说一种你能帮助植物的方法。','Plants need air, water and sun.')),
  lesson(u4,6,'苹果树的新家','完整听读苹果树的故事，说说人和植物怎样互相帮助。',[48,49],
   [['tree',48,'🌳'],['new',48,'✨'],['air',48,'🌬️'],['water',48,'💧'],['sun',48,'☀️']],
   [[48,'I am an apple tree.'],[48,'My family water me.']],
   [check('苹果树的新家人怎样帮助它？',['给它浇水','让它去动物园','把它变成蛋糕'],'给它浇水','故事中苹果树说 My family water me.','My family water me.'),check('苹果树长大后给家人什么？',['苹果','葡萄','香蕉'],'苹果','结尾说 I give apples to my family.','I am big now. I give apples to my family. We are all happy!')],
   activity('互相帮助的两幅图','画一幅家人给树浇水的图，再画一幅树结出苹果的图。按先后顺序摆好，听故事后选原句描述两幅图。','My family water me.'),{type:'story',reading:reading([48,49])})
 ]},
 {id:u5,title:'多彩的世界',icon:'🎨',description:'发现身边的颜色，表达喜好，读懂颜色传递的信息。',lessons:[
  lesson(u5,1,'它是什么颜色？','听懂询问颜色的对话，指认几种常见颜色。',[52],
   [['colour',52,'🎨'],['orange',52,'🟠'],['green',52,'🟢'],['red',52,'🔴'],['blue',52,'🔵']],
   [[52,'What colour is it?'],[52,"It's green."]],
   [check('What colour is it? 是在问什么？',['它是什么颜色','它有多少个','它是谁的家人'],'它是什么颜色','colour 表示颜色。','What colour is it?'),check('课本说红色和蓝色混合会出现什么颜色？',['紫色','白色','黑色'],'紫色','原句说 Red and blue make purple.','Look! Red and blue make purple.')],
   activity('身边的颜色侦探','找三件颜色不同的小物品。和家人轮流指着物品提问，找到绿色物品时，用课本回答句说一说。',"It's green.")),
  lesson(u5,2,'自然的调色盘','听懂颜色和动物的搭配，给自然物配上颜色。',[53],
   [['purple',53,'🟣'],['brown',53,'🟤'],['bear',53,'🐻'],['yellow',53,'🟨'],['duck',53,'🦆']],
   [[53,'The world is colourful!'],[53,'I see colours here and there.']],
   [check('课本里的熊是什么颜色？',['棕色','粉色','白色'],'棕色','a brown bear 表示一只棕色的熊。','a brown bear'),check('课本里的小鸭子是什么颜色？',['黄色','紫色','蓝色'],'黄色','a yellow duck 表示一只黄色的鸭子。','a yellow duck')],
   activity('给自然物配色','画一只熊、一只鸭子和一朵花，照课本给它们配色。边指边读颜色词，再跟读本课歌谣中的一句。','The world is colourful!'),
   {reading:lines([[53,'a brown bear'],[53,'a yellow duck'],[53,'a purple flower'],[53,'green grass'],[53,'blue sea'],[53,'The world is colourful!'],[53,'I see colours here and there.'],[53,'Purple flowers, green grass and blue sea.'],[53,'A big brown bear. What else can you see?']])}),
  phonics(u5,3,'Q、R、S、T、U找朋友',54,[['Q','/kju/','quiet','/kw/'],['R','/ɑr/','ruler','/r/'],['S','/ɛs/','see','/s/'],['T','/ti/','Ted','/t/'],['U','/ju/','up','/ʌ/']],
   [check('课本用 quiet 示范Q。quiet 表示什么？',['安静的','红色的','很大的'],'安静的','quiet 表示安静的，这个词里的qu读在一起。','quiet'),check('听 ruler，它在课本里和哪个字母配对？',['字母R','字母T','字母U'],'字母R','ruler 是尺子，是这页R的例词。','ruler')],
   activity('五张字母卡','写Q q、R r、S s、T t、U u。给尺子、眼睛和向上箭头画小图，边听例词边指卡片，再跟读完整单词。')),
  lesson(u5,4,'画我喜欢的颜色','听懂颜色喜好对话，按喜好画一幅小画。',[55,56],
   [['pink',55,'🩷'],['draw',55,'✏️'],['white',56,'⚪'],['black',56,'⚫']],
   [[55,'What colours do you like?'],[55,'I like red and pink.']],
   [check('对话中，孩子先说喜欢哪两种颜色？',['红色和粉色','黑色和白色','黄色和绿色'],'红色和粉色','原句是 I like red and pink.','I like red and pink.'),check('孩子决定用红色和粉色画什么？',['花','蛋糕','家庭树'],'花','对话说画 some red and pink flowers。',"OK. Let's draw some red and pink flowers.")],
   activity('我的两种颜色','选两种自己喜欢的彩笔，画花或鸟。向家人展示，先回答颜色喜好的问题，再播放课本对话跟读。','I like red and pink.')),
  lesson(u5,5,'颜色会传递消息','读懂课本中的颜色信息，给自己的翻翻书配标签。',[57,58,59,51],
   [['make',58,'🛠️'],['sea',51,'🌊'],['colour',57,'🎨']],
   [[57,'Colours can talk!'],[57,'It\'s green. Green can say "Go!"']],
   [check('课本用绿色表达哪条信息？',['可以前进','不要前进','要小心'],'可以前进','绿色对应 Go!。','It\'s green. Green can say "Go!"'),check('课本用黄色提醒我们什么？',['要小心','可以再利用','立刻睡觉'],'要小心','黄色对应 Be careful!。','It\'s yellow. Yellow can say "Be careful!"')],
   activity('颜色信息翻翻卡','把纸对折，外面涂红、绿或黄，里面画一个对应信息的小符号。翻开卡片，按课本读出这条颜色信息。','Colours can talk!')),
  lesson(u5,6,'向日葵的颜色变化','完整听读故事，按生长顺序观察向日葵的颜色。',[60,61],
   [['green',60,'🟢'],['yellow',60,'🟨'],['black',60,'⚫'],['brown',61,'🟤']],
   [[60,'I am a sunflower.'],[61,'But my children grow.']],
   [check('故事中的蜜蜂是什么颜色？',['黄色和黑色','红色和粉色','蓝色和白色'],'黄色和黑色','蜜蜂出现后，故事说 They are yellow and black.','They are yellow and black.'),check('向日葵离开后，故事最后发生什么？',['它的孩子继续生长','它去了商店','它变成了鸟'],'它的孩子继续生长','最后一句 But my children grow. 表示新的生命继续生长。','But my children grow.')],
   activity('颜色生长时间线','画出绿色向日葵、黄色花朵、天气变冷后的向日葵三幅图。按故事顺序排好，指图跟读对应原句。','I am a sunflower.'),{type:'story',reading:reading([60,61])})
 ]},
 {id:u6,title:'有用的数字',icon:'🔢',description:'说年龄，数物品，发现数字在时间、价格和生日中的用途。',lessons:[
  lesson(u6,1,'你几岁了？','听懂年龄问答，知道数字加years old可以表达岁数。',[64,84],
   [['old',84,'🎂'],['year',64,'📅'],['five',64,'5️⃣']],
   [[64,'How old are you?'],[64,"I'm five years old."]],
   [check('How old are you? 是在问什么？',['你几岁了','你有几个苹果','你喜欢什么动物'],'你几岁了','这句话用来问年龄；years old在回答中表达岁数。','How old are you?'),check("课本回答 I'm five years old. 表示几岁？",['五岁','三岁','七岁'],'五岁','five 是五，整句表示五岁。',"I'm five years old.")],
   activity('年龄角色卡','画课本里的三位孩子，给他们标上3、4、5。和家人各选一个角色，按卡片年龄进行问答，再交换角色。','How old are you?')),
  lesson(u6,2,'从一数到五','边听边数1到5，再倒数做动作。',[65],
   [['one',65,'1️⃣'],['two',65,'2️⃣'],['three',65,'3️⃣'],['four',65,'4️⃣'],['five',65,'5️⃣']],
   [[65,'Jump! Jump! Jump! One, two, three!'],[65,'Five! Four! Three, two, one!']],
   [check('one、two、three 表示哪组数字？',['一、二、三','三、二、一','四、五、六'],'一、二、三','课本第一次跳跃时从one数到three。','Jump! Jump! Jump! One, two, three!'),check('歌谣最后从five数到one，属于哪种数法？',['倒数','只数双数','每次加二'],'倒数','five、four、three、two、one依次减少。','Five! Four! Three, two, one!')],
   activity('手指数字歌','先伸手指从1数到5，再收回手指从5数到1。听两遍课本歌谣：第一遍只做动作，第二遍试着跟读。','Five! Four! Three, two, one!'),
   {reading:reading([65],['chant'])}),
  phonics(u6,3,'V、W、X、Y、Z找朋友',66,[['V','/vi/','van','/v/'],['W','/ˈdʌbəlju/','we','/w/'],['X','/ɛks/','box','/ks/'],['Y','/waɪ/','yellow','/j/'],['Z','/zi/','Zip','/z/']],
   [check('课本用 box 示范哪个字母在单词末尾的声音？',['字母X','字母V','字母W'],'字母X','box 末尾的x是本页X的示范。','box'),check('听 yellow，它在课本里和哪个字母配对？',['字母Y','字母Z','字母V'],'字母Y','yellow 是黄色，是这页Y的例词。','yellow')],
   activity('完成字母小书','写V v、W w、X x、Y y、Z z，配上面包车、朋友、盒子和黄色小图。先听例词，再指出字母并跟读；注意box里的X在末尾。')),
  lesson(u6,4,'数一数，去购物','认识6到10，听懂数量和价格的对话。',[67,68],
   [['six',68,'6️⃣'],['seven',68,'7️⃣'],['eight',68,'8️⃣'],['nine',68,'9️⃣'],['ten',68,'🔟']],
   [[67,'How many apples?'],[68,"That's ten yuan, please."]],
   [check('对话中要买几个苹果？',['两个','三个','十个'],'两个','问 How many apples? 后，回答 Two.','How many apples?'),check("收银员说 That's ten yuan, please.，价格是多少？",['十元','六元','八元'],'十元','ten 是十，yuan是元。',"That's ten yuan, please.")],
   activity('纸上水果商店','画几种水果，写6到10元的价格。和家人轮流当顾客和店员，先数水果，再听课本的价格句并模拟付款。',"That's ten yuan, please.")),
  lesson(u6,5,'数字帮我安排生日','读懂时间和生日情景，发现数字能说明不同事情。',[69,70,71],
   [['o-clock',69,'🕖'],['cut',69,'🔪'],['eat',69,'🍽️'],['cake',69,'🎂']],
   [[69,"It's seven o'clock. Hurry!"],[69,'Happy birthday!']],
   [check('课本钟表情景里的时间是几点？',['七点','五点','六点'],'七点',"It's seven o'clock. 表示七点整。","It's seven o'clock. Hurry!"),check('课本邀请卡中的生日聚会从什么时候开始？',['下午五点','下午六点','早上七点'],'下午五点','邀请卡写5 p.m.，表示下午五点。','5 p.m.')],
   activity('我的生日卡','画一张生日卡，写上一个年龄数字和一幅钟表图。展示给家人，读课本的生日祝福，再用中文说明卡上的数字表示什么。','Happy birthday!'),
   {reading:[...reading([69]),...lines([[70,'to Xinxin\'s 6th birthday party!'],[70,'8/1'],[70,'5 p.m.'],[70,"Xinxin's home"],[71,'Happy birthday!']])]}),
  lesson(u6,6,'数字六的不同写法','完整听读故事，知道同一个数字可以有不同写法。',[72,73,84],
   [['six',72,'6️⃣'],['old',84,'📜'],['year',73,'📅']],
   [[72,'How many cards?'],[73,"It's six in Chinese."]],
   [check('故事一开始，卡片一共有多少张？',['六张','四张','十张'],'六张','问 How many cards? 后，回答 Six.','Six.'),check('故事里的罗马数字VI表示哪个数？',['六','五','七'],'六','孩子回答six，接着对方说回答又对了。',"You're right again.")],
   activity('三张数字六卡','分别写阿拉伯数字6、英文six和罗马数字VI。把三张卡摆在一起，听故事，再向家人说明它们为什么表示同一个数。',"It's six in Chinese."),{type:'story',reading:reading([72,73])})
 ]}
];

export const COURSE={id:'g3-upper-2026',bookId:'g3-upper',title:'三年级上册英语',edition:'2024版 · 2026年7月印本',units};
export const LESSONS=COURSE.units.flatMap(unit=>unit.lessons);
