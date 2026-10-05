# Local phoneme runtime evidence, 2026-10-05

Implemented `platform/pronunciation.mjs`, HTTP speech routes, a loopback Python ONNX service, phoneme reference/alignment helpers, isolated Python requirements, systemd limits, nginx upload/time bounds, and install/scoring documentation.

Actual server: `oci-cc-arm`, ARM64. Service `games-speech` is enabled and active; model health responds with `ready:true`, `engine:local-phoneme`. The runtime and 1.26GB fp32 model are in `/home/ubuntu/.local/share/games-speech`, outside the site. ONNX uses CPU with four intra-operation threads and one serialized inference. Observed resident/cgroup memory: approximately 1.47GB after startup, 1.87GB after the maximum-duration test. CPU quota is three cores, memory cap 4GB.

The private `/home/ubuntu/.config/games-platform/app.env` has the local inference URL. The application/platform service has not been restarted by this agent. Root owns coordinated site deployment and public API verification.

Short speech acceptance is saved in `local-phoneme-evaluation.json`: real existing textbook standard TTS positive examples, different-word negatives, generated silence and white noise. Scores use acoustic phonemes. Standard `cat` TTS received 67 because the recognizer heard `/keɪt/`; this result is retained transparently. English phoneme length marks are normalized, while vowel quality stays distinct.

Maximum-duration acceptance in `local-phoneme-long-evaluation.json`: 19.656 seconds of repeated existing standard TTS was assessed in 9.331 seconds, scoring 85 across 36 words. This checks actual bounded model inference at the upper upload/duration limit.

Node tests: WAV parsing, readiness, response validation, rate/daily/concurrency checks, origin and known-target route handling. Python tests: edit alignment, missing words, inserted speech, silence/encoding checks, reference tokens and numeric target words. Local reference suite skips its eSpeak executable check when unavailable; four reference regressions were run successfully against the actual installed eSpeak host, including complete final-letter pronunciation and separating `/j uː/`.

Next root action: commit/sync frontend and platform together, deploy the updated nginx include, restart platform, then verify the public speech status and a known textbook target with actual speech. The speech runtime is ready and enabled locally; no paid credentials remain to obtain.
