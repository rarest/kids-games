# Printed-page practice and spoken English

User requests all vocabulary and sentences on each photographed textbook page to receive practice, improved spacing/layout, and actual spoken word/sentence scoring. Existing authorization says implement and publish without repeated confirmation. Keep printed source wording, existing courses, accounts, guest saves and game wallets intact.

## Learning experience

All 90 currently transcribed pages have a clear page selector and previous/next navigation. Provide three views: original bilingual reading, full-page vocabulary/sentence practice, and spoken targets. Every page word and every English line appears as a practice target; no silent sample-only coverage. Study instructions and letter lines can use matching/reading targets when sentence reordering is inappropriate. Each target has source English, Chinese meaning, audio input and explicit source page. Page practice uses listening/meaning choices and sentence token arrangement where suitable. Distractors are unique and answer ordering varies deterministically. Preserve local practice progress and a retry list; keep this new storage independent of guest guided-course saves and game wallet. Storage failures leave the current session usable.

Desktop uses limited reading width, original subject art, word cards, and a sticky practice navigation where useful. Mobile stacks panels; controls wrap, target text never clips, interactive sizes at least 44px, line-height at least 1.7 for explanatory paragraphs. No tiny dense glossary or whole-page wall of text.

## Speech

Record a short word or sentence with browser microphone permission, waveform/status, stop/cancel, playback and retry. Capture genuine microphone samples, encode 16 kHz mono PCM WAV, maximum 20 seconds. Always stop microphone tracks on cancel, target/page change, navigation or dialog close. No automatic microphone prompt, no persistent audio storage and no silent uploads. A parent-facing notice explains sending audio for assessment, and explicit assess button performs upload. Audio is retained only in page memory and discarded on exit.

Server assesses only known textbook target IDs, never arbitrary client-supplied reference text. Azure Speech short-audio REST adapter uses HundredMark, phoneme detail, comprehensive dimensions and miscue calculation. Return validated provider acoustic accuracy/fluency/completeness/overall values and word feedback. Silence, unrecognized audio or missing score is no result, never a fabricated zero/100. UI identifies feedback as automated practice feedback. Proper names may need approximate pronunciation and must not carry a strict pass threshold.

Real deployment currently has no speech-provider configuration. Request only the missing existing configuration location; implement independently. Expose enabled status, keep recording/playback operational without provider and explicitly state scoring unavailable. Do not mislabel speech-to-text word matching as phonetic scoring or silently sign up for a paid service. Real acoustic acceptance remains pending credentials plus actual spoken-recording verification.

## Server and safety

Same-origin status and POST binary WAV endpoint, bounded request and duration, fixed HTTPS provider endpoint from private env, provider key never shipped to browser. Limit rate per source IP, concurrency and daily global evaluation requests; reject excessive requests before provider call. Do not log audio, transcript, keys, child identifiers, or provider response bodies. No storage of recordings in database or backup. Missing config does not break platform startup; partial invalid config fails clearly. Auth/progress APIs and multiplayer fingerprints remain unaffected except the platform service restart required for the new endpoint.

## Acceptance

Programmatically enumerate all source words and English lines and confirm exact target coverage. Unit-test quiz answer uniqueness, persistence, incorrect retry, microphone and PCM handling, provider result validation, invalid audio, same-origin, limits and unavailable gate. Native browser interactions traverse reading/practice/recording, target/page switch, cancellation and small/large screens; genuine local audio fixture can verify recording/playback but is not proof of provider acoustic scoring. Run existing affected guided-course and textbook regression checks. Publish exact reviewed commit and inspect actual public UI/API, leaving only real provider scoring conditional on the missing configuration.
