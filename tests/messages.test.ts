import { test } from "node:test";
import assert from "node:assert/strict";
import { hasUnreadMessage, markMessagesSeen } from "../lib/messages";
import { MESSAGES } from "../lib/demo-data";

test("unread pages skip the sender until the employee opens them", () => {
  assert.equal(hasUnreadMessage(MESSAGES, "e-mike"), false);
  assert.equal(hasUnreadMessage(MESSAGES, "e-dana"), true);
  const seen = markMessagesSeen(MESSAGES, "e-dana");
  assert.equal(hasUnreadMessage(seen, "e-dana"), false);
});
