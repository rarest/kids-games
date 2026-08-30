import {createGame,drawCard,placePendingCard,buyItem,useBomb,useCandle,canFail,settleGame,useLuckyCopy,useLuckyRemove,useLuckyUpgrade,consumeReroll} from './game-core.js?v=20260830i';
import {loadSave,saveGame} from './save.js?v=20260830i';
import {createAudioController} from './audio.js?v=20260830i';
import {columnIndexAtPoint,columnIndexForDrop} from './drag.js?v=20260830i';
import {getDifficulty} from './difficulty.js?v=20260830i';

const $=id=>document.getElementById(id);
const screens={home:$('homeScreen'),game:$('gameScreen'),result:$('resultScreen')};
const audio=createAudioController();
let save=loadSave(),toolMode=null,comboTimer=null,autoDrawTimer=null,autoPaused=false;

function persist(){saveGame(globalThis.localStorage,save)}
function show(screen){for(const [name,node] of Object.entries(screens))node.hidden=name!==screen;document.body.dataset.screen=screen}
function cancelAutoDraw(){clearTimeout(autoDrawTimer);autoDrawTimer=null}
function message(title,text){$('messageTitle').textContent=title;$('messageText').textContent=text;$('messageDialog').showModal()}
function tileLevel(value){return Math.log2(value)}
function profileFromRound(){const game=save.currentGame;if(!game)return;const id=game.difficulty??'joy',record=save.profile.records[id];record.best=Math.max(record.best,game.roundMax);save.profile.best=Math.max(save.profile.best,game.roundMax);save.profile.lastResult=game.roundMax}
function renderHome(){
  const id=save.currentGame?.difficulty??save.profile.selectedDifficulty,record=save.profile.records[id];
  $('coinCount').textContent=save.profile.coins;$('bestValue').textContent=record.best;$('lastResult').textContent=save.profile.lastResult;$('winCount').textContent=record.wins;
  $('startButton').textContent=save.currentGame?.status==='playing'?'继续游戏':'开始游戏';$('restartButton').hidden=save.currentGame?.status!=='playing';show('home');persist();
}
function renderGame(){
  const game=save.currentGame;if(!game)return renderHome();
  $('gameBest').textContent=Math.max(save.profile.records[game.difficulty??'joy'].best,game.roundMax);$('drawCount').textContent=game.drawIndex;$('bombCount').textContent=save.profile.bombs;$('candleCount').textContent=save.profile.candles;$('rerollCount').textContent=game.rerolls??0;$('temporaryBombCount').textContent=game.temporaryBombs??0;
  const pending=game.pendingCard;$('drawButton').hidden=Boolean(pending);$('pendingCard').hidden=!pending;
  if(pending){$('pendingCard').textContent=pending.kind==='lucky'?'✨':pending.value;$('pendingCard').dataset.lucky=String(pending.kind==='lucky')}
  $('drawButton').disabled=Boolean(pending)||game.status!=='playing';
  document.querySelectorAll('.pile-button').forEach((button,index)=>{
    const pile=button.querySelector('.pile');pile.replaceChildren(...game.columns[index].map(value=>{const tile=document.createElement('span');tile.className='tile';tile.dataset.level=String(tileLevel(value));tile.textContent=value;return tile}));
    const columnTool=toolMode==='bomb'||toolMode==='lucky-copy'||toolMode==='lucky-remove';
    button.disabled=columnTool?!game.columns[index].length:(!pending||pending.kind==='lucky'||game.columns[index].length>=12);button.classList.toggle('tool-target',columnTool);
  });
  document.querySelectorAll('.pile-button').forEach((button,index)=>{const value=game.columns[index].at(-1),left=game.columns[index-1]?.at(-1),right=game.columns[index+1]?.at(-1);button.classList.toggle('merge-ready',Boolean(value&&(value===left||value===right)))})
  $('bombButton').classList.toggle('selected',toolMode==='bomb');$('musicButton').setAttribute('aria-pressed',String(save.profile.musicOn));$('musicButton').textContent=save.profile.musicOn?'♫':'♩';
  $('autoPauseButton').textContent=autoPaused?'▶ 继续自动抽牌':'⏸ 暂停自动抽牌';$('autoPauseButton').setAttribute('aria-pressed',String(autoPaused));
  show('game');persist();
}
function drawNext(){
  cancelAutoDraw();const game=save.currentGame;if(!game||game.status!=='playing'||game.pendingCard||document.body.dataset.screen!=='game')return;
  save.currentGame=drawCard(game);audio.playEffect('draw');if(canFail(save.currentGame,save.profile))return finish('lost');renderGame();if(save.currentGame.pendingCard?.kind==='lucky')openLucky();
}
function scheduleAutoDraw(){
  cancelAutoDraw();const game=save.currentGame;if(autoPaused||!game||game.status!=='playing'||game.pendingCard||document.body.dataset.screen!=='game')return;
  autoDrawTimer=setTimeout(drawNext,0);
}
function comboEffect(count){
  if(count<3)return;const names=['零','一','二','三','四','五','六','七','八','九','十'],reward=count>=6?' +20金币':'';$('comboBanner').textContent=`${names[count]??count}连合成！${reward}`;$('comboBanner').hidden=false;$('fireworks').classList.add('active');clearTimeout(comboTimer);comboTimer=setTimeout(()=>{$('comboBanner').hidden=true;$('fireworks').classList.remove('active')},1000);
}
function finish(outcome){
  cancelAutoDraw();
  const settled=settleGame(save.currentGame,save.profile,outcome);save.currentGame=settled.state;save.profile=settled.profile;persist();
  const won=outcome==='won',difficulty=getDifficulty(settled.state.difficulty);$('resultTitle').textContent=won?'成功通关！':'本局结束';$('resultMessage').textContent=won?`合成4096，奖励${difficulty.winReward}金币`:`牌堆已满，奖励${difficulty.lossReward}金币`;$('resultValue').textContent=settled.state.roundMax;audio.playEffect(won?'win':'lose');show('result');
}
function afterTransition(transition){
  save.currentGame=transition.state;const record=save.profile.records[transition.state.difficulty??'joy'];record.best=Math.max(record.best,transition.state.roundMax);save.profile.best=Math.max(save.profile.best,transition.state.roundMax);comboEffect(transition.comboCount);audio.playEffect(transition.comboCount?'merge':'place',transition.createdValue??2);
  if(transition.comboCount>=3)audio.playEffect('combo');
  if(transition.outcome==='won')return finish('won');
  if(canFail(save.currentGame,save.profile))return finish('lost');
  renderGame();scheduleAutoDraw();
}
function openLucky(){const hasCards=save.currentGame.columns.some(column=>column.length);$('luckyCopy').disabled=!hasCards;$('luckyRemove').disabled=!hasCards;$('luckyDialog').showModal()}
function placeInColumn(column){
  try{afterTransition(placePendingCard(save.currentGame,column))}catch(error){message('不能放这里',error.message)}
}

