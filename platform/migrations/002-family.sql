CREATE TABLE IF NOT EXISTS player_profiles (
  id uuid PRIMARY KEY,
  owner_user_id text NOT NULL REFERENCES family_user(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  avatar text NOT NULL CHECK (avatar IN ('fox','panda','rabbit','cat','dog','bird')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS player_profiles_owner ON player_profiles(owner_user_id) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS game_progress (
  profile_id uuid NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  game_id text NOT NULL CHECK (game_id = 'english'),
  schema_version integer NOT NULL DEFAULT 1 CHECK (schema_version = 1),
  revision integer NOT NULL DEFAULT 0 CHECK (revision >= 0),
  baseline jsonb NOT NULL,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id,game_id),
  -- API JSON is limited to 512 KiB. PostgreSQL adds spaces when JSONB is rendered as text.
  CHECK (octet_length(baseline::text) <= 1048576),
  CHECK (octet_length(data::text) <= 1048576)
);
CREATE TABLE IF NOT EXISTS learning_events (
  event_id uuid PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  content_id text NOT NULL,
  content_version text NOT NULL CHECK (content_version = 'pep3-2024-v1'),
  kind text NOT NULL CHECK (kind IN ('answer','completion')),
  result jsonb NOT NULL,
  original_occurred_at double precision NOT NULL,
  occurred_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  CHECK (octet_length(result::text) <= 1048576)
);
CREATE INDEX IF NOT EXISTS learning_events_profile_time ON learning_events(profile_id,occurred_at,event_id);
CREATE TABLE IF NOT EXISTS save_imports (
  import_id uuid PRIMARY KEY,
  source_id uuid NOT NULL,
  profile_id uuid NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  game_id text NOT NULL CHECK (game_id = 'english'),
  original_snapshot jsonb NOT NULL,
  imported_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(source_id,profile_id,game_id),
  CHECK (octet_length(original_snapshot::text) <= 1048576)
);
