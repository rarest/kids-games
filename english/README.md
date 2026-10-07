# 珠珠学习乐园

统一学习入口：`games/classroom.html`。英语作为珠珠课堂的学科标签，旧地址 `games/english.html` 和既有进度保留。

- 36条路线 = 9种主题 × 滑梯、跑酷、骑车、赛车4种玩法。自动向前，左右方向键/A/D转向，空格/W/上键或触屏按钮跳跃。
- 选年级、册次和教材单元后，沿途分散出现10题，含单词3题、美国音标2题、句子3题、语法2题。题卡暂停所有参赛车辆及游戏计时。
- 题卡先回答后解释，完成一张卡200金币；错误也有解释和正确答案。首次正确率与完成题数分别记录。
- 33球形皮肤带3D饰品与炫彩拖尾：免费1、普通100/独特150/隐藏200/神话300金币各8款。金币、购买、装备、成绩和错题保存在当前浏览器。
- “先看本单元”可听读；主页可复习最近错题。
- 8册46单元的题库主题按人教社目录核查，自编286个词条、138个例句、92个语法练习。新目录未公布六下，在UI明确使用官方四单元在用版复习。详见SOURCES.md。
- 505段随包美式合成发音，无需用户登录或语音服务密钥。优先播放词汇MP3；完整句可选浏览器美式voice，缺voice时使用随包MP3。read/use单词使用语境生成后按词边界裁切，记录在audio/context-pronunciation.json。

## 构建与验证

```
npm run build:english
npm run test:english
```

`node --test tests/*.test.mjs` 为全仓单元检查；英文浏览器检查使用独立Chromium临时profile，验证真实UI、3D渲染、左右屏幕投影、10卡冻结、奖励去重、购买重载、手机/平板/电脑布局、触屏跳跃与实际音频播放。`GAMES_TEST_ORIGIN=https://games.nblord.com` 可运行同一公网验收；`ENGLISH_TEST_ARTIFACTS=/absolute/output/path` 保存截图。

运行教材发音生成器需Python环境内有edge-tts及系统node/ffprobe/ffmpeg；既有MP3会复用，`--prune` 清理课程不再使用的旧音频。此生成步骤仅开发时执行，网页不依赖该Python环境。渲染器使用本地打包Three.js，许可证保留在THIRD_PARTY_NOTICES.txt。
