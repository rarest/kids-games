# 赛车多人 Implementation Plan

**Goal:** 让2–8位玩家用六位房间码加入赛车并一起驾驶。
**Architecture:** 现有赛车core扩展多个human输入；独立ws服务器权威模拟；网页大厅与20Hz状态绘制。保留单人和全部车库功能。
**Tech Stack:** JavaScript、Node、ws、Three.js、systemd、OpenResty；不引入新依赖。
**Spec:** docs/superpowers/specs/2026-10-04-racing-multiplayer-design.md

## 任务与文件

- [x] core与服务器：racing/core.js、racing/server.mjs；tests/racing-online-core.test.mjs与tests/racing-server.test.mjs先写失败断言，覆盖房间码、权限、2–8成员、输入、排名、断线、过期与重赛。
- [x] 客户端：racing/online.js负责连接、重连、房间快照；racing/online-state.js负责自己的视角、静态复用和动态插值。tests/racing-online-state.test.mjs覆盖非零slot、样式、时间和复位；先失败后实现。
- [x] 页面：games/racing.html、racing/style.css、racing/game.js、racing/scene.js加大厅与已选车/涂装，同时保留单人按钮。真实浏览器先验证缺少大厅的失败，再实现并检查同步开赛/3玩家/输入/移动端。
- [x] 部署：deploy/racing-coop.service、deploy/racing-coop.conf、deploy/deploy-local.sh；部署隔离测试执行真正脚本，以替身系统工具证明未改服务不重启、首次服务启动和失败后重试。
- [ ] 验证：受影响赛车unit、部署、现有单人浏览器和新多人浏览器；独立代码审查修复阻断项，重建bundle。
- [ ] 交付：PR合并现有main并部署；公网两浏览器经同源/racing-ws加入和驾驶，确认页面和bundle哈希、旧服务PID。给用户可玩的正式链接。

## 协作分工

服务器/core由pep_content_34负责，部署由review_perf负责；主代理负责UI、同步绘制和真实浏览器。各自文件不交叉写入，提交由主代理统一执行。

## 当前进度

2026-10-04：基线main97ea5d3，与线上checkout一致。依赖安装成功；旧shooter PID143350、rescue PID165363，赛车端口8789空闲。开发路径 .worktrees/racing-multiplayer。

2026-10-04 验证记录：全部赛车与部署unit共80项通过，另6项客户端/快照检查通过。真实三浏览器已跑通建房、六位码加入、准备和开赛；CPU软件渲染下控制间隔超过500ms，已分离33ms网络控制循环与rAF，并用原生按键回到道路覆盖慢启动被碰撞推到路肩的情形。三人驾驶/重连及单人回归尚在运行。独立审查无未处理阻断。最新main af9d446包含其他游戏修复，交付前合并保留。

三人原生浏览器检查通过（242秒）：六位码、原生鼠标/键盘加入、准备、独立驾驶/视角、共享转向、ESC本机菜单、实际刷新恢复slot1、队长退出转交slot1、剩余车手继续、零运行异常。手机390×844房间与568×320驾驶截图已检查。软件GPU同时运行三浏览器时用320×240驾驶viewport减少像素，始终使用真实WebGL和物理；测试原生转向回到道路覆盖启动被其他车推到路肩。单人回归开始。
