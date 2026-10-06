# 珠珠学伴：微信云托管部署准备

本目录只准备无秘密模板，不开通资源、不修改现有业务。调研结论见 `/home/ubuntu/codex-work/output/english-release-readiness/network-research.md`（2026-10-06）。

## 可复用与尚缺的部分

- `Dockerfile` 复用现有 Node.js 24 API、PostgreSQL访问、账号与课程进度逻辑。监听 `0.0.0.0:8080`，非 root 运行，依赖沿用现有锁文件。
- `Dockerfile.dockerignore` 采用构建输入白名单，排除本地配置、Git、依赖目录、输出、浏览器数据及客户端包。**构建目录必须是仓库根目录**。
- 容器只提供 `/api/`；没有 nginx，不能直接提供 `/english/miniprogram-data/` 或网站媒体。教材JSON读取和媒体映射需要独立接入。
- `DATABASE_URL` 必须指向可达的私有 PostgreSQL。不能将原有 MySQL 套餐价格当成 PostgreSQL 价格，也不能把现有 PostgreSQL 直接换成 MySQL。
- 现有 API 每次启动会执行数据库迁移。未来验证必须使用隔离测试库；迁移生产数据前需备份及恢复演练。
- 现有评分适配器只接受 `http://127.0.0.1`。把 `SPEECH_LOCAL_URL` 改成另一云服务内网地址不会启用评分。需先设计同实例进程或经评审的服务调用改造。
- `callContainer` 原始请求上限100 KiB、超时最大15秒，与最长20秒WAV和现有55秒推理等待不兼容。不能直接换传输方法宣称完整上线。

## 不需要云账号的材料

```sh
# 仓库根目录；只生成教材和资源的路径、大小、校验值，不上传
node deploy/wechat-cloud/media-manifest.mjs > /tmp/zhuzhu-media-manifest.json
node --test tests/wechat-cloud-media-manifest.test.mjs

# 可供后续构建；未运行部署
docker build -f deploy/wechat-cloud/Dockerfile -t zhuzhu-api-prepared .
```

媒体清单除JSON引用外，还按`catalog.units`真实单元编号纳入客户端动态课程场景图，并在`uses`记录JSON文档/指针或动态课程用途；同路径只列一次，供后续上传去重。目前127份JSON、1770项媒体、26204606 B，所有文件存在。

本次已在本地ARM主机完整构建API镜像，并在禁用网络、移除容器能力的隔离运行中成功加载`platform/server.mjs`。未启动连接数据库的API服务；云端目标架构和实际数据库连通仍待验证。

`deployment-inputs.example.json` 是人工核对清单，不是可直接传入 CLI 的厂商配置。`api.env.example` 只记录需要提供的变量名；真实值仅在云端私密配置中输入。上线前把 Node 基础镜像固定为审核过的 digest，并核对目标容器CPU架构；不能直接把本机ARM架构镜像当成所有云运行环境均可用。

## 后续推荐路径

优先验证“微信云托管API + 同环境对象存储 + 国内PostgreSQL + 国内评分”的完整方案。音频/图片使用上传所得 `cloud://` 文件ID；官方支持 `image.src` 与 `InnerAudioContext.src`。现有客户端拼接网站origin的逻辑需要后续适配。录音采用私有临时上传加异步任务/轮询，或经真机验证的大对象传输加异步任务；前者会改变当前录音不落盘的处理方式，必须先确认保留时长、删除及隐私说明。

“国内网关复用韩国后端”可保留现有账号、数据库和评分，但仍需解决音频图片、长录音传输、15秒超时及跨境数据处理。网关必须固定上游、限制方法/路径、禁止任意URL转发，剥离伪造身份与IP请求头，使用TLS和服务间鉴权，配置限流/超时/日志脱敏；这些条件未完成前不提供可上线网关配置。不要开放现有PostgreSQL公网端口。

## 账户开通后才可完成

1. 小程序管理员核对实名、云环境所属小程序、国内地域、具体产品计价和余额告警；创建环境及服务。
2. 确认提供PostgreSQL协议连接的数据库方案、预算、备份和连接限制。个人小程序支持云服务不等于数据库免费。
3. 提供真实环境ID、服务名、云文件ID；设置允许小程序访问并关闭API公网入口。
4. 实现独立教材读取路径、媒体映射和评分异步协议，保持服务端持有AppSecret和数据库凭据。
5. 关闭开发工具/真机调试模式的域名豁免，核对课程读取、听读、图片、账号登录、两设备进度同步、录音评分及异常反馈；完成小程序备案和正式版本审核。

## 官方依据

- [微信云托管 Node.js 自定义部署（含个人主体）](https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloudrun/src/quickstart/custom/node.html)
- [微信小程序访问云托管及调用限制](https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloudrun/src/development/call/mini.html)
- [对象存储组件支持](https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloudrun/src/development/storage/miniapp/compon.html)
- [微信云托管产品定价](https://developers.weixin.qq.com/miniprogram/dev/wxcloudservice/wxcloudrun/src/Billing/price.html)
- [CloudBase PostgreSQL协议连接](https://docs.cloudbase.net/database/postgresql/connecting-to-postgresql)
