# Rescue Online Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Deliver responsive two-device rescue cooperation on the existing public site and prevent double-tap zoom/context menus during play.
**Architecture:** A separate authoritative WebSocket simulation sends compact dynamic frames. Each browser predicts its own inputs with the existing core and interpolates teammates while rendering Three.js locally. Existing local modes and shooter services keep their own state.
**Tech Stack:** JavaScript ESM, Node, existing ws, pinned Three.js 0.186.1, existing Chromium/CDP test harness.
**Spec:** docs/superpowers/specs/2026-10-03-rescue-online-design.md

## Global Constraints

- Exactly 2 online players, creator Chip and guest Dale; each uses its device's 1P keys/touch/gamepad.
- Server 60Hz simulation and 20Hz dynamic broadcasts; static stage sent only at join/epoch/level transition; same-stage level reference remains stable.
- Same-run authority and visual render state identity remain stable, visual events come from authority; room.run increments only genuine start/retry/next, preserving audio/particle event dedup across pause/reconnect/bonus.
- Local prediction uses actual core, server owns damage/score/pickups/results; never persist predicted results.
- Target native local response <100ms under200ms RTT; active street per-peer dynamic bandwidth <=80KiB/s; pending inputs <=120; interpolation history <=8.
- Disconnect, hidden/freeze or WebGL loss clears input/audio and pauses the team; resume needs two connected and ready devices. Restore/reconnect stays paused until manual continue.
- Short disconnect reclaims original seat with sessionStorage-only token; no tokens in logs, DOM datasets or diagnostics; explicit leave ends the room.
- Room starts region0; server controls branch unlocks/retry entry; online game cannot overwrite single-player progress.
- Game app double taps do not zoom; context menus, selection and touch scrolling do not interrupt controls.
- Use existing ws and Three.js0.186.1; no new hosted/paid service. Separate loopback8788 /rescue-ws, existing shooter8787 /shooter-ws stays available.
- No production state setter/testing shortcut; native tests use real keys/clicks/touches. Production source is not served in docroot.
- Tests follow RED/GREEN; same-version passed checks are not repeated without a new change/failure; do not run multiple CPU-heavy Chromium suites simultaneously.

### Task 1: Authoritative two-seat rooms and compact codec

**Files:** Create rescue/net-codec.js, rescue/server.mjs, tests/rescue-net-codec.test.mjs, tests/rescue-server.test.mjs. Consume core.js, campaign.js, levels.js unchanged.
**Interfaces:** Produce encodeFrame/decodeFrame and createRescueServer APIs/protocol exactly as spec. No browser UI changes. Test-only clock/level injection may be constructor options, never a network command; do not ship client state setters.

