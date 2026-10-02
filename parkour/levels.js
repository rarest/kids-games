const themes=['sakura','flowers','city','cabin'];
const names=[['初见樱光','樱间转弯','花瓣高台'],['花径漫步','繁花回廊','花海跃迁'],['天桥风景','屋顶转角','城市之巅'],['林间木阶','树梢小屋','微光远行']];

function makeLevel(index) {
  const theme=themes[Math.floor(index/3)], count=6+Math.floor(index/2)*2;
  const width=4.8-Math.floor((index+1)/2)*.35, gap=.8+index*.11;
  const platforms=[];
  let x=0,z=0;
  for (let i=0;i<count;i++) {
    if (i) {
      // Axis turns expose each landing without placing solid corners in the jump arc.
      if (i%4<2) x+=width+gap;
      else z+=width+gap;
    }
    const y=(i%4===1?1:i%4===2?2:i%4===3?1:0)*(.22+index*.012);
    platforms.push({id:`p${i}`,x,z,y,w:width,d:width,h:.65});
  }
  const point=p=>({x:p.x,y:p.y,z:p.z});
  return {
    id:`${theme}-${index%3+1}`, name:names[Math.floor(index/3)][index%3], theme, difficulty:index+1,
    platforms, spawn:point(platforms[0]), goal:point(platforms.at(-1)),
    coins:platforms.slice(1,-1).map((p,i)=>({id:`coin${i}`,x:p.x,y:p.y+.35,z:p.z})),
    checkpoints:[{id:'checkpoint',...point(platforms[Math.floor(count/2)])}], tutorial:index===0,
  };
}

export const LEVELS=Array.from({length:12},(_,index)=>makeLevel(index));
