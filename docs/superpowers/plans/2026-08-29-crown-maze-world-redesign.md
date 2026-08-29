# Crown Maze World Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all 19 corridor-like layouts with fixed, photo-inspired dense mazes of increasing difficulty, then add collision-safe rounded walls, coherent tree/wall shadows, theme-specific ambience, audible movement, and three-second skin trails without changing progression or economy rules.

**Architecture:** Generate deterministic classic-maze layouts offline and commit the resulting rows so replays and coin IDs never move. Keep topology analysis, wall geometry, scene metadata, and motion effects in small pure modules; `render.js` consumes those models and owns Canvas drawing/caches. Existing engine, save, economy, and page flow remain authoritative.

**Tech Stack:** HTML5, CSS, ES modules, Canvas 2D, Web Audio/HTMLAudio, Node.js `node:test`, Chromium DevTools Protocol, static 1Panel/OpenResty deployment.

**Spec:** `docs/superpowers/specs/2026-08-29-crown-maze-world-redesign-design.md`

## Global Constraints

- Preserve 10 normal and 9 reward stages, interleaved into 19 fixed maps.
- Preserve key counts, exact `2n+1` dead ends, reward coin counts/IDs, unlocks, prices, inventory, and journey replay rules.
- Maze difficulty increases by campaign position 1 through 19; stage 19 is the densest and hardest.
- Main walls and short barriers remain continuous, smooth, theme-colored surfaces with coherent ground shadows and no internal tile seams.
- Decorative actors never affect collision or block keys, coins, doors, or the player.
- Footprints and trails expire after 3000 ms; particles and ambient actors have hard caps.
- All production file edits use `apply_patch`; generated output is produced by the committed generator command and reviewed before commit.
- Do not deploy until unit tests, browser flow, screenshot review, public asset hashes, and public mobile smoke all pass.

---

### Task 1: Maze topology analysis and difficulty scoring

**Files:**
- Modify: `maze/level-tools.js`
- Modify: `tests/level-tools.test.mjs`

**Interfaces:**
- Produces: `shortestCompletionPath(level) -> Array<'up'|'down'|'left'|'right'>`
- Produces: `topologyMetrics(level) -> { completionSteps, turns, junctions, longestStraight, trunkDominance, floorRatio, shortBarrierCount }`
- Produces: `complexityScore(level) -> number`
- Consumes: existing `parseGrid`, `neighbors`, `cellKey`, and key-mask traversal.

- [ ] **Step 1: Write failing topology tests**

Add tests that use a small winding fixture and assert real path/topology behavior:

```js
test('returns the key-complete route and measures turns instead of only distance',()=>{
  const level={
    rows:['#######','#...###','###.###','#...###','#.#####','#.....#','#######'],
    start:{x:1,y:1},exit:{x:5,y:5},keys:[{x:3,y:3}],coins:[]
  };
  const path=tools.shortestCompletionPath(level);
  assert.equal(path.length,10);
  assert.equal(tools.topologyMetrics(level).turns,4);
  assert.equal(tools.topologyMetrics(level).completionSteps,path.length);
});

test('scores a dense branching maze above a straight corridor',()=>{
  const corridor={rows:['#########','#.......#','#########'],start:{x:1,y:1},exit:{x:7,y:1},keys:[],coins:[]};
  const branching={rows:['#########','#.......#','###.###.#','#...#...#','#.###.###','#.......#','#########'],start:{x:1,y:1},exit:{x:7,y:5},keys:[],coins:[]};
  assert.ok(tools.complexityScore(branching)>tools.complexityScore(corridor));
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test tests/level-tools.test.mjs`

Expected: FAIL because `shortestCompletionPath`, `topologyMetrics`, and `complexityScore` are not exported.

- [ ] **Step 3: Implement path reconstruction and metrics**

