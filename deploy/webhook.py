#!/usr/bin/env python3
"""Minimal, dependency-free GitHub webhook listener for kids-games.

Listens on 127.0.0.1 (exposed publicly only via the OpenResty reverse-proxy
location /_deploy_hook). Verifies the GitHub HMAC signature, and on a push to
main runs deploy-local.sh which pulls the repo and syncs it into the 1Panel
static-site docroot.
"""
import hashlib
import hmac
import http.server
import json
import os
import subprocess
import sys

SECRET = os.environ.get("GAMES_WEBHOOK_SECRET", "").encode()
PORT = int(os.environ.get("GAMES_WEBHOOK_PORT", "19000"))
DEPLOY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "deploy-local.sh")


def valid(sig, body):
    if not SECRET or not sig or not sig.startswith("sha256="):
        return False
    mac = hmac.new(SECRET, body, hashlib.sha256).hexdigest()
    return hmac.compare_digest("sha256=" + mac, sig)


class Handler(http.server.BaseHTTPRequestHandler):
    def _reply(self, code, msg):
        self.send_response(code)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(msg.encode())

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        if not valid(self.headers.get("X-Hub-Signature-256", ""), body):
            return self._reply(403, "bad signature")
        event = self.headers.get("X-GitHub-Event", "")
        if event == "ping":
            return self._reply(200, "pong")
        if event != "push":
            return self._reply(200, "ignored event")
        try:
            ref = json.loads(body).get("ref", "")
        except Exception:
            ref = ""
        if ref and ref != "refs/heads/main":
            return self._reply(200, "ignored branch " + ref)
        try:
            out = subprocess.run(["bash", DEPLOY], capture_output=True, text=True, timeout=120)
            log = (out.stdout + out.stderr).strip()
            sys.stderr.write(log + "\n")
            sys.stderr.flush()
            return self._reply(200 if out.returncode == 0 else 500, log[-800:] or "ok")
        except Exception as exc:  # noqa: BLE001
            return self._reply(500, str(exc))

    def log_message(self, *args):  # silence default access log
        pass


if __name__ == "__main__":
    http.server.HTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
