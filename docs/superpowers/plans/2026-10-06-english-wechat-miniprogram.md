# 微信英语课堂 Implementation Plan

> For agentic workers: Use subagent-driven-development for independent tasks with explicit shared interfaces; apply requesting-code-review before merge.

Goal: 交付可导入开发者工具的英语小程序和可配置的微信登录后端。
Architecture: 原生微信页面请求同源HTTPS课程JSON和音频，Bearer会话接现有家庭数据库。构建课程资源以复用网页教材。
Tech Stack: 原生WXML/WXSS/CommonJS、Node24、Better Auth1.7.7、PostgreSQL17。
Spec: docs/superpowers/specs/2026-10-06-english-wechat-miniprogram-design.md

## Global Constraints
- 不变更其他游戏服务，不放松现有网页Origin检查。
- AppSecret只在服务端。没有微信配置时503；模拟验证不能证明正式登录成功。
- 90页/36课来自现有教材，音频路径/english/audio，字号与行距适合三年级。
- 主包不包含全量远程课程资源；访客可学；每个孩子有独立存档。

## Shared Interfaces
- GET /api/miniprogram/config -> {enabled:boolean,wechatReady:boolean,webWechatReady:boolean,webWechatProvider:"wechat"|"wechat-mp"|null}
- POST /api/miniprogram/login {code} -> {token,user}; POST /api/miniprogram/username {username,password} -> {token,user}; POST /api/miniprogram/link {code} with existing Bearer -> {linked:true}; POST /api/miniprogram/logout with Bearer -> {ok:true}.
- Authenticated GET /api/miniprogram/session -> {user}; GET/POST/PATCH/DELETE /api/miniprogram/profiles[/id] and GET/POST /api/miniprogram/profiles/id/progress/english[/import] reuse FamilyStore payloads exactly.
- POST /api/miniprogram/pronunciation?target=source-id, Content-Type audio/wav, binary ArrayBuffer -> same existing assessment result. Guest allowed, same rate limits and reference lookup.
- GET /english/miniprogram-data/catalog.json -> {schemaVersion:1,bookId,title,units:[{id,title,zh,lessons:[{id,title,goal,pages,minutes}]}],pages:[{page,title,unitId}]}.
- GET /english/miniprogram-data/pages/N.json -> {page,title,unitId,blocks,words,targets,questions}. Each word/line targetId refers to pN-word-I or pN-line-B-I. targets contain id,page,kind,en,zh,ipa?,say?,audio:string(relative server path),image?:string(relative server PNG path). Blocks/words retain source fields with matching audio/image/targetId.
- GET /english/miniprogram-data/lessons/ID.json -> lesson definition plus steps:buildSteps(lesson), with targetId/audio/image on source items where available. Questions retain exact existing makePractice and guided course types.
- config origin=https://games.nblord.com. Backend config: WECHAT_MINI_APP_ID,WECHAT_MINI_APP_SECRET; web separately WECHAT_WEB_APP_ID,WECHAT_WEB_APP_SECRET,WECHAT_WEB_MODE=website|official-account.

## Task1: Course resource exporter
Files: scripts/build-miniprogram-content.mjs, english/miniprogram-data/**, english/miniprogram-art/**, tests/miniprogram-content.test.mjs.
- [x] Write failing source fidelity/audio availability tests.
- [x] Build catalog/pages/lessons from BOOKS/COURSE/LESSONS, makePractice, buildSteps and manifest; render existing vector artwork as PNG without inventing abstract noun icons.
- [x] Verify90pages,36lessons, all source occurrences and all media, deterministic build.

## Task2: Native client
Files: miniprogram/**, tests/miniprogram-client*.test.mjs; shared/account.js only for website login/link controls after config contract.
- [x] Test auth request state, retry answers, per-profile local storage, audio/record lifecycle using injected wx API and real source resources.
- [x] Implement home/lesson/page/account native views with three page tabs; use shared interfaces above. Keep readable content and correctly hidden stop controls.
- [x] Support visitor, existing username, wx.login and profile selection/linking; export/import existing guided cloud progress format.
- [x] Package devtool configuration and release instructions with missing identity requirements, no client secrets.

## Task3: Auth/API
Files: platform/wechat*.mjs,platform/miniprogram*.mjs,platform/auth.mjs,platform/server.mjs,tests/family-wechat*.test.mjs.
- [x] Test code exchange errors/absent config/client identity rejection, then implement Tencent exchange with timeout and redacted errors.
- [x] Integrate Better Auth sessions and safe account binding, web OAuth provider configuration, mini Bearer routes; preserve browser CSRF protections.
- [x] Verify real PostgreSQL sessions, no auto-merge, cross-family denial, disabled readiness and existing username login.

## Task4: Integration/release
Files: package.json,deploy/deploy-local.sh, docs/wechat-miniapp.md, output/english-wechat-miniprogram delivery record.
- [x] Build remote content and main bundle/package; validate WXML and JS with appropriate tooling, source media and package size.
- [x] Review implementation, run relevant account+English regressions, prepare concrete PR/package.
- [ ] Deploy backend/static resources, verify public-readback/config/visitor/username paths and preserve game PIDs.
- [ ] Deliver source archive and exact new-account setup steps. Registering app identity, true WeChat authorization, developer-tool true device checks and platform review remain external steps until configuration exists.
