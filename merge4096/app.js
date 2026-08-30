import {VALUES,createGame,drawCard,chooseLuckyValue,placePendingCard,buyItem,useBomb,useCandle,canFail,settleGame} from './game-core.js';
import {loadSave,saveGame} from './save.js';
import {createAudioController} from './audio.js';
import {columnIndexAtPoint} from './drag.js';

const $=id=>document.getElementById(id);
const screens={home:$('homeScreen'),game:$('gameScreen'),result:$('resultScreen')};
const audio=createAudioController();
let save=loadSave(),toolMode=null,comboTimer=null;

function persist(){saveGame(globalThis.localStorage,save)}
function show(screen){for(const [name,node] of Object.entries(screens))node.hidden=name!==screen;document.body.dataset.screen=screen}
function message(title,text){$('messageTitle').textContent=title;$('messageText').textContent=text;$('messageDialog').showModal()}
function tileLevel(value){return Math.log2(value)}
function profileFromRound(){const game=save.currentGame;if(!game)return;save.profile.best=Math.max(save.profile.best,game.roundMax);save.profile.lastResult=game.roundMax}
function renderHome(){
  $('coinCount').textContent=save.profile.coins;$('bestValue').textContent=save.profile.best;$('lastResult').textContent=save.profile.lastResult;$('winCount').textContent=save.profile.wins;
  $('startButton').textContent=save.currentGame?.status==='playing'?'继续游戏':'开始游戏';show('home');persist();
}
function renderGame(){
  const game=save.currentGame;if(!game)return renderHome();
  $('gameBest').textContent=Math.max(save.profile.best,game.roundMax);$('drawCount').textContent=game.drawIndex;$('bombCount').textContent=save.profile.bombs;$('candleCount').textContent=save.profile.candles;
  const pending=game.pendingCard;$('drawButton').hidden=Boolean(pending);$('pendingCard').hidden=!pending;
  if(pending){$('pendingCard').textContent=pending.kind==='lucky'?'✨':pending.value;$('pendingCard').dataset.lucky=String(pending.kind==='lucky')}
  $('drawButton').disabled=Boolean(pending)||game.status!=='playing';
  document.querySelectorAll('.pile-button').forEach((button,index)=>{
    const pile=button.querySelector('.pile');pile.replaceChildren(...game.columns[index].map(value=>{const tile=document.createElement('span');tile.className='tile';tile.dataset.level=String(tileLevel(value));tile.textContent=value;return tile}));
    button.disabled=!pending||pending.kind==='lucky'||game.columns[index].length>=12;button.classList.toggle('tool-target',toolMode==='bomb');
  });
  $('bombButton').classList.toggle('selected',toolMode==='bomb');$('musicButton').setAttribute('aria-pressed',String(save.profile.musicOn));$('musicButton').textContent=save.profile.musicOn?'♫':'♩';
  show('game');persist();
}
function comboEffect(count){
  if(count<3)return;const names=['零','一','二','三','四','五','六','七','八','九','十'];$('comboBanner').textContent=`${names[count]??count}连合成！`;$('comboBanner').hidden=false;$('fireworks').classList.add('active');clearTimeout(comboTimer);comboTimer=setTimeout(()=>{$('comboBanner').hidden=true;$('fireworks').classList.remove('active')},1000);
}
function finish(outcome){
  const settled=settleGame(save.currentGame,save.profile,outcome);save.currentGame=settled.state;save.profile=settled.profile;persist();
  const won=outcome==='won';$('resultTitle').textContent=won?'成功通关！':'本局结束';$('resultMessage').textContent=won?'合成4096，奖励300金币':'牌堆已满，奖励250金币';$('resultValue').textContent=settled.state.roundMax;audio.playEffect(won?'win':'lose');show('result');
}
function afterTransition(transition){
  save.currentGame=transition.state;save.profile.best=Math.max(save.profile.best,transition.state.roundMax);comboEffect(transition.comboCount);audio.playEffect(transition.comboCount?'merge':'place',transition.createdValue??2);
  if(transition.comboCount>=3)audio.playEffect('combo');
  if(transition.outcome==='won')return finish('won');
  if(canFail(save.currentGame,save.profile))return finish('lost');
  renderGame();
}
function openLucky(){
  const host=$('luckyChoices');host.replaceChildren(...VALUES.map(value=>{const button=document.createElement('button');button.type='button';button.textContent=value;button.addEventListener('click',()=>{save.currentGame=chooseLuckyValue(save.currentGame,value);$('luckyDialog').close();renderGame()});return button}));$('luckyDialog').showModal();
}
function placeInColumn(column){
  try{afterTransition(placePendingCard(save.currentGame,column))}catch(error){message('不能放这里',error.message)}
}

