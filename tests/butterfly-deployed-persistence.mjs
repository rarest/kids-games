// Explicit opt-in: restarts only the newly deployed Butterfly service.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import WebSocket from 'ws';
if(process.env.GARDEN_ALLOW_SERVICE_RESTART!=='1')throw Error('Set GARDEN_ALLOW_SERVICE_RESTART=1 for the new Butterfly service restart acceptance');
const origin=process.env.GAMES_TEST_ORIGIN||'https://games.nblord.com';
const endpoint=new URL('/butterfly-ws',origin);endpoint.protocol=endpoint.protocol==='https:'?'wss:':'ws:';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const peers=[];
async function peer(){
 const ws=new WebSocket(endpoint,{origin});const messages=[];let cursor=0;ws.on('message',data=>messages.push(JSON.parse(data)));await new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject);});
 const p={ws,send:data=>ws.send(JSON.stringify(data)),async next(type,predicate=()=>true){const deadline=Date.now()+10000;while(Date.now()<deadline){for(let i=cursor;i<messages.length;i++)if(messages[i].type===type&&predicate(messages[i])){cursor=i+1;return messages[i];}await sleep(20);}throw Error(`Timeout waiting for ${type}`);}};peers.push(p);return p;
}
const servicePids=()=>execFileSync('ssh',['-o','BatchMode=yes','oci-cc-arm','systemctl --user show shooter-coop rescue-coop racing-coop games-platform --property=Id,MainPID'],{encoding:'utf8'});
const baseline=servicePids();let active=[];
try{
 const a=await peer(),b=await peer();active=[a,b];
 a.send({type:'create',name:'存档验收房主',level:4});const host=await a.next('room');
 b.send({type:'join',code:host.room.code,name:'存档验收队友'});const guest=await b.next('room');
 b.send({type:'ready'});await a.next('room',v=>v.room.players.length===2&&v.room.players.every(p=>p.ready));a.send({type:'start'});const started=await a.next('start');
 await a.next('state',v=>v.state.elapsed>0.2);await new Promise(resolve=>{b.ws.once('close',resolve);b.ws.close();});
 const paused=await a.next('state',v=>v.state.mode==='paused');await new Promise(resolve=>{a.ws.once('close',resolve);a.ws.close();});active=[];
 execFileSync('ssh',['-o','BatchMode=yes','oci-cc-arm','systemctl --user restart butterfly-coop.service && systemctl --user is-active --quiet butterfly-coop.service && test -s /home/ubuntu/.local/state/butterfly-garden/state.json'],{encoding:'utf8'});
 await sleep(600);const reA=await peer(),reB=await peer();active=[reA,reB];
 reA.send({type:'resume',token:host.token});const hostRoom=await reA.next('room');assert.equal(hostRoom.room.code,host.room.code);assert.equal(hostRoom.room.roundId,`${host.room.roundId.split(':')[0]}:${started.epoch}`);
 const firstResume=await reA.next('start');assert.equal(firstResume.state.mode,'paused');assert.equal(firstResume.epoch,started.epoch);assert.equal(firstResume.state.elapsed,paused.state.elapsed);assert.deepEqual(firstResume.state.players,paused.state.players);
 reB.send({type:'resume',token:guest.token});const guestRoom=await reB.next('room');assert.equal(guestRoom.room.roundId,hostRoom.room.roundId);const continued=await reB.next('start');assert.equal(continued.state.mode,'playing');assert.equal(continued.epoch,started.epoch);
 assert.equal(servicePids(),baseline,'all pre-existing service PIDs remain unchanged');
 console.log(JSON.stringify({origin,code:host.room.code,epoch:started.epoch,savedElapsed:paused.state.elapsed,exactPlayersRecovered:true,roomAndTokensRecovered:true,continued:true,existingServicePidsPreserved:true},null,2));
}finally{for(const p of active)if(p.ws.readyState===1)p.send({type:'leave'});for(const p of peers)p.ws.close();}
