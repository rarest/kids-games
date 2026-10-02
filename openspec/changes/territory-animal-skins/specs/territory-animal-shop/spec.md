## Purpose

为纸片领地增加具有明显动物特征的二十种卡通特别款，通过用户指定比例从现有金币兑换钻石并购买，保持人物与领地的动物纹章一致，以及旧存档、永久拥有和原隐藏款奖励规则的兼容。

## ADDED Requirements

### Requirement: Twenty animal special skins
商店 SHALL 提供20种不同卡通动物特别款，每款100钻石；各动物 SHALL 体现自身主要外观特征，人物与领地共用动物主题。

#### Scenario: Distinct collection
- **WHEN** 玩家打开动物特别款分类
- **THEN** 能看到20种有名称和不同轮廓、五官特征的动物，而非仅换色；原三分类依旧各20款。

### Requirement: Diamond exchange and purchase
系统 SHALL 按1金币兑2钻石处理正整数兑换，余额不足不得兑换；动物款 SHALL 只扣100钻石，已买不可重复扣费，装备和余额永久保存在同设备存档。

#### Scenario: Buy and reload
- **WHEN** 玩家用50金币兑换100钻石，购买一款动物皮肤并装备后重新打开页面
- **THEN** 金币减少50，钻石减少100，动物仍属于玩家且已装备，积分不因消费减少。

#### Scenario: Invalid or insufficient funds
- **WHEN** 玩家兑换非正整数、超过金币余额，或不足100钻石尝试购买
- **THEN** 拒绝操作且不改变资产与拥有列表。
