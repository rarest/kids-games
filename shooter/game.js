import {createGame,startWave,stepGame,resizeGame,chooseUpgrade,pulse} from './core.js';
const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d'),arena=$('arena');
const input={x:0,y:0},keys=new Set();
let g=createGame(390,600),last=0,stars=[],background,drag=null,best=0,previousMode='';
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
function sync(){
  $('score').textContent=g.score;$('wave').textContent=Math.max(1,g.wave);$('shield').textContent='◆'.repeat(Math.max(0,g.shield));$('pulseCount').textContent=g.pulses;
  if(g.score>best){best=g.score;try{localStorage.setItem('starPatrolBest',String(best))}catch{}}
  $('best').textContent=best;$('pause').disabled=g.mode!=='playing';$('pulse').disabled=g.mode!=='playing'||g.pulses===0;
  arena.dataset.playerX=g.player.x.toFixed(1);arena.dataset.playerY=g.player.y.toFixed(1);
  if(previousMode!==g.mode){
    previousMode=g.mode;document.body.dataset.mode=g.mode;
    for(const mode of ['home','paused','upgrade','over'])$(mode).hidden=g.mode!==mode;
    $('result').textContent=`到达第 ${g.wave} 关 · 积分 ${g.score} · 历史纪录 ${best}`;
    $('waveLabel').textContent=g.wave%3===0?'大型机器人正在接近':'击退机器人，保护星际航线';
    document.querySelector('[data-upgrade="spread"] small').textContent=g.spread>=3?'已达三道光束，选择其他升级':'增加一道光束，最多三道';
    document.querySelector('[data-upgrade="spread"]').disabled=g.spread>=3;
    keys.clear();drag=null;
  }
}
function start(){g=createGame(arena.clientWidth,arena.clientHeight);startWave(g);last=0;previousMode='';sync()}
function pauseGame(){if(g.mode==='playing'){g.mode='paused';sync()}}
function resume(){if(g.mode==='paused'){g.mode='playing';last=0;sync()}}
$('start').addEventListener('click',start);$('restart').addEventListener('click',start);
$('pause').addEventListener('click',pauseGame);$('resume').addEventListener('click',resume);
$('pulse').addEventListener('click',()=>{pulse(g);sync()});
document.querySelectorAll('[data-upgrade]').forEach(b=>b.addEventListener('click',()=>{chooseUpgrade(g,b.dataset.upgrade);last=0;sync()}));
const controls=new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyW','KeyA','KeyS','KeyD','Space','KeyP','Escape']);
addEventListener('keydown',e=>{
  if(!controls.has(e.code))return;
  if(e.target.closest('button,a')&&e.code==='Space')return;
  e.preventDefault();if(e.repeat&&['Space','KeyP','Escape'].includes(e.code))return;
  if(e.code==='Space'){pulse(g);sync()}
  else if(['KeyP','Escape'].includes(e.code)){g.mode==='paused'?resume():pauseGame()}
  else keys.add(e.code);
});
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',pauseGame);document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame();last=0});
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
  for(const b of g.bullets){ctx.fillStyle='#72efd9';ctx.fillRect(b.x-2,b.y-10,4,16)}
  for(const b of g.enemyBullets){ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fillStyle='#ff9a7d';ctx.fill()}
  for(const e of g.enemies){
    ctx.save();ctx.translate(e.x,e.y);ctx.fillStyle=e.kind==='boss'?'#e8a569':'#678ec4';ctx.strokeStyle='#b9d5f6';ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect(-e.r,-e.r*.65,e.r*2,e.r*1.3,6);ctx.fill();ctx.stroke();
    ctx.fillStyle='#142c45';ctx.fillRect(-e.r*.6,-4,e.r*1.2,8);ctx.fillStyle='#ff9a7d';ctx.fillRect(-e.r*.4,-2,5,4);ctx.fillRect(e.r*.4-5,-2,5,4);
    ctx.strokeStyle='#93b9db';ctx.beginPath();ctx.moveTo(-e.r,0);ctx.lineTo(-e.r-8,8);ctx.moveTo(e.r,0);ctx.lineTo(e.r+8,8);ctx.stroke();ctx.restore();
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
  if(!document.hidden)stepGame(g,dt,input);
  sync();render();requestAnimationFrame(frame);
}
new ResizeObserver(resize).observe(arena);resize();sync();requestAnimationFrame(frame);
