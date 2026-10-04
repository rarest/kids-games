import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {periodRange, shanghaiDate} from './periods.mjs';

export const GAME_IDS = new Set(['memory','english','rescue','parkour','racing','territory','shooter','pinyin','snake','fish','fishing','goldminer','maze','merge4096']);
const WINDOW_MS = 30 * 60 * 1000;
export function problem(status, message) { return Object.assign(new Error(message), {status}); }

export class ActivityStore {
  constructor({pool, now = () => new Date()}) { this.pool = pool; this.now = now; }
  async migrate() {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock(96421004)');
      await client.query(await readFile(new URL('./migrations/001-activity.sql', import.meta.url), 'utf8'));
      await client.query("INSERT INTO platform_meta(key,value) VALUES('statistics_started_at',$1) ON CONFLICT DO NOTHING", [this.now()]);
      await client.query('COMMIT');
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  }
  async createSession(actor, gameId) {
    if (!GAME_IDS.has(gameId)) throw problem(400, 'Invalid game');
    const sessionId = randomUUID(), now = this.now();
    await this.pool.query('INSERT INTO activity_sessions(id,actor_key,game_id,started_at,last_received_at) VALUES($1,$2,$3,$4,$4)', [sessionId, actor, gameId, now]);
    return {sessionId, acceptedSeconds: 0};
  }
  async heartbeat(sessionId, actor, activeSeconds) {
    if (typeof sessionId !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(sessionId)) throw problem(400, 'Invalid session');
    if (!Number.isFinite(activeSeconds) || activeSeconds < 0 || activeSeconds > 86400) throw problem(400, 'Invalid activeSeconds');
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query('SELECT * FROM activity_sessions WHERE id=$1 AND actor_key=$2 FOR UPDATE', [sessionId, actor]);
      const session = result.rows[0];
      if (!session) throw problem(404, 'Unknown session');
      const now = this.now(), elapsed = (now - session.last_received_at) / 1000;
      if (elapsed > 120 || now - session.started_at > 86400000) throw problem(409, 'Stale session');
      const increment = Math.max(0, Math.min(activeSeconds - session.active_seconds, Math.max(0, elapsed), 60));
      const acceptedSeconds = session.active_seconds + increment;
      const qualified = session.qualified || acceptedSeconds >= 15;
      let counted = false;
      if (qualified && increment > 0) {
        // One lock covers different sessions/tabs for this visitor and game.
        await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [`${actor}:${session.game_id}`]);
        const counter = await client.query('SELECT last_counted_at FROM activity_counters WHERE actor_key=$1 AND game_id=$2', [actor, session.game_id]);
        const last = counter.rows[0]?.last_counted_at;
        if (!last || now - last >= WINDOW_MS) {
          await client.query('INSERT INTO game_play_events(id,session_id,game_id,qualified_at) VALUES($1,$2,$3,$4)', [randomUUID(), sessionId, session.game_id, now]);
          await client.query('INSERT INTO activity_counters(actor_key,game_id,last_counted_at) VALUES($1,$2,$3) ON CONFLICT(actor_key,game_id) DO UPDATE SET last_counted_at=EXCLUDED.last_counted_at', [actor, session.game_id, now]);
          counted = true;
        }
        // Qualification includes the initial learning/game observation interval.
        const duration = session.qualified ? increment : acceptedSeconds;
        await client.query('INSERT INTO game_daily_activity(day,game_id,active_seconds) VALUES($1,$2,$3) ON CONFLICT(day,game_id) DO UPDATE SET active_seconds=game_daily_activity.active_seconds+EXCLUDED.active_seconds', [shanghaiDate(now), session.game_id, duration]);
      }
      await client.query('UPDATE activity_sessions SET active_seconds=$2,qualified=$3,last_received_at=$4 WHERE id=$1', [sessionId, acceptedSeconds, qualified, now]);
      await client.query('COMMIT');
      return {acceptedSeconds, qualified, counted};
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  }
  async ranking(period) {
    const now = this.now();
    let range;
    try { range = periodRange(period, now); } catch { throw problem(400, 'Invalid period'); }
    const startDay = shanghaiDate(new Date(range.start));
    const endDay = shanghaiDate(new Date(range.end));
    const result = await this.pool.query(`
      WITH plays AS (
        SELECT game_id,COUNT(*)::integer AS plays FROM game_play_events
        WHERE qualified_at >= $1 AND qualified_at < $2 GROUP BY game_id
      ), durations AS (
        SELECT game_id,SUM(active_seconds) AS seconds FROM game_daily_activity
        WHERE day >= $3 AND day < $4 GROUP BY game_id
      )
      SELECT plays.game_id,plays.plays,COALESCE(durations.seconds,0) AS seconds
      FROM plays LEFT JOIN durations USING(game_id)
      ORDER BY plays.plays DESC,seconds DESC,plays.game_id`, [range.start, range.end, startDay, endDay]);
    const meta = await this.pool.query("SELECT value FROM platform_meta WHERE key='statistics_started_at'");
    return {period, range, statisticsStartedAt: meta.rows[0].value.toISOString(), updatedAt: now.toISOString(), items: result.rows.map(row => ({gameId: row.game_id, plays: row.plays, activeSeconds: Math.floor(row.seconds)}))};
  }
  async prune() {
    const cutoff = new Date(this.now().getTime() - 86400000);
    await this.pool.query('DELETE FROM activity_sessions WHERE last_received_at < $1', [cutoff]);
    await this.pool.query('DELETE FROM activity_counters WHERE last_counted_at < $1', [cutoff]);
  }
}
