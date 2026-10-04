import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

function harness({pathname='/games/racing.html',gameId}={}) {
  let now=0,serial=0,fail=false,status=200,transport=null;
  const calls=[],timers=new Map(),listeners=new Map();
  const event=(type)=>{for(const fn of listeners.get(type)||[])fn();};
  const document={hidden:false,currentScript:{dataset:{gameId}},addEventListener(type,fn){const list=listeners.get(type)||[];list.push(fn);listeners.set(type,list);}};
  const window={document,location:{pathname},performance:{now:()=>now},addEventListener:document.addEventListener,
    setInterval(fn,ms){timers.set(++serial,{fn,ms,next:now+ms});return serial;},clearInterval(id){timers.delete(id);},
    setTimeout(fn,ms){timers.set(++serial,{fn,ms,next:now+ms,once:true});return serial;},clearTimeout(id){timers.delete(id);},
    fetch:async(url,options)=>{const body=JSON.parse(options.body);calls.push({url,body,options,time:now});if(transport)return transport(url,body);if(fail)throw new Error('offline');return {ok:status===200,status,json:async()=>url.endsWith('/start')?{sessionId:`session-${calls.length}`,acceptedSeconds:0}:{acceptedSeconds:body.activeSeconds,qualified:body.activeSeconds>=15,counted:body.activeSeconds>=15}};}};
  window.window=window;
  if(existsSync(new URL('../shared/game-activity.js',import.meta.url)))vm.runInNewContext(readFileSync(new URL('../shared/game-activity.js',import.meta.url),'utf8'),window);
  const settle=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
  async function advance(ms){const end=now+ms;while(true){const next=[...timers.values()].reduce((n,t)=>Math.min(n,t.next),Infinity);if(next>end)break;now=next;for(const [id,t] of [...timers])if(t.next===now){if(t.once)timers.delete(id);else t.next+=t.ms;t.fn();}await settle();}now=end;await settle();}
  return {window,document,calls,event,advance,settle,setFail(v){fail=v;},setStatus(v){status=v;},setTransport(v){transport=v;},jump(ms){now+=ms;},reports:()=>calls.filter(c=>c.url==='/api/activity')};
}

