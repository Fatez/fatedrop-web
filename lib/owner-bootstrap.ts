import { fateDropPostgres } from "@/lib/postgres";

const OWNER_EMAIL = "hello@fatedrop.co.uk";
const OWNER_MIGRATION_ID = "2026-08-29-beta-owner-access.sql";
const OWNER_ACCOUNT = {
  id: "69635bf9-eace-4d2a-b821-16cf46087671",
  fateId: "FD-C144772E",
  email: OWNER_EMAIL,
  passwordHash: "scrypt$6iVtrr3A7jl0EXtbe75bzA$4FYnXa3C6dxHFtR9HQFiAWrwSOYOXccwcCf6ZlePHAFkxQPwhgLiMpvRaSJwuyxifRncdtJXkBw38zxmdMrUwg",
  displayName: "FateDrop Owner",
  username: "fatedrop-owner-866666",
  primaryTcg: "Pokémon TCG",
  profileTheme: "signal",
} as const;

/**
 * Creates the one missing canonical FateDrop Owner account required by the
 * closed-beta owner migration. This is deliberately narrower than public
 * registration: it only acts before the canonical owner migration is recorded,
 * only when there are zero matching owner-email accounts, and never grants the
 * Owner role itself. The existing audited migration remains the authority grant.
 */
export async function ensureCanonicalOwnerBootstrapAccount() {
  const sql = await fateDropPostgres();

  const ownerRows = await sql`
    SELECT id
    FROM fatedrop_users
    WHERE lower(email)=${OWNER_EMAIL}
  `;

  if (ownerRows.length > 1) {
    throw new Error(`Owner bootstrap requires exactly one canonical ${OWNER_EMAIL} FateDrop account.`);
  }

  if (ownerRows.length === 1) {
    return { created: false, userId: String(ownerRows[0].id) };
  }

  const ledgerTableRows = await sql`
    SELECT to_regclass('public.fatedrop_schema_migrations') AS relation
  `;
  const ledgerExists = Boolean(ledgerTableRows[0]?.relation);

  if (ledgerExists) {
    const appliedRows = await sql`
      SELECT migration_id
      FROM fatedrop_schema_migrations
      WHERE migration_id=${OWNER_MIGRATION_ID}
      LIMIT 1
    `;
    if (appliedRows[0]) {
      throw new Error("Canonical Owner migration is already recorded; refusing to recreate a missing Owner account.");
    }
  }

  const now = Math.floor(Date.now() / 1000);
  const insertedRows = await sql`
    WITH inserted_user AS (
      INSERT INTO fatedrop_users (
        id, fate_id, email, password_hash, display_name, username, bio, avatar_url,
        primary_tcg, collector_style, region, profile_theme, created_at, updated_at
      ) VALUES (
        ${OWNER_ACCOUNT.id}, ${OWNER_ACCOUNT.fateId}, ${OWNER_ACCOUNT.email}, ${OWNER_ACCOUNT.passwordHash},
        ${OWNER_ACCOUNT.displayName}, ${OWNER_ACCOUNT.username}, ${null}, ${null}, ${OWNER_ACCOUNT.primaryTcg},
        ${null}, ${null}, ${OWNER_ACCOUNT.profileTheme}, ${now}, ${now}
      )
      RETURNING id
    )
    INSERT INTO fatedrop_memberships (
      user_id, tier, status, stripe_customer_id, stripe_subscription_id, stripe_price_id,
      trial_started_at, trial_ends_at, current_period_end, cancel_at_period_end, updated_at
    )
    SELECT id, 'free', 'free', NULL, NULL, NULL, NULL, NULL, NULL, false, ${now}
    FROM inserted_user
    RETURNING user_id
  `;

  const userId = String(insertedRows[0]?.user_id ?? "");
  if (userId !== OWNER_ACCOUNT.id) {
    throw new Error("Canonical Owner bootstrap account could not be created.");
  }

  return { created: true, userId };
}
