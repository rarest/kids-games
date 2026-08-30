# 《合成4096》爽快玩法重做 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将《合成4096》改造成可选择三种难度、五列联动、幸运牌不跳级、连击奖励丰富，并能安全返回小火箭游戏厅的爽快合成游戏。

**Architecture:** 保持浏览器原生 ES Modules 架构，将纯规则留在 `game-core.js`，难度和平衡参数集中到新建的 `difficulty.js`，存档迁移留在 `save.js`，DOM 控制留在 `app.js`。所有规则先用 Node 单元测试确定，再通过真实手机视口浏览器测试覆盖难度选择、幸运牌、拖放、保存与大厅导航。

**Tech Stack:** HTML5、CSS、原生 JavaScript ES Modules、Node.js `node:test`、Chromium CDP、静态站点与 Cloudflare 缓存版本参数。

**Spec:** `docs/superpowers/specs/2026-08-30-merge4096-gameplay-redesign-design.md`

## Global Constraints

- 五列竖直牌堆，每列容量固定为 12。
- 所有难度的通关目标均为合成 4096。
- 牌库上限保持 10,000 张；游戏界面不得显示距离下一张幸运牌还有多少张。
- 默认难度为欢乐，目标时长约 8～10 分钟。
- 永久炸弹 50 金币、蜡烛 60 金币；新玩家保留 500 金币与 3 根蜡烛。
- 拖放和点击牌列两种放牌方式必须同时可用。
- 每次公开资源改动必须更新 HTML 入口及其 ES Module 子依赖缓存版本。
- 所有奖励先持久化再播放动画，不能因刷新重复领取。

---

### Task 1: 难度配置与动态抽牌

**Files:**
- Create: `merge4096/difficulty.js`
- Modify: `merge4096/game-core.js`
- Modify: `tests/merge4096-core.test.mjs`
- Create: `tests/merge4096-difficulty.test.mjs`

**Interfaces:**
- Produces: `DIFFICULTIES`, `getDifficulty(id)`, `ordinaryValueCap(roundMax)`, `allowedValuesForDraw(game)`, `createGame(difficultyId, random)`。
- `DIFFICULTIES` 的键固定为 `easy`、`joy`、`challenge`；每项包含 `luckyEvery`、`winReward`、`lossReward`、`pairBias`。

- [ ] **Step 1: 写难度配置失败测试**

```js
test('joy is the default balanced difficulty',()=>{
  assert.deepEqual(getDifficulty('joy'),{id:'joy',luckyEvery:25,winReward:300,lossReward:100,pairBias:.45});
  assert.equal(getDifficulty('unknown').id,'joy');
});
```

- [ ] **Step 2: 运行测试并确认因模块不存在而失败**

Run: `node --test tests/merge4096-difficulty.test.mjs`
Expected: FAIL，提示找不到 `merge4096/difficulty.js`。

- [ ] **Step 3: 实现难度配置和普通牌上限**

```js
export const DIFFICULTIES=Object.freeze({
  easy:{id:'easy',luckyEvery:15,winReward:200,lossReward:60,pairBias:.65},
  joy:{id:'joy',luckyEvery:25,winReward:300,lossReward:100,pairBias:.45},
  challenge:{id:'challenge',luckyEvery:35,winReward:450,lossReward:150,pairBias:0}
});
export const getDifficulty=id=>DIFFICULTIES[id]??DIFFICULTIES.joy;
export const ordinaryValueCap=roundMax=>Math.max(8,Math.min(512,2**Math.floor(Math.log2(Math.max(32,roundMax)))-2));
```

- [ ] **Step 4: 写并验证动态抽牌与保底失败测试**

```js
test('sixth ordinary draw after five misses matches a visible bottom card',()=>{
  const game=state({difficulty:'joy',missStreak:5,columns:[[32],[8],[],[],[]],deck:[]});
  const drawn=drawGeneratedCard(game,()=>0);
  assert.ok([32,8].includes(drawn.pendingCard.value));
  assert.equal(drawn.missStreak,0);
});
```

Run: `node --test tests/merge4096-core.test.mjs`
Expected: FAIL，提示 `drawGeneratedCard` 或新状态字段不存在。

- [ ] **Step 5: 修改建局与抽牌实现**

