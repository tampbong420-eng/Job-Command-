import { CREW, CALLS, ESTIMATES, EXPENSES, JOBS, MESSAGES, TIMECARDS } from "./demo-data";
import { inviteTokenFor, normalizeJobStatus } from "./field";
import type {
  CallLog,
  CrewMember,
  Estimate,
  Expense,
  Job,
  ShopMessage,
  TimeCard,
} from "./types";

export const SHOP_KEY = "job-command-shop-v1";
export const SHOP_VERSION = 2;

export type ShopSettings = {
  shopName: string;
  account: string;
  pageAlerts: boolean;
  companyPhone: string;
  headquarters: string;
  plan: "starter" | "pro" | "enterprise";
  lineArmed: boolean;
  greeting: string;
};

export type PersistedShop = {
  jobs: Job[];
  crew: CrewMember[];
  estimates: Estimate[];
  timeCards: TimeCard[];
  expenses: Expense[];
  calls: CallLog[];
  messages: ShopMessage[];
  employeeId: string;
  settings: ShopSettings;
  shopVersion?: number;
};

export const DEFAULT_SETTINGS: ShopSettings = {
  shopName: "Top Gun Painting",
  account: "ERIC12345",
  pageAlerts: true,
  companyPhone: "501-385-2100",
  headquarters: "Hot Springs, AR",
  plan: "pro",
  lineArmed: true,
  greeting:
    "Thanks for calling Top Gun Painting. Tell us the address and what you need painted.",
};

function hydrateJob(job: Job): Job {
  return {
    ...job,
    status: normalizeJobStatus(job.status),
    photos: job.photos ?? [],
    signature: job.signature ?? null,
    scope: job.scope ?? job.jobTitle,
  };
}

function hydrateMessage(row: ShopMessage): ShopMessage {
  return { ...row, seenBy: row.seenBy ?? [] };
}

function hydrateCrew(member: CrewMember): CrewMember {
  return {
    ...member,
    battery: member.battery ?? (member.status === "off" ? 64 : 81),
    speedMph: member.speedMph ?? (member.gpsLive ? 18 : 0),
    lastCheckIn: member.lastCheckIn ?? member.startedAt ?? null,
    inviteToken: inviteTokenFor(member),
  };
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
      signature: job.signature ?? seed?.signature ?? null,
    });
  });
  for (const row of fresh) {
    if (!seen.has(row.id)) next.push(hydrateJob(row));
  }
  return next;
}

export function upgradeShop(parsed: Partial<PersistedShop>): PersistedShop {
  const base = defaultShop();
  const settings = { ...DEFAULT_SETTINGS, ...parsed.settings };
  if (!parsed.settings?.shopName || parsed.settings.shopName === "Job Command") {
    settings.shopName = DEFAULT_SETTINGS.shopName;
  }
  return {
    ...base,
    ...parsed,
    shopVersion: SHOP_VERSION,
    jobs: mergeJobs(parsed.jobs ?? [], base.jobs),
    crew: (parsed.crew ?? base.crew).map(hydrateCrew),
    estimates: mergeById(parsed.estimates ?? [], base.estimates),
    timeCards: mergeById(parsed.timeCards ?? [], base.timeCards),
    expenses: mergeById(parsed.expenses ?? [], base.expenses),
    calls: mergeById(parsed.calls ?? [], base.calls),
    messages: mergeById(
      (parsed.messages ?? []).map(hydrateMessage),
      base.messages,
    ),
    employeeId: parsed.employeeId ?? base.employeeId,
    settings,
  };
}

export function defaultShop(): PersistedShop {
  return {
    jobs: JOBS.map(hydrateJob),
    crew: CREW.map(hydrateCrew),
    estimates: ESTIMATES,
    timeCards: TIMECARDS,
    expenses: EXPENSES,
    calls: CALLS,
    messages: MESSAGES.map(hydrateMessage),
    employeeId: CREW[0]?.id ?? "e-mike",
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
