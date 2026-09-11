import { and, eq, lte, ne, sql } from "drizzle-orm";
import type { AppDb } from "@/db/types";
import { jobs } from "@/db/schema";
import { canViewAllJobs, type JobStatus, type PublicUser } from "@/lib/domain";
import { listJobs, type JobListItem } from "@/lib/services/jobs";

export type DashboardData = {
  metrics: {
    open: number;
    queued: number;
    inProgress: number;
    blocked: number;
    completedToday: number;
    overdue: number;
  };
  columns: Record<JobStatus, JobListItem[]>;
  urgent: JobListItem[];
  generatedAt: string;
};

export async function getDashboard(db: AppDb, actor: PublicUser): Promise<DashboardData> {
  const visible = canViewAllJobs(actor.role)
    ? undefined
    : eq(jobs.assignedToUserId, actor.id);

  const [totals] = await db
    .select({
      open: sql<number>`count(*) filter (where ${jobs.status} not in ('completed', 'cancelled'))`,
      queued: sql<number>`count(*) filter (where ${jobs.status} = 'queued')`,
      inProgress: sql<number>`count(*) filter (where ${jobs.status} = 'in_progress')`,
      blocked: sql<number>`count(*) filter (where ${jobs.status} = 'blocked')`,
      completedToday: sql<number>`count(*) filter (where ${jobs.status} = 'completed' and ${jobs.completedAt} >= date_trunc('day', now()))`,
    })
    .from(jobs)
    .where(visible);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const overdue = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(
      and(
        visible,
        lte(jobs.scheduledAt, startOfDay),
        ne(jobs.status, "completed"),
        ne(jobs.status, "cancelled"),
      ),
    );

  const board = await listJobs(db, actor);
  const columns: Record<JobStatus, JobListItem[]> = {
    queued: [],
    assigned: [],
    in_progress: [],
    blocked: [],
    completed: [],
    cancelled: [],
  };
  for (const job of board) {
    columns[job.status].push(job);
  }

  const urgent = board.filter(
    (job) =>
      job.priority === "urgent" &&
      job.status !== "completed" &&
      job.status !== "cancelled",
  );

  return {
    metrics: {
      open: Number(totals?.open ?? 0),
      queued: Number(totals?.queued ?? 0),
      inProgress: Number(totals?.inProgress ?? 0),
      blocked: Number(totals?.blocked ?? 0),
      completedToday: Number(totals?.completedToday ?? 0),
      overdue: overdue.length,
    },
    columns,
    urgent,
    generatedAt: new Date().toISOString(),
  } satisfies DashboardData;
}
