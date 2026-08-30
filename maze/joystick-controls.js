export function directionForJoystick(dx,dy,deadZone=12){
  if(Math.hypot(dx,dy)<deadZone)return null;
  return Math.abs(dx)>=Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');
}

const HORIZONTAL=new Set(['left','right']);
const directionOnAxis=(value,negative,positive)=>value<0?negative:positive;

export function joystickIntentForVector(dx,dy,{
  radius=50,deadZone,deadZoneRatio=.22,secondaryAxisRatio=.28,
  previousPrimary=null,hysteresis=.18
}={}){
  const safeRadius=Number.isFinite(radius)&&radius>0?radius:50;
  const x=Number.isFinite(dx)?dx:0,y=Number.isFinite(dy)?dy:0;
  const effectiveDeadZone=Number.isFinite(deadZone)?Math.max(0,deadZone):safeRadius*deadZoneRatio;
  if(Math.hypot(x,y)<effectiveDeadZone)return null;
  const absX=Math.abs(x),absY=Math.abs(y),horizontal=directionOnAxis(x,'left','right'),vertical=directionOnAxis(y,'up','down');
  let primary;
  if(HORIZONTAL.has(previousPrimary)&&absX>=absY*(1-hysteresis))primary=horizontal;
  else if(previousPrimary&&!HORIZONTAL.has(previousPrimary)&&absY>=absX*(1-hysteresis))primary=vertical;
  else primary=absX>=absY?horizontal:vertical;
  const secondaryThreshold=safeRadius*secondaryAxisRatio;
  const hasBoth=absX>=secondaryThreshold&&absY>=secondaryThreshold;
  return{primary,secondary:hasBoth?(HORIZONTAL.has(primary)?vertical:horizontal):null};
}

const intentKey=intent=>intent?`${intent.primary}|${intent.secondary||''}`:'';

export function createPathAwareNavigator({canMove,onDirection,turnBufferMs=400,now=()=>Date.now()}={}){
  if(typeof canMove!=='function')throw new TypeError('canMove callback is required');
  if(typeof onDirection!=='function')throw new TypeError('onDirection callback is required');
  let heading=null,bufferedTurn=null,activePair=null,consumedPair=null;

  const reset=()=>{heading=null;bufferedTurn=null;activePair=null;consumedPair=null};
  const perform=direction=>{
    const outcome=onDirection(direction),moved=typeof outcome==='object'?outcome?.moved!==false:outcome!==false;
    if(moved)heading=direction;
    return{direction,moved};
  };
  const dispatch=direction=>perform(direction).direction;
  const pairKey=intent=>`${intent.primary}|${intent.secondary}`;

  function step(intent){
    if(!intent?.primary){reset();return null}
    const primary=intent.primary,secondary=intent.secondary||null;
    if(!secondary){bufferedTurn=null;activePair=null;consumedPair=null;return dispatch(primary)}

    const pair=pairKey(intent),timestamp=now(),pairChanged=pair!==activePair;
    if(pairChanged){activePair=pair;consumedPair=null;bufferedTurn=null}
    const directions=[primary,secondary],headingBefore=heading;
    if(bufferedTurn&&bufferedTurn.expiresAt<timestamp)bufferedTurn=null;

    if(!headingBefore){
      const direction=canMove(primary)?primary:canMove(secondary)?secondary:primary;
      const result=dispatch(direction);
      if(pairChanged&&heading){
        const turn=directions.find(candidate=>candidate!==heading);
        if(turn)bufferedTurn={direction:turn,expiresAt:timestamp+turnBufferMs};
      }
      return result;
    }
    if(pairChanged){
      const turn=directions.includes(headingBefore)?directions.find(direction=>direction!==headingBefore):secondary;
      if(turn&&turn!==headingBefore)bufferedTurn={direction:turn,expiresAt:timestamp+turnBufferMs};
    }
    if(bufferedTurn&&canMove(bufferedTurn.direction)){
      const direction=bufferedTurn.direction;
      const outcome=perform(direction);
      if(outcome.moved){bufferedTurn=null;consumedPair=pair}
      return outcome.direction;
    }
    if(directions.includes(headingBefore)&&canMove(headingBefore))return dispatch(headingBefore);
    if(canMove(primary))return dispatch(primary);
    if(canMove(secondary))return dispatch(secondary);
    return dispatch(primary);
  }

  return{step,reset,get state(){return{heading,bufferedTurn:bufferedTurn?.direction||null}}};
}

export function createJoystickController({
  onDirection,deadZone=null,repeatMs=100,
  setTimer=(callback,delay)=>setTimeout(callback,delay),
  clearTimer=token=>clearTimeout(token)
}={}){
  if(typeof onDirection!=='function')throw new TypeError('onDirection callback is required');
  let active=null,direction=null,intent=null,dx=0,dy=0,radius=50,timer=0,repeatEnabled=true,oneShotSubmitted=false;

  function clearRepeat(){if(timer)clearTimer(timer);timer=0}
  function emit(){
    if(!direction||!intent||(!repeatEnabled&&oneShotSubmitted))return;
    if(!repeatEnabled)oneShotSubmitted=true;
    onDirection(direction,{...intent});
  }
  function scheduleRepeat(){
    clearRepeat();
    if(!active||!direction||!repeatEnabled)return;
    timer=setTimer(()=>{timer=0;if(!active||!direction||!repeatEnabled)return;emit();scheduleRepeat()},repeatMs);
  }
  function update(nextDx,nextDy,nextRadius,repeat=true){
    dx=Number.isFinite(nextDx)?nextDx:0;dy=Number.isFinite(nextDy)?nextDy:0;
    radius=Number.isFinite(nextRadius)&&nextRadius>0?nextRadius:radius;repeatEnabled=Boolean(repeat);
    const nextIntent=joystickIntentForVector(dx,dy,{radius,deadZone,previousPrimary:direction});
    if(intentKey(nextIntent)!==intentKey(intent)){
      const previousDirection=direction;
      intent=nextIntent;direction=intent?.primary||null;
      if(direction!==previousDirection){
        clearRepeat();
        if(direction){emit();scheduleRepeat()}
      }else if(!repeatEnabled)clearRepeat();
      else if(direction&&!timer)scheduleRepeat();
    }else if(!repeatEnabled)clearRepeat();
    else if(direction&&!timer)scheduleRepeat();
    return direction;
  }
  function reset(){clearRepeat();active=null;direction=null;intent=null;dx=0;dy=0;radius=50;repeatEnabled=true;oneShotSubmitted=false}

  return{
    start({pointerId,dx:nextDx=0,dy:nextDy=0,radius:nextRadius=50,isPrimary=true,button=0,repeat=true}={}){
      if(active){if(active.pointerId!==pointerId)reset();return false}
      if(!isPrimary||button!==0)return false;
      active={pointerId};update(nextDx,nextDy,nextRadius,repeat);return true;
    },
    move({pointerId,dx:nextDx=0,dy:nextDy=0,radius:nextRadius=radius,repeat=repeatEnabled}={}){
      if(!active||active.pointerId!==pointerId)return null;
      return update(nextDx,nextDy,nextRadius,repeat);
    },
    end(pointerId){if(active?.pointerId===pointerId)reset()},
    cancel:reset,
    get intent(){return intent?{...intent}:null},
    get state(){return{active:Boolean(active),direction,dx,dy}}
  };
}
