import { fateDropPostgres } from "@/lib/postgres";

const MIGRATION_CUTOFF = "2026-08-31";
const OWNER_EMAIL = "hello@fatedrop.co.uk";

export const PRODUCTION_MIGRATIONS = [
  {
    id: "2026-08-28-unify-lifecycle-notification-defaults.sql",
    statements: [
      `ALTER TABLE fatedrop_notification_preferences
  ALTER COLUMN vanished_enabled SET DEFAULT true`,
      `UPDATE fatedrop_notification_preferences
SET vanished_enabled = true
WHERE vanished_enabled = false
  AND COALESCE(whisper_enabled, true) = true
  AND echo_enabled = true
  AND manifested_enabled = true`,
    ],
  },
  {
    id: "2026-08-30-alert-market-set-preferences.sql",
    statements: [
      `ALTER TABLE fatedrop_notification_preferences
  ADD COLUMN IF NOT EXISTS english_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS japanese_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS korean_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS simplified_chinese_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS traditional_chinese_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS other_languages_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS unknown_language_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS all_sets_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS selected_set_keys jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS unknown_sets_enabled boolean NOT NULL DEFAULT true`,
    ],
  },
  {
    id: "2026-08-29-push-dispatch-health.sql",
    statements: [
      `CREATE TABLE IF NOT EXISTS fatedrop_push_dispatch_health (
  id text PRIMARY KEY,
  last_started_at bigint,
  last_completed_at bigint,
  last_status text NOT NULL DEFAULT 'unknown',
  last_queued integer NOT NULL DEFAULT 0,
  last_claimed integer NOT NULL DEFAULT 0,
  last_sent integer NOT NULL DEFAULT 0,
  last_failed integer NOT NULL DEFAULT 0,
  last_error text,
  updated_at bigint NOT NULL
)`,
    ],
  },
  {
    id: "2026-08-29-fatefind-evaluation-capabilities.sql",
    statements: [
      `CREATE TABLE IF NOT EXISTS fatedrop_fatefind_evaluation_capabilities (
  token_hash text PRIMARY KEY,
  fate_find_id text NOT NULL,
  expires_at bigint NOT NULL,
  created_at bigint NOT NULL
)`,
      `CREATE INDEX IF NOT EXISTS fatedrop_fatefind_evaluation_capabilities_expiry_idx
  ON fatedrop_fatefind_evaluation_capabilities (expires_at)`,
    ],
  },
  {
    id: "2026-08-29-closed-beta-access.sql",
    statements: [
      `CREATE TABLE IF NOT EXISTS fatedrop_beta_access (
  user_id text PRIMARY KEY REFERENCES fatedrop_users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'revoked')),
  requested_at bigint NOT NULL,
  approved_at bigint,
  approved_by text,
  updated_at bigint NOT NULL
)`,
      `INSERT INTO fatedrop_beta_access (user_id, status, requested_at, approved_at, approved_by, updated_at)
SELECT id, 'approved', created_at, EXTRACT(EPOCH FROM NOW())::bigint, 'migration:pre-closed-beta', EXTRACT(EPOCH FROM NOW())::bigint
FROM fatedrop_users
ON CONFLICT (user_id) DO NOTHING`,
      `CREATE TABLE IF NOT EXISTS fatedrop_beta_access_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id text NOT NULL REFERENCES fatedrop_users(id) ON DELETE CASCADE,
  previous_status text,
  next_status text NOT NULL CHECK (next_status IN ('pending', 'approved', 'revoked')),
  operator text NOT NULL,
  changed_at bigint NOT NULL
)`,
      `CREATE OR REPLACE FUNCTION fatedrop_create_pending_beta_access()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO fatedrop_beta_access (user_id, status, requested_at, approved_at, approved_by, updated_at)
  VALUES (NEW.id, 'pending', NEW.created_at, NULL, NULL, NEW.created_at)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$`,
      `DROP TRIGGER IF EXISTS fatedrop_users_closed_beta_pending ON fatedrop_users`,
      `CREATE TRIGGER fatedrop_users_closed_beta_pending
AFTER INSERT ON fatedrop_users
FOR EACH ROW EXECUTE FUNCTION fatedrop_create_pending_beta_access()`,
      `INSERT INTO fatedrop_beta_access (user_id, status, requested_at, approved_at, approved_by, updated_at)
SELECT id, 'approved', created_at, EXTRACT(EPOCH FROM NOW())::bigint, 'migration:pre-closed-beta-reconcile', EXTRACT(EPOCH FROM NOW())::bigint
FROM fatedrop_users
ON CONFLICT (user_id) DO NOTHING`,
      `CREATE OR REPLACE FUNCTION fatedrop_set_beta_access(p_user_id text, p_status text, p_operator text)
RETURNS TABLE(user_id text, status text, requested_at bigint, approved_at bigint, approved_by text, updated_at bigint)
LANGUAGE plpgsql
AS $$
DECLARE
  v_previous text;
  v_now bigint := EXTRACT(EPOCH FROM NOW())::bigint;
  v_requested bigint;
BEGIN
  IF p_status NOT IN ('pending', 'approved', 'revoked') THEN RAISE EXCEPTION 'invalid beta status'; END IF;
  IF NULLIF(BTRIM(p_operator), '') IS NULL THEN RAISE EXCEPTION 'operator is required'; END IF;
  SELECT b.status, b.requested_at INTO v_previous, v_requested FROM fatedrop_beta_access b WHERE b.user_id = p_user_id FOR UPDATE;
  IF v_requested IS NULL THEN
    SELECT u.created_at INTO v_requested FROM fatedrop_users u WHERE u.id = p_user_id;
    IF v_requested IS NULL THEN RAISE EXCEPTION 'unknown FateDrop user'; END IF;
  END IF;
  INSERT INTO fatedrop_beta_access (user_id, status, requested_at, approved_at, approved_by, updated_at)
  VALUES (p_user_id,p_status,v_requested,CASE WHEN p_status='approved' THEN v_now ELSE NULL END,CASE WHEN p_status='approved' THEN BTRIM(p_operator) ELSE NULL END,v_now)
  ON CONFLICT (user_id) DO UPDATE SET status=EXCLUDED.status, approved_at=EXCLUDED.approved_at, approved_by=EXCLUDED.approved_by, updated_at=EXCLUDED.updated_at;
  INSERT INTO fatedrop_beta_access_audit (user_id, previous_status, next_status, operator, changed_at)
  VALUES (p_user_id, v_previous, p_status, BTRIM(p_operator), v_now);
  RETURN QUERY SELECT b.user_id, b.status, b.requested_at, b.approved_at, b.approved_by, b.updated_at FROM fatedrop_beta_access b WHERE b.user_id=p_user_id;
END;
$$`,
    ],
  },
  {
    id: "2026-08-29-beta-access-function-ambiguity-repair.sql",
    statements: [
      `CREATE OR REPLACE FUNCTION fatedrop_set_beta_access(p_user_id text, p_status text, p_operator text)
RETURNS TABLE(user_id text, status text, requested_at bigint, approved_at bigint, approved_by text, updated_at bigint)
LANGUAGE plpgsql
AS $$
DECLARE
  v_previous text;
  v_now bigint := EXTRACT(EPOCH FROM NOW())::bigint;
  v_requested bigint;
BEGIN
  IF p_status NOT IN ('pending', 'approved', 'revoked') THEN RAISE EXCEPTION 'invalid beta status'; END IF;
  IF NULLIF(BTRIM(p_operator), '') IS NULL THEN RAISE EXCEPTION 'operator is required'; END IF;
  SELECT b.status, b.requested_at INTO v_previous, v_requested FROM fatedrop_beta_access b WHERE b.user_id=p_user_id FOR UPDATE;
  IF v_requested IS NULL THEN
    SELECT u.created_at INTO v_requested FROM fatedrop_users u WHERE u.id=p_user_id;
    IF v_requested IS NULL THEN RAISE EXCEPTION 'unknown FateDrop user'; END IF;
  END IF;
  INSERT INTO fatedrop_beta_access (user_id,status,requested_at,approved_at,approved_by,updated_at)
  VALUES (p_user_id,p_status,v_requested,CASE WHEN p_status='approved' THEN v_now ELSE NULL END,CASE WHEN p_status='approved' THEN BTRIM(p_operator) ELSE NULL END,v_now)
  ON CONFLICT ON CONSTRAINT fatedrop_beta_access_pkey DO UPDATE SET
    status=EXCLUDED.status,
    approved_at=EXCLUDED.approved_at,
    approved_by=EXCLUDED.approved_by,
    updated_at=EXCLUDED.updated_at;
  INSERT INTO fatedrop_beta_access_audit (user_id,previous_status,next_status,operator,changed_at)
  VALUES (p_user_id,v_previous,p_status,BTRIM(p_operator),v_now);
  RETURN QUERY SELECT b.user_id,b.status,b.requested_at,b.approved_at,b.approved_by,b.updated_at FROM fatedrop_beta_access b WHERE b.user_id=p_user_id;
END;
$$`,
    ],
  },
  {
    id: "2026-08-29-beta-owner-access.sql",
    statements: [
      `CREATE TABLE IF NOT EXISTS fatedrop_admin_roles (
  user_id text PRIMARY KEY REFERENCES fatedrop_users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner')),
  granted_at bigint NOT NULL,
  granted_by text NOT NULL
)`,
      `CREATE TABLE IF NOT EXISTS fatedrop_admin_role_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id text NOT NULL REFERENCES fatedrop_users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner')),
  action text NOT NULL CHECK (action IN ('grant', 'revoke')),
  operator text NOT NULL,
  changed_at bigint NOT NULL
)`,
      `CREATE OR REPLACE FUNCTION fatedrop_grant_owner(p_user_id text, p_operator text)
RETURNS TABLE(user_id text, role text, granted_at bigint, granted_by text)
LANGUAGE plpgsql
AS $$
DECLARE
  v_now bigint := EXTRACT(EPOCH FROM NOW())::bigint;
BEGIN
  IF NULLIF(BTRIM(p_operator), '') IS NULL THEN RAISE EXCEPTION 'operator is required'; END IF;
  IF NOT EXISTS (SELECT 1 FROM fatedrop_users u WHERE u.id=p_user_id) THEN RAISE EXCEPTION 'unknown FateDrop user'; END IF;
  INSERT INTO fatedrop_admin_roles (user_id,role,granted_at,granted_by)
  VALUES (p_user_id,'owner',v_now,BTRIM(p_operator))
  ON CONFLICT ON CONSTRAINT fatedrop_admin_roles_pkey DO UPDATE SET
    role='owner',granted_at=EXCLUDED.granted_at,granted_by=EXCLUDED.granted_by;
  INSERT INTO fatedrop_admin_role_audit (user_id,role,action,operator,changed_at)
  VALUES (p_user_id,'owner','grant',BTRIM(p_operator),v_now);
  PERFORM fatedrop_set_beta_access(p_user_id,'approved',BTRIM(p_operator));
  RETURN QUERY SELECT r.user_id,r.role,r.granted_at,r.granted_by FROM fatedrop_admin_roles r WHERE r.user_id=p_user_id;
END;
$$`,
      `CREATE OR REPLACE FUNCTION fatedrop_revoke_owner(p_user_id text, p_operator text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_now bigint := EXTRACT(EPOCH FROM NOW())::bigint;
BEGIN
  IF NULLIF(BTRIM(p_operator), '') IS NULL THEN RAISE EXCEPTION 'operator is required'; END IF;
  IF EXISTS (SELECT 1 FROM fatedrop_admin_roles r WHERE r.user_id=p_user_id AND r.role='owner') THEN
    DELETE FROM fatedrop_admin_roles WHERE user_id=p_user_id;
    INSERT INTO fatedrop_admin_role_audit (user_id,role,action,operator,changed_at)
    VALUES (p_user_id,'owner','revoke',BTRIM(p_operator),v_now);
  END IF;
END;
$$`,
    ],
  },
  {
    id: "2026-08-29-password-reset.sql",
    statements: [
      `CREATE TABLE IF NOT EXISTS fatedrop_password_reset_tokens (
  token_hash text PRIMARY KEY,
  user_id text NOT NULL REFERENCES fatedrop_users(id) ON DELETE CASCADE,
  created_at bigint NOT NULL,
  expires_at bigint NOT NULL,
  consumed_at bigint
)`,
      `CREATE INDEX IF NOT EXISTS fatedrop_password_reset_tokens_user_idx
  ON fatedrop_password_reset_tokens (user_id, created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS fatedrop_password_reset_tokens_expiry_idx
  ON fatedrop_password_reset_tokens (expires_at)`,
      `CREATE OR REPLACE FUNCTION fatedrop_consume_password_reset(p_token_hash text, p_password_hash text)
RETURNS TABLE(user_id text)
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id text;
  v_now bigint := EXTRACT(EPOCH FROM NOW())::bigint;
BEGIN
  IF NULLIF(BTRIM(p_token_hash), '') IS NULL THEN RAISE EXCEPTION 'token hash is required'; END IF;
  IF NULLIF(BTRIM(p_password_hash), '') IS NULL THEN RAISE EXCEPTION 'password hash is required'; END IF;
  SELECT t.user_id INTO v_user_id
  FROM fatedrop_password_reset_tokens t
  WHERE t.token_hash=p_token_hash AND t.consumed_at IS NULL AND t.expires_at>v_now
  FOR UPDATE;
  IF v_user_id IS NULL THEN RETURN; END IF;
  UPDATE fatedrop_password_reset_tokens t SET consumed_at=v_now WHERE t.user_id=v_user_id AND t.consumed_at IS NULL;
  UPDATE fatedrop_users u SET password_hash=p_password_hash, updated_at=v_now WHERE u.id=v_user_id;
  DELETE FROM fatedrop_sessions s WHERE s.user_id=v_user_id;
  RETURN QUERY SELECT v_user_id;
END;
$$`,
    ],
  },
  {
    id: "2026-08-31-multi-tcg-account-preferences.sql",
    statements: [
      `ALTER TABLE fatedrop_users
  ADD COLUMN IF NOT EXISTS selected_tcg_codes jsonb NOT NULL DEFAULT '["pokemon"]'::jsonb,
  ADD COLUMN IF NOT EXISTS tcg_onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tcg_alert_preferences jsonb NOT NULL DEFAULT '{}'::jsonb`,
      `UPDATE fatedrop_users
SET selected_tcg_codes='["pokemon"]'::jsonb
WHERE jsonb_typeof(selected_tcg_codes)<>'array' OR jsonb_array_length(selected_tcg_codes)=0`,
      `ALTER TABLE fatedrop_notification_preferences
  ADD COLUMN IF NOT EXISTS manifested_reminders_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS manifested_reminders_max_per_day integer NOT NULL DEFAULT 1
    CHECK (manifested_reminders_max_per_day BETWEEN 0 AND 3)`,
    ],
  },
  {
    id: "2026-08-31-push-recovery-checkpoint.sql",
    statements: [
      `CREATE TABLE IF NOT EXISTS fatedrop_push_recovery_checkpoint (
  id text PRIMARY KEY,
  last_completed_at bigint NOT NULL,
  updated_at bigint NOT NULL
)`,
    ],
  },
  {
    id: "2026-08-31-fate-match-tcg-scope.sql",
    statements: [
      `ALTER TABLE fatedrop_fate_matches
  ADD COLUMN IF NOT EXISTS tcg_code text NOT NULL DEFAULT 'pokemon'`,
      `ALTER TABLE fatedrop_hosted_fate_matches
  ADD COLUMN IF NOT EXISTS tcg_code text NOT NULL DEFAULT 'pokemon'`,
      `UPDATE fatedrop_fate_matches
SET tcg_code='pokemon'
WHERE NULLIF(BTRIM(tcg_code),'') IS NULL`,
      `UPDATE fatedrop_hosted_fate_matches
SET tcg_code='pokemon'
WHERE NULLIF(BTRIM(tcg_code),'') IS NULL`,
      `CREATE INDEX IF NOT EXISTS fatedrop_fate_matches_tcg_active_idx
  ON fatedrop_fate_matches (tcg_code,enabled,updated_at DESC)`,
      `CREATE INDEX IF NOT EXISTS fatedrop_hosted_fate_matches_tcg_time_idx
  ON fatedrop_hosted_fate_matches (tcg_code,matched_at DESC)`,
    ],
  },
  {
    id: "2026-09-01-account-deletion-requests.sql",
    statements: [
      `CREATE TABLE IF NOT EXISTS fatedrop_account_deletion_requests (
  user_id text PRIMARY KEY REFERENCES fatedrop_users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'cancelled')),
  source text NOT NULL DEFAULT 'mobile_app',
  requested_at bigint NOT NULL,
  updated_at bigint NOT NULL
)`,
      `CREATE INDEX IF NOT EXISTS fatedrop_account_deletion_requests_status_time_idx
  ON fatedrop_account_deletion_requests (status, requested_at ASC)`,
    ],
  },
  {
    id: "2026-09-05-operator-echo-retractions.sql",
    statements: [
      `CREATE TABLE IF NOT EXISTS fatedrop_operator_echo_retractions (
  target_event_id text PRIMARY KEY CHECK (target_event_id ~ '^local-radar-operator:[1-9][0-9]*$'),
  retraction_event_id text NOT NULL UNIQUE CHECK (retraction_event_id ~ '^local-radar-operator-retraction:[1-9][0-9]*$'),
  original_operator_issue bigint NOT NULL CHECK (original_operator_issue > 0),
  retraction_issue bigint NOT NULL UNIQUE CHECK (retraction_issue > 0),
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 10 AND 500),
  operator_login text NOT NULL,
  requested_at bigint NOT NULL,
  retracted_at bigint NOT NULL,
  payload_json jsonb NOT NULL
)`,
      `CREATE INDEX IF NOT EXISTS fatedrop_operator_echo_retractions_time_idx
  ON fatedrop_operator_echo_retractions (retracted_at DESC)`,
      `CREATE TABLE IF NOT EXISTS fatedrop_operator_echo_retraction_audit (
  request_event_id text PRIMARY KEY CHECK (request_event_id ~ '^local-radar-operator-retraction:[1-9][0-9]*$'),
  target_event_id text NOT NULL REFERENCES fatedrop_operator_echo_retractions(target_event_id),
  outcome text NOT NULL CHECK (outcome IN ('effective', 'already_retracted')),
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 10 AND 500),
  operator_login text NOT NULL,
  requested_at bigint NOT NULL,
  recorded_at bigint NOT NULL
)`,
      `CREATE INDEX IF NOT EXISTS fatedrop_operator_echo_retraction_audit_target_time_idx
  ON fatedrop_operator_echo_retraction_audit (target_event_id, recorded_at DESC)`,
    ],
  },
] as const;