`createGame(difficultyId='joy',random=Math.random)` 写入 `difficulty`、`missStreak`、`rerolls`、`temporaryBombs`、`comboCoins`，并按 `luckyEvery` 生成幸运牌位置。普通牌由当前最高值和底牌配对情况动态生成；前 5 次不匹配后，第 6 张从非空列底牌中抽取。

- [ ] **Step 6: 运行难度和核心规则测试**

Run: `node --test tests/merge4096-difficulty.test.mjs tests/merge4096-core.test.mjs`
Expected: PASS。

- [ ] **Step 7: 提交**

```bash
git add merge4096/difficulty.js merge4096/game-core.js tests/merge4096-difficulty.test.mjs tests/merge4096-core.test.mjs
git commit -m "feat: add merge 4096 difficulty and fair draws"
```

### Task 2: 五列左右连锁

**Files:**
- Modify: `merge4096/game-core.js`
- Modify: `tests/merge4096-core.test.mjs`

**Interfaces:**
- Produces: `resolvePlacement(columns, columnIndex, value)` 返回 `{columns,comboCount,createdValue}`。
- `placePendingCard` 使用 `resolvePlacement`，固定先本列、再左列、再右列，直到稳定。

- [ ] **Step 1: 写左右合成失败测试**

```js
test('a vertical merge pulls an equal left bottom card into the active column',()=>{
  const result=placePendingCard(state({pendingCard:{kind:'number',value:32},columns:[[64],[32],[],[],[]]}),1);
  assert.deepEqual(result.state.columns,[[ ],[128],[],[],[]]);
  assert.equal(result.comboCount,2);
});
```

- [ ] **Step 2: 写左右同时相同的确定性失败测试**

```js
test('cross-column resolution checks left before right',()=>{
  const result=placePendingCard(state({pendingCard:{kind:'number',value:64},columns:[[128],[64],[128],[],[]]}),1);
  assert.deepEqual(result.state.columns,[[ ],[256],[ ],[],[]]);
  assert.equal(result.comboCount,3);
});
```

- [ ] **Step 3: 运行并确认当前只做本列合成**

Run: `node --test tests/merge4096-core.test.mjs`
Expected: FAIL，实际结果保留相邻列底牌。

- [ ] **Step 4: 实现活动列稳定结算器**

实现循环：本列末端两张相同则合成；否则检查左邻底牌；再检查右邻底牌。每次成功后从本列合并重新开始。合成值达到 4096 立即保留结果并返回。

- [ ] **Step 5: 运行核心测试并检查旧的不同数字不合成规则**

