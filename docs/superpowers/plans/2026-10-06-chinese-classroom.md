# 珠珠课堂语文学科 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 10月7日交付可在线打开的珠珠课堂，英语保持可用、语文完整教材课程和独立进度、数学预留。
**Architecture:** 静态ES模块课程与共享学科导航，共用现有家庭账号与孩子档案。语文课程与英语各自编解码，数据库事件版本隔离；云端同步沿用已测试的离线队列。
**Tech Stack:** ES modules、CSS、SVG、Node tests、Chromium CDP、PostgreSQL、esbuild。
**Spec:** openspec/changes/chinese-classroom/specs/pearl-classroom/spec.md；design.md。

## Global Constraints

- 名称珠珠课堂；英语、语文切换；数学准备中。
- 上传版本8单元26课，第11课宝葫芦的秘密（节选），第24课一定要争气。
- 英语存档键、API、课程ID不变；共用孩子档案，各科学习独立。
- 不发布原图姓名、批注、课表；自评不伪装机器评分。
- 手机320px、平板横竖屏、电脑；触控至少44px，无横向溢出。
- JSON最多512KiB；事件最多256条；未知学科拒绝。

### Task 1: 教材课程数据

**Files:** chinese/curriculum.js、chinese/content-u1.js 至 content-u8.js、chinese/appendices.js、chinese/SOURCES.md、tests/chinese-curriculum.test.mjs。
**Interfaces:** curriculum.js exports COURSE={id:'pep3-cn-2026-v1',edition,units}, LESSONS。Unit={id:'u1',number,title,description,pages,extras:[{kind,title,pages,prompt,hints,examples?}]}。Lesson={id:'cn-1',number,unitId,title,pages:number[],genre,goal,preview:{prompt,hint},paragraphs:[{text,page}],words:[{text,pinyin,meaning,example,page}],questions:[{id:'cn-1:q1',prompt,choices:string[],answer:string,hint,explanation,page}],expression:{prompt,hints:string[]},recite:{required:boolean,parts:string[]},recognize:string[],write:string[]}。words至少3项，questions至少3题且每题唯一正确选项，正文全文逐段，古诗可每首一段。appendices exports RECOGNIZE,WRITE,WORDS（课号分组数组，按表核对）。

- [x] 先创建测试，动态import放入assert.doesNotReject，运行node --test tests/chinese-curriculum.test.mjs，确认失败是模块缺失。
- [x] 看图逐页转录正文，原文与原创引导分字段；标题、页码、课后背诵要求、全部附录核对。不能删长篇、只录选段、用同一套通用题替代理解。
- [x] 独立期待样例：LESSONS.find(l=>l.number===11).title为宝葫芦的秘密（节选）；第24课一定要争气；第9课为犟龟，p34保留上传版本的婚礼取消结尾与印刷省略号，不擅自补写故事。每课包含相应全部正文。
- [x] 运行内容测试；记录具体源图页码和校对结论；提交仅此任务文件。

### Task 2: 学习引擎与存档

**Files:** chinese/engine.js、tests/chinese-engine.test.mjs。
**Interfaces:** exports buildSteps(lesson,{review=false,reviewKeys=[]}={}),createSession(lesson,{now=Date.now(),review=false,reviewKeys=[]}={}),loadProgress(raw,lessons=LESSONS),recordAnswer(progress,session,step,selected,{hinted=false,now=Date.now()}={}),advance(session),completeLesson(progress,session,{now=Date.now()}={}),dueItems(progress,now=Date.now()),recommendLesson(lessons,progress)。Progress={version:1,lessons:{},items:{},session:null}。Session={lessonId,startedAt,index,review,reviewKeys,steps,answers,feedback}。Steps={id,kind,stage,itemKey?,...}。kind preview/reading/word/meaning/check/expression/recite；评分仅meaning/check。

