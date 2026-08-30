import test from 'node:test';
import assert from 'node:assert/strict';

let joystickModule;
try{joystickModule=await import('../maze/joystick-controls.js')}catch{}

function fakeTimers(){
  const timers=new Map(),delays=[];let id=0,time=0;
  return{
    set(callback,delay){const token=++id;timers.set(token,{callback,due:time+delay});delays.push(delay);return token},
    clear(token){timers.delete(token)},
    fire(){for(const [token,timer] of [...timers]){timers.delete(token);time=timer.due;timer.callback()}},
    advance(ms){
      const target=time+ms;
      while(true){
        const next=[...timers].sort((a,b)=>a[1].due-b[1].due)[0];
        if(!next||next[1].due>target)break;
        const[token,timer]=next;timers.delete(token);time=timer.due;timer.callback();
      }
      time=target;
    },
    now(){return time},
    get count(){return timers.size},get delays(){return[...delays]}
  };
}

test('joystick dead zone ignores the center and dominant axis chooses four directions',()=>{
  assert.ok(joystickModule,'maze/joystick-controls.js should exist');
  const direction=joystickModule.directionForJoystick;
  assert.equal(direction(8,8,12),null);
  assert.equal(direction(28,7,12),'right');
  assert.equal(direction(-28,7,12),'left');
  assert.equal(direction(5,-30,12),'up');
  assert.equal(direction(5,30,12),'down');
});

test('normalized joystick intent preserves a perpendicular turn while hysteresis stabilizes the primary axis',()=>{
  assert.ok(joystickModule?.joystickIntentForVector,'joystickIntentForVector should preserve both axes');
  const intent=joystickModule.joystickIntentForVector;
  assert.equal(intent(5,5,{radius:50}),null,'normalized center remains a dead zone');
  assert.deepEqual(intent(34,-25,{radius:50}),{primary:'right',secondary:'up'});
  assert.deepEqual(intent(29,-31,{radius:50,previousPrimary:'right'}),{primary:'right',secondary:'up'},'small diagonal jitter keeps the previous primary');
  assert.deepEqual(intent(16,-40,{radius:50,previousPrimary:'right'}),{primary:'up',secondary:'right'},'a decisive axis change still turns immediately');
});

test('adding a secondary turn updates the next tick without injecting an extra forward step',()=>{
  assert.ok(joystickModule?.createJoystickController);
  const timers=fakeTimers(),inputs=[];
  const joystick=joystickModule.createJoystickController({
    onDirection:(direction,intent)=>inputs.push({direction,intent}),
    setTimer:(callback,delay)=>timers.set(callback,delay),clearTimer:token=>timers.clear(token)
  });
  joystick.start({pointerId:1,dx:0,dy:-34,radius:50,isPrimary:true,button:0});
  joystick.move({pointerId:1,dx:-25,dy:-34,radius:50});
  assert.deepEqual(inputs,[{direction:'up',intent:{primary:'up',secondary:null}}],'changing only the secondary axis does not move early');
  timers.fire();
  assert.deepEqual(inputs,[
    {direction:'up',intent:{primary:'up',secondary:null}},
    {direction:'up',intent:{primary:'up',secondary:'left'}}
  ]);
  joystick.end(1);
});

test('joystick emits one precise step before delayed continuous movement and stops on release',()=>{
  assert.ok(joystickModule);
  const timers=fakeTimers(),directions=[];
  const joystick=joystickModule.createJoystickController({onDirection:value=>directions.push(value),initialRepeatDelayMs:240,repeatMs:165,acceleratedRepeatMs:125,accelerationAfterMs:1000,now:()=>timers.now(),setTimer:(callback,delay)=>timers.set(callback,delay),clearTimer:token=>timers.clear(token)});
  assert.equal(joystick.start({pointerId:1,dx:30,dy:2,isPrimary:true,button:0}),true);
  assert.deepEqual(directions,['right']);
  assert.equal(timers.count,1);
  assert.deepEqual(timers.delays,[240]);
  timers.advance(239);
  assert.deepEqual(directions,['right'],'a quick touch remains exactly one step');
  timers.advance(1);
  assert.deepEqual(directions,['right','right']);
  assert.equal(timers.delays.at(-1),165,'continuous movement begins at the precise pace');
  joystick.end(1);timers.advance(500);
  assert.deepEqual(directions,['right','right']);
  assert.deepEqual(joystick.state,{active:false,direction:null,dx:0,dy:0});
});

test('a long hold accelerates once while a changed direction restarts the precise phase',()=>{
  assert.ok(joystickModule);
  const timers=fakeTimers(),directions=[];
  const joystick=joystickModule.createJoystickController({onDirection:value=>directions.push(value),initialRepeatDelayMs:240,repeatMs:165,acceleratedRepeatMs:125,accelerationAfterMs:1000,now:()=>timers.now(),setTimer:(callback,delay)=>timers.set(callback,delay),clearTimer:token=>timers.clear(token)});
  joystick.start({pointerId:1,dx:30,dy:0,radius:50,isPrimary:true,button:0});
  timers.advance(1100);
  assert.equal(timers.delays.at(-1),125,'the repeat interval accelerates after one second');
  const beforeTurn=directions.length;
  joystick.move({pointerId:1,dx:0,dy:-30,radius:50});
  assert.equal(directions.length,beforeTurn+1,'a deliberate direction change responds immediately');
  assert.equal(directions.at(-1),'up');
  assert.equal(timers.delays.at(-1),240,'the new direction restores the single-step release window');
  timers.advance(239);
  assert.equal(directions.length,beforeTurn+1,'the changed direction cannot overshoot during its release window');
});

test('center, cancellation, second pointer and one-shot tools never leave repeat movement',()=>{
  assert.ok(joystickModule);
  const timers=fakeTimers(),directions=[];
  const joystick=joystickModule.createJoystickController({onDirection:value=>directions.push(value),setTimer:(callback,delay)=>timers.set(callback,delay),clearTimer:token=>timers.clear(token)});
  assert.equal(joystick.start({pointerId:1,dx:0,dy:0,isPrimary:true,button:0}),true);
  joystick.move({pointerId:1,dx:0,dy:-30,repeat:false});
  assert.deepEqual(directions,['up']);assert.equal(timers.count,0,'tool direction is one-shot');
  joystick.move({pointerId:1,dx:30,dy:0});
  assert.deepEqual(directions,['up'],'rotating the same tool gesture cannot submit a second direction or become movement');
  assert.equal(joystick.start({pointerId:2,dx:30,dy:0,isPrimary:false,button:0}),false);
  assert.equal(joystick.state.active,false,'second pointer cancels the first interaction');
  assert.equal(joystick.start({pointerId:3,dx:30,dy:0,isPrimary:true,button:0}),true);
  joystick.move({pointerId:3,dx:4,dy:3});
  assert.equal(joystick.state.direction,null);assert.equal(timers.count,0,'entering the dead zone stops repeat');
  joystick.cancel();
  assert.deepEqual(joystick.state,{active:false,direction:null,dx:0,dy:0});
});