test('exports the classic API and excludes menu time',async()=>{
 const h=harness();assert.equal(typeof h.window.GameActivity?.setPlaying,'function');assert.equal(typeof h.window.GameActivity.finish,'function');await h.advance(45000);assert.equal(h.calls.length,0);
 h.window.GameActivity.setPlaying(true);await h.settle();await h.advance(15000);assert.equal(h.calls[0].body.gameId,'racing');assert.equal(h.reports()[0].body.activeSeconds,15);assert.equal(h.calls[0].options.credentials,'same-origin');
});
test('repeated hooks are idempotent and heartbeats are cumulative',async()=>{
 const h=harness();h.window.GameActivity.setPlaying(true);await h.settle();for(let i=0;i<30;i++){h.window.GameActivity.setPlaying(true);await h.advance(1000);}assert.equal(h.calls.filter(c=>c.url.endsWith('/start')).length,1);assert.deepEqual(h.reports().map(c=>c.body.activeSeconds),[15,30]);
});
test('explicit pause and resumption exclude paused time',async()=>{
 const h=harness();h.window.GameActivity.setPlaying(true);await h.settle();await h.advance(10000);h.window.GameActivity.setPlaying(false);await h.settle();await h.advance(60000);assert.equal(h.reports().at(-1).body.activeSeconds,10);h.window.GameActivity.setPlaying(true);await h.settle();await h.advance(15000);assert.equal(h.reports().at(-1).body.activeSeconds,15);
});
test('hidden pages exclude hidden time and do not start until visible',async()=>{
 const h=harness();h.document.hidden=true;h.window.GameActivity.setPlaying(true);await h.advance(30000);assert.equal(h.calls.length,0);h.document.hidden=false;h.event('visibilitychange');await h.settle();await h.advance(10000);h.document.hidden=true;h.event('visibilitychange');await h.settle();await h.advance(30000);h.document.hidden=false;h.event('visibilitychange');await h.advance(15000);assert.equal(h.reports().at(-1).body.activeSeconds,25);
});
test('pagehide flushes once and stops accumulation until pageshow',async()=>{
 const h=harness();h.window.GameActivity.setPlaying(true);await h.settle();await h.advance(8000);h.event('pagehide');await h.settle();assert.equal(h.reports()[0].body.activeSeconds,8);assert.equal(h.reports()[0].options.keepalive,true);await h.advance(30000);assert.equal(h.reports().length,1);h.event('pageshow');await h.advance(15000);assert.equal(h.reports().at(-1).body.activeSeconds,23);
});
test('finish stops counting and transport errors never escape into gameplay',async()=>{
 const h=harness();h.window.GameActivity.setPlaying(true);await h.settle();await h.advance(15000);h.setFail(true);assert.doesNotThrow(()=>h.window.GameActivity.finish());await h.advance(30000);assert.equal(h.reports().length,1);
});
test('retries use the same cumulative payload before sending newer time',async()=>{
 const h=harness();h.window.GameActivity.setPlaying(true);await h.settle();h.setFail(true);await h.advance(15000);h.setFail(false);await h.advance(15000);assert.deepEqual(h.reports().map(c=>c.body.activeSeconds),[15,15]);await h.advance(15000);assert.equal(h.reports().at(-1).body.activeSeconds,45);
});
test('long offline gaps reset sessions without backdating',async()=>{
 const h=harness();h.window.GameActivity.setPlaying(true);await h.settle();h.setFail(true);await h.advance(75000);h.setFail(false);await h.advance(15000);const latest=h.calls.filter(c=>c.url.endsWith('/start')).at(-1);await h.advance(15000);assert.ok(latest.time>=75000);assert.ok(h.reports().at(-1).body.activeSeconds<=30);
});
test('expired or conflicting sessions reset on 404 and 409',async()=>{
 for(const status of [404,409]){const h=harness();h.window.GameActivity.setPlaying(true);await h.settle();h.setStatus(status);await h.advance(15000);h.setStatus(200);await h.advance(15000);assert.equal(h.calls.filter(c=>c.url.endsWith('/start')).length,2);await h.advance(15000);assert.equal(h.reports().at(-1).body.activeSeconds,15);}
});
test('slow session establishment does not backdate active seconds',async()=>{
 const h=harness();h.setFail(true);h.window.GameActivity.setPlaying(true);await h.advance(30000);h.setFail(false);await h.advance(15000);await h.advance(15000);assert.equal(h.reports().at(-1).body.activeSeconds,15);
});
test('data-game-id overrides the pathname and unknown entries remain inert',async()=>{
 const h=harness({pathname:'/other.html',gameId:'english'});h.window.GameActivity.setPlaying(true);await h.settle();assert.equal(h.calls[0].body.gameId,'english');const unknown=harness({pathname:'/games/nope.html'});unknown.window.GameActivity.setPlaying(true);await unknown.advance(30000);assert.equal(unknown.calls.length,0);
});

test('pause during an in-flight heartbeat flushes the final active seconds after acknowledgment',async()=>{
 const h=harness();h.window.GameActivity.setPlaying(true);await h.settle();await h.advance(14000);let resolve;
 h.setTransport(()=>new Promise(done=>{resolve=done;}));await h.advance(1000);await h.advance(3000);h.window.GameActivity.finish();h.setTransport(null);resolve({ok:true,status:200,json:async()=>({acceptedSeconds:15})});await h.settle();assert.deepEqual(h.reports().map(c=>c.body.activeSeconds),[15,18]);
});
test('partial acknowledgment discards only rejected time and does not inflate retry backlog',async()=>{
 const h=harness();h.window.GameActivity.setPlaying(true);await h.settle();h.setTransport(async(url,body)=>({ok:true,status:200,json:async()=>({acceptedSeconds:body.activeSeconds-1})}));await h.advance(15000);h.setTransport(null);await h.advance(15000);assert.deepEqual(h.reports().map(c=>c.body.activeSeconds),[15,29]);
});
test('a stalled response body times out and releases the transport for retry',async()=>{
 const h=harness();h.window.GameActivity.setPlaying(true);await h.settle();h.setTransport(async()=>({ok:true,status:200,json:()=>new Promise(()=>{})}));await h.advance(26000);h.setTransport(null);await h.advance(4000);assert.deepEqual(h.reports().map(c=>c.body.activeSeconds),[15,15]);await h.advance(15000);assert.equal(h.reports().at(-1).body.activeSeconds,45);
});
