import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, getLevel } from '../maze/levels.js';
import { cellKey } from '../maze/level-tools.js';
import { createRun } from '../maze/engine.js';
import * as scenery from '../maze/scenery.js';
import * as wallGeometry from '../maze/wall-geometry.js';
import { activeTrails } from '../maze/motion-effects.js';

let render;
try { render = await import('../maze/render.js'); } catch {}

function recordingCanvas(){
  const paints=[],clips=[];
  let path=[],stack=[];
  const state={globalAlpha:1,fillStyle:null,strokeStyle:null};
  const recordPath=(method,args)=>path.push({method,args:[...args]});
  const context=new Proxy(state,{
    get(target,key){
      if(key==='save')return()=>stack.push({globalAlpha:target.globalAlpha,fillStyle:target.fillStyle,strokeStyle:target.strokeStyle});
      if(key==='restore')return()=>Object.assign(target,stack.pop()||{globalAlpha:1,fillStyle:null,strokeStyle:null});
      if(key==='beginPath')return()=>{path=[]};
      if(['ellipse','arc','rect','roundRect','moveTo','lineTo','bezierCurveTo','quadraticCurveTo','closePath'].includes(key))return(...args)=>recordPath(key,args);
      if(key==='clip')return rule=>clips.push({rule,path:path.map(entry=>({...entry,args:[...entry.args]}))});
      if(key==='fill'||key==='stroke')return()=>paints.push({op:key,alpha:target.globalAlpha,style:key==='fill'?target.fillStyle:target.strokeStyle,path:path.map(entry=>({...entry,args:[...entry.args]}))});
      if(key==='fillRect')return(...args)=>paints.push({op:key,alpha:target.globalAlpha,style:target.fillStyle,path:[{method:key,args}]});
      if(key==='createLinearGradient'||key==='createRadialGradient')return()=>({stops:[],addColorStop(offset,color){this.stops.push({offset,color})}});
      return target[key]??(()=>{});
    },
    set(target,key,value){target[key]=value;return true}
  });
  return{canvas:{style:{},getContext:()=>context},paints,clips};
}

const paintUsesStyle=(paints,style)=>paints.some(paint=>paint.style===style);
const paintUsesGradientStop=(paints,prefix)=>paints.some(paint=>paint.style?.stops?.some(stop=>stop.color.startsWith(prefix)));

test('caps device pixel ratio and fits a compact maze', () => {
  assert.ok(render, 'maze/render.js should exist');
  assert.equal(render.clampDpr(3), 2);
  assert.equal(render.clampDpr(.5), 1);
  const camera = render.cameraFor({ x: 1, y: 1 }, getLevel('normal-1'), { width: 390, height: 440 });
  assert.equal(camera.mode, 'fit');
  assert.ok(camera.scale >= 16);
});

test('follows the player in large maps while staying within world boundaries', () => {
  assert.ok(render);
  const level = getLevel('normal-10');
  const top = render.cameraFor({ x: level.start.x, y: 1 }, level, { width: 390, height: 400 });
  const bottom = render.cameraFor({ x: level.exit.x, y: level.exit.y }, level, { width: 390, height: 400 });
  assert.equal(top.mode, 'follow');
  assert.equal(bottom.mode, 'follow');
  assert.ok(top.y <= 12);
  assert.ok(bottom.y < top.y);
});

test('declares the required luxury drawing layers and a hard particle cap', () => {
  assert.ok(render);
  assert.deepEqual(render.LAYER_ORDER, ['backdrop','tree-shadow','ambient','floor','wall-shadow','wall','wall-highlight','decor','exit','objects','player-shadow','player','particles']);
  assert.equal(render.MAX_PARTICLES, 220);
});

