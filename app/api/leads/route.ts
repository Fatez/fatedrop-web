import {
  DuplicateLeadError,
  LeadStorageUnavailableError,
  storeLead,
  type LeadRecord,
} from "../../../lib/lead-storage";

export const runtime = "nodejs";

type Role = "collector" | "business" | "event";
type LeadPayload = Record<string, unknown> & {
  role?: unknown;
  email?: unknown;
  contactName?: unknown;
  contactConsent?: unknown;
  marketingConsent?: unknown;
  companyFax?: unknown;
};

const roles = new Set<Role>(["collector", "business", "event"]);
const platformOptions = new Set(["Shopify", "WooCommerce", "CSV", "Custom website", "Marketplace", "Other", "Unsure"]);
const catalogueOptions = new Set(["Product feed", "API", "CSV", "Sitemap", "Manual onboarding", "Unsure"]);
const businessTypes = new Set(["Physical shop", "Online-only", "Both"]);
const eventAttendance = new Set(["Yes", "No", "Sometimes"]);

const requiredByRole: Record<Role, string[]> = {
  collector: ["contactName", "email", "primaryTcg", "wantedFeature"],
  business: ["contactName", "businessName", "email", "website", "ecommercePlatform", "productCount", "businessType", "catalogueMethod", "attendsEvents"],
  event: ["contactName", "eventName", "email", "website", "eventLocation", "eventDate", "vendorCount", "ticketLink", "eventVendorMode"],
};

function clean(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function validUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function validate(payload: LeadPayload, role: Role) {
  const errors: Record<string, string> = {};
  for (const field of requiredByRole[role]) {
    const value = field === "eventVendorMode" ? payload[field] : clean(payload[field]);
    if (value === "" || value === undefined || value === null) errors[field] = "Please complete this field.";
  }

  const email = clean(payload.email, 254).toLowerCase();
  if (email && !validEmail(email)) errors.email = "Enter a valid email address.";
  if (!payload.contactConsent) errors.contactConsent = "Consent is required so FateDrop can reply to this enquiry.";

  if (role === "business") {
    if (!validUrl(clean(payload.website, 500))) errors.website = "Enter a complete website address, including https://";
    if (!platformOptions.has(clean(payload.ecommercePlatform, 60))) errors.ecommercePlatform = "Choose a listed ecommerce platform.";
    if (!catalogueOptions.has(clean(payload.catalogueMethod, 60))) errors.catalogueMethod = "Choose a listed catalogue method.";
    if (!businessTypes.has(clean(payload.businessType, 60))) errors.businessType = "Choose a listed business type.";
    if (!eventAttendance.has(clean(payload.attendsEvents, 20))) errors.attendsEvents = "Choose an event-attendance option.";
  }

  if (role === "event") {
    if (!validUrl(clean(payload.website, 500))) errors.website = "Enter a complete website or social address, including https://";
    if (!validUrl(clean(payload.ticketLink, 500))) errors.ticketLink = "Enter a complete ticket address, including https://";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(clean(payload.eventDate, 10))) errors.eventDate = "Choose a valid event date.";
    if (typeof payload.eventVendorMode !== "boolean") errors.eventVendorMode = "Choose whether Event Vendor Mode interests you.";
  }

  return { errors, email };
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > 24_000) return Response.json({ error: "This submission is larger than expected." }, { status: 413 });

    const requestOrigin = request.headers.get("origin");
    if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
      return Response.json({ error: "This submission must come from the FateDrop website." }, { status: 403 });
    }

    const payload = (await request.json()) as LeadPayload;
    const role = clean(payload.role, 20) as Role;
    if (!roles.has(role)) return Response.json({ error: "Choose a valid enquiry type." }, { status: 400 });

    if (clean(payload.companyFax, 120)) return Response.json({ error: "Submission rejected." }, { status: 400 });
    const { errors, email } = validate(payload, role);
    if (Object.keys(errors).length) {
      return Response.json({ error: "Please check the highlighted fields.", fields: errors }, { status: 400 });
    }

    const record: LeadRecord = {
      id: crypto.randomUUID(),
      role,
      email,
      contactName: clean(payload.contactName, 160),
      region: clean(payload.region, 120) || null,
      primaryTcg: clean(payload.primaryTcg, 120) || null,
      wantedFeature: clean(payload.wantedFeature, 200) || null,
      businessName: clean(payload.businessName, 200) || null,
      website: clean(payload.website, 500) || null,
      ecommercePlatform: clean(payload.ecommercePlatform, 60) || null,
      productCount: clean(payload.productCount, 80) || null,
      businessType: clean(payload.businessType, 60) || null,
      catalogueMethod: clean(payload.catalogueMethod, 60) || null,
      attendsEvents: clean(payload.attendsEvents, 20) || null,
      eventName: clean(payload.eventName, 220) || null,
      eventLocation: clean(payload.eventLocation, 220) || null,
      eventDate: clean(payload.eventDate, 10) || null,
      vendorCount: clean(payload.vendorCount, 80) || null,
      ticketLink: clean(payload.ticketLink, 500) || null,
      eventVendorMode: Boolean(payload.eventVendorMode),
      message: clean(payload.message, 2_000) || null,
      contactConsent: true,
      marketingConsent: Boolean(payload.marketingConsent),
      source: "website",
      createdAt: Math.floor(Date.now() / 1000),
    };

    await storeLead(record);

    return Response.json({ stored: true, message: "Your details have been securely stored for the FateDrop founding beta." }, { status: 201 });
  } catch (error) {
    if (error instanceof DuplicateLeadError) return Response.json({ error: error.message }, { status: 409 });
    if (error instanceof LeadStorageUnavailableError) {
      return Response.json({ error: "Lead storage is temporarily unavailable. Nothing has been saved." }, { status: 503 });
    }
    return Response.json({ error: "We could not store your details. Nothing has been saved—please try again." }, { status: 500 });
  }
}
