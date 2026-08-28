CREATE TABLE IF NOT EXISTS app_beta_leads (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  contact_name text NOT NULL,
  device_type text NOT NULL CHECK (device_type IN ('iphone', 'ipad', 'android', 'other')),
  contact_consent boolean NOT NULL,
  marketing_consent boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'app-beta-page',
  created_at bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS app_beta_leads_created_at_idx
  ON app_beta_leads (created_at DESC);
