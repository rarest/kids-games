#!/usr/bin/env bash
# Install only the isolated speech runtime. Model download is a separate setup step.
set -euo pipefail
cd "$(dirname "$0")/.."
STATE_DIR="${1:?Deployment state directory required}"
SPEECH_RUNTIME="${SPEECH_DEPLOY_RUNTIME:-$HOME/.local/share/games-speech}"
SPEECH_UNIT_DIR="${SPEECH_DEPLOY_UNIT_DIR:-/etc/systemd/system}"
if [ ! -x "$SPEECH_RUNTIME/venv/bin/python" ] || [ ! -s "$SPEECH_RUNTIME/model/model.fp32.onnx" ] || [ ! -s "$SPEECH_RUNTIME/model/vocab.json" ]; then
  echo 'Local speech model/runtime missing outside docroot' >&2; exit 1
fi
mkdir -p "$STATE_DIR" "$SPEECH_RUNTIME"
SPEECH_DEPENDENCIES="$(sha256sum platform/speech-requirements.txt | cut -d' ' -f1)"
if [ ! -f "$STATE_DIR/speech-dependencies" ] || [ "$(cat "$STATE_DIR/speech-dependencies")" != "$SPEECH_DEPENDENCIES" ]; then
  "$SPEECH_RUNTIME/venv/bin/python" -m pip install --disable-pip-version-check -r platform/speech-requirements.txt
  printf '%s\n' "$SPEECH_DEPENDENCIES" > "$STATE_DIR/speech-dependencies"
fi
SPEECH_FINGERPRINT="$(sha256sum platform/speech_inference.py platform/speech_reference.py platform/speech_scoring.py platform/speech-requirements.txt deploy/games-speech.service | sha256sum | cut -d' ' -f1)"
SPEECH_CHANGED=false
if [ ! -f "$STATE_DIR/speech-runtime" ] || [ "$(cat "$STATE_DIR/speech-runtime")" != "$SPEECH_FINGERPRINT" ]; then SPEECH_CHANGED=true; fi
for FILE in speech_inference.py speech_reference.py speech_scoring.py speech-requirements.txt; do
  if ! cmp -s "platform/$FILE" "$SPEECH_RUNTIME/$FILE"; then cp "platform/$FILE" "$SPEECH_RUNTIME/$FILE"; SPEECH_CHANGED=true; fi
done
if ! cmp -s deploy/games-speech.service "$SPEECH_UNIT_DIR/games-speech.service"; then
  sudo install -m644 deploy/games-speech.service "$SPEECH_UNIT_DIR/games-speech.service"
  sudo systemctl daemon-reload
  SPEECH_CHANGED=true
fi
if ! sudo systemctl is-enabled --quiet games-speech.service; then sudo systemctl enable games-speech.service; fi
if ! sudo systemctl is-active --quiet games-speech.service; then
  sudo systemctl start games-speech.service
elif $SPEECH_CHANGED; then
  sudo systemctl restart games-speech.service
fi
curl -fsS --retry 10 --retry-connrefused --retry-all-errors --retry-delay 1 --max-time 2 http://127.0.0.1:8769/health | node --input-type=module -e '
let raw="";for await(const chunk of process.stdin)raw+=chunk;
const value=JSON.parse(raw);if(value.ready!==true||value.engine!=="local-phoneme")process.exit(1);
'
printf '%s\n' "$SPEECH_FINGERPRINT" > "$STATE_DIR/speech-runtime"
