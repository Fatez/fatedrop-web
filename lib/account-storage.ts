import type { NeonQueryFunction } from "@neondatabase/serverless";

export type MembershipTier = "free" | "plus" | "pro";
export type MembershipStatus = "free" | "trialing" | "active" | "past_due" | "paused" | "canceled";
export type ProfileTheme = "signal" | "cyan" | "violet" | "magenta";

export type AccountRecord = {
  id: string;
  fateId: string;
  email: string;
  passwordHash: string;
  displayName: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  primaryTcg: string | null;
  selectedTcgCodes?: string[];
  tcgOnboardingCompleted?: boolean;
  tcgAlertPreferences?: Record<string,unknown>;
  collectorStyle: string | null;
  region: string | null;
  profileTheme: ProfileTheme;
  createdAt: number;
  updatedAt: number;
};

export type MembershipRecord = {
  userId: string;
  tier: MembershipTier;
  status: MembershipStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  trialStartedAt: number | null;
  trialEndsAt: number | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  updatedAt: number;
};

export type DiscordLinkRecord = {
  userId: string;
  discordUserId: string;
  discordUsername: string;
  discordAvatar: string | null;
  connectedAt: number;
  roleSyncedAt: number | null;
};

export type AccountSnapshot = {
  account: AccountRecord;
  membership: MembershipRecord;
  discord: DiscordLinkRecord | null;
};

export class AccountStorageUnavailableError extends Error {
  constructor(message = "Account storage is not configured.") {
    super(message);
    this.name = "AccountStorageUnavailableError";
  }
}

export class AccountConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountConflictError";
  }
}

type SessionRecord = {
  tokenHash: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
};

type FileState = {
  version: 1;
  accounts: AccountRecord[];
  memberships: MembershipRecord[];
  sessions: SessionRecord[];
  discordLinks: DiscordLinkRecord[];
};

const emptyState = (): FileState => ({
  version: 1,
  accounts: [],
  memberships: [],
  sessions: [],
  discordLinks: [],
});

let fileQueue: Promise<unknown> = Promise.resolve();

function storageMode() {
  return process.env.FATEDROP_ACCOUNT_STORE ?? (process.env.NODE_ENV === "development" ? "file" : "disabled");
}

function defaultMembership(userId: string, now = Math.floor(Date.now() / 1000)): MembershipRecord {
  return {
    userId,
    tier: "free",
    status: "free",
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    trialStartedAt: null,
    trialEndsAt: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    updatedAt: now,
  };
}

export async function createAccount(account: AccountRecord) {
  const membership = defaultMembership(account.id, account.createdAt);
  const mode = storageMode();
  if (mode === "postgres") return createAccountPostgres(account, membership);
  if (mode === "file") {
    return withFileWrite(async (state) => {
      if (state.accounts.some((item) => item.email === account.email)) throw new AccountConflictError("An account already exists for that email address.");
      if (state.accounts.some((item) => item.username === account.username)) throw new AccountConflictError("That username is already in use.");
      if (state.accounts.some((item) => item.fateId === account.fateId)) throw new AccountConflictError("That FateDrop ID is already in use.");
      state.accounts.push(account);
      state.memberships.push(membership);
      return { account, membership, discord: null } satisfies AccountSnapshot;
    });
  }
  throwUnavailable();
}

export async function findAccountByEmail(email: string) {
  const mode = storageMode();
  if (mode === "postgres") return findAccountPostgres("email", email);
  if (mode === "file") {
    const state = await readFileState();
    return state.accounts.find((item) => item.email === email) ?? null;
  }
  throwUnavailable();
}

export async function findAccountByUsername(username: string) {
  const mode = storageMode();
  if (mode === "postgres") return findAccountPostgres("username", username);
  if (mode === "file") {
    const state = await readFileState();
    return state.accounts.find((item) => item.username === username) ?? null;
  }
  throwUnavailable();
}

export async function getAccountSnapshot(userId: string): Promise<AccountSnapshot | null> {
  const mode = storageMode();
  if (mode === "postgres") return getSnapshotPostgres(userId);
  if (mode === "file") {
    const state = await readFileState();
    const account = state.accounts.find((item) => item.id === userId);
    if (!account) return null;
    return {
      account,
      membership: state.memberships.find((item) => item.userId === userId) ?? defaultMembership(userId),
      discord: state.discordLinks.find((item) => item.userId === userId) ?? null,
    };
  }
  throwUnavailable();
}