Refactor the existing key-mask breadth-first search to store `{ previous, direction }` by state signature. Have `shortestCompletionSteps` delegate to `shortestCompletionPath(level).length`. Count direction changes for `turns`, floor cells with at least three neighbors for `junctions`, maximum same-direction run for `longestStraight`, the busiest row/column floor share for `trunkDominance`, and isolated one-to-three-cell wall runs for `shortBarrierCount`.

Use this explicit score so generator and tests agree:

```js
export const complexityScore=level=>{
  const m=topologyMetrics(level);
  return m.completionSteps*4+m.turns*7+m.junctions*5+m.shortBarrierCount*3+
    Math.round((1-m.trunkDominance)*100)+Math.round(m.floorRatio*40);
};
```

- [ ] **Step 4: Run focused and full tests**

Run: `node --test tests/level-tools.test.mjs tests/levels.test.mjs`

Expected: PASS with no regressions in validation or shortest-step behavior.

- [ ] **Step 5: Commit**

```bash
git add maze/level-tools.js tests/level-tools.test.mjs
git commit -m "feat: measure maze topology and difficulty"
```

---

### Task 2: Deterministic dense-maze builder and checked-in layouts

**Files:**
- Create: `maze/maze-builder.js`
- Create: `scripts/generate-crown-mazes.mjs`
- Create: `maze/generated-levels.js`
- Create: `tests/maze-builder.test.mjs`

**Interfaces:**
- Produces: `generateMaze({ seed, cellWidth, cellHeight, targetDeadEnds, loopOpenings, minStraight }) -> { rows, start, exit, keyCandidates, breakableWalls }`
- Produces: `GENERATED_LAYOUTS`, an array of 19 serializable fixed layout objects.
- Consumes: `parseGrid`, `findDeadEnds`, `reachableFrom`, `topologyMetrics`, and `complexityScore`.

- [ ] **Step 1: Write failing deterministic-generator tests**

```js
test('same seed creates the same closed dense maze',()=>{
  const config={seed:1107,cellWidth:7,cellHeight:6,targetDeadEnds:3,loopOpenings:1,minStraight:4};
  const first=generateMaze(config),second=generateMaze(config);
  assert.deepEqual(first,second);
  assert.equal(validateLevel({...first,keys:first.keyCandidates.slice(0,1),coins:[]}).length,0);
});

test('builder reaches the requested dead-end count and avoids a dominant spine',()=>{
  const built=generateMaze({seed:19031,cellWidth:12,cellHeight:10,targetDeadEnds:11,loopOpenings:4,minStraight:6});
  const level={...built,keys:built.keyCandidates.slice(0,5),coins:[]};
  assert.equal(findDeadEnds(level).length,11);
  assert.ok(topologyMetrics(level).trunkDominance<.34);
});
```

- [ ] **Step 2: Run the builder test and verify RED**

Run: `node --test tests/maze-builder.test.mjs`

Expected: FAIL because `maze/maze-builder.js` does not exist.

- [ ] **Step 3: Implement seeded carving and controlled braiding**

Implement a dependency-free 32-bit PRNG and carve a classic odd-cell grid with randomized depth-first search:

```js
const mulberry32=seed=>()=>{
  seed|=0;seed=seed+0x6D2B79F5|0;
  let value=Math.imul(seed^seed>>>15,1|seed);
  value=value+Math.imul(value^value>>>7,61|value)^value;
  return ((value^value>>>14)>>>0)/4294967296;
};
```

After carving, repeatedly open safe connector walls from the shallowest unwanted dead ends until the exact target remains. Reject seeds that produce too few dead ends, an open boundary, a dominant row/column, no long run, or an unreachable exit. Select the deepest target dead ends as `keyCandidates`; select breakable walls that separate two reachable floor cells and shorten the route.

- [ ] **Step 4: Generate 19 fixed layouts**

Use these exact campaign-position configs. `seedStart` is the first candidate; the generator may increment it deterministically until every invariant and the strictly increasing score are satisfied, and must serialize the accepted seed with the layout.

