// Local simulation retains its frame cap; network prediction owns its fixed-step budget.
export function frameDurations(now, previous) {
  const elapsed = previous ? Math.max(0, (now - previous) / 1000) : 1 / 60;
  return {local: Math.min(1 / 30, elapsed), online: elapsed};
}