test('renderer reuses cached wall geometry until a removed-wall signature changes',()=>{
  assert.ok(render);
  const gradient={addColorStop(){}};
  const context=new Proxy({}, {
    get(target,key){
      if(key==='createLinearGradient'||key==='createRadialGradient')return()=>gradient;
      return target[key]??(()=>{});
    },
    set(target,key,value){target[key]=value;return true}
  });
  const renderer=render.createRenderer({style:{},getContext:()=>context});
  const level=getLevel('normal-1'),state=createRun(level);
  renderer.resize({width:390,height:400},1);
  renderer.setLevel(level);
  assert.equal(renderer.wallModelBuilds,1);
  renderer.draw(state,0);renderer.draw(state,16);
  assert.equal(renderer.wallModelBuilds,1);
  state.removedWalls.add(cellKey(level.breakableWalls[0]));
  renderer.draw(state,32);renderer.draw(state,48);
  assert.equal(renderer.wallModelBuilds,2);
});

test('wall fill, shadow, and foreground sheen clip share one rounded contour',()=>{
  const recording=recordingCanvas(),renderer=render.createRenderer(recording.canvas),level=getLevel('normal-1');
  renderer.resize({width:390,height:400},1);renderer.setLevel(level);renderer.draw(createRun(level),0);
  const roundedOps=path=>path.map(entry=>entry.method).join(',');
  const shadows=recording.paints.filter(paint=>typeof paint.style==='string'&&paint.style.startsWith('rgba(8,5,15,'));
  const wall=recording.paints.find(paint=>paint.op==='fill'&&paint.style?.stops?.some(stop=>stop.color===level.theme.wall));
  const wallClips=recording.clips.filter(clip=>clip.path.some(entry=>entry.method==='quadraticCurveTo'));
  assert.equal(shadows.length,3);assert.ok(wall);assert.ok(wallClips.length>=3);
  assert.ok(wall.path.some(entry=>entry.method==='quadraticCurveTo'));
  for(const shadow of shadows)assert.equal(roundedOps(shadow.path),roundedOps(wall.path));
  for(const clip of wallClips)assert.equal(roundedOps(clip.path),roundedOps(wall.path));
});

test('foreground protection clip cuts object and player holes from the real draw pass',()=>{
  const recording=recordingCanvas(),renderer=render.createRenderer(recording.canvas),level=getLevel('normal-1'),state=createRun(level);
  renderer.resize({width:390,height:400},1);renderer.setLevel(level);renderer.draw(state,0);
  const protection=recording.clips.find(clip=>clip.rule==='evenodd');
  const arcs=protection.path.filter(entry=>entry.method==='arc');
  assert.equal(arcs.length,level.keys.length+2,'door, visible keys, and player each own a hole');
  assert.ok(arcs.every(entry=>entry.args[2]>0));
});

test('moving player keeps collision clearance and moves the foreground protection hole',()=>{
  const recording=recordingCanvas(),renderer=render.createRenderer(recording.canvas),level=getLevel('normal-1'),state=createRun(level);
  renderer.resize({width:390,height:400},1);renderer.setLevel(level);renderer.draw(state,0);
  const first=recording.clips.filter(clip=>clip.rule==='evenodd').at(-1).path.filter(entry=>entry.method==='arc').at(-1).args;
  const direction=[['right',1,0],['left',-1,0],['down',0,1],['up',0,-1]].find(([,dx,dy])=>level.rows[state.player.y+dy]?.[state.player.x+dx]==='.')[0];
  const delta={right:[1,0],left:[-1,0],down:[0,1],up:[0,-1]}[direction];
  state.player={x:state.player.x+delta[0],y:state.player.y+delta[1]};renderer.draw(state,16);
  const second=recording.clips.filter(clip=>clip.rule==='evenodd').at(-1).path.filter(entry=>entry.method==='arc').at(-1).args;
  const camera=render.cameraFor(state.player,level,{width:390,height:400}),sizes=wallGeometry.visualSizesFor(camera.scale);
  assert.notDeepEqual(second.slice(0,2),first.slice(0,2));
  assert.ok(second[2]>=sizes.playerRadius,'protection hole contains the moving player');
  assert.ok(sizes.playerRadius+sizes.cornerRadius<=camera.scale*.5,'rounded wall remains outside player clearance');
});

