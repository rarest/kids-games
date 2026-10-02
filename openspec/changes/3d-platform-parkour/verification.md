# 微光跑酷实施与验证记录

## 当前状态

- 用户已批准自由移动3D平台跑酷设计；实施中，尚未上线。
- 基于远程最新 `origin/main` 4e3d2af，新建 `feat/3d-parkour` 与独立 parkour 工作树。
- 现有294项单元测试通过。现有3D赛车和纸片领地保持不变。
- OpenSpec `3d-platform-parkour` 严格校验通过；计划在 `docs/superpowers/plans/2026-10-02-3d-parkour.md`。
- 后续先完成纯逻辑及可达性，再实现真实3D和编辑器界面，审查、全项目回归后走既有发布链。

## 已执行检查

- `npm ci`：安装完成，审计0 vulnerabilities；esbuild postinstall许可提示来自当前npm环境，执行打包时核对实际结果。
- `npm run test:unit`：294/294通过，0失败。
- `openspec validate 3d-platform-parkour --strict`：valid。
- 生产读检：`games-site` HEAD4e3d2af，webhook及co-op服务active，尚未发布本次游戏。

## 授权与范围

沿用同一项目“自动实施、完成后自行部署”授权。纸片领地20钻石改价已被用户取消，仍仅保留在另一工作树，不携入本次提交。

金币规则：预设关卡每局每枚一次，掉落不重复、新开局可再次获得；自创试玩不增加商店余额，界面明确说明。原免费红色皮肤保留，其余12款各2金币。
