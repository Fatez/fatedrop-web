import { getOwnerRole, type OwnerRoleSnapshot } from "@/lib/owner-access";

export type OperatorCapabilities = {
  canSendGlobalEcho: boolean;
};

export const NO_OPERATOR_CAPABILITIES: OperatorCapabilities = Object.freeze({
  canSendGlobalEcho: false,
});

export function operatorCapabilitiesFromOwnerRole(
  role: Pick<OwnerRoleSnapshot, "role"> | null | undefined,
): OperatorCapabilities {
  return { canSendGlobalEcho: role?.role === "owner" };
}

export async function getOperatorCapabilities(userId: string): Promise<OperatorCapabilities> {
  const cleanUserId = userId.trim();
  if (!cleanUserId) return NO_OPERATOR_CAPABILITIES;
  try {
    return operatorCapabilitiesFromOwnerRole(await getOwnerRole(cleanUserId));
  } catch {
    // Operator authority is server-owned and always fails closed. Mutable
    // profile fields such as email, username and FateDrop ID are deliberately
    // not inputs to this decision.
    return NO_OPERATOR_CAPABILITIES;
  }
}
