# 皇冠迷宫 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在小火箭游戏厅上线包含 10 个普通迷宫、9 个奖励迷宫、金币商店、消耗道具、皮肤、真实录音和持久进度的“皇冠迷宫”。

**Architecture:** 以无 DOM 的规则模块为核心，19 张固定网格地图作为数据输入，Canvas 负责华丽主题渲染，DOM 负责主页、商店、关卡地图和 HUD。版本化 localStorage 保存经济与旅程状态，真实录音由独立音频控制器按首次触摸解锁。

**Tech Stack:** HTML5、CSS、ES modules、Canvas 2D、Web Audio/HTMLAudio、Node.js `node:test`、Chromium DevTools Protocol、1Panel/OpenResty 静态部署。

**Spec:** `docs/superpowers/specs/2026-08-29-luxury-maze-game-design.md`

## Global Constraints

- 19 张固定地图布局和背景必须互不相同，不能在运行时随机生成。
- 普通/奖励第 N 关都必须有 N 把钥匙、N 个钥匙死角和 N+1 个空死角。
- 奖励关金币依次为 5、8、11、14、17、20、23、26、29，总计 153 枚，且每枚只能永久领取一次。
- 奖励关不能直接重玩；普通关可以直接重玩。
- 迷宫主体只用 Canvas 矢量色块、渐变、阴影与光效绘制，不用简单贴图。
- 音效使用原创或许可明确的 CC0 真实录音，保留来源清单。
- 所有新行为先写失败测试，确认预期失败后再实现。
- 手机基准视口为 390×844，Canvas DPR 上限为 2。

---

## File Structure

- `games/maze.html`：游戏页面骨架、主页、商店、关卡地图、HUD、Canvas 和弹层。
- `maze/game.css`：响应式布局、玻璃色块、立体方向键、商店和关卡节点。
- `maze/levels.js`：19 张固定地图和主题数据。
- `maze/level-tools.js`：地图解析、死角统计、可达性、最短路线和验证。
- `maze/engine.js`：移动、钥匙、金币、锁门、炸药、钩子、星级和关卡状态。
- `maze/economy.js`：商店价格、皮肤显示、购买、装备和金币永久记录。
- `maze/save.js`：版本化存档创建、清洗、读取与写入。
- `maze/render.js`：主题色块、阴影、人物、物件、镜头和粒子。
- `maze/audio.js`：录音解锁、播放、音量和脚步节流。
- `maze/main.js`：页面路由、输入、循环、模块协调和存档落盘。
- `maze/audio/*.webm`：真实录制音频。
- `maze/audio/LICENSES.md`：音频来源、作者、许可和下载页。
- `tests/*.test.mjs`：规则、地图、经济、存档和资源测试。
- `games.js`：小火箭游戏厅入口清单。

### Task 1: 测试框架、地图接口与验证器

**Files:**
- Modify: `package.json`
- Create: `maze/level-tools.js`
- Create: `tests/level-tools.test.mjs`

**Interfaces:**
- Produces: `parseGrid(rows) -> {width,height,walls:Set<string>,floors:Set<string>}`
- Produces: `neighbors(cell, grid) -> Cell[]`
- Produces: `findDeadEnds(level) -> Cell[]`
- Produces: `validateLevel(level) -> string[]`
- Produces: `shortestCompletionSteps(level) -> number`

- [ ] **Step 1: 写失败测试，定义网格与死角行为**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import * as tools from '../maze/level-tools.js';

test('parseGrid rejects ragged or open-boundary maps', () => {
  assert.throws(() => tools.parseGrid(['#####', '#...#', '####']), /same width/);
  assert.throws(() => tools.parseGrid(['#####', '....#', '#####']), /boundary/);
});

