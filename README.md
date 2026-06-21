# 🚀 小火箭游戏厅 (kids-games)

给小朋友的趣味小游戏合集，纯静态单文件 HTML，无后端、无构建、无广告。

在线访问：https://games.596996.xyz

## 游戏

| 文件 | 游戏 | 玩法 |
| --- | --- | --- |
| `index.html` | 合集落地页 | 入口 |
| `pinyin.html` | 🚀 拼音打字小火箭 | 看拼音敲字母，练键盘指法 |
| `snake.html` | 🐍 贪吃蛇吃痘痘 | 经典贪吃蛇 |
| `fish.html` | 🐟 大鱼吃小鱼 | 吃小鱼长大 |

每个游戏都是独立单文件，直接用浏览器打开即可玩。

## 自动部署

`main` 分支收到 push → GitHub webhook → cc-arm 上的 `deploy/webhook.py`
监听服务校验签名后执行 `deploy/deploy-local.sh`：`git reset --hard origin/main`
→ rsync 同步到 1Panel 静态站 docroot → reload OpenResty。

本地改完只需 `git push`，约 1–2 秒后线上自动刷新。

- `deploy/webhook.py` — 无依赖的 webhook 监听器（127.0.0.1:19000，HMAC 校验）
- `deploy/deploy-local.sh` — 服务器端拉取+同步+reload
- `deploy/games-webhook.service` — systemd 用户级服务单元
