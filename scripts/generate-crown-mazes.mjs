import {writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {generateMaze} from '../maze/maze-builder.js';
import {
  cellKey,
  complexityScore,
  findDeadEnds,
  neighbors,
  parseGrid,
  reachableFrom,
  shortestCompletionSteps,
  topologyMetrics,
  validateLevel
} from '../maze/level-tools.js';

const CONFIGS=[
  ['normal-1',1107,7,6,3,0,4],['reward-1',2109,8,6,3,1,4],
  ['normal-2',3119,8,7,5,1,5],['reward-2',4127,9,7,5,2,5],
  ['normal-3',5131,9,8,7,2,5],['reward-3',6143,10,8,7,3,5],
  ['normal-4',7151,10,9,9,3,6],['reward-4',8161,11,9,9,4,6],
  ['normal-5',9173,11,10,11,4,6],['reward-5',10181,12,10,11,5,6],
  ['normal-6',11197,12,11,13,5,7],['reward-6',12203,13,11,13,6,7],
  ['normal-7',13217,13,12,15,6,7],['reward-7',14221,14,12,15,7,7],
  ['normal-8',15233,14,13,17,7,8],['reward-8',16249,15,13,17,8,8],
  ['normal-9',17257,16,14,19,8,8],['reward-9',18269,17,14,19,9,9],
  ['normal-10',19273,18,15,21,9,9]
].map(([id,seedStart,cellWidth,cellHeight,targetDeadEnds,loopOpenings,minStraight])=>
  ({id,seedStart,cellWidth,cellHeight,targetDeadEnds,loopOpenings,minStraight}));

const stageIndex=id=>Number(id.slice(id.indexOf('-')+1));

function campaignLevel(layout){
  return {
    rows:layout.rows,
    start:layout.start,
    exit:layout.exit,
    keys:layout.keyCandidates.slice(0,stageIndex(layout.id)),
    coins:[]
  };
}

function buildLayouts(){
  const layouts=[];
  let previousScore=-Infinity;
  for(const config of CONFIGS){
    let accepted=null,lastError='no candidate evaluated';
    for(let seed=config.seedStart;seed<config.seedStart+100000;seed++){
      try{
        const built=generateMaze({...config,seed});
        const provisional={id:config.id,seed,...built};
        const level=campaignLevel(provisional),metrics=topologyMetrics(level),score=complexityScore(level);
        if(metrics.turns<6){lastError=`only ${metrics.turns} turns`;continue}
        if(metrics.junctions<2){lastError=`only ${metrics.junctions} junctions`;continue}
        if(score<=previousScore){lastError=`score ${score} does not exceed ${previousScore}`;continue}
        accepted={
          ...provisional,
          parSteps:shortestCompletionSteps(level),
          difficulty:{...metrics,score}
        };
        break;
      }catch(error){lastError=error.message}
    }
    if(!accepted)throw new Error(`${config.id}: no acceptable seed (${lastError})`);
    layouts.push(accepted);previousScore=accepted.difficulty.score;
    console.log(`${accepted.id}: seed ${accepted.seed}, score ${accepted.difficulty.score}`);
  }
  return layouts;
}

function distancesFrom(start,grid){
  const distances=new Map([[cellKey(start),0]]),queue=[start];
  for(let index=0;index<queue.length;index++){
    const current=queue[index],distance=distances.get(cellKey(current));
    for(const next of neighbors(current,grid))if(!distances.has(cellKey(next))){
      distances.set(cellKey(next),distance+1);queue.push(next);
    }
  }
  return distances;
}

const sameData=(left,right)=>JSON.stringify(left)===JSON.stringify(right);

export function verifyLayouts(layouts){
  if(layouts.length!==CONFIGS.length)throw new Error(`expected 19 layouts, received ${layouts.length}`);
  const signatures=new Set();
  let previousScore=-Infinity;
  for(let index=0;index<layouts.length;index++){
    const layout=layouts[index],config=CONFIGS[index];
    if(layout.id!==config.id)throw new Error(`layout ${index} has id ${layout.id}`);
    const signature=layout.rows.join('\n');
    if(signatures.has(signature))throw new Error(`${layout.id}: duplicate rows`);
    signatures.add(signature);
    if(!Number.isInteger(layout.seed)||layout.seed<config.seedStart)throw new Error(`${layout.id}: invalid accepted seed`);
    const grid=parseGrid(layout.rows),reachable=reachableFrom(layout.start,grid),level=campaignLevel(layout);
    if(reachable.size!==grid.floors.size||!reachable.has(cellKey(layout.exit)))throw new Error(`${layout.id}: unreachable floor or exit`);
    const validation=validateLevel(level);
    if(validation.length)throw new Error(`${layout.id}: ${validation.join(', ')}`);
    const deadEnds=findDeadEnds(level),distances=distancesFrom(layout.start,grid);
    const expectedCandidates=[...deadEnds].sort((a,b)=>
      distances.get(cellKey(b))-distances.get(cellKey(a))||a.y-b.y||a.x-b.x
    );
    if(deadEnds.length!==config.targetDeadEnds)throw new Error(`${layout.id}: wrong dead-end count`);
    if(!sameData(layout.keyCandidates,expectedCandidates))throw new Error(`${layout.id}: stale or unsorted key candidates`);

    const wallKeys=new Set(),baseline=shortestCompletionSteps(level);
    if(!layout.breakableWalls.length)throw new Error(`${layout.id}: missing breakable wall`);
    for(const wall of layout.breakableWalls){
      const key=cellKey(wall);
      if(wallKeys.has(key))throw new Error(`${layout.id}: duplicate breakable wall ${key}`);
      wallKeys.add(key);
      if(!Number.isInteger(wall.x)||!Number.isInteger(wall.y)||layout.rows[wall.y]?.[wall.x]!=='#')throw new Error(`${layout.id}: breakable wall ${key} is not a wall`);
      const pairs=[[{x:wall.x-1,y:wall.y},{x:wall.x+1,y:wall.y}],[{x:wall.x,y:wall.y-1},{x:wall.x,y:wall.y+1}]];
      if(!pairs.some(pair=>pair.every(point=>reachable.has(cellKey(point)))))throw new Error(`${layout.id}: breakable wall ${key} does not connect reachable floors`);
      const opened=[...layout.rows];
      opened[wall.y]=`${opened[wall.y].slice(0,wall.x)}.${opened[wall.y].slice(wall.x+1)}`;
      if(shortestCompletionSteps({...level,rows:opened})>=baseline)throw new Error(`${layout.id}: breakable wall ${key} does not shorten the key-complete route`);
    }

    const metrics=topologyMetrics(level),score=complexityScore(level),difficulty={...metrics,score};
    if(score<=previousScore)throw new Error(`${layout.id}: score ${score} does not exceed ${previousScore}`);
    if(layout.parSteps!==baseline||!sameData(layout.difficulty,difficulty))throw new Error(`${layout.id}: stale difficulty data`);
    previousScore=score;
  }
}

const invokedPath=process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href;
if(import.meta.url===invokedPath){
  const output=resolve('maze/generated-levels.js'),layouts=buildLayouts();
  const source=`// Generated by scripts/generate-crown-mazes.mjs. Do not edit by hand.\nexport const GENERATED_LAYOUTS=${JSON.stringify(layouts,null,2)};\n`;
  await writeFile(output,source,'utf8');
  const imported=await import(`${pathToFileURL(output).href}?verify=${Date.now()}`);
  verifyLayouts(imported.GENERATED_LAYOUTS);
  console.log(`wrote and verified ${imported.GENERATED_LAYOUTS.length} layouts`);
}
