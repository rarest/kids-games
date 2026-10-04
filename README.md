# 🚀 小火箭游戏厅 (kids-games)

给小朋友的趣味网页游戏合集，适应手机、平板和电脑，无广告。单人游戏在浏览器计算；联网游戏使用各自的合作服务，部分游戏资源需要本地打包。

在线访问：https://games.nblord.com

## 记忆花园（200关3D配对）

入口 `games/memory.html`。鼠标或触屏点选翻牌，拖动浏览大牌桌；方向键移动选择、回车翻牌。开局观察5秒，错配1秒后盖回，全部配对通关；无全局时间限制。第1关2对，逐关加2对，第39关78对，第40关回到2对，第41关80对继续增加，第200关398对。五种花园主题使用本地Three.js的实际立体模型、柔和光照与阴影，普通物品不叠加持续特效。

每关首次通关奖励100金币并只开放下一关；100金币可提前开放一个指定关卡。商店：看一眼500金币、八次查看1000金币、随机消除一对1500金币、增加两对100金币。查看持续5秒；追加卡片不重排原牌，单局最多2000张。新手礼物一次性发放1000金币、增加两对×2、看一眼×1。装备、余额、关卡和当前牌局保存在当前浏览器，切到后台自动暂停，返回后手动继续。

源码位于 `memory/`，修改后执行 `npm run build:memory` 并提交生成的 `memory/bundle.js`。聚焦验收：`npm run test:memory`；公网检查可加前缀 `GAMES_TEST_ORIGIN=https://games.nblord.com`。资源许可见 `memory/THIRD-PARTY-NOTICES.txt`。

## 目录结构

```
index.html     合集落地页（数据驱动，读取 games.js 自动列出所有游戏，含搜索）
games.js       游戏目录清单 —— 新增游戏在这里加一行
games/         所有游戏的 HTML 入口
  ├─ rescue.html    🐿️ 松鼠大作战（11区域3D横版合作救援）
  ├─ parkour.html   🌸 微光跑酷（自由移动3D跑酷）
  ├─ racing.html    🏎️ 峰谷竞速（3D赛车）
  ├─ pinyin.html    🚀 拼音打字小火箭
  ├─ snake.html     🐍 贪吃蛇吃痘痘
  ├─ fish.html      🐟 大鱼吃小鱼
  ├─ fishing.html   🎣 捕鱼达人
  └─ goldminer.html ⛏️ 黄金矿工
deploy/        自动部署组件
```

## ➕ 加一个新游戏（两步）

1. 把游戏 HTML 放进 `games/`，例如 `games/math.html`
2. 在 `games.js` 里加一项：

   ```js
   { file: "games/math.html", emoji: "➗", name: "数学大冒险",
     desc: "一句话玩法说明", tags: ["数学", "计算"] },
   ```

3. `git push` —— 落地页自动出现新卡片，线上自动更新。游戏数 ≥ 5 时落地页自动显示搜索框。

## 自动部署

`main` 分支收到 push → GitHub webhook → cc-arm 上的 `deploy/webhook.py`
监听服务校验签名后执行 `deploy/deploy-local.sh`：`git reset --hard origin/main`
→ rsync 同步到 1Panel 静态站 docroot → reload OpenResty。

本地改完只需 `git push`，约 1–2 秒后线上自动刷新。

- `deploy/webhook.py` — 无依赖的 webhook 监听器（127.0.0.1:19000，HMAC 校验）
- `deploy/deploy-local.sh` — 服务器端拉取+同步+reload
- `deploy/games-webhook.service` — systemd 用户级服务单元

## 纸片领地开发

`games/territory.html` 加载 `territory/game.js`。`core.js` 是连续坐标和实际多边形地盘规则；`regions.js` 负责裁剪/真实线段；`render.js` 缓存地盘画面并绘制皮肤特效；`profile.js` 保存购买、装备、领奖收据和一次性结算。

- 地图是随机柔和波浪岛，初始地盘等大正圆；围地、敌方扣除及占地比例都由实际路线区域计算。`legacy-core.js` 仅保留历史规则回归，生产页面不加载。
- 人物与精致/隐藏领地共用材质。隐藏款在占满全岛后的三个分散宝箱里直接获得，未拥有款显示黑色；奖励按触碰单独保存。
- 多边形库固定版本，本地打包，无外部CDN。更新依赖后执行 `npm run build:territory-geometry`，许可在 `territory/vendor/LICENSES.md`。
- 必需检查：`npm run test:unit`、`npm run test:browser`。发布验证可用 `GAMES_TEST_ORIGIN=https://games.nblord.com node --test tests/territory-browser-smoke.mjs tests/territory-galaxy-browser-smoke.mjs tests/territory-vector-browser-smoke.mjs tests/responsive-browser-smoke.mjs`。
- 页面入口及完整ES模块依赖链必须统一资源版本；合并前以远程最新 `main` 为基线，部署后核对站点资源哈希和实际浏览器操作。变更记录在 `openspec/changes/continuous-vector-territory/`。

