import type { JobPriority, JobStatus } from "@/lib/domain";

export type JobHealth = "green" | "yellow" | "red";

export function jobHealth(job: {
  status: JobStatus;
  priority: JobPriority;
  scheduledAt: Date | string | null;
}): JobHealth {
  if (job.status === "blocked" || job.status === "cancelled") return "red";
  if (job.scheduledAt) {
    const due = new Date(job.scheduledAt).getTime();
    if (
      Number.isFinite(due) &&
      due < Date.now() &&
      job.status !== "completed" &&
      job.status !== "in_progress"
    ) {
      return "red";
    }
  }
  if (job.status === "queued" || job.status === "estimate_sent") return "yellow";
  if (job.priority === "urgent") return "yellow";
  return "green";
}

export const HEALTH_LABELS: Record<JobHealth, string> = {
  green: "On track",
  yellow: "Needs a look",
  red: "At risk",
};
