import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import type { AppDb } from "@/db/types";
import { voiceCalls } from "@/db/schema";
import { canCreateJobs, type PublicUser } from "@/lib/domain";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { extractLead } from "@/lib/voice";
import { createCustomer } from "@/lib/services/customers";
import { createJob } from "@/lib/services/jobs";

export const voiceInboundSchema = z.object({
  From: z.string().optional(),
  CallerName: z.string().optional(),
  TranscriptionText: z.string().min(1),
  RecordingUrl: z.string().optional(),
});

export async function listVoiceCalls(db: AppDb) {
  return db.select().from(voiceCalls).orderBy(desc(voiceCalls.createdAt));
}

export async function recordInboundCall(
  db: AppDb,
  input: z.infer<typeof voiceInboundSchema>,
) {
  const extracted = extractLead(input.TranscriptionText);
  const [created] = await db
    .insert(voiceCalls)
    .values({
      id: crypto.randomUUID(),
      fromPhone: input.From ?? extracted.phone,
      callerName: input.CallerName ?? extracted.name,
      transcript: input.TranscriptionText.trim(),
      recordingUrl: input.RecordingUrl ?? null,
      extracted,
      status: "new",
    })
    .returning();
  return created;
}

export async function convertCallToLead(db: AppDb, actor: PublicUser, callId: string) {
  if (!canCreateJobs(actor.role)) throw new ForbiddenError();
  const [call] = await db.select().from(voiceCalls).where(eq(voiceCalls.id, callId)).limit(1);
  if (!call) throw new NotFoundError("Call not found");
  if (call.jobId) {
    return { call, alreadyConverted: true as const };
  }
  const extracted = {
    ...extractLead(call.transcript),
    ...call.extracted,
  };
  const customer = await createCustomer(db, actor, {
    name: extracted.name || call.callerName || "Phone lead",
    phone: extracted.phone || call.fromPhone || "",
    address: extracted.address || "",
    notes: `AI voice lead. ${extracted.service ?? "Painting"}. ${extracted.timeline ?? ""}`.trim(),
  });
  const job = await createJob(db, actor, {
    title: extracted.service || "Painting estimate",
    description: call.transcript,
    customerId: customer.id,
    priority: extracted.urgency === "urgent" ? "urgent" : "medium",
    location: extracted.address || undefined,
    trade: extracted.service || "Painting",
  });
  const [updated] = await db
    .update(voiceCalls)
    .set({ status: "converted", jobId: job.id })
    .where(eq(voiceCalls.id, callId))
    .returning();
  return { call: updated, job, customer, alreadyConverted: false as const };
}