$('startButton').addEventListener('click',()=>{audio.unlock();if(save.currentGame?.status==='playing'){renderGame();scheduleAutoDraw()}else $('difficultyDialog').showModal()});
$('easyMode').addEventListener('click',()=>startMode('easy'));$('joyMode').addEventListener('click',()=>startMode('joy'));$('challengeMode').addEventListener('click',()=>startMode('challenge'));
function startMode(mode){save.profile.selectedDifficulty=mode;save.currentGame=createGame(mode);autoPaused=false;$('difficultyDialog').close();renderGame();scheduleAutoDraw()}
$('restartButton').addEventListener('click',()=>{if(confirm('重新开始会放弃当前这一局，确定吗？')){$('difficultyDialog').showModal()}});
$('drawButton').addEventListener('click',()=>{audio.unlock();drawNext()});
document.querySelectorAll('.pile-button').forEach(button=>button.addEventListener('click',()=>{
  const column=Number(button.dataset.column);
  if(toolMode==='lucky-copy'){try{save.currentGame=useLuckyCopy(save.currentGame,column);toolMode=null;return renderGame()}catch(error){return message('不能复制',error.message)}}
  if(toolMode==='lucky-remove'){try{toolMode=null;return afterTransition(useLuckyRemove(save.currentGame,column))}catch(error){return message('不能移除',error.message)}}
  if(toolMode==='bomb'){
    if(!save.profile.bombs&&!save.currentGame.temporaryBombs)return message('没有炸弹','可以返回主页，在商店用50金币购买。');
    if(!save.currentGame.columns[column].length)return message('这一列是空的','请选择有数字牌的一列。');
    if(!save.currentGame.temporaryBombs)save.profile.bombs--;toolMode=null;const transition=useBomb(save.currentGame,column);audio.playEffect('bomb');return afterTransition(transition);
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
const dragColumnForDrop=(event)=>{
  const buttons=[...document.querySelectorAll('.pile-button')],index=columnIndexForDrop(buttons.map(button=>button.getBoundingClientRect()),{x:event.clientX,y:event.clientY},{x:drag.lastX,y:drag.lastY});
  return index>=0&&!buttons[index].disabled?index:-1;
};
pendingNode.addEventListener('pointerdown',event=>{
  if(save.currentGame?.pendingCard?.kind!=='number')return;
  drag={pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,lastX:event.clientX,lastY:event.clientY,moved:false};pendingNode.setPointerCapture(event.pointerId);pendingNode.classList.add('dragging');event.preventDefault();
});
pendingNode.addEventListener('click',()=>{if(save.currentGame?.pendingCard?.kind==='lucky'&&!$('luckyDialog').open)openLucky()});
pendingNode.addEventListener('pointermove',event=>{
  if(!drag||drag.pointerId!==event.pointerId)return;
  drag.lastX=event.clientX;drag.lastY=event.clientY;const dx=event.clientX-drag.startX,dy=event.clientY-drag.startY;drag.moved ||= Math.hypot(dx,dy)>8;pendingNode.style.transform=`translate(${dx}px,${dy}px) scale(1.08)`;
  const targetIndex=dragColumnAt(drag.lastX,drag.lastY);document.querySelectorAll('.pile-button').forEach((node,index)=>node.classList.toggle('drag-over',index===targetIndex));event.preventDefault();
});
const finishDrag=event=>{
  if(!drag||drag.pointerId!==event.pointerId)return;
  const targetIndex=dragColumnForDrop(event),moved=drag.moved;clearDrag();if(moved&&targetIndex>=0)placeInColumn(targetIndex);event.preventDefault();
};
addEventListener('pointerup',finishDrag);
addEventListener('pointercancel',event=>{if(drag?.pointerId===event.pointerId)clearDrag()});
$('luckyCopy').addEventListener('click',()=>{$('luckyDialog').close();toolMode='lucky-copy';renderGame()});
$('luckyRemove').addEventListener('click',()=>{$('luckyDialog').close();toolMode='lucky-remove';renderGame()});
$('luckyUpgrade').addEventListener('click',()=>{save.currentGame=useLuckyUpgrade(save.currentGame);$('luckyDialog').close();renderGame()});
$('autoPauseButton').addEventListener('click',()=>{autoPaused=!autoPaused;if(autoPaused)cancelAutoDraw();renderGame();if(!autoPaused)scheduleAutoDraw()});
$('rerollButton').addEventListener('click',()=>{try{save.currentGame=consumeReroll(save.currentGame);audio.playEffect('draw');renderGame()}catch(error){message('不能重抽',error.message)}});
$('bombButton').addEventListener('click',()=>{if(!save.profile.bombs&&!save.currentGame.temporaryBombs)return message('没有炸弹','返回主页可用50金币购买炸弹。');toolMode=toolMode==='bomb'?null:'bomb';renderGame()});
$('candleButton').addEventListener('click',()=>{if(!save.profile.candles)return message('没有蜡烛','返回主页可用60金币购买蜡烛。');try{save.profile.candles--;const transition=useCandle(save.currentGame);audio.playEffect('candle');afterTransition(transition)}catch(error){save.profile.candles++;message('暂时不能使用',error.message)}});
$('shopBomb').addEventListener('click',()=>{try{save.profile=buyItem(save.profile,'bomb');audio.playEffect('place');renderHome()}catch(error){message('购买失败',error.message)}});
$('shopCandle').addEventListener('click',()=>{try{save.profile=buyItem(save.profile,'candle');audio.playEffect('place');renderHome()}catch(error){message('购买失败',error.message)}});
$('exitButton').addEventListener('click',()=>{cancelAutoDraw();profileFromRound();toolMode=null;renderHome()});
$('musicButton').addEventListener('click',async()=>{save.profile.musicOn=!save.profile.musicOn;if(save.profile.musicOn)await audio.unlock();audio.setEnabled(save.profile.musicOn);renderGame()});
$('againButton').addEventListener('click',()=>{$('difficultyDialog').showModal()});
$('resultHomeButton').addEventListener('click',()=>{cancelAutoDraw();save.currentGame=null;renderHome()});
addEventListener('pagehide',()=>{cancelAutoDraw();persist()});
audio.setEnabled(save.profile.musicOn);
renderHome();
