export function directionForGesture(dx,dy,threshold=28){
  const horizontal=Math.abs(dx),vertical=Math.abs(dy);
  if(Math.max(horizontal,vertical)<threshold)return null;
  if(horizontal>=vertical)return dx<0?'left':'right';
  return dy<0?'up':'down';
}

export function createGestureTracker({threshold=28,minInterval=90}={}){
  let active=null;
  return {
    start({pointerId,x,y,time=0,isPrimary=true,button=0}){
      if(active||!isPrimary||button!==0)return false;
      active={pointerId,x,y,lastTime:time-minInterval};return true;
    },
    move({pointerId,x,y,time=0}){
      if(!active||active.pointerId!==pointerId)return null;
      const direction=directionForGesture(x-active.x,y-active.y,threshold);
      if(!direction||time-active.lastTime<minInterval)return null;
      active.x=x;active.y=y;active.lastTime=time;return direction;
    },
    end(pointerId){if(active?.pointerId===pointerId)active=null},
    cancel(){active=null}
  };
}
