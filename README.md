# 🚀 小火箭游戏厅 (kids-games)

给小朋友的趣味小游戏合集，纯静态单文件 HTML，无后端、无构建、无广告。

在线访问：https://games.596996.xyz

## 目录结构

```
index.html     合集落地页（数据驱动，读取 games.js 自动列出所有游戏，含搜索）
games.js       游戏目录清单 —— 新增游戏在这里加一行
games/         所有游戏（每个都是独立单文件 HTML）
  ├─ pinyin.html   🚀 拼音打字小火箭
  ├─ snake.html    🐍 贪吃蛇吃痘痘
  └─ fish.html     🐟 大鱼吃小鱼
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
