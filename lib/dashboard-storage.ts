import type { NeonQueryFunction } from "@neondatabase/serverless";

export type DashboardActivityType = "signal_seen" | "wishlist_hit" | "store_tracked" | "market_saving";
export type SignalLifecycle = "whisper" | "manifested" | "vanished" | "echo";
export type SignalKind = SignalLifecycle | "price_change" | "launch_date_change" | "queue" | "security" | "drop_pulse";
export type SignalIntensity = "subtle" | "standard" | "major";

export type DashboardActivityEvent = {
  id: string;
  userId: string;
  sourceEventId: string | null;
  type: DashboardActivityType;
  signalState: SignalLifecycle | null;
  title: string | null;
  subtitle: string | null;
  retailer: string | null;
  storeId: string | null;
  amountPence: number | null;
  source: "website" | "app" | "cloud" | "import";
  occurredAt: number;
  recordedAt: number;
};

export type NetworkSignal = {
  id: string;
  state: SignalLifecycle;
  kind?: SignalKind;
  intensity?: SignalIntensity;
  confidence?: number | null;
  title: string;
  retailer: string | null;
  detail: string | null;
  deliveredPricePence: number | null;
  occurredAt: number;
};

export type NetworkEventListing = {
  id: string;
  name: string;
  venue: string | null;
  location: string | null;
  startsAt: number;
  ticketUrl: string | null;
  vendorCount: number | null;
};

export type NetworkMetricSnapshot = {
  id: string;
  sourceEventId: string;
  source: string;
  measuredAt: number;
  recordedAt: number;
  metrics: {
    whisper: number | null;
    manifested: number | null;
    vanished: number | null;
    echo: number | null;
    changes24h: number | null;
    productsTracked: number | null;
    inStock: number | null;
    catalogueRetailers: number | null;
    healthyMonitors: number | null;
    [metricName: string]: number | null;
  };
  recentSignals: NetworkSignal[];
  upcomingEvents: NetworkEventListing[];
};

export type BillingAuditRecord = {
  eventId: string;
  eventType: string;
  userId: string | null;
  customerId: string | null;
  subscriptionId: string | null;
  stripeCreatedAt: number | null;
  processedAt: number;
};

type FileState = {
  version: 1;
  activity: DashboardActivityEvent[];
  networkSnapshots: NetworkMetricSnapshot[];
  billingAudit: BillingAuditRecord[];
};

const emptyState = (): FileState => ({ version: 1, activity: [], networkSnapshots: [], billingAudit: [] });
let fileQueue: Promise<unknown> = Promise.resolve();

function storageMode() {
  return process.env.FATEDROP_METRIC_STORE ?? process.env.FATEDROP_ACCOUNT_STORE ?? (process.env.NODE_ENV === "development" ? "file" : "disabled");
}

export async function recordDashboardActivity(event: DashboardActivityEvent) {
  const mode = storageMode();
  if (mode === "postgres") {
    const sql = await postgres();
    const rows = await sql`
      INSERT INTO fatedrop_activity_events (
        id, user_id, source_event_id, event_type, signal_state, title, subtitle, retailer,
        store_id, amount_pence, source, occurred_at, recorded_at
      ) VALUES (
        ${event.id}, ${event.userId}, ${event.sourceEventId}, ${event.type}, ${event.signalState}, ${event.title},
        ${event.subtitle}, ${event.retailer}, ${event.storeId}, ${event.amountPence}, ${event.source}, ${event.occurredAt}, ${event.recordedAt}
      )
      ON CONFLICT DO NOTHING
      RETURNING id
    `;
    return Boolean(rows[0]);
  }
  if (mode === "file") {
    return withFileWrite((state) => {
      if (state.activity.some((item) => item.id === event.id || (event.sourceEventId && item.sourceEventId === event.sourceEventId))) return false;
      state.activity.push(event);
      state.activity = state.activity.slice(-5000);
      return true;
    });
  }
  return false;
}

