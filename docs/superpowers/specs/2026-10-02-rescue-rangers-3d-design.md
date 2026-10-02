# 松鼠大战 1：3D 横版重制设计

用户已在 2026-10-02 确认开始，授权完整实现、接入 games.nblord.com 和上线验收。交付是可从开头玩到结局的游戏。

## 玩法与内容

- 保留横版移动和跳跃，以真正的三维模型、材质、光照渲染，镜头跟随两名玩家；角色活动平面为 x/y，z 为美术厚度。
- 11 个独立区域：0 街区/电线杆/实验室、A 大树攀登、B 巨型餐厅/水槽、C 书房/吊扇、D 玩具工厂、E 河岸/水闸、F 工厂运输/升降井、G 餐厅/赌场、H 下水道/管道攀登、I 办公室/电话、J 肥猫工厂/传送带。区域依据实机地图逐段重建，不能用同一地形模板换配色凑关数。
- 分支：0→A 或 B，A→C，C/B→D，D→E 或 F，E→F，F→G→H→I→J。完成的可选关仍可回玩。J 通关后显示救援结局和全区域记录。
- Boss：0 多臂机器人、A 猫头鹰、B 外星飞船、D 玩具机器人、E 电鱼、G 赌场猫、I 分段毛虫、J 肥猫。C/F/H 为路线与机关关。每个 Boss 有独立攻击，球可拾回再次攻击。
- 基本交互：木箱、金属箱、苹果、球；举起、横投/上投、蹲藏、向下穿过单向平台、堆箱；大箱用投掷打开。双人能举起和扔队友，不形成互相持有的环。木箱命中消失，金属箱/球可再次拾取；苹果较重。
- 敌人包括机械狗、鸟、毛虫、鼠/袋鼠、拟态箱、玩具、蜜蜂、犀牛、螃蟹、蜥蜴和鹈鹕。巡逻、扑击、飞行、发射及反弹至少按类别区别。
- 三颗心、生命、伤后无敌、掉落重生/游戏结束、花/星收集、橡果回血、Zipper 限时保护、通关奖励房。花每 50 朵获得一星，星每 10 颗增加一命。
- 选择单人/本地双人，单人可选奇奇/蒂蒂。两个 USB/蓝牙标准手柄分别绑定两个角色，支持双人键盘与手机单人触控。默认无网络合作。

## 美术与性能

- 奇奇：棕色条纹花栗鼠、软帽、短外套；蒂蒂：红鼻子、花衬衫。使用平滑有厚度的脸、耳、眼、鼻、尾、手脚和关节动画；举箱时有明确姿势。敌人/Boss 的三维轮廓必须可辨。
- 放大日常环境形成小动物视角：盆栽、垃圾桶、电线杆、树枝树叶、餐具、水槽、书架、玩具、齿轮、管道、办公室、输送带。主题需要独立三维景物和材质，不只有背景颜色变化。
- 木纹、砖、金属、布料、叶片、柔和阴影/环境光、接触阴影、景深层次。高/自动/流畅画质；自动依据帧时降低分辨率和阴影。重复场景物件实例化，只维护有限粒子。
- 固定 Three.js 0.186.1，本地 esbuild 打包，不依赖外部 CDN。模型与音效采用本项目新制作资源；原版地图截图只作为私有核对资料，不随游戏发布。
- 目标在支持 WebGL 2 的手机、平板、电脑浏览器可操作，宽窄横竖屏都能看见关键控制；触控按钮至少 48px。软件渲染证据不作为真实手机帧率声明。

## 模块契约

