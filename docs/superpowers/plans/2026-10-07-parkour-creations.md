# 樱花跑酷自创关卡 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 可直接玩的多条永久自创路线、无旧数量限制、道具/金币购买/庆祝和返回游戏厅。
**Architecture:** 原跑酷引擎扩展路线模型，多作品本机存档与草稿隔离；UI单一保存动作，直接选玩，不依赖登录或网络。
**Tech Stack:** ES modules, Three.js, Node tests, Chromium CDP, esbuild。
**Spec:** docs/superpowers/specs/2026-10-07-parkour-creations-design.md。

## Global Constraints

- 一个保存按钮，无保存方式选择；多作品稳定ID不覆盖。旧金币/衣服/路线保留。
- 无平台80/金币160/存档点80等固定数量上限；不截断。至少1000平台正常保存恢复。
- 48px触控；手机/平板横竖屏/桌面无横向溢出。
- 自创已保存路线真实通关后本局金币一次入账现有商店；未完成/未保存试玩不付，新的闯关可重新领取。
- 加速1.6倍/高跳1.5倍，8秒游戏时间；暂停冻结，掉落清除，同类刷新不叠加。
- 无登录、账号、云备份或新增API；本机刷新/关闭/版本更新保留作品，不自动删除。存储失败保留旧作品和编辑内容。
- 不改其他游戏运行时和三科业务；保持最新main并发更新。

### Task 1: 路线、作品库、道具与通关入账模型

**Files:** parkour/editor.js, parkour/route-library.js(new), parkour/core.js, parkour/profile.js; tests/parkour-editor.test.mjs, parkour-core.test.mjs, parkour-profile.test.mjs, parkour-route-library.test.mjs(new)。
**Interfaces:** validateLevel(raw)->{ok,errors,level}保持既有字段并新增powerups:[{id,type:'speed'|'jump',x,y,z}]，缺省[]；createEditorLevel仍返回两平台示例，id custom。createRouteLibrary(raw)->{version:1,nextNumber,routes:[{id(UUID),name,level,updatedAt}],draft:null|raw}。readRouteLibrary(storage,key='glow-parkour-routes-v1')->library；writeRouteLibrary(storage,library,key)->boolean；saveRoute(library,level,{id?,now=Date.now()}={})->route|null，默认名自创路线一/二/三，显式id更新，否则分配UUID和单调编号；成功保存的level.id=route.id且custom=true。saveRoute可修改传入的暂存副本，UI须先clone库、save、write成功后才替换当前库，避免失败污染。底层函数纯数据，不暴露UI或云API。read自动迁移旧glow-parkour-level-v1一次，不删旧key；迁移写失败仍保留旧key可重试。draft可空平台但非保存关卡，独立有效性区分。

- [x] 写明确RED：1000平台/200金币/100存档可校验；两个saveRoute产生不同id和自创路线一/二，重读仍两份；旧单槽迁移只一次、不改钱包；写失败旧snapshot不变。例：`assert.equal(validateLevel({...base,platforms:make1000()}).ok,true)`，make1000用独立合法平台坐标/id。
- [x] 添加powerups支持校验；取消固定数量max，finite范围x/z拓宽到±100000，其余物理尺寸保留；唯一ID、支撑、非法type仍拒绝。实现作品库事务式序列化：存储失败不得先标已保存；只有有效level进入routes，draft可以不完整。
- [x] 道具真实stepState触碰pickup后持续8秒模拟时间，speed/jump倍率由effects保存，效果过期/掉落清理；用真实物理比较相同输入移动距离/跳跃高度、冻结不step及到期。避免每子步全数组Math.min(...spread)，缓存fall基线不改变预设物理。
- [x] creditCoin原预设不变。新增`creditCustomFinish(profile,state,{saved=false}={}) -> number`，合法已保存custom/state.complete/本局collected中的真实coin IDs、一次receipt、余额safeInteger；未完成/未保存/重复0，新state可再领。recordFinish为已保存custom保存bestTime但不让草稿伪造预设身份；createProfile保留合法UUID custom进度。单元实际购买skin/outfit验证金额，不只查return。
- [x] 运行全部parkour unit，保留原预设12关/存储断言；自审、仅任务文件提交并写报告。

