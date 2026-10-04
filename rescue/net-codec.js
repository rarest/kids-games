import { createGame } from './core.js';

// Each frame is a complete delta from static constructor defaults, never from
// the preceding frame. Dropping a congested frame therefore loses no state.
const groups = ['players', 'platforms', 'objects', 'enemies', 'hazards', 'pickups'];
const rowFields = ['x','y','vx','vy','grounded','groundId','active','alive','facing','timer','animation','carrying','heldBy','hidden','invulnerable','stun','zipper','dropTimer','throwTimer','hearts','lives','thrown','hitIds','opened','owner','dx','dy','collected','speed','w','h'];
const templates = new WeakMap();
const runs = new WeakMap();
const clone = value => structuredClone(value);
const equal = (a, b) => a === b || JSON.stringify(a) === JSON.stringify(b);
function defaults(level, players) {
  let byPlayers = templates.get(level);
  if (!byPlayers) templates.set(level, byPlayers = new Map());
  if (!byPlayers.has(players)) {
    const {level:staticLevel,areaLevel:staticArea,...dynamic} = createGame(level, { players });
    byPlayers.set(players, dynamic);
  }
  return byPlayers.get(players);
}
function changes(value, base = {}) {
  const result = {};
  for (const key of Object.keys(value)) if (!equal(value[key], base[key])) result[key] = clone(value[key]);
  return result;
}

function encodeRow(index,delta) {
  let mask=0;
  const values=[],extra={...delta};
  for(let i=0;i<rowFields.length;i++)if(Object.hasOwn(delta,rowFields[i])) {
    mask|=1<<i;values.push(delta[rowFields[i]]);delete extra[rowFields[i]];
  }
  return Object.keys(extra).length ? [index,mask,values,extra] : [index,mask,values];
}

function decodeRow(row,base) {
  const [,mask,encoded,extra]=row,values=clone(encoded),result={...base,...clone(extra??{})};
  let cursor=0;
  for(let i=0;i<rowFields.length;i++)if(mask&(1<<i))result[rowFields[i]]=values[cursor++];
  return result;
}

function encodeEvents(events) {
  // The core retains 100 events for audio/particles. Repeating their JSON keys
  // at 20 Hz dominates an otherwise compact frame. Ten bytes/event retain the
  // exact IEEE-754 time plus dictionary indices; no event or rule is discarded.
  const buffer = new ArrayBuffer(events.length * 10), view = new DataView(buffer);
  const types = [], extras = [], extraIndices = new Map();
  for (let i = 0; i < events.length; i++) {
    const {id,type,time,...extra} = events[i];
    let typeIndex = types.indexOf(type);
    if (typeIndex < 0) {typeIndex = types.length;types.push(type);}
    const key = JSON.stringify(extra);
    if (!extraIndices.has(key)) {extraIndices.set(key, extras.length);extras.push(extra);}
    view.setFloat64(i * 10, time, true);
    view.setUint8(i * 10 + 8, typeIndex);
    view.setUint8(i * 10 + 9, extraIndices.get(key));
  }
  const first = Number(events[0]?.id?.replace(/^event-/, ''));
  const consecutive = events.every((event,i) => event.id === `event-${first+i}`);
  return {first:events.length && consecutive ? first : 0,
    ...(consecutive ? {} : {ids:events.map(event=>event.id)}),types,extras,
    bytes:btoa(String.fromCharCode(...new Uint8Array(buffer)))};
}

function decodeEvents(packed) {
  const bytes = Uint8Array.from(atob(packed.bytes),char=>char.charCodeAt(0));
  const view = new DataView(bytes.buffer), events = [];
  for (let i = 0; i < bytes.length / 10; i++) events.push({
    id:packed.ids?.[i]??`event-${packed.first+i}`,
    type:packed.types[view.getUint8(i * 10 + 8)],time:view.getFloat64(i * 10, true),
    ...clone(packed.extras[view.getUint8(i * 10 + 9)])
  });
  return events;
}

export function encodeFrame(state, metadata) {
  const base = defaults(state.level, state.players.length);
  const data = {};
  for (const key of Object.keys(state)) {
    if (key === 'level' || key === 'areaLevel' || groups.includes(key) || key === 'events') continue;
    // Keep the entire Boss object: weakpoints/contact regions/phases and any
    // future Boss-specific rule fields are authoritative simulation state.
    if (key === 'previousInputs' && equal(state[key], metadata.inputs)) data[key] = true;
    else if (key === 'boss' || !equal(state[key], base[key])) data[key] = clone(state[key]);
  }
  for (const key of groups) {
    const rows = [];
    for (let i = 0; i < state[key].length; i++) {
      const delta = changes(state[key][i], base[key][i]);
      if (Object.keys(delta).length || !base[key][i]) rows.push(encodeRow(i, delta));
    }
    if (rows.length || state[key].length !== base[key].length) data[key] = [state[key].length, rows];
  }
  data.events = encodeEvents(state.events);
  const packet = {type:'state',version:1,playerCount:state.players.length,areaId:state.areaLevel.id,levelId:state.level.id,
    epoch:metadata.epoch,tick:metadata.tick,acks:[...metadata.acks],inputs:clone(metadata.inputs),room:clone(metadata.room),data};
  if (Number.isFinite(metadata.serverAt)) packet.serverAt = metadata.serverAt;
  if (metadata.includeStage) packet.stage = {area:state.areaLevel,level:state.level};
  return packet;
}

export function decodeFrame(packet, previous) {
  if (packet?.type !== 'state' || packet.version !== 1) throw Error('Unsupported state frame');
  const areaLevel = previous?.areaLevel.id === packet.areaId ? previous.areaLevel : packet.stage?.area;
  const level = previous?.level.id === packet.levelId ? previous.level : packet.stage?.level;
  if (!areaLevel || !level || areaLevel.id !== packet.areaId || level.id !== packet.levelId) throw Error('Missing static stage');
  const base = defaults(level, packet.playerCount);
  const decoded = clone(base);
  const data = packet.data;
  for (const [key,value] of Object.entries(data)) if (!groups.includes(key) && key !== 'events') decoded[key] = clone(key==='previousInputs'&&value===true ? packet.inputs : value);
  for (const key of groups) if (data[key]) {
    const [length, rows] = data[key];
    decoded[key].length = length;
    for (const row of rows) decoded[key][row[0]] = decodeRow(row,decoded[key][row[0]]);
  }
  decoded.events = decodeEvents(data.events);
  decoded.level = level;
  decoded.areaLevel = areaLevel;
  const sameRun = previous && runs.get(previous) === packet.room.run;
  const state = sameRun ? Object.assign(previous, decoded) : decoded;
  runs.set(state, packet.room.run);
  return state;
}
