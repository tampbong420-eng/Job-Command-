"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FieldActions } from "@/components/field-actions";
import { api } from "@/lib/api";
import { PIPELINE_COLUMNS, STATUS_LABELS, type JobStatus, type PublicUser } from "@/lib/domain";
import { nextActionLabel } from "@/lib/field";
import { formatCents } from "@/lib/format";
import type { DashboardData } from "@/lib/services/dashboard";
import type { JobListItem } from "@/lib/services/jobs";
import { tapHaptic } from "@/lib/haptic";
import { cn } from "@/lib/utils";

type DashboardPayload = {
  dashboard: DashboardData;
};

function jobsForStage(data: DashboardData, status: JobStatus): JobListItem[] {
  if (status === "in_progress") {
    return [...data.columns.blocked, ...data.columns.in_progress];
  }
  return data.columns[status] ?? [];
}

export function CommandBoard({
  initial,
  user,
}: {
  initial: DashboardData;
  user: PublicUser;
  embedded?: boolean;
}) {
  const router = useRouter();
  const [data, setData] = useState<DashboardData>(initial);
  const [live, setLive] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [stage, setStage] = useState<JobStatus>("in_progress");

  useEffect(() => {
    const timer = setInterval(() => {
      void api<DashboardPayload>("/api/dashboard")
        .then((payload) => {
          setData(payload.dashboard);
          setLive(true);
        })
        .catch((error: Error) => {
          setLive(false);
          toast.error(error.message);
        });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const jobs = useMemo(() => jobsForStage(data, stage), [data, stage]);

  async function advance(jobId: string, status: JobStatus, from: JobStatus) {
    setPendingId(jobId);
    try {
      await api(`/api/jobs/${jobId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      tapHaptic("success");
      toast.success(nextActionLabel(from) ?? `Now ${STATUS_LABELS[status].toLowerCase()}`);
      const payload = await api<DashboardPayload>("/api/dashboard");
      setData(payload.dashboard);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update job");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>Green button is the next step.</p>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em]">
          <span className={`size-2 rounded-full ${live ? "bg-boss" : "bg-muted-foreground"}`} />
          {live ? "Live" : "Standby"}
        </span>
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {PIPELINE_COLUMNS.map((column) => {
          const count = jobsForStage(data, column.status).length;
          const active = stage === column.status;
          return (
            <button
              key={column.status}
              type="button"
              onClick={() => setStage(column.status)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ring-1",
                active ? "bg-boss text-ink ring-boss" : "bg-card text-muted-foreground ring-border",
              )}
            >
              {column.title}
              <span className="ml-1 font-mono">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {jobs.map((job) => {
          const stuck = job.status === "blocked";
          return (
            <article
              key={job.id}
              className={cn(
                "rounded-2xl bg-card p-4 ring-1",
                stuck ? "ring-duty/50" : "ring-border",
              )}
            >
              <button type="button" onClick={() => router.push(`/jobs/${job.id}`)} className="w-full text-left">
                {stuck ? (
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-duty">Stuck</p>
                ) : null}
                <p className="text-[1.35rem] font-semibold leading-tight">{job.customerName}</p>
                <p className="mt-1 text-sm leading-snug text-foreground/90">{job.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {job.customerAddress || job.location || "No address"}
                </p>
                <p className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-semibold">{formatCents(job.contractCents)}</span>
                  <span className="text-muted-foreground">{job.assigneeName ?? "No crew yet"}</span>
                </p>
              </button>
              <div className="mt-3">
                <FieldActions
                  job={job}
                  user={user}
                  pending={pendingId === job.id}
                  onAdvance={(next) => void advance(job.id, next, job.status)}
                />
              </div>
            </article>
          );
        })}
        {jobs.length === 0 ? (
          <div className="rounded-2xl bg-card px-4 py-10 text-center ring-1 ring-border">
            <p className="font-medium">Nothing here</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Jobs in {STATUS_LABELS[stage].toLowerCase()} will show up on this list.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
