import { shadowOffsetFor } from './wall-geometry.js?v=20260829f';

const BASE_PROFILE = {
  trees: true,
  leaves: false,
  petals: false,
  bees: false,
  honey: false,
  water: false,
  ripples: false,
  crystals: false,
  candy: false,
  clouds: false,
  meteors: false,
  aurora: false,
  crown: false,
  lighting: 'soft',
  lights: true
};

const profile = (id, fields) => Object.freeze({ ...BASE_PROFILE, id, ...fields });

const PROFILES = new Map([
  ['normal-1', profile('royal-garden', { grass:true, leaves:true, petals:true, flowers:true, sunlight:true, lighting:'warm-sun' })],
  ['reward-1', profile('honey-lantern-court', { bees:true, honey:true, lanterns:true, grass:true, lighting:'warm-lantern' })],
  ['normal-2', profile('coral-palace', { water:true, ripples:true, coral:true, bubbles:true, fishShadows:true, caustics:true, palace:true, lighting:'underwater' })],
  ['reward-2', profile('cherry-pearl-gallery', { petals:true, pearls:true, cherryTrees:true, lighting:'pearl-soft' })],
  ['normal-3', profile('emerald-secret', { vines:true, fireflies:true, emeraldGlow:true, grass:true, lighting:'emerald' })],
  ['reward-3', profile('sunny-emerald-hall', { crystals:true, mapleLeaves:true, sunlight:true, grass:true, lighting:'warm-refraction' })],
  ['normal-4', profile('amethyst-castle', { crystals:true, purpleRefraction:true, palace:true, goldGleam:true, lighting:'purple-refraction' })],
  ['reward-4', profile('rose-gold-ballroom', { roses:true, petals:true, palace:true, goldGleam:true, lighting:'rose-gold' })],
  ['normal-5', profile('golden-temple', { goldLeaves:true, goldTreeShadow:true, palace:true, goldGleam:true, lighting:'gold' })],
  ['reward-5', profile('crystal-candy-kingdom', { crystals:true, candy:true, palace:true, rainbowRefraction:true, lighting:'rainbow-crystal' })],
  ['normal-6', profile('ice-blue-palace', { water:true, ripples:true, snow:true, crystals:true, palace:true, lighting:'ice-blue' })],
  ['reward-6', profile('laurel-lamp-temple', { laurelLeaves:true, lanterns:true, mist:true, grass:true, lighting:'cool-lantern' })],
  ['normal-7', profile('crimson-theatre', { roses:true, petals:true, palace:true, crimsonTreeShadow:true, curtainLight:true, lighting:'crimson' })],
  ['reward-7', profile('jewel-sky-palace', { clouds:true, gems:true, crystals:true, palace:true, lighting:'jewel-cloud' })],
  ['normal-8', profile('star-sanctum', { stars:true, meteors:true, palace:true, darkTreeShadow:true, lighting:'starlight' })],
  ['reward-8', profile('starlit-golden-avenue', { goldLeaves:true, stars:true, goldGleam:true, lighting:'gold-starlight' })],
  ['normal-9', profile('rainbow-cloud-palace', { clouds:true, sunsetRefraction:true, rainbowRefraction:true, palace:true, lighting:'sunset' })],
  ['reward-9', profile('crown-aurora-festival', { aurora:true, crownLights:true, palace:true, lighting:'aurora' })],
  ['normal-10', profile('eternal-crown-city', { goldLeaves:true, centerCrown:true, crown:true, palace:true, goldGleam:true, sunlight:true, lighting:'crown-sun' })]
]);

export function sceneProfileFor(level) {
  const result = PROFILES.get(level?.id);
  if (!result) throw new RangeError(`Unknown campaign level: ${level?.id ?? 'missing'}`);
  return result;
}

