## Why

真实内侧绕岸路线占地99.999636%后仍停在playing，界面却显示100%，金币宝箱与结算均被阻断。用户同时要求移动滚动、30秒限时领奖及加时钟表。

## What Changes

- 收尾肉眼不可见且没有敌方占地的微小残片，未胜利不提前显示100%。
- 奖励阶段30秒，暂停冻结；触碰钟表加2/5/10秒，到时自动结算。
- 金币散点和紧密小簇混合，三个宝箱仍分散且一次性领取。
- 角色按实际移动距离滚动，静止停止；增加本局及累计积分。

## Capabilities

### New Capabilities

- `territory-timed-rewards`: 完整胜利与限时奖励、积分和移动滚动。

### Modified Capabilities

无。

## Impact

territory/core.js、game.js、profile.js、render.js及HTML/CSS；保持现有连续几何与存档兼容，不新增运行依赖。