```js
const CONFIGS=[
  ['normal-1',1107,7,6,3,0,4],['reward-1',2109,8,6,3,1,4],
  ['normal-2',3119,8,7,5,1,5],['reward-2',4127,9,7,5,2,5],
  ['normal-3',5131,9,8,7,2,5],['reward-3',6143,10,8,7,3,5],
  ['normal-4',7151,10,9,9,3,6],['reward-4',8161,11,9,9,4,6],
  ['normal-5',9173,11,10,11,4,6],['reward-5',10181,12,10,11,5,6],
  ['normal-6',11197,12,11,13,5,7],['reward-6',12203,13,11,13,6,7],
  ['normal-7',13217,13,12,15,6,7],['reward-7',14221,14,12,15,7,7],
  ['normal-8',15233,14,13,17,7,8],['reward-8',16249,15,13,17,8,8],
  ['normal-9',17257,16,14,19,8,8],['reward-9',18269,17,14,19,9,9],
  ['normal-10',19273,18,15,21,9,9]
].map(([id,seedStart,cellWidth,cellHeight,targetDeadEnds,loopOpenings,minStraight])=>
  ({id,seedStart,cellWidth,cellHeight,targetDeadEnds,loopOpenings,minStraight}));
```

Run: `node scripts/generate-crown-mazes.mjs`

The script must serialize arrays with stable formatting into `maze/generated-levels.js`, then re-import the file and reject output unless all 19 layouts are unique, closed, reachable, and ordered by `complexityScore`.

- [ ] **Step 5: Verify generator determinism**

After the first generation, record `sha256sum maze/generated-levels.js`, run `node scripts/generate-crown-mazes.mjs` again, and record the hash again. Assert that both SHA-256 values are identical.

Expected: no second-run diff.

- [ ] **Step 6: Run tests and commit**

Run: `node --test tests/maze-builder.test.mjs`

```bash
git add maze/maze-builder.js maze/generated-levels.js scripts/generate-crown-mazes.mjs tests/maze-builder.test.mjs
git commit -m "feat: generate fixed dense crown mazes"
```

---

### Task 3: Replace all 19 corridor layouts and prove ordered difficulty

**Files:**
- Modify: `maze/levels.js`
- Modify: `tests/levels.test.mjs`
- Modify: `tests/release-version.test.mjs`

**Interfaces:**
- Consumes: `GENERATED_LAYOUTS`, `shortestCompletionSteps`, `topologyMetrics`, and `complexityScore`.
- Preserves: `LEVELS`, `getLevel(id)`, all names, palettes, IDs, coin counts, key counts, and breakable-wall rules.
- Produces: `level.difficulty` with stable metrics for display/testing, without changing save format.

- [ ] **Step 1: Replace the current gentle-first-level test with campaign-wide failing assertions**

```js
test('all nineteen maps form dense winding mazes with increasing campaign difficulty',()=>{
  const scores=LEVELS.map(level=>complexityScore(level));
  for(let i=1;i<scores.length;i++)assert.ok(scores[i]>scores[i-1],`${LEVELS[i].id}: ${scores[i-1]} -> ${scores[i]}`);
  for(const level of LEVELS){
    const m=topologyMetrics(level);
    assert.ok(m.turns>=6,`${level.id} turns`);
    assert.ok(m.junctions>=2,`${level.id} junctions`);
    assert.ok(m.longestStraight>=4,`${level.id} long corridor`);
    assert.ok(m.trunkDominance<.34,`${level.id} dominant spine`);
  }
});
```

Keep and strengthen the existing checks for 19 unique maps, exact keys/dead ends, reward coins, valid shortcuts, reachability, and theme fields.

- [ ] **Step 2: Run level tests and verify RED**

Run: `node --test tests/levels.test.mjs`

Expected: FAIL because current stages 2–19 retain the central-spine generator and scores are not strictly ordered.

- [ ] **Step 3: Integrate generated rows into level metadata**