export async function listDashboardActivity(userId: string, limit = 500) {
  const safeLimit = Math.min(Math.max(limit, 1), 1000);
  const mode = storageMode();
  if (mode === "postgres") {
    const sql = await postgres();
    const rows = await sql`
      SELECT * FROM fatedrop_activity_events
      WHERE user_id = ${userId}
      ORDER BY occurred_at DESC
      LIMIT ${safeLimit}
    `;
    return rows.map((row) => mapActivity(row as Record<string, unknown>));
  }
  if (mode === "file") {
    const state = await readFileState();
    return state.activity.filter((item) => item.userId === userId).sort((a, b) => b.occurredAt - a.occurredAt).slice(0, safeLimit);
  }
  return [];
}

export async function saveNetworkMetricSnapshot(snapshot: NetworkMetricSnapshot) {
  const mode = storageMode();
  if (mode === "postgres") {
    const sql = await postgres();
    const rows = await sql`
      INSERT INTO fatedrop_network_snapshots (
        id, source_event_id, source, measured_at, recorded_at, metrics_json, recent_signals_json, upcoming_events_json
      ) VALUES (
        ${snapshot.id}, ${snapshot.sourceEventId}, ${snapshot.source}, ${snapshot.measuredAt}, ${snapshot.recordedAt},
        ${JSON.stringify(snapshot.metrics)}::jsonb, ${JSON.stringify(snapshot.recentSignals)}::jsonb, ${JSON.stringify(snapshot.upcomingEvents)}::jsonb
      )
      ON CONFLICT (source_event_id) DO NOTHING
      RETURNING id
    `;
    return Boolean(rows[0]);
  }
  if (mode === "file") {
    return withFileWrite((state) => {
      if (state.networkSnapshots.some((item) => item.sourceEventId === snapshot.sourceEventId)) return false;
      state.networkSnapshots.push(snapshot);
      state.networkSnapshots = state.networkSnapshots.sort((a, b) => a.measuredAt - b.measuredAt).slice(-1500);
      return true;
    });
  }
  return false;
}

export async function getLatestNetworkMetricSnapshot() {
  const mode = storageMode();
  if (mode === "postgres") {
    const sql = await postgres();
    const rows = await sql`SELECT * FROM fatedrop_network_snapshots ORDER BY measured_at DESC LIMIT 1`;
    return rows[0] ? mapNetworkSnapshot(rows[0] as Record<string, unknown>) : null;
  }
  if (mode === "file") {
    const state = await readFileState();
    return state.networkSnapshots.reduce<NetworkMetricSnapshot | null>((latest, item) => !latest || item.measuredAt > latest.measuredAt ? item : latest, null);
  }
  return null;
}

export async function listNetworkMetricSnapshots(limit = 30) {
  const safeLimit = Math.min(Math.max(limit, 1), 180);
  const mode = storageMode();
  if (mode === "postgres") {
    const sql = await postgres();
    const rows = await sql`SELECT * FROM fatedrop_network_snapshots ORDER BY measured_at DESC LIMIT ${safeLimit}`;
    return rows.map((row) => mapNetworkSnapshot(row as Record<string, unknown>));
  }
  if (mode === "file") {
    const state = await readFileState();
    return [...state.networkSnapshots].sort((a, b) => b.measuredAt - a.measuredAt).slice(0, safeLimit);
  }
  return [];
}

export async function hasProcessedBillingEvent(eventId: string) {
  const mode = storageMode();
  if (mode === "postgres") {
    const sql = await postgres();
    const rows = await sql`SELECT event_id FROM fatedrop_billing_events WHERE event_id = ${eventId} LIMIT 1`;
    return Boolean(rows[0]);
  }
  if (mode === "file") {
    const state = await readFileState();
    return state.billingAudit.some((item) => item.eventId === eventId);
  }
  return false;
}

