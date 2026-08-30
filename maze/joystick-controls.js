export function directionForJoystick(dx,dy,deadZone=12){
  if(Math.hypot(dx,dy)<deadZone)return null;
  return Math.abs(dx)>=Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');
}

export function createJoystickController({
  onDirection,deadZone=12,repeatMs=100,
  setTimer=(callback,delay)=>setTimeout(callback,delay),
  clearTimer=token=>clearTimeout(token)
}={}){
  if(typeof onDirection!=='function')throw new TypeError('onDirection callback is required');
  let active=null,direction=null,dx=0,dy=0,timer=0,repeatEnabled=true;

  function clearRepeat(){if(timer)clearTimer(timer);timer=0}
  function scheduleRepeat(){
    clearRepeat();
    if(!active||!direction||!repeatEnabled)return;
    timer=setTimer(()=>{timer=0;if(!active||!direction||!repeatEnabled)return;onDirection(direction);scheduleRepeat()},repeatMs);
  }
  function update(nextDx,nextDy,repeat=true){
    dx=Number.isFinite(nextDx)?nextDx:0;dy=Number.isFinite(nextDy)?nextDy:0;repeatEnabled=Boolean(repeat);
    const nextDirection=directionForJoystick(dx,dy,deadZone);
    if(nextDirection!==direction){
      direction=nextDirection;clearRepeat();
      if(direction){onDirection(direction);scheduleRepeat()}
    }else if(!repeatEnabled)clearRepeat();
    return direction;
  }
  function reset(){clearRepeat();active=null;direction=null;dx=0;dy=0;repeatEnabled=true}

  return{
    start({pointerId,dx:nextDx=0,dy:nextDy=0,isPrimary=true,button=0,repeat=true}={}){
      if(active){if(active.pointerId!==pointerId)reset();return false}
      if(!isPrimary||button!==0)return false;
      active={pointerId};update(nextDx,nextDy,repeat);return true;
    },
    move({pointerId,dx:nextDx=0,dy:nextDy=0,repeat=repeatEnabled}={}){
      if(!active||active.pointerId!==pointerId)return null;
      return update(nextDx,nextDy,repeat);
    },
    end(pointerId){if(active?.pointerId===pointerId)reset()},
    cancel:reset,
    get state(){return{active:Boolean(active),direction,dx,dy}}
  };
}
