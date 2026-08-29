import test from 'node:test';
import assert from 'node:assert/strict';

let tools = null;
try { tools = await import('../maze/level-tools.js'); } catch {}

test('grid parser rejects ragged and open maps', () => {
  assert.ok(tools?.parseGrid, 'parseGrid must exist');
  assert.throws(() => tools.parseGrid(['#####', '#...#', '####']), /same width/);
  assert.throws(() => tools.parseGrid(['#####', '....#', '#####']), /boundary/);
});

test('dead ends exclude start and exit', () => {
  assert.ok(tools?.findDeadEnds, 'findDeadEnds must exist');
  const level = { rows:['#######','#....##','###.###','#....##','#######'], start:{x:1,y:1}, exit:{x:1,y:3}, keys:[], coins:[] };
  assert.deepEqual(tools.findDeadEnds(level), [{x:4,y:1},{x:4,y:3}]);
});

test('validator catches unreachable objects and duplicate coordinates', () => {
  assert.ok(tools?.validateLevel, 'validateLevel must exist');
  const level = { id:'bad', type:'normal', index:1, rows:['#######','#...#.#','#######'], start:{x:1,y:1}, exit:{x:3,y:1}, keys:[{x:5,y:1}], coins:[{x:5,y:1}] };
  assert.deepEqual(tools.validateLevel(level), ['UNREACHABLE_KEY','DUPLICATE_OBJECT']);
});

test('returns the key-complete route and measures turns instead of only distance',()=>{
  const level={
    rows:['#######','#...###','###.###','#...###','#.#####','#.....#','#######'],
    start:{x:1,y:1},exit:{x:5,y:5},keys:[{x:3,y:3}],coins:[]
  };
  const path=tools.shortestCompletionPath(level);
  // The fixture's only route has four forced detours, so its 8-step
  // Manhattan distance becomes 12 steps (the brief's 10-step expectation is
  // inconsistent with the supplied rows).
  assert.equal(path.length,12);
  assert.equal(tools.topologyMetrics(level).turns,4);
  assert.equal(tools.topologyMetrics(level).completionSteps,path.length);
});

test('scores a dense branching maze above a straight corridor',()=>{
  const corridor={rows:['#########','#.......#','#########'],start:{x:1,y:1},exit:{x:7,y:1},keys:[],coins:[]};
  const branching={rows:['#########','#.......#','###.###.#','#...#...#','#.###.###','#.......#','#########'],start:{x:1,y:1},exit:{x:7,y:5},keys:[],coins:[]};
  assert.ok(tools.complexityScore(branching)>tools.complexityScore(corridor));
});

test('preserves an unreachable path sentinel and infinite completion steps',()=>{
  const unreachable={rows:['#######','#.#...#','#######'],start:{x:1,y:1},exit:{x:5,y:1},keys:[],coins:[]};
  assert.equal(tools.shortestCompletionPath(unreachable),null);
  assert.equal(tools.shortestCompletionSteps(unreachable),Infinity);
});