test('findDeadEnds excludes start and exit', () => {
  const level = { rows:['#####','#...#','###.#','#...#','#####'], start:{x:1,y:1}, exit:{x:1,y:3} };
  assert.deepEqual(tools.findDeadEnds(level), [{x:3,y:1},{x:3,y:3}]);
});
```

- [ ] **Step 2: 运行 `node --test tests/level-tools.test.mjs`，确认因接口不存在而 FAIL。**

- [ ] **Step 3: 实现坐标键、四邻居、边界校验、死角统计、BFS 可达性和带钥匙位掩码的最短通关搜索。**

`validateLevel` 必须返回稳定错误码数组：`RAGGED_GRID`、`OPEN_BOUNDARY`、`UNREACHABLE_KEY`、`UNREACHABLE_EXIT`、`KEY_COUNT`、`KEY_NOT_DEAD_END`、`EMPTY_DEAD_END_COUNT`、`COIN_COUNT`、`DUPLICATE_OBJECT`。

- [ ] **Step 4: 运行 `node --test tests/level-tools.test.mjs`，确认全部 PASS。**

- [ ] **Step 5: 提交。**

```bash
git add package.json maze/level-tools.js tests/level-tools.test.mjs
git commit -m "feat: add maze level validation tools"
```

### Task 2: 19 张固定关卡与主题

**Files:**
- Create: `maze/levels.js`
- Create: `tests/levels.test.mjs`

**Interfaces:**
- Consumes: `validateLevel`, `findDeadEnds`, `shortestCompletionSteps` from Task 1.
- Produces: `LEVELS: Level[]`，每项含 `id,type,index,name,rows,start,exit,keys,coins,breakableWalls,theme,parSteps`。
- Produces: `getLevel(id) -> Level | null`。

- [ ] **Step 1: 写失败测试，锁定 19 关数量、交错顺序和所有不变量。**

```js
test('campaign contains ten normal and nine interleaved reward maps', () => {
  assert.equal(LEVELS.length, 19);
  assert.deepEqual(LEVELS.map(l => l.type), ['normal','reward','normal','reward','normal','reward','normal','reward','normal','reward','normal','reward','normal','reward','normal','reward','normal','reward','normal']);
});

