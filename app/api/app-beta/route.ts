import { assertSameOrigin } from "@/lib/auth";
import {
  AppBetaStorageUnavailableError,
  DuplicateAppBetaLeadError,
  storeAppBetaLead,
  type AppBetaDevice,
} from "@/lib/app-beta-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AppBetaPayload = Record<string, unknown> & {
  contactName?: unknown;
  email?: unknown;
  deviceType?: unknown;
  contactConsent?: unknown;
  marketingConsent?: unknown;
  companyFax?: unknown;
};

const devices = new Set<AppBetaDevice>(["iphone", "ipad", "android", "other"]);

function clean(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > 8_000) return Response.json({ error: "This submission is larger than expected." }, { status: 413 });

    const payload = await request.json().catch(() => null) as AppBetaPayload | null;
    if (!payload) return Response.json({ error: "Invalid App beta submission." }, { status: 400 });
    if (clean(payload.companyFax, 120)) return Response.json({ error: "Submission rejected." }, { status: 400 });

    const contactName = clean(payload.contactName, 160);
    const email = clean(payload.email, 254).toLowerCase();
    const deviceType = clean(payload.deviceType, 20) as AppBetaDevice;
    const errors: Record<string, string> = {};

    if (!contactName) errors.contactName = "Enter your name.";
    if (!email || !validEmail(email)) errors.email = "Enter a valid email address.";
    if (!devices.has(deviceType)) errors.deviceType = "Choose the device you want to test FateDrop on.";
    if (payload.contactConsent !== true) errors.contactConsent = "Consent is required so FateDrop can send your beta invite.";

    if (Object.keys(errors).length) {
      return Response.json({ error: "Please check the highlighted fields.", fields: errors }, { status: 400 });
    }

    await storeAppBetaLead({
      id: crypto.randomUUID(),
      email,
      contactName,
      deviceType,
      contactConsent: true,
      marketingConsent: payload.marketingConsent === true,
      source: "app-beta-page",
      createdAt: Math.floor(Date.now() / 1000),
    });

    return Response.json({
      stored: true,
      message: "You’re on the FateDrop App Beta list. We’ll email your install invite separately when your place is ready.",
    }, { status: 201, headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    if (error instanceof Error && error.message === "CROSS_ORIGIN") return Response.json({ error: "Request rejected." }, { status: 403 });
    if (error instanceof DuplicateAppBetaLeadError) return Response.json({ error: error.message }, { status: 409 });
    if (error instanceof AppBetaStorageUnavailableError) {
      return Response.json({ error: "App beta signup is temporarily unavailable. Nothing has been saved." }, { status: 503 });
    }
    return Response.json({ error: "We could not store your App beta signup. Nothing has been saved—please try again." }, { status: 500 });
  }
}
