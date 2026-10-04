const OFFSET = 8 * 60 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;
export function shanghaiDate(now = new Date()) {
  return new Date(now.getTime() + OFFSET).toISOString().slice(0, 10);
}
export function periodRange(period, now = new Date()) {
  if (!['day', 'week', 'month'].includes(period)) throw new Error('Invalid period');
  const local = new Date(now.getTime() + OFFSET);
  let start = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  let end;
  if (period === 'week') {
    start -= ((local.getUTCDay() + 6) % 7) * DAY;
    end = start + 7 * DAY;
  } else if (period === 'month') {
    start = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1);
    end = Date.UTC(local.getUTCFullYear(), local.getUTCMonth() + 1, 1);
  } else end = start + DAY;
  const dateLabel = ms => new Date(ms).toISOString().slice(0, 10).replaceAll('-', '.');
  return {
    start: new Date(start - OFFSET).toISOString(),
    end: new Date(end - OFFSET).toISOString(),
    label: period === 'day' ? dateLabel(start) : `${dateLabel(start)} — ${dateLabel(end - DAY)}`,
  };
}