test('every fixed map is valid and unique', () => {
  const signatures = new Set();
  for (const level of LEVELS) {
    assert.deepEqual(validateLevel(level), [], level.id);
    assert.equal(level.keys.length, level.index, level.id);
    assert.equal(findDeadEnds(level).length, level.index * 2 + 1, level.id);
    if (level.type === 'reward') assert.equal(level.coins.length, 5 + 3 * (level.index - 1), level.id);
    signatures.add(level.rows.join('\n'));
  }
  assert.equal(signatures.size, 19);
});
```

- [ ] **Step 2: 运行 `node --test tests/levels.test.mjs`，确认因 `LEVELS` 不存在而 FAIL。**

- [ ] **Step 3: 创建 19 个显式字符串网格。**

尺寸从普通 1 的 11×11 递增到普通 10 的 31×31；奖励关使用更宽的视觉通道配置。每关把钥匙放入指定死角、空出 N+1 个误导死角，奖励关再放唯一金币坐标。主题对象必须定义 `sky,ground,wall,wallEdge,wallShadow,accent,gem,glow,decor`。

- [ ] **Step 4: 为每关计算并写入 `parSteps = shortestCompletionSteps(level)`，运行测试，逐张修正直到 19 关全部 PASS。**

- [ ] **Step 5: 提交。**

```bash
git add maze/levels.js tests/levels.test.mjs
git commit -m "feat: add nineteen handcrafted maze stages"
```

### Task 3: 规则引擎、钥匙、门与一次性道具

**Files:**
- Create: `maze/engine.js`
- Create: `tests/engine.test.mjs`

**Interfaces:**
- Consumes: `Level` from Task 2.
- Produces: `createRun(level, collectedCoinIds) -> RunState`
- Produces: `move(state, direction) -> {state,event}`
- Produces: `useDynamite(state, direction) -> {state,event,consumed}`
- Produces: `useHook(state, direction) -> {state,event,consumed}`
- Produces: `starsFor(steps, parSteps) -> 1|2|3`

- [ ] **Step 1: 写失败测试覆盖移动、碰墙、钥匙变金、锁门和全部钥匙开门。**

```js
test('exit stays locked until every key is collected', () => {
  let run = createRun(fixtureLevel, new Set());
  ({state:run} = move(run, 'right'));
  assert.equal(run.keysCollected.size, 1);
  const locked = move({...run, player:{...fixtureLevel.exit}}, 'left');
  assert.equal(locked.event.type, 'door-locked');
});
```

- [ ] **Step 2: 运行 `node --test tests/engine.test.mjs`，确认 FAIL。**

- [ ] **Step 3: 实现不可变状态更新、事件对象和星级边界。**

事件只允许：`step`、`wall-bump`、`key-collected`、`coin-collected`、`door-locked`、`level-complete`、`wall-destroyed`、`hook-travel`、`invalid-item-use`。

- [ ] **Step 4: 先写并运行炸药/钩子失败测试。**

```js
assert.deepEqual(useDynamite(run,'up').consumed, true);
assert.equal(useDynamite(boundaryRun,'left').consumed, false);
assert.deepEqual(useHook(twoWallRun,'right').state.player, {x:5,y:3});
assert.equal(useHook(noLandingRun,'right').consumed, false);
```

- [ ] **Step 5: 实现炸药只破坏 `breakableWalls`，钩子只跨 1～2 面连续墙并要求安全落点。运行完整引擎测试并确认 PASS。**

- [ ] **Step 6: 提交。**

```bash
git add maze/engine.js tests/engine.test.mjs
git commit -m "feat: implement maze rules and consumable tools"
```

### Task 4: 存档、旅程与经济系统

**Files:**
- Create: `maze/save.js`
- Create: `maze/economy.js`
- Create: `tests/save.test.mjs`
- Create: `tests/economy.test.mjs`

**Interfaces:**
- Produces: `createDefaultSave() -> SaveV1`
- Produces: `sanitizeSave(value) -> SaveV1`
- Produces: `purchase(save, sku) -> {save,ok,reason}`
- Produces: `equipSkin(save, skinId) -> {save,ok}`
- Produces: `availableSkins(save) -> SkinDefinition[]`
- Produces: `awardCoin(save, coinId) -> SaveV1`
- Produces: `canEnterStage(save, level) -> boolean`
- Produces: `completeStage(save, result) -> SaveV1`
- Produces: `restartJourney(save) -> SaveV1`

- [ ] **Step 1: 写失败测试锁定价格和隐藏皮肤条件。**

```js
assert.equal(purchase({...save,coins:3},'dynamite').save.inventory.dynamite,1);
assert.equal(purchase({...save,coins:3},'hook').save.coins,0);
assert.equal(purchase({...save,coins:1},'skin-blue').save.ownedSkins.includes('blue'),true);
assert.equal(availableSkins(save).some(s=>s.id==='silver'),false);
assert.equal(availableSkins({...save,completedNormal:[1]}).some(s=>s.id==='silver'),true);
```

- [ ] **Step 2: 运行经济和存档测试，确认 FAIL。**

- [ ] **Step 3: 实现价格表：炸药 1、钩子 3、七种普通皮肤各 1、三种隐藏皮肤各 3；隐藏皮肤分别要求普通 1/5/7 已通关。**

- [ ] **Step 4: 写失败测试锁定金币幂等与奖励关重进规则。**

```js
const once = awardCoin(save,'reward-2:4,7');
const twice = awardCoin(once,'reward-2:4,7');
assert.equal(twice.coins, once.coins);
assert.equal(canEnterStage(completedSave, reward2), false);
assert.equal(canEnterStage(restartJourney(completedSave), normal1), true);
```

- [ ] **Step 5: 实现存档清洗、金币位置集合、普通关直接重玩、奖励关仅当前旅程顺序进入。运行全部测试并确认 PASS。**

- [ ] **Step 6: 提交。**

```bash
git add maze/save.js maze/economy.js tests/save.test.mjs tests/economy.test.mjs
git commit -m "feat: add campaign persistence and maze economy"
```

### Task 5: 页面骨架、主页、商店与 19 节点地图

**Files:**
- Create: `games/maze.html`
- Create: `maze/game.css`
- Create: `tests/page-structure.test.mjs`

**Interfaces:**
- Produces DOM IDs: `homeScreen`, `shopScreen`, `mapScreen`, `gameScreen`, `resultScreen`, `mazeCanvas`, `keyRack`, `dpad`, `inventoryBar`。
- Produces buttons: `startButton`, `shopButton`, `backHomeButton`, `itemShopTab`, `skinShopTab`, `restartJourneyButton`。

- [ ] **Step 1: 写失败的静态页面结构测试。**

测试读取 `games/maze.html` 并使用明确的 ID 清单断言所有屏幕、Canvas、HUD、四个方向按钮、炸药和钩子按钮存在；读取 CSS 并断言触控按钮最小尺寸变量为 `--touch-size: 56px`。

- [ ] **Step 2: 运行 `node --test tests/page-structure.test.mjs`，确认 FAIL。**

- [ ] **Step 3: 创建页面和 CSS。**

主页只突出“开始游戏”和“商店”；商店分道具/皮肤页；地图容纳 19 个交错节点；游戏页顶部为钥匙槽位，中部 Canvas，底部为方向键和道具。全部面板使用至少三层色块、`box-shadow`、渐变边缘和安全区 `env(safe-area-inset-*)`。

- [ ] **Step 4: 运行结构测试和 390×844 Chromium DOM 检查，确认无横向滚动且 PASS。**

- [ ] **Step 5: 提交。**

```bash
git add games/maze.html maze/game.css tests/page-structure.test.mjs
git commit -m "feat: build luxury maze screens and shop layout"
```

### Task 6: Canvas 华丽渲染、镜头、粒子与方向键输入

**Files:**
- Create: `maze/render.js`
- Create: `tests/render-model.test.mjs`

**Interfaces:**
- Produces: `createRenderer(canvas) -> Renderer`
- `Renderer.resize(viewport,dpr)`、`Renderer.setLevel(level)`、`Renderer.emit(effect)`、`Renderer.draw(state,now)`。
- Produces: `cameraFor(player, level, viewport) -> {x,y,scale}`。

- [ ] **Step 1: 写失败测试验证 DPR 上限、镜头边界和主题必需色块。**

```js
assert.equal(clampDpr(3),2);
assert.deepEqual(cameraFor({x:1,y:1},smallLevel,{width:390,height:500}).mode,'fit');
assert.equal(cameraFor({x:20,y:20},largeLevel,{width:390,height:500}).mode,'follow');
for (const key of ['sky','ground','wall','wallEdge','wallShadow','accent','gem','glow']) assert.ok(theme[key]);
```

- [ ] **Step 2: 运行测试确认 FAIL。**

- [ ] **Step 3: 实现视口变换和分层绘制顺序。**

绘制顺序固定为：主题背景大色块 → 地面阴影块 → 墙体投影 → 墙体主色块 → 金属边缘/高光 → 装饰 → 出口 → 金币/钥匙 → 人物接触影 → 人物/皮肤特效 → 粒子。离屏两格以外的墙和装饰不绘制。

- [ ] **Step 4: 实现人物弹性、碰墙压缩、钥匙/金币粒子、隐藏皮肤拖尾和奖励关暖色星屑；粒子总数硬限制 220。运行测试确认 PASS。**

- [ ] **Step 5: 提交。**

```bash
git add maze/render.js tests/render-model.test.mjs
git commit -m "feat: add shaded canvas maze renderer"
```

### Task 7: 真实录制音频资源与控制器

**Files:**
- Create: `maze/audio.js`
- Create: `maze/audio/footstep.webm`
- Create: `maze/audio/bump.webm`
- Create: `maze/audio/coin.webm`
- Create: `maze/audio/key.webm`
- Create: `maze/audio/door-locked.webm`
- Create: `maze/audio/door-open.webm`
- Create: `maze/audio/purchase.webm`
- Create: `maze/audio/explosion.webm`
- Create: `maze/audio/hook.webm`
- Create: `maze/audio/LICENSES.md`
- Create: `tests/audio.test.mjs`

**Interfaces:**
- Produces: `createAudioController({baseUrl,enabled}) -> {unlock,play,setEnabled,suspend,resume}`。
- `play(name,{volume,rate})` 必须在未解锁/关闭时安全返回 `false`。

- [ ] **Step 1: 写失败测试验证首次交互解锁、关闭静音和 90ms 脚步节流。**

- [ ] **Step 2: 运行 `node --test tests/audio.test.mjs`，确认 FAIL。**

- [ ] **Step 3: 从原创或 CC0 来源取得真实录音，裁剪静音、标准化响度并转为单声道 WebM/Opus；在 `LICENSES.md` 逐项记录原始页面、作者、许可和修改。**

音量基准：脚步 0.10、碰墙 0.14、金币 0.22、钥匙 0.24、门 0.30、炸药 0.34、钩索 0.26；不得用同一文件冒充不同事件。

- [ ] **Step 4: 实现预加载、音量、播放速率轻微随机、脚步节流、页面隐藏暂停；运行音频测试并确认 PASS。**

- [ ] **Step 5: 提交。**

```bash
git add maze/audio.js maze/audio tests/audio.test.mjs
git commit -m "feat: add recorded maze sound effects"
```

### Task 8: 主控制器、完整流程与浏览器集成

**Files:**
- Create: `maze/main.js`
- Create: `tests/public-assets.test.mjs`
- Create: `tests/browser-smoke.mjs`

**Interfaces:**
- Consumes all prior module interfaces.
- Produces observable UI states through `document.body.dataset.screen` and `document.body.dataset.stage` for browser verification.

- [ ] **Step 1: 写失败浏览器流程测试。**

使用 Chromium CDP 在 390×844 手机指标下依次点击商店、返回、开始、普通 1，按方向键移动；断言页面状态切换、钥匙槽数量、金币/库存显示和 `Runtime.exceptionThrown` 为 0。

- [ ] **Step 2: 运行浏览器测试，确认因 `main.js` 不存在或界面无响应而 FAIL。**

- [ ] **Step 3: 实现屏幕路由、D-pad 点按/长按、道具选向、游戏循环、事件到渲染/音频映射、通关保存、商店购买/装备、普通关重玩和奖励旅程推进。**

移动事件映射必须固定：`step→footstep`、`wall-bump→bump`、`coin-collected→coin+gold-burst`、`key-collected→key+key-burst`、`door-locked→door-locked`、`level-complete→door-open`、`wall-destroyed→explosion`、`hook-travel→hook`。

- [ ] **Step 4: 运行 `npm test` 与手机浏览器流程，修正直到 0 失败、0 页面异常。**

- [ ] **Step 5: 提交。**

```bash
git add maze/main.js tests/public-assets.test.mjs tests/browser-smoke.mjs
git commit -m "feat: connect crown maze game flow"
```

### Task 9: 游戏厅入口、上线与真实站点验收

**Files:**
- Create: `games.js`（保留现有 5 个游戏并新增皇冠迷宫）
- Modify: all new resource URLs with one release version parameter before deployment.

**Interfaces:**
- Produces public URL: `https://games.596996.xyz/games/maze.html`。

- [ ] **Step 1: 写失败测试，断言游戏厅清单保留现有 5 项且包含 `games/maze.html`，总数为 6。**

- [ ] **Step 2: 运行测试确认 FAIL；创建本地 `games.js`，只追加皇冠迷宫入口，运行测试确认 PASS。**

- [ ] **Step 3: 运行完整本地验收。**

```bash
npm test
node --check maze/main.js
node --check maze/engine.js
node --check maze/render.js
```

- [ ] **Step 4: 在 `oci-cc-arm` 对目标文件和现有 `games.js` 创建时间戳备份；上传 `games/maze.html`、`maze/` 和更新后的 `games.js`，权限设为 0644/0755。**

- [ ] **Step 5: 公网逐项验证 HTML、CSS、所有模块和 9 个音频返回 200；核对公网内容与本地发布版本一致。**

- [ ] **Step 6: 用 Chromium 390×844 实际完成主页→商店→关卡地图→普通 1 的移动/收钥匙/开门流程，确认 0 控制台异常；检查游戏厅首页显示 6 张卡片。**

- [ ] **Step 7: 提交发布记录。**

```bash
git add games.js games/maze.html maze tests
git commit -m "release: publish crown maze to game hall"
```
