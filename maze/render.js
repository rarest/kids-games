import { cellKey, parseGrid } from './level-tools.js?v=20260830b';
import { SKINS } from './economy.js?v=20260830b';
import { buildWallModel, shadowOffsetFor, traceWallPath, visualSizesFor, wallShadowLayersFor, wallSignatureFor } from './wall-geometry.js?v=20260830b';
import { actorIsVisible, actorScreenPointFor, ambientActorsFor, ambientLayerFor, detailPassesFor, environmentMotion, sceneProfileFor, sceneRenderPlanFor, treePaletteFor, treeShadowFor, waterCycleStateFor } from './scenery.js?v=20260830b';
import { activeTrails, createMotionState, grassSwayAt, recordStep } from './motion-effects.js?v=20260830b';

export { shadowOffsetFor } from './wall-geometry.js?v=20260830b';
export { detailPassesFor, environmentMotion, sceneProfileFor };

export const MAX_PARTICLES = 220;
export const LAYER_ORDER = ['backdrop','tree-shadow','ambient','floor','wall-shadow','wall','wall-highlight','decor','exit','objects','player-shadow','player','particles'];
export const clampDpr = value => Math.min(2, Math.max(1, Number(value) || 1));
const NOOP=()=>{};
const EFFECT_PAINT_FIELD={
  'cherry-canopy':'cherryTrees','emerald-glow':'emeraldGlow','purple-refraction':'purpleRefraction',
  'rainbow-refraction':'rainbowRefraction',mist:'mist','curtain-light':'curtainLight',
  'crimson-tree-shadow':'crimsonTreeShadow','dark-tree-shadow':'darkTreeShadow','sunset-refraction':'sunsetRefraction'
};
const ACTOR_PAINT_FIELD={
  leaf:'leaves','gold-leaf':'goldLeaves','maple-leaf':'mapleLeaves','laurel-leaf':'laurelLeaves',petal:'petals',
  bee:'bees','honey-drop':'honey','water-drop':'water',ripple:'ripples',bubble:'bubbles',pearl:'pearls',coral:'coral',
  'fish-shadow':'fishShadows',vine:'vines',firefly:'fireflies',star:'stars','crown-light':'crownLights',crystal:'crystals',
  gem:'gems',candy:'candy',snow:'snow',cloud:'clouds',meteor:'meteors',aurora:'aurora'
};

export function lightSourceFor(profile,viewport){
  const shadow=shadowOffsetFor(profile,1),length=Math.hypot(shadow.x,shadow.y)||1;
  return{x:viewport.width*.5-shadow.x/length*viewport.width*.42,y:viewport.height*.5-shadow.y/length*viewport.height*.58};
}

export function drawSceneEffect(ctx,effect,viewport,theme,now,markPaint=NOOP){
  const width=viewport.width,height=viewport.height,pulse=.82+Math.sin(now/900)*.12;
  ctx.save();
  if(effect==='cherry-canopy'){
    ctx.globalAlpha=.18;ctx.fillStyle='#f3a6c0';
    for(const side of [0,1])for(let index=0;index<7;index++){const x=side?width-index*9:index*9,y=height*(.08+(index%3)*.04);ctx.beginPath();ctx.ellipse(x,y,18,6,(side?-1:1)*.5,0,Math.PI*2);ctx.fill()}
  }else if(effect==='emerald-glow'){
    const glow=ctx.createRadialGradient(width*.5,height*.4,0,width*.5,height*.4,width*.58);glow.addColorStop(0,`rgba(88,255,181,${.17*pulse})`);glow.addColorStop(1,'rgba(18,103,73,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
  }else if(effect==='purple-refraction'){
    ctx.globalAlpha=.13;ctx.fillStyle='#d59cff';for(let index=0;index<4;index++){const x=width*(.12+index*.23);ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+width*.18,0);ctx.lineTo(x-width*.08,height);ctx.lineTo(x-width*.2,height);ctx.closePath();ctx.fill()}
  }else if(effect==='rainbow-refraction'){
    const colors=['#ff8cab','#ffd774','#7ce5bd','#7ebdff','#c597ff'];ctx.globalAlpha=.13;
    for(let index=0;index<colors.length;index++){const x=width*(.15+index*.17),y=height*(.24+(index%2)*.34),size=18+(index%3)*5;ctx.fillStyle=colors[index];ctx.beginPath();ctx.moveTo(x,y-size);ctx.lineTo(x+size*.55,y);ctx.lineTo(x,y+size);ctx.lineTo(x-size*.55,y);ctx.closePath();ctx.fill()}
  }else if(effect==='mist'){
    ctx.globalAlpha=.09;ctx.fillStyle='#e8f2df';for(let index=0;index<5;index++){const x=((index*.24+now*.000006)%1.2-.1)*width,y=height*(.22+index*.14);ctx.beginPath();ctx.ellipse(x,y,width*.2,height*.035,0,0,Math.PI*2);ctx.fill()}
  }else if(effect==='curtain-light'){
    const light=ctx.createLinearGradient(0,0,0,height);light.addColorStop(0,'rgba(255,166,178,.18)');light.addColorStop(1,'rgba(113,11,40,0)');ctx.fillStyle=light;for(const x of [width*.18,width*.5,width*.82]){ctx.beginPath();ctx.moveTo(x-22,0);ctx.lineTo(x+22,0);ctx.lineTo(x+80,height);ctx.lineTo(x+20,height);ctx.closePath();ctx.fill()}
  }else if(effect==='crimson-tree-shadow'||effect==='dark-tree-shadow'){
    ctx.globalAlpha=effect==='crimson-tree-shadow'?.13:.16;ctx.fillStyle=effect==='crimson-tree-shadow'?'#6d1733':'#080d28';for(const x of [0,width]){ctx.beginPath();ctx.ellipse(x,height*.52,width*.18,height*.42,0,0,Math.PI*2);ctx.fill()}
  }else if(effect==='sunset-refraction'){
    const sunset=ctx.createLinearGradient(0,0,width,height);sunset.addColorStop(0,'rgba(255,184,102,.18)');sunset.addColorStop(.5,'rgba(255,120,178,.08)');sunset.addColorStop(1,'rgba(114,91,255,0)');ctx.fillStyle=sunset;ctx.beginPath();ctx.moveTo(width*.48,0);ctx.lineTo(width*.76,0);ctx.lineTo(width*.42,height);ctx.lineTo(width*.08,height);ctx.closePath();ctx.fill();
  }else{
    ctx.restore();throw new RangeError(`Unknown scene effect: ${effect}`);
  }
  markPaint(EFFECT_PAINT_FIELD[effect]);
  ctx.restore();
}

function drawSceneEffects(ctx,effects,viewport,theme,now,markPaint){for(const effect of effects)drawSceneEffect(ctx,effect,viewport,theme,now,markPaint)}

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const rgba = (hex, alpha) => {
  const clean = hex.replace('#', '');
  const value = Number.parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  return `rgba(${value >> 16},${value >> 8 & 255},${value & 255},${alpha})`;
};

