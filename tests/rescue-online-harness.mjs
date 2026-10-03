import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {WebSocket,WebSocketServer} from 'ws';
import {decodeFrame} from '../rescue/net-codec.js';
import {createRescueServer} from '../rescue/server.mjs';
import {openBrowser,sleep} from './game-browser-harness.mjs';
export {sleep};
export async function wait(browser,expression,timeout=12000){const end=Date.now()+timeout;while(Date.now()<end){try{if(await browser.evaluate(expression))return;}catch(error){if(!/navigated|context|closed/i.test(error.message))throw error;}await sleep(45);}console.log("native wait failure",await browser.evaluate(`({phase:document.querySelector("#view")?.dataset.phase,network:document.querySelector("#view")?.dataset.network,graphics:document.querySelector("#view")?.dataset.graphics,message:document.querySelector("#online-message")?.textContent,members:document.querySelector("#online-members")?.textContent})`));assert.ok(await browser.evaluate(expression),expression);}
export async function point(browser,selector){return browser.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)return null;e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();const x=r.x+r.width/2,y=r.y+r.height/2;return {x,y,clickable:r.width>0&&r.height>0&&!e.disabled&&e.contains(document.elementFromPoint(x,y))}})()`);}
export async function click(browser,selector){const p=await point(browser,selector);assert.ok(p?.clickable,`clickable ${selector}: ${JSON.stringify(p)}`);for(const type of ['mousePressed','mouseReleased'])await browser.call('Input.dispatchMouseEvent',{type,x:p.x,y:p.y,button:'left',clickCount:1});}
export function key(browser,code,down=true){return browser.call('Input.dispatchKeyEvent',{type:down?'keyDown':'keyUp',code,key:code==='Space'?' ':code,windowsVirtualKeyCode:code==='Space'?32:undefined});}
export function touch(browser,type,p,id=1){return browser.call('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{...p,id}]});}
export function snapshot(browser){return browser.evaluate(`({...view.dataset,positions:JSON.parse(view.dataset.positions),renderPositions:JSON.parse(view.dataset.renderPositions||view.dataset.positions),network:JSON.parse(view.dataset.network||'null')})`);}
export async function shot(browser,name){const dir=process.env.RESCUE_EVIDENCE_DIR||'/tmp/rescue-evidence/online';await mkdir(dir,{recursive:true});const r=await browser.call('Page.captureScreenshot',{format:'png'});const path=`${dir}/${name}.png`;await writeFile(path,Buffer.from(r.data,'base64'));return path;}
// Native sockets are rerouted only in the browser test environment. The production client stays same-origin.
// Delay is in a real WS forwarder: each direction contributes latency/2 milliseconds.
export async function openOnlinePair({latency=0,jitter=0,levelFor,chromeFlags=[],quality="auto",publicSameOrigin=process.env.RESCUE_PUBLIC_SAME_ORIGIN==='1'}={}){
 if(publicSameOrigin&&(latency||jitter||levelFor||!process.env.GAMES_TEST_ORIGIN))throw Error('Public same-origin verification requires GAMES_TEST_ORIGIN and no relay/fixture');
 const host=await openBrowser({chromeFlags});let guest,server,forwarder;const connections=new Set(),timers=new Set(),traffic=[];
 try{
  guest=await openBrowser({chromeFlags});for(const b of [host,guest])await b.call('Emulation.setFocusEmulationEnabled',{enabled:true});
  let url=null,delayed;
  if(!publicSameOrigin){
  server=createRescueServer({port:0,origins:[host.origin,guest.origin],...(levelFor?{levelFor}:{})});await server.ready;
  const http=createServer((req,res)=>{res.writeHead(404);res.end();}),wss=new WebSocketServer({server:http});
  await new Promise(resolve=>http.listen(0,'127.0.0.1',resolve));
  url=`ws://127.0.0.1:${http.address().port}/rescue-ws`;const upstream=`ws://127.0.0.1:${server.address().port}/rescue-ws`;
  // Independent direction queues retain WebSocket/TCP ordering even with jitter.
  let random=0x5eed;
  delayed=(direction,fn)=>{
   random=(Math.imul(random,1664525)+1013904223)>>>0;
   const now=performance.now(),delay=Math.max(0,latency/2+jitter*(2*random/2**32-1));
   direction.due=Math.max(now+delay,direction.due??0);
   if(!latency&&!jitter){fn();return;}
   (direction.queue??=[]).push({due:direction.due,fn});
   if(direction.timer)return;
   const drain=()=>{
    direction.timer=null;
    while(direction.queue.length&&direction.queue[0].due<=performance.now())direction.queue.shift().fn();
    if(direction.queue.length){const timer=setTimeout(()=>{timers.delete(timer);drain();},Math.max(1,direction.queue[0].due-performance.now()));direction.timer=timer;timers.add(timer);}
   };drain();
  };
  wss.on('connection',(socket,req)=>{const peer={socket,upstream:new WebSocket(upstream,{origin:req.headers.origin}),dynamicBytes:0,dynamicFrames:0,start:performance.now(),trace:[],lastMode:null,holdState:false,heldState:null,heldStage:null,withheldFrames:0,inbound:{},outbound:{},modes:[],events:new Map(),latest:null,staticFrames:0,inputTimings:new Map()};connections.add(peer);traffic.push(peer);const queue=[];
   socket.on('message',data=>{
    const message=JSON.parse(String(data)),entry={at:performance.now(),type:message.type,epoch:message.epoch,seq:message.commands?.at(-1)?.seq,ready:message.type==='ready'?message.value:undefined};
    peer.trace.push(entry);if(peer.trace.length>250)peer.trace.shift();
    const timing=(direction,at)=>{
     if(message.type!=='input'||message.epoch!==peer.epoch||peer.latest?.paused)return;
     let epoch=peer.inputTimings.get(message.epoch);if(!epoch){epoch={epoch:message.epoch,received:{count:0,maxGap:0},forwarded:{count:0,maxGap:0}};peer.inputTimings.set(message.epoch,epoch);}
     const row=epoch[direction];if(row.last!==undefined&&at-row.last>row.maxGap){row.maxGap=at-row.last;row.longest={from:row.last,to:at};}row.last=at;row.count++;
    };
    timing('received',entry.at);
    const send=()=>{if(peer.upstream.readyState===1){entry.forwardedAt=performance.now();timing('forwarded',entry.forwardedAt);peer.upstream.send(String(data));}else if(peer.upstream.readyState===0)queue.push(data);};delayed(peer.inbound,send);
   });
   peer.upstream.on('open',()=>{for(const data of queue)peer.upstream.send(String(data));queue.length=0;});
   peer.upstream.on('message',data=>{let packet;try{packet=JSON.parse(data);}catch{}if(packet?.type==='joined')peer.slot=packet.slot;if(packet?.type==='state'&&peer.lastMode!==`${packet.room.mode}:${packet.room.run}:${packet.epoch}`){peer.lastMode=`${packet.room.mode}:${packet.room.run}:${packet.epoch}`;peer.trace.push({at:performance.now(),type:'room',mode:packet.room.mode,run:packet.room.run,epoch:packet.epoch,tick:packet.tick});}if(packet?.type==='state'){peer.latest=decodeFrame(packet,peer.latest);for(const event of peer.latest.events)peer.events.set(`${packet.room.run}:${event.id}`,event);if(packet.stage)peer.staticFrames++;if(peer.modes.at(-1)?.mode!==packet.room.mode)peer.modes.push({at:performance.now(),mode:packet.room.mode,tick:packet.tick,run:packet.room.run});peer.tick=packet.tick;peer.epoch=packet.epoch;}if(packet?.type==='state'&&!packet.stage){peer.dynamicBytes+=data.length;peer.dynamicFrames++;}if(packet?.type==='state'&&peer.holdState){peer.heldState=String(data);if(packet.stage)peer.heldStage=String(data);peer.withheldFrames++;return;}delayed(peer.outbound,()=>{if(socket.readyState===1)socket.send(String(data));});});
   peer.upstream.on('error',()=>socket.close());socket.on('error',()=>{});
   // Graceful close follows earlier messages through the same ordered latency queue.
   socket.on('close',code=>{peer.trace.push({at:performance.now(),type:'close',direction:'downstream',code});const close=()=>peer.upstream.close();if(code===1006||peer.upstream.readyState>=WebSocket.CLOSING)close();else delayed(peer.inbound,close);});
   peer.upstream.on('close',code=>{peer.trace.push({at:performance.now(),type:'close',direction:'upstream',code});connections.delete(peer);socket.close();});
  });
  forwarder={close:async()=>{for(const timer of timers)clearTimeout(timer);for(const peer of connections){peer.socket.terminate();peer.upstream.terminate();}await new Promise(resolve=>wss.close(resolve));await new Promise(resolve=>http.close(resolve));}};
  }
  for(const b of [host,guest]){await b.call('Page.addScriptToEvaluateOnNewDocument',{source:`(()=>{const Native=window.WebSocket;window.__rescueSockets=[];window.__rescueLifecycle=[];for(const name of ['blur','focus','pagehide','pageshow','freeze','resume','visibilitychange'])window.addEventListener(name,e=>{window.__rescueLifecycle.push({type:name,at:performance.now(),hidden:document.hidden,persisted:e.persisted});if(window.__rescueLifecycle.length>100)window.__rescueLifecycle.shift();},true);window.WebSocket=class extends Native{constructor(address,...args){super(${url?`new URL(address,location.href).pathname==='/rescue-ws'?${JSON.stringify(url)}:address`:'address'},...args);window.__rescueSockets.push(this);}};})();`});await b.size(320,568);await b.navigate('games/rescue.html');await wait(b,'document.querySelector("#view")?.dataset.phase==="home"');if(quality==='low'){await click(b,'#options-open');await click(b,'[data-quality=low]');await click(b,'#options-panel .close-panel');await b.call('Page.reload');await wait(b,'document.querySelector("#view")?.dataset.phase==="home"');}else await wait(b,'JSON.parse(view.dataset.graphics).dpr<=0.75&&!JSON.parse(view.dataset.graphics).shadows',60000);await b.call('Page.bringToFront');await b.call('Emulation.setFocusEmulationEnabled',{enabled:true});}
  const peerFor=slot=>{const peer=traffic.findLast(p=>p.slot===slot&&p.socket.readyState===1);assert.ok(peer,`connected relay peer ${slot}`);return peer;};
  return {host,guest,server,traffic,latency,jitter,holdState(slot){const peer=peerFor(slot);peer.holdState=true;peer.heldState=null;peer.heldStage=null;peer.withheldFrames=0;},releaseState(slot){const peer=peerFor(slot),latest=peer.heldState,stage=peer.heldStage;peer.holdState=false;peer.heldState=null;peer.heldStage=null;for(const raw of stage&&stage!==latest?[stage,latest]:[latest])if(raw)delayed(peer.outbound,()=>{if(peer.socket.readyState===1)peer.socket.send(raw);});return peer.withheldFrames;},networkTrace:()=>traffic.map(p=>({slot:p.slot,trace:p.trace})),inputTiming:()=>traffic.map(p=>({slot:p.slot,epochs:[...p.inputTimings.values()]})),async close(){host.close();guest.close();await forwarder?.close();await server?.close();}};
 }catch(error){host.close();guest?.close();await forwarder?.close();await server?.close();throw error;}
}
export async function createRoom(pair){const {host,guest}=pair;await click(host,'#online-open');await click(host,'#online-create');await wait(host,'/^[A-F0-9]{6}$/.test(document.querySelector("#online-code").textContent)');const code=await host.evaluate('document.querySelector("#online-code").textContent');await click(guest,'#online-open');await click(guest,'#online-input');const previous=await guest.evaluate('document.querySelector("#online-input").value');for(const [keyCode,keyValue,virtualKey] of [['End','End',35],...Array.from({length:6},()=>['Backspace','Backspace',8])])for(const type of ['keyDown','keyUp'])await guest.call('Input.dispatchKeyEvent',{type,code:keyCode,key:keyValue,windowsVirtualKeyCode:virtualKey});assert.equal(await guest.evaluate('document.querySelector("#online-input").value'),'','native room field clearing');await guest.call('Input.insertText',{text:code});const typed=await guest.evaluate('document.querySelector("#online-input").value');assert.equal(typed,code,'native field replacement before joining');if(previous)console.log('native room input replacement',JSON.stringify({previous,typed,message:await guest.evaluate('document.querySelector("#online-message").textContent')}));await click(guest,'#online-join');await wait(host,'!document.querySelector("#online-start").disabled');await click(host,'#online-start');for(const b of [host,guest])await wait(b,'view.dataset.phase==="playing"');return code;}
