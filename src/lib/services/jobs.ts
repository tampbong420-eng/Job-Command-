import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { z } from "zod";
import type { AppDb } from "@/db/types";
import { customers, jobAssignments, jobEvents, jobNotes, jobs, timeEntries, users } from "@/db/schema";
import {
  JOB_PRIORITIES,
  JOB_STATUSES,
  STATUS_TRANSITIONS,
  canAssignJobs,
  canCreateJobs,
  canMutateJob,
  canViewAllJobs,
  type JobPriority,
  type JobStatus,
  type PublicUser,
} from "@/lib/domain";
import { AppError, ForbiddenError, NotFoundError } from "@/lib/errors";

export const jobCreateSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().max(4000).optional(),
  customerId: z.string().min(1),
  priority: z.enum(JOB_PRIORITIES).default("medium"),
  assignedToUserId: z.string().nullable().optional(),
  scheduledAt: z.string().nullable().optional(),
  location: z.string().max(200).optional(),
});

export const jobUpdateSchema = jobCreateSchema.partial().extend({
  status: z.enum(JOB_STATUSES).optional(),
});

export const noteSchema = z.object({
  body: z.string().min(1).max(2000),
});

export type JobListItem = {
  id: string;
  jobNumber: number;
  title: string;
  description: string | null;
  status: JobStatus;
  priority: JobPriority;
  customerId: string;
  customerName: string;
  customerPhone: string | null;
  customerAddress: string | null;
  assignedToUserId: string | null;
  assigneeName: string | null;
  scheduledAt: Date | null;
  completedAt: Date | null;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function mapJobRow(row: {
  job: typeof jobs.$inferSelect;
  customer: typeof customers.$inferSelect;
  assignee: typeof users.$inferSelect | null;
}): JobListItem {
  return {
    id: row.job.id,
    jobNumber: row.job.jobNumber,
    title: row.job.title,
    description: row.job.description,
    status: row.job.status,
    priority: row.job.priority,
    customerId: row.customer.id,
    customerName: row.customer.name,
    customerPhone: row.customer.phone,
    customerAddress: row.customer.address,
    assignedToUserId: row.job.assignedToUserId,
    assigneeName: row.assignee?.name ?? null,
    scheduledAt: row.job.scheduledAt,
    completedAt: row.job.completedAt,
    location: row.job.location,
    createdAt: row.job.createdAt,
    updatedAt: row.job.updatedAt,
  };
}

async function nextJobNumber(db: AppDb) {
  const [row] = await db
    .select({
      max: sql<number>`coalesce(max(${jobs.jobNumber}), 1000)`,
    })
    .from(jobs);
  return Number(row?.max ?? 1000) + 1;
}

export async function listJobs(
  db: AppDb,
  actor: PublicUser,
  filters?: { status?: JobStatus; query?: string },
) {
  const conditions = [];
  if (!canViewAllJobs(actor.role)) {
    const assigned = await db
      .select({ jobId: jobAssignments.jobId })
      .from(jobAssignments)
      .where(eq(jobAssignments.userId, actor.id));
    const assignedIds = assigned.map((row) => row.jobId);
    conditions.push(
      assignedIds.length
        ? or(eq(jobs.assignedToUserId, actor.id), inArray(jobs.id, assignedIds))
        : eq(jobs.assignedToUserId, actor.id),
    );
  }
  if (filters?.status) {
    conditions.push(eq(jobs.status, filters.status));
  }
  if (filters?.query) {
    const q = `%${filters.query}%`;
    conditions.push(
      or(
        ilike(jobs.title, q),
        ilike(customers.name, q),
        sql`cast(${jobs.jobNumber} as text) ilike ${q}`,
      ),
    );
  }

  const rows = await db
    .select({
      job: jobs,
      customer: customers,
      assignee: users,
    })
    .from(jobs)
    .innerJoin(customers, eq(jobs.customerId, customers.id))
    .leftJoin(users, eq(jobs.assignedToUserId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(jobs.updatedAt));

  return rows.map(mapJobRow);
}

export async function getJob(db: AppDb, actor: PublicUser, id: string) {
  const [row] = await db
    .select({
      job: jobs,
      customer: customers,
      assignee: users,
    })
    .from(jobs)
    .innerJoin(customers, eq(jobs.customerId, customers.id))
    .leftJoin(users, eq(jobs.assignedToUserId, users.id))
    .where(eq(jobs.id, id))
    .limit(1);
  if (!row) throw new NotFoundError("Job not found");
  if (!canViewAllJobs(actor.role) && row.job.assignedToUserId !== actor.id) {
    const [assignment] = await db
      .select({ id: jobAssignments.id })
      .from(jobAssignments)
      .where(and(eq(jobAssignments.jobId, id), eq(jobAssignments.userId, actor.id)))
      .limit(1);
    if (!assignment) throw new ForbiddenError();
  }
  const notes = await db
    .select({
      id: jobNotes.id,
      body: jobNotes.body,
      createdAt: jobNotes.createdAt,
      authorId: jobNotes.authorUserId,
      authorName: users.name,
    })
    .from(jobNotes)
    .leftJoin(users, eq(jobNotes.authorUserId, users.id))
    .where(eq(jobNotes.jobId, id))
    .orderBy(desc(jobNotes.createdAt));
  const events = await db
    .select()
    .from(jobEvents)
    .where(eq(jobEvents.jobId, id))
    .orderBy(desc(jobEvents.createdAt));
  return { ...mapJobRow(row), notes, events };
}

async function recordEvent(
  db: AppDb,
  jobId: string,
  actorId: string,
  type: (typeof jobEvents.$inferInsert)["type"],
  payload: Record<string, unknown> = {},
) {
  await db.insert(jobEvents).values({
    id: crypto.randomUUID(),
    jobId,
    actorUserId: actorId,
    type,
    payload,
  });
}

export async function createJob(
  db: AppDb,
  actor: PublicUser,
  input: z.infer<typeof jobCreateSchema>,
) {
  if (!canCreateJobs(actor.role)) throw new ForbiddenError();
  const assignedToUserId = input.assignedToUserId || null;
  const status: JobStatus = assignedToUserId ? "assigned" : "queued";
  const [created] = await db
    .insert(jobs)
    .values({
      id: crypto.randomUUID(),
      jobNumber: await nextJobNumber(db),
      title: input.title.trim(),
      description: input.description?.trim() || null,
      status,
      priority: input.priority,
      customerId: input.customerId,
      assignedToUserId,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      location: input.location?.trim() || null,
      createdByUserId: actor.id,
    })
    .returning();
  await recordEvent(db, created.id, actor.id, "created", {
    title: created.title,
    status,
  });
  if (assignedToUserId) {
    await recordEvent(db, created.id, actor.id, "assigned", { assignedToUserId });
    await ensureJobAssignment(db, created.id, assignedToUserId);
  }
  return getJob(db, actor, created.id);
}

export async function updateJob(
  db: AppDb,
  actor: PublicUser,
  id: string,
  input: z.infer<typeof jobUpdateSchema>,
) {
  const current = await getJob(db, actor, id);
  if (!canMutateJob(actor.role, current.assignedToUserId, actor.id)) {
    throw new ForbiddenError();
  }

  const nextAssignee =
    input.assignedToUserId === undefined
      ? current.assignedToUserId
      : input.assignedToUserId;
  let nextStatus = input.status ?? current.status;

  if (actor.role === "technician") {
    if (input.assignedToUserId !== undefined && input.assignedToUserId !== current.assignedToUserId) {
      throw new ForbiddenError("Technicians cannot reassign jobs");
    }
    if (input.customerId && input.customerId !== current.customerId) {
      throw new ForbiddenError("Technicians cannot change the customer");
    }
  }

  if (input.assignedToUserId !== undefined && !canAssignJobs(actor.role)) {
    throw new ForbiddenError();
  }

  if (nextAssignee && nextStatus === "queued") {
    nextStatus = "assigned";
  }
  if (!nextAssignee && nextStatus === "assigned") {
    nextStatus = "queued";
  }

  if (nextStatus !== current.status) {
    const allowed = STATUS_TRANSITIONS[current.status];
    if (!allowed.includes(nextStatus) && actor.role !== "admin") {
      throw new AppError(
        `Cannot move a ${current.status} job to ${nextStatus}`,
        422,
        "INVALID_TRANSITION",
      );
    }
  }

  const [updated] = await db
    .update(jobs)
    .set({
      title: input.title?.trim() ?? current.title,
      description:
        input.description === undefined
          ? current.description
          : input.description.trim() || null,
      priority: input.priority ?? current.priority,
      customerId: input.customerId ?? current.customerId,
      assignedToUserId: nextAssignee,
      status: nextStatus,
      scheduledAt:
        input.scheduledAt === undefined
          ? current.scheduledAt
          : input.scheduledAt
            ? new Date(input.scheduledAt)
            : null,
      location:
        input.location === undefined
          ? current.location
          : input.location.trim() || null,
      completedAt:
        nextStatus === "completed"
          ? (current.completedAt ?? new Date())
          : nextStatus === current.status
            ? current.completedAt
            : null,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, id))
    .returning();

  if (nextStatus !== current.status) {
    await recordEvent(db, id, actor.id, "status_changed", {
      from: current.status,
      to: nextStatus,
    });
  }
  if (nextAssignee !== current.assignedToUserId) {
    await recordEvent(db, id, actor.id, "assigned", {
      assignedToUserId: nextAssignee,
    });
    if (nextAssignee) {
      await ensureJobAssignment(db, id, nextAssignee);
    }
  }
  if (
    input.title ||
    input.description !== undefined ||
    input.priority ||
    input.location !== undefined ||
    input.scheduledAt !== undefined
  ) {
    await recordEvent(db, id, actor.id, "updated", { jobNumber: updated.jobNumber });
  }

  return getJob(db, actor, id);
}

export async function addJobNote(
  db: AppDb,
  actor: PublicUser,
  id: string,
  body: string,
) {
  const current = await getJob(db, actor, id);
  if (!canMutateJob(actor.role, current.assignedToUserId, actor.id) && actor.role !== "viewer") {
    throw new ForbiddenError();
  }
  if (actor.role === "viewer") throw new ForbiddenError();
  const [note] = await db
    .insert(jobNotes)
    .values({
      id: crypto.randomUUID(),
      jobId: id,
      authorUserId: actor.id,
      body: body.trim(),
    })
    .returning();
  await recordEvent(db, id, actor.id, "note_added", { noteId: note.id });
  await db
    .update(jobs)
    .set({ updatedAt: new Date() })
    .where(eq(jobs.id, id));
  return note;
}

export async function deleteJob(db: AppDb, actor: PublicUser, id: string) {
  if (actor.role !== "admin") throw new ForbiddenError();
  await getJob(db, actor, id);
  await db.delete(jobNotes).where(eq(jobNotes.jobId, id));
  await db.delete(jobEvents).where(eq(jobEvents.jobId, id));
  await db.delete(jobAssignments).where(eq(jobAssignments.jobId, id));
  await db.delete(timeEntries).where(eq(timeEntries.jobId, id));
  await db.delete(jobs).where(eq(jobs.id, id));
}

export async function ensureJobAssignment(db: AppDb, jobId: string, userId: string) {
  const [existing] = await db
    .select({ id: jobAssignments.id })
    .from(jobAssignments)
    .where(and(eq(jobAssignments.jobId, jobId), eq(jobAssignments.userId, userId)))
    .limit(1);
  if (existing) return existing.id;
  const [created] = await db
    .insert(jobAssignments)
    .values({
      id: crypto.randomUUID(),
      jobId,
      userId,
    })
    .returning();
  return created.id;
}