## 微光跑酷（自由移动3D跑酷）

入口 `games/parkour.html`。四种风景（樱花林、百花林、城市天桥、林间木屋）共12关，自由移动，第一关提供逐步教程；主页人物可单击跳跃。跑酷资源版本为 `20261002parkour1`。

- WASD / 方向键按镜头方向移动，空格或单击场景跳跃；拖动鼠标调整镜头，拖动释放不会跳跃，↺ 镜头朝向下一落点。手机用左下摇杆和右下跳跃按钮，可同时移动和跳跃。暂停、切到后台或失去焦点会停止移动，恢复后不会沿用按住的输入。
- 每枚预设金币每局只领取一次，掉落后保留已领取记录；重新出发可再领。踩到旗帜存档点后，掉落从该点重试；走进终点记录最快时间。余额、记录和外观保存在当前浏览器。
- 外观商店有13款皮肤：红色免费，其余12款（包括彩虹）各2金币；另有20套完整上衣、裤子和鞋，每套2金币。已拥有的皮肤和衣服免费切换，可卸下衣服保留皮肤，购买与装备重载后保留。
- 从主页选择夜晚、黎明、早晨三时段，光影约2秒平滑过渡，所选时段保存到当前浏览器。
- 自创路线编辑器支持添加、选择、移动、调整高度和尺寸、删除平台，设置起点、终点、金币和存档点，最多80个平台。起点和终点须有支撑平台；保存后可加载、试玩并返回继续编辑。自创金币是练习币，不增加商店余额。
- 逻辑、存档和关卡在 `parkour/core.js`、`profile.js`、`levels.js`、`editor.js`；画面与交互在 `scene.js`、`game.js` 等模块。使用本地打包的 Three.js 0.186.1，无外部CDN；许可证见 `parkour/THIRD-PARTY-NOTICES.txt`。修改跑酷源码后执行 `npm run build:parkour` 并提交 `parkour/bundle.js`。
- 发布门禁为 `npm run test:unit` 和 `npm run test:browser`。跑酷聚焦检查：`node --test tests/parkour-browser.mjs tests/parkour-integration-browser.mjs`；公网验收分别使用 `GAMES_TEST_ORIGIN=https://games.nblord.com` 或 `GAMES_TEST_ORIGIN=https://games.596996.xyz` 前缀执行这两个浏览器文件，核对游戏厅入口、真实输入与金币保存。

## 峰谷竞速（3D赛车）

入口 `games/racing.html`，逻辑在 `racing/core.js`，三维画面在 `racing/scene.js`，车库和操作在 `racing/game.js`。玩家与10位电脑车手跑两圈，前三名分别获得3000、1500、700赛事金币，其余名次无奖金。4种车型、6款涂装使用奖金解锁，购买和装备保存在当前浏览器。

十四条起伏蜿蜒赛道包含高原、山地、废弃工厂、旧公路和城市交通；主题路线以对应地形为主，并有霓虹管道长廊、赛博朋克城市、半玻璃半网格空中桥、中国风云海古亭等幻想地图，以及集装箱箱顶/箱内、跨海长桥、双层船桥和河水环绕的中国风山峡。每条主题赛道有独立走法，仅五境环线组合环境。车模为实际三维几何，采用金属反射、珠光车漆与薄膜干涉花纹，光照角度和车辆朝向改变时涂装会变色，车辆与场景投射阴影。