$('startButton').addEventListener('click',()=>{audio.unlock();if(!save.currentGame||save.currentGame.status!=='playing')save.currentGame=createGame();renderGame()});
$('drawButton').addEventListener('click',()=>{audio.unlock();save.currentGame=drawCard(save.currentGame);audio.playEffect('draw');renderGame();if(save.currentGame.pendingCard?.kind==='lucky')openLucky()});
document.querySelectorAll('.pile-button').forEach(button=>button.addEventListener('click',()=>{
  const column=Number(button.dataset.column);
  if(toolMode==='bomb'){
    if(!save.profile.bombs)return message('没有炸弹','可以返回主页，在商店用50金币购买。');
    if(!save.currentGame.columns[column].length)return message('这一列是空的','请选择有数字牌的一列。');
    save.profile.bombs--;toolMode=null;const transition=useBomb(save.currentGame,column);audio.playEffect('bomb');return afterTransition(transition);
  }
  placeInColumn(column);
}));
let drag=null;
const pendingNode=$('pendingCard');
const clearDrag=()=>{drag=null;pendingNode.classList.remove('dragging');pendingNode.style.removeProperty('transform');document.querySelectorAll('.pile-button').forEach(node=>node.classList.remove('drag-over'))};
const dragColumnAt=(x,y)=>{
  const buttons=[...document.querySelectorAll('.pile-button')],index=columnIndexAtPoint(buttons.map(button=>button.getBoundingClientRect()),x,y);
  return index>=0&&!buttons[index].disabled?index:-1;
};
pendingNode.addEventListener('pointerdown',event=>{
  if(save.currentGame?.pendingCard?.kind!=='number')return;
  drag={pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,lastX:event.clientX,lastY:event.clientY,moved:false};pendingNode.setPointerCapture(event.pointerId);pendingNode.classList.add('dragging');event.preventDefault();
});
pendingNode.addEventListener('pointermove',event=>{
  if(!drag||drag.pointerId!==event.pointerId)return;
  drag.lastX=event.clientX;drag.lastY=event.clientY;const dx=event.clientX-drag.startX,dy=event.clientY-drag.startY;drag.moved ||= Math.hypot(dx,dy)>8;pendingNode.style.transform=`translate(${dx}px,${dy}px) scale(1.08)`;
  const targetIndex=dragColumnAt(drag.lastX,drag.lastY);document.querySelectorAll('.pile-button').forEach((node,index)=>node.classList.toggle('drag-over',index===targetIndex));event.preventDefault();
});
const finishDrag=event=>{
  if(!drag||drag.pointerId!==event.pointerId)return;
  const targetIndex=dragColumnAt(drag.lastX,drag.lastY),moved=drag.moved;clearDrag();if(moved&&targetIndex>=0)placeInColumn(targetIndex);event.preventDefault();
};
addEventListener('pointerup',finishDrag);
addEventListener('pointercancel',event=>{if(drag?.pointerId===event.pointerId)clearDrag()});
$('bombButton').addEventListener('click',()=>{if(!save.profile.bombs)return message('没有炸弹','返回主页可用50金币购买炸弹。');toolMode=toolMode==='bomb'?null:'bomb';renderGame()});
$('candleButton').addEventListener('click',()=>{if(!save.profile.candles)return message('没有蜡烛','返回主页可用60金币购买蜡烛。');try{save.profile.candles--;const transition=useCandle(save.currentGame);audio.playEffect('candle');afterTransition(transition)}catch(error){save.profile.candles++;message('暂时不能使用',error.message)}});
$('shopBomb').addEventListener('click',()=>{try{save.profile=buyItem(save.profile,'bomb');audio.playEffect('place');renderHome()}catch(error){message('购买失败',error.message)}});
$('shopCandle').addEventListener('click',()=>{try{save.profile=buyItem(save.profile,'candle');audio.playEffect('place');renderHome()}catch(error){message('购买失败',error.message)}});
$('exitButton').addEventListener('click',()=>{profileFromRound();toolMode=null;renderHome()});
$('musicButton').addEventListener('click',async()=>{save.profile.musicOn=!save.profile.musicOn;if(save.profile.musicOn)await audio.unlock();audio.setEnabled(save.profile.musicOn);renderGame()});
$('againButton').addEventListener('click',()=>{save.currentGame=createGame();renderGame()});
$('resultHomeButton').addEventListener('click',()=>{save.currentGame=null;renderHome()});
addEventListener('pagehide',persist);
audio.setEnabled(save.profile.musicOn);
renderHome();
