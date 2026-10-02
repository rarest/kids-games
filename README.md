# 🚀 小火箭游戏厅 (kids-games)

给小朋友的趣味网页游戏合集，适应手机、平板和电脑，无广告。单人游戏在浏览器计算；联网射击使用合作服务，部分游戏资源需要本地打包。

在线访问：https://games.nblord.com

## 目录结构

```
index.html     合集落地页（数据驱动，读取 games.js 自动列出所有游戏，含搜索）
games.js       游戏目录清单 —— 新增游戏在这里加一行
games/         所有游戏的 HTML 入口
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

入口 `games/parkour.html`。四种风景（樱花林、百花林、城市天桥、林间木屋）共12关，自由移动，第一关提供逐步教程；主页人物可单击跳跃。游戏厅目录及跑酷资源版本为 `20261002parkour1`。

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
- 修改源码后执行 `npm run build:racing` 并提交 `racing/bundle.js`；Three.js固定版本、本地打包，许可证见 `racing/THIRD-PARTY-NOTICES.txt`。
- 检查 `npm run test:unit` 与 `npm run test:browser`。发布后分别执行 `GAMES_TEST_ORIGIN=https://games.nblord.com node --test tests/racing-browser.mjs`、`GAMES_TEST_ORIGIN=https://games.nblord.com node --test tests/racing-worlds-browser.mjs`、`GAMES_TEST_ORIGIN=https://games.nblord.com node --test tests/racing-scenery-browser.mjs`，以及 `GAMES_TEST_ORIGIN=https://games.nblord.com node --test tests/racing-materials-browser.mjs`，顺序验证公网操作、机关、场景、光影和材质，避免软件渲染浏览器并行争用GPU。
