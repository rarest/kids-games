const keyFor=(x,y)=>`${x},${y}`;

export function wallSignatureFor(removedWalls=new Set()){
  return [...removedWalls].sort().join('|');
}

export function shadowOffsetFor(profile,length){
  const scaled=(factor)=>Math.round(factor*length*1000)/1000;
  if(profile.sunlight)return{x:scaled(-.42),y:scaled(.82)};
  if(profile.goldGleam)return{x:scaled(.28),y:scaled(.76)};
  if(profile.lights)return{x:scaled(-.18),y:scaled(.75)};
  return{x:0,y:scaled(.45)};
}

export function wallShadowLayersFor(profile,tile){
  const base=shadowOffsetFor(profile,tile*.11);
  return [
    {x:base.x*.64,y:base.y*.64,alpha:.16,blur:tile*.035},
    {x:base.x*.84,y:base.y*.84,alpha:.09,blur:tile*.075},
    {x:base.x,y:base.y,alpha:.045,blur:tile*.13}
  ];
}

function surfaceRuns(grid,isActive){
  const runs=[];
  for(let y=0;y<grid.height;y++){
    let start=-1;
    for(let x=0;x<=grid.width;x++){
      const active=x<grid.width&&isActive(x,y);
      if(active&&start<0)start=x;
      if(!active&&start>=0){runs.push({x:start,y,length:x-start});start=-1}
    }
  }
  return runs;
}

function wallCellContour(x,y,isActive,radius=.12){
  const left=!isActive(x-1,y),right=!isActive(x+1,y),top=!isActive(x,y-1),bottom=!isActive(x,y+1);
  const rounded={topLeft:top&&left,topRight:top&&right,bottomRight:bottom&&right,bottomLeft:bottom&&left};
  const r=Math.max(0,Math.min(.5,radius));
  const commands=[{op:'moveTo',args:[x+(rounded.topLeft?r:0),y]}];
  commands.push({op:'lineTo',args:[x+1-(rounded.topRight?r:0),y]});
  if(rounded.topRight)commands.push({op:'quadraticCurveTo',args:[x+1,y,x+1,y+r]});
  commands.push({op:'lineTo',args:[x+1,y+1-(rounded.bottomRight?r:0)]});
  if(rounded.bottomRight)commands.push({op:'quadraticCurveTo',args:[x+1,y+1,x+1-r,y+1]});
  commands.push({op:'lineTo',args:[x+(rounded.bottomLeft?r:0),y+1]});
  if(rounded.bottomLeft)commands.push({op:'quadraticCurveTo',args:[x,y+1,x,y+1-r]});
  commands.push({op:'lineTo',args:[x,y+(rounded.topLeft?r:0)]});
  if(rounded.topLeft)commands.push({op:'quadraticCurveTo',args:[x,y,x+r,y]});
  commands.push({op:'closePath',args:[]});
  return{x,y,commands};
}

function wallContours(grid,isActive){
  const contours=[];
  for(let y=0;y<grid.height;y++)for(let x=0;x<grid.width;x++)if(isActive(x,y))contours.push(wallCellContour(x,y,isActive));
  return contours;
}

export function traceWallPath(ctx,contours,{tile=1,originX=0,originY=0,offsetX=0,offsetY=0}={}){
  const point=(x,y)=>[originX+x*tile+offsetX,originY+y*tile+offsetY];
  ctx.beginPath();
  for(const contour of contours)for(const command of contour.commands){
    if(command.op==='closePath'){ctx.closePath();continue}
    if(command.op==='quadraticCurveTo'){
      const control=point(command.args[0],command.args[1]),end=point(command.args[2],command.args[3]);
      ctx.quadraticCurveTo(control[0],control[1],end[0],end[1]);continue;
    }
    const [x,y]=point(command.args[0],command.args[1]);ctx[command.op](x,y);
  }
}

function outlineEdges(grid,isActive){
  const lightEdges=[],darkEdges=[];
  const horizontal=(neighborY,edgeY,edges)=>{
    for(let y=0;y<grid.height;y++){
      let start=-1;
      for(let x=0;x<=grid.width;x++){
        const exposed=x<grid.width&&isActive(x,y)&&!isActive(x,y+neighborY);
        if(exposed&&start<0)start=x;
        if(!exposed&&start>=0){edges.push({x1:start,y1:y+edgeY,x2:x,y2:y+edgeY});start=-1}
      }
    }
  };
  const vertical=(neighborX,edgeX,edges)=>{
    for(let x=0;x<grid.width;x++){
      let start=-1;
      for(let y=0;y<=grid.height;y++){
        const exposed=y<grid.height&&isActive(x,y)&&!isActive(x+neighborX,y);
        if(exposed&&start<0)start=y;
        if(!exposed&&start>=0){edges.push({x1:x+edgeX,y1:start,x2:x+edgeX,y2:y});start=-1}
      }
    }
  };
  horizontal(-1,0,lightEdges);vertical(-1,0,lightEdges);
  horizontal(1,1,darkEdges);vertical(1,1,darkEdges);
  return {lightEdges,darkEdges};
}

function findShortBarriers(grid,isActive){
  const barriers=[];
  const isOpen=(x,y)=>x>=0&&x<grid.width&&y>=0&&y<grid.height&&!isActive(x,y);
  for(let y=1;y<grid.height-1;y++){
    let x=1;
    while(x<grid.width-1){
      if(!isActive(x,y)){x++;continue}
      const start=x;
      while(x<grid.width-1&&isActive(x,y))x++;
      const length=x-start;
      if(length<=3&&isOpen(start-1,y)&&isOpen(x,y)){
        let isolated=true;
        for(let xx=start;xx<x;xx++)if(!isOpen(xx,y-1)||!isOpen(xx,y+1)){isolated=false;break}
        if(isolated)barriers.push({orientation:'horizontal',x:start,y,length});
      }
    }
  }
  for(let x=1;x<grid.width-1;x++){
    let y=1;
    while(y<grid.height-1){
      if(!isActive(x,y)){y++;continue}
      const start=y;
      while(y<grid.height-1&&isActive(x,y))y++;
      const length=y-start;
      if(length>=2&&length<=3&&isOpen(x,start-1)&&isOpen(x,y)){
        let isolated=true;
        for(let yy=start;yy<y;yy++)if(!isOpen(x-1,yy)||!isOpen(x+1,yy)){isolated=false;break}
        if(isolated)barriers.push({orientation:'vertical',x,y:start,length});
      }
    }
  }
  return barriers;
}

export function buildWallModel(grid,removedWalls=new Set()){
  const signature=wallSignatureFor(removedWalls);
  const isActive=(x,y)=>grid.walls.has(keyFor(x,y))&&!removedWalls.has(keyFor(x,y));
  const runs=surfaceRuns(grid,isActive);
  const {lightEdges,darkEdges}=outlineEdges(grid,isActive);
  return {runs,contours:wallContours(grid,isActive),lightEdges,darkEdges,shortBarriers:findShortBarriers(grid,isActive),signature};
}

export function visualSizesFor(tile){
  const size=Math.max(0,Number(tile)||0);
  return {
    playerRadius:size*.32,
    keySize:size*.64,
    coinSize:size*.62,
    doorSize:size*.66,
    cornerRadius:size*.12
  };
}
