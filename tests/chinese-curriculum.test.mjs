import test from 'node:test';
import assert from 'node:assert/strict';

let curriculum;
let appendices;
test('课程和三份教材附录可以实际加载', async () => {
  await assert.doesNotReject(async () => {
    curriculum = await import('../chinese/curriculum.js');
    appendices = await import('../chinese/appendices.js');
  });
});

test('当前教材26课具有完整学习接口与唯一答案', async () => {
  await assert.doesNotReject(async () => { curriculum ??= await import('../chinese/curriculum.js'); });
  const {COURSE, LESSONS} = curriculum;
  assert.equal(COURSE.id, 'pep3-cn-2026-v1');
  assert.equal(COURSE.units.length, 8);
  assert.equal(LESSONS.length, 26);
  const expected = ['大青树下的小学','花的学校','不懂就要问','古诗三首','铺满金色巴掌的水泥道','秋天的雨','听听，秋的声音','总也倒不了的老屋','犟龟','小狗学叫','宝葫芦的秘密（节选）','在牛肚子里旅行','一块奶酪','搭船的鸟','金色的草地','富饶的西沙群岛','海滨小城','美丽的小兴安岭','香港，璀璨的明珠','古诗三首','大自然的声音','读不完的大书','司马光','一定要争气','手术台就是阵地','一个粗瓷大碗'];
  assert.deepEqual(LESSONS.map(l=>l.title), expected);
  for (const lesson of LESSONS) {
    assert.equal(lesson.id, `cn-${lesson.number}`);
    assert.ok(COURSE.units.some(u=>u.id===lesson.unitId));
    assert.ok(lesson.goal && lesson.genre && lesson.preview.prompt && lesson.preview.hint);
    assert.ok(lesson.paragraphs.length > 0);
    for (const p of lesson.paragraphs) { assert.ok(p.text.trim()); assert.ok(lesson.pages.includes(p.page)); }
    assert.ok(lesson.words.length >= 3);
    for (const w of lesson.words) assert.ok(w.text && w.pinyin && w.meaning && w.example && lesson.pages.includes(w.page));
    assert.ok(lesson.questions.length >= 3);
    for (const q of lesson.questions) {
      assert.ok(q.id.startsWith(`${lesson.id}:`));
      assert.equal(new Set(q.choices).size, q.choices.length);
      assert.equal(q.choices.filter(c=>c===q.answer).length, 1);
      assert.ok(q.prompt && q.hint && q.explanation && lesson.pages.includes(q.page));
    }
    assert.ok(lesson.expression.prompt && lesson.expression.hints.length);
    assert.equal(typeof lesson.recite.required, 'boolean');
    assert.ok(Array.isArray(lesson.recognize) && Array.isArray(lesson.write));
  }
});

test('长课文结尾与新教材特别篇目不会被旧版或摘录替代', async () => {
  await assert.doesNotReject(async () => { curriculum ??= await import('../chinese/curriculum.js'); });
  const lesson = n=>curriculum.LESSONS.find(l=>l.number===n);
  assert.match(lesson(9).paragraphs.map(p=>p.text).join(''), /婚礼暂时取消了/);
  assert.match(lesson(11).paragraphs.map(p=>p.text).join(''), /宝葫芦/);
  assert.ok(lesson(11).paragraphs.map(p=>p.text).join('').length > 800);
  assert.ok(lesson(24).paragraphs.map(p=>p.text).join('').length > 500);
});

test('三份附录按课号分组且覆盖教材各250项', async () => {
  await assert.doesNotReject(async () => { appendices ??= await import('../chinese/appendices.js'); });
  for (const key of ['RECOGNIZE','WRITE','WORDS']) {
    const groups = appendices[key];
    assert.ok(Array.isArray(groups));
    assert.equal(groups.flatMap(g=>g.items).length, 250, key);
    for (const group of groups) { assert.ok(Number.isInteger(group.lesson)); assert.ok(group.items.length); }
  }
});

