const DIRS = [
  {name:'right',x:1,y:0},
  {name:'left',x:-1,y:0},
  {name:'down',x:0,y:1},
  {name:'up',x:0,y:-1}
];
export const cellKey = ({x,y}) => `${x},${y}`;

export function parseGrid(rows) {
  if (!rows.length || rows.some(row => row.length !== rows[0].length)) throw new Error('rows must have same width');
  const width=rows[0].length,height=rows.length,walls=new Set(),floors=new Set();
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)(rows[y][x]==='#'?walls:floors).add(`${x},${y}`);
  for(let x=0;x<width;x++)if(rows[0][x]!=='#'||rows[height-1][x]!=='#')throw new Error('boundary must be closed');
  for(let y=0;y<height;y++)if(rows[y][0]!=='#'||rows[y][width-1]!=='#')throw new Error('boundary must be closed');
  return {rows,width,height,walls,floors};
}

export function neighbors(cell, grid) {
  return DIRS.map(d=>({x:cell.x+d.x,y:cell.y+d.y})).filter(c=>grid.floors.has(cellKey(c)));
}

export function findDeadEnds(level) {
  const grid=parseGrid(level.rows),excluded=new Set([cellKey(level.start),cellKey(level.exit)]),result=[];
  for(const key of grid.floors){const [x,y]=key.split(',').map(Number),cell={x,y};if(!excluded.has(key)&&neighbors(cell,grid).length===1)result.push(cell)}
  return result.sort((a,b)=>a.y-b.y||a.x-b.x);
}

export function reachableFrom(start, grid) {
  const seen=new Set([cellKey(start)]),queue=[start];
  for(let i=0;i<queue.length;i++)for(const next of neighbors(queue[i],grid)){const key=cellKey(next);if(!seen.has(key)){seen.add(key);queue.push(next)}}
  return seen;
}

export function validateLevel(level) {
  let grid;try{grid=parseGrid(level.rows)}catch(error){return [error.message.includes('same width')?'RAGGED_GRID':'OPEN_BOUNDARY']}
  const errors=[],seen=reachableFrom(level.start,grid),occupied=new Set();
  for(const key of level.keys||[])if(!seen.has(cellKey(key))){errors.push('UNREACHABLE_KEY');break}
  if(!seen.has(cellKey(level.exit)))errors.push('UNREACHABLE_EXIT');
  for(const item of [level.start,level.exit,...(level.keys||[]),...(level.coins||[])]){const key=cellKey(item);if(occupied.has(key)){errors.push('DUPLICATE_OBJECT');break}occupied.add(key)}
  return errors;
}

export function shortestCompletionPath(level) {
  const grid=parseGrid(level.rows),keyIndex=new Map((level.keys||[]).map((cell,index)=>[cellKey(cell),index]));
  const all=(1<<keyIndex.size)-1,startMask=keyIndex.has(cellKey(level.start))?1<<keyIndex.get(cellKey(level.start)):0;
  const startSignature=`${cellKey(level.start)}|${startMask}`;
  const queue=[{...level.start,mask:startMask,signature:startSignature}];
  const records=new Map([[startSignature,{previous:null,direction:null}]]);
  for(let i=0;i<queue.length;i++){
    const node=queue[i];
    if(node.mask===all&&cellKey(node)===cellKey(level.exit)){
      const path=[];
      let signature=node.signature;
      while(records.get(signature)?.previous!==null){
        const record=records.get(signature);
        path.push(record.direction);
        signature=record.previous;
      }
      return path.reverse();
    }
    for(const direction of DIRS){
      const next={x:node.x+direction.x,y:node.y+direction.y};
      if(!grid.floors.has(cellKey(next)))continue;
      const idx=keyIndex.get(cellKey(next));
      const mask=idx===undefined?node.mask:node.mask|(1<<idx);
      const signature=`${cellKey(next)}|${mask}`;
      if(records.has(signature))continue;
      records.set(signature,{previous:node.signature,direction:direction.name});
      queue.push({...next,mask,signature});
    }
  }
  return null;
}

export function shortestCompletionSteps(level) {
  const path=shortestCompletionPath(level);
  return path===null?Infinity:path.length;
}

function countShortBarrierRuns(grid) {
  const {rows,width,height}=grid;
  let count=0;
  const isFloor=(x,y)=>x>=0&&x<width&&y>=0&&y<height&&rows[y][x]!=='#';

  // A barrier run is interior, bounded by floor at both ends, and has no
  // perpendicular wall branches. Single-cell runs are counted once here;
  // longer runs are counted in both orientations when they meet the rules.
  for(let y=1;y<height-1;y++){
    let x=1;
    while(x<width-1){
      if(rows[y][x]!=='#'){x++;continue}
      const start=x;
      while(x<width-1&&rows[y][x]==='#')x++;
      const end=x-1,length=end-start+1;
      if(length>3||!isFloor(start-1,y)||!isFloor(end+1,y))continue;
      let isolated=true;
      for(let xx=start;xx<=end;xx++)if(!isFloor(xx,y-1)||!isFloor(xx,y+1)){isolated=false;break}
      if(isolated)count++;
    }
  }
  for(let x=1;x<width-1;x++){
    let y=1;
    while(y<height-1){
      if(rows[y][x]!=='#'){y++;continue}
      const start=y;
      while(y<height-1&&rows[y][x]==='#')y++;
      const end=y-1,length=end-start+1;
      if(length<2||length>3||!isFloor(x,start-1)||!isFloor(x,end+1))continue;
      let isolated=true;
      for(let yy=start;yy<=end;yy++)if(!isFloor(x-1,yy)||!isFloor(x+1,yy)){isolated=false;break}
      if(isolated)count++;
    }
  }
  return count;
}

export function topologyMetrics(level) {
  const grid=parseGrid(level.rows);
  const path=shortestCompletionPath(level),route=path||[];
  let turns=0,longestStraight=0,currentStraight=0,previousDirection=null;
  for(const direction of route){
    if(direction===previousDirection)currentStraight++;
    else {if(previousDirection!==null)turns++;currentStraight=1;previousDirection=direction}
    longestStraight=Math.max(longestStraight,currentStraight);
  }
  let junctions=0;
  for(const key of grid.floors){
    const [x,y]=key.split(',').map(Number);
    if(neighbors({x,y},grid).length>=3)junctions++;
  }
  const rowCounts=Array(grid.height).fill(0),columnCounts=Array(grid.width).fill(0);
  for(const key of grid.floors){const [x,y]=key.split(',').map(Number);rowCounts[y]++;columnCounts[x]++}
  const busiest=Math.max(0,...rowCounts,...columnCounts);
  return {
    completionSteps:path===null?Infinity:path.length,
    turns,
    junctions,
    longestStraight,
    trunkDominance:grid.floors.size?busiest/grid.floors.size:0,
    floorRatio:grid.width*grid.height?grid.floors.size/(grid.width*grid.height):0,
    shortBarrierCount:countShortBarrierRuns(grid)
  };
}

export const complexityScore=level=>{
  const m=topologyMetrics(level);
  return m.completionSteps*4+m.turns*7+m.junctions*5+m.shortBarrierCount*3+
    Math.round((1-m.trunkDominance)*100)+Math.round(m.floorRatio*40);
};
