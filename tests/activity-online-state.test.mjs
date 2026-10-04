import test from 'node:test';
import assert from 'node:assert/strict';
import {RacingClient} from '../racing/online.js';
import {connectTeam} from '../shooter/online.js';

test('racing and shooter stop activity on closed or stale authority and require a new state after reconnect', () => {
  const savedWS = globalThis.WebSocket, savedClock = performance.now, savedLocation = globalThis.location;
  let now = 100, socket;
  class Socket { static OPEN = 1; readyState = 1; constructor() {socket = this;} send() {} close() {this.readyState = 3;} }
  globalThis.location = new URL('https://games.test/games/racing.html'); globalThis.WebSocket = Socket; performance.now = () => now;
  try {
    const race = new RacingClient({onState(){}, onJoined(){}, onStatus(){}, onError(){}, onLeave(){}});
    race.connect({type:'create'});
    assert.equal(race.hasLiveState, false, 'open transport without authority is not actual play');
    socket.onmessage({data:JSON.stringify({type:'state',room:{mode:'racing',run:1}})});
    assert.equal(race.hasLiveState, true);
    now += 2100; assert.equal(race.hasLiveState, false, 'frozen race stops counting');
    socket.onmessage({data:JSON.stringify({type:'state',room:{mode:'racing',run:1}})});
    assert.equal(race.hasLiveState, true);
    socket.readyState = 3; socket.onclose(); assert.equal(race.hasLiveState, false);
    race.connect({type:'join'}); assert.equal(race.hasLiveState, false, 'old snapshot cannot count on reopened socket');
    race.leave();
    const team = connectTeam({endpoint:'ws://test',onState(){},onStatus(){},onJoined(){},onLeft(){}});
    team.join({type:'create'}); socket.onopen(); assert.equal(team.hasLiveState, false);
    socket.onmessage({data:JSON.stringify({type:'state'})}); assert.equal(team.hasLiveState, true);
    now += 2100; assert.equal(team.hasLiveState, false);
    team.close(); assert.equal(team.hasLiveState, false);
  } finally {globalThis.location = savedLocation; globalThis.WebSocket = savedWS; performance.now = savedClock;}
});
