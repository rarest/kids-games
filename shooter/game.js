import {createGame,startWave,stepGame,resizeGame,drawUpgrade,continueWave,pulse,laser,TIERS,stageNumber,substageNumber,checkpoint,restoreCheckpoint} from './core.js?v=20261002b';
import {createAudioController} from './audio.js?v=20261002-audio2';
import {createSoundObserver} from './sound-events.js?v=20261002-audio2';
const audio=createAudioController(),soundObserver=createSoundObserver();
let soundEnabled=true;
const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d'),arena=$('arena');
const input={x:0,y:0},keys=new Set();
let g=createGame(390,600),last=0,stars=[],background,drag=null,best=0,previousMode='',savedRun=null;
try{savedRun=JSON.parse(localStorage.getItem('starPatrolRun'));if(!restoreCheckpoint(390,600,savedRun))savedRun=null}catch{}
$('continueRun').hidden=!savedRun;
if(savedRun)$('continueRun').textContent=`继续第 ${Math.ceil(savedRun.wave/100)} 大关 · 第 ${(savedRun.wave-1)%100+1} 小关`;
function saveCheckpoint(){savedRun=checkpoint(g);try{localStorage.setItem('starPatrolRun',JSON.stringify(savedRun))}catch{}}
try{best=Math.max(0,Number(localStorage.getItem('starPatrolBest'))||0)}catch{}
function resize(){
  const width=arena.clientWidth,height=arena.clientHeight;if(!width||!height)return;
  resizeGame(g,width,height);
  const dpr=Math.min(devicePixelRatio||1,1.5,Math.sqrt(2000000/(width*height)));
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  background=ctx.createLinearGradient(0,0,0,height);background.addColorStop(0,'#0d2942');background.addColorStop(1,'#060f22');
  stars=Array.from({length:90},(_,i)=>({x:(i*137.31)%width,y:(i*83.77)%height,r:i%3===0?1.5:.7}));
  drag=null;render();
}
function text(id,value){const element=$(id),next=String(value);if(element.textContent!==next)element.textContent=next}
function sync(){
  text('score',g.score);text('wave',`${stageNumber(g)} · ${substageNumber(g)}`);text('health',g.hp);text('shield',g.shield);text('pulseCount',g.pulses);
  text('remainingBoss',g.plan.slice(g.spawnIndex).filter(k=>k!=='drone').length+g.enemies.filter(e=>e.kind!=='drone').length);
  text('laserCount',g.lasers);text('spreadCount',g.spread);text('powerCount',g.power);
  $('laser').disabled=g.mode!=='playing'||g.lasers===0||g.beam?.ttl>0;
  if(g.score>best){best=g.score;try{localStorage.setItem('starPatrolBest',String(best))}catch{}}
  text('best',best);$('pause').disabled=g.mode!=='playing';$('pulse').disabled=g.mode!=='playing'||g.pulses===0;
  arena.dataset.playerX=g.player.x.toFixed(1);arena.dataset.playerY=g.player.y.toFixed(1);
  if(previousMode!==g.mode){
    audio.setActive(g.mode==='playing'||g.mode==='upgrade',{finishEffects:g.mode==='over'||g.mode==='won'});
    previousMode=g.mode;document.body.dataset.mode=g.mode;
    for(const mode of ['home','paused','upgrade','over'])$(mode).hidden=g.mode!==mode&&!(mode==='over'&&g.mode==='won');
    $('resultTitle').textContent=g.mode==='won'?'全部200大关通关！':'本次巡航结束';
    $('restart').textContent=g.mode==='won'?'重新开始':'重试本小关';
    $('result').textContent=`第 ${stageNumber(g)} 大关 · 第 ${substageNumber(g)} 小关 · 积分 ${g.score} · 纪录 ${best}`;
    $('waveLabel').textContent=g.wave===101?'10只随机大Boss分批来袭 · 激光可穿透多个目标':'随机大Boss · 躲开紫色巨兽的绿色子弹';
    if(g.mode==='upgrade'){
      $('clearedLabel').textContent=`第 ${stageNumber(g)} 大关 · 第 ${substageNumber(g)} 小关完成`;
      $('cardResult').textContent='';$('nextWave').hidden=true;
      document.querySelectorAll('[data-draw]').forEach(b=>{b.disabled=false;b.classList.remove('revealed');b.querySelector('strong').textContent='✦'});
    }
    if(g.mode==='won'){savedRun=null;try{localStorage.removeItem('starPatrolRun')}catch{}}
    keys.clear();drag=null;
  }
}
function start(){void audio.unlock();g=createGame(arena.clientWidth,arena.clientHeight);startWave(g);saveCheckpoint();last=0;previousMode='';sync()}
function continueRun(){void audio.unlock();const restored=restoreCheckpoint(arena.clientWidth,arena.clientHeight,savedRun);if(!restored){start();return}g=restored;last=0;previousMode='';sync()}
function pauseGame(){if(g.mode==='playing'){g.mode='paused';sync()}}
function resume(){if(g.mode==='paused'){void audio.unlock();g.mode='playing';last=0;sync()}}
$('start').addEventListener('click',start);$('restart').addEventListener('click',()=>g.mode==='won'?start():continueRun());$('continueRun').addEventListener('click',continueRun);
$('pause').addEventListener('click',pauseGame);$('resume').addEventListener('click',resume);
function firePulse(){if(pulse(g))audio.playEffect('pulse');sync()}
function fireLaser(){if(laser(g))audio.playEffect('pulse');sync()}
$('pulse').addEventListener('click',firePulse);
$('sound').addEventListener('click',()=>{soundEnabled=!soundEnabled;audio.setEnabled(soundEnabled);if(soundEnabled)void audio.unlock();$('sound').textContent=soundEnabled?'♪':'×';$('sound').setAttribute('aria-pressed',String(!soundEnabled));$('sound').setAttribute('aria-label',soundEnabled?'关闭声音':'开启声音')});
$('laser').addEventListener('click',fireLaser);
$('nextWave').addEventListener('click',()=>{if(continueWave(g)){saveCheckpoint();last=0;sync()}});
document.querySelectorAll('[data-draw]').forEach(b=>b.addEventListener('click',()=>{
  const card=drawUpgrade(g);if(!card)return;audio.playEffect('upgrade');
  document.querySelectorAll('[data-draw]').forEach(c=>c.disabled=true);
  b.classList.add('revealed');b.querySelector('strong').textContent=card.icon;
  $('cardResult').textContent=`${card.title}：${card.description}`;$('nextWave').hidden=false;sync();
}));
const controls=new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyW','KeyA','KeyS','KeyD','Space','KeyL','KeyP','Escape']);
addEventListener('keydown',e=>{
  if(!controls.has(e.code))return;
  if(e.target.closest('button,a')&&e.code==='Space')return;
  e.preventDefault();if(e.repeat&&['Space','KeyL','KeyP','Escape'].includes(e.code))return;
  if(e.code==='Space')firePulse()
  else if(e.code==='KeyL')fireLaser()
  else if(['KeyP','Escape'].includes(e.code)){g.mode==='paused'?resume():pauseGame()}
  else keys.add(e.code);
});
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>{pauseGame();audio.setActive(false)});
addEventListener('focus',()=>audio.setActive(!document.hidden&&(g.mode==='playing'||g.mode==='upgrade')));
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame();audio.setActive(!document.hidden&&(g.mode==='playing'||g.mode==='upgrade'));last=0});
addEventListener('pagehide',()=>audio.setActive(false));
canvas.addEventListener('pointerdown',e=>{
  if(g.mode!=='playing'||drag)return;
  canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY,px:g.player.x,py:g.player.y};
});
canvas.addEventListener('pointermove',e=>{
  if(!drag||drag.id!==e.pointerId||g.mode!=='playing')return;
  g.player.x=Math.max(18,Math.min(g.width-18,drag.px+e.clientX-drag.x));
  g.player.y=Math.max(24,Math.min(g.height-18,drag.py+e.clientY-drag.y));
});
for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,e=>{if(drag?.id===e.pointerId)drag=null});
function render(){
  ctx.fillStyle=background||'#071729';ctx.fillRect(0,0,g.width,g.height);
  ctx.fillStyle='#b9e0f4';for(const s of stars){ctx.globalAlpha=s.r===1.5?.6:.28;ctx.fillRect(s.x,(s.y+g.time*12)%g.height,s.r,s.r)}ctx.globalAlpha=1;
  // Short grid lines provide motion depth without high-cost blur or shadows.
  ctx.strokeStyle='#173348';ctx.lineWidth=1;for(let i=1;i<7;i++){ctx.beginPath();ctx.moveTo(g.width/2,0);ctx.lineTo(i*g.width/6,g.height);ctx.stroke()}
  ctx.fillStyle='#72efd9';for(const b of g.bullets)ctx.fillRect(b.x-1.5,b.y-8,3,12);
  if(g.beam?.ttl>0){ctx.globalAlpha=g.beam.ttl/.22;ctx.fillStyle='#8ae8ff';ctx.fillRect(g.beam.x-22,0,44,g.beam.y);ctx.fillStyle='#f0ffff';ctx.fillRect(g.beam.x-5,0,10,g.beam.y);ctx.globalAlpha=1;}
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
  const p=g.player;ctx.save();ctx.translate(p.x,p.y);
  if(g.invincible>0){ctx.globalAlpha=.35+Math.sin(g.time*20)*.15;ctx.strokeStyle='#72efd9';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,26,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}
  ctx.fillStyle='#f6d87a';ctx.beginPath();ctx.moveTo(-5,14);ctx.lineTo(0,24+Math.sin(g.time*35)*4);ctx.lineTo(5,14);ctx.fill();
  ctx.fillStyle='#a2f3df';ctx.strokeStyle='#d6fff5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(19,16);ctx.lineTo(0,9);ctx.lineTo(-19,16);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#1f5671';ctx.beginPath();ctx.ellipse(0,-4,5,9,0,0,Math.PI*2);ctx.fill();ctx.restore();
}
function frame(now){
  const dt=last?Math.min(1,(now-last)/1000):0;last=now;
  input.x=Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA'));
  input.y=Number(keys.has('ArrowDown')||keys.has('KeyS'))-Number(keys.has('ArrowUp')||keys.has('KeyW'));
  soundObserver.before(g);
  if(!document.hidden)stepGame(g,dt,input);
  soundObserver.after(g,name=>audio.playEffect(name));
  sync();render();requestAnimationFrame(frame);
}
new ResizeObserver(resize).observe(arena);resize();sync();requestAnimationFrame(frame);
