## Why

用户要求将已制作的蜜语花园加入小火箭游戏厅，并让公网玩家通过随机四位房间码联机。当前独立试玩只有本地服务入口。

## What Changes

- 添加游戏厅目录入口与独立内嵌游戏页面。
- 添加独立用户级联机服务及同源 WebSocket 代理。
- 保留其他游戏进程、房间和平台数据；发布仅允许快进更新。
- 保存主源哈希与可重复构建方式，部署不公开后端和测试。

## Capabilities

### New Capabilities
- `butterfly-hall`: 游戏厅入口、公开联机和独立部署验收。

### Modified Capabilities

无。

## Impact

games.js、games/butterfly.html、butterfly/、部署脚本、独立8791端口与/butterfly-ws代理；不增加根生产依赖。