Run: `node --test tests/merge4096-core.test.mjs`
Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add merge4096/game-core.js tests/merge4096-core.test.mjs
git commit -m "feat: chain merges across adjacent columns"
```

### Task 3: 幸运牌、连击奖励与局内道具

**Files:**
- Modify: `merge4096/game-core.js`
- Modify: `tests/merge4096-core.test.mjs`

**Interfaces:**
- Replaces: `chooseLuckyValue(state,value)`。
- Produces: `useLuckyCopy(state,columnIndex)`, `useLuckyRemove(state,columnIndex)`, `useLuckyUpgrade(state,random)`, `consumeReroll(state,random)`。
- `applyComboRewards(state,comboCount)` 更新 `rerolls`、`temporaryBombs`、`comboCoins`，其中金币上限为 60。

- [ ] **Step 1: 写幸运牌限制失败测试**

```js
test('lucky copy can only copy a non-empty bottom card',()=>{
  const lucky=state({pendingCard:{kind:'lucky'},columns:[[16],[],[],[],[]]});
  assert.equal(useLuckyCopy(lucky,0).pendingCard.value,16);
  assert.throws(()=>useLuckyCopy(lucky,1),/空列/);
});
```

- [ ] **Step 2: 写幸运移除和升级失败测试**

验证移除底牌会触发稳定结算；升级结果不超过普通牌上限的两倍且不能直接超过 512。

- [ ] **Step 3: 写连击奖励失败测试**

```js
test('combo rewards grant reroll bomb and capped coins',()=>{
  assert.equal(applyComboRewards(state(),4).rerolls,1);
  assert.equal(applyComboRewards(state(),5).temporaryBombs,1);
  let game=state({comboCoins:40});
  game=applyComboRewards(game,6);
  game=applyComboRewards(game,7);
  assert.equal(game.comboCoins,60);
});
```

- [ ] **Step 4: 运行测试并确认失败原因对应缺失接口**

Run: `node --test tests/merge4096-core.test.mjs`
Expected: FAIL，提示新函数未导出。

- [ ] **Step 5: 实现三种幸运效果和连击奖励**

复制效果把底牌值转换为普通待放牌；移除效果删除底牌并以该列为活动列稳定结算；升级效果从当前允许值抽取后乘二并封顶 512。四连、五连、六连奖励分别写入局内字段。

- [ ] **Step 6: 调整炸弹与结算**

`useBomb` 优先消耗 `temporaryBombs`，UI 层只有在没有临时炸弹时才扣永久炸弹。`settleGame` 根据 `state.difficulty` 读取胜负奖励并加上 `comboCoins`，继续依赖 `rewardClaimed` 防止重复结算。

- [ ] **Step 7: 运行核心测试**

Run: `node --test tests/merge4096-core.test.mjs tests/merge4096-difficulty.test.mjs`
Expected: PASS。

- [ ] **Step 8: 提交**

```bash
git add merge4096/game-core.js tests/merge4096-core.test.mjs
git commit -m "feat: rebalance lucky cards and combo rewards"
```

### Task 4: 存档迁移与分难度记录

**Files:**
- Modify: `merge4096/save.js`
- Modify: `tests/merge4096-save.test.mjs`

**Interfaces:**
- Produces: `STORAGE_KEY='merge4096-save-v2'`, `createDefaultRecords()`, `migrateSave(value)`。
- Profile 新增 `records.easy|joy|challenge`，每项为 `{best,wins}`；保留兼容显示字段 `best`、`lastResult`。

- [ ] **Step 1: 写新存档默认值失败测试**

```js
test('new save has separate records for all difficulties',()=>{
  const save=createDefaultSave();
  assert.deepEqual(save.profile.records,{easy:{best:0,wins:0},joy:{best:0,wins:0},challenge:{best:0,wins:0}});
});
```

- [ ] **Step 2: 写旧存档迁移失败测试**

旧 `version:1` 的金币、炸弹、蜡烛、音乐、最高值和上局结果被保留；旧 `currentGame` 被设为 `null`，且不增加金币。

- [ ] **Step 3: 运行并确认失败**

Run: `node --test tests/merge4096-save.test.mjs`
Expected: FAIL，缺少 records 或迁移行为。

- [ ] **Step 4: 实现 v2 校验与迁移**

`loadSave` 先尝试 v2 key；没有时读取 v1 key，通过 `migrateSave` 转换并立即写入 v2。迁移后的旧总体最高记录放入 `joy.best`，旧 wins 放入 `joy.wins`，以默认难度承接历史数据。

- [ ] **Step 5: 运行存档与核心测试**

Run: `node --test tests/merge4096-save.test.mjs tests/merge4096-core.test.mjs`
Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add merge4096/save.js tests/merge4096-save.test.mjs
git commit -m "feat: migrate merge 4096 difficulty records"
```

### Task 5: 难度、幸运牌和导航界面

**Files:**
- Modify: `games/merge4096.html`
- Modify: `merge4096/styles.css`
- Modify: `merge4096/app.js`
- Modify: `tests/merge4096-page.test.mjs`

**Interfaces:**
- Consumes: Tasks 1–4 的难度、幸运牌、连击奖励和 v2 存档接口。
- Produces DOM IDs: `hallButton`, `difficultyDialog`, `easyMode`, `joyMode`, `challengeMode`, `restartButton`, `luckyCopy`, `luckyRemove`, `luckyUpgrade`, `rerollButton`, `temporaryBombCount`, `resultHallButton`。

- [ ] **Step 1: 写页面结构失败测试**

断言主页存在返回大厅链接，难度对话框含三种模式且欢乐标记为推荐，结算页存在返回大厅按钮，游戏顶部显示重抽和临时炸弹数量。

- [ ] **Step 2: 运行页面测试并确认缺失控件**

Run: `node --test tests/merge4096-page.test.mjs`
Expected: FAIL，提示 `hallButton` 或 `difficultyDialog` 不存在。

- [ ] **Step 3: 添加 HTML 与响应式样式**

