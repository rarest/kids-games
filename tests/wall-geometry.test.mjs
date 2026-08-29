import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGrid } from '../maze/level-tools.js';
import * as wallGeometry from '../maze/wall-geometry.js';

const {buildWallModel,visualSizesFor}=wallGeometry;
const gridFor=(points,width=4,height=4)=>({width,height,walls:new Set(points.map(([x,y])=>`${x},${y}`))});
const commandPoints=command=>{
  if(command.op==='quadraticCurveTo')return[[command.args[0],command.args[1]],[command.args[2],command.args[3]]];
  if(command.op==='moveTo'||command.op==='lineTo')return[[command.args[0],command.args[1]]];
  return[];
};

test('wall model merges surfaces and never emits internal outline edges',()=>{
  const grid=parseGrid(['#####','#####','#####']);
  const model=buildWallModel(grid,new Set());
  assert.equal(model.runs.length,3);
  assert.equal(model.lightEdges.length+model.darkEdges.length,4);
});

test('visual sizes leave a collision-safe corridor margin',()=>{
  const sizes=visualSizesFor(30);
  assert.ok(sizes.playerRadius<=9.6);
  assert.ok(sizes.keySize<=20);
  assert.ok(sizes.coinSize<=20);
  assert.ok(sizes.doorSize<=20);
  assert.ok(sizes.cornerRadius<=3.6);
});

test('short barriers stay in the wall union and removed-wall signatures are stable',()=>{
  const grid=parseGrid(['#######','#.....#','#.###.#','#.....#','#######']);
  const model=buildWallModel(grid,new Set(['3,2','2,2']));
  assert.equal(model.signature,'2,2|3,2');
  assert.deepEqual(model.shortBarriers,[{orientation:'horizontal',x:4,y:2,length:1}]);
  assert.deepEqual(model.runs.filter(run=>run.y===2),[
    {x:0,y:2,length:1},
    {x:4,y:2,length:1},
    {x:6,y:2,length:1}
  ]);

  const intact=buildWallModel(grid,new Set());
  assert.deepEqual(intact.shortBarriers,[{orientation:'horizontal',x:2,y:2,length:3}]);
});

test('wall shadows diffuse through multiple fading layers without changing light direction',()=>{
  assert.equal(typeof wallGeometry.wallShadowLayersFor,'function');
  const profile={sunlight:true},tile=30;
  const layers=wallGeometry.wallShadowLayersFor(profile,tile);
  const base=wallGeometry.shadowOffsetFor(profile,tile*.11);
  assert.ok(layers.length>=3);
  assert.deepEqual({x:layers.at(-1).x,y:layers.at(-1).y},base);
  for(let index=0;index<layers.length;index++){
    const layer=layers[index];
    assert.ok(layer.x*base.x+layer.y*base.y>0,'each layer projects away from the fixed light');
    assert.ok(Math.abs(layer.x*base.y-layer.y*base.x)<1e-9,'each layer preserves the fixed shadow direction');
    assert.ok(layer.blur>0,'every layer must soften its edge');
    if(index){
      assert.ok(layer.alpha<layers[index-1].alpha,'outer layers must fade');
      assert.ok(layer.blur>layers[index-1].blur,'outer layers must diffuse farther');
    }
  }
});

test('T-junction emits a true inward-rounded contour constrained to its wall cells',()=>{
  const model=buildWallModel(gridFor([[1,0],[0,1],[1,1],[2,1],[1,2]],3,3));
  assert.equal(model.contours.length,5);
  const curves=model.contours.flatMap(contour=>contour.commands).filter(command=>command.op==='quadraticCurveTo');
  assert.equal(curves.length,8);
  for(const curve of curves)assert.notDeepEqual(curve.args.slice(0,2),curve.args.slice(2),'every rounded corner must cut inward by a positive radius');
  for(const contour of model.contours)for(const command of contour.commands)for(const [x,y] of commandPoints(command)){
    assert.ok(x>=contour.x&&x<=contour.x+1,`${contour.x},${contour.y}:x=${x}`);
    assert.ok(y>=contour.y&&y<=contour.y+1,`${contour.x},${contour.y}:y=${y}`);
  }
});

test('concave corner remains square instead of curving into the walkable notch',()=>{
  const model=buildWallModel(gridFor([[0,0],[1,0],[0,1]],2,2));
  const atNotch=model.contours.flatMap(contour=>contour.commands).filter(command=>commandPoints(command).some(([x,y])=>x===1&&y===1));
  assert.ok(atNotch.filter(command=>command.op==='lineTo').length>=2);
  assert.equal(atNotch.some(command=>command.op==='quadraticCurveTo'),false);
});

test('boundary barrier rounds inward without producing geometry beyond the grid',()=>{
  const model=buildWallModel(gridFor([[0,0],[1,0],[2,0]],3,1));
  const commands=model.contours.flatMap(contour=>contour.commands);
  assert.equal(commands.filter(command=>command.op==='quadraticCurveTo').length,4);
  for(const command of commands)for(const [x,y] of commandPoints(command)){
    assert.ok(x>=0&&x<=3,`x=${x}`);assert.ok(y>=0&&y<=1,`y=${y}`);
  }
});

test('wall path tracer uses cached curves rather than rectangular visual bulges',()=>{
  const model=buildWallModel(gridFor([[0,0]],1,1)),operations=[];
  const context=new Proxy({}, {get:(_target,key)=>(...args)=>operations.push({op:key,args})});
  wallGeometry.traceWallPath(context,model.contours,{tile:30,originX:4,originY:7});
  assert.ok(operations.some(operation=>operation.op==='quadraticCurveTo'));
  assert.equal(operations.some(operation=>operation.op==='rect'||operation.op==='roundRect'),false);
  assert.deepEqual(operations.at(0),{op:'beginPath',args:[]});
});
