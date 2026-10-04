import { createServer } from 'node:http';
import { randomBytes, randomInt } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { WebSocket, WebSocketServer } from 'ws';
import { CARS, SKINS, TRACKS, newOnlineRace, stepRace } from './core.js';

const runtimeClock = { now: () => Date.now(), setInterval: (fn, ms) => setInterval(fn, ms), clearInterval: timer => clearInterval(timer) };
const neutral = () => ({ throttle: false, steer: 0, brake: false, boost: false });
const LIMITS = { rooms: 16, connections: 128, messagesPerSecond: 180, payload: 4096, buffered: 256 * 1024 };
const RECONNECT_MS = 60_000, INPUT_TIMEOUT_MS = 500, HEARTBEAT_MS = 30_000;
const trackValid = id => TRACKS.some(track => track.id === id);

export function createRacingServer({ port = 8789, host = '127.0.0.1', origins = ['https://games.nblord.com', 'https://games.596996.xyz'], clock = runtimeClock } = {}) {
  const rooms = new Map(), connections = new Set(), allowedOrigins = new Set(origins);
  const http = createServer((request, response) => {
    const healthy = request.url === '/health';
    response.writeHead(healthy ? 200 : 404, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    response.end(healthy ? JSON.stringify({ ok: true, rooms: rooms.size, connections: connections.size }) : '{}');
  });
  const wss = new WebSocketServer({ noServer: true, maxPayload: LIMITS.payload, perMessageDeflate: false });
  const connected = member => member?.ws?.readyState === WebSocket.OPEN;
  const send = (ws, message) => {
    if (ws?.readyState === WebSocket.OPEN && ws.bufferedAmount < LIMITS.buffered) ws.send(typeof message === 'string' ? message : JSON.stringify(message));
  };
  function roomInfo(room) {
    return { code: room.code, host: room.host, mode: room.mode, run: room.run, trackId: room.trackId,
      members: room.members.filter(Boolean).map(member => ({ id: member.id, name: member.name, car: member.car, skin: member.skin, ready: member.ready, connected: connected(member) })) };
  }
  function raceInfo(race) {
    if (!race) return null;
    return { time: race.time, countdown: race.countdown, status: race.status, laps: race.laps,
      cars: race.cars.map(({ model, ...car }) => ({ ...car, car: model.id, finishTime: Number.isFinite(car.finishTime) ? car.finishTime : null })),
      traffic: race.traffic.map(({ s, offset, speed }) => ({ s, offset, speed })) };
  }
  function broadcast(room) {
    const packet = JSON.stringify({ type: 'state', room: roomInfo(room), race: raceInfo(room.race), acks: room.acks, serverAt: clock.now(), tick: room.tick });
    for (const member of room.members) if (connected(member)) send(member.ws, packet);
  }
  function chooseHost(room) {
    if (!connected(room.members[room.host])) room.host = room.members.find(member => connected(member) && !member.retired)?.id ?? null;
    if (room.host !== null && room.mode === 'lobby') room.members[room.host].ready = true;
  }
  function retire(room, member) {
    member.retired = true; member.token = null; member.ready = false; member.input = neutral();
    const car = room.race?.cars.find(car => car.id === member.id);
    if (car) car.human = false;
    if (room.mode === 'lobby') room.members[member.id] = null;
  }
  function cleanupEmpty(room) {
    if (!room.members.some(member => member && !member.retired)) rooms.delete(room.code);
  }
  function detach(connection, voluntary = false) {
    const { room, member } = connection;
    connection.room = null; connection.member = null;
    if (!room || !member || member.ws !== connection.ws) return;
    member.ws = null; member.connection = null; member.ready = false; member.input = neutral(); member.disconnectedAt = clock.now();
    if (voluntary) retire(room, member);
    chooseHost(room); cleanupEmpty(room);
    if (rooms.has(room.code)) broadcast(room);
  }
  function metadata(message) {
    if (typeof message.name !== 'string' || !message.name.trim() || Array.from(message.name.trim()).length > 24 || /[\u0000-\u001f\u007f]/.test(message.name)) throw Error('名字需要1到24个字符');
    if (!CARS.some(car => car.id === message.car)) throw Error('车辆不存在');
    if (!SKINS.some(skin => skin.id === message.skin)) throw Error('车漆不存在');
    return { name: message.name.trim(), car: message.car, skin: message.skin };
  }
  function join(connection, message) {
    if (connection.room) throw Error('请先退出当前房间');
    let room, member, slot;
    if (message.type === 'create') {
      const values = metadata(message);
      if (!trackValid(message.trackId)) throw Error('赛道不存在');
      if (rooms.size >= LIMITS.rooms) throw Error('房间数量已满，请稍后重试');
      let code; do { code = String(randomInt(100000, 1000000)); } while (rooms.has(code));
      room = { code, host: 0, mode: 'lobby', run: 0, trackId: message.trackId, members: Array(8).fill(null), race: null, acks: {}, tick: 0 };
      rooms.set(code, room); slot = 0;
      member = { id: slot, ...values };
    } else {
      if (typeof message.code !== 'string' || !/^[1-9]\d{5}$/.test(message.code)) throw Error('请输入6位数字房间码');
      room = rooms.get(message.code);
      if (!room) throw Error('房间不存在或已结束');
      if (message.token !== undefined) {
        if (typeof message.token !== 'string' || message.token.length !== 48) throw Error('重连凭据无效');
        member = room.members.find(member => member?.token === message.token && !member.retired);
        if (!member || (member.disconnectedAt !== null && clock.now() - member.disconnectedAt >= RECONNECT_MS)) throw Error('重连凭据无效或已超时');
        if (connected(member)) throw Error('该玩家已在另一页面连接');
        slot = member.id;
      } else {
        if (room.mode !== 'lobby') throw Error('比赛已经开始，暂不能加入新玩家');
        slot = room.members.findIndex(member => !member);
        if (slot < 0) throw Error('房间已满，最多8位玩家');
        member = { id: slot, ...metadata(message) };
      }
    }
    member.token ??= randomBytes(24).toString('hex');
    Object.assign(member, { ws: connection.ws, connection, ready: false, retired: false, disconnectedAt: null, seq: 0, lastInput: clock.now(), input: neutral() });
    room.members[slot] = member; connection.room = room; connection.member = member;
    // A racing reconnection continues above the last server-consumed sequence.
    member.seq = room.acks[slot] || 0;
    chooseHost(room);
    send(member.ws, { type: 'joined', code: room.code, slot, token: member.token });
    broadcast(room);
  }
  function acceptInput(room, member, message) {
    if (!Number.isSafeInteger(message.run) || message.run < 1 || message.run > room.run) throw Error('比赛版本无效或尚未开始');
    if (!Number.isSafeInteger(message.seq) || message.seq < 1) throw Error('输入序号无效');
    const input = message.input;
    if (!input || typeof input !== 'object' || Array.isArray(input) || typeof input.steer !== 'number' || !Number.isFinite(input.steer) || Math.abs(input.steer) > 1 || ['throttle', 'brake', 'boost'].some(key => typeof input[key] !== 'boolean')) throw Error('输入值无效');
    // A final control frame can arrive after finish/lobby, or after a new run starts.
    // Validate its shape, then ignore it without advancing sequences or readiness.
    if (message.run < room.run || room.mode !== 'racing') return;
    if (message.seq <= member.seq) return;
    member.seq = message.seq; member.lastInput = clock.now();
    member.input = { throttle: input.throttle, steer: input.steer, brake: input.brake, boost: input.boost };
  }
  function act(connection, message) {
    if (message.type === 'ping') {
      if (!Number.isFinite(message.at)) throw Error('时间戳无效');
      send(connection.ws, { type: 'pong', at: message.at, serverAt: clock.now() }); return;
    }
    if (message.type === 'create' || message.type === 'join') { join(connection, message); return; }
    const { room, member } = connection;
    if (!room || !member) throw Error('请先加入房间');
    if (message.type === 'leave') { detach(connection, true); send(connection.ws, { type: 'left' }); return; }
    if (message.type === 'input') { acceptInput(room, member, message); return; }
    if (message.type === 'ready') {
      if (room.mode !== 'lobby' || typeof message.value !== 'boolean') throw Error('准备状态无效');
      member.ready = member.id === room.host || message.value;
    } else {
      if (member.id !== room.host) throw Error('只有队长可以执行此操作');
      if (message.type === 'settings') {
        if (room.mode !== 'lobby' || !trackValid(message.trackId)) throw Error('请在大厅选择有效赛道');
        room.trackId = message.trackId;
        for (const candidate of room.members) if (candidate) candidate.ready = candidate.id === room.host;
      } else if (message.type === 'start') {
        const members = room.members.filter(Boolean);
        if (room.mode !== 'lobby' || members.length < 2 || !members.every(member => connected(member) && member.ready)) throw Error('需要至少2位玩家连接，并且全部准备');
        room.race = newOnlineRace(room.trackId, members); room.run++; room.mode = 'racing'; room.tick = 0; room.acks = {};
        for (const candidate of members) { candidate.seq = 0; candidate.lastInput = clock.now(); candidate.input = neutral(); room.acks[candidate.id] = 0; }
      } else if (message.type === 'lobby') {
        room.mode = 'lobby'; room.race = null; room.acks = {}; room.tick = 0;
        for (const candidate of room.members) if (candidate) {
          if (candidate.retired) room.members[candidate.id] = null;
          else { candidate.ready = candidate.id === room.host; candidate.seq = 0; candidate.input = neutral(); }
        }
      } else throw Error('未知操作');
    }
    broadcast(room);
  }
  wss.on('connection', ws => {
    const connection = { ws, room: null, member: null, window: clock.now(), count: 0, alive: true };
    connections.add(connection);
    ws.on('error', () => {});
    ws.on('pong', () => { connection.alive = true; });
    ws.on('close', () => { connections.delete(connection); detach(connection); });
    ws.on('message', (raw, binary) => {
      try {
        if (clock.now() - connection.window >= 1000) { connection.window = clock.now(); connection.count = 0; }
        if (++connection.count > LIMITS.messagesPerSecond) { ws.close(1008, 'Too many messages'); return; }
        if (binary) throw Error('只接受JSON文本消息');
        const message = JSON.parse(raw);
        if (!message || Array.isArray(message) || typeof message.type !== 'string') throw Error('消息格式无效');
        act(connection, message);
      } catch (error) { send(ws, { type: 'error', message: error instanceof SyntaxError ? '消息格式无效' : error.message }); }
    });
  });
  http.on('upgrade', (request, socket, head) => {
    if (request.url !== '/racing-ws' || !allowedOrigins.has(request.headers.origin) || connections.size >= LIMITS.connections) { socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'); return; }
    wss.handleUpgrade(request, socket, head, ws => wss.emit('connection', ws, request));
  });
  let broadcastTick = 0, lastHeartbeat = clock.now();
  function advance(now) {
    for (const room of rooms.values()) {
      for (const member of room.members) if (member && !member.retired && !connected(member) && member.disconnectedAt !== null && now - member.disconnectedAt >= RECONNECT_MS) retire(room, member);
      chooseHost(room); cleanupEmpty(room);
      if (!rooms.has(room.code)) continue;
      if (room.mode === 'racing') {
        const input = {};
        for (const member of room.members) if (member && !member.retired) {
          input[member.id] = connected(member) && now - member.lastInput <= INPUT_TIMEOUT_MS ? member.input : neutral();
          room.acks[member.id] = member.seq;
        }
        stepRace(room.race, input, 1 / 60); room.tick++;
        if (room.race.status === 'finished') { room.mode = 'finished'; broadcast(room); }
      }
      if (broadcastTick % 3 === 2) broadcast(room);
    }
    broadcastTick++;
    if (now - lastHeartbeat >= HEARTBEAT_MS) {
      lastHeartbeat = now;
      for (const connection of connections) {
        if (!connection.alive) { connection.ws.terminate(); continue; }
        connection.alive = false;
        if (connection.ws.readyState === WebSocket.OPEN) connection.ws.ping();
      }
    }
  }
  // Accumulate elapsed time: Node's integer interval delays must not turn 60Hz into 62.5Hz.
  const tickMs = 1000 / 60;
  let lastLoop = clock.now(), accumulator = 0;
  const timer = clock.setInterval(() => {
    const now = clock.now(); accumulator += Math.min(Math.max(0, now - lastLoop), tickMs * 5); lastLoop = now;
    while (accumulator + 1e-7 >= tickMs) { accumulator = Math.max(0, accumulator - tickMs); advance(now); }
  }, tickMs);
  const ready = new Promise((resolve, reject) => { http.once('error', reject); http.listen(port, host, resolve); });
  let closing;
  function close() {
    return closing ??= new Promise(resolve => {
      clock.clearInterval(timer); for (const connection of connections) connection.ws.terminate();
      wss.close(() => http.close(resolve));
    });
  }
  return { ready, address: () => http.address(), close };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createRacingServer({ port: Number(process.env.PORT) || 8789 });
  await server.ready;
  console.log(`Racing server listening on 127.0.0.1:${server.address().port}`);
  for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, async () => { await server.close(); process.exit(0); });
}
