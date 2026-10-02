import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame, movePlayer, stepGame, coverage, finishRun} from '../territory/core.js';

// Hand-made maps make geometric expectations independent of the random generator.
function board(cols=11,rows=11,bots=0){
  const g=createGame({seed:7,cols,rows,bots});
  g.mask=Array(cols*rows).fill(1);g.owners=Array(cols*rows).fill(-1);
  for(const p of g.players){p.trail=[];p.alive=true;p.cooldown=0;p.route=[];p.trailStart=null;}
  g.players[0].x=2.5;g.players[0].y=2.5;
  for(let y=2;y<=6;y++)g.owners[y*cols+2]=0;
  g.peak=0;return g;
}
const owner=(g,x,y)=>g.owners[y*g.cols+x];
const walk=(g,id,points)=>{for(const [x,y] of points)movePlayer(g,id,x+.5,y+.5)};

test('a closed square captures its 3x3 center and never captures the outside',()=>{
  const g=board();walk(g,0,[[6,2],[6,6],[2,6]]);
  for(let y=3;y<=5;y++)for(let x=3;x<=5;x++)assert.equal(owner(g,x,y),0);
  assert.equal(owner(g,1,4),-1);assert.equal(owner(g,8,4),-1);
  assert.equal(g.owners.filter(id=>id===0).length,25);
  assert.equal(g.players[0].trail.length,0);assert.ok(g.revision>0);
});
test('a concave closed trail fills only the actual interior',()=>{
  const g=board();walk(g,0,[[7,2],[7,4],[5,4],[5,6],[2,6]]);
  assert.equal(owner(g,4,3),0);assert.equal(owner(g,4,5),0);
  assert.equal(owner(g,6,5),-1);assert.equal(owner(g,9,3),-1);
});
test('an island edge is not an exterior flood-fill seed or a capturable cell',()=>{
  const g=board();for(let y=0;y<11;y++)for(let x=0;x<2;x++)g.mask[y*11+x]=0;
  g.mask[4*11+4]=0;walk(g,0,[[6,2],[6,6],[2,6]]);
  assert.equal(owner(g,3,4),0);assert.equal(owner(g,4,4),-1);assert.equal(owner(g,8,4),-1);
});
test('cutting a trail loses only the current attempt and returns to surviving land',()=>{
  const g=board(11,11,1),p=g.players[1];p.x=5.5;p.y=1.5;
  g.owners[1*11+5]=1;g.owners[6*11+2]=1; // Already stolen land must remain stolen.
  walk(g,0,[[6,2],[6,5]]);const old=g.owners.slice();
  movePlayer(g,1,5.5,3.5);
  assert.deepEqual(g.owners,old);assert.equal(g.players[0].trail.length,0);
  const home=Math.floor(g.players[0].y)*11+Math.floor(g.players[0].x);
  assert.equal(g.owners[home],0);assert.ok(g.players[0].cooldown>0);
});
test('out-of-bounds targets are rejected and a wall prevents crossing into another lobe',()=>{
  const g=board();const p=g.players[0],before=[p.x,p.y];
  assert.equal(movePlayer(g,0,-1,2),false);assert.deepEqual([p.x,p.y],before);
  g.mask[2*11+4]=0;movePlayer(g,0,7.5,2.5);assert.ok(p.x<4);
});
test('long frames cannot tunnel through another player trail',()=>{
  const g=board(11,11,1),p=g.players[1];p.x=5.5;p.y=1.5;g.owners[1*11+5]=1;
  walk(g,1,[[5,7]]);p.route=[];p.cooldown=20;
  // Observe before the victim's new cooldown expires and it starts another run.
  stepGame(g,.9,{x:1,y:0});
  assert.equal(p.trail.length,0);assert.ok(g.events.some(e=>e.type==='cut'&&e.id===1));
});
test('random island masks are connected, deterministic, and vary by seed',()=>{
  const masks=[];
  for(let seed=1;seed<=12;seed++){
    const g=createGame({seed});const cells=g.mask.flatMap((v,i)=>v?[i]:[]);
    const seen=new Set([cells[0]]),queue=[cells[0]];
    for(const i of queue){const x=i%g.cols,y=Math.floor(i/g.cols);
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy,j=yy*g.cols+xx;
        if(xx>=0&&xx<g.cols&&yy>=0&&yy<g.rows&&g.mask[j]&&!seen.has(j)){seen.add(j);queue.push(j);}}
    }
    assert.equal(seen.size,cells.length);assert.ok(cells.length<g.cols*g.rows);
    for(const p of g.players)assert.ok(coverage(g,p.id)>0);
    assert.deepEqual(g.mask,createGame({seed}).mask);masks.push(g.mask.join(''));
  }
  assert.ok(new Set(masks).size>8);
});
test('computer players close real paths and increase their territory',()=>{
  const g=createGame({seed:31,bots:1}),before=coverage(g,1);
  for(let i=0;i<1500&&g.mode==='playing';i++)stepGame(g,.04);
  assert.ok(coverage(g,1)>before);assert.ok(g.events.some(e=>e.type==='capture'&&e.id===1));
});
test('covering the final cells yields 100 percent and eliminates a zero-land opponent',()=>{
  const g=board(7,7,1);g.owners.fill(0);
  for(let y=2;y<=4;y++)for(let x=3;x<=5;x++)g.owners[y*7+x]=1;
  g.players[0].x=2.5;g.players[0].y=2.5;
  walk(g,0,[[5,2],[5,4],[2,4]]);
  assert.equal(coverage(g,0),1);assert.equal(g.winner,0);assert.equal(g.mode,'over');
  assert.equal(g.players[1].alive,false);assert.equal(g.peak,1);
});
test('a computer winner ends the run; finishing and paused input are idempotent',()=>{
  const g=board(7,7,1);g.owners.fill(1);stepGame(g,.01);
  assert.equal(g.winner,1);assert.equal(g.mode,'over');assert.equal(g.players[0].alive,false);
  const count=g.events.length;finishRun(g);assert.equal(g.events.length,count);
  const h=board();h.mode='paused';const p=h.players[0];stepGame(h,1,{x:1,y:0});
  assert.equal(p.x,2.5);assert.equal(movePlayer(h,0,4.5,2.5),false);
  finishRun(h);assert.equal(h.mode,'over');assert.equal(h.winner,null);
});
test('an adjacent last cell can be claimed by returning home, making narrow ends reachable',()=>{
  const g=board(7,7);g.owners.fill(0);g.owners[2*7+3]=-1;
  walk(g,0,[[3,2],[2,2]]);assert.equal(g.winner,0);assert.equal(coverage(g,0),1);
});
test('a surviving rival whose resting cell is captured returns to its remaining territory',()=>{
  const g=board(11,11,1),p=g.players[1];
  p.x=4.5;p.y=4.5;g.owners[4*11+4]=1;g.owners[9*11+9]=1;
  walk(g,0,[[6,2],[6,6],[2,6]]);
  assert.equal(owner(g,4,4),0);assert.equal(owner(g,9,9),1);assert.equal(p.alive,true);
  assert.equal(owner(g,Math.floor(p.x),Math.floor(p.y)),1);assert.ok(p.cooldown>0);
});
test('diagonal movement cannot skip a trail through a corner',()=>{
  const g=board(11,11,1),p=g.players[1];p.x=3.5;p.y=1.5;g.owners[1*11+3]=1;
  walk(g,1,[[3,5]]);movePlayer(g,0,4.5,4.5);
  assert.ok(g.events.some(e=>e.type==='cut'&&e.id===1));
});
test('a severed owned return path discards the attempt instead of bridging detached land',()=>{
  const g=board(11,11,1);g.owners[1*11+9]=1;
  walk(g,0,[[6,2],[6,6]]);g.owners[4*11+2]=1;
  const before=g.owners.slice();movePlayer(g,0,2.5,6.5);
  assert.deepEqual(g.owners,before);assert.equal(g.players[0].trail.length,0);
});
test('actual generated islands can reach 100 percent through legal continuous moves',()=>{
  for(const seed of [2,17,81]){
    const g=createGame({seed,cols:14,rows:12,bots:0});
    for(let attempt=0;attempt<g.mask.length&&g.mode==='playing';attempt++){
      const p=g.players[0],start=Math.floor(p.y)*g.cols+Math.floor(p.x);
      const previous=new Map([[start,-1]]),queue=[start];let edge=null;
      for(const i of queue){
        const x=i%g.cols,y=Math.floor(i/g.cols);
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
          const xx=x+dx,yy=y+dy,j=yy*g.cols+xx;
          if(xx<0||yy<0||xx>=g.cols||yy>=g.rows||!g.mask[j])continue;
          if(g.owners[j]!==0){edge=[i,j];break;}
          if(!previous.has(j)){previous.set(j,i);queue.push(j);}
        }
        if(edge)break;
      }
      assert.ok(edge,'connected island must have a reachable expansion frontier');
      const path=[];for(let i=edge[0];i!==-1;i=previous.get(i))path.push(i);
      const positions=[...path.reverse().slice(1),edge[1],edge[0]].map(i=>[i%g.cols,Math.floor(i/g.cols)]);
      walk(g,0,positions);
    }
    assert.equal(g.mode,'over');assert.equal(g.winner,0);assert.equal(coverage(g,0),1);
    assert.ok(g.events.length<=100);
  }
});
