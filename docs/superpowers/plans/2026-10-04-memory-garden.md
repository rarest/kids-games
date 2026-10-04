# 记忆花园 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付200关真实3D记忆配对、金币装备、可恢复牌局与跨设备大牌桌。

**Architecture:** 纯core规则与profile存档分离，Three.js场景仅绘制可见卡面模型；game连接DOM真实输入和事务，audio本地合成音乐。新增memory目录，不改现有游戏运行模块。

**Tech Stack:** JavaScript ES modules、Three.js 0.186.1、esbuild、Node test、CDP浏览器实测。

**Spec:** openspec/changes/memory-garden/specs/memory-garden/spec.md及design.md。

## Global Constraints

- 200关，1/39/40/41/200关分别2/78/2/80/398对；后期卡不缩小至不可点击。
- 全部3D卡牌和图案为实体，普通物体不持续粒子；按钮至少48px，本地资源，无新增生产依赖。
- 500金币一次查看、1000金币八次查看、1500金币随机炸一对、100金币增加两对；新手1000金币/两份加牌/一份查看，一次领取。
- 通关下一关开放、指定关100金币解锁；首次完成100金币，仅一次。
- 预览5秒，错配1秒盖回；后台暂停；消费和牌局一起保存。

### Task 1: 纯规则与钱包

**Files:** memory/core.js、memory/profile.js、tests/memory-core.test.mjs、tests/memory-profile.test.mjs。

**Interfaces:** createGame(level,rng)返回含cards/phase/selected/remaining/elapsed/moves的牌局；advance(game,seconds)、flip(game,index)、useItem(game,kind,rng)返回事件；createProfile()、readProfile(raw)、purchase(profile,sku)、unlockLevel(profile,level)、completeLevel(profile,game)、consume(profile,game,kind)修改有效状态并返回结果。

- [ ] 写测试：数量边界fixture [[1,2],[39,78],[40,2],[41,80],[200,398]]；`assert.equal(flip(g,0).type,'ignored')`在预览期间；预览结束匹配返回match，错配期间第三张ignored。
- [ ] 运行上述两个测试文件，确认行为缺失RED；实现纯规则与钱包；再运行至GREEN。
- [ ] 覆盖追加牌保留旧identity/坐标索引、随机炸完整一对最后通关、暂停不计时、消费拒绝不扣费、重复首次奖励不发、重载礼包不重发、非法存档恢复。

### Task 2: 可用3D牌桌

**Files:** memory/models.js、memory/scene.js、tests/memory-browser.mjs。

**Interfaces:** createScene(canvas)返回setGame(game)、render(game,seconds)、pick(clientX,clientY)、pan(dx,dy)、reset()、overview()、stats()；shared模型构建器创建软陶物体和数字几何。

- [ ] 浏览器测试先请求games/memory.html，断言body.dataset.ready等于true，并通过原生点击开始、两次选牌得到match；确认页面缺失RED。
- [ ] 建立正交俯视牌桌、可见范围model池、共享倒角卡体/底面实例、阴影、五主题环境。使用软陶立体花朵/小兔/水果/星/月/贝壳，不生成2D图案贴脸。
- [ ] 提供第200关触控拖动后新可见牌、总览和复位；验证拖动不翻牌，点击位置与实际3D牌相符；截图亲看，检查geometries/materials无持续增长。

### Task 3: UI和持久交互

**Files:** games/memory.html、memory/style.css、memory/game.js、memory/audio.js、memory/THIRD-PARTY-NOTICES.txt、package.json、games.js、README.md。

**Interfaces:** HTML提供home、levels、shop、play、result区域；存档key memory-garden-v1。UI仅消费core/profile接口，不重复实现金币逻辑。

- [ ] 浏览器写钱包购买、锁关确认解锁、开始继续、后台暂停、320/390/820/1440布局测试；先RED，再实现真实事件。
- [ ] 音频在用户手势恢复AudioContext，所有声音通过共享gain静音，暂停/后台suspend；旋律长句不使用短音频循环。状态变化同步localStorage，失败显示保存失败。
- [ ] 增加目录项、build:memory与test:memory，提交本地bundle及许可证；目录断言用实际catalog数量，保留原游戏身份集合。

### Task 4: 完整验收

**Files:** tests/game-hall.test.mjs及已有目录数相关浏览器测试、OpenSpec tasks.md、实施记录docs/superpowers/plans/2026-10-04-memory-garden-progress.md。

- [ ] `npm run build:memory`，`npm run test:unit`，`node --test tests/memory-browser.mjs`，`npm run test:browser`。
- [ ] 在手机和桌面截图核对造型/阴影/卡面可读，测试重载钱包、重复通关、道具消耗、796张牌访问与资源稳定。
- [ ] `git diff --check`、OpenSpec严格验证，记录通过和失败，勾选仅实际完成任务；保留用户其他修改和线上游戏。
