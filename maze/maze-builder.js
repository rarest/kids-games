import {
  cellKey,
  findDeadEnds,
  parseGrid,
  reachableFrom,
  shortestCompletionSteps,
  topologyMetrics
} from './level-tools.js';

const DIRECTIONS=[
  {dx:1,dy:0},
  {dx:-1,dy:0},
  {dx:0,dy:1},
  {dx:0,dy:-1}
];

const mulberry32=seed=>()=>{
  seed|=0;seed=seed+0x6D2B79F5|0;
  let value=Math.imul(seed^seed>>>15,1|seed);
  value=value+Math.imul(value^value>>>7,61|value)^value;
  return ((value^value>>>14)>>>0)/4294967296;
};

const shuffled=(values,random)=>{
  const result=[...values];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]]}
  return result;
};

const rowsFrom=cells=>cells.map(row=>row.join(''));

function distancesFrom(start,rows){
  const grid=parseGrid(rows),distances=new Map([[cellKey(start),0]]),queue=[start];
  for(let i=0;i<queue.length;i++){
    const current=queue[i],distance=distances.get(cellKey(current));
    for(const {dx,dy} of DIRECTIONS){
      const next={x:current.x+dx,y:current.y+dy},key=cellKey(next);
      if(grid.floors.has(key)&&!distances.has(key)){distances.set(key,distance+1);queue.push(next)}
    }
  }
  return distances;
}

function openDeadEndConnector(cells,level,random){
  const rows=rowsFrom(cells),grid=parseGrid(rows),distances=distancesFrom(level.start,rows);
  const deadEnds=findDeadEnds({...level,rows}).sort((a,b)=>
    distances.get(cellKey(a))-distances.get(cellKey(b))||a.y-b.y||a.x-b.x
  );
  for(const deadEnd of deadEnds){
    const connectors=shuffled(DIRECTIONS,random).filter(({dx,dy})=>{
      const wall={x:deadEnd.x+dx,y:deadEnd.y+dy},other={x:deadEnd.x+dx*2,y:deadEnd.y+dy*2};
      if(cells[wall.y]?.[wall.x]!=='#'||!grid.floors.has(cellKey(other)))return false;
      if(cellKey(other)===cellKey(level.exit))return false;
      let degree=0;
      for(const direction of DIRECTIONS)if(grid.floors.has(`${other.x+direction.dx},${other.y+direction.dy}`))degree++;
      return degree>1;
    });
    if(connectors.length){
      const {dx,dy}=connectors[0];
      cells[deadEnd.y+dy][deadEnd.x+dx]='.';
      return true;
    }
  }
  return false;
}

function addSafeLoops(cells,count,random){
  if(count<=0)return;
  const rows=rowsFrom(cells),grid=parseGrid(rows),degree=point=>{
    let result=0;
    for(const {dx,dy} of DIRECTIONS)if(grid.floors.has(`${point.x+dx},${point.y+dy}`))result++;
    return result;
  };
  const candidates=[];
  for(let y=1;y<cells.length-1;y++)for(let x=1;x<cells[0].length-1;x++){
    if(cells[y][x]!=='#')continue;
    const horizontal=[{x:x-1,y},{x:x+1,y}],vertical=[{x,y:y-1},{x,y:y+1}];
    for(const endpoints of [horizontal,vertical])if(endpoints.every(point=>grid.floors.has(cellKey(point))&&degree(point)>1)){
      candidates.push({x,y});break;
    }
  }
  const choices=shuffled(candidates,random);
  if(choices.length<count)throw new Error('seed has too few safe loop connectors');
  for(const point of choices.slice(0,count))cells[point.y][point.x]='.';
}

function selectBreakableWalls(rows,start,exit,keys){
  const grid=parseGrid(rows),reachable=reachableFrom(start,grid);
  const route={rows,start,exit,keys,coins:[]},baseline=shortestCompletionSteps(route),noKeyBaseline=topologyMetrics({...route,keys:[]}).completionSteps,candidates=[];
  for(let y=1;y<grid.height-1;y++)for(let x=1;x<grid.width-1;x++){
    if(rows[y][x]!=='#')continue;
    const pairs=[[{x:x-1,y},{x:x+1,y}],[{x,y:y-1},{x,y:y+1}]];
    if(!pairs.some(pair=>pair.every(point=>reachable.has(cellKey(point)))))continue;
    const opened=[...rows];
    opened[y]=`${opened[y].slice(0,x)}.${opened[y].slice(x+1)}`;
    const noKeySteps=topologyMetrics({...route,rows:opened,keys:[]}).completionSteps;
    candidates.push({x,y,noKeySaving:noKeyBaseline-noKeySteps,rows:opened});
  }
  const result=[];
  candidates.sort((a,b)=>b.noKeySaving-a.noKeySaving||a.y-b.y||a.x-b.x);
  for(const candidate of candidates){
    if(shortestCompletionSteps({...route,rows:candidate.rows})>=baseline)continue;
    result.push({x:candidate.x,y:candidate.y});
    if(result.length===4)break;
  }
  return result;
}

