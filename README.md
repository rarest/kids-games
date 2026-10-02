# 🚀 小火箭游戏厅 (kids-games)

给小朋友的趣味网页游戏合集，适应手机、平板和电脑，无广告。单人游戏在浏览器计算；联网射击使用合作服务，部分游戏资源需要本地打包。

在线访问：https://games.nblord.com

## 目录结构

```
index.html     合集落地页（数据驱动，读取 games.js 自动列出所有游戏，含搜索）
games.js       游戏目录清单 —— 新增游戏在这里加一行
games/         所有游戏的 HTML 入口
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

## 峰谷竞速（3D赛车）

入口 `games/racing.html`，逻辑在 `racing/core.js`，三维画面在 `racing/scene.js`，车库和操作在 `racing/game.js`。玩家与10位电脑车手跑两圈，前三名分别获得3000、1500、700赛事金币，其余名次无奖金。4种车型、6款涂装使用奖金解锁，购买和装备保存在当前浏览器。

六条起伏蜿蜒赛道包含高原、山地、废弃工厂、旧公路和城市交通；主题路线以对应地形为主。车模为实际三维几何，采用金属反射、珠光车漆与薄膜干涉花纹，光照角度和车辆朝向改变时涂装会变色，车辆与场景投射阴影。

- 自动油门默认开启；方向键 / WASD驾驶，空格使用氮气。手机用转向、刹车和氮气按钮。切到后台自动暂停。
- 自动画质根据帧耗时降低分辨率，另有精细和流畅选项；场景重复物件实例化，车辆零件按材质合并。比赛计算在浏览器本地执行。
- 修改源码后执行 `npm run build:racing` 并提交 `racing/bundle.js`；Three.js固定版本、本地打包，许可证见 `racing/THIRD-PARTY-NOTICES.txt`。
- 检查 `node --test tests/racing.test.mjs tests/racing-render.test.mjs tests/racing-browser.mjs`。发布后用 `GAMES_TEST_ORIGIN=https://games.nblord.com node --test tests/racing-browser.mjs` 验证公网真实页面。