export const PRODUCTION_MIGRATION_CUTOFF = MIGRATION_CUTOFF;

async function ensureMigrationLedger() {
  const sql = await fateDropPostgres();
  await sql`CREATE TABLE IF NOT EXISTS fatedrop_schema_migrations (migration_id text PRIMARY KEY, applied_at bigint NOT NULL)`;
  return sql;
}

export async function runProductionMigrations() {
  const sql = await ensureMigrationLedger();
  const appliedRows = await sql`SELECT migration_id FROM fatedrop_schema_migrations`;
  const applied = new Set(appliedRows.map((row) => String(row.migration_id)));
  const newlyApplied: string[] = [];

  for (const migration of PRODUCTION_MIGRATIONS) {
    if (applied.has(migration.id)) continue;
    for (const statement of migration.statements) await sql.query(statement);

    if (migration.id === "2026-08-29-beta-owner-access.sql") {
      const ownerRows = await sql`SELECT id FROM fatedrop_users WHERE lower(email)=${OWNER_EMAIL}`;
      if (ownerRows.length !== 1) throw new Error(`Owner bootstrap requires exactly one canonical ${OWNER_EMAIL} FateDrop account.`);
      const ownerUserId = String(ownerRows[0].id);
      const ownerExists = await sql`SELECT user_id FROM fatedrop_admin_roles WHERE user_id=${ownerUserId} AND role='owner' LIMIT 1`;
      if (!ownerExists[0]) await sql`SELECT * FROM fatedrop_grant_owner(${ownerUserId}, ${"migration:hello-owner-bootstrap"})`;
    }

    await sql`INSERT INTO fatedrop_schema_migrations (migration_id,applied_at) VALUES (${migration.id},${Math.floor(Date.now()/1000)}) ON CONFLICT (migration_id) DO NOTHING`;
    newlyApplied.push(migration.id);
  }

  const ledgerRows = await sql`SELECT migration_id FROM fatedrop_schema_migrations`;
  const ledger = new Set(ledgerRows.map((row) => String(row.migration_id)));
  const pending = PRODUCTION_MIGRATIONS.filter((migration) => !ledger.has(migration.id)).map((migration) => migration.id);

  const defaultRows = await sql`SELECT column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='fatedrop_notification_preferences' AND column_name='vanished_enabled'`;
  const facetColumnRows = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema='public'
      AND table_name='fatedrop_notification_preferences'
      AND column_name IN (
        'english_enabled','japanese_enabled','korean_enabled','simplified_chinese_enabled','traditional_chinese_enabled',
        'other_languages_enabled','unknown_language_enabled','all_sets_enabled','selected_set_keys','unknown_sets_enabled'
      )`;
  const facetColumns = new Set(facetColumnRows.map((row) => String(row.column_name)));
  const vanishedDefault = String(defaultRows[0]?.column_default ?? "").toLowerCase();
  const asymmetricRows = await sql`SELECT COUNT(*)::int AS count FROM fatedrop_notification_preferences WHERE vanished_enabled=false AND COALESCE(whisper_enabled,true)=true AND echo_enabled=true AND manifested_enabled=true`;
  const historicalAsymmetryCount = Number(asymmetricRows[0]?.count ?? 0);
  const betaMissingRows = await sql`SELECT COUNT(*)::int AS count FROM fatedrop_users u LEFT JOIN fatedrop_beta_access b ON b.user_id=u.id WHERE b.user_id IS NULL`;
  const betaAccessMissingCount = Number(betaMissingRows[0]?.count ?? 0);
  const ownerRows = await sql`
    SELECT u.id, r.role, b.status AS beta_status
    FROM fatedrop_users u
    JOIN fatedrop_admin_roles r ON r.user_id=u.id AND r.role='owner'
    LEFT JOIN fatedrop_beta_access b ON b.user_id=u.id
    WHERE lower(u.email)=${OWNER_EMAIL}`;
  const tcgColumnRows = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema='public'
      AND (
        (table_name='fatedrop_users' AND column_name IN ('selected_tcg_codes','tcg_onboarding_completed','tcg_alert_preferences'))
        OR (table_name='fatedrop_notification_preferences' AND column_name IN ('manifested_reminders_enabled','manifested_reminders_max_per_day'))
      )`;
  const recoveryCheckpointRows = await sql`SELECT to_regclass('public.fatedrop_push_recovery_checkpoint')::text AS checkpoint_table`;
  const fateMatchTcgRows = await sql`
    SELECT table_name,column_default,is_nullable
    FROM information_schema.columns
    WHERE table_schema='public'
      AND table_name IN ('fatedrop_fate_matches','fatedrop_hosted_fate_matches')
      AND column_name='tcg_code'`;
  const unscopedFateMatchRows = await sql`
    SELECT
      (SELECT COUNT(*) FROM fatedrop_fate_matches WHERE NULLIF(BTRIM(tcg_code),'') IS NULL)::int
      + (SELECT COUNT(*) FROM fatedrop_hosted_fate_matches WHERE NULLIF(BTRIM(tcg_code),'') IS NULL)::int AS count`;
  const operatorEchoRetractionRows = await sql`
    SELECT
      to_regclass('public.fatedrop_operator_echo_retractions')::text AS retractions_table,
      to_regclass('public.fatedrop_operator_echo_retraction_audit')::text AS audit_table`;

  if (!vanishedDefault.includes("true")) throw new Error("Production migration verification failed: Vanished default is not enabled.");
  if (facetColumns.size !== 10) throw new Error(`Production migration verification failed: expected 10 alert market/set preference columns, found ${facetColumns.size}.`);
  if (historicalAsymmetryCount !== 0) throw new Error(`Production migration verification failed: ${historicalAsymmetryCount} legacy asymmetric lifecycle preference row(s) remain.`);
  if (betaAccessMissingCount !== 0) throw new Error(`Production migration verification failed: ${betaAccessMissingCount} FateDrop account(s) are missing closed-beta access state.`);
  if (ownerRows.length !== 1 || String(ownerRows[0].beta_status) !== "approved") throw new Error("Production migration verification failed: canonical FateDrop Owner is missing or not beta-approved.");
  if (tcgColumnRows.length !== 5) throw new Error(`Production migration verification failed: expected 5 multi-TCG/reminder columns, found ${tcgColumnRows.length}.`);
  if (!recoveryCheckpointRows[0]?.checkpoint_table) throw new Error("Production migration verification failed: push recovery checkpoint is missing.");
  if (fateMatchTcgRows.length !== 2 || fateMatchTcgRows.some((row) => String(row.is_nullable) !== "NO")) throw new Error("Production migration verification failed: FateMatch TCG scope is missing or nullable.");
  if (Number(unscopedFateMatchRows[0]?.count ?? 0) !== 0) throw new Error("Production migration verification failed: unscoped FateMatch rows remain.");
  if (!operatorEchoRetractionRows[0]?.retractions_table || !operatorEchoRetractionRows[0]?.audit_table) throw new Error("Production migration verification failed: operator Echo retraction audit storage is missing.");
  if (pending.length) throw new Error(`Production migration verification failed: pending migrations: ${pending.join(", ")}`);

  return {
    known: PRODUCTION_MIGRATIONS.length,
    newlyApplied,
    pending,
    vanishedDefaultVerified: true,
    historicalAsymmetryCount,
    facetPreferenceColumnsVerified: true,
    betaAccessMissingCount,
    ownerVerified: true,
    ownerUserId: String(ownerRows[0].id),
    multiTcgPreferenceColumnsVerified: true,
    pushRecoveryCheckpointVerified: true,
    fateMatchTcgScopeVerified: true,
    operatorEchoRetractionStorageVerified: true,
  };
}
