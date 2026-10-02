# 松鼠大战 1 三维重制 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 实现完整的 11 区域三维横版双人松鼠大战，发布到 games.nblord.com 并验收真实入口与操作。

**Architecture:** 用可测试的二维物理和三维美术分离；固定步模拟驱动游戏、镜头和动画。区域是根据原版截图手工重建的独立数据，首页/地图/奖励/结局协调完整战役。沿用游戏站本地打包与 webhook 发布。

**Tech Stack:** JavaScript ES modules, Three.js 0.186.1, esbuild 0.25.12, Web Audio, Gamepad API, Node test, existing native-CDP browser harness.

**Spec:** `docs/superpowers/specs/2026-10-02-rescue-rangers-3d-design.md`

## Global Constraints

- 中文界面；新增 `games/rescue.html`，目录 `rescue/`。固定 Three.js 0.186.1，本地打包无 CDN。
- 全部 11 区域和 8 种 Boss，不能重复模板换皮；保留原版分支、奖励、结束流程及同屏双人。
- 动态 entity 坐标 x/y 是底部中心；静态平台 y 是顶面；1 世界单位=16 原版像素。
- core 纯 JavaScript，无 Three/DOM/storage 依赖。dt 上限 1/30，内部子步 1/120；key action 是上升沿，暂停/失焦清输入。
- 不增加用户未要求的联网、商店、广告；现有游戏及发布链保留。
- 所有生产代码先有明确失败测试；新模块测试不能只检查源码文本。美术交由实图检验。
- 新资源版本 `20261002rescue1`。新游戏独立存档 key `rescue-rangers-3d-v1`。

---

### Task 1: 原版区域、物理交互、敌人与 Boss 战役

**Files:** Create `rescue/levels.js`, `rescue/core.js`, `rescue/campaign.js`, `rescue/bosses.js`, `tests/rescue-core.test.mjs`, `tests/rescue-levels.test.mjs`, `tests/rescue-campaign.test.mjs`.

**Interfaces:** Produces the exact core/levels/state contract in the spec. `campaign.js` exposes `createCampaign(), completeArea(campaign,id), availableAreas(campaign)`; completing a level records it and unlocks next choices, all completed areas remain replayable. `bosses.js` operates only on plain state and exposes `updateBoss(state,dt)`; hit detection still happens in core.

- [x] Inspect every private PNG in `/tmp/rescue-reference/` with view_image. Record each original area's layout/theme/landmarks/Boss mapping in a concise `rescue/REFERENCE.md`; source images are not shipped. Confirm the tree/restaurant/desk/industrial/vertical-route distinctions; independent data, no shared repeating terrain generator.
- [x] Write meaningful RED tests for directional movement/jump landing; action pickup→hold→throw→enemy hit; down while holding→hide and defend; reusable metal/ball; heavy apple; bigcrate content; holding/throwing teammate and no hold cycle; damage cooldown/3 hearts/life restart; moving/conveyor platform/hazard collision; 11 unique playable areas, branch progression, 8 distinct Boss behavior and five valid ball hits, bonus room collections, complete ending. Expected assertions derive from fixtures, e.g.:

```js
const s = createGame({id:'fixture', width:30,height:12,spawn:{x:2,y:1},platforms:[{id:'floor',x:0,y:1,w:30,h:1}],objects:[{id:'box',kind:'crate',x:2.9,y:1}],enemies:[],hazards:[],decor:[],exit:{x:28,y:1},boss:null},{players:2});
stepGame(s,[{move:0,action:true},{move:0}],1/60);
assert.deepEqual(s.players[0].carrying,{type:'object',id:'box'});
stepGame(s,[{move:0,action:false},{move:0}],1/60);
stepGame(s,[{move:0,action:true},{move:0}],1/60);
assert.equal(s.players[0].carrying,null);
assert.ok(s.objects.find(o=>o.id==='box').vx>0);
```

- [x] Run `node --test tests/rescue-core.test.mjs tests/rescue-levels.test.mjs tests/rescue-campaign.test.mjs`, observe missing behavior failures, then implement exact interfaces.
- [x] For level data, hand author platform path plus recognizable original landmarks and enemy/object arrangement. Verify route reachability with independent small jump/reachability fixtures; preserve vertical A/F/H and multi-section 0/J. Record any precise reference gaps in report, do not quietly replace with a different game.
- [x] Run focused tests and `npm run test:unit` once, fix real failures, `git diff --check`, commit only task files. Report API deviations, commands/results and remaining fidelity questions.

### Task 2: 三维角色、材质、关卡场景和共享镜头

**Files:** Create `rescue/avatar.js`, `rescue/models.js`, `rescue/materials.js`, `rescue/scenery.js`, `rescue/scene.js`, `rescue/THIRD-PARTY-NOTICES.txt`, `tests/rescue-render.test.mjs`.

**Interfaces:** Consumes Task 1's immutable level and dynamic state. Produces `createScene(canvas)` per spec, no simulation mutation. Avatar returns `{group,update(player,time),dispose()}`. Models expose named constructors for crate/metal/apple/ball, enemy categories and Boss types.

- [x] Write RED tests around real model constructors: character poses actually move limb transforms for running/holding/hidden, different enemies/Bosses have distinct visible meshes; material cache shares textures and releases owned resources; camera frame includes both real player bounds. Avoid fixed triangle-count snapshots.

```js
const actor=createAvatar('chip');
actor.update({x:2,y:1,facing:1,animation:'carry',carrying:{type:'object',id:'box'},hidden:false,invulnerable:0},0.2);
assert.ok(actor.group.getObjectByName('left-arm').rotation.z < -0.5);
```

