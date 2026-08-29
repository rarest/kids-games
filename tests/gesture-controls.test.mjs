import test from 'node:test';
import assert from 'node:assert/strict';
import { createGestureTracker, directionForGesture } from '../maze/gesture-controls.js';

test('gesture direction ignores short motion and follows the dominant axis',()=>{
  assert.equal(directionForGesture(27,0,28),null);
  assert.equal(directionForGesture(36,12,28),'right');
  assert.equal(directionForGesture(-38,14,28),'left');
  assert.equal(directionForGesture(10,-35,28),'up');
  assert.equal(directionForGesture(-12,34,28),'down');
});

test('one held pointer can walk continuously without accepting a second finger',()=>{
  const tracker=createGestureTracker({threshold:28,minInterval:90});
  assert.equal(tracker.start({pointerId:1,x:100,y:100,time:0,isPrimary:true,button:0}),true);
  assert.equal(tracker.start({pointerId:2,x:120,y:100,time:10,isPrimary:false,button:0}),false);
  assert.equal(tracker.move({pointerId:1,x:127,y:102,time:100}),null);
  assert.equal(tracker.move({pointerId:1,x:130,y:103,time:100}),'right');
  assert.equal(tracker.move({pointerId:1,x:160,y:104,time:150}),null);
  assert.equal(tracker.move({pointerId:1,x:160,y:104,time:200}),'right');
  tracker.end(1);
  assert.equal(tracker.move({pointerId:1,x:200,y:104,time:300}),null);
});

test('mouse, pen and touch primary pointers share the same tracker contract',()=>{
  for(const pointerType of ['mouse','pen','touch']){
    const tracker=createGestureTracker({threshold:28,minInterval:0});
    assert.equal(tracker.start({pointerId:7,x:80,y:80,time:0,isPrimary:true,button:0,pointerType}),true);
    assert.equal(tracker.move({pointerId:7,x:80,y:45,time:1}),'up');
    tracker.cancel();
  }
});