Delete `buildStage` and `buildIntroStage`. Build each exported level from the matching checked-in layout, select the deepest `index` key candidates, and place reward coins deterministically on non-object floor cells. Keep coin IDs in the existing `reward-N:x,y` format. Persist `parSteps` and `difficulty` from the generated data rather than recalculating randomized layouts.

- [ ] **Step 4: Version the new module edge**

Import `generated-levels.js` with the same release query used by the complete module graph. Add it to the recursive release-version assertions so stale layouts cannot remain cached.

- [ ] **Step 5: Run rule, engine, and economy tests**

Run: `node --test tests/levels.test.mjs tests/engine.test.mjs tests/economy.test.mjs tests/release-version.test.mjs`

Expected: PASS; gameplay rules unchanged while layouts and difficulty change.

- [ ] **Step 6: Commit**

```bash
git add maze/levels.js tests/levels.test.mjs tests/release-version.test.mjs
git commit -m "feat: replace campaign with winding maze layouts"
```

---

### Task 4: Collision-safe rounded walls, short barriers, and cached shadows

**Files:**
- Create: `maze/wall-geometry.js`
- Create: `tests/wall-geometry.test.mjs`
- Modify: `maze/render.js`
- Modify: `tests/render-model.test.mjs`

**Interfaces:**
- Produces: `buildWallModel(grid, removedWalls) -> { runs, lightEdges, darkEdges, shortBarriers, signature }`
- Produces: `visualSizesFor(tile) -> { playerRadius, keySize, coinSize, doorSize, cornerRadius }`
- Consumes: grid walls, removed-wall set, camera, theme, and fixed light vector.

- [ ] **Step 1: Write failing wall-union and clearance tests**

```js
test('wall model merges surfaces and never emits internal outline edges',()=>{
  const grid=parseGrid(['#####','#####','#####']);
  const model=buildWallModel(grid,new Set());
  assert.equal(model.runs.length,3);
  assert.equal(model.lightEdges.length+model.darkEdges.length,4);
});

test('visual sizes leave a collision-safe corridor margin',()=>{
  const sizes=visualSizesFor(30);
  assert.ok(sizes.playerRadius<=9.6);
  assert.ok(sizes.keySize<=20);
  assert.ok(sizes.cornerRadius<=3.6);
});
```

- [ ] **Step 2: Run focused tests and verify RED**

Run: `node --test tests/wall-geometry.test.mjs tests/render-model.test.mjs`

Expected: FAIL because the new module and sizing API do not exist.

- [ ] **Step 3: Extract and cache wall geometry**

Move run/outline construction out of `render.js`. Merge collinear exposed edges so a rectangular block has four outline segments, not one segment per tile. Cache the model in `setLevel`; rebuild only when the sorted removed-wall signature changes after dynamite.

- [ ] **Step 4: Render safe rounded contours and coherent shadows**

Fill the wall union once with a maze-wide gradient. Draw outline paths with `lineJoin='round'`, `lineCap='round'`, and an inward-safe radius capped at `tile*.12`. Draw the same union at `shadowOffsetFor(profile,tile*.11)` before the wall so both main walls and isolated short barriers cast a floor shadow. Do not add per-cell gradients or internal grid lines.

Use `visualSizesFor(tile)` for the player and objects. Clip decorative foreground layers away from key/coin/door centers, and keep all player painting inside the floor-cell clearance radius.

- [ ] **Step 5: Run tests and capture the reference comparison**

Run: `node --test tests/wall-geometry.test.mjs tests/render-model.test.mjs`

Run: `CROWN_SCREENSHOT=/tmp/crown-maze-wall-redesign.png node --test tests/browser-smoke.mjs`

Inspect the screenshot and verify dense short/medium/long walls, no tile seams, no large solid blank wall mass, and no player/door overlap.

- [ ] **Step 6: Commit**

```bash
git add maze/wall-geometry.js maze/render.js tests/wall-geometry.test.mjs tests/render-model.test.mjs
git commit -m "feat: render rounded collision-safe maze walls"
```

---

