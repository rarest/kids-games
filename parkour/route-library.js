import {validateLevel} from './editor.js';

const KEY='glow-parkour-routes-v1',LEGACY_KEY='glow-parkour-level-v1';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const object=value=>value && typeof value==='object' && !Array.isArray(value);
const name=(value,fallback)=>typeof value==='string' && value.trim()?value.trim().slice(0,80):fallback;

function chineseNumber(number,leading=true) {
  const digits='零一二三四五六七八九';
  if (number<10) return digits[number];
  for (const [unit,label] of [[100000000,'亿'],[10000,'万'],[1000,'千'],[100,'百'],[10,'十']]) {
    if (number<unit) continue;
    const head=Math.floor(number/unit),rest=number%unit;
    return (unit===10 && head===1 && leading?'':chineseNumber(head))+label+
      (rest?(rest<unit/10?'零':'')+chineseNumber(rest,false):'');
  }
}

function newId() {
  if (globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID();
  const bytes=globalThis.crypto.getRandomValues(new Uint8Array(16));
  bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

export function createRouteLibrary(raw) {
  raw=object(raw)?raw:{};
  const routes=[],ids=new Set();
  for (const route of Array.isArray(raw.routes)?raw.routes:[]) {
    if (!object(route) || !uuid.test(route.id) || ids.has(route.id)) continue;
    const {level}=validateLevel(route.level);
    if (!level) continue;
    ids.add(route.id);
    level.id=route.id;level.name=name(route.name,level.name);
    routes.push({id:route.id,name:level.name,level,updatedAt:Number.isFinite(route.updatedAt) && route.updatedAt>=0?route.updatedAt:0});
  }
  let draft=null;
  if (object(raw.draft)) {
    try {draft=JSON.parse(JSON.stringify(raw.draft));} catch {}
  }
  const nextNumber=Number.isSafeInteger(raw.nextNumber) && raw.nextNumber>0?Math.max(raw.nextNumber,routes.length+1):routes.length+1;
  return {version:1,nextNumber,routes,draft};
}

export function saveRoute(library,raw,{id,now=Date.now()}={}) {
  const {level}=validateLevel(raw);
  if (!level || !Number.isFinite(now) || now<0) return null;
  const index=id===undefined?-1:library.routes.findIndex(route=>route.id===id);
  if (id!==undefined && index<0) return null;
  if (id===undefined && (!Number.isSafeInteger(library.nextNumber) || library.nextNumber<1 || library.nextNumber===Number.MAX_SAFE_INTEGER)) return null;
  const routeId=index>=0?id:newId();
  const routeName=index>=0?name(raw.name,library.routes[index].name):`自创路线${chineseNumber(library.nextNumber)}`;
  level.id=routeId;level.name=routeName;
  const route={id:routeId,name:routeName,level,updatedAt:now};
  if (index>=0) library.routes[index]=route;
  else {library.routes.push(route);library.nextNumber++;}
  return route;
}

export function writeRouteLibrary(storage,library,key=KEY) {
  try {
    // Serialize the staged snapshot before touching storage or the caller's library.
    const raw=JSON.parse(JSON.stringify(library)),normalized=createRouteLibrary(raw);
    if (!Array.isArray(raw.routes) || normalized.routes.length!==raw.routes.length) return false;
    storage.setItem(key,JSON.stringify(normalized));return true;
  } catch {return false;}
}

export function readRouteLibrary(storage,key=KEY) {
  try {
    const saved=storage.getItem(key);
    if (saved!==null) return createRouteLibrary(JSON.parse(saved));
    const library=createRouteLibrary(),legacy=storage.getItem(LEGACY_KEY);
    if (legacy!==null && saveRoute(library,JSON.parse(legacy))) writeRouteLibrary(storage,library,key);
    return library;
  } catch {return createRouteLibrary();}
}
