# 游戏厅统计服务

此阶段提供匿名游玩统计和日、周、月热度榜。账号、跨设备存档还未开放。

## 统计口径

14 款游戏使用固定 ID。前台实际游玩满 15 秒才计入，菜单、暂停、后台页和联机等待不计时。同一浏览器的同一游戏在 30 分钟内只记一次，刷新和多个标签页共用数据库去重。持续游玩超过 30 分钟可再次计入有效游玩次数。榜单按次数排序，相同时按有效时长排序。日、周、月使用北京时间，周一开始新一周。

浏览器主动上报统计；服务端限制增量、请求频率并检查匿名会话归属。它用于观察游戏热度，不是竞技成绩或奖金依据。数据库中不保存姓名、邮箱或原始 IP。

## 运行与部署

要求 Node.js 24+、PostgreSQL 17 和 platform/package-lock.json 对应的依赖。首次部署运行 `python3 deploy/platform-bootstrap.py`；此脚本需要本机 Docker 与免密码 sudo。它创建独立的 PostgreSQL 容器和低权限应用角色，生成配置于 `~/.config/games-platform/`，数据位于 `~/.local/share/games-platform/postgres`，数据库只监听 `127.0.0.1:5433`。

`app.env` 必需 `DATABASE_URL` 和持久化的 `VISITOR_SECRET`，另外包含 `PUBLIC_ORIGIN=https://games.nblord.com`。不要提交或打印该文件，权限为 0600。更换 VISITOR_SECRET 会改变访客身份及去重结果。

部署沿用 `deploy/deploy-local.sh`。它安装隔离的 platform 依赖、systemd 用户服务及同源 `/api/` 代理。API 监听 `127.0.0.1:8790`。平台变更仅重启 games-platform；赛车、营救、射击各自使用独立指纹，未改变时保留进程与房间。静态同步排除平台源码和环境文件。

## 运维

- 健康检查：`GET /api/health`，需要数据库可用。
- 查看服务：`systemctl --user status games-platform.service`。
- 榜单：`GET /api/popularity?period=day|week|month`，不公开访客与会话标识。
- 备份：`systemctl --user start games-platform-backup.service`。定时器每天北京时间 03:15 左右执行，保留最近 7 份日备份和 4 份周备份。备份文件在 `~/.local/share/games-platform/backups`，权限 0600。
- 恢复演练只能导入单独的临时数据库，并比较表记录后删除临时库；不要对正在使用的数据库执行覆盖恢复。
- 当前备份在同一服务器，尚未设置异地备份。账号与云存档阶段需要补充异地备份及删除/找回机制。

## 验证

根目录运行 `node --test tests/*.test.mjs`。数据库检查需要环境变量 `PLATFORM_TEST_DATABASE_URL`，使用独立测试库和临时 schema。原生浏览器检查为 `tests/game-popularity-browser.mjs`；默认用本地临时数据库，设置 `GAMES_TEST_ORIGIN` 时访问指定网站，真实点击和游玩会生成该网站的有效记录。