### Task 5: Model all 19 scene themes, trees, water, and ambient actors

**Files:**
- Create: `maze/scenery.js`
- Create: `tests/scenery.test.mjs`
- Modify: `maze/render.js`
- Modify: `tests/render-model.test.mjs`

**Interfaces:**
- Produces: `sceneProfileFor(level) -> SceneProfile`
- Produces: `ambientActorsFor(profile, seed) -> Array<Actor>` with bounded deterministic actors.
- Produces: `treeShadowFor(tree, light, now) -> { x, y, scaleX, alpha }`
- SceneProfile fields: `trees`, `leaves`, `petals`, `bees`, `honey`, `water`, `ripples`, `crystals`, `candy`, `clouds`, `meteors`, `aurora`, `crown`, `lighting`.

- [ ] **Step 1: Write failing theme-contract tests**

```js
test('every campaign position exposes trees and its required signature elements',()=>{
  const required=[
    ['trees','grass','leaves'],['trees','bees','honey','lanterns'],['trees','water','ripples','coral'],
    ['trees','petals','pearls'],['trees','vines','fireflies'],['trees','crystals','mapleLeaves'],
    ['trees','crystals','purpleRefraction'],['trees','roses','petals'],['trees','goldLeaves','goldTreeShadow'],
    ['trees','crystals','candy'],['trees','water','ripples','snow'],['trees','laurelLeaves','lanterns'],
    ['trees','roses','petals'],['trees','clouds','gems'],['trees','stars','meteors'],
    ['trees','goldLeaves','stars'],['trees','clouds','sunsetRefraction'],['trees','aurora','crownLights'],
    ['trees','goldLeaves','centerCrown']
  ];
  LEVELS.forEach((level,index)=>{
    const profile=sceneProfileFor(level);
    for(const field of required[index])assert.ok(profile[field],`${level.id}:${field}`);
  });
});

test('ambient decoration remains bounded and petals always have a source',()=>{
  for(const level of LEVELS){
    const profile=sceneProfileFor(level),actors=ambientActorsFor(profile,37);
    assert.ok(actors.length<=96,level.id);
    if(profile.petals)assert.ok(profile.trees||profile.roses,level.id);
  }
});
```

- [ ] **Step 2: Run scenery tests and verify RED**

Run: `node --test tests/scenery.test.mjs`

Expected: FAIL because `maze/scenery.js` does not exist.

- [ ] **Step 3: Implement the profile table and deterministic actor model**

Define profiles in exact campaign order from the spec. Use actor records `{ type, x, y, phase, speed, scale }`; no actor owns a grid cell or participates in engine collision. Cap all actors at 96 total, with lower per-type caps: trees 6, bees 10, leaves/petals 22, ripples 8, clouds 6, meteors 5.

- [ ] **Step 4: Draw detailed trees and coherent moving shadows**

Replace circular leaf clusters with layered branches and many narrow leaf ellipses. Draw each tree shadow before the maze using the same `shadowOffsetFor` direction as walls and player. Only `scaleX` and alpha may drift by a small sinusoid; shadow direction stays fixed.

- [ ] **Step 5: Draw theme effects without blocking play**

Implement subtle honey drops, water ripples, maple/gold/laurel leaves, rose/cherry petals, crystals, unwrapped candy shapes, clouds, stars/meteors, aurora, and the stage-19 centered crown. Use low alpha and draw collectibles/player after ambience. Cull actors outside the viewport plus one-tile margin.

- [ ] **Step 6: Run tests and commit**

Run: `node --test tests/scenery.test.mjs tests/render-model.test.mjs`

```bash
git add maze/scenery.js maze/render.js tests/scenery.test.mjs tests/render-model.test.mjs
git commit -m "feat: add nineteen themed maze environments"
```

---

### Task 6: Local grass wind, faceless skins, and three-second trails

**Files:**
- Create: `maze/motion-effects.js`
- Create: `tests/motion-effects.test.mjs`
- Modify: `maze/render.js`
- Modify: `tests/render-model.test.mjs`

