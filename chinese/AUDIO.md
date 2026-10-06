# 固定普通话音频

`audio-inputs.mjs` 直接读取最终教材导出；`generate-audio.py` 使用 edge-tts 7.2.8、`zh-CN-XiaoxiaoNeural`、`-10%` 语速。运行：

```sh
/path/to/edge-tts-environment/bin/python chinese/generate-audio.py
```

输入包括全部课文段落、教学词语、词语表、配套栏目原文与标题。文件名取 voice、rate 和 spoken input 的 SHA-256 前 24 位。生成器最多同时处理 3 条，最多尝试 6 次；已有文件通过完整 ffmpeg 解码后才复用。失败会保留明确报错，重跑继续补齐。纯省略号 `……` 是 0.8 秒停顿，使用 ffmpeg 生成静音；manifest 中单列 `silence_seconds`。

`audio-manifest.json` 保留 inputs、来源页号、spoken input、发音替换依据及文本到文件映射；网页只加载轻量 `audio-manifest.js`，点击听读才读取对应 MP3。本文本清单与媒体中不包含任何教材原始照片、手写内容或账号资料。

## 发音选择

- 鹿柴的“柴”按本册第 84 页注释读 zhài；只在朗读输入中用“鹿寨”选音。
- 本册同页将“返景”解释为傍晚的阳光，保留景 jǐng。教育部《重編國語辭典》[景](https://dict.revised.moe.edu.tw/dictView.jsp?ID=5955&q=1&word=%E6%99%AF)区分 jǐng（日光）与 yǐng（形影）。显示原文和音频输入都保持“返景”，青苔按教材注音 tái。
- 第 22 页的“㘗”读 qū。商务印书馆[《新华字典》第 12 版修订说明](https://www.cp.com.cn/Content/2020/09-03/1424594527.html)明确列出“㘗qū”；只在朗读输入中用“区”选音。
- 查慎行的姓读 zhā。教育部《重編國語辭典》[查](https://dict.revised.moe.edu.tw/dictView.jsp?ID=8258&la=0&powerMode=0)将姓氏列为 zhā；只在朗读输入中用“渣”选音。

所有这些替换均不改变网页中的教材原文。

## 验证记录

2026-10-07：932 个独立文本覆盖全部 255 条课文段落输入及全部教学/附录词语，另含配套正文和标题。资源测试逐一检查输入映射、资产存在与完整解码。浏览器原生点击验证实际 MP3 播放时间推进、音频时长，以及下一段取消旧音频。两项音频单元测试覆盖迟到失败、播放取消和明确标识的设备备用朗读。

补充内容抽查采用本地 multilingual Whisper small，覆盖课文首、中、末，以及鹿柴、㘗、查慎行、錾、蓟相关段落，共 8 段。首中末内容未发现明确漏段；同音替字和繁简输出不作为教材拼写修订依据。该抽查用于核对音频内容，不是孩子发音评分，也不是人工逐字声调验收。模型及环境仅在忽略的开发目录，不进入发布资源。