主页按钮使用 `<a id="hallButton" href="../index.html">返回小火箭游戏厅</a>`；开始按钮无对局时打开难度对话框，有对局时直接继续。难度卡必须在 390px 宽度内单列显示并保持至少 44px 触摸高度。

- [ ] **Step 4: 连接难度选择和分难度记录**

选择模式后调用 `createGame(mode)`。主页以当前选中模式显示该模式最高值与通关次数；切换预览不改变进行中对局。

- [ ] **Step 5: 连接幸运牌三个动作**

幸运对话框显示三个效果；需要选列的效果进入明确的工具模式并高亮有效牌列。完成效果后关闭对话框、持久化、播放效果并结算连锁。

- [ ] **Step 6: 连接连击和局内道具显示**

三连以上沿用文字与烟花；四连刷新重抽数量；五连刷新临时炸弹数量；六连显示 `+20金币`，但只累积到结算奖励，不立刻修改账户金币。

- [ ] **Step 7: 增加重新开始确认与导航**

有进行中对局时显示“重新开始”；确认后才清空旧局并打开难度选择。主页和结算页返回大厅，游戏内退出只返回本游戏主页。

- [ ] **Step 8: 运行页面与核心测试**

Run: `node --test tests/merge4096-page.test.mjs tests/merge4096-core.test.mjs tests/merge4096-save.test.mjs`
Expected: PASS。

- [ ] **Step 9: 提交**

```bash
git add games/merge4096.html merge4096/styles.css merge4096/app.js tests/merge4096-page.test.mjs
git commit -m "feat: add merge 4096 modes and hall navigation"
```

### Task 6: 浏览器流程、平衡模拟与部署缓存

**Files:**
- Modify: `tests/merge4096-browser-smoke.mjs`
- Create: `tests/merge4096-balance.test.mjs`
- Modify: `tests/merge4096-page.test.mjs`
- Modify: `games/merge4096.html`
- Modify: `merge4096/app.js`

**Interfaces:**
- Browser test accepts existing `MERGE4096_TEST_ORIGIN` for local and public runs。
- Balance test runs deterministic seeded simulations and asserts easy median draws < joy median draws < challenge median draws。

- [ ] **Step 1: 扩展真实手机浏览器失败测试**

测试从大厅查找并点击《合成4096》，选择欢乐模式，抽牌并触摸拖放，使用点击放牌作为第二输入方式，退出保存，刷新继续，并验证主页与结算页的大厅链接。

- [ ] **Step 2: 运行浏览器测试并确认新流程尚未满足**

Run: `node --test tests/merge4096-browser-smoke.mjs`
Expected: FAIL，缺少难度选择或大厅入口断言。

- [ ] **Step 3: 添加确定性平衡模拟**

使用固定种子和“优先匹配底牌、其次放最短列”的自动玩家，各难度模拟至少 100 局。断言通关率不为零、欢乐模式多数对局在设计目标的抽牌区间结束，并输出中位抽牌数供调参。

- [ ] **Step 4: 仅调整 `difficulty.js` 参数直到模拟通过**

不得为通过模拟改变通关目标、列数或列容量；只调整 `pairBias`、普通牌权重和幸运牌间隔之外的难度权重参数。

- [ ] **Step 5: 更新完整缓存版本**

为 `styles.css`、入口 `app.js` 以及所有被本次修改的 ES Module 子依赖统一加入新版本参数；页面测试必须逐一断言这些 URL 使用相同版本。

- [ ] **Step 6: 运行完整验证**

Run: `npm test`
Expected: 所有单元测试和四组浏览器测试 PASS，0 failures。

- [ ] **Step 7: 提交**

```bash
git add games/merge4096.html merge4096/app.js tests/merge4096-browser-smoke.mjs tests/merge4096-balance.test.mjs tests/merge4096-page.test.mjs merge4096/difficulty.js
git commit -m "test: verify merge 4096 redesign and balance"
```

- [ ] **Step 8: 合并、推送并验证正式站点**

```bash
git push origin main
MERGE4096_TEST_ORIGIN=https://games.596996.xyz node --test tests/merge4096-browser-smoke.mjs
```

Expected: 正式大厅显示《合成4096》入口；手机流程从大厅进入、选择难度、抽牌、拖放、退出和恢复全部 PASS。