test('renderer builds deterministic ambient actors once per level rather than per frame',()=>{
  assert.ok(render);
  const gradient={addColorStop(){}};
  const context=new Proxy({}, {
    get(target,key){
      if(key==='createLinearGradient'||key==='createRadialGradient')return()=>gradient;
      return target[key]??(()=>{});
    },
    set(target,key,value){target[key]=value;return true}
  });
  const renderer=render.createRenderer({style:{},getContext:()=>context});
  renderer.resize({width:390,height:400},1);
  renderer.setLevel(getLevel('normal-1'));
  assert.equal(renderer.ambientActorBuilds,1);
  const state=createRun(getLevel('normal-1'));
  renderer.draw(state,0);renderer.draw(state,16);
  assert.equal(renderer.ambientActorBuilds,1);
  renderer.setLevel(getLevel('reward-1'));
  assert.equal(renderer.ambientActorBuilds,2);
});

test('renderer diagnostics expose bounded paint facts from the actual frame without leaking mutable arrays',()=>{
  assert.ok(render);
  const recording=recordingCanvas(),renderer=render.createRenderer(recording.canvas),level=getLevel('normal-1');
  renderer.resize({width:390,height:500},2);renderer.setLevel(level);renderer.draw(createRun(level),0);
  const diagnostics=renderer.diagnostics;
  assert.deepEqual({...diagnostics,paintSignatures:[...diagnostics.paintSignatures].sort()},{
    wallModelBuilds:1,
    trailCount:0,
    actorCount:34,
    sceneId:'royal-garden',
    paintSignatures:['flowers','grass','leaves','lights','petals','sunlight','trees']
  });
  const first=renderer.diagnostics;
  first.paintSignatures.push('mutable-leak');
  assert.notStrictEqual(renderer.diagnostics,first);
  assert.deepEqual(renderer.diagnostics.paintSignatures,['flowers','grass','leaves','lights','petals','sunlight','trees']);
});

test('every enabled theme field earns a bounded signature from a real drawing branch',()=>{
  for(const level of LEVELS){
    const recording=recordingCanvas(),renderer=render.createRenderer(recording.canvas),profile=scenery.sceneProfileFor(level);
    const state=createRun(level);
    if(level.id==='normal-10')state.player={x:Math.floor(level.rows[0].length/2),y:1};
    renderer.resize({width:390,height:500},1);renderer.setLevel(level);renderer.draw(state,1200);
    const signatures=renderer.diagnostics.paintSignatures;
    assert.equal(new Set(signatures).size,signatures.length,`${level.id}:unique signatures`);
    assert.ok(signatures.length<=32,`${level.id}:signatures=${signatures.length}`);
    for(const [field,enabled] of Object.entries(profile))if(enabled===true)assert.ok(signatures.includes(field),`${level.id}:${field}`);
  }
});

test('createRenderer records one trail for a real player-cell change rather than repeated draws',()=>{
  assert.ok(render);
  const recording=recordingCanvas(),renderer=render.createRenderer(recording.canvas),level=getLevel('normal-1'),state=createRun(level);
  renderer.resize({width:390,height:400},1);renderer.setLevel(level);
  renderer.draw(state,1000);renderer.draw(state,1016);
  assert.equal(activeTrails(renderer.motionState,1016).length,0);
  state.player={x:state.player.x+1,y:state.player.y};
  renderer.draw(state,1100);renderer.draw(state,1116);
  assert.equal(activeTrails(renderer.motionState,1116).length,1);
});

test('createRenderer ignores hook-length jumps but resumes recording from the landing cell',()=>{
  const recording=recordingCanvas(),renderer=render.createRenderer(recording.canvas),level=getLevel('normal-1'),state=createRun(level),origin={...state.player};
  renderer.resize({width:390,height:400},1);renderer.setLevel(level);renderer.draw(state,1000);
  state.player={x:origin.x+2,y:origin.y};renderer.draw(state,1100);
  assert.equal(activeTrails(renderer.motionState,1100).length,0,'two-cell hook jump has no walking trail');
  state.player={x:origin.x+5,y:origin.y};renderer.draw(state,1200);
  assert.equal(activeTrails(renderer.motionState,1200).length,0,'three-cell hook jump has no walking trail');
  state.player={x:origin.x+6,y:origin.y};renderer.draw(state,1300);
  assert.equal(activeTrails(renderer.motionState,1300).length,1,'next adjacent step starts at the hook landing cell');
});