- [x] 测试未完成课不能complete、错答再答不丢首次错误、hinted不能提高掌握、北京时间复习间隔、未知原型键和注入步骤剔除、恢复重建steps。
- [x] 阅读每屏一段；选择题保存选项并反馈；非评分步骤需要显式visited或selfReported；advance不得越过未完成步骤。表达和背诵仅记录尝试。
- [x] 理解题和字词题正确选项位置用稳定顺序分散，不能一律第一项；重建步骤仍完全一致，干扰项不能与正确释义等价。
- [x] complete验证每步答案并幂等startedAt:review身份，review不能完成未学课。服务端将复用引擎完整校验。
- [x] 将掌握计数抽为小导出recordItemAnswer(progress,itemKey,correct,{hinted=false,now=Date.now()}={})，本地首次答题与服务端合法事件回放复用同一算法，避免复制。
- [x] node --test tests/chinese-engine.test.mjs通过后提交。

### Task 3: 家庭学科隔离

**Files:** platform/chinese-progress.mjs、family-store.mjs、server.mjs、migrations/003-subjects.sql、english/course-cloud.js、deploy/deploy-local.sh、相关测试。
**Interfaces:** 家庭getProgress/syncProgress/importProgress增加最后参数subject='english'；语文endpoint progress/chinese。Chinese codec和English codec同签名sanitize/sanitizeSession/normalizeEvent/replay、CONTENT_VERSION。createCourseCloud增加subject、contentVersion、guestKey、profileKey、emptyProgress可选项，默认保持英语。

- [ ] 写测试证明英语/语文同时更新不冲突、互不回放，导入按科为空、导出两科、非法学科拒绝、非拥有者404。运行看见缺语文行为失败。
- [ ] 事务迁移约束扩大到english/chinese与两版本，不删数据；migrate重跑安全；事件查询按版本。语文课程文件纳入platform部署指纹。
- [ ] 真实PostgreSQL临时schema执行覆盖测试，既有English/cloud/auth相关测试保持通过。
- [ ] 提交相关文件。

### Task 4: 三端课堂与听读

**Files:** shared/classroom-nav.js/css、games/classroom.html、games/chinese.html、chinese/main.js/css/art.js/audio.js/family.js、英语品牌修改、games.js、index.html、account.html、shared/account.js、package.json、tests/chinese-browser.mjs及相关目录/账号验收。

- [ ] native输入测试先访问缺页失败；覆盖320/390/768/1024/1366屏宽与touch点击，真实英语切换后回到语文仍续学。
- [ ] 建立纸面插画式8单元首页、今日小课、单目标卡片、目录模态、字词/理解、提示重试、表达、自评背诵、错题复习、退出续学。所有原文按顺序可读，学习过程不会揭露听力答案。
- [ ] 目录中可打开全部单元配套内容，以及按课号分组的识字、写字、词语附录；词语可听读，已学蓝字与新识字区分显示，不让附录仅停留在数据文件。
- [ ] 接入共享账号与语文cloud；访客进度不可自动混入孩子；冲突显式选择，pagehide本地先保存。
- [ ] 游戏厅课程卡与家长中心入口、导出文件名、档案/删除说明采用两科学习措辞；默认课入口为统一学科首页，既有英语地址保留。
- [ ] 普通话固定音频逐段；本地备用朗读明确标识。不得将英语评分后端当中文评分。
- [ ] node --test tests/chinese-browser.mjs与English三端相关浏览器验证，再构建两bundle提交。
- [ ] 修正主线已复现的测试夹具兼容性错误：english-course-save/speaking按事件类型保存click/toggle监听，而非让toggle覆盖click；wechat-cloud-media-manifest识别bundled-content的包内资源路径，并反查对应原始sourcePath。保留原业务断言、不跳过失败测试、不修改小程序业务；原生英语和打包资源检查仍需通过。

### Task 5: 审查与上线

**Files:** OpenSpec tasks/verification与docs进度记录。

- [ ] 独立review全分支及具体教材内容，修复重要问题，运行项目必需检查与openspec validate chinese-classroom --strict。
- [ ] fetch最新main，保护并发提交，创建PR、合并、既有webhook部署。
- [ ] 公网native学习路径、两科账号存档、资源哈希与服务器HEAD一致；不改联机游戏运行时。
- [ ] 报告真实链接与结果；只有规定功能和公网验收完成才勾选任务。