- [x] Run `node --test tests/rescue-render.test.mjs`, confirm RED, then implement smooth recognizable characters, all object/enemy/Boss models, shared wood/metal/brick/fabric/leaf textures and shadows.
- [x] Implement every theme's three-dimensional landmarks based on `level.decor`; shared scenery constructors may be reused but stage composition must remain distinct. Use instancing for repeating leaves/tiles/wires and bounded hit particles. Center camera follows both characters, fit width/height and aspect, no free orbit needed for side-scrolling play.
- [x] Implement high/auto/low quality, adaptive DPR/shadow downshift, measured diagnostics, explicit WebGL error, resource dispose/cache lifecycle. Repeated setLevel does not accumulate textures/geometries.
- [x] Run focused renderer tests and affected unit checks once, commit task files. Root will inspect actual gameplay screenshots during Task 3.

### Task 3: 可玩页面、双手柄/键盘/触控、音效与完整 UI

**Files:** Create `games/rescue.html`, `rescue/game.js`, `rescue/controls.js`, `rescue/audio.js`, `rescue/profile.js`, `rescue/style.css`, `tests/rescue-input.test.mjs`, `tests/rescue-profile.test.mjs`, `tests/rescue-browser.mjs`; modify `package.json` with `build:rescue` and add browser check; create `rescue/bundle.js`.

**Interfaces:** Consumes Tasks 1/2. Controls/audio/profile produce exact spec interfaces. Main entry binds full loop to home/map/play/bonus/ending UI, stores completed branches and options, never exports a test-only cheat API. Use canvas dataset for genuine diagnostics (player positions, carrying count, theme, phase, graphics stats).

**Input defaults:** P1 A/D move, W/S up/down, Space jump, E pickup/throw; P2 Left/Right move, Up/Down up/down, Enter jump, RightShift pickup/throw; Escape pauses. Standard gamepad A (button 0) jumps, B (button 1) acts, Start (button 9) pauses; axes/D-pad move and choose upthrow/down crouch or one-way drop. Bind distinct available gamepad indices once, neutralize only a disconnected player's pad without shifting the other, and bind the sole available pad to P1 in solo mode. Touch joystick includes vertical up/down, with separate jump/action buttons. Capture brief key/touch presses until sampled; after clear/pause, held buttons must release before triggering a new action.

- [ ] Write RED input tests for independent keys, two distinct standard Gamepad indices, same-button holds not retriggering, hot disconnect neutralizes only lost controller, deadzone, clear/blur. Sample API receives state via production constructor injection only if needed at normal external boundary; do not assert on mocks.
- [ ] Write RED storage tests for normal save/reload, malformed data/default, unknown area filtering, storage exceptions visible and no falsely saved success.
- [ ] Write native-CDP RED browser tests: page boots real 3D scene, play button starts; real keys move/jump, first visible box is picked up and thrown; two players move independently; hidden state; pause prevents movement and resume consumes fresh input; touch move/action/jump, all visible controls >=48px across 320×568,568×320,390×844,844×390,820×1180,1440×900; background/BFCache; map and reload progress; no Runtime errors.
- [ ] Run focused RED files, implement modules and UI with no out-of-game technical wording; user gesture unlocks audio, pause/hidden stops music; synth original melody variations and events.
- [ ] Add `"build:rescue": "esbuild rescue/game.js --bundle --format=esm --minify --legal-comments=none --outfile=rescue/bundle.js"`; pin assets to `20261002rescue1`. Build, inspect first game and all themes/Boss screenshots with view_image. Fix camera occlusion, characters, background scale and touch issues before commit.
- [ ] Run focused unit/browser checks, repeated area resource counts, `git diff --check`, commit task files; report hardware-independent tests separately from real physical handpads.

### Task 4: 游戏厅接入、完整门禁、独立审查、部署与公网验收

**Files:** Modify `games.js`, `README.md`, affected real game-hall count tests; create `tests/rescue-integration-browser.mjs`, `openspec/changes/rescue-rangers-3d/verification.md`, maintain plan checkboxes.

**Interfaces:** New catalog item `file:'games/rescue.html',emoji:'🐿️',name:'松鼠大作战',desc:'11个经典区域的3D横版重制，举箱子、扔队友，双人合作救援',tags:['经典','3D','双人','手柄','闯关']`. Existing 11 catalog items stay unchanged. Same origin deployment and existing server remain active.

- [ ] Write RED integration browser checks that search the hall, click the actual new card, start a game, perform native movement/pickup/throw, reload and return to hall. Change literal card counts only where the existing scenario now genuinely has 12 cards; retain all original behavior assertions.
- [ ] Add new catalog/README entry and version query; append integration test to existing browser pipeline without removing/replacing any existing checks. No required build/deploy script restructuring.
- [ ] Verify full campaign in real simulator against authored routes and real input, all 11 areas/Bosses without teleporting or forcing clears. Record precise unit versus UI/campaign coverage. Run `npm run build:rescue`, `npm run test:unit` and full `npm run test:browser` once at the final reviewed version; after later narrow fixes only affected checks need repeat.
- [ ] Use requesting-code-review for broad whole-branch review, address all material findings and scoped re-review. Fresh remote main reconciliation preserves other feature work.
- [ ] Create PR with exact final implementation and test evidence, merge under user's already authorized publication scope; webhook deploys. Check online `games.js`, HTML, bundle and CSS hashes against final files; verify main domain game-hall click, real play, saved progress and screenshots using native browser. Check secondary shared domain route too.
- [ ] Record public result, commit/PR, resource hashes, evidence paths and any concrete remaining limitations in verification.md, commit/push documentation through same project flow. Final reply links the actual playable URL and concise controls, only claiming what was verified.
