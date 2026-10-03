# 英语珠珠乐园题库来源

目录核查日期：2026-10-03。题库包含 8 册、46 个单元、286 个不同词条、297 个单元词条引用、138 个双语例句、92 道语法选择题。每单元有至少 6 个主题词、3 个例句和 2 道语法题；部分单元补充相关词汇。句子还提供 49 种使用相同词组的自然替代语序。

本项目按教材单元主题制作**自编练习**。目录和单元标题来自人教社公开资源；主题词由项目选编，例句、中文提示、语法题及解释由项目编写。这里不是完整官方词表，也不是教材练习答案。单元主题有对应关系；具体词条和语法题没有逐页对齐教材所有课时。

## 当前公开目录：七册

主要依据为[人民教育出版社小学英语 PEP 配套资源入口](https://www.pep.com.cn/zslth/yyptzy/xypep/)。七册页面均列出 6 个教学单元，复习和附录不作为独立教学单元。原始页面快照和提取的目录存放在 `/home/ubuntu/codex-work/output/english-pep/sources/`，用于本次核对。

| 册别 | 人教社直接来源 | 本题库采用的单元标题 |
| --- | --- | --- |
| 三上 | https://www.pep.com.cn/zslth/yyptzy/xypep/3s/ | Making friends；Different families；Amazing animals；Plants around us；The colourful world；Useful numbers |
| 三下 | https://www.pep.com.cn/zslth/yyptzy/xypep/3x/ | Meeting new people；Expressing yourself；Learning better；Healthy food；Old toys；Numbers in life |
| 四上 | https://www.pep.com.cn/zslth/yyptzy/xypep/4s/ | Helping at home；My friends；Places we live in；Helping in the community；The weather and us；Changing for the seasons |
| 四下 | https://www.pep.com.cn/zslth/yyptzy/xypep/4x/ | Class rules；Family rules；Time for school；Going shopping；Farms and us；From farm to table |
| 五上 | https://www.pep.com.cn/zslth/yyptzy/xypep/5s/ | Different friends；My feelings；Work and play；Healthy habits；Food we eat；Nature and us |
| 五下 | https://www.pep.com.cn/zslth/yyptzy/xypep/5x/ | Following the rules；Our community；Life in different seasons；My hometown；Travelling around；Making a travel plan |
| 六上 | https://www.pep.com.cn/zslth/yyptzy/xypep/6s/ | Amazing places；Getting together；Healthy life；Managing money well；Exploring space；Energy, nature and us |

例如三上第一单元采用 Making friends，并选择 ear、hand、eye、mouth、arm 等身体词支持交友动作表达，不混用以文具为主的旧目录。三下 Meeting new people 包含 where/from/student，Expressing yourself 以外貌特征与表达关爱为练习重点；感受词归入五上 My feelings。`edition` 中的“2026年10月公开资源”是本次核查的目录时间，不将它当作教材版权页的出版年份。

## 六下：在用版复习

新目录入口中的 `https://www.pep.com.cn/zslth/yyptzy/xypep/6x/` 在本次核查时返回 404 页面，新目录没有列出六下。本项目未编造这册新版本的单元。

另一个[人教社六下在用版资源门户](https://www.pep.com.cn/zslth/yyptypzj/xypep/6x/)仍提供 4 个单元、相应词汇和常用表达音频。页面标题只写 Unit 1–4，但各单元开篇页的音频文件名包含下面四个标题；2026-10-03 实际请求四个音频均返回 HTTP 200、`audio/mpeg`：

- [Unit 1 How tall are you?](https://www.pep.com.cn/yyptypzj/pep-6x-01-Unit-1-How-tall-are-you.mp3)
- [Unit 2 Last weekend](https://www.pep.com.cn/yyptypzj/pep-6x-01-Unit-2-Last-weekend.mp3)
- [Unit 3 Where did you go?](https://www.pep.com.cn/yyptypzj/pep-6x-01-Unit-3-Where-did-you-go.mp3)
- [Unit 4 Then and now](https://www.pep.com.cn/yyptypzj/pep-6x-01-Unit-4-Then-and-now.mp3)

选册标题、数据 `edition` 均明确标注“在用版复习”。本次证据来自官方门户与文件名，不据此推定版权页的具体印次。

三下主题组织另参考[杭州市文三教育集团教师对 Meeting new people 的教学反思](https://www.hzxhjy.cn/hzswsjyjt/jsly/jxfs/202603/t20260330_755380.shtml)中关于介绍来源及认识他人的课堂描述；该材料属于教师教学实践记录。

## 美式音标

词条采用宽式美式 IPA。统一使用 `ɛ`、`ɑ`、`oʊ`、`ɚ`、`ɝ`；去掉音节分隔点与元音长度符号，词重音保留。`t` 代表音位，不在每个词中加入美式闪音的语音细节。美式发音本身存在地区变体，water 等词采用一种常见读法。中文释义注明 read 为动词原形、use 为动词、shoes/teeth/noodles 等为复数，防止一词多读或词形造成误解。

本次通过词典的 US/NAmE 项抽查容易混用英美读法、重音或词性发音的词：

| 词条 | 本项目音标 | 核对来源与要点 |
| --- | --- | --- |
| vegetable | /ˈvɛdʒtəbəl/ | [Cambridge US pronunciation](https://dictionary.cambridge.org/pronunciation/english/vegetable)，三音节常见形式 |
| tomato | /təˈmeɪtoʊ/ | [Cambridge Essential American Dictionary](https://dictionary.cambridge.org/us/dictionary/essential-american-english/tomato)，美式中间元音 eɪ |
| use | /juz/ | [Cambridge use verb](https://dictionary.cambridge.org/us/dictionary/english/use)，本题库“使用”为动词，词尾 z |
| badminton | /ˈbædmɪntən/ | [Cambridge US pronunciation](https://dictionary.cambridge.org/pronunciation/english/badminton)，保留 n 音 |
| forest | /ˈfɔrɪst/ | [Cambridge US Dictionary](https://dictionary.cambridge.org/us/dictionary/english/forest)，采用其 US 读法 |
| library | /ˈlaɪbrɛri/ | [Cambridge US pronunciation](https://dictionary.cambridge.org/pronunciation/english/library)，采用完整三音节形式 |
| community | /kəˈmjunəti/ | [Cambridge US pronunciation](https://dictionary.cambridge.org/pronunciation/english/community)，第二音节重读 |
| grandfather | /ˈɡrænfɑðɚ/ | [Cambridge US pronunciation](https://dictionary.cambridge.org/us/pronunciation/english/grandfather)，采用词典所列省略 d 的形式 |
| water | /ˈwɔtɚ/ | [Oxford Advanced American Dictionary](https://www.oxfordlearnersdictionaries.com/us/definition/american_english/water_1)，其 NAmE 同时列 ɔ 和 ɑ 变体，本题库采用 ɔ |

## 语法与验证

例句和题目围绕主题，按年级逐步练习介绍、感受、单复数、一般现在时、请求与规则、计划、比较级、一般过去时。语法题检查选择项中只有一个正确形式；解释指出主语、时间或后接词形与答案之间的原因。

辅助核对依据包括 Cambridge English Grammar Today 的[情态动词形式](https://dictionary.cambridge.org/grammar/british-grammar/modality-forms)及[一般过去时](https://dictionary.cambridge.org/us/grammar/british-grammar/past-simple/)，以及 British Council LearnEnglish Kids 的[过去时问句说明](https://learnenglishkids.britishcouncil.org/grammar-vocabulary/grammar-practice/past-simple-questions)。情态动词后接原形、did 后接原形、规则动词过去式的读法用于核对题目与音标。

`node --test tests/english-curriculum.test.mjs` 检查册别和官方目录、六下版别标记、全局唯一单元 ID、全部词条引用、每单元最低内容量、中文提示、音标格式及英式音符混入、答案唯一性和代表性语法答案。数据不存在时先运行测试确认失败，随后加入数据并运行通过。来源记录同样先验证缺失时测试失败，再补充本文件。