test('答案位置变化，孩子必须按内容选而非一直点击第一项', async () => {
  await assert.doesNotReject(async () => { curriculum ??= await import('../chinese/curriculum.js'); });
  assert.deepEqual(new Set(curriculum.LESSONS.flatMap(l=>l.questions.map(q=>q.choices.indexOf(q.answer)))), new Set([0,1,2]));
});

test('当前书的背诵要求和完整单元拓展供学习界面读取', async () => {
  await assert.doesNotReject(async () => { curriculum ??= await import('../chinese/curriculum.js'); });
  assert.deepEqual(curriculum.LESSONS.filter(l=>l.recite.required).map(l=>l.number),[4,6,20,21,23]);
  assert.deepEqual(curriculum.LESSONS.find(l=>l.number===4).recite.dictation,['山行']);
  assert.deepEqual(curriculum.LESSONS.find(l=>l.number===20).recite.dictation,['望天门山']);
  for (const u of curriculum.COURSE.units) {
    assert.ok(u.extras.some(e=>e.kind==='习作'));
    for (const e of u.extras) assert.ok(e.title && e.prompt && e.hints.length && e.pages.length);
  }
  const extras=curriculum.COURSE.units.flatMap(u=>u.extras);
  assert.deepEqual(extras.filter(e=>e.kind==='例文').map(e=>e.title),['我家的小狗','我爱故乡的杨梅']);
  assert.match(extras.find(e=>e.title==='我家的小狗').examples.join(''),/还是骂了火车一顿/);
  assert.match(extras.find(e=>e.title==='我爱故乡的杨梅').examples.join(''),/牙齿已经被它酸倒了/);
  assert.match(extras.find(e=>e.title==='秋分过后的准备').examples.join(''),/金翅雀/);
  assert.match(extras.find(e=>e.title==='瀑布').examples.join(''),/如烟，如雾，如尘/);
});

test('第一种结局保留独立省略号，三次尝试保留原文逗号', async () => {
  await assert.doesNotReject(async () => { curriculum ??= await import('../chinese/curriculum.js'); });
  const p=curriculum.LESSONS.find(l=>l.number===10).paragraphs;
  const second=p.findIndex(p=>p.text==='第二种结局');
  assert.deepEqual(p[second-1],{page:39,text:'……'});
  assert.match(p.map(p=>p.text).join(''),/小狗又试了一次，两次，三次，都没能成功。/);
});

test('新版课文细节和印刷标点按源图保留', async () => {
  await assert.doesNotReject(async () => { curriculum ??= await import('../chinese/curriculum.js'); });
  const text=n=>curriculum.LESSONS.find(l=>l.number===n).paragraphs.map(p=>p.text).join('');
  assert.match(text(13),/要做到不趁机舔一下/);
  assert.match(text(16),/树林，树林里栖息着各种海鸟。/);
  assert.match(text(17),/帆船上的渔民，军舰上的战士/);
  assert.doesNotMatch(text(17),/机帆船上的渔民/);
  assert.match(text(21),/所有的树林，树林里的每片树叶，所有的房子，房子的屋顶和窗户，都发出不同的声音。/);
});

test('日记、童话角色和读书吧不使用旧版或误读原文', async () => {
  await assert.doesNotReject(async () => { curriculum ??= await import('../chinese/curriculum.js'); });
  const extra=title=>curriculum.COURSE.units.flatMap(u=>u.extras).find(e=>e.title===title).examples.join('');
  assert.match(extra('写日记'),/9月29日 星期一 晴/);
  assert.match(extra('我来编童话'),/西红柿 茄子/);
  assert.match(extra('在那奇妙的王国里'),/小蝌蚪四处寻找自己的妈妈/);
  assert.match(extra('上学路上的观察'),/一根竹竿做成笆帚的把子/);
});

