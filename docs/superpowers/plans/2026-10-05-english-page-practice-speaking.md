# English page practice and speaking implementation plan

> Execute with subagent-driven-development; user has already authorized direct implementation and deployment.

**Goal:** Every printed page word/sentence can be practiced and recorded in a readable web lesson, with a truthful acoustic scoring integration.
**Architecture:** Source-derived page targets and pure practice engine; standalone recorder/assessment component; textbook modal integrates both and guided-course oral/example entry. Platform adds bounded binary-audio assessment adapter.
**Spec:** docs/superpowers/specs/2026-10-05-english-page-practice-speaking-design.md

- [ ] Page engine: english/page-practice.js exports pageTargets(page), getTarget(id), makePractice(page); separate page-practice-progress.js load/save helpers with stable IDs; tests enumerate the 90 printed pages, no sampled coverage.
- [ ] Speech implementation: english/speaking.js exports mountSpeaking({root,target,speak,onResult,onError}), destroy; platform/pronunciation.mjs and route integration; tests for actual PCM recording pipeline, service gate/validation/limits/provider parsing; no credentials in repo.
- [ ] Integration/layout: textbook.js + main.js + CSS, page view tabs/navigation/all-target practice and oral entry. Native controls and preserved saves; tests for incorrect retry, page change, recorder cleanup, mobile line spacing.
- [ ] Review and meaningful checks: unit + affected browser suites, generated bundle and cache metadata.
- [ ] Merge/deploy: only platform runtime restart; public page/practice/audio checks; record public voice/practice evidence and preserved game service PIDs.

## State

Fresh feature branch from origin/main 9737f80 in existing isolated worktree. No paid speech account required. User authorized free self-hosted acoustic phoneme inference; model installed outside docroot, code and service managed by deployment. Prior parent email registration gate remains unchanged.

## Ownership/contracts

Page engine agent owns page-practice.js and tests/page-practice.test.mjs. IDs `p${page.page}-word-${index}` and `p${page.page}-line-${blockIndex}-${lineIndex}`. Target {id,page,kind:'word'|'sentence',en,zh,ipa?,say?,wordId?}; getTarget uses BOOKS g3-upper textbookPages. makePractice returns an array with at least one target-specific listening/meaning question for every target, plus reorder for natural short multiword lines. Each question {id,targetId,kind:'meaning'|'listening'|'order',prompt,answer,choices?,tokens?}. Answer English/Chinese string, order tokens rejoin English ignoring final punctuation. Existing course progress schema untouched.

Speech agent owns speaking.js/speaking-audio.js/pronunciation.mjs/pronunciation tests plus server.mjs and deploy/games-platform.conf. Integration root imports mountSpeaking. target = page target or a lesson entry mapped to a page target; no invented target IDs accepted by server. API GET /api/english/speech-status -> {enabled,provider:'local-phoneme'|null}; POST /api/english/pronunciation?target=<id> body audio/wav. Unavailable model returns 503, silence/no voice 422; scores measure acoustic phoneme alignment. Private SPEECH_LOCAL_URL points to localhost service. No API keys. Root owns textbook/main/CSS/UI tests and build/cache. Agents do not commit shared unrelated files or build bundle. Task review after implementation.

Learning-first revision: remove racing/parkour/coin shop from the English homepage. Keep untimed source-specific listening, meaning, sentence ordering and spoken feedback. Navigation and progress refer to words learned and questions answered, with 1/3/7-day course review. Games elsewhere remain available.
