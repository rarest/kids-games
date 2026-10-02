## Why

用户要求20款卡通动物特别皮肤，每款100钻石，突出各动物的主要特征，钻石通过金币兑换。

## What Changes

- 新增动物特别款20种：猫、狗、兔、熊猫、狐狸、棕熊、小猪、狮子、老虎、考拉、青蛙、大象、猴子、浣熊、企鹅、猫头鹰、小鸡、奶牛、绵羊、鹿。
- 1金币兑换2钻石；每款扣100钻石，一次购买永久拥有，可切换装备。
- 卡通脸部与领地共用动物纹样，仍采用圆形角色；与原60款及隐藏宝箱规则隔离。

## Capabilities

### New Capabilities

- `territory-animal-shop`: 动物特别款、钻石兑换及持久化购买。

### Modified Capabilities

无。

## Impact

profile/game/render、独立animal绘制模块及商店HTML/CSS、相关测试。保留原存档及积分规则，不增加运行依赖或真钱付款。
