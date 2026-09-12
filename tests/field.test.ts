import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { applyCommand, parseTalk } from "../lib/commands";
import { CREW, ESTIMATES, JOBS, TIMECARDS } from "../lib/demo-data";
import {
  crewByToken,
  hasUnreadMessage,
  jobFromCall,
  markMessagesSeen,
  normalizeJobStatus,
  parseReceiptAmount,
  quoteTotal,
  simulateInboundCall,
} from "../lib/field";
import type { ShopSnapshot } from "../lib/types";

const snapshot: ShopSnapshot = {
  jobs: JOBS,
  crew: CREW,
  estimates: ESTIMATES,
  timeCards: TIMECARDS,
  expenses: [],
  calls: [],
  messages: [],
  selectedJobId: "c-northline",
  selectedCrewId: "e-mike",
};

describe("field extras", () => {
  test("pending hydrates to scheduled", () => {
    assert.equal(normalizeJobStatus("pending"), "scheduled");
    assert.equal(normalizeJobStatus("dispatched"), "dispatched");
  });

  test("quote total applies markup and tax", () => {
    assert.equal(quoteTotal(2800, 1400), 5327.7);
  });

  test("receipt parser pulls a dollar amount", () => {
    assert.equal(parseReceiptAmount("Sherwin $187.44 paint"), 187.44);
  });

  test("invite tokens resolve crew", () => {
    assert.equal(crewByToken(CREW, "jc_mike_reyes")?.id, "e-mike");
  });

  test("inbound call converts to a lead", () => {
    const call = simulateInboundCall("2026-09-12T12:00:00.000Z");
    const job = jobFromCall(call);
    assert.equal(job.customerName, call.callerName);
    const filed = applyCommand(
      { ...snapshot, calls: [call] },
      { type: "convert_call", callId: call.id },
    );
    assert.equal(filed.state.jobs[0]?.customerName, call.callerName);
    assert.equal(filed.view, "jobs");
  });

  test("unread pages skip the sender until the employee opens them", () => {
    const unread = [
      {
        id: "msg-1",
        fromId: "e-mike",
        body: "Wrap exteriors",
        createdAt: "2026-09-11T13:05:00.000Z",
        broadcast: true,
        seenBy: ["e-mike"],
      },
    ];
    assert.equal(hasUnreadMessage(unread, "e-mike"), false);
    assert.equal(hasUnreadMessage(unread, "e-dana"), true);
    const seen = markMessagesSeen(unread, "e-dana");
    assert.equal(hasUnreadMessage(seen, "e-dana"), false);
  });

  test("talk files a materials receipt", () => {
    const talk = parseTalk("receipt $87 from Sherwin for Northline", snapshot);
    assert.equal(talk.commands[0]?.type, "create_expense");
    const filed = applyCommand(snapshot, talk.commands[0]);
    assert.equal(filed.state.expenses?.[0]?.amount, 87);
    assert.equal(filed.view, "receipts");
  });
});
