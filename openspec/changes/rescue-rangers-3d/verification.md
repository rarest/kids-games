# 松鼠大战三维重制验证记录

## 当前状态

- 用户已确认方案并授权开始实现、接入游戏厅及发布。
- 独立分支 `feat/rescue-3d`，基于最新 `origin/main 323c2a9`；未修改其他已有分支。
- 基线 `npm run test:unit` 372/372 通过，0 失败（`/tmp/rescue-baseline-unit.log`）。
- 公网现有跑酷页面实际 Three.js 渲染 ready、无 Runtime 错误；游戏清单、HTML、bundle 与本地基线一致。
- 原版 11 张区域地图与世界路线截图已获取在 `/tmp/rescue-reference/`，尚未把新增游戏发布到公网。

## 授权与验收

用户“完整复刻一个加入 games.nblord.com”，确认 2.5D、完整战役与本地双人后回复“开始吧”。实现、测试、PR、合并和上线验收按这一授权连续推进。
