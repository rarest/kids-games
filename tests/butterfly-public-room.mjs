import assert from 'node:assert/strict';
import WebSocket from 'ws';
const origin=process.env.GAMES_TEST_ORIGIN||'https://games.nblord.com';
const endpoint=new URL('/butterfly-ws',origin);endpoint.protocol=endpoint.protocol==='https:'?'wss:':'ws:';
async function peer(name){
 const ws=new WebSocket(endpoint,{origin});const messages=[];let cursor=0;
 ws.on('message',data=>messages.push(JSON.parse(data)));
 await new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject);});
 return {ws,messages,send:data=>ws.send(JSON.stringify(data)),async next(type,predicate=()=>true){const deadline=Date.now()+10000;while(Date.now()<deadline){for(let i=cursor;i<messages.length;i++)if(messages[i].type===type&&predicate(messages[i])){cursor=i+1;return messages[i];}await new Promise(r=>setTimeout(r,20));}throw Error(`${name}: no ${type}; received ${JSON.stringify(messages.slice(-3))}`);}};
}
const a=await peer('host'),b=await peer('guest');
try{
 a.send({type:'create',name:'公开验收房主',level:4});const created=await a.next('room');assert.match(created.room.code,/^\d{4}$/);assert.equal(created.room.maxPlayers,64);
 b.send({type:'join',code:created.room.code,name:'公开验收队友'});const joined=await b.next('room');assert.equal(joined.room.players.length,2);assert.equal(joined.room.code,created.room.code);
 b.send({type:'ready'});await a.next('room',v=>v.room.players.length===2&&v.room.players.every(p=>p.ready));a.send({type:'start'});
 const [startA,startB]=await Promise.all([a.next('start'),b.next('start')]);assert.equal(startA.epoch,startB.epoch);assert.equal(startA.state.players.length,2);assert.deepEqual(startA.state,startB.state);
 const initial=startA.state.players[0];a.send({type:'input',input:{x:1,z:0,boost:true}});
 const moved=await b.next('state',v=>v.state.mode==='playing'&&Math.abs(v.state.players[0].x-initial.x)>.1);a.send({type:'input',input:{x:0,z:0}});
 console.log(JSON.stringify({origin,endpoint:endpoint.href,code:created.room.code,maxPlayers:created.room.maxPlayers,players:moved.state.players.length,epoch:moved.epoch,mode:moved.state.mode,hostMovedSeenByGuest:true},null,2));
}finally{for(const p of[a,b]){if(p.ws.readyState===1)p.send({type:'leave'});p.ws.close();}}
