import { CREW, ESTIMATES, JOBS, MESSAGES, TIMECARDS } from "./demo-data";
import { syncJobRoutes } from "./assign";
import type { CrewMember, Estimate, Job, ShopMessage, TimeCard } from "./types";

export const SHOP_KEY = "job-command-shop-v1";
export const SHOP_VERSION = 3;

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
  messages: ShopMessage[];
  employeeId: string;
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
  return {
    ...base,
    ...parsed,
    shopVersion: SHOP_VERSION,
    jobs: syncJobRoutes(mergeJobs(parsed.jobs ?? [], base.jobs)),
    crew: parsed.crew ?? base.crew,
    estimates: mergeById(parsed.estimates ?? [], base.estimates),
    timeCards: mergeById(parsed.timeCards ?? [], base.timeCards),
    messages: mergeById(
      (parsed.messages ?? []).map(hydrateMessage),
      base.messages,
    ),
    employeeId: parsed.employeeId ?? base.employeeId,
    settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
  };
}

export function defaultShop(): PersistedShop {
  return {
    jobs: syncJobRoutes(JOBS.map(hydrateJob)),
    crew: CREW,
    estimates: ESTIMATES,
    timeCards: TIMECARDS,
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