export async function updateAccountProfile(userId: string, updates: Partial<Pick<AccountRecord, "displayName" | "username" | "bio" | "avatarUrl" | "primaryTcg" | "selectedTcgCodes" | "tcgOnboardingCompleted" | "tcgAlertPreferences" | "collectorStyle" | "region" | "profileTheme">>) {
  const mode = storageMode();
  if (mode === "postgres") return updateProfilePostgres(userId, updates);
  if (mode === "file") {
    return withFileWrite(async (state) => {
      const index = state.accounts.findIndex((item) => item.id === userId);
      if (index < 0) return null;
      const current = state.accounts[index];
      const username = updates.username ?? current.username;
      if (state.accounts.some((item) => item.id !== userId && item.username === username)) throw new AccountConflictError("That username is already in use.");
      const account = { ...current, ...updates, updatedAt: Math.floor(Date.now() / 1000) };
      state.accounts[index] = account;
      return account;
    });
  }
  throwUnavailable();
}

export async function createSession(tokenHash: string, userId: string, expiresAt: number) {
  const createdAt = Math.floor(Date.now() / 1000);
  const mode = storageMode();
  if (mode === "postgres") {
    const sql = await postgres();
    await sql`DELETE FROM fatedrop_sessions WHERE expires_at <= ${createdAt}`;
    await sql`INSERT INTO fatedrop_sessions (token_hash, user_id, created_at, expires_at) VALUES (${tokenHash}, ${userId}, ${createdAt}, ${expiresAt})`;
    return;
  }
  if (mode === "file") {
    await withFileWrite(async (state) => {
      state.sessions = state.sessions.filter((item) => item.expiresAt > createdAt && item.tokenHash !== tokenHash);
      state.sessions.push({ tokenHash, userId, createdAt, expiresAt });
    });
    return;
  }
  throwUnavailable();
}

export async function findSessionUser(tokenHash: string) {
  const now = Math.floor(Date.now() / 1000);
  const mode = storageMode();
  if (mode === "postgres") {
    const sql = await postgres();
    const rows = await sql`
      SELECT u.* FROM fatedrop_sessions s
      JOIN fatedrop_users u ON u.id = s.user_id
      WHERE s.token_hash = ${tokenHash} AND s.expires_at > ${now}
      LIMIT 1
    `;
    return rows[0] ? mapAccount(rows[0] as Record<string, unknown>) : null;
  }
  if (mode === "file") {
    const state = await readFileState();
    const session = state.sessions.find((item) => item.tokenHash === tokenHash && item.expiresAt > now);
    if (!session) return null;
    return state.accounts.find((item) => item.id === session.userId) ?? null;
  }
  throwUnavailable();
}

export async function deleteSession(tokenHash: string) {
  const mode = storageMode();
  if (mode === "postgres") {
    const sql = await postgres();
    await sql`DELETE FROM fatedrop_sessions WHERE token_hash = ${tokenHash}`;
    return;
  }
  if (mode === "file") {
    await withFileWrite(async (state) => {
      state.sessions = state.sessions.filter((item) => item.tokenHash !== tokenHash);
    });
    return;
  }
  throwUnavailable();
}

export async function updateMembership(userId: string, updates: Partial<Omit<MembershipRecord, "userId">>) {
  const mode = storageMode();
  if (mode === "postgres") return updateMembershipPostgres(userId, updates);
  if (mode === "file") {
    return withFileWrite(async (state) => {
      const index = state.memberships.findIndex((item) => item.userId === userId);
      const current = index >= 0 ? state.memberships[index] : defaultMembership(userId);
      const membership = { ...current, ...updates, userId, updatedAt: Math.floor(Date.now() / 1000) };
      if (index >= 0) state.memberships[index] = membership;
      else state.memberships.push(membership);
      return membership;
    });
  }
  throwUnavailable();
}

export async function findUserIdByStripeCustomer(stripeCustomerId: string) {
  const mode = storageMode();
  if (mode === "postgres") {
    const sql = await postgres();
    const rows = await sql`SELECT user_id FROM fatedrop_memberships WHERE stripe_customer_id = ${stripeCustomerId} LIMIT 1`;
    return rows[0]?.user_id ? String(rows[0].user_id) : null;
  }
  if (mode === "file") {
    const state = await readFileState();
    return state.memberships.find((item) => item.stripeCustomerId === stripeCustomerId)?.userId ?? null;
  }
  throwUnavailable();
}

