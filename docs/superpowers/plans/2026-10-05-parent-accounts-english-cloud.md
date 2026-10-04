# Parent accounts and English cloud progress — 2026-10-05

Implement stage 2 of the approved 2026-10-04 game-hall platform design. User has authorized continued implementation and deployment without repeated confirmation.

## Outcome and acceptance

Keep all guest games usable. Add an optional parent account centre, multiple nickname/avatar child profiles, verified email/password sign-in, recovery, account export/deletion, and English course cloud progress. Two independent browsers must resume the same child at the same lesson/step, siblings must remain separate, and unrelated parents must receive no child data. Preserve guest saves and offline work. Never sync game coins or room reconnect credentials.

Production currently has no mail configuration. Registration/recovery must report unavailable until configured; never bypass verification for production. Ask only for missing sender configuration, continue implementation and real local auth verification independently. Configure a durable AUTH_SECRET outside Git/docroot. Existing database backups cover the new tables; test restore with family data. Off-host backups require a real configured target.

## Shared API contract

- Better Auth 1.7.7 with PostgreSQL, `/api/auth/*`, parent email/password, verification required, session cookies, existing same-origin protection. Auth object `createAuth({pool,secret,publicOrigin,sendMail})`, async `migrateAuth(auth)`. `sendMail` is optional; none means all signup/recovery/email routes are gated. No bypass in production.
- `createApi` accepts optional `auth`, `familyStore`, `mailReady`; old activity fixture remains compatible. `GET /api/family/status` -> `{enabled,mailReady}` (enabled means auth+family configured).
- Session identity comes exclusively from Better Auth session headers. Require verified user. All family endpoints enforce ownership in SQL; no owner IDs accepted from clients.
- `GET /api/family/profiles` -> `{profiles:[{id,nickname,avatar}]}`. `POST` -> `{profile}` (201), nickname 1–20 printable chars, preset avatars `fox,panda,rabbit,cat,dog,bird`, maximum 8 profiles. `PATCH/DELETE /api/family/profiles/:id` update nickname/avatar or tombstone.
- `GET /api/family/profiles/:id/progress/english` -> `{revision,data}`. Empty data is sanitized course progress `{version:1,lessons:{},items:{},session:null}`.
- `POST` same path -> `{baseRevision,session,events}`. Events `{eventId:UUID,contentVersion:'pep3-2024-v1',contentId:lessonId,kind:'answer'|'completion',occurredAt:millis,result}`. Answer result `{itemKey,correct,hinted}`; completion result `{session}` uses sanitized complete session at final index. At most 256 events/batch and body 512 KiB. Server validates known curriculum keys, finite times, clamps future event time, sorts accepted events by occurredAt,eventId for deterministic replay of review schedules. Duplicate event IDs are idempotent. Stored course data derived from sanitized imported baseline + events; session has revision compare-and-set. Stale base returns 409 `{error:'Progress conflict',current:{revision,data}}`; no events are acknowledged until successful retry. A retry with explicit selected current session carries all pending events. Return full `{revision,data}` after success.
- `POST .../import` -> `{importId:UUID,sourceId:UUID,data}`. Idempotent source/profile/game import, original snapshot retained. Import only into empty profile (otherwise 409, ask parent to select/create empty child). Guest copy is never erased. Imported data validated and bounded; no coins.
- `GET /api/family/export` -> `{profiles,progress}` excludes passwords/tokens/auth sessions. `DELETE /api/family/account` requires recent auth/re-auth handled by library; delete account via Better Auth and cascade family data (client uses auth delete-user endpoint with password). Tombstoned child cannot be resurrected by stale saves.

## Client contract

Parent centre `/account.html`, shared client APIs, hall + English optional entry. Chinese readable text, generous line height, mobile friendly. No registration requirement to learn.

Course `mountCourse` adds `onSave({progress,event})` callback, API `replaceProgress(raw,{storageKey})`, and `snapshot()`/`save()` while preserving default guest key `pearl-english-course-v1`. Answer emits once on first step answer; completion emits once before clearing session. Events timestamps and UUID allocated by cloud controller. Profile storage keys are separate from guest and owner-scoped. Startup loads remote child before permitting child writes; offline starts from cached previously verified child only. Explicit import button shows local guest progress and requires parent choice.

Cloud controller persists queue per owner+profile and revision with session snapshot. Debounced sync, retry on reconnect, visible `此设备/同步中/已同步/离线待同步/需选择进度` states. Stale revision preserves both snapshots and pending events; show choice buttons for cloud or this device session, retry all events against current revision. Switching child first flushes old snapshot, saves queue even offline, exits lesson and loads new child. Logout restores guest save; never puts cloud progress under guest key. Cross-tab profile changes use storage event. Do not clear queue on failed request, auth loss, or conflicts.

## Tasks and files

1. Auth/server: `platform/auth.mjs`, `platform/mail.mjs`, platform dependencies, `platform/server.mjs`; real HTTP auth tests with captured test mailbox (verification, login, reset, logout, ownership, CSRF). No captured mail token output.
2. Family store: `platform/family-store.mjs`, `platform/migrations/002-family.sql`, `platform/english-progress.mjs`; real PostgreSQL tests for ownership/tombstones/CAS/event replay/import idempotency/export.
3. Client: `account.html`, `shared/family-client.js`, `shared/family.css`, `shared/account.js`, `english/course-cloud.js`, surgical `english/course-ui.js`/`english/main.js`/hall entry; queue tests and native browser flow.
4. Integration: auth-enabled browser fixture, independent browser native clicks, offline/conflict, profile/logout/guest preservation. Build English bundle, existing unit suite and affected browser suite. Review changes and fix findings.
5. Delivery: include all new backend/shared course source dependencies in platform runtime fingerprint, preserve unchanged racing/rescue/shooter PIDs. Backup before migration, configure secret outside docroot, merge reviewed exact head, deploy, verify public guest flow and honest gated account state if mail unavailable. When sender exists, verify actual recipient delivery and live cross-device auth/save. Record concrete evidence and any missing external input.

## Status

- Plan approved by existing stage-2 design and user continuation.
- Existing isolated worktree reused on fresh branch from origin/main 52480ec.
- Mail configuration absent; user asked for sender/config location. No credentials printed.
