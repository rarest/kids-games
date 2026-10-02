import {decodeVolleys} from './snapshot.js?v=20261002perf';
import {connectTeam} from './online.js?v=20261002perf';
import {createGame,startWave,stepGame,resizeGame,drawUpgrade,continueWave,pulse,laser,TIERS,stageNumber,substageNumber,checkpoint,restoreCheckpoint,pilots,SUBSTAGES} from './core.js?v=20261002perf';
import {createAudioController} from './audio.js?v=20261002-audio2';
import {createSoundObserver} from './sound-events.js?v=20261002-audio2';
const audio=createAudioController(),soundObserver=createSoundObserver();
let soundEnabled=true;
const localCoopPort=new URLSearchParams(location.search).get('coopPort')||'8787';
let online=null,team=null,myId=null,networkStatus='',snapshotAt=0,pointerTarget=null,renderScale=1,offsetX=0,offsetY=0;
const me=()=>online?pilots(g).find(p=>p.id===myId)||g:g;
const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d'),arena=$('arena');
const input={x:0,y:0},keys=new Set(),bulletCache=new Map();
let lastUI=0;
let g=createGame(390,600),last=0,stars=[],background,drag=null,best=0,previousMode='',savedRun=null;
try{savedRun=JSON.parse(localStorage.getItem('starPatrolRun'));const restored=restoreCheckpoint(390,600,savedRun);savedRun=restored?checkpoint(restored):null}catch{}
$('continueRun').hidden=!savedRun;
if(savedRun)$('continueRun').textContent=`继续第 ${Math.ceil(savedRun.wave/SUBSTAGES)} 大关 · 第 ${(savedRun.wave-1)%SUBSTAGES+1} 小关`;
function saveCheckpoint(){if(online)return;savedRun=checkpoint(g);try{localStorage.setItem('starPatrolRun',JSON.stringify(savedRun))}catch{}}
try{best=Math.max(0,Number(localStorage.getItem('starPatrolBest'))||0)}catch{}
function resize(){
  const width=arena.clientWidth,height=arena.clientHeight;if(!width||!height)return;
  if(!online)resizeGame(g,width,height);
  const dpr=Math.min(devicePixelRatio||1,1.5,Math.sqrt(2000000/(width*height)));
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);renderScale=online?Math.min(width/g.width,height/g.height):1;offsetX=(width-g.width*renderScale)/2;offsetY=(height-g.height*renderScale)/2;ctx.setTransform(dpr*renderScale,0,0,dpr*renderScale,dpr*offsetX,dpr*offsetY);
  background=ctx.createLinearGradient(0,0,0,g.height);background.addColorStop(0,'#0d2942');background.addColorStop(1,'#060f22');
  stars=Array.from({length:90},(_,i)=>({x:(i*137.31)%g.width,y:(i*83.77)%g.height,r:i%3===0?1.5:.7}));
  drag=null;render();
}
function text(id,value){const element=$(id),next=String(value);if(element.textContent!==next)element.textContent=next}
function sync(){
  const p=me();
  text('score',g.score);text('wave',`${stageNumber(g)} · ${substageNumber(g)}`);text('health',p.hp);text('shield',p.shield);text('pulseCount',p.pulses);
  text('remainingBoss',g.plan.slice(g.spawnIndex).filter(k=>k!=='drone').length+g.enemies.filter(e=>e.kind!=='drone').length);
  text('laserCount',p.lasers);text('spreadCount',p.spread);text('powerCount',p.power);
  $('laser').disabled=g.mode!=='playing'||p.lasers===0||p.beam?.ttl>0;
  if(g.score>best){best=g.score;try{localStorage.setItem('starPatrolBest',String(best))}catch{}}
  text('best',best);
  $('pause').disabled=g.mode!=='playing';$('pulse').disabled=g.mode!=='playing'||p.pulses===0;if(online)syncTeam();
  arena.dataset.playerX=p.player.x.toFixed(1);arena.dataset.playerY=p.player.y.toFixed(1);
  if(previousMode!==g.mode){
    audio.setActive(g.mode==='playing'||g.mode==='upgrade',{finishEffects:g.mode==='over'||g.mode==='won'});
    previousMode=g.mode;document.body.dataset.mode=g.mode;
    for(const mode of ['home','lobby','paused','upgrade','over'])$(mode).hidden=g.mode!==mode&&!(mode==='over'&&g.mode==='won');
    $('resultTitle').textContent=g.mode==='won'?'全部200大关通关！':'本次巡航结束';
    $('restart').textContent=g.mode==='won'?'重新开始':'重试本小关';
    $('result').textContent=`第 ${stageNumber(g)} 大关 · 第 ${substageNumber(g)} 小关 · 积分 ${g.score} · 纪录 ${best}`;
    $('waveLabel').textContent=g.wave===SUBSTAGES+1?'20只随机大Boss分批来袭 · 激光可穿透多个目标':'随机大Boss · 躲开紫色巨兽的绿色子弹';
    if(g.mode==='upgrade'){
      $('clearedLabel').textContent=`第 ${stageNumber(g)} 大关 · 第 ${substageNumber(g)} 小关完成`;
      $('cardResult').textContent='';$('nextWave').hidden=true;
      document.querySelectorAll('[data-draw]').forEach(b=>{b.disabled=false;b.classList.remove('revealed');b.querySelector('strong').textContent='✦'});
    }
    if(g.mode==='won'&&!online){savedRun=null;try{localStorage.removeItem('starPatrolRun')}catch{}}
    keys.clear();drag=null;pointerTarget=null;
  }
}
function start(){void audio.unlock();g=createGame(arena.clientWidth,arena.clientHeight);startWave(g);saveCheckpoint();last=0;previousMode='';sync()}
function continueRun(){void audio.unlock();const restored=restoreCheckpoint(arena.clientWidth,arena.clientHeight,savedRun);if(!restored){start();return}g=restored;last=0;previousMode='';sync()}
function pauseGame(){if(online){keys.clear();pointerTarget=null;online.send({type:'pause'});return}if(g.mode==='playing'){g.mode='paused';sync()}}
function resume(){if(online){void audio.unlock();online.send({type:'resume'});return}if(g.mode==='paused'){void audio.unlock();g.mode='playing';last=0;sync()}}
$('start').addEventListener('click',start);$('restart').addEventListener('click',()=>online?online.send({type:'retry'}):g.mode==='won'?start():continueRun());$('continueRun').addEventListener('click',continueRun);
$('pause').addEventListener('click',pauseGame);$('resume').addEventListener('click',resume);
function firePulse(){if(online){online.send({type:'pulse'});return}if(pulse(g))audio.playEffect('pulse');sync()}
function fireLaser(){if(online){online.send({type:'laser'});return}if(laser(g))audio.playEffect('pulse');sync()}
$('pulse').addEventListener('click',firePulse);
$('sound').addEventListener('click',()=>{soundEnabled=!soundEnabled;audio.setEnabled(soundEnabled);if(soundEnabled)void audio.unlock();$('sound').textContent=soundEnabled?'♪':'×';$('sound').setAttribute('aria-pressed',String(!soundEnabled));$('sound').setAttribute('aria-label',soundEnabled?'关闭声音':'开启声音')});
$('laser').addEventListener('click',fireLaser);
$('nextWave').addEventListener('click',()=>{if(online){online.send({type:'next'});return}if(continueWave(g)){saveCheckpoint();last=0;sync()}});
document.querySelectorAll('[data-draw]').forEach(b=>b.addEventListener('click',()=>{
  if(online){online.send({type:'draw'});return}
  const card=drawUpgrade(g);if(!card)return;audio.playEffect('upgrade');
  document.querySelectorAll('[data-draw]').forEach(c=>c.disabled=true);
  b.classList.add('revealed');b.querySelector('strong').textContent=card.icon;
  $('cardResult').textContent=`${card.title}：${card.description}`;$('nextWave').hidden=false;sync();
}));
const controls=new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyW','KeyA','KeyS','KeyD','Space','KeyL','KeyP','Escape']);
addEventListener('keydown',e=>{
  if(!controls.has(e.code)||e.target.closest('input'))return;
  if(e.target.closest('button,a')&&e.code==='Space')return;
  e.preventDefault();if(e.repeat&&['Space','KeyL','KeyP','Escape'].includes(e.code))return;
  if(e.code==='Space')firePulse()
  else if(e.code==='KeyL')fireLaser()
  else if(['KeyP','Escape'].includes(e.code)){g.mode==='paused'?resume():pauseGame()}
  else{pointerTarget=null;keys.add(e.code);}
});
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>{pauseGame();audio.setActive(false)});
addEventListener('focus',()=>audio.setActive(!document.hidden&&(g.mode==='playing'||g.mode==='upgrade')));
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame();audio.setActive(!document.hidden&&(g.mode==='playing'||g.mode==='upgrade'));last=0});
addEventListener('pagehide',()=>audio.setActive(false));
canvas.addEventListener('pointerdown',e=>{
  if(g.mode!=='playing'||drag)return;
  canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY,px:me().player.x,py:me().player.y};
});
canvas.addEventListener('pointermove',e=>{
  if(!drag||drag.id!==e.pointerId||g.mode!=='playing')return;
  const x=Math.max(18,Math.min(g.width-18,drag.px+(e.clientX-drag.x)/renderScale)),y=Math.max(24,Math.min(g.height-18,drag.py+(e.clientY-drag.y)/renderScale));
  if(online)pointerTarget={tx:x,ty:y};else{g.player.x=x;g.player.y=y}
});
for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,e=>{if(drag?.id===e.pointerId)drag=null});
function render(){
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#061223';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.restore();
  ctx.fillStyle=background||'#071729';ctx.fillRect(0,0,g.width,g.height);
  ctx.fillStyle='#b9e0f4';for(const s of stars){ctx.globalAlpha=s.r===1.5?.6:.28;ctx.fillRect(s.x,(s.y+g.time*12)%g.height,s.r,s.r)}ctx.globalAlpha=1;
  // Short grid lines provide motion depth without high-cost blur or shadows.
  ctx.strokeStyle='#173348';ctx.lineWidth=1;for(let i=1;i<7;i++){ctx.beginPath();ctx.moveTo(g.width/2,0);ctx.lineTo(i*g.width/6,g.height);ctx.stroke()}
  ctx.fillStyle='#72efd9';ctx.beginPath();for(const b of g.bullets)if(b.x>-4&&b.x<g.width+4&&b.y>-16&&b.y<g.height+16)ctx.rect(b.x-1.5,b.y-8,3,12);ctx.fill();
  for(const p of pilots(g))if(p.beam?.ttl>0){ctx.globalAlpha=p.beam.ttl/.22;ctx.fillStyle='#8ae8ff';ctx.fillRect(p.beam.x-22,0,44,p.beam.y);ctx.fillStyle='#f0ffff';ctx.fillRect(p.beam.x-5,0,10,p.beam.y);ctx.globalAlpha=1;}
  for(const b of g.enemyBullets){ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fillStyle=b.color||'#ff9a7d';ctx.fill()}
  for(const e of g.enemies){
    ctx.save();ctx.translate(e.x,e.y);ctx.fillStyle=(TIERS[e.kind]||TIERS.drone).color;ctx.strokeStyle='#b9d5f6';ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect(-e.r,-e.r*.65,e.r*2,e.r*1.3,6);ctx.fill();ctx.stroke();
    ctx.fillStyle='#142c45';ctx.fillRect(-e.r*.6,-4,e.r*1.2,8);ctx.fillStyle='#ff9a7d';ctx.fillRect(-e.r*.4,-2,5,4);ctx.fillRect(e.r*.4-5,-2,5,4);
    ctx.strokeStyle='#93b9db';ctx.beginPath();ctx.moveTo(-e.r,0);ctx.lineTo(-e.r-8,8);ctx.moveTo(e.r,0);ctx.lineTo(e.r+8,8);ctx.stroke();
    if(e.kind!=='drone'){ctx.fillStyle='#15283b';ctx.fillRect(-e.r,-e.r-12,e.r*2,4);ctx.fillStyle='#7df28b';ctx.fillRect(-e.r,-e.r-12,e.r*2*Math.max(0,e.hp/e.maxHp),4);}
    ctx.restore();
  }
  for(const e of g.effects){ctx.globalAlpha=e.ttl/.4;ctx.strokeStyle='#72efd9';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,e.r+(1-e.ttl/.4)*30,0,Math.PI*2);ctx.stroke()}ctx.globalAlpha=1;
  for(const pilot of pilots(g)){if(pilot.hp<=0)continue;const p=pilot.player;ctx.save();ctx.translate(p.x,p.y);
  if(pilot.invincible>0){ctx.globalAlpha=.35+Math.sin(g.time*20)*.15;ctx.strokeStyle='#72efd9';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,26,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}
  ctx.fillStyle='#f6d87a';ctx.beginPath();ctx.moveTo(-5,14);ctx.lineTo(0,24+Math.sin(g.time*35)*4);ctx.lineTo(5,14);ctx.fill();
  ctx.fillStyle=pilot.id===myId||!online?'#a2f3df':'#ffc782';ctx.strokeStyle='#d6fff5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(19,16);ctx.lineTo(0,9);ctx.lineTo(-19,16);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#1f5671';ctx.beginPath();ctx.ellipse(0,-4,5,9,0,0,Math.PI*2);ctx.fill();if(online){ctx.fillStyle='#ffffff';ctx.font='14px sans-serif';ctx.textAlign='center';ctx.fillText(pilot.id===myId?'你':`队友 ${pilots(g).indexOf(pilot)+1}`,0,42)}ctx.restore();}
}
function frame(now){
  const dt=last?Math.min(1,(now-last)/1000):0;last=now;
  input.x=Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA'));
  input.y=Number(keys.has('ArrowDown')||keys.has('KeyS'))-Number(keys.has('ArrowUp')||keys.has('KeyW'));
  soundObserver.before(g);
  if(online){
   const frameDt=Math.min(dt,.05),f=1-Math.exp(-frameDt*20),active=g.mode==='playing'&&!document.hidden;
   if(active){online.input(pointerTarget||input);if(now-snapshotAt<150){for(const b of g.bullets){b.x+=b.vx*frameDt;b.y+=b.vy*frameDt}for(const b of g.enemyBullets){b.x+=b.vx*frameDt;b.y+=b.vy*frameDt}}}
   for(const p of pilots(g)){
    if(p.id===myId&&p.hp>0&&active){
     const speed=Math.min(560,Math.max(260,g.width*.55));let dx=input.x,dy=input.y;
     if(pointerTarget){dx=pointerTarget.tx-p.player.x;dy=pointerTarget.ty-p.player.y;const distance=Math.hypot(dx,dy);if(distance<speed*frameDt){p.player.x=pointerTarget.tx;p.player.y=pointerTarget.ty;dx=dy=0}}
     const length=Math.hypot(dx,dy)||1;
     p.player.x=Math.max(18,Math.min(g.width-18,p.player.x+dx/length*speed*frameDt));p.player.y=Math.max(24,Math.min(g.height-18,p.player.y+dy/length*speed*frameDt));
     // Wait until the server has applied the latest input before reconciling a stop.
     if(!pointerTarget&&!dx&&!dy&&p.inputSequence>=online.sequence&&Number.isFinite(p.player.tx)){p.player.x+=(p.player.tx-p.player.x)*f;p.player.y+=(p.player.ty-p.player.y)*f}
    }else if(Number.isFinite(p.player.tx)){p.player.x+=(p.player.tx-p.player.x)*f;p.player.y+=(p.player.ty-p.player.y)*f}
   }
   for(const e of g.enemies)if(Number.isFinite(e.tx)){e.x+=(e.tx-e.x)*f;e.y+=(e.ty-e.y)*f}
  }else if(!document.hidden)stepGame(g,dt,input);
  soundObserver.after(g,name=>audio.playEffect(name));
  arena.dataset.playerX=me().player.x.toFixed(1);arena.dataset.playerY=me().player.y.toFixed(1);
  if(now-lastUI>=100||previousMode!==g.mode){sync();lastUI=now}render();requestAnimationFrame(frame);
}
function syncTeam(){
 const p=me(),owner=team?.host===myId,connected=team?.members.filter(m=>m.online).length||0;
 text('teamStatus',`${networkStatus} · ${connected}/16人${p.hp<=0?' · 观战，过关复活':''}`);
 text('lobbyStatus',`队伍 ${team?.code||'…'} · ${connected}/16人 · ${owner?'你是队长':'等待队长开始'}`);
 $('launchTeam').disabled=!owner;$('resume').disabled=!owner;$('restart').disabled=!owner;
 text('pauseInfo',owner?'队伍已暂停，可以继续或邀请朋友。':'队伍已暂停，等待队长继续。');
 if(g.mode==='upgrade'){
  document.querySelectorAll('[data-draw]').forEach(b=>b.disabled=!!p.reward);
  text('cardResult',p.reward?`${p.reward.title}：${p.reward.description}`:'每位队员抽一张自己的升级卡');
  $('nextWave').hidden=!p.reward;$('nextWave').disabled=!owner||team.members.some(m=>m.online&&!pilots(g).find(p=>p.id===m.id)?.reward);
  text('nextWave',owner?'全队进入下一小关':'等待队长进入下一小关');
 }
 $('laser').disabled=g.mode!=='playing'||p.hp<=0||p.lasers===0||p.beam?.ttl>0;$('pulse').disabled=g.mode!=='playing'||p.hp<=0||p.pulses===0;
}
function leaveOnline(){online=null;team=null;myId=null;pointerTarget=null;document.body.dataset.online='false';$('teamBar').hidden=true;g=createGame(arena.clientWidth,arena.clientHeight);previousMode='';$('nextWave').disabled=false;$('nextWave').textContent='进入下一小关';$('resume').disabled=false;$('restart').disabled=false;history.replaceState(null,'',location.pathname);resize();sync()}
function joinOnline(code){
 if(online)return;void audio.unlock();
 networkStatus='连接中';g=createGame(720,960);g.mode='lobby';document.body.dataset.online='true';$('teamBar').hidden=false;previousMode='';
 const endpoint=location.hostname==='127.0.0.1'||location.hostname==='localhost'?`ws://${location.hostname}:${new URLSearchParams(location.search).get('coopPort')||localCoopPort}/shooter-ws`:`${location.protocol==='https:'?'wss:':'ws:'}//${location.host}/shooter-ws`;
 online=connectTeam({endpoint,onStatus:status=>{networkStatus=status;text('joinStatus',status);if(g.mode==='lobby')text('lobbyStatus',status)},onJoined:m=>{myId=m.id;history.replaceState(null,'',`${location.pathname}?team=${m.code}`);$('inviteLink').value=`${location.origin}${location.pathname}?team=${m.code}${location.hostname==='127.0.0.1'||location.hostname==='localhost'?'&coopPort='+new URL(endpoint).port:''}`},onState:m=>{
  soundObserver.before(g);const previous=g;g=m.game;for(const p of pilots(g)){const old=pilots(previous).find(v=>v.id===p.id);p.player.tx=p.player.x;p.player.ty=p.player.y;if(old){p.player.x=old.player.x;p.player.y=old.player.y}}g.bullets=g.volleys?decodeVolleys(g.volleys,bulletCache):g.bullets.map(([x,y,owner,vx,vy])=>({x,y,owner,vx,vy}));g.enemyBullets=g.enemyBullets.map(([x,y,color,vx,vy])=>({x,y,color,vx,vy,r:5}));const oldEnemies=new Map(previous.enemies.map(e=>[e.id,e]));for(const e of g.enemies){e.tx=e.x;e.ty=e.y;const old=oldEnemies.get(e.id);if(old){e.x=old.x;e.y=old.y}}snapshotAt=performance.now();team=m;soundObserver.after(g,n=>audio.playEffect(n));sync();
 },onLeft:leaveOnline});
 online.join(code?{type:'join',code:code.toUpperCase()}:{type:'create'});resize();sync();
}
$('createTeam').addEventListener('click',()=>joinOnline());$('joinTeam').addEventListener('click',()=>{const code=$('teamCode').value.trim();if(!/^[0-9a-f]{6}$/i.test(code)){text('joinStatus','请输入6位队伍码');return}joinOnline(code)});
$('launchTeam').addEventListener('click',()=>online?.send({type:'start'}));
for(const id of ['leaveTeam','leaveLobby'])$(id).addEventListener('click',()=>online?.close());
async function copyInvite(){try{await navigator.clipboard.writeText($('inviteLink').value);networkStatus='邀请链接已复制'}catch{$('inviteLink').focus();$('inviteLink').select();networkStatus='请选中并复制邀请链接'}sync()}
$('copyInvite').addEventListener('click',copyInvite);$('inviteTeam').addEventListener('click',copyInvite);
const invitation=new URLSearchParams(location.search).get('team');
new ResizeObserver(resize).observe(arena);resize();sync();requestAnimationFrame(frame);if(invitation&&/^[0-9a-f]{6}$/i.test(invitation))joinOnline(invitation);