export async function saveDiscordLink(link: DiscordLinkRecord) {
  const mode = storageMode();
  if (mode === "postgres") {
    const sql = await postgres();
    try {
      await sql`
        INSERT INTO fatedrop_discord_links (user_id, discord_user_id, discord_username, discord_avatar, connected_at, role_synced_at)
        VALUES (${link.userId}, ${link.discordUserId}, ${link.discordUsername}, ${link.discordAvatar}, ${link.connectedAt}, ${link.roleSyncedAt})
        ON CONFLICT (user_id) DO UPDATE SET
          discord_user_id = EXCLUDED.discord_user_id,
          discord_username = EXCLUDED.discord_username,
          discord_avatar = EXCLUDED.discord_avatar,
          connected_at = EXCLUDED.connected_at,
          role_synced_at = EXCLUDED.role_synced_at
      `;
      return link;
    } catch (error) {
      if (isPostgresDuplicate(error)) throw new AccountConflictError("That Discord account is already linked to another FateDrop ID.");
      throw error;
    }
  }
  if (mode === "file") {
    return withFileWrite(async (state) => {
      const duplicate = state.discordLinks.find((item) => item.discordUserId === link.discordUserId && item.userId !== link.userId);
      if (duplicate) throw new AccountConflictError("That Discord account is already linked to another FateDrop ID.");
      state.discordLinks = state.discordLinks.filter((item) => item.userId !== link.userId);
      state.discordLinks.push(link);
      return link;
    });
  }
  throwUnavailable();
}

export async function removeDiscordLink(userId: string) {
  const mode = storageMode();
  if (mode === "postgres") {
    const sql = await postgres();
    await sql`DELETE FROM fatedrop_discord_links WHERE user_id = ${userId}`;
    return;
  }
  if (mode === "file") {
    await withFileWrite(async (state) => {
      state.discordLinks = state.discordLinks.filter((item) => item.userId !== userId);
    });
    return;
  }
  throwUnavailable();
}

export async function updateDiscordRoleSync(userId: string, roleSyncedAt: number | null) {
  const mode = storageMode();
  if (mode === "postgres") {
    const sql = await postgres();
    await sql`UPDATE fatedrop_discord_links SET role_synced_at = ${roleSyncedAt} WHERE user_id = ${userId}`;
    return;
  }
  if (mode === "file") {
    await withFileWrite(async (state) => {
      const link = state.discordLinks.find((item) => item.userId === userId);
      if (link) link.roleSyncedAt = roleSyncedAt;
    });
    return;
  }
  throwUnavailable();
}

async function createAccountPostgres(account: AccountRecord, membership: MembershipRecord) {
  const sql = await postgres();
  try {
    await sql`
      WITH inserted_user AS (
        INSERT INTO fatedrop_users (
          id, fate_id, email, password_hash, display_name, username, bio, avatar_url,
          primary_tcg, selected_tcg_codes, tcg_onboarding_completed, tcg_alert_preferences, collector_style, region, profile_theme, created_at, updated_at
        ) VALUES (
          ${account.id}, ${account.fateId}, ${account.email}, ${account.passwordHash}, ${account.displayName},
          ${account.username}, ${account.bio}, ${account.avatarUrl}, ${account.primaryTcg}, ${JSON.stringify(account.selectedTcgCodes ?? ['pokemon'])}::jsonb, ${account.tcgOnboardingCompleted === true}, ${JSON.stringify(account.tcgAlertPreferences ?? {})}::jsonb, ${account.collectorStyle},
          ${account.region}, ${account.profileTheme}, ${account.createdAt}, ${account.updatedAt}
        )
        RETURNING id
      )
      INSERT INTO fatedrop_memberships (
        user_id, tier, status, stripe_customer_id, stripe_subscription_id, stripe_price_id,
        trial_started_at, trial_ends_at, current_period_end, cancel_at_period_end, updated_at
      )
      SELECT
        id, ${membership.tier}, ${membership.status}, ${membership.stripeCustomerId},
        ${membership.stripeSubscriptionId}, ${membership.stripePriceId}, ${membership.trialStartedAt},
        ${membership.trialEndsAt}, ${membership.currentPeriodEnd}, ${membership.cancelAtPeriodEnd}, ${membership.updatedAt}
      FROM inserted_user
    `;
    return { account, membership, discord: null } satisfies AccountSnapshot;
  } catch (error) {
    if (isPostgresDuplicate(error)) throw new AccountConflictError("That email address, username or FateDrop ID is already registered.");
    throw error;
  }
}

