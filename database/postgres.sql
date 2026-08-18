CREATE TABLE IF NOT EXISTS beta_leads (
  id text PRIMARY KEY,
  role text NOT NULL CHECK (role IN ('collector', 'business', 'event')),
  email text NOT NULL,
  contact_name text NOT NULL,
  region text,
  primary_tcg text,
  wanted_feature text,
  business_name text,
  website text,
  ecommerce_platform text,
  product_count text,
  business_type text,
  catalogue_method text,
  attends_events text,
  event_name text,
  event_location text,
  event_date text,
  vendor_count text,
  ticket_link text,
  event_vendor_mode boolean NOT NULL DEFAULT false,
  message text,
  contact_consent boolean NOT NULL,
  marketing_consent boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'website',
  created_at bigint NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS beta_leads_role_email_unique
  ON beta_leads (role, email);