- [x] **Step 1: Write RED tests.** Connect real ws clients using origin allowlist; create/join, reject third, isolated rooms, ownership of inputs, stale epoch/duplicate sequence, one-tick jump/action edges, unauthorized start/next, pause readiness, disconnect/token reclaim, explicit leave. Codec roundtrips actual createGame states including carry/throw, moving platforms, bonus and all Boss dynamic fields; unchanged stage identity must survive repeated decode.
```js
const app=createRescueServer({port:0});await app.ready;
const host=new WebSocket(`ws://127.0.0.1:${app.address().port}/rescue-ws`,{origin:'https://games.nblord.com'});
host.send(JSON.stringify({type:'create'}));
// A second real connection joins its returned code; a third receives error.
```
- [x] **Step 2: Run node --test tests/rescue-net-codec.test.mjs tests/rescue-server.test.mjs and record expected failures before implementation.**
- [x] **Step 3: Implement.** Use real core, bounded input commands and acked consumed sequences. Reset inputs/epoch at lifecycle changes. Send fresh complete dynamic frames; skip congested snapshots instead of queueing them. Codec rebuilds static entity defaults from cached level and stores necessary dynamic fields compactly; serialize entire Boss dynamic object if omission would alter behavior.
```js
const samples=members.map(m=>takeOneBoundedCommand(m));
stepGame(room.game,samples.map(c=>c?.input??{}),1/60);
for(let slot=0;slot<2;slot++)if(samples[slot])room.acks[slot]=samples[slot].seq;
```
Report exact missing-command continuous-input policy and edge clearing so prediction tests can reproduce it. Validate command numbers/booleans, limits and epochs; snapshot metadata includes last inputs. Entry reset/next uses authoritative campaign, not client game state. Retain disconnect token for120seconds, stale inputs350ms pause, max16 rooms/max64 connections, max4096byte input payload, queues120 per peer.
- [x] **Step 4: Run meaningful covering tests and measure dynamic street bytes at20Hz over real active input.** Tests assert independent movement, native-core held/throw links and exact one-shot event counts, not just connected status. Full static setup may exceed dynamic packet budget and is measured separately.
- [x] **Step 5: Commit only owned files; report protocol examples, test logs, byte measurements, concerns.**

### Task 2: Predictive network client and bounded interpolation

**Files:** Create rescue/net-prediction.js, rescue/net-client.js, tests/rescue-net-prediction.test.mjs, tests/rescue-net-client.test.mjs.
**Interfaces:** Consume Task1 codec/protocol; produce createPrediction and createRescueClient exactly as spec for Task3. URL defaults to same-origin /rescue-ws. Injected test transport/clock/storage belong to factory options and never production DOM/state APIs.

- [x] **Step 1: Write RED prediction and real-client tests.** Actual core state plus held input moves/jumps before any delayed authority message; ack removes only consumed commands; identity, epoch, teleport/respawn and held relations survive; action isn't duplicated by replay; no history grows past limits. Two clients use actual localhost ws service, join/start independent roles, delay frames through a test transport and reconnect retaining seat without leaking token.
```js
const prediction=createPrediction({slot:1});prediction.receive(createGame(getLevel('0'),{players:2}),{epoch:1,ack:0,inputs:[{},{}]});
const before=prediction.render().players[1].x;
const result=prediction.advance({move:1},1/60);
assert.ok(result.state.players[1].x>before);
```
- [x] **Step 2: Run task test files, record expected RED before implementation.**
- [x] **Step 3: Implement core-based local replay with bounded history, latest authoritative HUD state and visual-only own/held actor prediction.** Expose remote interpolation with <=8 snapshots, avoid allocating/rebuilding static stages on every frame. Commands are fixed step ordered, buffered only until ack; invalid/old epochs discarded. Handle errors, pong latency, retry/backoff reconnect, explicit leave cleanup, server closed/full/lost room and page teardown without creating timers per render frame.
```js
for(const command of pending){
 const inputs=authorityInputs.map(i=>({...i}));inputs[slot]=command.input;
 stepGame(replay,inputs,1/60);
}
```
Prediction is cleared on suspend/disconnect; while not playing no movement command stream or speculative progress. Return precise API/status shape for UI implementer. Avoid premature optimization that makes collision outcomes invented.
- [x] **Step 4: Run task tests and measured delayed input/settled reconciliation; record queue and bandwidth behavior.**
- [x] **Step 5: Commit owned files and write contract report with exact API.**

### Task 3: Room UI, game lifecycle integration and touch protection

**Files:** Modify rescue/game.js, rescue/scene.js (confirmed buffer resize dedup only), games/rescue.html, rescue/style.css, games.js, index.html (hall script cache query only), README.md; create a small rescue/net-ui.js if this keeps UI separate; add tests/rescue-online-browser.mjs and touch regressions, with tests/rescue-online-harness.mjs if needed for shared real-browser transport setup; tests/game-browser-harness.mjs may add optional chromeFlags while preserving defaults; small rescue/frame-time.js and tests/rescue-frame-time.test.mjs cover actual online elapsed and retained local cap; update tests/rescue-integration-browser.mjs catalog expectations if metadata changes. Build rescue/bundle.js after source changes. Consume Tasks1/2 only through agreed APIs.
**Interfaces:** Home online entry/create/join/lobby/start/leave; HUD and paused overlays for network state. Each device samples controls slot0 then sends to its assigned network slot. Authority drives hud/audio/results/map, visual prediction drives scene/camera. Keep local modes independent.

- [x] **Step 1: Add RED native two-browser and touch tests.** Real UI creating/joining/start, independent keyboard+touch, player2 cannot hijack player1, native carry/throw both observe consistent links, pause/resume/hidden/GPU-loss readiness, reconnect plus leave/error paths; doubletap scale unchanged and trusted contextmenu default prevented. Use isolated browsers, focus emulation for both, server from Task1 on free port; real ws forwarded through a test origin without production hardcoded localhost override.
```js
await click(host,'#online-open');await click(host,'#online-create');
const code=await host.evaluate('document.querySelector("#online-code").textContent');
await click(guest,'#online-open');await guest.call('Input.insertText',{text:code});
await click(guest,'#online-join');await click(host,'#online-start');
```
- [x] **Step 2: Record expected native RED failures.**
- [x] **Step 3: Implement online UI and correct lifecycle.** Reset render state on genuine level changes only. Never call local save/complete()/retry flow on predicted or online state; map chosen from server campaign. Home/leave disposes transport. A blocked client does not resume server by closing a panel. Gate start/resume with room readiness. Show Chinese user-facing status only; no implementation jargon or testing setters. Handle tab/GPU recovery handshake while remaining paused.
```js
if(online){
 const sample=controls.sample()[0]??{};
 online.advance(panel?{}:sample,dt);
 scene.update(online.render(),dt);
}else stepGame(state,controls.sample(),dt);
```
Use app-scoped contextmenu/selectstart prevention and appropriate touch-action/user-select/-webkit-touch-callout CSS. Retain existing local tests' home IDs/flows. Hall card accurately says本机/联网双人. Bump page CSS/bundle and hall cache version consistently; retain latest mimic and GPU fixes.
- [x] **Step 4: Build via npm run build:rescue, run new native tests and affected old rescue-browser regressions (keyboard2p, viewports, freeze/BFCache, GPU, room bonus) once each.** Record actual screenshot/state/errors. Same-version passed geometry tests do not need repeat. Record native rendering and scheduling observations; strict delayed-response and uninterrupted active-session acceptance remains Task 4.
- [x] **Step 5: Commit only owned files and report integration API decisions/measurements.**

### Task 4: Deployment wiring and meaningful low-latency acceptance

**Files:** Create deploy/rescue-coop.service, deploy/rescue-coop.conf, tests/rescue-online-latency-browser.mjs; modify deploy/deploy-local.sh and package.json browser check chain; update existing rescue tasks/verification.md and README with supported flow. Root controller will publish only after review; worker does not merge or deploy.
**Interfaces:** Service127.0.0.1:8788/rescue-ws; existing /shooter-ws route and shooter user service. Ensure rsync excludes rescue/server.mjs; network codec/client safe browser assets remain shipped.

- [x] **Step 1: Write RED actual delay acceptance and deployment shell validation.** Real keys and production client UI with a transport injecting100ms each direction plus bounded jitter (state/input both), measure first visible own response, settled cross-peer authoritative positions, single jump/throw events, pause/room reconnection; record rather than fabricate FPS/RTT. Server tests can count packet sizes and tick budget; shell check validates syntax and production file exclusion.
```js
const start=performance.now();
// Input.dispatchKeyEvent starts local movement; poll DOM position until it changes.
assert.ok(measuredResponse<100,`local response ${measuredResponse}ms`);
```
- [x] **Step 2: Record expected RED on unpredicted/blocked variant, then implement required harness/integration wiring.** Delay adapter belongs to test harness, not production state setter. A temporary copy with prediction bypassed must fail delayed-response assertion; native official code must pass. No forced score, win, position or held links.
- [x] **Step 3: Wire separate service and proxy idempotently into original deploy.** Existing shooter service remains; avoid changing authenticated browser/server unrelated settings. Install new proxy before OpenResty config test/reload. Restart each runtime only when its sources/service/dependencies changed, preserving active rooms on documentation-only deployment. The original pull-in-script webhook requires root to confirm newly added wiring actually ran and rerun the same script if missing. Service uses existing production dependencies. Update cache versions and public commands in README.
- [x] **Step 4: Run new latency acceptance, real two-browser session and same-version affected required unit suite; run shooter networking smoke if its deployment chain changed.** All rescue unit tests plus shooter server/session checks; do not run unrelated full graphics game suites. Independently rebuild bundle, byte compare, diff check. Update task/verification results and exact outstanding public work.
- [x] **Step 5: Commit owned changes with reports.** Root then conducts whole-branch review, one final fix wave if needed, PR/merge/webhook. Verify native production HEAD/proxy/user services, assets both domains, actual two-public-browser create/join/play/carry/throw/next and reconnect. Record deployment via existing task notes; no test short-cut production API.