async function findAccountPostgres(field: "email" | "username", value: string) {
  const sql = await postgres();
  const rows = field === "email"
    ? await sql`SELECT * FROM fatedrop_users WHERE email = ${value} LIMIT 1`
    : await sql`SELECT * FROM fatedrop_users WHERE username = ${value} LIMIT 1`;
  return rows[0] ? mapAccount(rows[0] as Record<string, unknown>) : null;
}

async function getSnapshotPostgres(userId: string): Promise<AccountSnapshot | null> {
  const sql = await postgres();
  const users = await sql`SELECT * FROM fatedrop_users WHERE id = ${userId} LIMIT 1`;
  if (!users[0]) return null;
  const memberships = await sql`SELECT * FROM fatedrop_memberships WHERE user_id = ${userId} LIMIT 1`;
  const discordRows = await sql`SELECT * FROM fatedrop_discord_links WHERE user_id = ${userId} LIMIT 1`;
  return {
    account: mapAccount(users[0] as Record<string, unknown>),
    membership: memberships[0] ? mapMembership(memberships[0] as Record<string, unknown>) : defaultMembership(userId),
    discord: discordRows[0] ? mapDiscord(discordRows[0] as Record<string, unknown>) : null,
  };
}

async function updateProfilePostgres(userId: string, updates: Partial<Pick<AccountRecord, "displayName" | "username" | "bio" | "avatarUrl" | "primaryTcg" | "selectedTcgCodes" | "tcgOnboardingCompleted" | "tcgAlertPreferences" | "collectorStyle" | "region" | "profileTheme">>) {
  const snapshot = await getSnapshotPostgres(userId);
  if (!snapshot) return null;
  const account = { ...snapshot.account, ...updates, updatedAt: Math.floor(Date.now() / 1000) };
  const sql = await postgres();
  try {
    const rows = await sql`
      UPDATE fatedrop_users SET
        display_name = ${account.displayName}, username = ${account.username}, bio = ${account.bio},
        avatar_url = ${account.avatarUrl}, primary_tcg = ${account.primaryTcg},
        selected_tcg_codes = ${JSON.stringify(account.selectedTcgCodes ?? ['pokemon'])}::jsonb,
        tcg_onboarding_completed = ${account.tcgOnboardingCompleted === true}, tcg_alert_preferences = ${JSON.stringify(account.tcgAlertPreferences ?? {})}::jsonb, collector_style = ${account.collectorStyle},
        region = ${account.region}, profile_theme = ${account.profileTheme}, updated_at = ${account.updatedAt}
      WHERE id = ${userId}
      RETURNING *
    `;
    return rows[0] ? mapAccount(rows[0] as Record<string, unknown>) : null;
  } catch (error) {
    if (isPostgresDuplicate(error)) throw new AccountConflictError("That username is already in use.");
    throw error;
  }
}

async function updateMembershipPostgres(userId: string, updates: Partial<Omit<MembershipRecord, "userId">>) {
  const snapshot = await getSnapshotPostgres(userId);
  const current = snapshot?.membership ?? defaultMembership(userId);
  const membership = { ...current, ...updates, userId, updatedAt: Math.floor(Date.now() / 1000) };
  const sql = await postgres();
  const rows = await sql`
    INSERT INTO fatedrop_memberships (
      user_id, tier, status, stripe_customer_id, stripe_subscription_id, stripe_price_id,
      trial_started_at, trial_ends_at, current_period_end, cancel_at_period_end, updated_at
    ) VALUES (
      ${membership.userId}, ${membership.tier}, ${membership.status}, ${membership.stripeCustomerId},
      ${membership.stripeSubscriptionId}, ${membership.stripePriceId}, ${membership.trialStartedAt},
      ${membership.trialEndsAt}, ${membership.currentPeriodEnd}, ${membership.cancelAtPeriodEnd}, ${membership.updatedAt}
    )
    ON CONFLICT (user_id) DO UPDATE SET
      tier = EXCLUDED.tier, status = EXCLUDED.status, stripe_customer_id = EXCLUDED.stripe_customer_id,
      stripe_subscription_id = EXCLUDED.stripe_subscription_id, stripe_price_id = EXCLUDED.stripe_price_id,
      trial_started_at = EXCLUDED.trial_started_at, trial_ends_at = EXCLUDED.trial_ends_at,
      current_period_end = EXCLUDED.current_period_end, cancel_at_period_end = EXCLUDED.cancel_at_period_end,
      updated_at = EXCLUDED.updated_at
    RETURNING *
  `;
  if (!rows[0]) throw new AccountStorageUnavailableError("Membership record could not be written.");
  return mapMembership(rows[0] as Record<string, unknown>);
}