test('createRenderer carries the equipped skin trail matrix through a real draw',()=>{
  const level=getLevel('normal-1');
  for(const [skinId,property,expected] of [['red','stars',false],['silver','moons',true],['gold','stars',true],['iridescent','rainbow',true]]){
    const recording=recordingCanvas(),renderer=render.createRenderer(recording.canvas),state=createRun(level);
    renderer.resize({width:390,height:400},1);renderer.setLevel(level);renderer.setSkin(skinId);
    renderer.draw(state,1000);state.player={x:state.player.x+1,y:state.player.y};renderer.draw(state,1100);
    assert.equal(activeTrails(renderer.motionState,1100)[0].style[property],expected,skinId);
  }
});

test('tree ambience does not add per-tree canvas filters beyond the three wall shadow layers',()=>{
  assert.ok(render);
  let filterWrites=0;
  const gradient={addColorStop(){}};
  const context=new Proxy({}, {
    get(target,key){
      if(key==='createLinearGradient'||key==='createRadialGradient')return()=>gradient;
      return target[key]??(()=>{});
    },
    set(target,key,value){if(key==='filter'&&String(value).startsWith('blur('))filterWrites++;target[key]=value;return true}
  });
  const renderer=render.createRenderer({style:{},getContext:()=>context});
  const level=getLevel('normal-1');
  renderer.resize({width:390,height:500},2);renderer.setLevel(level);renderer.draw(createRun(level),0);
  assert.equal(filterWrites,3);
});

test('all nineteen themes expose unique layered environment details', () => {
  assert.ok(render);
  const profiles=Array.from({length:10},(_,index)=>render.sceneProfileFor(getLevel(`normal-${index+1}`)))
    .concat(Array.from({length:9},(_,index)=>render.sceneProfileFor(getLevel(`reward-${index+1}`))));
  assert.equal(new Set(profiles.map(profile=>profile.id)).size,19);
  for(const profile of profiles)assert.ok(render.detailPassesFor(profile).length>=3,profile.id);
  const garden=render.sceneProfileFor(getLevel('normal-1'));
  assert.equal(garden.grass,true);assert.equal(garden.trees,true);assert.equal(garden.sunlight,true);assert.equal(garden.petals,true);
  const crystal=render.sceneProfileFor(getLevel('normal-4'));
  assert.equal(crystal.palace,true);assert.equal(crystal.goldGleam,true);assert.equal(crystal.lights,true);
  const roses=render.sceneProfileFor(getLevel('reward-4'));
  assert.equal(roses.roses,true);assert.equal(roses.petals,true);assert.equal(roses.lights,true);
});

test('grass reacts to movement while trees and illuminated scenery keep breathing', () => {
  assert.ok(render);
  const garden=render.sceneProfileFor(getLevel('normal-1'));
  const still=render.environmentMotion(garden,{moving:false,now:1200}),walking=render.environmentMotion(garden,{moving:true,now:1200});
  assert.equal(still.grassSway,0);
  assert.notEqual(walking.grassSway,0);
  assert.notEqual(still.treeSway,0);
  assert.ok(still.lightPulse>0);
});

test('declared flowers, caustics, snow and lanterns are assigned visible render passes',()=>{
  assert.ok(render);
  const details=id=>render.detailPassesFor(render.sceneProfileFor(getLevel(id)));
  assert.ok(details('normal-1').includes('flowers'));
  assert.ok(details('normal-2').includes('caustics'));
  assert.ok(details('normal-6').includes('snow'));
  assert.ok(details('reward-1').includes('lanterns'));
  assert.ok(details('reward-4').includes('foreground-petals'));
});