export function detailPassesFor(profile) {
  const details = [];
  if (profile.grass) details.push('floor-grass');
  if (profile.trees) details.push('background-trees');
  if (profile.sunlight) details.push('sunlight');
  if (profile.petals) details.push('foreground-petals');
  if (profile.flowers) details.push('flowers');
  if (profile.palace) details.push('edge-palace');
  if (profile.bubbles) details.push('foreground-bubbles');
  if (profile.caustics) details.push('caustics');
  if (profile.vines) details.push('vines');
  if (profile.fireflies) details.push('fireflies');
  if (profile.crystals) details.push('edge-crystals');
  if (profile.goldGleam) details.push('gold-gleam');
  if (profile.snow) details.push('snow');
  if (profile.roses) details.push('roses');
  if (profile.stars) details.push('stars');
  if (profile.clouds) details.push('clouds');
  if (profile.lanterns) details.push('lanterns');
  if (profile.pearls) details.push('pearls');
  if (profile.honey) details.push('honey');
  if (profile.water) details.push('water-ripples');
  if (profile.candy) details.push('candy');
  if (profile.aurora) details.push('aurora');
  if (profile.crown) details.push('crown');
  if (profile.lights) details.push('foreground-light');
  return details;
}

const SCENE_EFFECT_FIELDS = [
  ['cherryTrees','cherry-canopy'],
  ['emeraldGlow','emerald-glow'],
  ['purpleRefraction','purple-refraction'],
  ['rainbowRefraction','rainbow-refraction'],
  ['mist','mist'],
  ['curtainLight','curtain-light'],
  ['crimsonTreeShadow','crimson-tree-shadow'],
  ['darkTreeShadow','dark-tree-shadow'],
  ['sunsetRefraction','sunset-refraction']
];

export function sceneRenderPlanFor(profile) {
  return SCENE_EFFECT_FIELDS.filter(([field])=>profile[field]).map(([,effect])=>effect);
}

export function treePaletteFor(profile,theme){
  let leaves;
  if(profile.cherryTrees)leaves=['#f3a6c0','#ffd3df','#d96f9c','#fff0f5'];
  else if(profile.laurelLeaves)leaves=['#879b53','#a9bb69','#d5cf87','#6f7e45'];
  else if(profile.snow&&profile.water)leaves=['#9edfff','#c9f3ff','#6fb7dc','#e9fbff'];
  else if(profile.crimsonTreeShadow)leaves=['#b63c5d','#e17a91','#83213f','#ffb0c2'];
  else if(profile.goldLeaves)leaves=['#e9b83e','#f5d66b','#ba7b20','#fff0a0'];
  else if(profile.mapleLeaves)leaves=['#d66d3f','#ef9a4c','#b94e32','#f5c36b'];
  else if(profile.roses)leaves=['#b84d69','#e78597','#7d2949','#f5b4bc'];
  else if(profile.emeraldGlow)leaves=['#4ca66d','#79d596','#277a58','#b1e5a9'];
  else leaves=[theme.wallEdge,theme.gem,'#5aa65f','#b8db76'];
  const trunk=profile.goldLeaves?['#795016','#c49135','#4d310f']:profile.snow?['#496477','#8eaab5','#324756']:['#54351e','#a16d37','#392616'];
  return{leaves,trunk};
}

export function environmentMotion(profile, { moving, now }) {
  return {
    grassSway: profile.grass && moving ? Math.sin(now / 75) * .34 : 0,
    treeSway: profile.trees ? Math.sin(now / 920 + profile.id.length) * .12 : 0,
    lightPulse: profile.lights || profile.sunlight ? .88 + Math.sin(now / 760) * .1 : 0
  };
}

function randomSource(seed) {
  let state = (Number(seed) || 1) >>> 0;
  return () => {
    state = Math.imul(state ^ state >>> 15, 1 | state);
    state ^= state + Math.imul(state ^ state >>> 7, 61 | state);
    return ((state ^ state >>> 14) >>> 0) / 4294967296;
  };
}

const ACTOR_RULES = [
  ['trees', 'tree', 4], ['leaves', 'leaf', 14], ['goldLeaves', 'gold-leaf', 14],
  ['mapleLeaves', 'maple-leaf', 14], ['laurelLeaves', 'laurel-leaf', 14],
  ['petals', 'petal', 16], ['bees', 'bee', 8], ['honey', 'honey-drop', 4],
  ['bubbles', 'bubble', 10],
  ['fishShadows', 'fish-shadow', 5], ['coral', 'coral', 6],
  ['pearls', 'pearl', 8], ['vines', 'vine', 5], ['fireflies', 'firefly', 12],
  ['crystals', 'crystal', 7], ['candy', 'candy', 8], ['roses', 'rose', 7],
  ['snow', 'snow', 16], ['clouds', 'cloud', 5], ['gems', 'gem', 7],
  ['stars', 'star', 14], ['meteors', 'meteor', 4], ['aurora', 'aurora', 3],
  ['crownLights', 'crown-light', 8], ['centerCrown', 'center-crown', 1]
];

