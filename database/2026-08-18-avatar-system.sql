CREATE TABLE IF NOT EXISTS fatedrop_user_avatars (
  user_id text PRIMARY KEY REFERENCES fatedrop_users(id) ON DELETE CASCADE,
  loadout_json jsonb NOT NULL,
  favourite_tcgs_json jsonb NOT NULL,
  updated_at bigint NOT NULL
);