test('fixed light vectors project coherent nonzero shadows',()=>{
  assert.ok(render);
  assert.deepEqual(render.shadowOffsetFor(render.sceneProfileFor(getLevel('normal-1')),100),{x:-42,y:82});
  const purple=render.shadowOffsetFor(render.sceneProfileFor(getLevel('normal-4')),100);
  assert.deepEqual(purple,{x:28,y:76});
  const source=render.lightSourceFor(render.sceneProfileFor(getLevel('normal-4')),{width:390,height:400});
  const fromCenter={x:source.x-195,y:source.y-200};
  assert.ok(fromCenter.x*purple.x+fromCenter.y*purple.y<0,'light source must sit opposite the projected shadow');
});

test('required profile effects map into render plans consumed by real canvas branches',()=>{
  const cases=[
    ['reward-2','cherryTrees','cherry-canopy'],
    ['normal-3','emeraldGlow','emerald-glow'],
    ['normal-4','purpleRefraction','purple-refraction'],
    ['reward-5','rainbowRefraction','rainbow-refraction'],
    ['reward-6','mist','mist'],
    ['normal-7','curtainLight','curtain-light'],
    ['normal-7','crimsonTreeShadow','crimson-tree-shadow'],
    ['normal-8','darkTreeShadow','dark-tree-shadow'],
    ['normal-9','sunsetRefraction','sunset-refraction']
  ];
  const gradient={addColorStop(){}};
  for(const [levelId,field,effect] of cases){
    const level=getLevel(levelId),profile=scenery.sceneProfileFor(level),plan=scenery.sceneRenderPlanFor(profile);
    assert.ok(plan.includes(effect),`${levelId}:${field}->${effect}`);
    let paints=0;
    const context=new Proxy({}, {
      get(target,key){
        if(key==='createLinearGradient'||key==='createRadialGradient')return()=>gradient;
        if(['fill','stroke','fillRect'].includes(key))return()=>{paints++};
        return target[key]??(()=>{});
      },
      set(target,key,value){target[key]=value;return true}
    });
    render.drawSceneEffect(context,effect,{width:390,height:500},level.theme,1200);
    assert.ok(paints>0,`${effect} must issue a canvas paint operation`);
  }
});

test('renderer feeds each thematic tree palette into actual leaf paint styles',()=>{
  const cases=[['reward-2','#f3a6c0'],['reward-6','#879b53'],['normal-6','#9edfff'],['normal-7','#b63c5d'],['normal-5','#e9b83e']];
  const gradient={addColorStop(){}};
  for(const [levelId,signature] of cases){
    const styles=new Map(),context=new Proxy({}, {
      get(target,key){if(key==='createLinearGradient'||key==='createRadialGradient')return()=>gradient;return target[key]??(()=>{})},
      set(target,key,value){if(key==='fillStyle')styles.set(value,(styles.get(value)||0)+1);target[key]=value;return true}
    });
    const renderer=render.createRenderer({style:{},getContext:()=>context}),level=getLevel(levelId);
    renderer.resize({width:390,height:500},1);renderer.setLevel(level);renderer.draw(createRun(level),0);
    assert.ok((styles.get(signature)||0)>=4,`${levelId} tree leaves must repeatedly paint ${signature}`);
  }
});

test('renderer culls the world-anchored final crown after the camera travels down-map',()=>{
  const level=getLevel('normal-10'),gradient={addColorStop(){}};
  const crownPaintsAt=y=>{
    let crownPaints=0;
    const context=new Proxy({}, {
      get(target,key){if(key==='createLinearGradient'||key==='createRadialGradient')return()=>gradient;return target[key]??(()=>{})},
      set(target,key,value){if(key==='fillStyle'&&value==='#f6cf58')crownPaints++;target[key]=value;return true}
    });
    const renderer=render.createRenderer({style:{},getContext:()=>context}),state=createRun(level);
    renderer.resize({width:390,height:400},1);renderer.setLevel(level);
    state.player={x:Math.floor(level.rows[0].length/2),y};renderer.draw(state,0);
    return crownPaints;
  };
  assert.ok(crownPaintsAt(1)>0,'crown paints at the map top');
  assert.equal(crownPaintsAt(level.rows.length-2),0,'crown leaves the viewport with the map');
});