**Interfaces:**
- Produces: `createMotionState() -> { steps, trails }`
- Produces: `recordStep(state, { from, to, skinId, now })`
- Produces: `activeTrails(state, now) -> Trail[]`
- Produces: `grassSwayAt(cell, state, now) -> { amount, direction }`
- Produces: `skinTrailStyle(skinId) -> { colors, particles, stars, moons, rainbow }`

- [ ] **Step 1: Write failing timing and style tests**

```js
test('step wind affects only nearby recent grass and trails expire at three seconds',()=>{
  const state=createMotionState();
  recordStep(state,{from:{x:2,y:2},to:{x:3,y:2},skinId:'red',now:1000});
  assert.ok(grassSwayAt({x:3,y:3},state,1100).amount>.2);
  assert.ok(grassSwayAt({x:10,y:10},state,1100).amount<.08);
  assert.equal(activeTrails(state,3999).length,1);
  assert.equal(activeTrails(state,4001).length,0);
});

test('hidden skins receive moonlit effects while ordinary skins keep colored grains',()=>{
  assert.deepEqual(skinTrailStyle('blue').stars,false);
  assert.equal(skinTrailStyle('silver').moons,true);
  assert.equal(skinTrailStyle('gold').stars,true);
  assert.equal(skinTrailStyle('iridescent').rainbow,true);
});
```

- [ ] **Step 2: Run motion tests and verify RED**

Run: `node --test tests/motion-effects.test.mjs`

Expected: FAIL because the motion-effects module does not exist.

- [ ] **Step 3: Implement bounded history and exact expiry**

Keep at most 20 recent step records and 72 active trail records. Compute alpha as `1-(now-born)/3000`, clamp to `[0,1]`, and delete expired records. Derive wind direction from `to-from`; ambient grass stays below `.08`, grass within 2.5 cells of a recent step reaches at least `.2` and eases back down.

- [ ] **Step 4: Integrate movement observation and trail drawing**

In the renderer, compare the last player cell with the new cell and call `recordStep` only after a successful position change. Draw footprints/trails below the current player but above floor decor. Silver and gold get small moons and faint stars; iridescent gets rainbow refraction, moonlight, and stars; ordinary skins get only color-matched grains.

- [ ] **Step 5: Remove the face and add body glints**

Delete the eye arcs and smile stroke from `drawPlayer`. Keep the crown, sphere shading, shadow, and bob. Add two or three low-alpha glints to every skin body, with stronger animated glints for hidden skins.

- [ ] **Step 6: Run tests and commit**

Run: `node --test tests/motion-effects.test.mjs tests/render-model.test.mjs`

```bash
git add maze/motion-effects.js maze/render.js tests/motion-effects.test.mjs tests/render-model.test.mjs
git commit -m "feat: add responsive grass and skin trails"
```

---

### Task 7: Make footsteps and action sounds clearly audible

**Files:**
- Modify: `maze/audio.js`
- Modify: `tests/audio.test.mjs`
- Modify: `tests/public-assets.test.mjs`

**Interfaces:**
- Preserves: `createAudioController` and `SOUND_DEFINITIONS` names/files.
- Changes: `footstep.volume` from `.10` to `.65`; keep successful-step-only triggering and 90 ms duplicate suppression.
- Verifies: every movement/action event in `main.js` maps to an audio definition.

- [ ] **Step 1: Extend FakeAudio and write failing level tests**

Record created voices in `FakeAudio.voices`, then assert actual playback values:

```js
test('plays a clearly audible footstep and audible explosion',async()=>{
  const audio=createAudioController({AudioClass:FakeAudio,now:()=>100});
  await audio.unlock();
  audio.play('footstep');audio.play('explosion');
  assert.equal(FakeAudio.voices.at(-2).volume,.65);
  assert.ok(FakeAudio.voices.at(-1).volume>=.34);
});
```