async function postgres(): Promise<NeonQueryFunction<false, false>> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new AccountStorageUnavailableError("DATABASE_URL is required for PostgreSQL account storage.");
  const { neon } = await import("@neondatabase/serverless");
  return neon(connectionString);
}

async function withFileWrite<T>(operation: (state: FileState) => Promise<T> | T): Promise<T> {
  const run = fileQueue.then(async () => {
    const state = await readFileState();
    const result = await operation(state);
    await writeFileState(state);
    return result;
  });
  fileQueue = run.catch(() => undefined);
  return run;
}

async function readFileState(): Promise<FileState> {
  const [{ readFile }, path] = await Promise.all([import("node:fs/promises"), import("node:path")]);
  const filePath = path.resolve(process.cwd(), process.env.FATEDROP_ACCOUNT_FILE ?? "data/accounts.json");
  try {
    const parsed = JSON.parse(await readFile(filePath, "utf8")) as Partial<FileState>;
    return {
      version: 1,
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
      memberships: Array.isArray(parsed.memberships) ? parsed.memberships : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      discordLinks: Array.isArray(parsed.discordLinks) ? parsed.discordLinks : [],
    };
  } catch (error) {
    if (isMissingFile(error)) return emptyState();
    throw error;
  }
}

async function writeFileState(state: FileState) {
  const [{ mkdir, writeFile, rename }, path] = await Promise.all([import("node:fs/promises"), import("node:path")]);
  const filePath = path.resolve(process.cwd(), process.env.FATEDROP_ACCOUNT_FILE ?? "data/accounts.json");
  const tempPath = `${filePath}.${process.pid}.tmp`;
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(tempPath, `${JSON.stringify(state, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  await rename(tempPath, filePath);
}

function throwUnavailable(): never {
  throw new AccountStorageUnavailableError("Set FATEDROP_ACCOUNT_STORE to file for local development or postgres for hosted account storage.");
}

function mapAccount(row: Record<string, unknown>): AccountRecord {
  return {
    id: String(row.id), fateId: String(row.fate_id), email: String(row.email), passwordHash: String(row.password_hash),
    displayName: String(row.display_name), username: String(row.username), bio: nullableString(row.bio), avatarUrl: nullableString(row.avatar_url),
    primaryTcg: nullableString(row.primary_tcg), selectedTcgCodes: Array.isArray(row.selected_tcg_codes) ? row.selected_tcg_codes.map(String) : ['pokemon'],
    tcgOnboardingCompleted: Boolean(row.tcg_onboarding_completed), collectorStyle: nullableString(row.collector_style), region: nullableString(row.region),
    tcgAlertPreferences: row.tcg_alert_preferences && typeof row.tcg_alert_preferences === 'object' && !Array.isArray(row.tcg_alert_preferences) ? row.tcg_alert_preferences as Record<string,unknown> : {},
    profileTheme: (String(row.profile_theme ?? "signal") as ProfileTheme), createdAt: Number(row.created_at), updatedAt: Number(row.updated_at),
  };
}

function mapMembership(row: Record<string, unknown>): MembershipRecord {
  return {
    userId: String(row.user_id), tier: String(row.tier) as MembershipTier, status: String(row.status) as MembershipStatus,
    stripeCustomerId: nullableString(row.stripe_customer_id), stripeSubscriptionId: nullableString(row.stripe_subscription_id),
    stripePriceId: nullableString(row.stripe_price_id), trialStartedAt: nullableNumber(row.trial_started_at), trialEndsAt: nullableNumber(row.trial_ends_at),
    currentPeriodEnd: nullableNumber(row.current_period_end), cancelAtPeriodEnd: Boolean(row.cancel_at_period_end), updatedAt: Number(row.updated_at),
  };
}

function mapDiscord(row: Record<string, unknown>): DiscordLinkRecord {
  return {
    userId: String(row.user_id), discordUserId: String(row.discord_user_id), discordUsername: String(row.discord_username),
    discordAvatar: nullableString(row.discord_avatar), connectedAt: Number(row.connected_at), roleSyncedAt: nullableNumber(row.role_synced_at),
  };
}

function nullableString(value: unknown) { return value === null || value === undefined ? null : String(value); }
function nullableNumber(value: unknown) { return value === null || value === undefined ? null : Number(value); }
function isMissingFile(error: unknown) { return Boolean(error && typeof error === "object" && "code" in error && error.code === "ENOENT"); }
function isPostgresDuplicate(error: unknown) { return Boolean(error && typeof error === "object" && "code" in error && error.code === "23505"); }