export async function recordBillingAudit(record: BillingAuditRecord) {
  const mode = storageMode();
  if (mode === "postgres") {
    const sql = await postgres();
    const rows = await sql`
      INSERT INTO fatedrop_billing_events (
        event_id, event_type, user_id, customer_id, subscription_id, stripe_created_at, processed_at
      ) VALUES (
        ${record.eventId}, ${record.eventType}, ${record.userId}, ${record.customerId}, ${record.subscriptionId}, ${record.stripeCreatedAt}, ${record.processedAt}
      )
      ON CONFLICT (event_id) DO NOTHING
      RETURNING event_id
    `;
    return Boolean(rows[0]);
  }
  if (mode === "file") {
    return withFileWrite((state) => {
      if (state.billingAudit.some((item) => item.eventId === record.eventId)) return false;
      state.billingAudit.push(record);
      state.billingAudit = state.billingAudit.slice(-3000);
      return true;
    });
  }
  return false;
}

async function postgres(): Promise<NeonQueryFunction<false, false>> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required for PostgreSQL metric storage.");
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
  const filePath = path.resolve(process.cwd(), process.env.FATEDROP_METRIC_FILE ?? "data/dashboard-metrics.json");
  try {
    const parsed = JSON.parse(await readFile(filePath, "utf8")) as Partial<FileState>;
    return {
      version: 1,
      activity: Array.isArray(parsed.activity) ? parsed.activity : [],
      networkSnapshots: Array.isArray(parsed.networkSnapshots) ? parsed.networkSnapshots : [],
      billingAudit: Array.isArray(parsed.billingAudit) ? parsed.billingAudit : [],
    };
  } catch (error) {
    if (isMissingFile(error)) return emptyState();
    throw error;
  }
}

async function writeFileState(state: FileState) {
  const [{ mkdir, writeFile, rename }, path] = await Promise.all([import("node:fs/promises"), import("node:path")]);
  const filePath = path.resolve(process.cwd(), process.env.FATEDROP_METRIC_FILE ?? "data/dashboard-metrics.json");
  const tempPath = `${filePath}.${process.pid}.tmp`;
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(tempPath, `${JSON.stringify(state, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  await rename(tempPath, filePath);
}

function mapActivity(row: Record<string, unknown>): DashboardActivityEvent {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    sourceEventId: nullableString(row.source_event_id),
    type: String(row.event_type) as DashboardActivityType,
    signalState: nullableString(row.signal_state) as SignalLifecycle | null,
    title: nullableString(row.title),
    subtitle: nullableString(row.subtitle),
    retailer: nullableString(row.retailer),
    storeId: nullableString(row.store_id),
    amountPence: nullableNumber(row.amount_pence),
    source: String(row.source) as DashboardActivityEvent["source"],
    occurredAt: Number(row.occurred_at),
    recordedAt: Number(row.recorded_at),
  };
}

function mapNetworkSnapshot(row: Record<string, unknown>): NetworkMetricSnapshot {
  return {
    id: String(row.id),
    sourceEventId: String(row.source_event_id),
    source: String(row.source),
    measuredAt: Number(row.measured_at),
    recordedAt: Number(row.recorded_at),
    metrics: parseJson(row.metrics_json, {}) as NetworkMetricSnapshot["metrics"],
    recentSignals: parseJson(row.recent_signals_json, []) as NetworkSignal[],
    upcomingEvents: parseJson(row.upcoming_events_json, []) as NetworkEventListing[],
  };
}

function parseJson(value: unknown, fallback: unknown) {
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return fallback; }
  }
  return value ?? fallback;
}

function nullableString(value: unknown) { return value === null || value === undefined ? null : String(value); }
function nullableNumber(value: unknown) { return value === null || value === undefined ? null : Number(value); }
function isMissingFile(error: unknown) { return Boolean(error && typeof error === "object" && "code" in error && error.code === "ENOENT"); }
