import { fateDropPostgres } from "@/lib/postgres";

const TEMP_OWNER_EMAIL = "fatedropuk@gmail.com";
const TEMP_OWNER_BOOTSTRAP_ID = "2026-08-29-temporary-gmail-owner-bootstrap";
const TEMP_OWNER_OPERATOR = "bootstrap:temporary-gmail-owner";
const TEMP_OWNER_ACCOUNT = {
  id: "066c3c90-b6cb-4e4e-b9b4-2518a968f9d1",
  fateId: "FD-6B685993F8",
  email: TEMP_OWNER_EMAIL,
  passwordHash: "scrypt$YEpyL7HFGuZpyJv6ePJilw$L8eiZhvyxW3keexamNx9RqmWCJr-YpRb34jLq1JTi0DtdJXXfQsT0E2TRXsA9jirI8DIbr2qUERbhZ4wqYhakQ",
  displayName: "FateDrop Temporary Owner",
  username: "fatedrop-temp-owner-56ce18",
  primaryTcg: "Pokémon TCG",
  profileTheme: "signal",
} as const;

/**
 * One-shot operator bootstrap for the temporary Gmail Owner requested while the
 * canonical hello@fatedrop.co.uk mailbox is unavailable. This never replaces,
 * renames or revokes the canonical Owner. A ledger marker makes the operation
 * non-repeatable after the first verified grant so future deployments cannot
 * recreate or re-grant the temporary Owner.
 */
export async function ensureTemporaryOwnerBootstrap() {
  const sql = await fateDropPostgres();

  const ledgerRows = await sql`
    SELECT migration_id
    FROM fatedrop_schema_migrations
    WHERE migration_id=${TEMP_OWNER_BOOTSTRAP_ID}
    LIMIT 1
  `;
  if (ledgerRows[0]) {
    return { applied: false, alreadyApplied: true };
  }

  const canonicalOwnerRows = await sql`
    SELECT u.id
    FROM fatedrop_users u
    JOIN fatedrop_admin_roles r ON r.user_id=u.id AND r.role='owner'
    LEFT JOIN fatedrop_beta_access b ON b.user_id=u.id
    WHERE lower(u.email)='hello@fatedrop.co.uk' AND b.status='approved'
  `;
  if (canonicalOwnerRows.length !== 1) {
    throw new Error("Temporary Owner bootstrap requires the canonical FateDrop Owner to remain present and beta-approved.");
  }

  const existingRows = await sql`
    SELECT id
    FROM fatedrop_users
    WHERE lower(email)=${TEMP_OWNER_EMAIL}
  `;
  if (existingRows.length > 1) {
    throw new Error(`Temporary Owner bootstrap requires at most one ${TEMP_OWNER_EMAIL} FateDrop account.`);
  }

  let userId = existingRows[0] ? String(existingRows[0].id) : "";
  let created = false;

  if (!userId) {
    const now = Math.floor(Date.now() / 1000);
    const insertedRows = await sql`
      WITH inserted_user AS (
        INSERT INTO fatedrop_users (
          id, fate_id, email, password_hash, display_name, username, bio, avatar_url,
          primary_tcg, collector_style, region, profile_theme, created_at, updated_at
        ) VALUES (
          ${TEMP_OWNER_ACCOUNT.id}, ${TEMP_OWNER_ACCOUNT.fateId}, ${TEMP_OWNER_ACCOUNT.email}, ${TEMP_OWNER_ACCOUNT.passwordHash},
          ${TEMP_OWNER_ACCOUNT.displayName}, ${TEMP_OWNER_ACCOUNT.username}, ${null}, ${null}, ${TEMP_OWNER_ACCOUNT.primaryTcg},
          ${null}, ${null}, ${TEMP_OWNER_ACCOUNT.profileTheme}, ${now}, ${now}
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
    userId = String(insertedRows[0]?.user_id ?? "");
    if (userId !== TEMP_OWNER_ACCOUNT.id) {
      throw new Error("Temporary FateDrop Owner account could not be created.");
    }
    created = true;
  }

  const accessRows = await sql`
    SELECT r.role, b.status AS beta_status
    FROM fatedrop_users u
    LEFT JOIN fatedrop_admin_roles r ON r.user_id=u.id AND r.role='owner'
    LEFT JOIN fatedrop_beta_access b ON b.user_id=u.id
    WHERE u.id=${userId}
    LIMIT 1
  `;

  const alreadyOwner = String(accessRows[0]?.role ?? "") === "owner" && String(accessRows[0]?.beta_status ?? "") === "approved";
  if (!alreadyOwner) {
    await sql`SELECT * FROM fatedrop_grant_owner(${userId}, ${TEMP_OWNER_OPERATOR})`;
  }

  const verifiedRows = await sql`
    SELECT u.id, r.role, b.status AS beta_status
    FROM fatedrop_users u
    JOIN fatedrop_admin_roles r ON r.user_id=u.id AND r.role='owner'
    LEFT JOIN fatedrop_beta_access b ON b.user_id=u.id
    WHERE lower(u.email)=${TEMP_OWNER_EMAIL}
  `;
  if (verifiedRows.length !== 1 || String(verifiedRows[0].id) !== userId || String(verifiedRows[0].beta_status) !== "approved") {
    throw new Error("Temporary FateDrop Owner bootstrap verification failed.");
  }

  await sql`
    INSERT INTO fatedrop_schema_migrations (migration_id, applied_at)
    VALUES (${TEMP_OWNER_BOOTSTRAP_ID}, ${Math.floor(Date.now() / 1000)})
    ON CONFLICT (migration_id) DO NOTHING
  `;

  return { applied: true, alreadyApplied: false, created, userId };
}
