# English Adventure Implementation Plan

1. In isolated feat/english-pep worktree, author verified curriculum.js and SOURCES.md against publisher catalog. Test all books/unit references, IPA and original exercises. No copied textbook dialogs.
2. Write core behavioral tests first: 36 unique levels, 10 spaced cards, pause all clocks/rivals, one 200-coin payout per completed card, 33 priced skins, validated durable ownership. Implement core.js.
3. Build procedural local-Three.js scene.js: distinct curved slide, jump platforms, bike and race; 9 themes; bead avatars/accessories/trails; stable mobile canvas. Rendering consumes logical state only.
4. Add games/english.html, english/style.css, main.js: school hub, grade/book/unit choice, mini-game course grid, question feedback, sentence assembly, shop and native/bundled US audio. Bundle with esbuild.
5. Generate self-authored US vocabulary audio. Browser-test actual gameplay with pause, rewards, shop persistence, audio decode/playback, four modes, mobile rotation and desktop. Fix failures, retain screenshots.
6. Review full new subsystem. Add catalog entry/cache version and update game-count assertions. Run repository unit suite and relevant browser suites sequentially.
7. Fetch latest main, integrate changes without touching ongoing rescue work, push PR, merge verified SHA. Verify webhook deployment and public playable English flow; preserve live coop rooms/services. Record artifact and public acceptance results.
