// Vector portraits do not depend on emoji fonts or remote image assets.
export const ANIMALS = [
  ['cat','橘猫','#eaa85c'],['dog','小狗','#bd916d'],['rabbit','白兔','#f9f1eb'],['panda','熊猫','#f2f4ef'],['fox','狐狸','#e68742'],
  ['bear','棕熊','#a47b55'],['pig','小猪','#f0afb9'],['lion','狮子','#d5a248'],['tiger','老虎','#edac42'],['koala','考拉','#a6b6bb'],
  ['frog','青蛙','#82ba70'],['elephant','大象','#9bb2c4'],['monkey','猴子','#b38b68'],['raccoon','浣熊','#acb2ad'],['penguin','企鹅','#47546b'],
  ['owl','猫头鹰','#b69b79'],['chick','小鸡','#f6d96e'],['cow','奶牛','#f5eee4'],['sheep','绵羊','#f6f1e5'],['deer','小鹿','#c19a69'],
];
const COLORS = Object.fromEntries(ANIMALS.map(([id,,color])=>[id,color]));
export function drawAnimal(ctx,x,y,size,animal){
  const color=COLORS[animal]||'#eaa85c',ink='#384550',cream='#fff4dc';
  ctx.save();ctx.translate(x-size/2,y-size/2);ctx.scale(size/100,size/100);
  const ellipse=(x,y,rx,ry,fill,rotation=0)=>{ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);ctx.fill()};
  const polygon=(points,fill)=>{ctx.fillStyle=fill;ctx.beginPath();for(const [x,y] of points)ctx.lineTo(x,y);ctx.closePath();ctx.fill()};
  const line=(points,stroke,width=3)=>{ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke()};
  if(animal==='lion'){
    for(let i=0;i<12;i++){const a=i*Math.PI/6;ellipse(50+Math.cos(a)*31,53+Math.sin(a)*30,13,15,'#986637',a)}
  }
  if(animal==='sheep')for(let i=0;i<14;i++){const a=i*Math.PI/7;ellipse(50+Math.cos(a)*30,50+Math.sin(a)*27,11,11,'#fffdf1')}
  if(animal==='deer')for(const sign of [-1,1]){const x=50+sign*18;line([[x,32],[x+sign*3,13],[x+sign*12,7]],'#8d6244',4);line([[x+sign*2,20],[x-sign*7,13]],'#8d6244',3)}
  if(animal==='cow')for(const sign of [-1,1])polygon([[50+sign*18,31],[50+sign*27,13],[50+sign*29,34]],'#bba580');
  if(animal==='rabbit'){
    ellipse(34,24,9,23,color,-.15);ellipse(66,24,9,23,color,.15);ellipse(34,21,4,16,'#efbfd0',-.15);ellipse(66,21,4,16,'#efbfd0',.15);
  }else if(['cat','fox','tiger'].includes(animal)){
    for(const sign of [-1,1]){const x=50+sign*23;polygon([[x-sign*13,36],[x+sign*8,10],[x+sign*17,41]],color);polygon([[x-sign*5,32],[x+sign*7,19],[x+sign*10,34]],'#f4bea5')}
  }else if(animal==='dog'){
    ellipse(21,48,12,27,'#805e47',.2);ellipse(79,48,12,27,'#805e47',-.2);
  }else if(animal==='elephant'){
    ellipse(20,51,18,27,color);ellipse(80,51,18,27,color);ellipse(18,53,10,18,'#d5bfc8');ellipse(82,53,10,18,'#d5bfc8');
  }else if(!['frog','penguin','owl','chick'].includes(animal)){
    const big=animal==='koala',ear=animal==='panda'?ink:color;
    ellipse(25,30,big?17:11,big?17:12,ear);ellipse(75,30,big?17:11,big?17:12,ear);
    if(animal!=='panda'){ellipse(25,30,big?10:6,big?11:7,'#eac7ba');ellipse(75,30,big?10:6,big?11:7,'#eac7ba')}
  }
  const head=ctx.createRadialGradient(35,34,3,50,55,44);head.addColorStop(0,color);head.addColorStop(1,color+'dd');
  ellipse(50,54,33,32,head);
  if(animal==='fox'){polygon([[18,48],[49,64],[32,79]],cream);polygon([[82,48],[51,64],[68,79]],cream)}
  if(animal==='penguin')ellipse(50,59,25,28,'#fff9e9');
  if(animal==='monkey'){ellipse(38,46,20,21,'#f1d4ae');ellipse(62,46,20,21,'#f1d4ae');ellipse(50,63,23,20,'#f1d4ae')}
  if(animal==='cow'){ellipse(29,39,11,15,ink,.5);ellipse(69,56,10,13,ink,-.4)}
  if(animal==='panda'){ellipse(35,49,10,14,ink,.4);ellipse(65,49,10,14,ink,-.4)}
  if(animal==='raccoon'){ellipse(50,46,31,12,ink);ellipse(50,63,20,15,cream);line([[37,80],[43,86],[49,80],[55,86],[61,80]],'#818c86',3)}
  if(animal==='tiger'){
    for(let i=0;i<3;i++)polygon([[41+i*7,24],[44+i*5,40],[46+i*6,24]],ink);
    for(const sign of [-1,1])for(let i=0;i<2;i++)polygon([[50+sign*31,48+i*10],[50+sign*18,52+i*10],[50+sign*31,54+i*10]],ink);
    ellipse(50,66,19,13,cream);
  }
  if(animal==='owl'){
    polygon([[22,33],[20,17],[43,30]],'#81684c');polygon([[78,33],[80,17],[57,30]],'#81684c');
    ellipse(35,46,18,19,cream);ellipse(65,46,18,19,cream);ellipse(35,46,12,13,'#dcbb64');ellipse(65,46,12,13,'#dcbb64');
    for(let i=0;i<3;i++)line([[36+i*9,71],[40+i*9,76],[44+i*9,71]],'#896f50',2);
  }
  if(animal==='frog'){ellipse(29,30,14,15,color);ellipse(71,30,14,15,color);ellipse(50,68,23,10,'#bbd995')}
  if(animal==='chick'){line([[42,26],[45,12],[51,25],[56,17]],'#e3af44',4);ellipse(24,62,8,14,'#f0c35e',-.5);ellipse(76,62,8,14,'#f0c35e',.5)}
  if(animal==='deer'){for(const sign of [-1,1])for(let i=0;i<3;i++)ellipse(50+sign*(19+i%2*4),59+i*6,2,2,cream)}
  if(animal==='sheep')ellipse(50,56,24,27,'#b4a79d');
  // Large eyes and small white catches read at both portrait and token sizes.
  const eyeY=animal==='frog'?29:48,eyeX=animal==='frog'?21:15;
  for(const sign of [-1,1]){const ex=50+sign*eyeX;ellipse(ex,eyeY,animal==='owl'?6:5,animal==='owl'?8:6,ink);ellipse(ex-1.5,eyeY-2,1.8,2,'#fff')}
  if(animal==='pig'){
    ellipse(50,64,18,13,'#e68eaa');ellipse(43,64,3,4,'#a64e72');ellipse(57,64,3,4,'#a64e72');
  }else if(animal==='cow'){
    ellipse(50,69,24,12,'#e9b1ad');ellipse(40,69,3,3,'#976366');ellipse(60,69,3,3,'#976366');
  }else if(animal==='elephant'){
    const trunk=()=>{ctx.beginPath();ctx.moveTo(50,58);ctx.bezierCurveTo(46,82,52,91,62,78);ctx.stroke()};
    ctx.lineCap='round';ctx.strokeStyle='#5d819e';ctx.lineWidth=16;trunk();
    ctx.strokeStyle='#b5ccdc';ctx.lineWidth=11;trunk();
    line([[48,62],[54,62]],'#6d91a9',1.5);line([[47,69],[53,69]],'#6d91a9',1.5);line([[48,76],[54,76]],'#6d91a9',1.5);
    polygon([[36,64],[38,78],[43,66]],cream);polygon([[64,64],[62,78],[57,66]],cream);
  }else if(['owl','penguin','chick'].includes(animal))polygon([[43,59],[57,59],[50,70]],'#e5a34d');
  else if(animal==='koala')ellipse(50,57,8,13,ink);
  else if(animal==='frog')line([[30,62],[40,70],[60,70],[70,62]],'#366c46',2.5);
  else{
    if(['bear','dog','lion'].includes(animal))ellipse(50,65,19,12,cream);
    polygon([[44,59],[56,59],[50,65]],animal==='rabbit'||animal==='cat'?'#cf8196':ink);
    line([[50,65],[50,71],[44,74]],ink,1.8);line([[50,71],[56,74]],ink,1.8);
  }
  if(['cat','rabbit','lion'].includes(animal))for(const sign of [-1,1])for(let i=0;i<2;i++)line([[50+sign*17,62+i*5],[50+sign*29,60+i*8]],'#78675e',1.4);
  if(!['panda','raccoon','cow'].includes(animal)){ellipse(28,60,5,2.5,'#ed8d9b50');ellipse(72,60,5,2.5,'#ed8d9b50')}
  ctx.restore();
}
