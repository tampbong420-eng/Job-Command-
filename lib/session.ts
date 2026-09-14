import { CREW, ESTIMATES, JOB_CHATS, JOBS, MESSAGES, TIMECARDS } from "./demo-data";
import { syncJobRoutes } from "./assign";
import { defaultCostCode, hydrateTimeCard, refreshStaleShifts } from "./payroll";
import { weekdayHours } from "./schedule";
import type {
  CrewMember,
  Estimate,
  Job,
  JobChatMessage,
  PayAudit,
  Role,
  ShopMessage,
  TimeCard,
  Timesheet,
} from "./types";

export const SHOP_KEY = "job-command-shop-v1";
export const SHOP_VERSION = 7;

export type ShopSettings = {
  shopName: string;
  account: string;
  pageAlerts: boolean;
};

export type PersistedShop = {
  jobs: Job[];
  crew: CrewMember[];
  estimates: Estimate[];
  timeCards: TimeCard[];
  timesheets: Timesheet[];
  payAudits: PayAudit[];
  messages: ShopMessage[];
  jobChats: JobChatMessage[];
  employeeId: string;
  role: Role;
  settings: ShopSettings;
  shopVersion?: number;
};

export const DEFAULT_SETTINGS: ShopSettings = {
  shopName: "Job Command",
  account: "ERIC12345",
  pageAlerts: true,
};

function hydrateJob(job: Job): Job {
  return {
    ...job,
    photos: job.photos ?? [],
    scope: job.scope ?? job.jobTitle,
    routeOrder: job.routeOrder ?? null,
  };
}

function hydrateMessage(row: ShopMessage): ShopMessage {
  return { ...row, seenBy: row.seenBy ?? [] };
}

function hydrateCrew(member: CrewMember, seed?: CrewMember): CrewMember {
  return {
    ...seed,
    ...member,
    weeklySchedule:
      member.weeklySchedule?.length
        ? member.weeklySchedule
        : (seed?.weeklySchedule ?? weekdayHours("08:00", "17:00")),
    hourlyRate: member.hourlyRate ?? seed?.hourlyRate ?? 0,
    overtimeMultiplier: member.overtimeMultiplier ?? seed?.overtimeMultiplier ?? 1.5,
    payCadence: member.payCadence ?? seed?.payCadence ?? "weekly",
    unpaidBreakMinutes:
      member.unpaidBreakMinutes ?? seed?.unpaidBreakMinutes ?? 30,
    costCode: member.costCode || seed?.costCode || defaultCostCode(member.role || seed?.role || ""),
  };
}

function mergeCrew(saved: CrewMember[], fresh: CrewMember[]): CrewMember[] {
  const demo = new Map(fresh.map((row) => [row.id, row]));
  const seen = new Set<string>();
  const next = saved.map((row) => {
    seen.add(row.id);
    return hydrateCrew(row, demo.get(row.id));
  });
  for (const row of fresh) {
    if (!seen.has(row.id)) next.push(hydrateCrew(row));
  }
  return next;
}

function mergeById<T extends { id: string }>(saved: T[], fresh: T[]): T[] {
  const have = new Set(saved.map((row) => row.id));
  return [...saved, ...fresh.filter((row) => !have.has(row.id))];
}

function mergeJobs(saved: Job[], fresh: Job[]): Job[] {
  const demo = new Map(fresh.map((row) => [row.id, row]));
  const seen = new Set<string>();
  const next = saved.map((job) => {
    seen.add(job.id);
    const seed = demo.get(job.id);
    return hydrateJob({
      ...seed,
      ...job,
      photos: job.photos?.length ? job.photos : (seed?.photos ?? []),
      scope: job.scope || seed?.scope || job.jobTitle,
    });
  });
  for (const row of fresh) {
    if (!seen.has(row.id)) next.push(hydrateJob(row));
  }
  return next;
}

export function upgradeShop(parsed: Partial<PersistedShop>): PersistedShop {
  const base = defaultShop();
  const crew = mergeCrew(parsed.crew ?? [], base.crew);
  const timeCards = mergeById(
    (parsed.timeCards ?? []).map((row) => hydrateTimeCard(row)),
    base.timeCards,
  );
  const fresh = refreshStaleShifts(crew, timeCards);
  return {
    ...base,
    ...parsed,
    shopVersion: SHOP_VERSION,
    jobs: syncJobRoutes(mergeJobs(parsed.jobs ?? [], base.jobs)),
    crew: fresh.crew,
    estimates: mergeById(parsed.estimates ?? [], base.estimates),
    timeCards: fresh.timeCards,
    timesheets: mergeById(parsed.timesheets ?? [], base.timesheets),
    payAudits: mergeById(parsed.payAudits ?? [], base.payAudits),
    messages: mergeById(
      (parsed.messages ?? []).map(hydrateMessage),
      base.messages,
    ),
    jobChats: mergeById(parsed.jobChats ?? [], base.jobChats),
    employeeId: parsed.employeeId ?? base.employeeId,
    role: parsed.role === "employee" ? "employee" : "boss",
    settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
  };
}

export function parseShopBackup(raw: string): PersistedShop | null {
  try {
    const parsed = JSON.parse(raw) as Partial<PersistedShop>;
    if (!Array.isArray(parsed.jobs) || !Array.isArray(parsed.crew)) return null;
    return upgradeShop(parsed);
  } catch {
    return null;
  }
}

export function defaultShop(): PersistedShop {
  return {
    jobs: syncJobRoutes(JOBS.map(hydrateJob)),
    crew: CREW,
    estimates: ESTIMATES,
    timeCards: TIMECARDS.map((row) => hydrateTimeCard(row)),
    timesheets: [],
    payAudits: [],
    messages: MESSAGES.map(hydrateMessage),
    jobChats: JOB_CHATS,
    employeeId: CREW[0]?.id ?? "e-mike",
    role: "boss",
    settings: DEFAULT_SETTINGS,
    shopVersion: SHOP_VERSION,
  };
}

export function loadShop(): PersistedShop | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SHOP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedShop>;
    if (!Array.isArray(parsed.jobs) || !Array.isArray(parsed.crew)) return null;
    const shop = upgradeShop(parsed);
    if ((parsed.shopVersion ?? 0) < SHOP_VERSION) {
      saveShop(shop);
    }
    return shop;
  } catch {
    return null;
  }
}

export function saveShop(shop: PersistedShop) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SHOP_KEY, JSON.stringify(shop));
}

export function clearShop() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SHOP_KEY);
}

const SERVER_SHOP = defaultShop();
let cachedRaw: string | null = null;
let cachedShop: PersistedShop = SERVER_SHOP;
const listeners = new Set<() => void>();

export function subscribeShop(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getServerShopSnapshot(): PersistedShop {
  return SERVER_SHOP;
}

export function getShopSnapshot(): PersistedShop {
  if (typeof window === "undefined") return SERVER_SHOP;
  const raw = window.localStorage.getItem(SHOP_KEY);
  if (raw === cachedRaw) return cachedShop;
  cachedShop = loadShop() ?? SERVER_SHOP;
  cachedRaw = window.localStorage.getItem(SHOP_KEY);
  return cachedShop;
}

export function commitShop(shop: PersistedShop) {
  saveShop(shop);
  cachedRaw =
    typeof window === "undefined" ? null : window.localStorage.getItem(SHOP_KEY);
  cachedShop = shop;
  listeners.forEach((listener) => listener());
}

export function resetShop() {
  clearShop();
  cachedRaw = null;
  cachedShop = defaultShop();
  listeners.forEach((listener) => listener());
}
