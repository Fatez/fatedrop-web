import { getCurrentUser } from "@/lib/auth";
import { buildDiscordAuthorizeUrl, DiscordUnavailableError } from "@/lib/discord";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.redirect(new URL("/account/login?next=/account", request.url));
  try {
    const url = await buildDiscordAuthorizeUrl(new URL(request.url).origin);
    return Response.redirect(url);
  } catch (error) {
    if (error instanceof DiscordUnavailableError) return Response.redirect(new URL("/account?discord=setup", request.url));
    return Response.redirect(new URL("/account?discord=error", request.url));
  }
}
