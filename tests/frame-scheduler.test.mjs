import test from 'node:test';
import assert from 'node:assert/strict';

let schedulerModule;
try{schedulerModule=await import('../maze/frame-scheduler.js')}catch{}

function fakeFrames(){
  const queue=[],timers=new Map();let clock=0,timerId=0;
  return{
    request(callback){queue.push(callback);return queue.length},
    cancel(){},
    setTimer(callback,delay){const id=++timerId;timers.set(id,{callback,due:clock+delay});return id},
    clearTimer(id){timers.delete(id)},
    tick(time){clock=time;for(const [id,timer] of [...timers])if(timer.due<=time){timers.delete(id);timer.callback()}const callbacks=queue.splice(0);for(const callback of callbacks)callback(time)},
    now(){return clock},
    get pending(){return queue.length}
  };
}

test('mobile scheduler idles at 12 fps, caps at 30 fps and invalidation draws promptly',()=>{
  assert.ok(schedulerModule,'maze/frame-scheduler.js should exist');
  const frames=fakeFrames(),draws=[];
  const scheduler=schedulerModule.createFrameScheduler({mobile:true,requestFrame:callback=>frames.request(callback),cancelFrame:()=>{},setTimer:(callback,delay)=>frames.setTimer(callback,delay),clearTimer:id=>frames.clearTimer(id),now:()=>frames.now(),draw:time=>draws.push(time)});
  scheduler.start();
  for(let time=0;time<=1000;time+=10)frames.tick(time);
  assert.ok(draws.length>=11&&draws.length<=13,`draws=${draws.length}`);
  const before=draws.length;scheduler.invalidate();frames.tick(1040);
  assert.equal(draws.length,before+1,'dirty input is drawn within the 30 fps cadence gate');
  assert.equal(scheduler.diagnostics.targetFps,30);
  assert.equal(scheduler.diagnostics.idleFps,12);
});

test('sustained mobile invalidation remains capped at thirty draws per second',()=>{
  assert.ok(schedulerModule);
  const frames=fakeFrames(),draws=[];
  const scheduler=schedulerModule.createFrameScheduler({mobile:true,requestFrame:callback=>frames.request(callback),cancelFrame:()=>{},setTimer:(callback,delay)=>frames.setTimer(callback,delay),clearTimer:id=>frames.clearTimer(id),now:()=>frames.now(),draw:time=>draws.push(time)});
  scheduler.start();
  for(let time=0;time<=1000;time+=5){scheduler.invalidate();frames.tick(time)}
  assert.ok(draws.length>=28&&draws.length<=31,`draws=${draws.length}`);
  assert.ok(draws.slice(1).every((time,index)=>time-draws[index]>=30),`draw times=${draws.join(',')}`);
  assert.ok(scheduler.diagnostics.scheduledFrames<=draws.length+2,'idle cadence uses timers instead of continuous animation frames');
});

test('scheduler stops requesting frames when the game is not active',()=>{
  assert.ok(schedulerModule);
  const frames=fakeFrames(),draws=[];
  const scheduler=schedulerModule.createFrameScheduler({mobile:false,requestFrame:callback=>frames.request(callback),cancelFrame:()=>{},setTimer:(callback,delay)=>frames.setTimer(callback,delay),clearTimer:id=>frames.clearTimer(id),now:()=>frames.now(),draw:time=>draws.push(time)});
  scheduler.start();frames.tick(0);scheduler.setActive(false);
  const count=draws.length;
  for(let time=16;time<160;time+=16)frames.tick(time);
  assert.equal(draws.length,count);
  assert.equal(frames.pending,0);
  scheduler.setActive(true);frames.tick(160);
  assert.equal(draws.length,count+1);
  assert.equal(scheduler.diagnostics.targetFps,60);
  assert.equal(scheduler.diagnostics.idleFps,30);
});
