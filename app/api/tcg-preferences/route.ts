import { updateAccountProfile } from "@/lib/account-storage";
import { assertSameOrigin, getSnapshotForRequest } from "@/lib/auth";
import { normalizeSelectedTcgCodes, normalizeTcgAlertPreferences, TCG_REGISTRY } from "@/lib/tcg-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function payload(snapshot:NonNullable<Awaited<ReturnType<typeof getSnapshotForRequest>>>) {
  const selectedTcgCodes=normalizeSelectedTcgCodes(snapshot.account.selectedTcgCodes);
  return {
    selectedTcgCodes,
    onboardingCompleted: snapshot.account.tcgOnboardingCompleted === true,
    alertPreferences: normalizeTcgAlertPreferences(snapshot.account.tcgAlertPreferences,selectedTcgCodes),
    availableTcgs: TCG_REGISTRY,
  };
}

export async function GET(request:Request) {
  const snapshot=await getSnapshotForRequest(request,{allowPending:true});
  if(!snapshot)return Response.json({error:"Authentication required."},{status:401});
  return Response.json({preferences:payload(snapshot)},{headers:{"cache-control":"private, no-store"}});
}

export async function PATCH(request:Request) {
  try {
    assertSameOrigin(request);
    const snapshot=await getSnapshotForRequest(request,{allowPending:true});
    if(!snapshot)return Response.json({error:"Authentication required."},{status:401});
    const body=await request.json().catch(()=>null) as Record<string,unknown>|null;
    if(!body||!Array.isArray(body.selectedTcgCodes))return Response.json({error:"Choose at least one supported TCG."},{status:400});
    const selectedTcgCodes=normalizeSelectedTcgCodes(body.selectedTcgCodes,[]);
    if(!selectedTcgCodes.length||selectedTcgCodes.length!==new Set(body.selectedTcgCodes).size)return Response.json({error:"One or more TCG selections are invalid."},{status:400});
    const alertPreferences=normalizeTcgAlertPreferences(body.alertPreferences ?? snapshot.account.tcgAlertPreferences,selectedTcgCodes);
    const updated=await updateAccountProfile(snapshot.account.id,{primaryTcg:selectedTcgCodes[0],selectedTcgCodes,tcgOnboardingCompleted:true,tcgAlertPreferences:alertPreferences});
    if(!updated)return Response.json({error:"Account could not be updated."},{status:404});
    return Response.json({preferences:{selectedTcgCodes,onboardingCompleted:true,alertPreferences,availableTcgs:TCG_REGISTRY}},{headers:{"cache-control":"private, no-store"}});
  } catch(error) {
    if(error instanceof Error&&error.message==="CROSS_ORIGIN")return Response.json({error:"Request rejected."},{status:403});
    return Response.json({error:"TCG preferences could not be saved."},{status:503});
  }
}
