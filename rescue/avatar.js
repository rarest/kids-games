import { createAsset } from './materials.js';

export function createAvatar(character='chip',pool){
 const a=createAsset(pool,character),{group,part,joint}=a;const dale=character==='dale';
 const fur=dale?'#ad652e':'#85502e',cream='#f4d8aa',dark='#392723';
 const body=joint('body',[0,0,0]);
 const tail=joint('striped-tail',[-.24,.41,-.18],body);tail.rotation.z=-.45;
 part('sphere',fur,[.27,.69,.24],[0,.13,0],'tail',tail);
 for(const [x,color] of [[-.065,cream],[0,dark],[.065,cream]])part('sphere',color,[.048,.57,.035],[x,.16,.116],'tail-stripe',tail);
 part('sphere',cream,[.45,.58,.34],[0,.51,.02],'belly',body);
 if(dale){
  const shirt=part('sphere','#db4537',[.54,.46,.39],[0,.57,0],'floral-shirt',body,'fabric');
  for(let i=0;i<9;i++){const x=((i%3)-1)*.14,y=.43+Math.floor(i/3)*.12;for(let j=0;j<5;j++)part('sphere','#ffdc81',[.046,.05,.02],[x+Math.cos(j*1.257)*.025,y+Math.sin(j*1.257)*.026,.193],'flower-petal',body);}
  shirt.rotation.z=-.04;
 }else{
  for(const side of [-1,1])part('sphere','#995e39',[.2,.43,.37],[side*.19,.57,0],'jacket',body,'fabric');
  for(const side of [-1,1]){const lapel=part('round','#c79050',[.1,.24,.06],[side*.125,.69,.18],'lapel',body,'fabric');lapel.rotation.z=side*.28;}
 }
 const head=joint('head',[0,.97,.025],body);
 part('sphere',fur,[.66,.56,.43],[0,0,0],'head-fur',head);
 for(const side of [-1,1]){
  part('sphere',fur,[.23,.28,.16],[side*.27,.20,-.025],'ear',head);
  part('sphere','#daac80',[.14,.18,.035],[side*.27,.20,.061],'inner-ear',head);
  part('sphere',cream,[.32,.25,.19],[side*.145,-.12,.18],'cheek',head);
  part('sphere','#fff8e7',[.18,.245,.085],[side*.125,.046,.214],'eye',head);
  part('sphere','#292126',[.075,.125,.045],[side*.123+.02,.037,.254],'pupil',head);
  part('sphere','#ffffff',[.027,.038,.012],[side*.123+.033,.070,.274],'eye-glint',head);
  const brow=part('sphere',dark,[.2,.045,.04],[side*.125,.185,.204],'brow',head);brow.rotation.z=side*(dale?.2:-.12);
 }
 part('sphere',dale?'#cd3d36':'#302125',[dale?.18:.125,.115,.12],[0,-.075,.326],'nose',head);
 part('sphere','#663724',[.18,.086,.04],[0,-.202,.241],'smile',head);
 for(const side of [-1,1])part('round','#fff6df',[.051,.084,.04],[side*.029,-.18,.262],'tooth',head);
 if(dale){for(const side of [-1,0,1]){const hair=part('cone',fur,[.13,.2,.1],[side*.09,.29,.015],'tuft',head);hair.rotation.z=side*.25;}}
 else {const hat=joint('fedora',[0,.27,0],head);hat.rotation.z=-.1;part('sphere','#b9945c',[.76,.09,.58],[0,0,0],'hat-brim',hat,'fabric');part('round','#b9945c',[.47,.24,.36],[0,.1,-.025],'hat-crown',hat,'fabric');part('round','#57412e',[.485,.075,.37],[0,.055,-.025],'hat-ribbon',hat);}
 const arms=[],legs=[];
 for(const side of [-1,1]){
  const arm=joint(side<0?'left-arm':'right-arm',[side*.25,.68,.01],body);arms.push(arm);
  part('sphere',dale?'#dc493b':'#955e39',[.17,.31,.19],[0,-.11,0],'sleeve',arm,'fabric');
  part('sphere',cream,[.18,.18,.18],[0,-.29,.025],'hand',arm);
  const leg=joint(side<0?'left-leg':'right-leg',[side*.13,.30,0],body);legs.push(leg);
  part('sphere',fur,[.18,.26,.23],[0,-.1,0],'leg',leg);part('sphere',fur,[.24,.13,.33],[side*.025,-.24,.07],'foot',leg);
 }
 const baseUpdate=a.update;
 a.update=(p,time=0)=>{
  baseUpdate(p);group.rotation.y=(p.facing??1)<0?-.38:.38;const run=p.animation==='run'||(p.carrying&&Math.abs(p.vx??0)>.1),wave=run?Math.sin(time*17)*.57:0;
  body.scale.y=p.hidden?.38:1;body.position.y=run?Math.abs(Math.sin(time*17))*.025:Math.sin(time*3)*.008;
  for(let i=0;i<2;i++){legs[i].rotation.z=(i?1:-1)*wave;arms[i].rotation.z=p.carrying?(i?2.95:-2.95):(i?wave:-wave)*.7;arms[i].position.y=p.carrying?.75:.68;const reach=p.carrying?2.4:1;arms[i].getObjectByName('sleeve').scale.y=.31*reach;arms[i].getObjectByName('sleeve').position.y=-.11*reach;arms[i].getObjectByName('hand').position.y=-.29*reach;}
  if(p.animation==='jump'||p.animation==='held'){legs[0].rotation.z=-.35;legs[1].rotation.z=.35;if(!p.carrying){arms[0].rotation.z=-1;arms[1].rotation.z=1;}}
  head.rotation.z=p.animation==='hurt'?.2:Math.sin(time*2)*.018;tail.rotation.z=-.45+wave*.12;
  group.visible=(p.lives??1)>0&&(!(p.invulnerable>0)||Math.floor(time*15)%3!==0);
 };return a;
}