test('createRenderer main draw wiring paints every effect in each scene render plan',()=>{
  const signatureFor={
    'cherry-canopy':paints=>paints.some(paint=>paint.op==='fill'&&paint.style==='#f3a6c0'&&paint.path.some(entry=>entry.method==='ellipse'&&entry.args[2]===18&&entry.args[3]===6)),
    'emerald-glow':paints=>paintUsesGradientStop(paints,'rgba(88,255,181,'),
    'purple-refraction':paints=>paintUsesStyle(paints,'#d59cff'),
    'rainbow-refraction':paints=>paintUsesStyle(paints,'#ff8cab'),
    mist:paints=>paintUsesStyle(paints,'#e8f2df'),
    'curtain-light':paints=>paintUsesGradientStop(paints,'rgba(255,166,178,.18)'),
    'crimson-tree-shadow':paints=>paintUsesStyle(paints,'#6d1733'),
    'dark-tree-shadow':paints=>paintUsesStyle(paints,'#080d28'),
    'sunset-refraction':paints=>paintUsesGradientStop(paints,'rgba(255,184,102,.18)')
  };
  for(const levelId of ['reward-2','normal-3','normal-4','reward-5','reward-6','normal-7','normal-8','normal-9']){
    const level=getLevel(levelId),profile=scenery.sceneProfileFor(level),plan=scenery.sceneRenderPlanFor(profile),recording=recordingCanvas();
    const renderer=render.createRenderer(recording.canvas);renderer.resize({width:390,height:500},1);renderer.setLevel(level);renderer.draw(createRun(level),1200);
    for(const effect of plan)assert.ok(signatureFor[effect](recording.paints),`${levelId} main draw must paint ${effect}`);
  }
});

test('createRenderer draws paired water drops before impact and only linked ripple rings after impact',()=>{
  const level=getLevel('normal-2'),seed=[...level.theme.decor].reduce((sum,character)=>sum+character.charCodeAt(0),0);
  const drops=scenery.ambientActorsFor(scenery.sceneProfileFor(level),seed).filter(actor=>actor.type==='water-drop');
  const timeFor=phase=>{
    for(let now=0;now<=100000;now+=25){
      const states=drops.map(actor=>scenery.waterCycleStateFor(actor,now));
      if(phase==='fall'&&states.every(state=>state.dropAlpha>0&&state.rippleAlpha===0))return now;
      if(phase==='impact'&&states.every(state=>state.dropAlpha===0&&state.rippleAlpha>0))return now;
    }
    throw new Error(`No shared water ${phase} phase`);
  };
  const paintsAt=now=>{const recording=recordingCanvas(),renderer=render.createRenderer(recording.canvas);renderer.resize({width:390,height:500},1);renderer.setLevel(level);renderer.draw(createRun(level),now);return recording.paints};
  const visibleDrops=paints=>paints.filter(paint=>paint.op==='fill'&&paint.style==='#aeefff'&&paint.alpha>0);
  const visibleRipples=paints=>paints.filter(paint=>paint.op==='stroke'&&paint.style==='rgb(185,242,255)'&&paint.alpha>0);
  const falling=paintsAt(timeFor('fall')),impactTime=timeFor('impact'),impact=paintsAt(impactTime);
  assert.equal(visibleDrops(falling).length,2);assert.equal(visibleRipples(falling).length,0);
  assert.equal(visibleDrops(impact).length,0);
  const expectedRings=drops.reduce((sum,actor)=>sum+scenery.waterCycleStateFor(actor,impactTime).rings,0);
  assert.equal(visibleRipples(impact).length,expectedRings);assert.ok(expectedRings>=4&&expectedRings<=6);
});
