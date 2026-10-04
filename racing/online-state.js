import { CARS, newRace, clamp } from './core.js';

// The server owns the race. Hydration restores local render-only geometry;
// the driver's car is first for the existing chase camera, with its ID intact.
export function hydrateRace(packet, slot, previous) {
  const { room, race: data } = packet;
  if (!data) return null;
  const base = previous?.track.spec.id === room.trackId
    ? previous : newRace(room.trackId, 'apex');
  const cars = data.cars.map(c => ({
    ...c, model: CARS.find(m => m.id === c.car) || CARS[0],
    finishTime: Number.isFinite(c.finishTime) ? c.finishTime : Infinity,
  }));
  cars.sort((a,b) => (a.id === slot ? -1 : b.id === slot ? 1 : a.id-b.id));
  return { ...base, ...data, track:base.track, hazards:base.hazards,
    cars, traffic:data.traffic.map(t => ({...t})), online:true, paused:false };
}

// Extrapolate at most 150ms and blend across regular 20Hz snapshots. Penalties,
// finishes and large corrections snap immediately to preserve checkpoint rules.
export function projectRace(source, previous, age, dt, input = {}) {
  if (!source) return null;
  const running = source.status === 'racing' && source.countdown <= 0;
  const lead = running ? clamp(age,0,0.15) : 0;
  const blend = 1 - Math.exp(-Math.max(0,dt)*18);
  const cars = source.cars.map((c,i) => {
    const active = running && !c.finished && !(c.respawn > 0);
    const goal = c.s + (active ? c.speed*lead : 0);
    const old = previous?.cars.find(p => p.id === c.id);
    const snap = !old || !active || old.respawn > 0 || Math.abs(goal-old.s)>12;
    const steer = i===0 ? clamp(input.steer||0,-1,1) : c.steer||0;
    const offset = c.offset + (i===0 && active
      ? steer*(2+c.speed*0.115)*c.model.handling*lead : 0);
    return { ...c, s:snap?goal:old.s+(goal-old.s)*blend,
      offset:snap?offset:old.offset+(offset-old.offset)*blend, steer };
  });
  return { ...source, time:source.time+lead,
    countdown:Math.max(0,source.countdown-clamp(age,0,0.15)), cars,
    traffic:source.traffic.map(t => ({...t,s:t.s+t.speed*lead})) };
}