### Task 2: 一个保存按钮与可玩的关卡/庆祝/返回

**Files:** parkour/editor-ui.js, parkour/game.js, parkour/scene.js, parkour/scenery.js(仅大数组边界归约), parkour/audio.js, parkour/celebration.js(new), parkour/style.css, parkour/bundle.js(build), games/parkour.html, tests/parkour-creations-browser.mjs(new), parkour browser旧规则断言。
**Consumes:** Task1作品库/真实奖励和powerup模型；本机存储，无账号接口。UI先暂存副本，写成功才公布已保存作品；存储异常仍可编辑当前草稿。不得修改platform、shared/account.js或引入登录流程。

- [x] native RED：菜单没有hall-return命名按钮/第二savedroute/双点删空/81以上/加速高跳/通关真金币庆祝；实际CDP mouse/touch，无登录；不靠修改state伪造通关或production测试API。旧有限制或自创不付的旧期待按本规范更正，但保留独立预设规则断言。
- [x] 编辑器加清空确认、删除最后平台允许空草稿、鼠标dblclick和手机连续双tap同一平台删除；不能单击平台添加/选中时误删除。删附着powerups/coins/checkpoints，起终点无支撑需重新放。坐标允许新范围。双tap不能因首tap执行工具插入重复删其他platform；拖动不能当双tap。
- [x] 一个保存：新草稿save新增稳定作品，编辑选中作品save更新本版，new按钮新草稿（不是新的保存方式）。先写本机失败保留草稿和旧作品，不谎报成功。旧单槽自动迁移一次。关卡列表在12预设后显示所有已保存自创路线，有编辑入口，关卡选玩不要回到错误草稿；新版name插入DOM必须escapeHTML。保存/返回刷新可恢复草稿，清空不清作品库和钱包。
- [x] 本局实际通关调用creditCustomFinish一次再原saveAppearance事务（失败回滚余额，重试仍可领而非永久丢receipt）；真实金币购买至少一件付费skin或outfit。已保存UUID判定不可只信custom flag，未保存试玩不发。custom finish/quit回关卡列表，可单独编辑当前作品。12预设继续不变。
- [x] scene绘制有区分的加速/高跳物件与效果状态；保留现有platformBatch instancing，避免巨大数组spread。庆祝有限3秒烟花（CSS/canvas/原3D任选不新增依赖）和三音登登登，静音/减少动画遵守、离开cleanup；暂停不能提前停止庆祝声音。
- [x] home/editor/pause/completion明确hall-return链接/按钮48px可触达，不能只用原brand微光跑酷暗示；离开先保存草稿，平台空时也可回。保存与游玩始终不要求登录。
- [x] build:parkour更新HTML/CSS资源cache token；全旧parkour浏览器+新native，320/390/820/1440横竖屏、无泄漏、draw真实、触摸命中、backhall目录实际加载。提交、自审并写报告。

### Task 3: 审查与实际发布

**Files:** docs交付记录与本plancheckbox。

- [ ] 独立wholebranch review及必要scoped fix，检查所有规范规则；项目必需unit/browser全命令真实执行。已有未变软件WebGL时序问题以实际当前基线证据区分，不放松断言或改其他游戏。
- [ ] fresh fetch保护并发main，PR/main合并既有webhook部署。只有功能/真实用户路径验证完成才声明完成。
- [ ] 公网HTML/bundle/CSS版本与服务器HEAD一致，其他游戏PID不变；真实native新建保存两条、重载关卡选玩、通关买外观、双点删除/清空/道具/庆祝/回厅，全程不登录。
- [ ] 持久真实验收、所有rulings与未解决问题，最后输出链接；只清本plan scratch（可恢复归档），用户7个原untracked与别任务工作区保留。
