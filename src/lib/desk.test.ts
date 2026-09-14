import { describe, expect, it } from "vitest";
import { createDatabase } from "@/db";
import { DEMO_PASSWORD, PIPELINE_COLUMNS } from "@/lib/domain";
import { ingestFleetPing } from "@/lib/services/fleet";
import { convertCallToLead } from "@/lib/services/voice";
import { authenticateUser } from "@/lib/services/users";
import { demoScan, parseReceiptText } from "@/lib/receipts";
import { extractLead } from "@/lib/voice";
import { jobHealth } from "@/lib/pipeline";

async function freshDb() {
  return createDatabase({ inMemory: true, seedDemo: true });
}

describe("pipeline and desk modules", () => {
  it("exposes six kanban columns from lead to invoice", () => {
    expect(PIPELINE_COLUMNS.map((column) => column.title)).toEqual([
      "Lead Intake",
      "Estimate Sent",
      "Estimate Approved",
      "Scheduled",
      "In Progress",
      "Invoiced",
    ]);
  });

  it("flags blocked work red and fresh leads yellow", () => {
    expect(jobHealth({ status: "blocked", priority: "medium", scheduledAt: null })).toBe("red");
    expect(jobHealth({ status: "queued", priority: "medium", scheduledAt: null })).toBe("yellow");
    expect(jobHealth({ status: "in_progress", priority: "medium", scheduledAt: null })).toBe("green");
  });

  it("pulls a lead out of a spoken transcript", () => {
    const lead = extractLead(
      "Hi this is Pat Hamilton at 112 Lookout Point Ave. Call 501-555-0144, exterior paint this week.",
    );
    expect(lead.name).toBe("Pat Hamilton");
    expect(lead.phone).toContain("501");
    expect(lead.service).toMatch(/paint/i);
  });

  it("parses a Sherwin ticket and demo-scans a receipt", () => {
    const parsed = parseReceiptText("Sherwin-Williams\nTax 12.40\nTotal 214.87");
    expect(parsed.vendor).toBe("Sherwin-Williams");
    expect(parsed.totalCents).toBe(21487);
    expect(demoScan("sw").vendor).toMatch(/Sherwin|Home Depot/);
  });

  it("stores a GPS ping and converts a voice lead onto the board", async () => {
    const { db } = await freshDb();
    const admin = await authenticateUser(db, "admin@jobcommand.local", DEMO_PASSWORD);
    const ping = await ingestFleetPing(db, admin, { battery: 81 });
    expect(ping.ok).toBe(true);
    expect(ping.nextPingSec).toBe(15);
    expect(ping.battery).toBe(81);

    const converted = await convertCallToLead(db, admin, "call_central_storefront");
    expect(converted.alreadyConverted).toBe(false);
    expect(converted.job?.status).toBe("queued");
    expect(converted.job?.title).toMatch(/Cabinet|Painting/i);
  });
});
