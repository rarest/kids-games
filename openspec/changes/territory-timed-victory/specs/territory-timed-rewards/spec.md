## Purpose

让纸片领地的真实全岛完成状态可靠衔接金币、分散宝箱和积分结算，消除显示已满却没有奖励的失败体验，并提供有时限、可加时且能暂停的领奖环节及随位移滚动的圆形角色。

## ADDED Requirements

### Requirement: Complete island awards victory
系统 SHALL 在仅有不可见微小中立残边且没有敌方占地时收尾全岛、展示100%并进入奖励；尚未胜利不得显示100%。

#### Scenario: Inner coastline closure
- **WHEN** 玩家沿岸线内侧闭合，剩余面积不超过全图十万分之一且敌方占地为空
- **THEN** 实际全图归玩家，产生60枚金币和三个分散宝箱，进入领奖。

#### Scenario: Still contested
- **WHEN** 仍有有效敌地或显著中立地
- **THEN** 不触发胜利，显示未完成的百分比。

### Requirement: Timed rewards and clocks
系统 SHALL 给予30秒领奖，提供钟表形状的2/5/10秒一次性加时道具，到时自动结算；暂停 SHALL 冻结剩余时间。金币 SHALL 疏密混合分布，宝箱 SHALL 分散且直接赠未拥有隐藏皮肤。

#### Scenario: Pickup and expiry
- **WHEN** 玩家触碰加5秒钟表后重复经过，随后时间耗尽
- **THEN** 仅增加一次5秒，已领取金币宝箱保留，自动显示结算。

#### Scenario: Paused reward
- **WHEN** 玩家在领奖时暂停或切后台
- **THEN** 倒计时与运动冻结，继续后恢复。

### Requirement: Rolling and score
系统 SHALL 按角色移动距离播放滚动，停止移动则停止；显示本局积分并一次性保存累计积分，旧存档可继续使用。

#### Scenario: Finish once
- **WHEN** 本局获胜并领取奖励后结束
- **THEN** 记录占地及胜利、金币奖励对应的积分，重复结束不重复入账。
