import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {problem} from './store.mjs';
import {boundJson,uuid,sanitizeEnglish,sanitizeSession,normalizeEvent,replayEnglish,CONTENT_VERSION} from './english-progress.mjs';
import * as chinese from './chinese-progress.mjs';

const codecs = new Map([
  ['english',{sanitize:sanitizeEnglish,sanitizeSession,normalizeEvent,replay:replayEnglish,CONTENT_VERSION}],
  ['chinese',chinese],
]);
function subjectCodec(subject) {
  const codec = codecs.get(subject);
  if (!codec) throw problem(400,'Unknown subject');
  return codec;
}

const avatars = new Set(['fox','panda','rabbit','cat','dog','bird']);
const empty = () => ({version:1,lessons:{},items:{},session:null});
const profileView = row => ({id:row.id,nickname:row.nickname,avatar:row.avatar});
const progressView = row => row ? {revision:row.revision,data:row.data} : {revision:0,data:empty()};
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const own = (value,key) => Object.prototype.hasOwnProperty.call(value,key);
function fields(body, partial = false) {
  if (!object(body)) throw problem(400, 'Invalid profile');
  const result = {};
  if (!partial || own(body,'nickname')) {
    if (typeof body.nickname !== 'string' || /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u.test(body.nickname)) throw problem(400, 'Invalid nickname');
    const nickname = body.nickname.trim();
    if ([...nickname].length < 1 || [...nickname].length > 20) throw problem(400, 'Invalid nickname');
    result.nickname = nickname;
  }
  if (!partial || own(body,'avatar')) {
    if (!avatars.has(body.avatar)) throw problem(400, 'Invalid avatar');
    result.avatar = body.avatar;
  }
  if (!Object.keys(result).length) throw problem(400, 'Invalid profile');
  return result;
}
function eventView(row, original = false) {
  return {eventId:row.event_id,contentVersion:row.content_version,contentId:row.content_id,kind:row.kind,occurredAt:original ? row.original_occurred_at : row.occurred_at.getTime(),result:row.result};
}

