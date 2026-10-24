## Context

线上 main 为7ff7eb6，用户级 shooter/rescue/racing 服务均在线，代理共享games.596996.xyz站点目录。主源位于products/butterfly-garden，最终试玩版本已获准导入；内嵌11个运行脚本和style.css已逐项与主源比对一致。

## Goals / Non-Goals

**Goals:** 以已稳定主源构建同源游戏入口、独立联机服务，保留原有服务和数据。

**Non-Goals:** 不修改游戏玩法，不迁移既有游戏后端，不改变平台账户和存档。

## Decisions

- 使用独立127.0.0.1:8791用户级服务，代理/butterfly-ws重写为/ws；客户端通过构建时配置选择路径。避免复用本地预览端口或改变原游戏路由。
- 仅复制白名单生产文件；内嵌页面部署到games/butterfly.html，后端放仓库butterfly/且整个目录从静态发布排除。用package.json限定CommonJS防止继承父仓库type=module。
- 持久状态使用/home/ubuntu/.local/state/butterfly-garden/state.json，用户级service提前创建目录并以UMask0077写入，发布同步不触碰该目录。
- 保存源文件SHA-256清单和构建脚本，后续主源修复通过重新导入发布。
- 沿用已有指纹和部署标记，仅在新服务运行时变化时重启新服务。仓库更新改为快进合并，拒绝覆盖现场改动。

## Risks / Trade-offs

- [服务未启动或代理失败] → 先隔离测试，再测试公开真实双客户端房间并检查原进程编号。
- [主源仍变动] → 按source-ready导入并记录哈希，发布前核对源文件未漂移。

## Migration Plan

试玩版本已交付，本轮沿有效上架授权继续；本地原生游戏厅入口门禁通过后提交PR，现场快进到稳定feature以先更新受控脚本，执行新脚本首次部署，随后合并main由已有webhook跟进。若失败，先读回原部署状态，按成功标记重试。回退只撤销本次提交和新增服务，不回退其他并行提交。
