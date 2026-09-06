import { Role } from "@prisma/client";

/**
 * Central adgangskontrol. ALT frontend-UI der skjuler knapper er kun kosmetisk —
 * den rigtige kontrol sker altid her og bliver tjekket igen i hver API-route,
 * så en bruger aldrig kan opnå admin-rettigheder ved at ændre noget i browseren.
 */

export function isSuperadmin(role?: Role) {
  return role === "SUPERADMIN";
}

export function isAdminOrAbove(role?: Role) {
  return role === "ADMIN" || role === "SUPERADMIN";
}

export function canManageMachines(role?: Role) {
  return isAdminOrAbove(role);
}

export function canManageInvitations(role?: Role) {
  return isAdminOrAbove(role);
}

export function canManageUsers(role?: Role, canManageUsersFlag?: boolean) {
  if (isSuperadmin(role)) return true;
  if (role === "ADMIN" && canManageUsersFlag) return true;
  return false;
}