export class FamilyStore {
  constructor({pool}) { this.pool = pool; }
  async transaction(action) {
    const client = await this.pool.connect();
    try { await client.query('BEGIN'); const result = await action(client); await client.query('COMMIT'); return result; }
    catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  }
  async migrate() {
    return this.transaction(async client => {
      await client.query('SELECT pg_advisory_xact_lock(96421005)');
      await client.query(await readFile(new URL('./migrations/002-family.sql',import.meta.url),'utf8'));
      await client.query(await readFile(new URL('./migrations/003-subjects.sql',import.meta.url),'utf8'));
    });
  }
  async profiles(owner) {
    const result = await this.pool.query('SELECT id,nickname,avatar FROM player_profiles WHERE owner_user_id=$1 AND deleted_at IS NULL ORDER BY created_at,id',[owner]);
    return result.rows.map(profileView);
  }
  async createProfile(owner, body) {
    const {nickname,avatar} = fields(body);
    return this.transaction(async client => {
      // Lock the actual parent row so concurrent tabs cannot both create the eighth child.
      const user = await client.query('SELECT id FROM family_user WHERE id=$1 FOR UPDATE',[owner]);
      if (!user.rowCount) throw problem(404, 'Unknown account');
      const count = await client.query('SELECT count(*) AS total FROM player_profiles WHERE owner_user_id=$1 AND deleted_at IS NULL',[owner]);
      if (Number(count.rows[0].total) >= 8) throw problem(409, 'Profile limit reached');
      const result = await client.query('INSERT INTO player_profiles(id,owner_user_id,nickname,avatar) VALUES($1,$2,$3,$4) RETURNING id,nickname,avatar',[randomUUID(),owner,nickname,avatar]);
      return profileView(result.rows[0]);
    });
  }
  async lockProfile(client,owner,id) {
    const result = await client.query('SELECT id,nickname,avatar FROM player_profiles WHERE id=$1 AND owner_user_id=$2 AND deleted_at IS NULL FOR UPDATE',[id,owner]);
    if (!result.rowCount) throw problem(404, 'Unknown profile');
    return result.rows[0];
  }
  async updateProfile(owner,id,body) {
    id = uuid(id, 'profile ID');
    const update = fields(body,true);
    return this.transaction(async client => {
      const previous = await this.lockProfile(client,owner,id);
      const result = await client.query('UPDATE player_profiles SET nickname=$3,avatar=$4,updated_at=now() WHERE id=$1 AND owner_user_id=$2 AND deleted_at IS NULL RETURNING id,nickname,avatar',[id,owner,update.nickname??previous.nickname,update.avatar??previous.avatar]);
      return profileView(result.rows[0]);
    });
  }
  async deleteProfile(owner,id) {
    id = uuid(id, 'profile ID');
    return this.transaction(async client => {
      await this.lockProfile(client,owner,id);
      await client.query('UPDATE player_profiles SET deleted_at=now(),updated_at=now() WHERE id=$1 AND owner_user_id=$2',[id,owner]);
      await client.query('DELETE FROM game_progress WHERE profile_id=$1',[id]);
      await client.query('DELETE FROM learning_events WHERE profile_id=$1',[id]);
      await client.query('DELETE FROM save_imports WHERE profile_id=$1',[id]);
      return {deleted:true};
    });
  }
  async getProgress(owner,id,subject='english') {
    subjectCodec(subject);
    id = uuid(id, 'profile ID');
    const result = await this.pool.query('SELECT gp.revision,gp.data FROM player_profiles p LEFT JOIN game_progress gp ON gp.profile_id=p.id AND gp.game_id=$3 WHERE p.id=$1 AND p.owner_user_id=$2 AND p.deleted_at IS NULL',[id,owner,subject]);
    if (!result.rowCount) throw problem(404, 'Unknown profile');
    return result.rows[0].revision === null ? progressView(null) : progressView(result.rows[0]);
  }
  async syncProgress(owner,id,body,subject='english') {
    const codec = subjectCodec(subject);
    id = uuid(id, 'profile ID'); boundJson(body);
    if (!object(body) || !Number.isSafeInteger(body.baseRevision) || body.baseRevision < 0 || !Array.isArray(body.events) || body.events.length > 256 || !own(body,'session')) throw problem(400, 'Invalid progress batch');
    const session = codec.sanitizeSession(body.session), events = body.events.map(codec.normalizeEvent);
    // UUIDs are global: a consistent insertion order prevents two overlapping batches
    // on different profiles from acquiring unique-index locks in opposite orders.
    events.sort((a,b) => a.eventId < b.eventId ? -1 : a.eventId > b.eventId ? 1 : 0);
    return this.transaction(async client => {
      await this.lockProfile(client,owner,id);
      const row = (await client.query('SELECT * FROM game_progress WHERE profile_id=$1 AND game_id=$2',[id,subject])).rows[0];
      const current = progressView(row);
      if (body.baseRevision !== current.revision) throw Object.assign(problem(409, 'Progress conflict'),{current});
      const now = Date.now();
      for (const event of events) {
        const inserted = await client.query('INSERT INTO learning_events(event_id,profile_id,content_id,content_version,kind,result,original_occurred_at,occurred_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(event_id) DO NOTHING RETURNING event_id',[event.eventId,id,event.contentId,event.contentVersion,event.kind,event.result,event.occurredAt,new Date(Math.min(event.occurredAt,now))]);
        if (!inserted.rowCount) {
          const previous = (await client.query('SELECT * FROM learning_events WHERE event_id=$1',[event.eventId])).rows[0];
          if (!previous || previous.profile_id !== id || !isDeepStrictEqual(eventView(previous,true),event)) throw problem(409, 'Learning event conflict');
        }
      }
      const history = (await client.query('SELECT * FROM learning_events WHERE profile_id=$1 AND content_version=$2 ORDER BY occurred_at,event_id',[id,codec.CONTENT_VERSION])).rows.map(row => eventView(row));
      const data = codec.replay(row?.baseline??empty(),history);
      data.session = session; boundJson(data);
      const revision = current.revision+1;
      await client.query('INSERT INTO game_progress(profile_id,game_id,revision,baseline,data) VALUES($1,$2,$3,$4,$5) ON CONFLICT(profile_id,game_id) DO UPDATE SET revision=EXCLUDED.revision,data=EXCLUDED.data,updated_at=now()',[id,subject,revision,row?.baseline??empty(),data]);
      return {revision,data};
    });
  }
  async importProgress(owner,id,body,subject='english') {
    const codec = subjectCodec(subject);
    id = uuid(id, 'profile ID'); boundJson(body);
    if (!object(body) || !object(body.data) || body.data.version !== 1) throw problem(400, `Invalid ${subject === 'english' ? 'English' : 'Chinese'} import`);
    const importId = uuid(body.importId,'import ID'), sourceId = uuid(body.sourceId,'source ID');
    const data = codec.sanitize(body.data);
    // Preserve the uploaded course snapshot, excluding unrelated game and auth root fields.
    const original = {version:body.data.version,lessons:body.data.lessons??{},items:body.data.items??{},session:body.data.session??null};
    boundJson(original);
    return this.transaction(async client => {
      await this.lockProfile(client,owner,id);
      const byId = (await client.query('SELECT profile_id,source_id,game_id FROM save_imports WHERE import_id=$1',[importId])).rows[0];
      if (byId && (byId.profile_id !== id || byId.source_id !== sourceId || byId.game_id !== subject)) throw problem(409, 'Import conflict');
      const existing = await client.query('SELECT import_id FROM save_imports WHERE source_id=$1 AND profile_id=$2 AND game_id=$3',[sourceId,id,subject]);
      const row = (await client.query('SELECT * FROM game_progress WHERE profile_id=$1 AND game_id=$2',[id,subject])).rows[0];
      if (existing.rowCount) return progressView(row);
      const priorImport = await client.query('SELECT import_id FROM save_imports WHERE profile_id=$1 AND game_id=$2',[id,subject]);
      if (priorImport.rowCount || (row && (Object.keys(row.data.lessons).length || Object.keys(row.data.items).length || row.data.session))) throw problem(409, 'Profile progress is not empty');
      const inserted = await client.query('INSERT INTO save_imports(import_id,source_id,profile_id,game_id,original_snapshot) VALUES($1,$2,$3,$4,$5) ON CONFLICT(import_id) DO NOTHING RETURNING import_id',[importId,sourceId,id,subject,original]);
      if (!inserted.rowCount) throw problem(409, 'Import conflict');
      const revision = (row?.revision??0)+1;
      await client.query('INSERT INTO game_progress(profile_id,game_id,revision,baseline,data) VALUES($1,$2,$3,$4,$4) ON CONFLICT(profile_id,game_id) DO UPDATE SET revision=EXCLUDED.revision,baseline=EXCLUDED.baseline,data=EXCLUDED.data,updated_at=now()',[id,subject,revision,data]);
      return {revision,data};
    });
  }
  async exportAccount(owner) {
    return this.transaction(async client => {
      // One statement yields one snapshot of active owned profiles and their course state.
      const rows = (await client.query("SELECT p.id,p.nickname,p.avatar,s.game_id,gp.revision,gp.data FROM player_profiles p CROSS JOIN (VALUES ('english'),('chinese')) s(game_id) LEFT JOIN game_progress gp ON gp.profile_id=p.id AND gp.game_id=s.game_id WHERE p.owner_user_id=$1 AND p.deleted_at IS NULL ORDER BY p.created_at,p.id,s.game_id",[owner])).rows;
      return {profiles:[...new Map(rows.map(row => [row.id,profileView(row)])).values()],progress:rows.map(row => ({profileId:row.id,gameId:row.game_id,...progressView(row.revision===null?null:row)}))};
    });
  }
}
