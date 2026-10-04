import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const catalogSource = await readFile(new URL('../games.js', import.meta.url), 'utf8');
const catalogContext = { window: {} };
vm.runInNewContext(catalogSource, catalogContext);
const catalog = JSON.parse(JSON.stringify(catalogContext.window.GAMES));

async function ui() {
  let source;
  try { source = await readFile(new URL('../shared/popularity.js', import.meta.url), 'utf8'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  assert.ok(source, 'the popularity UI client exists');
  const context = { window: {}, Intl, AbortController, setTimeout, clearTimeout };
  vm.runInNewContext(source, context);
  return context.window.GamePopularity;
}

function payload(period = 'day', items = []) {
  return {
    period,
    range: { start: '2026-10-03T16:00:00.000Z', end: '2026-10-04T16:00:00.000Z', label: '10月4日' },
    statisticsStartedAt: '2026-10-03T18:00:00.000Z',
    updatedAt: '2026-10-04T04:00:00.000Z',
    items,
  };
}
const response = data => ({ ok: true, json: async () => data });
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

test('hung response bodies leave loading and expose retry after the request deadline', {timeout:1000}, async () => {
  const {createController} = await ui();
  const states = [];
  const controller = createController({catalog, timeoutMs: 5, onState: state => states.push(state), fetch: async () => ({ok:true, json: () => new Promise(() => {})})});
  await controller.load('day');
  assert.deepEqual(states.map(state => state.status), ['loading', 'error']);
});

test('catalog IDs keep each game reachable even when its URL has cache parameters', () => {
  const ids = ['memory', 'english', 'rescue', 'parkour', 'racing', 'territory', 'shooter', 'pinyin', 'snake', 'fish', 'fishing', 'goldminer', 'maze', 'merge4096'];
  assert.deepEqual(catalog.map(game => game.id), ids);
  for (const game of catalog) {
    assert.equal(new URL(game.file, 'https://games.test').pathname, `/games/${game.id}.html`);
  }
});

test('rankings use the known catalog links and server order, with no zero-play or unknown games', async () => {
  const { normalize } = await ui();
  const result = normalize(payload('day', [
    { gameId: 'rescue', plays: 12, activeSeconds: 3600 },
    { gameId: 'memory', plays: 3, activeSeconds: 76 },
    { gameId: 'unknown', plays: 1, activeSeconds: 20 },
    { gameId: 'fish', plays: 0, activeSeconds: 0 },
  ]), catalog, 'day');
  assert.deepEqual(Array.from(result.items, row => [row.id, row.name, row.file, row.plays]), [
    ['rescue', '松鼠大作战', 'games/rescue.html?v=20261004rescue-online6', 12],
    ['memory', '记忆花园', 'games/memory.html', 3],
  ]);
});

test('rendered ranks show escaped titles, reachable links, counts, range and Shanghai statistics date', async () => {
  const { normalize, renderResults } = await ui();
  const data = normalize(payload('day', [{ gameId: 'memory', plays: 1234, activeSeconds: 3675 }]),
    [{ ...catalog[0], name: '<img src=x onerror=alert(1)>' }], 'day');
  const html = renderResults({ status: 'ready', period: 'day', data });
  assert.match(html, /href="games\/memory.html"/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /1,234/);
  assert.match(html, /有效游玩次数/);
  assert.match(html, /1小时1分/);
  assert.match(html, /10月4日/);
  assert.match(html, /2026年10月4日/);
  assert.doesNotMatch(html, /1,234\s*人/);
});

test('empty, loading and failed requests have distinct visible states without fabricated ranks', async () => {
  const { normalize, renderResults } = await ui();
  const empty = renderResults({ status: 'empty', period: 'day', data: normalize(payload(), catalog, 'day') });
  assert.match(empty, /还没有/);
  assert.match(empty, /2026年10月4日/);
  assert.doesNotMatch(empty, /<ol|popularity-row/);
  const loading = renderResults({ status: 'loading', period: 'week' });
  assert.match(loading, /加载/);
  assert.doesNotMatch(loading, /重试/);
  const error = renderResults({ status: 'error', period: 'month' });
  assert.match(error, /未能/);
  assert.match(error, /<button[^>]*data-popularity-retry[^>]*>重试<\/button>/);
});

test('API failure can be retried for the selected period and successful empty data stays empty', async () => {
  const { createController } = await ui();
  const states = [], requests = [];
  const controller = createController({ catalog, onState: state => states.push(state), fetch: async (url, options) => {
    requests.push([url, options.credentials]);
    return requests.length === 1 ? { ok: false, status: 503 } : response(payload('month'));
  } });
  await controller.load('month');
  assert.deepEqual(states.map(state => state.status), ['loading', 'error']);
  await controller.load('month');
  assert.deepEqual(states.map(state => state.status), ['loading', 'error', 'loading', 'empty']);
  assert.deepEqual(requests, [['/api/popularity?period=month', 'same-origin'], ['/api/popularity?period=month', 'same-origin']]);
  assert.equal(states.at(-1).period, 'month');
  assert.equal(states.at(-1).data.items.length, 0);
});

test('a slower old period cannot replace the newly selected period, even when transport ignores abort', async () => {
  const { createController } = await ui();
  const first = deferred(), second = deferred(), states = [], signals = [];
  const controller = createController({ catalog, onState: state => states.push(state), fetch: (url, options) => {
    signals.push(options.signal);
    return url.endsWith('day') ? first.promise : second.promise;
  } });
  const day = controller.load('day');
  const week = controller.load('week');
  second.resolve(response(payload('week', [{ gameId: 'maze', plays: 5, activeSeconds: 80 }])));
  await week;
  first.resolve(response(payload('day', [{ gameId: 'memory', plays: 20, activeSeconds: 400 }])));
  await day;
  assert.equal(signals[0].aborted, true);
  assert.deepEqual(states.map(state => [state.status, state.period]), [['loading', 'day'], ['loading', 'week'], ['ready', 'week']]);
  assert.equal(states.at(-1).data.items[0].id, 'maze');
});

test('malformed API data and wrong period are errors instead of misleading empty or ranked results', async () => {
  const { normalize, createController } = await ui();
  assert.throws(() => normalize(payload('week'), catalog, 'day'));
  assert.throws(() => normalize(payload('day', [{ gameId: 'fish', plays: -1, activeSeconds: 20 }]), catalog, 'day'));
  assert.throws(() => normalize({ ...payload(), items: null }, catalog, 'day'));
  const states = [];
  const controller = createController({ catalog, onState: state => states.push(state), fetch: async () => response(payload('week')) });
  await controller.load('day');
  assert.deepEqual(states.map(state => state.status), ['loading', 'error']);
});

test('homepage mounts the ranking tabs while its existing search still filters the game grid', async () => {
  // Run the actual page scripts. The small DOM stand-in implements only the browser boundary;
  // ranking, selection, keyboard handling and search all execute production code.
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const source = await readFile(new URL('../shared/popularity.js', import.meta.url), 'utf8');
  function element(attributes = {}) {
    return {
      attributes, dataset: {}, listeners: {}, style: {}, innerHTML: '', textContent: '',
      setAttribute(key, value) { this.attributes[key] = value; },
      addEventListener(type, listener) { this.listeners[type] = listener; },
      focus() { this.focused = true; },
    };
  }
  const tabs = Array.from(html.matchAll(/<button\b([^>]*data-popularity-period[^>]*)>/g), match => {
    const attributes = Object.fromEntries(Array.from(match[1].matchAll(/([\w-]+)="([^"]*)"/g), pair => [pair[1], pair[2]]));
    const tab = element(attributes);
    tab.id = attributes.id;
    tab.dataset.popularityPeriod = attributes['data-popularity-period'];
    return tab;
  });
  const panel = element(), results = element(), status = element();
  const root = {
    querySelectorAll: () => tabs,
    querySelector: selector => ({ '[data-popularity-panel]': panel, '[data-popularity-results]': results, '[data-popularity-status]': status })[selector],
  };
  const nodes = { popularity: root, grid: element(), empty: element(), q: element() };
  const requests = [];
  const context = {
    window: { GAMES: catalog, fetch: async url => {
      const period = new URL(url, 'https://games.test').searchParams.get('period');
      requests.push(period);
      return response(payload(period, [{ gameId: 'maze', plays: 2, activeSeconds: 40 }]));
    } },
    document: { getElementById: id => nodes[id], querySelector: () => element() },
    Intl, AbortController, setTimeout, clearTimeout,
  };
  vm.runInNewContext(source, context);
  const inline = Array.from(html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g), match => match[1]).filter(Boolean).at(-1);
  vm.runInNewContext(inline, context);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal((nodes.grid.innerHTML.match(/class="card"/g) || []).length, 14);
  assert.match(results.innerHTML, /皇冠迷宫/);
  assert.deepEqual(tabs.map(tab => tab.attributes.role), ['tab', 'tab', 'tab']);
  assert.deepEqual(tabs.map(tab => tab.attributes['aria-selected']), ['true', 'false', 'false']);
  assert.equal(panel.attributes['aria-busy'], 'false');
  nodes.q.value = '圈地';
  nodes.q.listeners.input();
  assert.equal((nodes.grid.innerHTML.match(/class="card"/g) || []).length, 1);
  assert.match(nodes.grid.innerHTML, /纸片领地/);
  assert.match(results.innerHTML, /皇冠迷宫/);
  nodes.q.value = '没有这个游戏';
  nodes.q.listeners.input();
  assert.equal(nodes.empty.hidden, false);
  let prevented = false;
  tabs[0].listeners.keydown({ key: 'End', preventDefault() { prevented = true; } });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(prevented, true);
  assert.equal(tabs[2].focused, true);
  assert.deepEqual(tabs.map(tab => tab.attributes['aria-selected']), ['false', 'false', 'true']);
  assert.deepEqual(tabs.map(tab => tab.tabIndex), [-1, -1, 0]);
  assert.equal(panel.attributes['aria-labelledby'], tabs[2].id);
  assert.match(status.textContent, /月榜已加载/);
  assert.deepEqual(requests, ['day', 'month']);
});
