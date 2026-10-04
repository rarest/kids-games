# 游戏热度榜 Implementation Plan

> **For agentic workers:** Use executing-plans or subagent-driven-development to execute the independent tasks and review their results. Checkboxes track actual completion.

**Goal:** Publish real daily, weekly and monthly game popularity rankings without requiring registration.

**Architecture:** The existing static games send foreground active-play heartbeats to one same-origin Node service. PostgreSQL stores durable sessions, deduplicated play events and daily active time. A separate platform package and systemd service preserve existing multiplayer runtimes.

**Tech Stack:** Existing Node.js 24, PostgreSQL 17, node-postgres, native HTTP, browser JavaScript, existing Playwright/browser tooling.

**Spec:** `docs/superpowers/specs/2026-10-04-game-hall-platform-design.md` stage 1.

## Global constraints

- Fourteen stable game IDs: memory, english, rescue, parkour, racing, territory, shooter, pinyin, snake, fish, fishing, goldminer, maze, merge4096.
- Guests can play. Do not build or advertise registration/cloud saves in this stage.
- Count after 15 foreground active seconds; exclude menus, explicit pauses, hidden pages and waiting rooms.
- Sliding 30-minute visitor/game deduplication is atomic in the database, including concurrent tabs.
- Day / week / month boundaries use Asia/Shanghai, Monday week start. No fabricated historic or sample production data.
- Production session identities and database credentials never enter static files, logs or Git.
- Existing game servers use only their actual `ws` dependency fingerprint; installing independent platform packages must not restart them.

## API contract

`POST /api/activity/start` body `{gameId}` establishes an HttpOnly anonymous visitor cookie and returns `{sessionId,acceptedSeconds:0}`. Session ownership is checked by signed visitor cookie.

`POST /api/activity` body `{sessionId,activeSeconds}` reports cumulative active foreground seconds. Server accepts monotonic bounded increments against elapsed server time, adds duration only after qualification, and serializes visitor/game counting. Response `{acceptedSeconds,qualified,counted}`. Idempotent retries must not add duration or counts.

`GET /api/popularity?period=day|week|month` returns `{period,range:{start,end,label},statisticsStartedAt,updatedAt,items:[{gameId,plays,activeSeconds}]}`. Ordered by plays, activeSeconds, gameId. No visitor identifiers exposed. `/api/health` reports readiness only.

## Task 1: Database/API and operational integration (root)

Files: `platform/package.json`, `platform/package-lock.json`, `platform/server.mjs`, `platform/store.mjs`, `platform/periods.mjs`, `platform/migrations/001-activity.sql`; `tests/platform-*.test.mjs`; `deploy/games-platform.service`, `deploy/games-platform.conf`, `deploy/deploy-local.sh`, backup units/script.

- [x] First run failing tests for Shanghai midnight, Monday and month rollover, period validation; implement pure period functions.
- [x] Provision isolated PostgreSQL credentials/data outside the repository and docroot; use a separate test schema.
- [x] Run failing PostgreSQL/API tests for 15-second qualification, 30-minute sliding dedup including concurrency, idempotent duration, cookie ownership, rate/body limits and restart persistence; implement schema/store/server.
- [ ] Extend independent deployment fingerprint and install platform routes; add a daily atomic database backup and test restoration to a separate database. Preserve existing rooms when their runtime did not change.

## Task 2: Active-play client and hooks (independent worker)

Files: `shared/game-activity.js`, `tests/game-activity.test.mjs`, the fourteen `games/*.html` entry points and actual game source hooks; regenerated bundles where needed. Do not edit `index.html`, `games.js`, `platform/`, `deploy/`, root package files.

Interface: classic script exposes `window.GameActivity.setPlaying(boolean)` and `.finish()`. Hooks may fire repeatedly; setPlaying is idempotent. Heartbeat every approximately 15 seconds of accumulated foreground play; session begins only when active, not on page load. Visibility/pagehide pause accumulation. Request errors never stop gameplay; offline gaps are not falsely backdated on the server.

- [x] Run failing clock/transport tests for hidden pages, pause, resumption, menu exclusion, retry/idempotency, same-game repeated hooks and pagehide.
- [x] Implement the shared client, include it before game code, and hook actual game states (including English course and adventure under one game ID).
- [x] Run targeted client tests and existing relevant game unit checks; report every entry point and any limitation. No live deployment/browser sessions by this worker.

## Task 3: Game hall ranking UI (independent worker)

Files: `index.html`, `games.js`, `shared/popularity.js`, `tests/popularity-ui.test.mjs`. Do not edit activity client, game source, platform or deployment.

- [x] Add stable IDs to the existing catalog, keeping file paths and search intact.
- [x] Build a readable mobile-first popularity panel with day/week/month controls, linked game rows, counts and period range. Match existing hall colors and maintain line spacing.
- [x] Handle loading, empty data and API failure distinctly; abort/ignore stale period responses and expose retry.
- [x] Verify filtering/render behavior with existing game hall tests and focused API-response tests. Do not use fake production ranks or visitor counts labeled as people.

## Task 4: Integration, review and delivery (root)

- [x] Run full required unit checks and targeted native-browser tests for the hall, all activity entry points, hidden/pause/refresh behavior and persistent API.
- [ ] Review changes, resolve actual findings, commit and create a concrete PR; merge and deploy within existing authorization.
- [ ] Verify public homepage and native gameplay on two independent browsers, sliding dedup and day/week/month responses. Verify unchanged multiplayer PIDs, static server/secret exclusions, database persistence and backup restoration.
- [ ] Save deployment evidence and update this plan with actual completed checks and remaining account/cloud-save phase.
