import type { JobStatus } from "@/lib/domain";

export const SHIFT_LENGTH_MS = 8 * 60 * 60 * 1000;
export const OT_WARNING_MS = 60 * 60 * 1000;

export const CREW_LOCATION_STATUSES = ["on_site", "en_route", "staging"] as const;
export type CrewLocationStatus = (typeof CREW_LOCATION_STATUSES)[number];

export const CREW_LOCATION_LABELS: Record<CrewLocationStatus, string> = {
  on_site: "On site",
  en_route: "En route",
  staging: "Staging",
};

export type ShiftMeter = {
  clockedIn: boolean;
  elapsedMs: number;
  progress: number;
  overtimeWarning: boolean;
  overtime: boolean;
  remainingMs: number;
};

export type CrewTracking = {
  status: CrewLocationStatus;
  miles: number;
  minutes: number;
};

export function hashSeed(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function crewTracking(userId: string, jobId: string, jobStatus: JobStatus): CrewTracking {
  const n = hashSeed(`${userId}:${jobId}`);
  if (jobStatus === "in_progress" && n % 3 !== 0) {
    return {
      status: "on_site",
      miles: Number((0.04 + (n % 18) / 100).toFixed(2)),
      minutes: 1,
    };
  }
  if (jobStatus === "blocked") {
    return {
      status: "staging",
      miles: Number((0.2 + (n % 12) / 10).toFixed(1)),
      minutes: 2 + (n % 8),
    };
  }
  return {
    status: "en_route",
    miles: Number((0.7 + (n % 95) / 10).toFixed(1)),
    minutes: 4 + (n % 26),
  };
}

export function shiftMeter(startedAt: Date | string | null | undefined, now = new Date()): ShiftMeter {
  if (!startedAt) {
    return {
      clockedIn: false,
      elapsedMs: 0,
      progress: 0,
      overtimeWarning: false,
      overtime: false,
      remainingMs: SHIFT_LENGTH_MS,
    };
  }
  const start = startedAt instanceof Date ? startedAt : new Date(startedAt);
  const elapsedMs = Math.max(0, now.getTime() - start.getTime());
  const overtime = elapsedMs >= SHIFT_LENGTH_MS;
  const overtimeWarning = elapsedMs >= SHIFT_LENGTH_MS - OT_WARNING_MS;
  return {
    clockedIn: true,
    elapsedMs,
    progress: Math.min(elapsedMs / SHIFT_LENGTH_MS, 1),
    overtimeWarning,
    overtime,
    remainingMs: Math.max(0, SHIFT_LENGTH_MS - elapsedMs),
  };
}

export function formatElapsed(ms: number) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export function streetViewEmbedUrl(query: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&layer=c&cbp=12,0,0,0,0&output=embed`;
}

export function mapEmbedUrl(query: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

export function smsUrl(phone: string, body?: string) {
  const number = phone.replace(/[^\d+]/g, "");
  if (!number) return "";
  return body ? `sms:${number}?body=${encodeURIComponent(body)}` : `sms:${number}`;
}

export function broadcastSmsUrl(phones: string[], body?: string) {
  const numbers = phones.map((phone) => phone.replace(/[^\d+]/g, "")).filter(Boolean);
  if (numbers.length === 0) return "";
  if (numbers.length === 1) return smsUrl(numbers[0], body);
  const addresses = numbers.join(",");
  const suffix = body ? `&body=${encodeURIComponent(body)}` : "";
  return `sms:/open?addresses=${addresses}${suffix}`;
}

export function avatarUrl(name: string) {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=e8b84a&textColor=12141a`;
}
