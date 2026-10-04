# 记忆花园实施记录

## 已实现并验证

- 基于新拉取的 origin/main c736cd4，独立 feat/memory-garden 工作区；父工作区用户未跟踪文件未动。
- 200关、配对/错配/观察/暂停规则，钱包、礼包一次领取、四项商品、指定锁关确认解锁、首次结算和当前牌局恢复。
- 本地Three.js软陶模型、倒角实体卡片、五主题光照和场景、共享材质和按可见范围模型缓存；不使用远程CDN或图片假3D。
- 最终 `npm run test:memory` 全通过：18项单元（core/profile/audio/models/assets）+6项原生浏览器。涵盖第1关通关与重玩不重复奖励、第200关796张总览（0与795可见）和拖动/追加/查看/暂停恢复、游戏厅及6种屏幕布局、实际AudioContext暂停/静音、五主题夜景文字可读、暂停真实canvas像素不变。通关后blur也验证音频暂停。
- 最终完整单元门禁610/610通过（77秒），新增真实模型几何测试确保后期编号在厚卡面之上、字高可读。
- 独立审查发现并复现：暂停商店购买重启音乐、总览相机角点低于桌面导致崩溃；已修复。另修复提示条遮挡暂停按钮、零计时损坏存档锁牌、音频异步恢复留下闲置调度器、翻牌后残留模型阴影。相关测试均先失败再通过。
- 审查原生触屏连续20次拖动抵达第200关末行，不误翻牌，几何资源无持续增长。最终fix独立复核已通过，390×844、1440×900、568×320均验证总览两端可见，审查结论Ready to merge。
- 亲看最终桌面主页、手机胜利、第200关和月光主题截图；修复月光HUD暗字对比，以及后期编号被厚卡面埋没的问题，后期数字改为更大的深绿色立体字，已确认手机实图可读。修复卡面下的配对光圈、暂停仍推进翻牌/光圈、结算页失焦不停止音乐。最终日志 `/tmp/memory-garden-final-complete.log`，每项行为先复现失败后通过。软件Chromium并不作为真手机GPU帧率测量。

## 当前实际进程与下一步

- 全项目浏览器门禁首次在纸片领地的旧目录数12断言处失败；已将目录数量与真实catalog对齐，此项9/9通过。原有赛车浏览器文件180秒超时，在未修改的c736cd4基线工作区再次180秒超时，确认非新游戏变更导致。仅将此项软件渲染超时预算调整至300秒，原生操作断言保持，194.8秒完成并通过，日志 `/tmp/memory-garden-racing-final.log`。其余链按顺序继续，已通过赛车世界/景观和跑酷两个文件（9+3项），当前赛车材质专项。
- 另修正已有parkour/rescue集成测试过时目录数和rescue旧资源URL断言，保留游戏内12关等原有逻辑。
- 具体发布阻塞：rescue-online-browser第1项在松开KeyD后等待vx===0失败，feature连续两次复现；未改动的c736cd4基线再次同一断言失败，日志 `/tmp/memory-garden-rescue-online-baseline.log`。rescue生产模块与基线完全一致，没有为通过门禁修改旧玩法或删断言。其他5项联网测试通过，但完整浏览器门禁尚未全绿。
- 已通过async问题请求用户选择：先单独发布记忆游戏并保持松鼠现状，或扩展任务先修松鼠再一起发布。不得自行改变旧游戏逻辑，也不应把全量门禁报告为通过。
- 下一步：最终源码独立复核后保存独立分支提交；等待用户部署取舍，按选择走main webhook发布，再做公网原生验收与资源哈希回读。若未收到选择，保留产物与记录，不报告已部署。
- 最终源码独立审查已再次给出Ready to merge，18项单元+6项浏览器全部通过；通关后blur音频检查用实际AudioContext与合成blur事件，不称作原生窗口失焦操作。生成bundle包含上游GLSL字符串空白，`.gitattributes`仅为 `memory/bundle.js`关闭格式空白检查，保留原始esbuild产物，不修改着色器字符串。
- 独立分支已提交：`cb8e1a6`新增记忆花园，`834c634`保留既有rescue/english打包文件属性并追加memory专用属性。当前工作区干净，父工作区7个用户未跟踪文件保持原样。
- 用户已要求立即上线记忆游戏，本次发布接受此前已复现于旧主分支的松鼠联网测试失败，不将完整浏览器门禁宣称为通过。
- 发布前获取最新main `20961de`（独立松鼠动作修复PR #53）并合并，未覆盖新的松鼠代码。重新构建memory bundle无差异；memory规则/资源、目录及新main的松鼠预测单元共45项通过。
- v1已通过PR #54部署，main为 `97ea5d3`；两个域名资源SHA一致，18项单元及6项公网浏览器验收通过。旧联网服务PID保持不变。

