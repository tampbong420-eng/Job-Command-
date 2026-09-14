import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import type { AppDb } from "@/db/types";
import { expenseReceipts } from "@/db/schema";
import { canViewAllJobs, type PublicUser } from "@/lib/domain";
import { ForbiddenError } from "@/lib/errors";
import { getJob } from "@/lib/services/jobs";

export const expenseCreateSchema = z.object({
  jobId: z.string().min(1),
  vendor: z.string().min(2).max(120),
  purchasedAt: z.string().optional(),
  totalCents: z.number().int().nonnegative(),
  taxCents: z.number().int().nonnegative().default(0),
  lineItems: z
    .array(z.object({ name: z.string(), amountCents: z.number().int() }))
    .default([]),
  imageUrl: z.string().max(400_000).optional(),
});

export async function listExpenses(db: AppDb, actor: PublicUser) {
  const rows = await db
    .select()
    .from(expenseReceipts)
    .orderBy(desc(expenseReceipts.createdAt));
  if (canViewAllJobs(actor.role)) return rows;
  const allowed: typeof rows = [];
  for (const row of rows) {
    try {
      const job = await getJob(db, actor, row.jobId);
      if (job) allowed.push(row);
    } catch {
      // hidden
    }
  }
  return allowed;
}

export async function createExpense(
  db: AppDb,
  actor: PublicUser,
  input: z.infer<typeof expenseCreateSchema>,
) {
  if (actor.role === "viewer") throw new ForbiddenError();
  await getJob(db, actor, input.jobId);
  const [created] = await db
    .insert(expenseReceipts)
    .values({
      id: crypto.randomUUID(),
      jobId: input.jobId,
      vendor: input.vendor.trim(),
      purchasedAt: input.purchasedAt ? new Date(input.purchasedAt) : new Date(),
      totalCents: input.totalCents,
      taxCents: input.taxCents,
      lineItems: input.lineItems,
      imageUrl: input.imageUrl || null,
      createdByUserId: actor.id,
    })
    .returning();
  return created;
}

export async function expensesForJob(db: AppDb, jobId: string) {
  return db
    .select()
    .from(expenseReceipts)
    .where(eq(expenseReceipts.jobId, jobId))
    .orderBy(desc(expenseReceipts.createdAt));
}
