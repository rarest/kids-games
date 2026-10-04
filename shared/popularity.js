(function (global) {
  'use strict';

  const periods = { day: '日榜', week: '周榜', month: '月榜' };
  const numbers = new Intl.NumberFormat('zh-CN');
  const dates = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: 'long', day: 'numeric' });
  const times = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hour12: false });
  const escape = value => String(value == null ? '' : value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const isDate = value => typeof value === 'string' && Number.isFinite(Date.parse(value));

  function normalize(payload, catalog, period) {
    if (!periods[period] || !payload || payload.period !== period || !Array.isArray(payload.items)
      || !isDate(payload.range?.start) || !isDate(payload.range?.end)
      || Date.parse(payload.range.end) <= Date.parse(payload.range.start)
      || typeof payload.range.label !== 'string' || !payload.range.label.trim()
      || !isDate(payload.statisticsStartedAt) || !isDate(payload.updatedAt)) {
      throw new Error('Invalid popularity response');
    }
    const games = new Map(catalog.map(game => [game.id, game]));
    const seen = new Set();
    const items = [];
    for (const item of payload.items) {
      if (!item || !games.has(item.gameId)) continue;
      if (seen.has(item.gameId) || !Number.isSafeInteger(item.plays) || item.plays < 0
        || (item.activeSeconds != null && (!Number.isSafeInteger(item.activeSeconds) || item.activeSeconds < 0))) {
        throw new Error('Invalid popularity totals');
      }
      seen.add(item.gameId);
      if (item.plays > 0) items.push({ ...games.get(item.gameId), plays: item.plays, activeSeconds: item.activeSeconds });
    }
    return { period, range: payload.range, statisticsStartedAt: payload.statisticsStartedAt, updatedAt: payload.updatedAt, items };
  }

  function duration(seconds) {
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    return minutes < 60 ? `${minutes}分` : `${Math.floor(minutes / 60)}小时${minutes % 60 ? `${minutes % 60}分` : ''}`;
  }

  function renderResults(state) {
    const label = periods[state.period];
    if (state.status === 'loading') return `<div class="popularity-message"><span class="popularity-spark" aria-hidden="true">✦</span><p>正在加载${label}…</p></div>`;
    if (state.status === 'error') return '<div class="popularity-message"><p>暂时未能加载热门游戏</p><p class="popularity-muted">请稍后再试，或从下方选择游戏。</p><button type="button" class="popularity-retry" data-popularity-retry>重试</button></div>';
    const data = state.data;
    const meta = `<div class="popularity-meta"><p>${escape(data.range.label)} <span>· 北京时间</span></p><p>统计开始于 <time datetime="${escape(data.statisticsStartedAt)}">${dates.format(new Date(data.statisticsStartedAt))}</time> <span>· ${times.format(new Date(data.updatedAt))} 更新</span></p></div>`;
    if (!data.items.length) return `${meta}<div class="popularity-message"><span class="popularity-spark" aria-hidden="true">🌱</span><p>本期还没有有效游玩记录</p><p class="popularity-muted">选一款游戏，玩满15秒后就会开始计数。</p></div>`;
    return `${meta}<p class="popularity-column-label">按有效游玩次数排序</p><ol class="popularity-list">${data.items.map((game, index) => `
      <li><a class="popularity-row" href="${escape(game.file)}">
        <span class="popularity-rank${index < 3 ? ' popularity-rank-top' : ''}" aria-label="第${index + 1}名">${index + 1}</span>
        <span class="popularity-icon" aria-hidden="true">${escape(game.emoji || '🎮')}</span>
        <span class="popularity-game"><span class="popularity-name">${escape(game.name)}</span>${game.activeSeconds > 0 ? `<span class="popularity-duration">游玩 ${duration(game.activeSeconds)}</span>` : ''}</span>
        <span class="popularity-count"><strong>${numbers.format(game.plays)}</strong><span>次<span class="sr-only">有效游玩</span></span></span>
        <span class="popularity-arrow" aria-hidden="true">›</span>
      </a></li>`).join('')}</ol>`;
  }

  function createController(options) {
    let sequence = 0;
    let activeRequest;
    return {
      async load(period) {
        if (!periods[period]) throw new Error('Invalid popularity period');
        const requestSequence = ++sequence;
        if (activeRequest) activeRequest.abort();
        const request = new AbortController();
        activeRequest = request;
        options.onState({ status: 'loading', period });
        let timeout;
        try {
          const payload = await Promise.race([
            options.fetch(`/api/popularity?period=${period}`, { signal: request.signal, credentials: 'same-origin', cache: 'no-store' }).then(response => {
              if (!response.ok) throw new Error('Popularity request failed');
              return response.json();
            }),
            new Promise((_, reject) => { timeout = setTimeout(() => { request.abort(); reject(new Error('Popularity timeout')); }, options.timeoutMs ?? 10000); }),
          ]);
          if (requestSequence !== sequence) return;
          const data = normalize(payload, options.catalog, period);
          options.onState({ status: data.items.length ? 'ready' : 'empty', period, data });
        } catch (error) {
          if (requestSequence === sequence) options.onState({ status: 'error', period });
        } finally { clearTimeout(timeout); }
      },
    };
  }

  function mount(root, catalog) {
    const tabs = Array.from(root.querySelectorAll('[data-popularity-period]'));
    const panel = root.querySelector('[data-popularity-panel]');
    const results = root.querySelector('[data-popularity-results]');
    const status = root.querySelector('[data-popularity-status]');
    let selectedPeriod = 'day';
    const controller = createController({ catalog, fetch: global.fetch.bind(global), onState(state) {
      selectedPeriod = state.period;
      for (const tab of tabs) {
        const selected = tab.dataset.popularityPeriod === state.period;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        if (selected) panel.setAttribute('aria-labelledby', tab.id);
      }
      panel.setAttribute('aria-busy', String(state.status === 'loading'));
      results.innerHTML = renderResults(state);
      status.textContent = state.status === 'loading' ? `正在加载${periods[state.period]}`
        : state.status === 'error' ? `${periods[state.period]}加载失败，可重试`
          : state.status === 'empty' ? `${periods[state.period]}暂无有效游玩记录`
            : `${periods[state.period]}已加载，共${state.data.items.length}款游戏`;
    } });
    for (const [index, tab] of tabs.entries()) {
      tab.addEventListener('click', () => controller.load(tab.dataset.popularityPeriod));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        tabs[next].focus();
        controller.load(tabs[next].dataset.popularityPeriod);
      });
    }
    results.addEventListener('click', event => {
      if (event.target.closest('[data-popularity-retry]')) controller.load(selectedPeriod);
    });
    controller.load('day');
  }

  global.GamePopularity = { normalize, renderResults, createController, mount };
})(window);