test('配套页保留全部印刷导语、交流心得、气泡和操作步骤', async () => {
  await assert.doesNotReject(async () => { curriculum ??= await import('../chinese/curriculum.js'); });
  const pageText=page=>curriculum.COURSE.units.flatMap(u=>u.extras).filter(e=>e.pages.includes(page)).flatMap(e=>e.examples).join('');
  for (const [page,pattern] of [
    [9,/我跟爷爷奶奶学会了做简单的农活/],
    [11,/我愿意我是一个更夫，整夜在街上走，提了灯去追逐影子。/],
    [43,/学习了怎样预测后，我读书更仔细了，注意到了更多的细节。/],
    [55,/阅读童话，我们会经历很多不可思议的事情/],
    [65,/可以从事物的不同方面观察。/],
    [81,/这样的句子也有可能在一段话的末尾或中间。/],
    [93,/我喜欢归类摘抄/],
    [106,/如果有同学看不明白的地方，试着修改一下。/],
    [107,/不要指读，也不要动唇/],
  ]) assert.match(pageText(page),pattern,`教材p${page}印刷指导完整可读`);
});

test('相邻配套原文保留真实措辞，不用近义概述替代', async () => {
  await assert.doesNotReject(async () => { curriculum ??= await import('../chinese/curriculum.js'); });
  const extras=curriculum.COURSE.units.flatMap(u=>u.extras);
  const text=title=>extras.find(e=>e.title===title).examples.join('');
  assert.match(text('秋分过后的准备'),/比如蒲公英植物，风把它们的种子从妈妈那里带走/);
  assert.match(text('摘抄、识字与连贯表达'),/把描写同类事物的语句分门别类地写下来，经常翻看，对我的习作很有帮助。/);
  assert.deepEqual(curriculum.COURSE.units.map(u=>u.extras.filter(e=>e.kind==='单元导语').flatMap(e=>e.pages)),[[1],[13],[27],[45],[59],[69],[83],[95]]);
});