Add a source-contract assertion that `step`, `bump`, `key`, `coin`, `door-locked`, `complete`, `dynamite`, and `hook` all map to names in `SOUND_DEFINITIONS`.

- [ ] **Step 2: Run audio tests and verify RED**

Run: `node --test tests/audio.test.mjs tests/public-assets.test.mjs`

Expected: FAIL because footstep playback remains `.10`.

- [ ] **Step 3: Raise footstep gain without replacing the licensed recording**

Set `footstep.volume=.65`. Preserve the real CC0 `footstep.webm`, the slight `.97–1.03` playback-rate variation, the sound toggle, page suspend/resume, and duplicate throttle. Do not add synthesized fallback sounds.

- [ ] **Step 4: Run tests and commit**

Run: `node --test tests/audio.test.mjs tests/public-assets.test.mjs`

```bash
git add maze/audio.js tests/audio.test.mjs tests/public-assets.test.mjs
git commit -m "fix: make maze movement sounds audible"
```

---

### Task 8: Mobile theme coverage, render budgets, and visual review

**Files:**
- Modify: `tests/browser-smoke.mjs`
- Create: `tests/theme-browser-smoke.mjs`
- Modify: `maze/main.js`
- Modify: `maze/render.js`
- Modify: `tests/render-model.test.mjs`

**Interfaces:**
- Adds renderer diagnostics: `diagnostics -> { wallModelBuilds, trailCount, actorCount, sceneId, sceneElements }` for tests only/read-only inspection.
- Adds environment controls: `CROWN_STAGE_ID`, `CROWN_SCREENSHOT`, and `CROWN_THEME_SWEEP=1` to browser tests.

- [ ] **Step 1: Write a failing 19-theme browser test**

Create `tests/theme-browser-smoke.mjs` by reusing the existing CDP helper and local HTTP-server lifecycle. For each `LEVELS` entry, seed an isolated save that unlocks the stage, click its node, wait two animation frames, and evaluate:

```js
const result=await evaluate(`(()=>{
  const canvas=document.getElementById('mazeCanvas');
  const diagnostics=globalThis.__crownMazeDiagnostics;
  return {
    stage:document.body.dataset.stage,
    width:canvas.width,
    wallBuilds:diagnostics.wallModelBuilds,
    trails:diagnostics.trailCount,
    actors:diagnostics.actorCount,
    scene:diagnostics.sceneId,
    elements:diagnostics.sceneElements
  };
})()`);
assert.equal(result.stage,level.id);
const profile=sceneProfileFor(level);
assert.equal(result.scene,profile.id);
assert.equal(result.wallBuilds,1);
assert.ok(result.trails<=72);
assert.ok(result.actors<=96);
for(const [field,enabled] of Object.entries(profile)){
  if(enabled===true)assert.ok(result.elements.includes(field),`${level.id}:${field}`);
}
```

- [ ] **Step 2: Run renderer tests and verify RED**

Run: `node --test tests/render-model.test.mjs`

Expected: FAIL because `tests/theme-browser-smoke.mjs` cannot read `globalThis.__crownMazeDiagnostics` and the renderer does not expose the required values.

- [ ] **Step 3: Complete static caching and diagnostics**

Cache wall model and non-moving scene primitives in `setLevel`. Rebuild wall geometry only when the removed-wall signature changes. Do not expose mutable internal arrays; return numbers, the scene ID, and a copied string array from a getter. In `main.js`, copy that getter to `globalThis.__crownMazeDiagnostics` after each frame only when the page is served from localhost or the URL has `?diagnostics=1`.

- [ ] **Step 4: Complete screenshot capture in the 19-theme sweep**

Complete `theme-browser-smoke.mjs` by asserting canvas pixels are non-empty, collecting console exceptions, and capturing positions 1, 6, 11, and 19 to `/tmp/crown-theme-1.png`, `/tmp/crown-theme-6.png`, `/tmp/crown-theme-11.png`, and `/tmp/crown-theme-19.png`.

- [ ] **Step 5: Run the complete local verification set**

