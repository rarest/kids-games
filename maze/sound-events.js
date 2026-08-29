const ACTION_SOUND={key:'key',coin:'coin',complete:'door-open'};
const INDEPENDENT_SOUND={bump:'bump','door-locked':'door-locked',dynamite:'explosion'};

export function gameEventSounds(event={}){
  if(event.type==='hook'){
    const sounds=['hook'];
    if(event.key)sounds.push('key');
    if(event.coin)sounds.push('coin');
    if(event.complete)sounds.push('door-open');
    return sounds;
  }
  if(event.type==='step')return['footstep'];
  if(ACTION_SOUND[event.type])return['footstep',ACTION_SOUND[event.type]];
  return INDEPENDENT_SOUND[event.type]?[INDEPENDENT_SOUND[event.type]]:[];
}
