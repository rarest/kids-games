# 樱花跑酷自创关卡 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 可直接玩的多条永久自创路线、无旧数量限制、道具/金币购买/庆祝和返回游戏厅。
**Architecture:** 原跑酷引擎扩展路线模型，多作品本机存档与账号私有路线CAS分离；UI单一保存动作本机优先和异步账号备份。
**Tech Stack:** ES modules, Three.js, Node tests, Chromium CDP, PostgreSQL, esbuild。
**Spec:** docs/superpowers/specs/2026-10-07-parkour-creations-design.md。

## Global Constraints

- 一个保存按钮，无保存方式选择；多作品稳定ID不覆盖。旧金币/衣服/路线保留。
- 无平台80/金币160/存档点80等固定数量上限；不截断。至少1000平台正常保存恢复。
- 48px触控；手机/平板横竖屏/桌面无横向溢出。
- 自创已保存路线真实通关后本局金币一次入账现有商店；未完成/未保存试玩不付，新的闯关可重新领取。
- 加速1.6倍/高跳1.5倍，8秒游戏时间；暂停冻结，掉落清除，同类刷新不叠加。
- 账号私有库所有权、Origin、CAS；传输8MiB，无对象个数上限；离线保留，不自动删除路线。
- 不改其他游戏运行时和三科业务；保持最新main并发更新。

### Task 1: 路线、作品库、道具与通关入账模型

**Files:** parkour/editor.js, parkour/route-library.js(new), parkour/core.js, parkour/profile.js; tests/parkour-editor.test.mjs, parkour-core.test.mjs, parkour-profile.test.mjs, parkour-route-library.test.mjs(new)。
**Interfaces:** validateLevel(raw)->{ok,errors,level}保持既有字段并新增powerups:[{id,type:'speed'|'jump',x,y,z}]，缺省[]；createEditorLevel仍返回两平台示例，id custom。createRouteLibrary(raw)->{version:1,nextNumber,routes:[{id(UUID),name,level,revision,updatedAt,dirty}],draft:null|raw}。readRouteLibrary(storage,key='glow-parkour-routes-v1')->library；writeRouteLibrary(storage,library,key)->boolean；saveRoute(library,level,{id?,now=Date.now()}={})->route|null，默认名自创路线一/二/三，显式id更新，否则分配UUID和单调编号；成功保存的level.id=route.id且custom=true。底层函数纯数据，不暴露UI或云API。read自动迁移旧glow-parkour-level-v1一次，不删旧key。draft可空平台但非保存关卡，独立有效性区分。

- [ ] 写明确RED：1000平台/200金币/100存档可校验；两个saveRoute产生不同id和自创路线一/二，重读仍两份；旧单槽迁移只一次、不改钱包；写失败旧snapshot不变。例：`assert.equal(validateLevel({...base,platforms:make1000()}).ok,true)`，make1000用独立合法平台坐标/id。
- [ ] 添加powerups支持校验；取消固定数量max，finite范围x/z拓宽到±100000，其余物理尺寸保留；唯一ID、支撑、非法type仍拒绝。实现作品库事务式序列化：存储失败不得先标已保存；只有有效level进入routes，draft可以不完整。
- [ ] 道具真实stepState触碰pickup后持续8秒模拟时间，speed/jump倍率由effects保存，效果过期/掉落清理；用真实物理比较相同输入移动距离/跳跃高度、冻结不step及到期。避免每子步全数组Math.min(...spread)，缓存fall基线不改变预设物理。
- [ ] creditCoin原预设不变。新增`creditCustomFinish(profile,state,{saved=false}={}) -> number`，合法已保存custom/state.complete/本局collected中的真实coin IDs、一次receipt、余额safeInteger；未完成/未保存/重复0，新state可再领。recordFinish为已保存custom保存bestTime但不让草稿伪造预设身份；createProfile保留合法UUID custom进度。单元实际购买skin/outfit验证金额，不只查return。
- [ ] 运行全部parkour unit，保留原预设12关/存储断言；自审、仅任务文件提交并写报告。

### Task 2: 私有账号路线持久化

**Files:** platform/parkour-routes.mjs(new), platform/migrations/004-parkour-routes.sql(new), platform/family-store.mjs, platform/server.mjs, deploy/deploy-local.sh; tests/parkour-routes-api.test.mjs(new), family-store tests if export扩展。
**Interfaces:** `ParkourRoutes({pool})` with migrate(),list(owner)->{routes:[{id,name,revision,updatedAt}]},get(owner,id)->{id,revision,level,updatedAt},put(owner,id,{baseRevision,level})->same,delete(owner,id,{baseRevision})->{deleted:true}。GET /api/family/parkour/routes metadata；GET/PUT/DELETE /api/family/parkour/routes/:uuid；首次PUT baseRevision0，已存递增，冲突409 current同get形状；他人不存在返回404。复用Task1 validateLevel，但level.id强制等于URL ID。单JSON8MiB、PostgreSQLJSONB文本安全边界16MiB，禁止无限body但不截断对象。

