export function createFrameScheduler({
  mobile=false,draw,
  requestFrame=callback=>requestAnimationFrame(callback),
  cancelFrame=id=>cancelAnimationFrame(id),
  setTimer=(callback,delay)=>setTimeout(callback,delay),
  clearTimer=id=>clearTimeout(id),
  now=()=>performance.now()
}={}){
  if(typeof draw!=='function')throw new TypeError('draw callback is required');
  const targetFps=mobile?30:60,idleFps=mobile?12:30,targetInterval=1000/targetFps,idleInterval=1000/idleFps;
  let running=false,active=true,dirty=true,frameId=0,timerId=0,lastDrawAt=-Infinity,scheduledFrames=0,drawnFrames=0;

  function requestNextFrame(){
    if(!running||!active||frameId)return;
    scheduledFrames+=1;frameId=requestFrame(onFrame);
  }
  function schedule(delay=0){
    if(!running||!active||frameId||timerId)return;
    if(delay>1)timerId=setTimer(()=>{timerId=0;requestNextFrame()},delay);
    else requestNextFrame();
  }
  function clearScheduled(){
    if(frameId)cancelFrame(frameId);frameId=0;
    if(timerId)clearTimer(timerId);timerId=0;
  }
  function delayUntil(interval,current=now()){
    if(!Number.isFinite(lastDrawAt))return 0;
    return Math.max(0,interval-(current-lastDrawAt));
  }

  function onFrame(timestamp){
    frameId=0;
    if(!running||!active)return;
    const elapsed=timestamp-lastDrawAt,canDraw=!Number.isFinite(lastDrawAt)||elapsed+.5>=targetInterval;
    if((dirty&&canDraw)||(!dirty&&elapsed+.5>=idleInterval)){
      draw(timestamp);drawnFrames+=1;lastDrawAt=timestamp;dirty=false;
    }
    schedule(delayUntil(dirty?targetInterval:idleInterval,timestamp));
  }

  function start(){if(running)return;running=true;dirty=true;lastDrawAt=-Infinity;schedule()}
  function stop(){running=false;clearScheduled()}
  function invalidate(){
    dirty=true;
    if(timerId){clearTimer(timerId);timerId=0}
    schedule(delayUntil(targetInterval));
  }
  function setActive(value){
    const next=Boolean(value);if(next===active)return;
    active=next;
    if(!active){clearScheduled();return}
    dirty=true;lastDrawAt=-Infinity;schedule();
  }

  return{
    start,stop,invalidate,setActive,
    get diagnostics(){return{targetFps,idleFps,scheduledFrames,drawnFrames,active,running}}
  };
}
