import { AccountStorageUnavailableError } from "@/lib/account-storage";
import { requestAccountDeletion } from "@/lib/account-deletion";
import { getSnapshotForRequest } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "cache-control": "private, no-store, max-age=0" };

export async function POST(request: Request) {
  try {
    const snapshot = await getSnapshotForRequest(request, { allowPending: true });
    if (!snapshot) {
      return Response.json({ error: "Authentication required." }, { status: 401, headers: noStore });
    }

    const deletion = await requestAccountDeletion(snapshot.account.id, "mobile_app");
    return Response.json(
      {
        accepted: true,
        status: deletion.status,
        requestedAt: deletion.requestedAt,
      },
      { status: 202, headers: noStore },
    );
  } catch (error) {
    if (error instanceof AccountStorageUnavailableError) {
      return Response.json({ error: "Account storage is not configured yet." }, { status: 503, headers: noStore });
    }
    console.error("Mobile account deletion request failed", error);
    return Response.json({ error: "Account deletion request could not be recorded." }, { status: 500, headers: noStore });
  }
}