export function generateMaze({seed,cellWidth,cellHeight,targetDeadEnds,loopOpenings,minStraight}){
  for(const [name,value] of Object.entries({seed,cellWidth,cellHeight,targetDeadEnds,loopOpenings,minStraight}))
    if(!Number.isInteger(value))throw new TypeError(`${name} must be an integer`);
  if(cellWidth<2||cellHeight<2||targetDeadEnds<1||loopOpenings<0||minStraight<1)throw new RangeError('invalid maze configuration');

  const random=mulberry32(seed),width=cellWidth*2+1,height=cellHeight*2+1;
  const cells=Array.from({length:height},()=>Array(width).fill('#'));
  const visited=Array.from({length:cellHeight},()=>Array(cellWidth).fill(false));
  const stack=[{x:0,y:0,directions:shuffled(DIRECTIONS,random),cursor:0}];
  visited[0][0]=true;cells[1][1]='.';
  while(stack.length){
    const current=stack[stack.length-1];
    if(current.cursor===current.directions.length){stack.pop();continue}
    const {dx,dy}=current.directions[current.cursor++],next={x:current.x+dx,y:current.y+dy,dx,dy};
    if(next.x<0||next.x>=cellWidth||next.y<0||next.y>=cellHeight||visited[next.y][next.x])continue;
    cells[current.y*2+1+next.dy][current.x*2+1+next.dx]='.';
    cells[next.y*2+1][next.x*2+1]='.';
    visited[next.y][next.x]=true;
    stack.push({x:next.x,y:next.y,directions:shuffled(DIRECTIONS,random),cursor:0});
  }

  let rows=rowsFrom(cells);
  const start={x:1,y:1},provisional={rows,start,exit:start};
  const distances=distancesFrom(start,rows);
  const rawDeadEnds=findDeadEnds(provisional);
  if(rawDeadEnds.length<=targetDeadEnds)throw new Error('seed has too few dead ends');
  const exit=[...rawDeadEnds].sort((a,b)=>distances.get(cellKey(b))-distances.get(cellKey(a))||a.y-b.y||a.x-b.x)[0];
  const level={rows,start,exit};
  let openedFromDeadEnds=0;
  while(findDeadEnds({...level,rows:rowsFrom(cells)}).length>targetDeadEnds){
    if(!openDeadEndConnector(cells,level,random))throw new Error('seed cannot reach target dead-end count');
    openedFromDeadEnds++;
  }
  addSafeLoops(cells,Math.max(0,loopOpenings-openedFromDeadEnds),random);
  rows=rowsFrom(cells);

  const finalLevel={rows,start,exit,keys:[],coins:[]},grid=parseGrid(rows),reachable=reachableFrom(start,grid);
  if(reachable.size!==grid.floors.size||!reachable.has(cellKey(exit)))throw new Error('seed creates an unreachable exit');
  const metrics=topologyMetrics(finalLevel);
  if(metrics.trunkDominance>=.34)throw new Error('seed creates a dominant row or column');
  if(metrics.longestStraight<minStraight)throw new Error('seed has no required long run');
  if(findDeadEnds(finalLevel).length!==targetDeadEnds)throw new Error('seed misses target dead-end count');

  const finalDistances=distancesFrom(start,rows);
  const keyCandidates=findDeadEnds(finalLevel).sort((a,b)=>
    finalDistances.get(cellKey(b))-finalDistances.get(cellKey(a))||a.y-b.y||a.x-b.x
  );
  const keyCount=Math.floor((targetDeadEnds-1)/2);
  const breakableWalls=selectBreakableWalls(rows,start,exit,keyCandidates.slice(0,keyCount));
  if(!breakableWalls.length)throw new Error('seed has no route-shortening breakable wall');
  return {rows,start,exit,keyCandidates,breakableWalls};
}