- 每张赛道的圈起点有T字复活标记。路障、摆锤、尖刺木桩、刀片、升降钉板及中国风古亭会撞毁车辆；空中桥驶出边缘会坠落。撞毁停5秒，回本圈T点，已完成圈数保留，仍可争取前三名；AI遵守相同规则。前方危险提前提示，复活后有3秒机关保护。
- 赛车实体按车身尺寸分离，冲线车辆离开赛道，不在终点堆叠；所有赛车带霓虹拖尾，氮气时更宽更亮。
- 画面菜单提供随赛程渐变、黎明、正午、晚霞、深夜；天空、金属环境反射、太阳方向、长短阴影和车灯随时段变化。中国风地图增加曲干迎客松、山峡河水、奇花异草、灌木和种植石岛。
- 自动油门默认开启；方向键 / WASD驾驶，空格使用氮气。手机用转向、刹车和氮气按钮。切到后台自动暂停。
- 车漆、碳纤维、轮胎、路面、岩石、植被、金属和水面使用本地生成的256×256共享颜色、法线、粗糙度贴图；车身侧壁/封口分别展开UV，路面颜色与凹凸对齐。水面波纹随时间移动，赛车增加接触阴影。无需下载远程材质。
- 精细画质提高画面分辨率、纹理过滤和阴影细节；软件渲染时精细模式使用1倍画布和1024阴影，自动/流畅模式保留较低负载。切换赛道保留共享材质贴图，释放赛道独有的纹理。
- 自动画质根据帧耗时降低分辨率，另有精细和流畅选项；场景重复物件实例化，车辆零件按材质合并。比赛计算在浏览器本地执行。
- 和朋友一起玩：2–8人使用各自设备打开赛车。创建者为小队长，分享随机六位数字房间码；其他成员加入后点“我准备好了”，队长选择赛道并一起出发。所有车手独立驾驶，保留加入时的车型和涂装。
- 联机使用同源 `/racing-ws` 与 `racing-coop.service`（127.0.0.1:8789），服务器确认位置和冲线。60秒内刷新重连保留赛车；队长退出后交接给在线成员。联机暂停仅打开自己的操作菜单，其他成员继续比赛。
- 多人检查 `npm run test:racing-online`；公网检查 `GAMES_TEST_ORIGIN=https://games.nblord.com RACING_PUBLIC_SAME_ORIGIN=1 node --test tests/racing-online-browser.mjs`，从网页创建、加入、驾驶和重连验证实际同源连接。
- 修改源码后执行 `npm run build:racing` 并提交 `racing/bundle.js`；Three.js固定版本、本地打包，许可证见 `racing/THIRD-PARTY-NOTICES.txt`。
- 检查 `npm run test:unit` 与 `npm run test:browser`。发布后分别执行 `GAMES_TEST_ORIGIN=https://games.nblord.com node --test tests/racing-browser.mjs`、`GAMES_TEST_ORIGIN=https://games.nblord.com node --test tests/racing-worlds-browser.mjs`、`GAMES_TEST_ORIGIN=https://games.nblord.com node --test tests/racing-scenery-browser.mjs`，以及 `GAMES_TEST_ORIGIN=https://games.nblord.com node --test tests/racing-materials-browser.mjs`，顺序验证公网操作、机关、场景、光影和材质，避免软件渲染浏览器并行争用GPU。

## 松鼠大作战（3D 横版合作救援）

入口 `games/rescue.html`。11 个区域沿经典分支探索，举箱攻击、拾回 Boss 球、奖励房收集，最终救出朋友；已完成区域可回玩。支持单人奇奇/蒂蒂、本机双人键盘、两个标准手柄、手机触控及两台设备联网双人。