export function cameraFor(player, level, viewport) {
  const width = level.rows[0].length;
  const height = level.rows.length;
  const fitScale = Math.min((viewport.width - 24) / width, (viewport.height - 24) / height);
  if (fitScale >= 16) {
    return {
      mode: 'fit', scale: fitScale,
      x: (viewport.width - width * fitScale) / 2,
      y: (viewport.height - height * fitScale) / 2
    };
  }
  const scale = clamp(Math.min(viewport.width / 12.5, viewport.height / 14), 23, 31);
  const worldWidth = width * scale, worldHeight = height * scale;
  const desiredX = viewport.width / 2 - (player.x + .5) * scale;
  const desiredY = viewport.height / 2 - (player.y + .5) * scale;
  return {
    mode: 'follow', scale,
    x: worldWidth <= viewport.width ? (viewport.width - worldWidth) / 2 : clamp(desiredX, viewport.width - worldWidth - 8, 8),
    y: worldHeight <= viewport.height ? (viewport.height - worldHeight) / 2 : clamp(desiredY, viewport.height - worldHeight - 8, 8)
  };
}

function rounded(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, width, height, radius);
  else {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.moveTo(x + r, y); ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r); ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r); ctx.closePath();
  }
}

function drawKey(ctx, x, y, size, theme, pulse) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-.42); ctx.shadowColor = theme.glow; ctx.shadowBlur = size * (.3 + pulse * .15);
  const gradient = ctx.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2);
  gradient.addColorStop(0, '#fff8bd'); gradient.addColorStop(.45, theme.accent); gradient.addColorStop(1, '#a96413');
  ctx.strokeStyle = gradient; ctx.lineWidth = Math.max(2, size * .16); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(-size * .2, 0, size * .22, 0, Math.PI * 2); ctx.moveTo(0, 0); ctx.lineTo(size * .42, 0); ctx.lineTo(size * .42, size * .18); ctx.moveTo(size * .22, 0); ctx.lineTo(size * .22, size * .15); ctx.stroke(); ctx.restore();
}

function drawCoin(ctx, x, y, size, pulse) {
  ctx.save(); ctx.translate(x, y); ctx.scale(.72 + pulse * .08, 1); ctx.shadowColor = '#ffd240'; ctx.shadowBlur = size * .45;
  const gradient = ctx.createRadialGradient(-size * .18, -size * .25, 1, 0, 0, size * .55);
  gradient.addColorStop(0, '#fffbd0'); gradient.addColorStop(.32, '#ffe46e'); gradient.addColorStop(.75, '#e9a927'); gradient.addColorStop(1, '#8d4f0b');
  ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(0, 0, size * .45, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,210,.72)'; ctx.lineWidth = size * .06; ctx.stroke(); ctx.fillStyle = '#9c6516'; ctx.font = `900 ${size * .42}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('♛', 0, size * .02); ctx.restore();
}

