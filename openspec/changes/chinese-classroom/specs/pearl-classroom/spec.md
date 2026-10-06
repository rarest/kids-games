## Purpose

珠珠课堂为三年级儿童提供与现用教材对应的英语和语文学科入口，以分段、小目标、提示和复习帮助独立学习，并在同一个家庭账号下分别保存各科和各孩子的进度。

## ADDED Requirements

### Requirement: Unified subject navigation

系统 SHALL 统一展示珠珠课堂名称，在英语和语文页均可切换学科，保留英语旧地址与存档，数学 SHALL 明确显示准备中而不可进入空课程。

#### Scenario: Change subject
- **WHEN** 孩子从英语切换到语文后再回到英语
- **THEN** 使用同一个已选择的孩子，恢复各自学习位置，英语存档不被修改为语文存档

### Requirement: Uploaded edition curriculum

系统 SHALL 采用上传教材的8单元26课，包括第11课宝葫芦的秘密（节选）、第24课一定要争气；课文、字词、古诗和练习 SHALL 逐页核对，不把手写批注视作原文。

#### Scenario: Read a source lesson
- **WHEN** 孩子选择任意课文
- **THEN** 可按原文顺序阅读和听读短段，查看教材页码、字词释义、课文理解提示以及表达任务

### Requirement: Honest small-step learning

系统 SHALL 每屏只呈现一个学习动作，支持提示、错答再试、保存退出和续学；口头尝试及自评背诵 SHALL 不伪装成机器测评结果。答错或使用提示的内容 SHALL 进入复习，掌握记录采用中国日期的1、3、7天间隔。

#### Scenario: Wrong answer and reload
- **WHEN** 孩子答错后刷新或退出再继续
- **THEN** 错题及当前步骤保留，可获得提示重试，未完成不能标记整课完成

### Requirement: Subject and owner isolation

系统 SHALL 共用账号和孩子档案，但语文与英语数据、离线队列、事件验证、导入和云端进度独立。用户 SHALL 仅访问自己拥有的孩子。冲突 SHALL 明确提供本地或云端继续位置选择，待同步答案不能丢失。

#### Scenario: Concurrent subject updates
- **WHEN** 两台设备分别更新同一孩子的英语和语文，随后导出家庭学习记录
- **THEN** 两科记录分别保存并出现在导出结果，不互相计入掌握或完成次数

### Requirement: Three-device usability and private sources

系统 SHALL 在320px手机、触控平板横竖屏和电脑可读可操作，无横向溢出、隐藏操作或模态遮挡；原始照片中的姓名、课表和批注 MUST 不发布。

#### Scenario: Mobile learning
- **WHEN** 孩子用320px手机完成阅读、错答、提示、重试和保存返回
- **THEN** 正文和关键操作完整可见，触控控件至少44px，错误反馈可读，进度可恢复