- 1P：A/D 移动，空格跳跃，E 举起/投掷，W+E 上投，举箱时按 S 蹲藏，S+空格下穿单向平台；2P：左右方向键移动，Enter 跳跃，右 Shift 举起/投掷，向上+右 Shift 上投，向下蹲藏，向下+Enter 下穿单向平台。Esc 暂停。可举起和扔出队友。
- 手柄：方向键/左摇杆移动，A 跳跃，B 举起/投掷，Start 暂停；触屏使用方向盘与跳跃、举起按钮。
- 进度保存到当前浏览器：继续游戏从区域起点恢复入口分数、收集物和生命；区域完成后保存分支解锁与下一站入口。最高分独立保留。
- 联网双人：在首页创建或输入 6 位房间号加入，创建者控制奇奇、加入者控制蒂蒂。每台设备使用自己的 1P 键位、手柄或触屏。房主开始、重试和选择已解锁下一站；任一人暂停、断线、进入后台或 GPU 中断都会暂停队伍，恢复后由房主手动继续。短时重连保留原角色；退出结束房间。联网从 0 区开始，进度不覆盖本机存档；联网中的音乐、音效和画质设置只在本次房间生效，离房恢复本机选项。
- 游戏 app 内双击不放大，长按和右键不打开网页菜单，操作不触发文字选择。
- 联网镜头跟随本机角色，搭档离开画面时显示方向，避免两人分开后角色缩小。人物、物体和世界使用已确认快照的统一时间线，初始缓冲 100ms，不预测或外推未来位置；快照不足时停留，避免队友松键后因外推过头而回拉。HUD、音效与奖励沿同一确认时间线呈现；重生和举起关系在确认边界切换。
- 自动画质根据实际帧耗时降低分辨率，最低为 0.5 倍；性能稳定后自动恢复分辨率。完整场景和游戏规则保留，精细、流畅档仍可手动选择。
- 独立联网服务为 `rescue/server.mjs`，同源 WebSocket 路径 `/rescue-ws`，默认监听 `127.0.0.1:8788`；与射击服务独立。原生双浏览器回归：`npm run test:rescue-online`；其中延迟专项使用真实街区、双向各 100ms 加有序 ±10ms 抖动，记录可信按键到实际绘制及连续 60 秒动态流量，可复用测试工具见 `tests/rescue-online-harness.mjs`。
- 游戏厅目录和松鼠页面 CSS/bundle 版本统一为 `20261004rescue-online6`。源码在 `rescue/`；本地 Three.js 0.186.1，资源许可见 `rescue/THIRD-PARTY-NOTICES.txt`。修改源码后执行 `npm run build:rescue` 并提交原始 esbuild 产物 `rescue/bundle.js`。
- UDP 直连、身份、云存档与掉线恢复的调研及分阶段验收见 [上线设计](docs/rescue-online-launch-design.md)。当前仍使用云端 WSS 权威，联机进度不持久化；该设计文档不代表直连或云存档已经实现。
- 门禁：`npm run test:unit`、`npm run test:browser`。占满关卡回归在 `tests/rescue-occupied.test.mjs`；其 D 区使用正常双人独立输入，其余区域单人。浏览器原生 C 区通关检查在 `tests/rescue-browser.mjs`。
- 公网入口与真实操作验收：`GAMES_TEST_ORIGIN=https://games.nblord.com RESCUE_EVIDENCE_DIR=/tmp/rescue-main node --test tests/rescue-integration-browser.mjs`；把域名换为 `https://games.596996.xyz` 可验收另一入口。测试启动独立 Chromium，截图和状态 JSON 保存到指定目录。

### 联网服务部署与核验

现有 webhook 继续执行 `deploy/deploy-local.sh`。脚本分别安装 `shooter-coop` 与 `rescue-coop` 用户服务和同源代理；仅各服务导入的运行文件、unit 或生产依赖变动时重启。浏览器资源、文档或测试命令更新保留现有房间；只有代理配置变动才验证并 reload OpenResty。生产依赖改变或缺少 `node_modules/ws` 才执行 `npm ci --omit=dev`。站点镜像排除两个 `server.mjs` 和 `.superpowers`。每个服务和生产依赖的成功指纹、待重载代理标记保存在仓库 `.git/games-deploy/`，失败后重跑原脚本只补齐未完成阶段，已成功重启的服务不会因后续代理失败再重启。

首次接入前，需要把已审查的新 `deploy/deploy-local.sh` 原样放回生产仓库同一路径，核对 SHA 与执行模式，再让原 webhook 拉取 main。旧 Bash 进程可能已经缓冲原脚本，因此仅靠脚本内部 pull 无法确保第一次就使用条件重启。发布后核对生产 HEAD、8787/8788 监听、两服务、两个代理与静态资源；若新增 wiring 未执行，重新运行同一份已提交脚本。

公网同源双人验证使用 `GAMES_TEST_ORIGIN=https://games.nblord.com RESCUE_PUBLIC_SAME_ORIGIN=1 node --test --test-name-pattern='native online room' tests/rescue-online-browser.mjs`；另一入口换为 `https://games.596996.xyz`。此模式直接连接公网 `/rescue-ws`，不会创建本地游戏服务器或重定向 WebSocket。延迟专项在本地专用 relay 上运行；公网功能和本地注入延迟结果分别记录。

## 游戏目录与启动故障巡检

`npm run test:catalog` 从游戏厅目录读取所有游戏，在隔离的平板浏览器中检查真实启动状态、脚本异常、资源失败和横向溢出。检查线上版本：

```sh
GAMES_TEST_ORIGIN=https://games.nblord.com GAMES_AUDIT_DIR=/tmp/games-audit npm run test:catalog
```

`npm run test:startup` 注入脚本请求失败、损坏成绩、禁止存储和存储已满，验证恢复提示、开始/暂停/结算以及原有成绩保留。测试使用独立浏览器数据目录，不清除用户存档。目录检查只覆盖启动；完整操作、多人同步和存档流程仍由 `npm run test:browser` 及各游戏专项测试覆盖。