export function ambientActorsFor(profile, seed) {
  const random = randomSource(seed);
  const actors = [];
  if(profile.water){
    for(let index=0;index<2;index++){
      const cycle={x:.12+random()*.76,y:.22+random()*.58,phase:random()*Math.PI*2,speed:.12+random()*.88,scale:.7+random()*.65};
      actors.push({type:'water-drop',...cycle});
      if(profile.ripples)actors.push({type:'ripple',...cycle});
    }
  }
  for (const [field, type, count] of ACTOR_RULES) {
    if (!profile[field]) continue;
    for (let index = 0; index < count && actors.length < 96; index++) {
      let x = -.04 + random() * 1.08, y = -.04 + random() * 1.08;
      if (type === 'tree') {
        x = index % 2 ? .96 : .04;
        y = .18 + Math.floor(index / 2) * .55 + random() * .05;
      } else if (type === 'center-crown') {
        x = .5; y = .075;
      }
      actors.push({
        type,
        x,
        y,
        phase: random() * Math.PI * 2,
        speed: .12 + random() * .88,
        scale: .7 + random() * .65
      });
    }
  }
  return actors;
}

export function treeShadowFor(tree, light, now) {
  const offset = shadowOffsetFor(light, tree.scale * .24);
  const wave = Math.sin(tree.phase + now * tree.speed * .001);
  return { x:offset.x, y:offset.y, scaleX:1 + wave * .025, alpha:.16 + wave * .014 };
}

export function waterCycleStateFor(actor,now){
  const cycle=((actor.phase/(Math.PI*2)+now*actor.speed*.00012)%1+1)%1,impactAt=.58,rings=actor.scale>=1?3:2;
  if(cycle<impactAt)return{dropAlpha:.1+.08*cycle/impactAt,dropOffset:-3*(1-cycle/impactAt),rippleAlpha:0,rippleRadius:0,rings};
  const progress=(cycle-impactAt)/(1-impactAt);
  return{dropAlpha:0,dropOffset:0,rippleAlpha:.16*(1-progress),rippleRadius:.35+progress*1.45,rings};
}

export function actorIsVisible(actor, viewport, margin = 0) {
  return actor.x >= -margin && actor.x <= viewport.width + margin && actor.y >= -margin && actor.y <= viewport.height + margin;
}

const FALLING_ACTORS = new Set(['leaf','gold-leaf','maple-leaf','laurel-leaf','petal','snow','honey-drop']);

export function actorScreenPointFor(actor,{viewport,now=0,camera={x:0,y:0},tile=1,level}={}){
  if(actor.type==='center-crown')return{x:camera.x+level.rows[0].length*tile*.5,y:camera.y+tile*.62};
  let x=actor.x,y=actor.y;
  if(FALLING_ACTORS.has(actor.type)){
    y=((actor.y+now*actor.speed*.000035)%1.16)-.08;x+=Math.sin(actor.phase+now*.00045)*.035;
  }else if(actor.type==='cloud')x=((actor.x+now*actor.speed*.000009+1.08)%1.16)-.08;
  else if(actor.type==='bee'){x+=Math.cos(actor.phase+now*actor.speed*.001)*.035;y+=Math.sin(actor.phase+now*actor.speed*.0013)*.025}
  else if(actor.type==='bubble'){y=((actor.y-now*actor.speed*.000025+1.08)%1.16)-.08;x+=Math.sin(actor.phase+now*.0004)*.012}
  else if(actor.type==='meteor'){x=((actor.x+now*actor.speed*.000035+1.08)%1.16)-.08;y=((actor.y+now*actor.speed*.000024)%1.16)-.08}
  return{x:x*viewport.width,y:y*viewport.height};
}

export function ambientLayerFor(actor) {
  return actor?.type === 'center-crown' ? 'decor' : 'ambient';
}
