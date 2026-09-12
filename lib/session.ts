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
  };
}

export function loadShop(): PersistedShop | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SHOP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedShop>;
    if (!Array.isArray(parsed.jobs) || !Array.isArray(parsed.crew)) return null;
    const base = defaultShop();
    return {
      ...base,
      ...parsed,
      jobs: (parsed.jobs ?? base.jobs).map(hydrateJob),
      crew: (parsed.crew ?? base.crew).map(hydrateCrew),
      estimates: parsed.estimates ?? base.estimates,
      timeCards: parsed.timeCards ?? base.timeCards,
      expenses: parsed.expenses ?? base.expenses,
      calls: parsed.calls ?? base.calls,
      messages: (parsed.messages ?? base.messages).map(hydrateMessage),
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
    };
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
  cachedRaw = raw;
  cachedShop = loadShop() ?? SERVER_SHOP;
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
