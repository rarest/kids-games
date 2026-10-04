/* Foreground activity only. This classic script must precede each game's entry point. */
(function () {
  'use strict';
  if (window.GameActivity) return;
  var known = ['memory', 'english', 'rescue', 'parkour', 'racing', 'territory', 'shooter', 'pinyin', 'snake', 'fish', 'fishing', 'goldminer', 'maze', 'merge4096'];
  var entry = /\/([^/]+)\.html$/.exec(window.location.pathname);
  var gameId = document.currentScript && document.currentScript.dataset.gameId || (entry && entry[1]);
  var playing = false, pageHidden = false, active = false;
  var sessionId = null, seconds = 0, accepted = 0, pending = null;
  var lastSample = performance.now(), lastContact = 0, lastAttempt = -Infinity, busy = false, flushRequested = false, flushKeepalive = false;
  var interval = 15000, stale = 60000;
  function eligible() { return playing && !document.hidden && !pageHidden; }
  function sample() {
    var now = performance.now();
    if (active && sessionId) seconds += Math.max(0, now - lastSample) / 1000;
    lastSample = now;
  }
  function reset() { sessionId = null; seconds = accepted = 0; pending = null; active = false; }
  async function post(url, body, keepalive) {
    var timeout, controller = typeof AbortController === 'function' ? new AbortController() : null;
    try {
      return await Promise.race([
        window.fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(body), keepalive: !!keepalive, signal: controller ? controller.signal : undefined }).then(async function (response) { return { ok: response.ok, status: response.status, data: response.ok ? await response.json() : null }; }),
        new Promise(function (_, reject) { timeout = setTimeout(function () { if (controller) controller.abort(); reject(new Error('Activity timeout')); }, 10000); })
      ]);
    } finally { clearTimeout(timeout); }
  }
  async function send(force, keepalive) {
    if (known.indexOf(gameId) < 0) return;
    if (busy) { if (force) { flushRequested = true; flushKeepalive = flushKeepalive || !!keepalive; } return; }
    var now = performance.now();
    if (sessionId && now - lastContact >= stale) reset();
    if (!force && now - lastAttempt < interval) return;
    if (!sessionId && !eligible()) return;
    if (sessionId && pending === null && Math.floor(seconds) <= accepted) return;
    if (sessionId && !force && pending === null && Math.floor(seconds) - accepted < 15) return;
    busy = true; lastAttempt = now;
    try {
      if (!sessionId) {
        var start = await post('/api/activity/start', { gameId: gameId }, keepalive);
        if (!start.ok) return;
        var created = start.data;
        if (typeof created.sessionId !== 'string' || !created.sessionId) return;
        sessionId = created.sessionId; seconds = accepted = 0; pending = null;
        lastSample = lastContact = performance.now(); active = eligible();
      } else {
        // Retain a lost response's cumulative value until it is acknowledged.
        if (pending === null) pending = Math.min(Math.floor(seconds), accepted + 60);
        var result = await post('/api/activity', { sessionId: sessionId, activeSeconds: pending }, keepalive);
        if (result.status === 404 || result.status === 409) { reset(); return; }
        if (!result.ok) return;
        var receipt = result.data;
        if (!Number.isFinite(receipt.acceptedSeconds) || receipt.acceptedSeconds < accepted || receipt.acceptedSeconds > pending) return;
        sample();
        // Server wall-time bounds can trim a report; discard the rejected gap.
        seconds = receipt.acceptedSeconds + Math.max(0, seconds - pending);
        accepted = receipt.acceptedSeconds; pending = null; lastContact = performance.now();
      }
    } catch (_) {
      // Statistics must never interrupt game input, rendering or sound.
    } finally {
      busy = false;
      if (flushRequested) { var unload = flushKeepalive; flushRequested = flushKeepalive = false; void send(true, unload); }
    }
  }
  function setPlaying(value) {
    var next = !!value;
    if (playing === next) return;
    sample(); playing = next; active = eligible() && !!sessionId;
    void send(!next, false);
  }
  function finish() { sample(); playing = false; active = false; void send(true, true); }
  window.GameActivity = { setPlaying: setPlaying, finish: finish };
  document.addEventListener('visibilitychange', function () {
    sample(); active = eligible() && !!sessionId;
    void send(document.hidden, document.hidden);
  });
  window.addEventListener('pagehide', function () {
    sample(); pageHidden = true; active = false; void send(true, true);
  });
  window.addEventListener('pageshow', function () {
    lastSample = performance.now(); pageHidden = false; active = eligible() && !!sessionId; void send(false, false);
  });
  setInterval(function () { sample(); active = eligible() && !!sessionId; void send(false, false); }, 1000);
})();
