import{createGame,stepGame,coverage,finishRun}from'./core.js?v=20261002round';
import{SKINS,createProfile,buySkin,equipSkin,settleRun}from'./profile.js';
import{drawPaper,createRenderer}from'./render.js?v=20261002round';

const $=id=>document.getElementById(id),KEY='paper-territory.profile.v1';
let profile,game=null,tier='normal',mouseTarget=null,joy={x:0,y:0},joyPointer=null,last=0,hudTime=0,lastEvent=null,noticeTimer;
const keys=new Set(),renderer=createRenderer($('map'),{follow:true,minimap:$('minimap')});
const coarsePointer=matchMedia('(pointer: coarse)');
function inputHelp(touch=coarsePointer.matches){$('input-help').textContent=touch?'拖动摇杆，自由转向':'鼠标跟随 / WASD'}
coarsePointer.addEventListener('change',()=>inputHelp());inputHelp();
function notify(message){$('notice').textContent=message;$('notice').hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('notice').hidden=true,4200)}
try{profile=createProfile(JSON.parse(localStorage.getItem(KEY)))}catch{profile=createProfile();notify('无法读取本机存档，本次使用默认纸片。')}
function save(){try{localStorage.setItem(KEY,JSON.stringify(profile));return true}catch{notify('浏览器无法保存：本次金币与装备仅保留到页面关闭。');return false}}
const selected=()=>SKINS.find(s=>s.id===profile.selected)||SKINS[0];
function paperPreview(canvas,skin,size=42,locked=false){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);drawPaper(c,canvas.width/2,canvas.height/2,size,skin,0,{locked});canvas.dataset.skin=skin.id}
function clearInput(){keys.clear();mouseTarget=null;joy={x:0,y:0};if(joyPointer!==null){try{$('joystick').releasePointerCapture(joyPointer)}catch{}joyPointer=null}$('joy-knob').style.transform='translate(0px,0px)'}
function screen(name){clearInput();document.body.dataset.screen=name;document.body.dataset.mode=name==='game'?game.mode:name;for(const n of ['home','shop','game','result'])$(`${n}-screen`).hidden=n!==name;$('pause-dialog').hidden=true;window.scrollTo(0,0)}
function refreshProfile(){const skin=selected();$('wallet').textContent=profile.coins;$('selected-name').textContent=skin.name;paperPreview($('home-paper'),skin,38);paperPreview($('result-paper'),skin,75);drawHero()}
function drawHero(){const demo=createGame({seed:'paper-hero',cols:32,rows:28});for(let i=0;i<demo.mask.length;i++){const x=i%demo.cols,y=Math.floor(i/demo.cols);if(demo.mask[i]){if(x>=7&&x<=13&&y>=10&&y<=17)demo.owners[i]=0;else if(x>=20&&x<=23&&y>=7&&y<=12)demo.owners[i]=1;else if(x>=19&&x<=23&&y>=18&&y<=21)demo.owners[i]=2;else if(x>=11&&x<=15&&y>=5&&y<=8)demo.owners[i]=3}}demo.players[0].x=13.5;demo.players[0].y=17.5;demo.players[0].trail=Array.from({length:5},(_,i)=>({x:13.5+i,y:17.5}));demo.players[1].x=21.5;demo.players[1].y=9.5;demo.players[2].x=20.5;demo.players[2].y=20.5;demo.players[3].x=13.5;demo.players[3].y=6.5;createRenderer($('hero-map')).draw(demo,selected())}
function renderShop(){
  $('wallet').textContent=profile.coins;for(const tab of document.querySelectorAll('[data-tier]'))tab.setAttribute('aria-selected',String(tab.dataset.tier===tier));
  $('shop-description').textContent=tier==='normal'?'20 种纯色。朱砂红免费，其余每张 20 金币。':tier==='fine'?'20 种纹理与柔和光泽，每张 60 金币。':`20 种会发光的秘密。累计胜场依次解锁购买资格，每张 100 金币。当前 ${profile.wins} 胜。`;
  $('skin-grid').replaceChildren();for(const skin of SKINS.filter(s=>s.tier===tier)){
    const locked=profile.wins<skin.winsRequired,owned=profile.owned.includes(skin.id),equipped=skin.id===profile.selected;
    const card=document.createElement('article');card.className='skin-card';card.dataset.skin=skin.id;card.dataset.locked=locked;card.dataset.equipped=equipped;
    const c=document.createElement('canvas');c.className='skin-preview';c.width=112;c.height=112;c.setAttribute('aria-label',locked?'未解锁的黑色纸片':skin.name);paperPreview(c,skin,64,locked);
    const h=document.createElement('h2');h.textContent=locked?'秘密纸片 '+String(skin.winsRequired).padStart(2,'0'):skin.name;
    const info=document.createElement('p');info.textContent=locked?`${skin.winsRequired} 胜解锁`:owned?'已收入纸片册':`${skin.price} 金币`;
    const button=document.createElement('button');button.textContent=locked?'尚未解锁':equipped?'正在装备':owned?'装备':`购买 · ${skin.price}`;button.disabled=locked||equipped||(!owned&&profile.coins<skin.price);
    button.addEventListener('click',()=>{if(owned){if(equipSkin(profile,skin.id)){const saved=save();refreshProfile();renderShop();if(saved)notify(`已装备${skin.name}`)}}else if(buySkin(profile,skin.id)){const saved=save();refreshProfile();renderShop();if(saved)notify(`${skin.name}已收入纸片册，可点击装备`)}});
    card.append(c,h,info,button);if(locked){const lock=document.createElement('span');lock.className='lock-symbol';lock.textContent='●';lock.setAttribute('aria-hidden','true');card.append(lock)}$('skin-grid').append(card);
  }
}
export function readNewEvents(events,cursor){return events.slice(cursor?events.indexOf(cursor)+1:0)}
function updateHud(){const p=game.players[0];$('map').dataset.playerX=p.x.toFixed(5);$('map').dataset.playerY=p.y.toFixed(5);$('map').dataset.coverage=coverage(game,0).toFixed(5);$('map').dataset.skin=selected().id;
  $('coverage').innerHTML=`${(coverage(game,0)*100).toFixed(1)}<span>%</span>`;
  $('rankings').replaceChildren();for(const p of [...game.players].sort((a,b)=>coverage(game,b.id)-coverage(game,a.id))){const amount=coverage(game,p.id)*100,color=p.id===0?selected().color:p.color,node=document.createElement('div');node.className='rank-item';const dot=document.createElement('i');dot.style.background=color;const label=document.createElement('span');label.textContent=p.id===0?'你':p.name;const pct=document.createElement('strong');pct.textContent=p.alive?amount.toFixed(1)+'%':'出局';const bar=document.createElement('div');bar.className='rank-track';const fill=document.createElement('span');fill.style.width=amount+'%';fill.style.background=color;bar.append(fill);node.append(dot,label,pct,bar);$('rankings').append(node)}
  let playerNotice=false;for(const event of readNewEvents(game.events,lastEvent)){lastEvent=event;if(event.id!==0)continue;if(event.type==='cut'){playerNotice=true;$('map-hint').textContent='这次路被切断了，旧领地还在';notify('回到自己的纸上，再试一次。')}else if(event.type==='capture'){playerNotice=true;$('map-hint').textContent=`收下 ${event.cells} 格新领地！`}}
  if(!playerNotice&&game.players[0].trail.length)$('map-hint').textContent='回到自己的颜色，闭合这条路';
}
function start(){game=createGame({cols:88,rows:76});game.speed=Number($('speed').value);lastEvent=null;hudTime=0;screen('game');$('map-hint').textContent='画弧线，绕一圈，再回到自己的颜色';updateHud();renderer.draw(game,selected());last=performance.now()}
function pause(){if(!game||game.mode!=='playing')return;clearInput();game.mode='paused';document.body.dataset.mode='paused';$('pause-dialog').hidden=false;$('resume').focus()}
function resume(){if(!game||game.mode!=='paused')return;clearInput();game.mode='playing';document.body.dataset.mode='playing';$('pause-dialog').hidden=true;last=performance.now()}
function end(){if(!game)return;clearInput();finishRun(game);const reward=settleRun(profile,game);save();refreshProfile();const won=game.winner===0;screen('result');$('result-title').textContent=won?'整座岛，都是你的了。':!game.players[0].alive?'小纸片，下次再来。':'把这一片风景带回家。';$('result-copy').textContent=won?'100% 占地达成！胜场 +1，另获 50 金币。':!game.players[0].alive?'领地被夺完了。这次的最好成绩已经结算。':'本局已结束，按最高占地结算金币。';$('result-peak').textContent=(game.peak*100).toFixed(1)+'%';$('result-coins').textContent='+'+reward}
function direction(dt){
  const x=(keys.has('ArrowRight')||keys.has('d')?1:0)-(keys.has('ArrowLeft')||keys.has('a')?1:0),y=(keys.has('ArrowDown')||keys.has('s')?1:0)-(keys.has('ArrowUp')||keys.has('w')?1:0);
  if(keys.size)return{x,y};if(joyPointer!==null)return joy;
  if(mouseTarget){const p=game.players[0],dx=mouseTarget.x-p.x,dy=mouseTarget.y-p.y,d=Math.hypot(dx,dy);if(d<.006){mouseTarget=null;return{x:0,y:0}}const travel=Math.max(.0001,game.speed*dt),scale=Math.min(1,d/travel);return{x:dx/d*scale,y:dy/d*scale}}
  return{x:0,y:0};
}
function frame(now){const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;if(document.body.dataset.screen==='game'&&game){if(game.mode==='playing'){stepGame(game,dt,direction(dt));if(game.mode==='over'){end();requestAnimationFrame(frame);return}}renderer.draw(game,selected(),game.time);if(now-hudTime>80){updateHud();hudTime=now}}requestAnimationFrame(frame)}
$('start').addEventListener('click',start);$('shop').addEventListener('click',()=>{screen('shop');renderShop()});$('shop-back').addEventListener('click',()=>{screen('home');refreshProfile()});$('return-home').addEventListener('click',()=>{game=null;screen('home');refreshProfile()});$('pause').addEventListener('click',pause);$('resume').addEventListener('click',resume);$('finish').addEventListener('click',end);$('speed').addEventListener('change',()=>{if(game)game.speed=Number($('speed').value);mouseTarget=null});
for(const tab of document.querySelectorAll('[data-tier]'))tab.addEventListener('click',()=>{tier=tab.dataset.tier;renderShop()});
$('map').addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||game?.mode!=='playing'||keys.size||joyPointer!==null)return;inputHelp(false);const r=$('map').getBoundingClientRect(),{scale,ox,oy}=renderer.getGeometry();mouseTarget={x:(e.clientX-r.left-ox)/scale,y:(e.clientY-r.top-oy)/scale}});
$('map').addEventListener('pointerleave',()=>{mouseTarget=null});$('map').addEventListener('pointercancel',()=>{mouseTarget=null});
function joystickMove(e){if(e.pointerId!==joyPointer)return;const r=$('joystick').getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,d=Math.hypot(dx,dy),limit=r.width*.34,factor=d>limit?limit/d:1;joy={x:dx*factor/limit,y:dy*factor/limit};if(d<5)joy={x:0,y:0};$('joy-knob').style.transform=`translate(${dx*factor}px,${dy*factor}px)`;e.preventDefault()}
$('joystick').addEventListener('pointerdown',e=>{if(game?.mode!=='playing'||joyPointer!==null)return;inputHelp(e.pointerType==='touch'||coarsePointer.matches);joyPointer=e.pointerId;mouseTarget=null;keys.clear();$('joystick').setPointerCapture(e.pointerId);joystickMove(e)});$('joystick').addEventListener('pointermove',joystickMove);
for(const event of ['pointerup','pointercancel','lostpointercapture'])$('joystick').addEventListener(event,e=>{if(e.pointerId===joyPointer)clearInput()});
window.addEventListener('keydown',e=>{if(document.body.dataset.screen!=='game'||e.target.closest('input,select,textarea,[contenteditable=true]'))return;if(e.key==='Escape'){game.mode==='playing'?pause():resume();return}const key=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(key)&&game.mode==='playing'){e.preventDefault();mouseTarget=null;joy={x:0,y:0};keys.add(key)}});
window.addEventListener('keyup',e=>{keys.delete(e.key.length===1?e.key.toLowerCase():e.key)});window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});window.addEventListener('resize',()=>{mouseTarget=null;if(document.body.dataset.screen==='home')drawHero()});
refreshProfile();requestAnimationFrame(frame);
