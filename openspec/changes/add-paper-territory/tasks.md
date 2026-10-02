# 纸片领地 Implementation Plan

> 使用执行计划技能分任务实现与审查，用户已授权继续制作和部署，不重复索取阶段确认。

**Goal:** 上线可玩的第九款纸片围地游戏。
**Architecture:** 无 DOM 的纯规则引擎和皮肤存档模块，Canvas 渲染与输入页面消费状态；不引入依赖。
**Tech Stack:** ES modules、Canvas 2D、Node test、Chromium CDP。
**Spec:** openspec/changes/add-paper-territory/design.md 与 specs/paper-territory/spec.md。

## Global Constraints
- 普通 20 款、精致 20 款、隐藏 20 款；默认红色正方形，无笑脸。
- 电脑默认无须按住的鼠标目标跟随、到达/离开地图停止；手机大摇杆；键盘可用，所有输入遵守同一速度碰撞规则。
- 被切断只丢本次扩张，已拥有领地不清空；占满所有地图内格子才胜利。
- 不触碰 shooter/、其他游戏核心逻辑；不得覆盖并行修改。
- 不新增依赖；测试必须覆盖真实行为；手机、平板、电脑兼容。
- 不部署未验证代码。主代理负责发布，子代理不得启动浏览器或部署。

### Task 1: 纯规则引擎、随机地图、皮肤与存档
**Files:** Create territory/core.js, territory/profile.js, tests/territory-core.test.mjs, tests/territory-profile.test.mjs。
**Interfaces:** 核心导出 createGame({seed?,cols=44,rows=38,bots=3}={}), stepGame(game,dt,input={x:0,y:0}), movePlayer(game,id,x,y), finishRun(game), coverage(game,id)。状态含 cols/rows、mask (0/1)、owners (-1 无主, 0 玩家, 1.. 人机)、players [{id,x,y,trail,alive,color,name}]、mode='playing'|'paused'|'over'、winner=null|id、time、peak、events (有上限)，revision 底图修改计数，seed。可增加必要内部状态。坐标以格为单位连续位置。
profile 导出 SKINS 数组 60 项 ({id,name,tier,color,pattern,price,winsRequired,effect})、createProfile(raw?)、buySkin(profile,id)、equipSkin(profile,id)、settleRun(profile,game)。profile 含 coins,wins,owned,selected,settled；settleRun 不改地图只按一次有效结束局结算，并返回所得数值。每局唯一 runId。跨刷新安全、校验无效存档。渲染可按 pattern/effect 展示不同纸片，不要只设置不可见元数据。
- [ ] 先写测试并运行红灯：闭合 3x3 中心区域、不误占外部、切断保留所有原地盘、越界无效、长帧不穿轨迹、随机地图多种子连通且形状不同、电脑实际扩张、100% 胜利与零领地淘汰；60款数量、锁定不可买、扣款一次、已拥有装备、损坏存档、结算幂等。
- [ ] 实现核心。地图使用不规则连通 mask；角色连续移动子步进。闭合轨迹与领地内路径组成多边形（或等价正确算法），填充内部；真实边界与复杂轮廓测试。电脑规划合法闭合线路而非凭空占地。被切回剩余领地并短暂冷却，不返还被别人占领部分。胜者含电脑。
- [ ] 实现商店配置普通/精致/隐藏各20，正常皮肤不同彩色，精致纸纹，隐藏不同特效主题；默认价格20/60/100，隐藏胜场1..20，红色免费，初始0金币；结算 floor(peak*100) + 胜利50。
- [ ] 跑专属 node --test，修复，自检，提交本任务文件，写报告列 API 与测试结果。

### Task 2: 可玩页面、渲染、商店和游戏厅入口
**Files:** Create games/territory.html, territory/game.js, territory/render.js, territory/style.css, tests/territory-browser-smoke.mjs; Modify games.js, index.html 目录版本, package.json, tests/responsive-browser-smoke.mjs。
**Interfaces:** 消费 Task 1 导出，不复制核心规则或经济逻辑。浏览器通过语义 DOM 显示屏幕、百分比、人物位置，可用 data 属性帮助观测；不得留任意改金币的测试后门。
- [ ] 写并观察浏览器测试失败：主页/开始/商店三分类每类20、隐藏黑色锁定、初始红纸片、真实触摸摇杆移动/松手停/暂停不移动、鼠标不按键也跟随/到达停/移出停、键盘移动、退出只结算一次且刷新保存、横竖屏不溢出、游戏厅9入口。
- [ ] 制作精美纸艺岛屿：奶油纸背景、青蓝水面、柔和投影、折角纸片、占地色块、半透明同色条纹；精致纹理与隐藏受限动态特效。主页有开始与商店并列、清晰规则；商店20款/页可滚动，已买装备，锁定黑剪影；排名和占地%、提示消息、暂停结束结算、失败胜利界面。
- [ ] 页面布局适配手机/平板/电脑。电脑 mouse pointermove 映射画布位置为目标，方向归一化、最后一步距离钳制避免振荡；pointerleave停，键盘优先且清除目标。独立大摇杆至少112px，松手立停，8向自由移动，键盘/WASD，慢速默认。对多触控、pointercancel、后台失焦做清理。Canvas底图revision缓存、DPR和粒子封顶，不在帧循环写存档，RAF每页仅一条。
- [ ] 完成测试、截图目视检查，运行项目全部检查，通过独立审查后提交。

### Task 3: 发布与公网验收
- [ ] 合并授权范围内的改动，通过已有 webhook 发布。
- [ ] 公网 hash 比对与真实触摸浏览器新游戏流程通过，确认旧游戏入口仍在。
- [ ] 更新此任务记录，交付可点击链接与简明玩法。
