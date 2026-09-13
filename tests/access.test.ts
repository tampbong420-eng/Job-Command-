import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fieldPin,
  saveRole,
  loadRole,
  saveFieldLogin,
  loadFieldLogin,
  clearFieldLogin,
  verifyBossCode,
  ROLE_KEY,
  FIELD_KEY,
} from "../lib/access";

function mockStorage() {
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
  return data;
}

test("fieldPin uses the last four digits of the shop phone", () => {
  assert.equal(fieldPin({ phone: "(206) 555-0130" }), "0130");
  assert.equal(fieldPin({ phone: "5550176" }), "0176");
});

test("boss code ignores spaces and case", () => {
  assert.equal(verifyBossCode("ERIC12345", "eric 12345"), true);
  assert.equal(verifyBossCode("ERIC12345", "wrong"), false);
});

test("role and field login persist on the phone", () => {
  const data = mockStorage();
  saveRole("employee");
  saveFieldLogin("e-dana");
  assert.equal(loadRole(), "employee");
  assert.equal(loadFieldLogin(), "e-dana");
  assert.equal(data.get(ROLE_KEY), "employee");
  assert.equal(data.get(FIELD_KEY), "e-dana");
  clearFieldLogin();
  assert.equal(loadFieldLogin(), null);
});
