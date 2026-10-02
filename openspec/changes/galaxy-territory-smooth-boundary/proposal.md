## Why
精致款和隐藏款目前只有人物特效，领地缺少用户要求的银河光粒。圆形海岸内部仍可能被格子中心采样判成障碍，产生台阶卡顿。
## What Changes
- 为精致款和隐藏款的己方领地添加星云、圆形光粒及闪烁，隐藏款更丰富；普通款不变。
- 圆形海岸使用连续坐标行动，边缘逻辑归属映射到邻近有效格，不再把采样台阶当墙；持续向外移动时沿真实圆弧滑动。
- 保留占地、切断、连桥、100% 获胜和存档；版本升级并部署验证。
- 人机在有限视野内主动选择敌方尾迹截击点，切断后走回自己的领地；主页和实际开局都使用等大正圆地盘。
## Capabilities
### New Capabilities
- `galaxy-territory-effects`: 分级银河领地及有界粒子动画。
- `smooth-circular-movement`: 圆形边界移动与向外贴边滑动。
### Modified Capabilities
无。
## Impact
涉及 territory/core.js、geometry.js、render.js、资源版本及相应测试；不更改经济或其他游戏。
