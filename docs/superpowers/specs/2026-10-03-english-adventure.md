# 英语珠珠乐园

用户已确认人教PEP，最新授权上传游戏平台。交付为公开可玩的独立学科首页及英语3D小游戏，保留语文、数学入口等用户后续安排。

## 已确认行为
- 36个游戏关卡，4种玩法：滑梯、跑酷、骑车、赛车；9种路线主题，每关独立路径和布置。
- 每次游戏10张题卡分散在路程中；题卡暂停全部比赛运动和计时，作答讲解后继续。
- 单词、美式音标、句式、语法；答错后解释和正确答案；每张完成卡200金币，仅结算一次。
- 33款圆球皮肤（免费1，普通/独特/隐藏/神话各8），价格100/150/200/300，3D饰品和发光拖尾，购买和进度本地持久保存。
- 手机、平板、电脑、横竖屏；键盘和触控操作；后台暂停。
- 教材范围按2026年10月3日人教社公开目录核对，练习自行编写，目录未公开的新册不冒充已核实内容。

## 模块约定
- curriculum.js 导出 WORDS 对象、BOOKS数组。词条 {en,zh,ipa}，键用英文小写加连字符；book {id,grade,term('upper'|'lower'),title,edition,source,units}；unit {id,number,title,zh,words:[词条键],sentences:[{en,zh,tip}],grammar:[{prompt,options:[字符串],answer:字符串,explanation}]}。
- core.js 导出 LEVELS、SKINS、makeQuestions(unit,WORDS,seed)、Run、loadSave、completeCard/buySkin。Run仅承担游戏逻辑，question/paused下不推进位置、敌车、时间。
- scene.js 导出 AdventureScene。constructor(canvas, {onError}={}); start(level,skin); render(run,input,dt); resize(); dispose(); preview(skin)。run字段 progress(0..1), elapsed, lane(-1..1), jump(0..1), rivals:[{progress,lane}], status('playing'|'question'|'paused'|'finished'), level；scene不得独立推进游戏时间或对手，全部从run读取。level {id,mode:'slide'|'parkour'|'bike'|'race',theme,index,seed}；skin {id,name,color,accent,accessory,pattern,tier,price}；input {steer,jump}。渲染以 progress映射至轨道曲线；render不改run。
- main.js连接首页、选册选单元、36关、3D、题卡、商店、发音、存档。audio/[wordId].mp3为随包美式合成发音，浏览器语音作为可选补充。

## 完成条件
题库来源记录、逻辑测试、真实浏览器四玩法与答题暂停/200奖励/购买重载/横竖屏/发音验证、独立审查、目录接入、GitHub合并与公网同等流程验收。既有联机服务不用无关重启。
