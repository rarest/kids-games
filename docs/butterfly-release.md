# 蜜语花园发布

主源为工作区 `products/butterfly-garden`。先在那里运行对应测试和 `python3 build.py`，确认源码稳定后，在游戏厅仓库执行：

```sh
npm run build:butterfly -- /home/ubuntu/codex-work/products/butterfly-garden
node --test tests/butterfly-build.test.mjs tests/rescue-deploy.test.mjs
```

导入脚本只复制已构建页面与运行时白名单，不修改主源。`butterfly/source-manifest.json` 记录源文件和发布页 SHA-256。后续修复应修改主源、重建、重新导入；不要直接修补生成页面。

公开入口：`/games/butterfly.html`；WebSocket：`/butterfly-ws`。独立用户级 `butterfly-coop.service` 绑定 `127.0.0.1:8791`，代理把路径重写为 `/ws`。页面通过 `GARDEN_WS_PATH` 使用同源地址，继续保留单机游玩。

服务状态位于 `/home/ubuntu/.local/state/butterfly-garden/state.json`，由服务以0077掩码写入。它在仓库和站点目录外，常规发布不删除或替换存档。备份或手动恢复需在停止本服务后复制该文件，保留权限。存档损坏时原文件保留，查日志处理；不要删除存档来掩盖启动失败。

`deploy/deploy-local.sh` 使用共享flock锁和快进合并，拒绝覆盖非快进现场。独立运行指纹仅包括服务文件、规则、checkpoint和CommonJS配置。纯页面更新不重启联机服务；其他三个游戏和平台的指纹不变时保留其进程和房间。`butterfly/`、`tests/`、`scripts/` 从站点同步排除。

发布后执行 `node tests/butterfly-public-room.mjs`，核对真实公网创建、四位码加入、准备开始及队友看到移动。另核对页面源哈希、私有后端404、浏览器进入和已有服务PID。

新服务首次上线且仅有验收房间时，可执行 `GARDEN_ALLOW_SERVICE_RESTART=1 node tests/butterfly-deployed-persistence.mjs`，验证真实公网房间经本服务重启后通过原token恢复相同进度；该命令会重启butterfly服务，不操作其他服务。
