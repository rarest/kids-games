export function createFrameScheduler({
  mobile=false,draw,
  requestFrame=callback=>requestAnimationFrame(callback),
  cancelFrame=id=>cancelAnimationFrame(id)
}={}){
  if(typeof draw!=='function')throw new TypeError('draw callback is required');
  const targetFps=mobile?30:60,idleFps=mobile?12:30,interval=1000/idleFps;
  let running=false,active=true,dirty=true,frameId=0,nextDrawAt=0,scheduledFrames=0,drawnFrames=0;

  function schedule(){
    if(!running||!active||frameId)return;
    scheduledFrames+=1;frameId=requestFrame(onFrame);
  }

  function onFrame(timestamp){
    frameId=0;
    if(!running||!active)return;
    if(dirty||timestamp+0.5>=nextDrawAt){
      draw(timestamp);drawnFrames+=1;
      if(dirty||!Number.isFinite(nextDrawAt)||nextDrawAt<=0)nextDrawAt=timestamp+interval;
      else while(nextDrawAt<=timestamp+0.5)nextDrawAt+=interval;
      dirty=false;
    }
    schedule();
  }

  function start(){running=true;dirty=true;nextDrawAt=0;schedule()}
  function stop(){running=false;if(frameId)cancelFrame(frameId);frameId=0}
  function invalidate(){dirty=true;schedule()}
  function setActive(value){
    const next=Boolean(value);if(next===active)return;
    active=next;
    if(!active){if(frameId)cancelFrame(frameId);frameId=0;return}
    dirty=true;nextDrawAt=0;schedule();
  }

  return{
    start,stop,invalidate,setActive,
    get diagnostics(){return{targetFps,idleFps,scheduledFrames,drawnFrames,active,running}}
  };
}
