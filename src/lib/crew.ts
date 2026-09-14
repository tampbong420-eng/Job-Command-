import { portraitUrl } from "@/lib/avatars";
import type { JobStatus } from "@/lib/domain";

export const SHIFT_LENGTH_MS = 8 * 60 * 60 * 1000;
export const SHIFT_LATE_MS = 6 * 60 * 60 * 1000;
export const OT_WARNING_MS = 90 * 60 * 1000;

export const HOT_SPRINGS = { lat: 34.5037, lng: -93.0552, label: "Hot Springs, AR" };

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
  lateShift: boolean;
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
      lateShift: false,
      overtimeWarning: false,
      overtime: false,
      remainingMs: SHIFT_LENGTH_MS,
    };
  }
  const start = startedAt instanceof Date ? startedAt : new Date(startedAt);
  const elapsedMs = Math.max(0, now.getTime() - start.getTime());
  const overtime = elapsedMs >= SHIFT_LENGTH_MS;
  const overtimeWarning = elapsedMs >= SHIFT_LENGTH_MS - OT_WARNING_MS;
  const lateShift = elapsedMs >= SHIFT_LATE_MS && !overtimeWarning;
  return {
    clockedIn: true,
    elapsedMs,
    progress: Math.min(elapsedMs / SHIFT_LENGTH_MS, 1),
    lateShift,
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

export function mapEmbedUrl(query: string, satellite = false) {
  const layer = satellite ? "&t=k" : "";
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}${layer}&output=embed`;
}

export function regionMapUrl(satellite = false) {
  return mapEmbedUrl(HOT_SPRINGS.label, satellite);
}

export type FleetFix = {
  lat: number;
  lng: number;
  battery: number;
  speedMph: number;
};

export function simulatedFix(userId: string): FleetFix {
  const n = hashSeed(userId);
  return {
    lat: HOT_SPRINGS.lat + ((n % 80) - 40) / 1200,
    lng: HOT_SPRINGS.lng + ((n % 90) - 45) / 1000,
    battery: 48 + (n % 47),
    speedMph: n % 5 === 0 ? 0 : 8 + (n % 27),
  };
}

export function pinPercent(lat: number, lng: number) {
  const lat0 = 34.46;
  const lat1 = 34.55;
  const lng0 = -93.13;
  const lng1 = -92.97;
  const top = ((lat1 - lat) / (lat1 - lat0)) * 100;
  const left = ((lng - lng0) / (lng1 - lng0)) * 100;
  return {
    top: `${Math.min(92, Math.max(8, top))}%`,
    left: `${Math.min(92, Math.max(8, left))}%`,
  };
}

export const FLEET_FILTERS = ["all", "active", "idle", "off"] as const;
export type FleetFilter = (typeof FLEET_FILTERS)[number];

export function fleetFilterLabel(filter: FleetFilter) {
  if (filter === "active") return "Active";
  if (filter === "idle") return "Idle";
  if (filter === "off") return "Off-shift";
  return "All";
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

export function clockStateLabel(clockedIn: boolean) {
  return clockedIn ? "IN" : "OUT";
}

export function avatarUrl(name: string, userId?: string) {
  if (userId) {
    return portraitUrl(userId, name);
  }
  return `https://api.dicebear.com/9.x/adventurer/png?seed=${encodeURIComponent(name)}&size=160`;
}