test('所有配套栏目保留核图后的原文块数及指导首尾', async () => {
  await assert.doesNotReject(async () => { curriculum ??= await import('../chinese/curriculum.js'); });
  const extras=curriculum.COURSE.units.flatMap(u=>u.extras);
  const counts={
    '第一单元':4,'我的暑假生活':7,'猜猜他是谁':8,'梳理与交流、词句段运用':17,'所见':1,
    '第二单元':4,'写日记':10,'理解词语的方法与季节词语':13,'狂、罚、笛、湿等字':3,'舟夜书所见':1,'上学路上的观察':2,'秋分过后的准备':6,
    '第三单元':3,'名字里的故事':8,'续写故事':6,'预测、识字、对话与修改符号':23,'待人处世':4,
    '第四单元':4,'我来编童话':10,'童话想象、识字和词句':17,'团结合作':3,'在那奇妙的王国里':13,
    '第五单元':3,'留心和细致观察':7,'身边的观察':3,'我们眼中的缤纷世界':6,'我家的小狗':12,'我爱故乡的杨梅':11,
    '第六单元':4,'这儿真美':10,'关键语句与词句段运用':20,'早发白帝城':1,
    '第七单元':4,'身边的“小事”':5,'我有一个想法':7,'摘抄、识字与连贯表达':15,'未、英、梨、楚等字':2,'采莲曲':1,'瀑布':1,
    '第八单元':4,'请教':11,'那次经历真难忘':5,'默读、目字旁和近义词':19,'志向与坚持':3,
  };
  assert.equal(extras.length,Object.keys(counts).length);
  for (const [title,count] of Object.entries(counts)) {
    const extra=extras.find(e=>e.title===title);
    assert.ok(extra, title);
    assert.equal(extra.examples.length,count,`${title}印刷原文块数`);
    assert.ok(extra.examples.every(t=>typeof t==='string' && t.trim()));
  }
  const anchors=[
    ['我的暑假生活','你的暑假是怎么度过的？','借助图片或实物讲。'],
    ['猜猜他是谁','我们来做一个“猜猜他是谁”的游戏吧！','大家一起猜一猜。'],
    ['梳理与交流、词句段运用','梳理与交流','让人一看就能记住。'],
    ['写日记','你写过日记吗？','写的时候注意格式和标点符号。'],
    ['名字里的故事','每个人都有名字。','听别人讲话的时候，表现出交流的兴趣。'],
    ['续写故事','下面的图讲了什么事情？','说说你更喜欢谁写的故事。'],
    ['预测、识字、对话与修改符号','梳理与交流','表示删除'],
    ['我来编童话','童话世界真奇妙，','再试着用学过的修改符号修改你的习作。'],
    ['在那奇妙的王国里','在童话王国里，','等待着你去漫游，去发现。'],
    ['留心和细致观察','留心观察有哪些好处？','细致的观察可以让我们对事物有更多更深的了解。'],
    ['身边的观察','你在生活中观察到了什么？','是一种很软糯的口感……'],
    ['我们眼中的缤纷世界','这段时间我们观察了不少身边的事物，','可以从事物的不同方面观察。'],
    ['这儿真美','花园、果园、田野、小河……','可以用上这些新学的词语。'],
    ['关键语句与词句段运用','梳理与交流','阅览室里一片静悄悄……'],
    ['身边的“小事”','我们的身边每天都在发生各种各样的“小事”，','尽可能反映每个人的想法。'],
    ['我有一个想法','生活中有很多需要改进的问题。','然后修改自己的习作。'],
    ['摘抄、识字与连贯表达','梳理与交流','我能接着往下说：弯弯的小桥旁边……'],
    ['请教','有时候，我们会遇到一些难以理解或不好解决的问题，','不清楚的地方及时追问。'],
    ['那次经历真难忘','在你的记忆里，有哪些经历特别难忘、印象特别深刻？','如果有同学看不明白的地方，试着修改一下。'],
    ['默读、目字旁和近义词','梳理与交流','____：________'],
  ];
  for (const [title,first,last] of anchors) {
    const original=extras.find(e=>e.title===title).examples;
    assert.ok(original[0].startsWith(first),`${title}原文开头`);
    assert.ok(original.at(-1).endsWith(last),`${title}原文结尾`);
  }
});

test('p44印刷修改符号保留错误原句及改正增补删除的对应关系', async () => {
  await assert.doesNotReject(async () => { curriculum ??= await import('../chinese/curriculum.js'); });
  const examples=curriculum.COURSE.units.flatMap(u=>u.extras).find(e=>e.title==='预测、识字、对话与修改符号').examples;
  for (const sentence of ['李老师以经走了。','他穿着一件灰色的上衣，一顶蓝色的帽子。','菜园里种了很多蔬菜，有土豆、黄瓜、西瓜和西红柿。']) assert.ok(examples.includes(sentence),`有意错误原句：${sentence}`);
  for (const relation of [
    '表示改正 / 李老师以经走了。 / 以 → 已',
    '表示增补 / 他穿着一件灰色的上衣，一顶蓝色的帽子。 / ， → 戴着 → 一顶',
    '表示删除 / 菜园里种了很多蔬菜，有土豆、黄瓜、西瓜和西红柿。 / 西瓜',
  ]) assert.ok(examples.includes(relation),`印刷修改对象及所属原句：${relation}`);
});

test('p56口字族保留共同中心及三组连接关系', async () => {
  await assert.doesNotReject(async () => { curriculum ??= await import('../chinese/curriculum.js'); });
  const examples=curriculum.COURSE.units.flatMap(u=>u.extras).find(e=>e.title==='童话想象、识字和词句').examples;
  assert.ok(examples.includes('口 → 咬 叼 嚼 咽 啃 吞 含 / 口 → 叫 喊 嚷 吼 吵 啼 唤 / 口 → 啪 哗 吱 嗡 嘟 呜 喵'));
});