- `rescue/levels.js`: `LEVELS` 按 0,A…J 排序；`getLevel(id)` 返回独立关卡；`nextLevels(id)` 返回上述路线。关卡含 `id,name,theme,width,height,spawn,platforms,objects,enemies,hazards,decor,exit,boss,checkpoints,reference`。平台 `{id,x,y,w,h,kind,oneWay,...}` 的 y 是顶面，玩家 x/y 是身体底部中心；地图单位是 16 原版像素。
- `rescue/core.js`: `createGame(level, {players=1,character='chip',campaign=null}={})`，`stepGame(state, inputs, dt)` 原地推进，`setPaused(state,bool)`，`restartLevel(state)`，`snapshot(state)` 返回适合 HUD/诊断的副本。dt 上限 1/30，内部固定子步 1/120；inputs 为每位玩家的 `{move,jump,action,up,down}`。时间推进使用 seconds。
- `state`: `level,players,objects,enemies,hazards,boss,projectiles,effects,events,time,paused,status,score,flowers,stars,completed,checkpoint`。status 为 playing/bonus/cleared/gameover。player 至少含 `id,character,x,y,vx,vy,w,h,facing,hearts,lives,grounded,carrying,heldBy,hidden,invulnerable,stun,animation`。entity id 稳定。所有动态实体 position 都用底部中心。
- carrying 为 `null` 或 `{type:'object'|'player',id}`；heldBy 为 null 或 player id。对象 `kind` 是 crate/metal/apple/ball/bigcrate，物品另用 `contents`。hazard.kind 是 spike/water/electric/press/faucet；platform.kind 可含 conveyor/moving。
- `rescue/scene.js`: `createScene(canvas)` 返回 `setLevel(level), update(state,dt), resize(width,height), setQuality(mode), diagnostics(), dispose()`。`rescue/avatar.js` 返回可动画 group；`scenery.js` 与 `materials.js` 服务 scene，不能更改物理状态。
- `rescue/controls.js`: `createControls({target=window,players=1,gamepads,onPause,capture,joystick,jump,action})` 返回 `sample(),clear(),setPlayers(n),dispose(),bindings`；`bindings` 是稳定手柄 index 的只读副本。正常外部事件边界支持注入 target/Gamepad provider；手柄断开/失焦/暂停清除输入，同一次按钮保持不重复触发 action。
- `rescue/audio.js`: `createAudio(options)` 返回 `unlock(),setOptions(options),setActive(bool),consume(state),diagnostics(),dispose()`，用户手势后启用浏览器合成旋律与事件音效。`consume(state)` 根据真实 game 对象身份重置事件游标，并根据真实 theme 更新音乐；音乐与音效可分别设置。暂停、隐藏和离页停止声音；通关事件须得到一次正常播放。
- `rescue/profile.js`: `createProfile(storage?)` 返回 `load(),save(profile),error`；`save` 返回明确的成功或失败结果。profile 持久化当前分支、完成区域、独立 `bestScore`、区域入口 run、角色/模式、声音/画质；无效存档恢复默认，存储不可用给可见说明。
- `rescue/game.js`: 主循环、首页/地图/教程/奖励/结局 UI，与上述模块协调；实机输入驱动纯模拟，DOM 诊断只展示真实状态，不提供测试专用作弊功能。

## 验收与发布

核心规则用真实模拟 fixture 先写失败测试。11 关有独立地图结构与可走通的静态路线，8 Boss 能依照球攻击规则被击败；分支通向结局，奖励房实际可玩。浏览器通过真实键鼠/触屏验证移动、拾取、投掷、双人各自输入、隐藏/伤害、暂停/恢复、地图解锁、进度保存；标准手柄适配可用真实 API 数据 fixture 验证，实物设备没有连接时明示没有实物验收。

检查三维截图（首页、首关、各区域、Boss）、六种尺寸、资源切换不累积。接入 `games/rescue.html` 和 `games.js`。按仓库要求运行 `npm run test:unit`、`npm run test:browser`，构建 bundle 并核对 SHA，独立审查通过后走原 GitHub→webhook 部署，在公共域名复查游戏厅点击、真实游戏操作、资源版本及存档。

## 参考

- 原版全部区域和地图：https://www.vgmaps.com/Atlas/NES/#ChipNDaleRescueRangers；下载的私有核对截图在 `/tmp/rescue-reference/`，文件 `Chip'NDale-RescueRangers-Area0.png` 与 AreaA…AreaJ.png。
- 实机流程：https://www.youtube.com/watch?v=WpVPJjhKEA8。
- 控制与物品：Capcom 原版说明书 https://www.digitpress.com/library/manuals/nes/Disney%20Chip%20%27n%20Dale%20Rescue%20Rangers.pdf。
- 现有部署基线 origin/main `323c2a9bcb2f2c9ab75cb050390464fe9f574866`，现有 11 款游戏均保留。