## 验证命令

`npm run build:memory`；`node --test tests/memory-core.test.mjs tests/memory-profile.test.mjs tests/memory-audio.test.mjs tests/memory-assets.test.mjs tests/game-hall.test.mjs`；`node --test tests/memory-browser.mjs`；`npm run test:unit`；`npm run test:browser`。

截图：`/tmp/memory-garden-desktop-home.png`、`/tmp/memory-garden-phone-win.png`、`/tmp/memory-garden-phone-large.png`、`/tmp/memory-garden-phone-moon.png`。全单元门禁610项日志：`/tmp/memory-garden-unit-final-610.log`（之后追加光圈几何1项，最终memory18项均通过，不冒称再次运行整个611项门禁）。前半浏览器链日志：`/tmp/memory-garden-browser-gate.log`；后半链session 33109在rescue-online失败后已退出（此前territory全部、赛车世界/景观/材质、跑酷9+3项、松鼠17+2项通过）；后续9个文件未运行。原赛车独立补验：`/tmp/memory-garden-racing-final.log`通过。最终记忆验收session 58515已退出0，全部通过；没有未披露的后台发布进程。

最终发布资源SHA256：bundle `a947f0642f6c279ce1fca023b7f012b00f5dbec989214e32680e4f93ef1c4b29`；CSS `f23a868a9c754e6257ad4153193f98ea9a3fc8a8ce2233b0e62f16072b718b5e`；HTML `b64f700655e6726779d8e499132e965ab5465c74b19488c51f162fec55839cdd`。

## v2 上线反馈：渐进小牌与返回游戏厅

- 基于最新main `97ea5d3`，独立分支 `fix/memory-card-density`。用户要求越往后牌逐渐小，但不能小到难以点击，并增加明确返回游戏厅按钮。沿用已确认自动实施与部署，不改其他游戏。
- 原生红测复现旧尺寸91.89/72/72px，第20与200关不再缩小；返回入口仅显示游戏名，标签断言失败。修改默认镜头为实际牌数驱动90→56px，长牌桌首行定位到HUD下方；原世界坐标、索引、核心规则与存档结构不变。过小总览点按先定位，再次点选翻牌。页头改成明确返回游戏厅按钮，pagehide保存旧牌局。
- 本地原生绿测：第1/20/200关牌宽90/70.76/56px，可操作区域4/15/24张；平板56px、第40关恢复90px，总览点按定位不翻牌而二次点按选中第600张。返回游戏厅并继续保留已选卡和金币。两个新用例通过；密度173秒、返回44秒。测试机并行SwiftShader负载约25，延长浏览器时间预算，未删改行为断言；尺寸观察用真实渲染帧，不必等无关开局预览结束。
- `npm run build:memory`、19项相关单元、OpenSpec严格验证及diff空白检查通过。独立代码审查两轮无阻挡问题，覆盖四种视窗射线和起始视野。实际截图 `/tmp/memory-garden-phone-density.png`已亲看。
- 当前待推送PR、既有webhook发布及公网原生复验。完整旧浏览器门禁例外沿用v1的已批准范围，不声明全项目门禁全绿。
