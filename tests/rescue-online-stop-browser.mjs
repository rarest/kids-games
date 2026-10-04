import test from 'node:test';
import assert from 'node:assert/strict';
import {instrumentedSite} from './rescue-render-observer-harness.mjs';
import {openOnlinePair,createRoom,key,sleep,wait} from './rescue-online-harness.mjs';

const level={id:'0',name:'confirmed stop regression',theme:'street',width:100,height:12,spawn:{x:30,y:1},platforms:[{id:'floor',x:0,y:1,w:100,h:1}],objects:[],enemies:[],hazards:[],pickups:[],decor:[],boss:null,checkpoints:[],exit:{x:98,y:1}};
test('350ms RTT teammate stops never pull either displayed player backward',{timeout:90000},async()=>{
 const site=await instrumentedSite(),previous=process.env.GAMES_TEST_ORIGIN;
 process.env.GAMES_TEST_ORIGIN=site.origin;let pair;
 try{
  pair=await openOnlinePair({latency:350,jitter:35,quality:'low',levelFor:()=>structuredClone(level)});
  await createRoom(pair);await sleep(600);
  for(const b of [pair.host,pair.guest])await b.evaluate(`(()=>{
   window.__stopRows=[];window.__stopDirection=0;window.__stopReleased=false;
   addEventListener('keydown',e=>{if(e.isTrusted&&(e.code==='KeyD'||e.code==='KeyA')){__stopDirection=e.code==='KeyD'?1:-1;__stopReleased=false;}});
   addEventListener('keyup',e=>{if(e.isTrusted&&(e.code==='KeyD'||e.code==='KeyA'))__stopReleased=true;});
   window.__rescueDraw=(s,g,size,camera)=>{const slot=JSON.parse(view.dataset.network).slot;if(__stopDirection)__stopRows.push({at:performance.now(),time:s.time,x:s.players[slot].x,teammate:s.players[1-slot].x,camera:camera?.x??JSON.parse(view.dataset.graphics).camera.x,direction:__stopDirection,released:__stopReleased});};
  })()`);
  for(const code of ['KeyD','KeyA','KeyD']){
   for(const b of [pair.host,pair.guest])await key(b,code);
   await sleep(650);
   for(const b of [pair.host,pair.guest])await key(b,code,false);
   await sleep(850);
  }
  for(const b of [pair.host,pair.guest]){
   const rows=await b.evaluate('__stopRows');let playerBacktrack=0,teammateBacktrack=0,cameraBacktrack=0;
   for(let i=1;i<rows.length;i++){
    const a=rows[i-1],r=rows[i];if(!a.released||!r.released||a.direction!==r.direction)continue;
    playerBacktrack=Math.max(playerBacktrack,(a.x-r.x)*r.direction);
    teammateBacktrack=Math.max(teammateBacktrack,(a.teammate-r.teammate)*r.direction);
    cameraBacktrack=Math.max(cameraBacktrack,(a.camera-r.camera)*r.direction);
   }
   console.log(JSON.stringify({draws:rows.length,playerBacktrack,teammateBacktrack,cameraBacktrack}));
   assert.ok(playerBacktrack<.005,`stopped player slid backward ${playerBacktrack}`);
   assert.ok(teammateBacktrack<.005,`stopped teammate slid backward ${teammateBacktrack}`);
   assert.ok(cameraBacktrack<.005,`stopped camera slid backward ${cameraBacktrack}`);
   assert.deepEqual(b.errors,[]);
  }
 }finally{await pair?.close();if(previous===undefined)delete process.env.GAMES_TEST_ORIGIN;else process.env.GAMES_TEST_ORIGIN=previous;await site.close();}
});
