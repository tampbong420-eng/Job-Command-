import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  SHOP_KEY,
  SHOP_VERSION,
  commitShop,
  defaultShop,
  getShopSnapshot,
  loadShop,
  resetShop,
  saveShop,
  parseShopBackup,
} from "../lib/session";

describe("shop session", { concurrency: false }, () => {
  test("loadShop returns null when window storage is missing", () => {
    const previous = (globalThis as { window?: unknown }).window;
    (globalThis as { window?: unknown }).window = undefined;
    assert.equal(loadShop(), null);
    (globalThis as { window?: unknown }).window = previous;
  });

  test("saveShop round-trips shop state", () => {
    const data = new Map<string, string>();
    (globalThis as { window: { localStorage: Pick<Storage, "getItem" | "setItem" | "removeItem"> } }).window = {
      localStorage: {
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => {
          data.set(key, value);
        },
        removeItem: (key: string) => {
          data.delete(key);
        },
      },
    };

    const shop = defaultShop();
    shop.settings.account = "FIELD99";
    shop.employeeId = "e-dana";
    saveShop(shop);
    assert.equal(data.has(SHOP_KEY), true);
    const loaded = loadShop();
    assert.equal(loaded?.settings.account, "FIELD99");
    assert.equal(loaded?.employeeId, "e-dana");
    assert.equal(loaded?.jobs.length, shop.jobs.length);
    commitShop({ ...shop, employeeId: "e-liv" });
    assert.equal(getShopSnapshot().employeeId, "e-liv");
    resetShop();
    assert.equal(loadShop(), null);
    assert.equal(getShopSnapshot().employeeId, defaultShop().employeeId);
  });

  test("old saved shops pick up packet fields without a reset", () => {
    const data = new Map<string, string>();
    (globalThis as { window: { localStorage: Pick<Storage, "getItem" | "setItem" | "removeItem"> } }).window = {
      localStorage: {
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => {
          data.set(key, value);
        },
        removeItem: (key: string) => {
          data.delete(key);
        },
      },
    };

    window.localStorage.setItem(
      SHOP_KEY,
      JSON.stringify({
        jobs: [
          {
            id: "c-vasquez",
            customerName: "Elena Vasquez",
            phone: "(206) 555-0147",
            address: "2418 9th Ave W, Seattle, WA 98119",
            jobTitle: "Exterior paint · Queen Anne",
            status: "in_progress",
            scheduledTime: "08:30 AM",
            worker: "Unassigned",
            workerId: null,
            priority: "high",
            lat: 47.639844278404,
            lng: -122.368877694281,
          },
        ],
        crew: defaultShop().crew.map(({ hourlyRate: _hourlyRate, ...row }) => row),
        estimates: [],
        timeCards: [],
        employeeId: "e-mike",
        settings: { shopName: "Job Command" },
      }),
    );

    const loaded = loadShop();
    assert.equal(loaded?.shopVersion, SHOP_VERSION);
    assert.equal(
      loaded?.jobs.find((job) => job.id === "c-vasquez")?.scope?.includes("fascia"),
      true,
    );
    assert.equal(loaded?.jobs.some((job) => job.id === "c-hale"), true);
    assert.equal(loaded?.estimates.some((row) => row.jobId === "c-hale"), true);
    assert.equal(loaded?.messages.some((row) => row.id === "msg-weather"), true);
    assert.equal(loaded?.crew.find((row) => row.id === "e-mike")?.hourlyRate, 48);
    const persisted = JSON.parse(data.get(SHOP_KEY) ?? "{}") as { shopVersion?: number };
    assert.equal(persisted.shopVersion, SHOP_VERSION);
  });

  test("parseShopBackup upgrades a copied shop JSON", () => {
    const raw = JSON.stringify(defaultShop());
    const parsed = parseShopBackup(raw);
    assert.equal(parsed?.shopVersion, SHOP_VERSION);
    assert.equal(parsed?.role, "boss");
    assert.ok((parsed?.crew.length ?? 0) > 0);
    assert.equal(parseShopBackup("not-json"), null);
    assert.equal(parseShopBackup("{}"), null);
  });
});