- [ ] RED真实PG/API：未登录401、其他owner404、坏origin403、有效1000平台保存读回完整、CAS409不覆盖、相同id可属于不同owner、非法level400、大body413、迁移重跑保留、删除账号CASCADE。使用独立schema，不生产DB。
- [ ] 加表迁移外键family_user ON DELETE CASCADE/复合PK(owner,id)，revision非负、levelJSONB。用事务/原子INSERT/UPDATE锁保护同routeCAS；DELETE需当前revision，0行区分不存在/冲突。没有作品数上限，不修改学习codec和003。
- [ ] server在现有family已认证/Origin gate内路由调用；familyStore.migrate调用新表迁移（可直接new ParkourRoutes(pool).migrate），exportAccount追加parkourRoutes且原progress三科不变。若删除family_user自动cascade；deletedprofile不影响账号自己的路线。
- [ ] deploy platform指纹增加parkour/editor.js与route-library.js（若backend未用library则仅editor）保证新校验部署生效，不动3个game运行时。单元/真实PG/相关auth API和deploy检查通过，提交及完整报告。

### Task 3: 一个保存按钮与可玩的关卡/庆祝/返回

**Files:** parkour/editor-ui.js, parkour/game.js, parkour/scene.js, parkour/audio.js, parkour/family-routes.js(new), parkour/celebration.js(new), parkour/style.css, games/parkour.html, shared/account.js(return链接必要最小修改), tests/parkour-creations-browser.mjs(new), parkour browser旧规则断言及family cloud tests。
**Consumes:** Task1作品库/真实奖励和powerup模型；Task2 GETlist/GETid/PUTid CAS API。`createFamilyRoutes({storage,onChange,onStatus})` scopeowner/null,ready(),save(route),refresh(),flush(),dispose();按owner独立本机cache key，失效身份回guest和epoch，离线dirty持久队列，PUT409保留云原版并将本机编辑成新UUID副本，不问保存方式；getScopeKey()供UI选库。只在明确保存当前路线时加入账号，不自动上传全部旧guest。函数签名可在实现报告明确实际返回，不添加通用框架。

- [ ] native RED：菜单没有hall-return命名按钮/第二savedroute/双点删空/81以上/加速高跳/通关真金币庆祝；实际CDP mouse/touch，两browser真PG；不靠修改state伪造通关或production测试API。旧有限制或自创不付的旧期待按本规范更正，但保留独立预设规则断言。
- [ ] 编辑器加清空确认、删除最后平台允许空草稿、鼠标dblclick和手机连续双tap同一平台删除；不能单击平台添加/选中时误删除。删附着powerups/coins/checkpoints，起终点无支撑需重新放。坐标允许新范围。双tap不能因首tap执行工具插入重复删其他platform；拖动不能当双tap。
- [ ] 一个保存：新草稿save新增稳定作品，编辑选中作品save更新本版，new按钮新草稿（不是新的保存方式）。先写本机失败保留草稿和旧作品；账号保存异步显示已同步/等待备份，不谎称云成功。旧单槽自动迁移一次。关卡列表在12预设后显示所有已保存自创路线，有编辑入口，关卡选玩不要回到错误草稿；新版name插入DOM必须escapeHTML。保存/返回刷新可恢复草稿，清空不清作品库和钱包。
- [ ] 本局实际通关调用creditCustomFinish一次再原saveAppearance事务（失败回滚余额，重试仍可领而非永久丢receipt）；真实金币购买至少一件付费skin或outfit。已保存UUID判定不可只信custom flag，未保存试玩不发。custom finish/quit回关卡列表，可单独编辑当前作品。12预设继续不变。
- [ ] scene绘制有区分的加速/高跳物件与效果状态；保留现有platformBatch instancing，避免巨大数组spread。庆祝有限3秒烟花（CSS/canvas/原3D任选不新增依赖）和三音登登登，静音/减少动画遵守、离开cleanup；暂停不能提前停止庆祝声音。
- [ ] home/editor/pause/completion明确hall-return链接/按钮48px可触达，不能只用原brand微光跑酷暗示；离开先保存草稿，平台空时也可回。账号入口登录完成可回跑酷（仅校验固定parkour返回，不开放redirect），并保留原classroom默认。
- [ ] build:parkour更新HTML/CSS资源cache token；全旧parkour浏览器+新native/真PG，320/390/820/1440横竖屏、无泄漏、draw真实、触摸命中、backhall目录实际加载。提交、自审并写报告。

### Task 4: 审查与实际发布

**Files:** docs交付记录与本plancheckbox。

- [ ] 独立wholebranch review及必要scoped fix，检查所有规范规则；项目必需unit/browser全命令真实执行。已有未变软件WebGL时序问题以实际当前基线证据区分，不放松断言或改其他游戏。
- [ ] fresh fetch保护并发main，PR/main合并既有webhook部署。只有功能/真实用户路径验证完成才声明完成。
- [ ] 公网HTML/bundle/CSS/sourceAPI版本与服务器HEAD一致，其他游戏PID不变；真实native新建保存两条、重载关卡选玩、通关买外观、双点删除/清空/道具/庆祝/回厅、账号另一browser找回及临时账号删除。
- [ ] 持久真实验收、所有rulings与未解决问题，最后输出链接；只清本plan scratch（可恢复归档），用户7个原untracked与别任务工作区保留。
