CREATE TABLE IF NOT EXISTS platform_meta (
  key text PRIMARY KEY,
  value timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS activity_sessions (
  id uuid PRIMARY KEY,
  actor_key text NOT NULL,
  game_id text NOT NULL,
  started_at timestamptz NOT NULL,
  last_received_at timestamptz NOT NULL,
  active_seconds double precision NOT NULL DEFAULT 0 CHECK(active_seconds >= 0),
  qualified boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS activity_sessions_received ON activity_sessions(last_received_at);
CREATE TABLE IF NOT EXISTS activity_counters (
  actor_key text NOT NULL,
  game_id text NOT NULL,
  last_counted_at timestamptz NOT NULL,
  PRIMARY KEY(actor_key, game_id)
);
CREATE TABLE IF NOT EXISTS game_play_events (
  id uuid PRIMARY KEY,
  session_id uuid NOT NULL,
  game_id text NOT NULL,
  qualified_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS game_play_events_period ON game_play_events(qualified_at, game_id);
CREATE TABLE IF NOT EXISTS game_daily_activity (
  day date NOT NULL,
  game_id text NOT NULL,
  active_seconds double precision NOT NULL DEFAULT 0 CHECK(active_seconds >= 0),
  PRIMARY KEY(day, game_id)
);