function drawDoor(ctx, x, y, size, theme, unlocked) {
  ctx.save(); ctx.translate(x, y); ctx.shadowColor = unlocked ? theme.glow : 'rgba(0,0,0,.6)'; ctx.shadowBlur = unlocked ? size * .5 : size * .2;
  const gradient = ctx.createLinearGradient(0, -size * .48, 0, size * .45);
  gradient.addColorStop(0, unlocked ? '#fff3a3' : theme.wallEdge); gradient.addColorStop(.2, unlocked ? '#dca941' : theme.wall); gradient.addColorStop(1, unlocked ? '#78420d' : theme.wallShadow);
  ctx.fillStyle = gradient; rounded(ctx, -size * .36, -size * .42, size * .72, size * .88, size * .3); ctx.fill();
  ctx.strokeStyle = rgba(unlocked ? '#fff4b2' : theme.wallEdge, .8); ctx.lineWidth = size * .06; ctx.stroke();
  ctx.fillStyle = unlocked ? '#fff4a3' : '#846d91'; ctx.beginPath(); ctx.arc(size * .17, size * .04, size * .055, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(35,16,18,.45)'; ctx.font = `700 ${size * .34}px serif`; ctx.textAlign = 'center'; ctx.fillText(unlocked ? '♛' : '◆', 0, -size * .03); ctx.restore();
}

function drawPlayer(ctx, x, y, radius, skinId, now, moving) {
  const skin = SKINS.find(item => item.id === skinId) || SKINS[0];
  const special = ['silver', 'gold', 'iridescent'].includes(skin.id);
  const bob = Math.sin(now / 120) * radius * (moving ? .08 : .03);
  ctx.save();ctx.translate(x,y+bob);ctx.beginPath();ctx.arc(0,0,radius*.74,0,Math.PI*2);ctx.clip();
  if (special) {
    const aura = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    aura.addColorStop(0, rgba(skin.color, .34)); aura.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill();
  }
  let gradient;
  if (skin.id === 'iridescent') {
    gradient = ctx.createLinearGradient(-radius, -radius, radius, radius);
    const colors = ['#ff6e95','#ffe06e','#70f0c6','#6fb2ff','#b979ff'];
    const shift = Math.floor(now / 420) % colors.length;
    for (let index = 0; index <= colors.length; index++) gradient.addColorStop(index / colors.length, colors[(index + shift) % colors.length]);
  } else {
    gradient = ctx.createRadialGradient(-radius*.26,-radius*.34,radius*.06,0,0,radius*.76);
    gradient.addColorStop(0, '#fff'); gradient.addColorStop(.18, skin.color); gradient.addColorStop(.7, skin.color); gradient.addColorStop(1, skin.id === 'silver' ? '#718596' : skin.id === 'gold' ? '#9a5b0d' : '#77152a');
  }
  ctx.shadowColor=skin.color;ctx.shadowBlur=special?radius*.55:radius*.28;ctx.fillStyle=gradient;
  ctx.beginPath();ctx.arc(0,0,radius*.72,0,Math.PI*2);ctx.fill();
  const glintBoost=special?1.45:1;
  for(const [gx,gy,size,alpha] of [[-.25,-.28,.09,.33],[.22,.15,.055,.22],[.03,-.43,.04,.18]]){ctx.globalAlpha=alpha*glintBoost;ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(gx*radius,gy*radius,size*radius,size*radius*.48,-.55,0,Math.PI*2);ctx.fill()}
  ctx.restore();
  ctx.save();ctx.translate(x,y+bob);ctx.fillStyle='#ffe477';ctx.font=`700 ${radius*.52}px serif`;ctx.textAlign='center';ctx.fillText('♛',0,-radius*.56);ctx.restore();
}

function decorSeed(level) {
  return [...level.theme.decor].reduce((sum, character) => sum + character.charCodeAt(0), 0);
}

function drawGrassTuft(ctx,x,y,size,sway,color){
  const motion=typeof sway==='number'?{amount:sway,direction:{x:1,y:0}}:sway;
  const bend=motion.amount*(motion.direction.x||motion.direction.y*.26),lay=motion.amount*motion.direction.y*.42;
  ctx.save();ctx.translate(x,y);ctx.strokeStyle=color;ctx.lineWidth=Math.max(.7,size*.08);ctx.lineCap='round';
  for(let blade=-1;blade<=1;blade++){ctx.beginPath();ctx.moveTo(blade*size*.1,0);ctx.quadraticCurveTo(blade*size*.18+bend*size,size*(-.3+lay*.35),blade*size*.28+bend*size,size*(-.58+lay));ctx.stroke()}
  ctx.restore();
}

function drawTrailStar(ctx,x,y,size){ctx.beginPath();ctx.moveTo(x,y-size);ctx.lineTo(x+size*.36,y-size*.36);ctx.lineTo(x+size,y);ctx.lineTo(x+size*.36,y+size*.36);ctx.lineTo(x,y+size);ctx.lineTo(x-size*.36,y+size*.36);ctx.lineTo(x-size,y);ctx.lineTo(x-size*.36,y-size*.36);ctx.closePath();ctx.fill()}

function drawMotionTrails(ctx,trails,px,py,tile,now){
  for(const trail of trails){
    const style=trail.style,angle=Math.atan2(trail.direction.y,trail.direction.x),x=px(trail.from.x+.5),y=py(trail.from.y+.5),alpha=trail.alpha;
    ctx.save();ctx.globalAlpha=alpha*.42;ctx.fillStyle=style.colors[0];ctx.translate(x,y);ctx.rotate(angle);ctx.beginPath();ctx.ellipse(-tile*.1,0,tile*.115,tile*.052,0,0,Math.PI*2);ctx.fill();ctx.restore();
    for(let index=0;index<3;index++){
      const spread=(index-1)*tile*.07;
      ctx.save();ctx.globalAlpha=alpha*(.22-index*.035);ctx.fillStyle=style.colors[index%style.colors.length];ctx.beginPath();ctx.arc(x-trail.direction.x*tile*(.16+index*.045)+trail.direction.y*spread,y-trail.direction.y*tile*(.16+index*.045)-trail.direction.x*spread,tile*(.025+index*.006),0,Math.PI*2);ctx.fill();ctx.restore();
      if(style.rainbow){ctx.save();ctx.globalAlpha=alpha*.18;ctx.strokeStyle=style.colors[(index+2)%style.colors.length];ctx.lineWidth=Math.max(.7,tile*.018);ctx.beginPath();ctx.arc(x-trail.direction.x*tile*.2,y-trail.direction.y*tile*.2,tile*(.12+index*.028),angle-.75,angle+.75);ctx.stroke();ctx.restore()}
      if(style.stars&&index===0){ctx.save();ctx.globalAlpha=alpha*(style.rainbow?.5:.32);ctx.fillStyle='#fff8c9';drawTrailStar(ctx,x+trail.direction.y*tile*.15,y-trail.direction.x*tile*.15,tile*.045);ctx.restore()}
    }
    if(style.moons){ctx.save();ctx.globalAlpha=alpha*.38;ctx.fillStyle='#fff7d2';ctx.font=`${tile*.16}px serif`;ctx.textAlign='center';ctx.fillText('☾',x+trail.direction.y*tile*.18,y-trail.direction.x*tile*.18);ctx.restore()}
  }
}

function drawTree(ctx,x,y,size,palette,sway,seed){
  ctx.save();ctx.translate(x,y);ctx.rotate(sway*.16);ctx.shadowColor='rgba(15,35,18,.34)';ctx.shadowBlur=size*.08;
  const trunk=ctx.createLinearGradient(-size*.12,0,size*.16,0);trunk.addColorStop(0,palette.trunk[0]);trunk.addColorStop(.45,palette.trunk[1]);trunk.addColorStop(1,palette.trunk[2]);ctx.fillStyle=trunk;
  ctx.beginPath();ctx.moveTo(-size*.12,size*.55);ctx.quadraticCurveTo(-size*.16,size*.08,-size*.05,-size*.28);ctx.lineTo(size*.08,-size*.28);ctx.quadraticCurveTo(size*.2,size*.16,size*.14,size*.55);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#694222';ctx.lineWidth=size*.047;ctx.lineCap='round';ctx.beginPath();
  for(let branch=0;branch<7;branch++){const side=branch%2?-1:1,startY=size*(.02-branch*.055),endX=side*size*(.2+branch*.035),endY=-size*(.2+branch*.052);ctx.moveTo(0,startY);ctx.quadraticCurveTo(endX*.42,endY*.55,endX,endY)}ctx.stroke();
  const leafColors=palette.leaves;
  for(let index=0;index<44;index++){const angle=index*2.399+seed*.1,radius=size*(.1+(index%7)*.047),lx=Math.cos(angle)*radius,ly=-size*.39+Math.sin(angle)*radius*.62,leafAngle=angle+sway*.5;ctx.fillStyle=leafColors[index%leafColors.length];ctx.globalAlpha=.62+(index%4)*.09;ctx.beginPath();ctx.ellipse(lx,ly,size*(.065+(index%3)*.008),size*(.022+(index%2)*.005),leafAngle,0,Math.PI*2);ctx.fill()}
  ctx.restore();ctx.globalAlpha=1;
}

function drawTreeShadow(ctx,x,y,size,tree,profile,now){
  const shadow=treeShadowFor(tree,profile,now),angle=Math.atan2(shadow.y,shadow.x);
  ctx.save();ctx.translate(x+shadow.x*size,y+shadow.y*size);ctx.rotate(angle);ctx.scale(shadow.scaleX,1);
  ctx.fillStyle=profile.goldTreeShadow||profile.goldGleam?`rgba(116,78,9,${shadow.alpha})`:`rgba(10,18,14,${shadow.alpha})`;
  ctx.beginPath();ctx.ellipse(0,0,size*.58,size*.16,0,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=.42;for(let index=0;index<9;index++){const offset=(index-4)*size*.095;ctx.beginPath();ctx.ellipse(offset,Math.sin(index)*size*.035,size*.12,size*.035,index*.3,0,Math.PI*2);ctx.fill()}
  ctx.restore();
}

function drawRose(ctx,x,y,size,theme,rotation=0){
  ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.strokeStyle='#397448';ctx.lineWidth=Math.max(1,size*.09);ctx.beginPath();ctx.moveTo(0,size*.5);ctx.quadraticCurveTo(size*.04,size*.15,0,0);ctx.stroke();
  const colors=['#ffe1e1','#ff93a9','#d84068','#7d1737'];for(let ring=3;ring>=0;ring--)for(let petal=0;petal<5;petal++){const angle=petal*Math.PI*2/5+ring*.52;ctx.fillStyle=colors[ring];ctx.beginPath();ctx.ellipse(Math.cos(angle)*size*ring*.045,Math.sin(angle)*size*ring*.045,size*(.18-ring*.018),size*(.11-ring*.01),angle,0,Math.PI*2);ctx.fill()}
  ctx.fillStyle=theme.accent;ctx.beginPath();ctx.arc(0,0,size*.055,0,Math.PI*2);ctx.fill();ctx.restore();
}

function drawCrown(ctx,x,y,size,color,alpha=.44){
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.strokeStyle='rgba(255,249,202,.74)';ctx.lineWidth=Math.max(1,size*.055);ctx.shadowColor=color;ctx.shadowBlur=size*.28;
  ctx.beginPath();ctx.moveTo(-size*.5,size*.24);ctx.lineTo(-size*.42,-size*.22);ctx.lineTo(-size*.16,size*.02);ctx.lineTo(0,-size*.4);ctx.lineTo(size*.16,size*.02);ctx.lineTo(size*.42,-size*.22);ctx.lineTo(size*.5,size*.24);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(255,250,190,.74)';for(const dx of [-.3,0,.3]){ctx.beginPath();ctx.arc(size*dx,size*(dx===0?-.29:-.12),size*.055,0,Math.PI*2);ctx.fill()}ctx.restore();
}

function drawAmbientActor(ctx,actor,point,profile,theme,now,viewport,markPaint=NOOP){
  const {x,y}=point,size=Math.min(viewport.width,viewport.height)*.025*actor.scale,spin=actor.phase+now*actor.speed*.001;
  let painted=true;
  ctx.save();ctx.translate(x,y);
  if(['leaf','gold-leaf','maple-leaf','laurel-leaf','petal'].includes(actor.type)){
    const colors={leaf:'#8bcf72','gold-leaf':'#f6ce55','maple-leaf':'#dc7846','laurel-leaf':'#9fb46a',petal:profile.roses?'#ff8fa7':'#ffd3df'};
    ctx.rotate(spin);ctx.globalAlpha=.42;ctx.fillStyle=colors[actor.type];ctx.beginPath();ctx.ellipse(0,0,size*.7,size*.22,.3,0,Math.PI*2);ctx.fill();
  }else if(actor.type==='bee'){
    ctx.rotate(Math.sin(spin)*.22);ctx.globalAlpha=.46;ctx.fillStyle='#f4c344';ctx.beginPath();ctx.ellipse(0,0,size*.58,size*.34,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#57371d';ctx.lineWidth=Math.max(.7,size*.13);ctx.beginPath();ctx.moveTo(-size*.18,-size*.28);ctx.lineTo(-size*.18,size*.28);ctx.moveTo(size*.18,-size*.28);ctx.lineTo(size*.18,size*.28);ctx.stroke();ctx.fillStyle='rgba(238,249,255,.32)';ctx.beginPath();ctx.ellipse(-size*.2,-size*.42,size*.42,size*.2,-.4,0,Math.PI*2);ctx.ellipse(size*.2,-size*.42,size*.42,size*.2,.4,0,Math.PI*2);ctx.fill();
  }else if(actor.type==='honey-drop'){
    ctx.globalAlpha=.34;ctx.fillStyle='#ffc34f';ctx.beginPath();ctx.moveTo(0,-size*.8);ctx.bezierCurveTo(size*.6,-size*.1,size*.55,size*.55,0,size*.72);ctx.bezierCurveTo(-size*.55,size*.55,-size*.6,-size*.1,0,-size*.8);ctx.fill();
  }else if(actor.type==='water-drop'){
    const state=waterCycleStateFor(actor,now);painted=state.dropAlpha>0;ctx.translate(0,state.dropOffset*size);ctx.globalAlpha=state.dropAlpha;ctx.fillStyle='#aeefff';ctx.beginPath();ctx.moveTo(0,-size*.8);ctx.bezierCurveTo(size*.6,-size*.1,size*.55,size*.55,0,size*.72);ctx.bezierCurveTo(-size*.55,size*.55,-size*.6,-size*.1,0,-size*.8);ctx.fill();
  }else if(actor.type==='ripple'){
    const state=waterCycleStateFor(actor,now);painted=state.rippleAlpha>0;ctx.globalAlpha=state.rippleAlpha;ctx.strokeStyle='rgb(185,242,255)';ctx.lineWidth=1;for(let ring=1;ring<=state.rings;ring++){const radius=size*state.rippleRadius*ring;ctx.beginPath();ctx.ellipse(0,0,radius,radius*.35,0,0,Math.PI*2);ctx.stroke()}
  }else if(actor.type==='bubble'||actor.type==='pearl'){
    ctx.globalAlpha=actor.type==='pearl'?.28:.18;ctx.strokeStyle=actor.type==='pearl'?'#fff4df':'#bfefff';ctx.fillStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.arc(0,0,size*(actor.type==='pearl'?.55:.4),0,Math.PI*2);actor.type==='pearl'?ctx.fill():ctx.stroke();
  }else if(actor.type==='coral'){
    ctx.globalAlpha=.28;ctx.strokeStyle='#ff8d94';ctx.lineWidth=Math.max(1,size*.22);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,size);ctx.lineTo(0,-size*.5);ctx.moveTo(0,0);ctx.lineTo(-size*.6,-size*.7);ctx.moveTo(0,-size*.1);ctx.lineTo(size*.58,-size*.78);ctx.stroke();
  }else if(actor.type==='fish-shadow'){
    ctx.rotate(Math.sin(spin)*.12);ctx.globalAlpha=.11;ctx.fillStyle='#071c35';ctx.beginPath();ctx.ellipse(0,0,size*1.1,size*.42,0,0,Math.PI*2);ctx.moveTo(-size*.9,0);ctx.lineTo(-size*1.55,-size*.55);ctx.lineTo(-size*1.55,size*.55);ctx.closePath();ctx.fill();
  }else if(actor.type==='vine'){
    ctx.globalAlpha=.25;ctx.strokeStyle='#70cb86';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-size*2);ctx.bezierCurveTo(size,size*-1,-size,size,0,size*2);ctx.stroke();
  }else if(actor.type==='firefly'||actor.type==='star'||actor.type==='crown-light'){
    const color=actor.type==='firefly'?'#c9ff8a':actor.type==='star'?'#d8e7ff':'#ffe27e';ctx.globalAlpha=.2+(Math.sin(spin)+1)*.12;ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=size;ctx.beginPath();ctx.arc(0,0,Math.max(1,size*.22),0,Math.PI*2);ctx.fill();
  }else if(actor.type==='crystal'||actor.type==='gem'){
    ctx.rotate(spin*.08);ctx.globalAlpha=.25;ctx.fillStyle=actor.type==='gem'?theme.gem:theme.glow;ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(size*.58,0);ctx.lineTo(0,size);ctx.lineTo(-size*.58,0);ctx.closePath();ctx.fill();
  }else if(actor.type==='candy'){
    ctx.rotate(spin*.12);ctx.globalAlpha=.3;ctx.fillStyle=theme.gem;rounded(ctx,-size*.65,-size*.38,size*1.3,size*.76,size*.3);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=Math.max(1,size*.12);ctx.beginPath();ctx.moveTo(-size*.25,-size*.3);ctx.lineTo(size*.25,size*.3);ctx.stroke();
  }else if(actor.type==='rose'){
    ctx.restore();drawRose(ctx,x,y,size*1.5,theme,Math.sin(spin)*.08);markPaint('roses');return;
  }else if(actor.type==='snow'){
    ctx.globalAlpha=.3;ctx.strokeStyle='#effbff';ctx.lineWidth=1;for(let arm=0;arm<3;arm++){ctx.rotate(Math.PI/3);ctx.beginPath();ctx.moveTo(-size*.5,0);ctx.lineTo(size*.5,0);ctx.stroke()}
  }else if(actor.type==='cloud'){
    ctx.globalAlpha=.16;ctx.fillStyle=theme.wallEdge;ctx.beginPath();ctx.ellipse(0,0,size*2.8,size*.75,0,0,Math.PI*2);ctx.ellipse(size*.9,-size*.45,size*1.45,size*.9,0,0,Math.PI*2);ctx.ellipse(-size*.8,-size*.32,size*1.25,size*.72,0,0,Math.PI*2);ctx.fill();
  }else if(actor.type==='meteor'){
    ctx.rotate(.58);ctx.globalAlpha=.25;const trail=ctx.createLinearGradient(-size*4,0,size,0);trail.addColorStop(0,'rgba(255,255,255,0)');trail.addColorStop(1,'rgba(255,239,164,.72)');ctx.strokeStyle=trail;ctx.lineWidth=Math.max(1,size*.13);ctx.beginPath();ctx.moveTo(-size*4,0);ctx.lineTo(size,0);ctx.stroke();
  }else if(actor.type==='aurora'){
    ctx.globalAlpha=.13;ctx.strokeStyle=actor.phase>Math.PI?'#86ffd2':'#c693ff';ctx.lineWidth=size*1.2;ctx.beginPath();ctx.moveTo(-viewport.width*.35,0);ctx.bezierCurveTo(-viewport.width*.1,Math.sin(spin)*size*2,viewport.width*.1,-Math.sin(spin)*size*2,viewport.width*.35,0);ctx.stroke();
  }else if(actor.type==='center-crown'){
    ctx.restore();drawCrown(ctx,x,y,size*3.4,'#f6cf58',.5);markPaint('centerCrown');markPaint('crown');return;
  }
  ctx.restore();
  if(painted&&ACTOR_PAINT_FIELD[actor.type])markPaint(ACTOR_PAINT_FIELD[actor.type]);
}

function drawAmbientActors(ctx,actors,profile,treePalette,theme,viewport,motion,now,tile,camera,level,markPaint){
  const visible=[];
  for(const actor of actors){const point=actorScreenPointFor(actor,{viewport,now,camera,tile,level});if(ambientLayerFor(actor)==='ambient'&&actorIsVisible(point,viewport,tile))visible.push({actor,point})}
  for(const {actor,point} of visible)if(actor.type==='tree'){drawTreeShadow(ctx,point.x,point.y,viewport.width*.25*actor.scale,actor,profile,now);if(profile.goldTreeShadow)markPaint('goldTreeShadow')}
  for(const {actor,point} of visible){
    if(actor.type==='tree'){drawTree(ctx,point.x,point.y,viewport.width*.25*actor.scale,treePalette,motion.treeSway,actor.phase);markPaint('trees')}
    else drawAmbientActor(ctx,actor,point,profile,theme,now,viewport,markPaint);
  }
}

function drawDecorActors(ctx,actors,profile,theme,viewport,now,tile,camera,level,markPaint){
  for(const actor of actors){
    if(ambientLayerFor(actor)!=='decor')continue;
    const point=actorScreenPointFor(actor,{viewport,now,camera,tile,level});
    if(actorIsVisible(point,viewport,tile))drawAmbientActor(ctx,actor,point,profile,theme,now,viewport,markPaint);
  }
}

function drawPalaceBackdrop(ctx,viewport,theme,profile,motion){
  const width=viewport.width,height=viewport.height,base=height*.78;ctx.save();ctx.globalAlpha=.48;
  const palace=ctx.createLinearGradient(0,height*.12,0,base);palace.addColorStop(0,rgba(theme.wallEdge,.88));palace.addColorStop(1,rgba(theme.wallShadow,.96));ctx.fillStyle=palace;
  ctx.beginPath();ctx.moveTo(width*.08,base);ctx.lineTo(width*.08,height*.47);ctx.lineTo(width*.16,height*.35);ctx.lineTo(width*.24,height*.47);ctx.lineTo(width*.24,height*.31);ctx.lineTo(width*.34,height*.18);ctx.lineTo(width*.44,height*.31);ctx.lineTo(width*.44,height*.23);ctx.lineTo(width*.5,height*.1);ctx.lineTo(width*.56,height*.23);ctx.lineTo(width*.56,height*.31);ctx.lineTo(width*.66,height*.18);ctx.lineTo(width*.76,height*.31);ctx.lineTo(width*.76,height*.47);ctx.lineTo(width*.84,height*.35);ctx.lineTo(width*.92,height*.47);ctx.lineTo(width*.92,base);ctx.closePath();ctx.fill();
  ctx.globalAlpha=motion.lightPulse;ctx.fillStyle=profile.goldGleam?'#ffe693':rgba(theme.glow,.72);ctx.shadowColor=profile.goldGleam?'#ffd14f':theme.glow;ctx.shadowBlur=18;
  for(let row=0;row<3;row++)for(let column=0;column<7;column++){const x=width*(.2+column*.1),y=height*(.38+row*.1);rounded(ctx,x-3,y-5,6,10,3);ctx.fill()}
  ctx.restore();
}

function drawLightBeams(ctx,viewport,theme,motion,profile){
  const width=viewport.width,height=viewport.height,source=lightSourceFor(profile,viewport),shadow=shadowOffsetFor(profile,1),length=Math.hypot(shadow.x,shadow.y)||1,dx=shadow.x/length,dy=shadow.y/length,r=width*(profile.sunlight?.2:.14),color=profile.sunlight?'#fff7b0':profile.goldGleam?'#ffe08b':theme.glow;ctx.save();ctx.globalCompositeOperation='screen';
  const glow=ctx.createRadialGradient(source.x,source.y,0,source.x,source.y,r*2.5);glow.addColorStop(0,rgba(color,.48*motion.lightPulse));glow.addColorStop(.3,rgba(color,.14));glow.addColorStop(1,rgba(color,0));ctx.fillStyle=glow;ctx.beginPath();ctx.arc(source.x,source.y,r*2.5,0,Math.PI*2);ctx.fill();
  const endX=source.x+dx*height*1.35,endY=source.y+dy*height*1.35,normalX=-dy,normalY=dx,beam=ctx.createLinearGradient(source.x,source.y,endX,endY);beam.addColorStop(0,rgba(color,.2));beam.addColorStop(1,rgba(color,0));ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(source.x+normalX*r*.16,source.y+normalY*r*.16);ctx.lineTo(endX+normalX*r*2,endY+normalY*r*2);ctx.lineTo(endX-normalX*r*2,endY-normalY*r*2);ctx.lineTo(source.x-normalX*r*.16,source.y-normalY*r*.16);ctx.closePath();ctx.fill();
  ctx.restore();
}

function drawEnvironmentBackdrop(ctx,viewport,theme,profile,motion,now,seed,markPaint){
  const width=viewport.width,height=viewport.height;
  if(profile.sunlight){const sun=ctx.createRadialGradient(width*.8,height*.08,2,width*.8,height*.08,width*.3);sun.addColorStop(0,'rgba(255,255,220,.96)');sun.addColorStop(.13,'rgba(255,226,115,.76)');sun.addColorStop(1,'rgba(255,220,100,0)');ctx.fillStyle=sun;ctx.fillRect(0,0,width,height*.65);markPaint('sunlight')}
  if(profile.palace){drawPalaceBackdrop(ctx,viewport,theme,profile,motion);markPaint('palace');if(profile.goldGleam)markPaint('goldGleam')}
  if(profile.grass){const grassColor=profile.sunlight?'rgba(67,133,72,.85)':rgba(theme.wallEdge,.68);for(let index=0;index<46;index++){const x=(index*37%101)/100*width,y=height*(.78+(index%5)*.045);drawGrassTuft(ctx,x,y,6+(index%4),0,grassColor)}markPaint('grass')}
  if(profile.water){const water=ctx.createLinearGradient(0,height*.45,0,height);water.addColorStop(0,'rgba(93,205,229,.04)');water.addColorStop(1,'rgba(20,113,174,.22)');ctx.fillStyle=water;ctx.fillRect(0,height*.45,width,height*.55);markPaint('water')}
  if(profile.honey){ctx.save();ctx.globalAlpha=.28;ctx.fillStyle='#d99b32';rounded(ctx,width*.03,height*.76,width*.94,height*.055,height*.02);ctx.fill();ctx.fillStyle='#ffd36a';rounded(ctx,width*.04,height*.77,width*.92,height*.018,height*.009);ctx.fill();ctx.restore();markPaint('honey')}
}

function drawFlower(ctx,x,y,size,color){
  ctx.save();ctx.translate(x,y);ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=size*.35;
  for(let petal=0;petal<5;petal++){const angle=petal*Math.PI*2/5;ctx.beginPath();ctx.ellipse(Math.cos(angle)*size*.28,Math.sin(angle)*size*.28,size*.28,size*.16,angle,0,Math.PI*2);ctx.fill()}
  ctx.fillStyle='#ffe790';ctx.beginPath();ctx.arc(0,0,size*.12,0,Math.PI*2);ctx.fill();ctx.restore();
}

function drawForegroundAtmosphere(ctx,viewport,theme,profile,motion,now,seed,camera,tile,markPaint){
  const width=viewport.width,height=viewport.height;
  if(profile.lights||profile.sunlight){drawLightBeams(ctx,viewport,theme,motion,profile);if(profile.lights)markPaint('lights')}
  if(profile.caustics){ctx.save();ctx.globalCompositeOperation='screen';ctx.strokeStyle=rgba(theme.glow,.14);ctx.lineWidth=1.2;for(let row=0;row<8;row++){ctx.beginPath();for(let x=-20;x<=width+20;x+=10){const y=height*(.13+row*.11)+Math.sin(x*.045+now/720+row)*5;x===-20?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.stroke()}ctx.restore();markPaint('caustics')}
  if(profile.flowers){for(let index=0;index<18;index++){const x=(index*83+seed*7)%100/100*width,y=height*(.72+(index%4)*.075);drawFlower(ctx,x,y,3.5+(index%3),index%3===0?'#fff1c5':index%2?'#ffb6ce':'#d4b5ff')}markPaint('flowers')}
  if(profile.lanterns){ctx.save();for(let index=0;index<7;index++){const x=width*(.08+index*.14),y=height*(.1+(index%2)*.045),glow=ctx.createRadialGradient(x,y,0,x,y,34);glow.addColorStop(0,'rgba(255,238,145,.32)');glow.addColorStop(1,'rgba(255,193,75,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,34,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffd477';rounded(ctx,x-5,y-7,10,14,4);ctx.fill();ctx.strokeStyle='#8b5622';ctx.lineWidth=1.3;ctx.stroke()}ctx.restore();markPaint('lanterns')}
  if(profile.palace&&camera.mode==='follow'){ctx.save();ctx.globalAlpha=.16;ctx.fillStyle=profile.goldGleam?'#ffe086':theme.wallEdge;for(const side of [0,1]){const x=side?width-10:10;for(let index=0;index<5;index++){const y=height*(.15+index*.18);ctx.beginPath();ctx.moveTo(x,y-18);ctx.lineTo(x+(side?-8:8),y);ctx.lineTo(x,y+18);ctx.closePath();ctx.fill()}}ctx.restore()}
  if(profile.crystals&&camera.mode==='follow'){ctx.save();ctx.globalAlpha=.24;ctx.fillStyle=theme.glow;for(let index=0;index<7;index++){const x=index%2?width-7:7,y=height*(.12+index*.13);ctx.beginPath();ctx.moveTo(x,y-tile*.22);ctx.lineTo(x+tile*.12,y);ctx.lineTo(x,y+tile*.22);ctx.lineTo(x-tile*.12,y);ctx.closePath();ctx.fill()}ctx.restore()}
}

export function createRenderer(canvas,{canvasFactory=globalThis.document?.createElement?()=>globalThis.document.createElement('canvas'):null,diagnosticsEnabled=true}={}) {
  const ctx = canvas.getContext('2d', { alpha: false });
  let viewport = { width: 390, height: 400 }, dpr = 1, level = null, grid = null, wallModel = null, wallModelBuilds = 0, sceneProfile = null, sceneEffects = [], treePalette = null, sceneSeed = 0, ambientActors = [], ambientActorBuilds = 0, paintSignatures = new Set(), skin = 'red', particles = [], motionState = createMotionState(), lastPlayer = null, lastMoveAt = -Infinity;
  let staticWallCache=null,staticWallCacheKey='',staticWallCacheBuilds=0,staticWallCacheHits=0,staticWallCacheFailures=0;

  function releaseStaticWallCache({preserveKey=false}={}){
    if(staticWallCache?.canvas){staticWallCache.canvas.width=1;staticWallCache.canvas.height=1}
    staticWallCache=null;if(!preserveKey)staticWallCacheKey='';
  }

  function resize(nextViewport, nextDpr = globalThis.devicePixelRatio || 1) {
    viewport = { width: Math.max(1, nextViewport.width), height: Math.max(1, nextViewport.height) };
    dpr = clampDpr(nextDpr); canvas.width = Math.round(viewport.width * dpr); canvas.height = Math.round(viewport.height * dpr);
    canvas.style.width = `${viewport.width}px`; canvas.style.height = `${viewport.height}px`;
    releaseStaticWallCache();
  }
  function setLevel(nextLevel) {
    releaseStaticWallCache();
    level=nextLevel;grid=parseGrid(nextLevel.rows);wallModel=buildWallModel(grid,new Set());wallModelBuilds=1;
    sceneProfile=sceneProfileFor(nextLevel);sceneEffects=sceneRenderPlanFor(sceneProfile);treePalette=treePaletteFor(sceneProfile,nextLevel.theme);sceneSeed=decorSeed(nextLevel);ambientActors=ambientActorsFor(sceneProfile,sceneSeed);ambientActorBuilds++;
    particles=[];motionState=createMotionState();lastPlayer=null;lastMoveAt=-Infinity;
  }
  function setSkin(nextSkin) { skin = nextSkin; }
  function emit(effect) {
    if (!level) return;
    const at = effect.at || effect.player || { x: 0, y: 0 };
    const count = effect.type === 'coin' ? 18 : effect.type === 'key' ? 22 : effect.type === 'explosion' ? 34 : effect.type === 'complete' ? 44 : 8;
    const colors = effect.type === 'explosion' ? ['#ffdd65','#ff7948','#7b382b'] : effect.type === 'coin' ? ['#fff4a4','#ffd34f','#fff'] : [level.theme.glow,level.theme.gem,'#fff'];
    for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
      const angle = Math.PI * 2 * i / count + Math.random() * .25, speed = .6 + Math.random() * 1.8;
      particles.push({ x: at.x + .5, y: at.y + .5, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - .5, born: performance.now(), life: 430 + Math.random() * 420, color: colors[i % colors.length], size: .05 + Math.random() * .11 });
    }
  }

  function draw(state, now = performance.now()) {
    if (!level || !grid) return;
    if(diagnosticsEnabled)paintSignatures=new Set();
    const markPaint=diagnosticsEnabled?field=>{if(field&&paintSignatures.size<32)paintSignatures.add(field)}:NOOP;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const theme = level.theme, profile = sceneProfile, playerCell={x:state.player.x,y:state.player.y};
    if(lastPlayer&&(lastPlayer.x!==playerCell.x||lastPlayer.y!==playerCell.y)&&Math.abs(lastPlayer.x-playerCell.x)+Math.abs(lastPlayer.y-playerCell.y)===1){recordStep(motionState,{from:lastPlayer,to:playerCell,skinId:skin,now});lastMoveAt=now}
    const moving=now-lastMoveAt<260;lastPlayer=playerCell;
    const motion=environmentMotion(profile,{moving,now}),background = ctx.createLinearGradient(0, 0, 0, viewport.height);
    background.addColorStop(0, profile.sunlight?'#78c9ef':theme.sky); background.addColorStop(.48, profile.sunlight?'#b6dfa3':theme.ground); background.addColorStop(1, theme.wallShadow);
    ctx.fillStyle = background; ctx.fillRect(0, 0, viewport.width, viewport.height);
    const halo = ctx.createRadialGradient(viewport.width * .5, viewport.height * .38, 4, viewport.width * .5, viewport.height * .38, viewport.width * .7);
    halo.addColorStop(0, rgba(theme.glow, level.type === 'reward' ? .24 : .14)); halo.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = halo; ctx.fillRect(0, 0, viewport.width, viewport.height);
    const camera = cameraFor(state.player, level, viewport), tile = camera.scale, sizes=visualSizesFor(tile), seed = sceneSeed;
    drawEnvironmentBackdrop(ctx,viewport,theme,profile,motion,now,seed,markPaint);
    drawSceneEffects(ctx,sceneEffects,viewport,theme,now,markPaint);
    drawAmbientActors(ctx,ambientActors,profile,treePalette,theme,viewport,motion,now,tile,camera,level,markPaint);
    const sx = Math.max(0, Math.floor(-camera.x / tile) - 2), ex = Math.min(grid.width - 1, Math.ceil((viewport.width - camera.x) / tile) + 2);
    const sy = Math.max(0, Math.floor(-camera.y / tile) - 2), ey = Math.min(grid.height - 1, Math.ceil((viewport.height - camera.y) / tile) + 2);
    const px = x => camera.x + x * tile, py = y => camera.y + y * tile;
    ctx.save();
    for (let y = sy; y <= ey; y++) for (let x = sx; x <= ex; x++) if (grid.floors.has(`${x},${y}`) || state.removedWalls?.has(`${x},${y}`)) {
      ctx.fillStyle = (x + y) % 2 ? rgba(theme.ground, .96) : rgba(theme.wallShadow, .32); ctx.fillRect(px(x), py(y), tile + .5, tile + .5);
      ctx.fillStyle = 'rgba(255,255,255,.035)'; ctx.fillRect(px(x) + tile * .08, py(y) + tile * .08, tile * .84, tile * .08);
      if ((x * 17 + y * 31 + seed) % 23 === 0) { ctx.fillStyle = rgba(theme.gem, .22); ctx.beginPath(); ctx.arc(px(x + .5), py(y + .5), tile * .08, 0, Math.PI * 2); ctx.fill(); }
      if(profile.grass&&(x*19+y*13+seed)%5===0)drawGrassTuft(ctx,px(x+.22),py(y+.88),tile*.26,grassSwayAt({x,y},motionState,now),profile.sunlight?'#8ed276':rgba(theme.wallEdge,.8))
      if(profile.roses&&(x*11+y*7+seed)%29===0)drawRose(ctx,px(x+.5),py(y+.72),tile*.28,theme,Math.sin(now/850+x)*.08);
    }
    drawMotionTrails(ctx,activeTrails(motionState,now),px,py,tile,now);
    const removedWalls=state.removedWalls||new Set(),removedSignature=wallSignatureFor(removedWalls);
    if(!wallModel||wallModel.signature!==removedSignature){wallModel=buildWallModel(grid,removedWalls);wallModelBuilds++;releaseStaticWallCache()}
    const visibleContours=wallModel.contours.filter(contour=>contour.y>=sy-1&&contour.y<=ey+1&&contour.x>=sx-1&&contour.x<=ex+1);
    const traceWallSurface=(offsetX=0,offsetY=0)=>traceWallPath(ctx,visibleContours,{tile,originX:camera.x,originY:camera.y,offsetX,offsetY});
    const paintWalls=(target,contours,lightEdges,darkEdges,originX,originY,paintWidth,paintHeight)=>{
      const trace=(offsetX=0,offsetY=0)=>traceWallPath(target,contours,{tile,originX,originY,offsetX,offsetY});
      for(const shadow of wallShadowLayersFor(profile,tile)){
        target.save();target.filter=`blur(${shadow.blur}px)`;trace(shadow.x,shadow.y);target.fillStyle=`rgba(8,5,15,${shadow.alpha})`;target.fill();target.restore();
      }
      trace();
      const wallGradient=target.createLinearGradient(originX,originY,originX+grid.width*tile,originY+grid.height*tile);
      wallGradient.addColorStop(0,theme.wallEdge);wallGradient.addColorStop(.28,theme.wall);wallGradient.addColorStop(.72,theme.wall);wallGradient.addColorStop(1,theme.wallShadow);target.fillStyle=wallGradient;target.fill();
      target.save();trace();target.clip();
      const smoothSheen=target.createLinearGradient(0,0,paintWidth,paintHeight);smoothSheen.addColorStop(0,'rgba(255,255,255,.12)');smoothSheen.addColorStop(.28,'rgba(255,255,255,.025)');smoothSheen.addColorStop(.62,'rgba(0,0,0,.035)');smoothSheen.addColorStop(1,'rgba(0,0,0,.14)');target.fillStyle=smoothSheen;target.fillRect(0,0,paintWidth,paintHeight);target.restore();
      const drawOutline=(edges,color)=>{
        target.save();trace();target.clip();target.strokeStyle=color;target.lineWidth=Math.max(1,sizes.cornerRadius*2);target.lineJoin='round';target.lineCap='round';target.beginPath();
        for(const edge of edges){target.moveTo(originX+edge.x1*tile,originY+edge.y1*tile);target.lineTo(originX+edge.x2*tile,originY+edge.y2*tile)}
        target.stroke();target.restore();
      };
      drawOutline(lightEdges,rgba(theme.wallEdge,profile.lights?.72:.56));drawOutline(darkEdges,rgba(theme.wallShadow,.76));
    };
    const cacheKey=`${level.id}|${removedSignature}|${tile.toFixed(4)}|${dpr}|${viewport.width}x${viewport.height}`;
    if(canvasFactory&&staticWallCacheKey!==cacheKey){
      releaseStaticWallCache();
      try{
        const padding=Math.ceil(tile*2),logicalWidth=Math.ceil(grid.width*tile+padding*2),logicalHeight=Math.ceil(grid.height*tile+padding*2),cacheCanvas=canvasFactory();
        if(!cacheCanvas||logicalWidth*dpr>4096||logicalHeight*dpr>4096)throw new Error('static wall cache unavailable');
        cacheCanvas.width=Math.ceil(logicalWidth*dpr);cacheCanvas.height=Math.ceil(logicalHeight*dpr);
        const cacheContext=cacheCanvas.getContext('2d');if(!cacheContext)throw new Error('static wall context unavailable');
        cacheContext.setTransform(dpr,0,0,dpr,0,0);cacheContext.clearRect(0,0,logicalWidth,logicalHeight);
        paintWalls(cacheContext,wallModel.contours,wallModel.lightEdges,wallModel.darkEdges,padding,padding,logicalWidth,logicalHeight);
        staticWallCache={canvas:cacheCanvas,padding,logicalWidth,logicalHeight};staticWallCacheKey=cacheKey;staticWallCacheBuilds++;
      }catch{staticWallCacheFailures++;staticWallCacheKey=cacheKey;releaseStaticWallCache({preserveKey:true})}
    }else if(staticWallCache&&staticWallCacheKey===cacheKey)staticWallCacheHits++;
    let usedStaticCache=false;
    if(staticWallCache&&staticWallCacheKey===cacheKey){
      const screenX=camera.x-staticWallCache.padding,screenY=camera.y-staticWallCache.padding;
      const sourceX=Math.max(0,-screenX),sourceY=Math.max(0,-screenY),destX=Math.max(0,screenX),destY=Math.max(0,screenY);
      const drawWidth=Math.min(staticWallCache.logicalWidth-sourceX,viewport.width-destX),drawHeight=Math.min(staticWallCache.logicalHeight-sourceY,viewport.height-destY);
      try{
        if(drawWidth>0&&drawHeight>0)ctx.drawImage(staticWallCache.canvas,sourceX*dpr,sourceY*dpr,drawWidth*dpr,drawHeight*dpr,destX,destY,drawWidth,drawHeight);
        usedStaticCache=true;
      }catch{staticWallCacheFailures++;staticWallCacheKey=cacheKey;releaseStaticWallCache({preserveKey:true})}
    }
    if(!usedStaticCache)paintWalls(ctx,visibleContours,wallModel.lightEdges,wallModel.darkEdges,camera.x,camera.y,viewport.width,viewport.height);
    if(profile.goldGleam){
      ctx.save();traceWallSurface();ctx.clip();
      const sweep=((now*.035+seed*17)%(viewport.width+180))-90,gleam=ctx.createLinearGradient(sweep-75,0,sweep+75,0);gleam.addColorStop(0,'rgba(255,234,128,0)');gleam.addColorStop(.5,'rgba(255,245,183,.34)');gleam.addColorStop(1,'rgba(255,234,128,0)');ctx.fillStyle=gleam;ctx.fillRect(sweep-75,0,150,viewport.height);ctx.restore();markPaint('goldGleam');
    }
    const pulse = (Math.sin(now / 280) + 1) / 2, center = point => ({ x: px(point.x + .5), y: py(point.y + .5) });
    const doorPoint=center(level.exit),visibleKeys=level.keys.filter(key=>!state.collectedKeys.has(cellKey(key))),visibleCoins=level.coins.filter(coin=>!state.collectedCoinIds.has(coin.id)&&!state.newCoinIds.has(coin.id)),playerPoint=center(state.player);
    ctx.save();ctx.beginPath();ctx.rect(0,0,viewport.width,viewport.height);
    for(const point of [doorPoint,...visibleKeys.map(center),...visibleCoins.map(center),playerPoint]){ctx.moveTo(point.x+tile*.4,point.y);ctx.arc(point.x,point.y,tile*.4,0,Math.PI*2)}
    ctx.clip('evenodd');drawForegroundAtmosphere(ctx,viewport,theme,profile,motion,now,seed,camera,tile,markPaint);drawDecorActors(ctx,ambientActors,profile,theme,viewport,now,tile,camera,level,markPaint);ctx.restore();
    drawDoor(ctx,doorPoint.x,doorPoint.y,sizes.doorSize,theme,state.collectedKeys.size===state.keyCells.size);
    for(const key of visibleKeys){const point=center(key);drawKey(ctx,point.x,point.y,sizes.keySize,theme,pulse)}
    for(const coin of visibleCoins){const point=center(coin);drawCoin(ctx,point.x,point.y,sizes.coinSize,pulse)}
    const playerShadow=shadowOffsetFor(profile,sizes.playerRadius*.55);
    ctx.save();ctx.beginPath();ctx.arc(playerPoint.x,playerPoint.y,sizes.playerRadius,0,Math.PI*2);ctx.clip();ctx.fillStyle=profile.sunlight?'rgba(25,47,31,.38)':'rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(playerPoint.x+playerShadow.x,playerPoint.y+playerShadow.y,sizes.playerRadius*.9,sizes.playerRadius*.34,Math.atan2(playerShadow.y,playerShadow.x),0,Math.PI*2);ctx.fill();ctx.restore();
    drawPlayer(ctx,playerPoint.x,playerPoint.y,sizes.playerRadius,skin,now,moving);
    particles = particles.filter(particle => now - particle.born < particle.life);
    for (const particle of particles) {
      const age = (now - particle.born) / 1000, alpha = 1 - (now - particle.born) / particle.life;
      const x = px(particle.x + particle.vx * age), y = py(particle.y + particle.vy * age + age * age * 1.5);
      ctx.globalAlpha = alpha; ctx.fillStyle = particle.color; ctx.shadowColor = particle.color; ctx.shadowBlur = tile * .18;
      ctx.save(); ctx.translate(x, y); ctx.rotate(age * 5); ctx.fillRect(-tile * particle.size / 2, -tile * particle.size / 2, tile * particle.size, tile * particle.size); ctx.restore();
    }
    ctx.globalAlpha = 1; ctx.restore();
  }
  return {
    resize,setLevel,setSkin,emit,draw,
    get particleCount(){return particles.length},
    get motionState(){return motionState},
    get wallModelBuilds(){return wallModelBuilds},
    get ambientActorBuilds(){return ambientActorBuilds},
    get diagnostics(){return{
      wallModelBuilds,staticWallCacheBuilds,staticWallCacheHits,staticWallCacheFailures,staticWallCacheCount:staticWallCache?1:0,
      particleCount:particles.length,trailCount:motionState.trails.length,actorCount:ambientActors.length,
      sceneId:sceneProfile?.id??null,paintSignatures:[...paintSignatures].sort()
    }}
  };
}
