# 验收记录

- 版本资源标记：`20261002circles`。
- 地图与默认角色均使用真实圆形；原来的网格定位图改为圆点摘要及圆环。
- 大地图仍为 88×76 逻辑尺寸，局部镜头、透明曲线尾迹、60 款皮肤和原存档保持。
- 独立审查发现角部单格扩张的圆覆盖间隙，已补邻接中点小圆。正常操作回归先复现失败，修复后通过；独立复审未发现剩余 P0/P1/P2。
- 修复后相关几何与规则检查：30 项通过。全项目单元检查：248 项通过。
- 独立审查另检查 500 个随机形状的中心归属与邻接连接；100×100 几何计算均值约 3.9–6.0 ms。
- `npm test` 退出码 0：248 项单元检查、19 项浏览器检查全部通过。
- OpenSpec 严格校验、`git diff --check` 通过。
- PR #26 已合并，生产提交 `d3c5ce2`，服务器仓库及站点文件已同步。
- 公网 HTML、core、game、render、geometry、style 六个资源哈希与测试版本一致；两个域名的普通页面请求也一致。
- 公网 `GAMES_TEST_ORIGIN=https://games.nblord.com node --test tests/territory-browser-smoke.mjs tests/responsive-browser-smoke.mjs`：11 项通过。

圆形版本已交付。接续用户新增的银河领地效果与圆弧边界移动需求，先由 `galaxy-territory-smooth-boundary` 记录；随后新增彻底去格、真实围地、波浪海岸和触碰宝箱奖励要求，统一由 `continuous-vector-territory` 交付。
