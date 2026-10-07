-- Expand existing allowlists in the migration transaction without replacing any rows.
ALTER TABLE game_progress DROP CONSTRAINT IF EXISTS game_progress_game_id_check;
ALTER TABLE game_progress ADD CONSTRAINT game_progress_game_id_check CHECK (game_id IN ('english','chinese','math'));
ALTER TABLE save_imports DROP CONSTRAINT IF EXISTS save_imports_game_id_check;
ALTER TABLE save_imports ADD CONSTRAINT save_imports_game_id_check CHECK (game_id IN ('english','chinese','math'));
ALTER TABLE learning_events DROP CONSTRAINT IF EXISTS learning_events_content_version_check;
ALTER TABLE learning_events ADD CONSTRAINT learning_events_content_version_check CHECK (content_version IN ('pep3-2024-v1','pep3-cn-2026-v1','pep3-math-2025-v1'));
CREATE INDEX IF NOT EXISTS learning_events_profile_version_time ON learning_events(profile_id,content_version,occurred_at,event_id);
