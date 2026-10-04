# 三、四年级逐单元内容核对

核对日期：2026-10-04。`content-g34.json` 包含三上、三下、四上、四下共24单元，475个单元词条引用、447个不同词条、167个原创双语例句、77道语法题。

## 使用版本与证据

四册使用[人教社新教材数字配套资源](https://www.pep.com.cn/zslth/yyptzy/xypep/)的当前六单元目录。本次分别请求[三上](https://www.pep.com.cn/zslth/yyptzy/xypep/3s/)、[三下](https://www.pep.com.cn/zslth/yyptzy/xypep/3x/)、[四上](https://www.pep.com.cn/zslth/yyptzy/xypep/4s/)、[四下](https://www.pep.com.cn/zslth/yyptzy/xypep/4x/)，均取得HTTP 200 HTML。每页末尾“Words in each unit”均列出六个官方单元词表音频；文字区没有实际词表正文。

词汇清单依据教材本身的逐单元附录，并与上述官方音频交叉对照。教材扫描由第三方托管，不能将托管网站称为人教社官方发布渠道。核查的是扫描中可读的教材页、单元目录和词条，不使用上传者的AI简介或“最新”标签作为版本证明。

| 册别 | 教材附录来源 | 本次读取范围 | 单元词条数 |
| --- | --- | --- | --- |
| 三上 | [教材扫描，数字页91起](https://fliphtml5.com/smmnc/jblr/2024%E9%83%A8%E7%BC%96%E7%89%88_%EF%BC%88%E4%BA%BA%E6%95%99%E7%89%88%EF%BC%89%E4%B9%89%E5%8A%A1%E6%95%99%E8%82%B2%E6%95%99%E7%A7%91%E4%B9%A6%C2%B7%E8%8B%B1%E8%AF%AD%EF%BC%88PEP%EF%BC%89%E4%B8%89%E5%B9%B4%E7%BA%A7%E4%B8%8A%E5%86%8C/91/) | 印刷83–85页，数字页91–93 | 18 / 20 / 22 / 19 / 16 / 16 |
| 三下 | [教材扫描](https://www.scribd.com/document/1054745710/) | Appendix 2，印刷80–82页 | 23 / 24 / 20 / 17 / 17 / 13 |
| 四上 | [教材扫描](https://www.scribd.com/document/997370971/) | Appendix 2、Appendix 3，印刷80–85页 | 20 / 14 / 18 / 14 / 24 / 21 |
| 四下 | [教材扫描](https://www.scribd.com/document/1052927714/eng-grade-4-sec) | Appendix 2、Numbers，印刷80–82页 | 23 / 22 / 42 / 21 / 13 / 18 |

三上数字页91、92、93分别对应印刷83、84、85页。三上的 `name`、`animal` 等在部分教师整理词表中漏列，本次按教材扫描和官方音频补入。第三方词表中的 `piece` 没有在本次教材附录或官方单元音频中确认，因此未加入三上Unit 6。四上 `helpful` 可在同一教材Appendix 3 p.9词条确认，已补入Unit 1。四下Unit 3的42项包括其本单元14项和教材p.82独立Numbers附录的28项：1–20、30、40、50、60、70、80、90、100。该补充在该单元`coverage.basis`中明确记录。

`coverage.status=verified`表示逐单元词汇附录已完整核对；不表示所有教材正文、选学阅读、故事、歌曲及每个语音课词都被逐句收录。题库覆盖单元主要语言结构，句子由项目原创，未整段复制教材对话。教材附录的黑体、白体、星号分类没有在题库中另作背诵要求。

## 官方词表音频

`content-g34.json`每单元`coverage.source`保留确切官方MP3地址。四册24个音频都已取得HTTP 200，时长53–108秒。下载记录、官方HTML快照、音频及ASR辅助转写保存于 `/home/ubuntu/codex-work/output/english-pronunciation/content-g34/`。

ASR用于核对朗读项目和顺序，不用其自动拼写推断单词。易误识别例子包括 `sea/see`、`hear/here`、`whose/who's`、`wear/where`、`which/witch`、`their/there`、`Ms/Miz`、`Sydney/sittney`；均以教材附录的拼写为准。部分录音省略功能词或个别词，保留附录中确认的词条。例如三上附录的`and`、`goodbye`、`toy`、`some`没有完整出现在对应ASR中，仍按教材页收录；不能因为机器转写漏词就删词。

## 主要句型覆盖

| 册别 | Unit 1–6的主要练习结构 |
| --- | --- |
| 三上 | 姓名与问候、can与分享；家庭介绍与have；宠物、喜好与动物特征；水果喜好、植物需要与种植；颜色问答与混色；年龄、数量和整点时间 |
| 三下 | 来源、人物介绍与礼貌帮助；has外貌、喜好与表达关爱；文具、What are these、感官与学习工具；早餐、喜好和健康食物；物品识别、位置in/on/under与放置指令；How many、11–20、储钱罐与付钱词 |
| 四上 | 职业问答、can、家务与照顾；姓名、外貌、最好朋友和日常互动；there is/are、社区场所与活动；社区职业、第三人称单数与正在做的事；天气问答、可能下雨及天气活动；所属关系、mine、穿衣许可和季节 |
| 四下 | 班规、指令、许可和课堂准备；have to、家庭位置、正在做的事及规则作用；时间、time for/to与作息；价格、试穿、尺码与数量；农场动物、数量、单复数和农产品；请求、喂养、采摘、挤奶、餐具与减少浪费 |

每单元至少6个例句、3道语法题。新增句中31句各提供1个自然替代语序，共31个`acceptedAnswers`变体，主要允许时间或地点状语前置，也包含“用贺卡”和“用电脑”两处方式状语前置。每个变体逐一检查与原句具有相同词组及词组数量，未接受任意排列。语法题选项只含一个正确答案，解释面向小学生，明确主语、词形、数量或位置与选择的关系。语法题的`prompt`只保留英文；需要中文语境才能确定位置、人物或时间的5道题，将中文放在独立`context`字段，供界面显示该语境，朗读应仅使用英文题干。全部77题的解释均至少12字符，并说明选择原因。

## 美式音标与词形

音标采用宽式美式IPA，沿用项目的`ɛ`、`ɑ`、`oʊ`、`ɚ`、`ɝ`记法，保留重音，省略长度符号和音节分隔点。教材的英式拼写`colour`、`colourful`、`neighbour`、`favourite`、`maths`保留，但音标采用美式读法。教材语境中的`football`指足球运动，释义明确标注。

新增易混词对照词典美式条目：`eraser /ɪˈreɪsɚ/`对应[Oxford NAmE](https://www.oxfordlearnersdictionaries.com/us/definition/english/eraser)；`aunt /ænt/`选择[Cambridge所列US变体](https://dictionary.cambridge.org/us/pronunciation/english/aunt)；`giraffe /dʒəˈræf/`采用[Oxford美式条目](https://www.oxfordlearnersdictionaries.com/us/definition/american_english/giraffe)；`clothes /kloʊðz/`采用[Cambridge US宽式读法](https://dictionary.cambridge.org/us/pronunciation/english/clothes)。已有`vegetable`、`tomato`、`library`等美式证据沿用`SOURCES.md`所列词典条目。

词形以教材词表原形为准，`noodle`、`chopstick`、`shoe`、`sock`、`green bean`不擅自替换为复数词头；中文注明实际常见复数用法。`can-container`的英文显示仍为`can`，专指金属罐，与情态动词`can`分开。`milk`同时保留牛奶和挤奶两个本册用法。`over`同时保留“在远端”及“结束”，由例句语境区别。

## 验证

`/home/ubuntu/codex-work/output/english-pronunciation/content-g34/validate.py`先在数据不存在时确认失败，再在数据落盘后检查通过：4册24单元、词条ID合法且单元内唯一、中文释义和美式IPA格式完整、各单元内容量、语法答案唯一、来源链接存在。此脚本只验证数据结构；逐项词汇依据是上述教材页和官方音频记录。
