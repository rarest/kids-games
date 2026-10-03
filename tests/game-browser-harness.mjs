import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {randomUUID} from 'node:crypto';
const freePort=()=>new Promise((resolve,reject)=>{const server=createServer();server.on('error',reject);server.listen(0,'127.0.0.1',()=>{const port=server.address().port;server.close(()=>resolve(port))})});
export const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitFor(url){for(let i=0;i<100;i++){try{const r=await fetch(url);if(r.ok)return r}catch{}await sleep(100)}throw new Error(`Browser/server unavailable: ${url}`)}
export async function openBrowser({chromeFlags=[]}={}){
  const httpPort=await freePort(),debugPort=await freePort();
  const origin=process.env.GAMES_TEST_ORIGIN||`http://127.0.0.1:${httpPort}`;
  const server=process.env.GAMES_TEST_ORIGIN?null:spawn('python3',['-m','http.server',String(httpPort),'--bind','127.0.0.1'],{cwd:new URL('..',import.meta.url),stdio:'ignore'});
  const chrome=spawn('chromium-browser',['--headless','--no-sandbox','--disable-gpu',`--remote-debugging-port=${debugPort}`,`--user-data-dir=/home/ubuntu/snap/chromium/common/games-adaptive-${process.pid}-${randomUUID()}`,'about:blank',...chromeFlags],{stdio:'ignore'});
  let socket;
  try{
    await waitFor(origin);const tabs=await(await waitFor(`http://127.0.0.1:${debugPort}/json`)).json();
    socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
    await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject});
    let id=0;const pending=new Map(),errors=[],listeners=new Map();
    socket.onmessage=e=>{const p=JSON.parse(e.data);if(p.id){const q=pending.get(p.id);pending.delete(p.id);p.error?q.reject(new Error(p.error.message)):q.resolve(p.result)}else {if(p.method==='Runtime.exceptionThrown')errors.push(p.params.exceptionDetails.text+': '+p.params.exceptionDetails.exception?.description);for(const listener of listeners.get(p.method)||[])listener(p.params)}};
    const call=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}))});
    await call('Runtime.enable');await call('Page.enable');await call('Network.enable');await call('Network.setCacheDisabled',{cacheDisabled:true});
    const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value};
    return {origin,call,evaluate,errors,
      on(method,listener){const group=listeners.get(method)||new Set();group.add(listener);listeners.set(method,group);return()=>group.delete(listener)},
      async size(width,height,touch=false){await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:touch});await call('Emulation.setTouchEmulationEnabled',{enabled:touch,maxTouchPoints:5});await sleep(80);await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))')},
      async navigate(file){const url=`${origin}/${file}?adaptive-test=${Date.now()}`;await call('Page.navigate',{url});let ready=false;for(let i=0;i<200;i++){if(await evaluate(`document.readyState==="complete"&&location.href===${JSON.stringify(url)}`)){ready=true;break}await sleep(50)}if(!ready)throw new Error(`Page did not finish loading: ${url}`);await sleep(120)},
      close(){socket.close();chrome.kill('SIGTERM');server?.kill('SIGTERM')}
    };
  }catch(e){socket?.close();chrome.kill('SIGTERM');server?.kill('SIGTERM');throw e}
}