Run:

```bash
npm test
node --test tests/browser-smoke.mjs
node --test tests/theme-browser-smoke.mjs
git diff --check
```

Expected: all tests pass, 0 browser exceptions, no horizontal overflow, and the stage-19 actor/trail caps remain within limits.

- [ ] **Step 6: Inspect four screenshots**

Use `view_image` on:

- `/tmp/crown-theme-1.png`: readable first maze, detailed trees, local grass wind.
- `/tmp/crown-theme-6.png`: emerald refraction and maple leaves.
- `/tmp/crown-theme-11.png`: blue water, ripples, ice and blue foliage.
- `/tmp/crown-theme-19.png`: densest maze, centered crown, gold leaves, no overlap.

If any screenshot shows corridor combs, large solid wall masses, tile seams, decorative obstruction, or clipping, add a failing model/browser assertion before correcting it.

- [ ] **Step 7: Commit**

```bash
git add maze/main.js maze/render.js tests/render-model.test.mjs tests/browser-smoke.mjs tests/theme-browser-smoke.mjs
git commit -m "test: verify all crown maze worlds on mobile"
```

---

### Task 9: Cache-busted release, backup, deployment, and public verification

**Files:**
- Modify: `games/maze.html`
- Modify: all changed importers under `maze/*.js`
- Modify: `tests/release-version.test.mjs`

**Interfaces:**
- Release query: advance the complete graph from `20260829d` to `20260829e`.
- Public URL: `https://games.596996.xyz/games/maze.html?v=20260829e`
- Remote document root: `/opt/1panel/www/sites/games.596996.xyz/index`
- Backup root: `/home/ubuntu/site-backups/games.596996.xyz/<timestamp>` on `oci-cc-arm`.

- [ ] **Step 1: Write the failing release-version expectation**

Set `RELEASE='20260829e'` in `tests/release-version.test.mjs` before changing production imports.

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/release-version.test.mjs`

Expected: FAIL because HTML/imports still use `20260829d`.

- [ ] **Step 3: Update the complete module graph**

Use `apply_patch` to change HTML CSS/main URLs and every relative ES-module import to `?v=20260829e`, including new `generated-levels.js`, `wall-geometry.js`, `scenery.js`, and `motion-effects.js` edges.

- [ ] **Step 4: Run fresh pre-deploy verification**

Run:

```bash
npm test
node --test tests/browser-smoke.mjs
node --test tests/theme-browser-smoke.mjs
git diff --check
```

Expected: all tests pass immediately before release.

- [ ] **Step 5: Commit the release version**

```bash
git add games/maze.html maze tests/release-version.test.mjs
git commit -m "release: publish redesigned crown maze worlds"
```

- [ ] **Step 6: Resolve and back up exact remote targets**

First verify the remote HTML and maze directory exist. Create a timestamped directory outside the web root, then copy `games/maze.html` and the complete remote `maze/` directory into it. Do not delete or recursively replace the site root.

- [ ] **Step 7: Upload only the maze page and maze asset directory**

Upload `games/maze.html` plus changed/new `maze/` files to the existing remote paths. Apply directory mode `755` and file mode `644`. Do not touch the other five games or `games.js` unless its content actually changed.

- [ ] **Step 8: Verify public bytes and full mobile flow**

For every uploaded file, compare local SHA-256 with `curl -fsSL "https://games.596996.xyz/<asset>?verify=20260829e" | sha256sum`. Then run:

```bash
CROWN_BASE_URL=https://games.596996.xyz node --test tests/browser-smoke.mjs
CROWN_BASE_URL=https://games.596996.xyz node --test tests/theme-browser-smoke.mjs
```

Expected: matching hashes, all public browser tests pass, and 0 console exceptions.

- [ ] **Step 9: Report release and rollback location**

Provide the cache-busted public link, local test counts, public smoke result, and exact timestamped backup directory. If public verification fails, restore only the backed-up maze files and report the failure rather than claiming completion.
