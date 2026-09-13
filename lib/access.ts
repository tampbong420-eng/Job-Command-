import type { CrewMember, Role } from "./types";

export const ROLE_KEY = "job-command-role-v1";
export const FIELD_KEY = "job-command-field-v1";

export function fieldPin(member: Pick<CrewMember, "phone">): string {
  const digits = member.phone.replace(/\D/g, "");
  const pin = digits.slice(-4);
  return pin.length === 4 ? pin : "0000";
}

export function loadRole(): Role | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(ROLE_KEY);
  return raw === "employee" || raw === "boss" ? raw : null;
}

export function saveRole(role: Role) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROLE_KEY, role);
}

export function loadFieldLogin(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(FIELD_KEY);
}

export function saveFieldLogin(employeeId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FIELD_KEY, employeeId);
}

export function clearFieldLogin() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(FIELD_KEY);
}

export function verifyBossCode(account: string, input: string): boolean {
  const expected = account.replace(/\s+/g, "").toUpperCase();
  const got = input.replace(/\s+/g, "").toUpperCase();
  return expected.length > 0 && expected === got;
}
