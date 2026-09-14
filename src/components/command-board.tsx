"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FieldActions } from "@/components/field-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { api } from "@/lib/api";
import { PIPELINE_COLUMNS, STATUS_LABELS, type JobStatus, type PublicUser } from "@/lib/domain";
import { formatCents, formatJobNumber } from "@/lib/format";
import { HEALTH_LABELS, jobHealth } from "@/lib/pipeline";
import type { DashboardData } from "@/lib/services/dashboard";
import type { JobListItem } from "@/lib/services/jobs";
import { tapHaptic } from "@/lib/haptic";
import { cn } from "@/lib/utils";
import { getWorkspaceBrand } from "@/lib/brand";

type DashboardPayload = {
  dashboard: DashboardData;
};

function jobsForColumn(data: DashboardData, status: JobStatus): JobListItem[] {
  if (status === "in_progress") {
    return [...data.columns.in_progress, ...data.columns.blocked];
  }
  return data.columns[status] ?? [];
}

export function CommandBoard({
  initial,
  user,
  embedded = false,
}: {
  initial: DashboardData;
  user: PublicUser;
  embedded?: boolean;
}) {
  const router = useRouter();
  const brand = getWorkspaceBrand();
  const [data, setData] = useState<DashboardData>(initial);
  const [live, setLive] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

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

  const metrics = useMemo(
    () => [
      { label: "Open", value: data.metrics.open },
      { label: "On job", value: data.metrics.inProgress },
      { label: "Blocked", value: data.metrics.blocked },
      { label: "Overdue", value: data.metrics.overdue },
      { label: "Invoiced today", value: data.metrics.completedToday },
    ],
    [data],
  );

  async function advance(jobId: string, status: JobStatus) {
    setPendingId(jobId);
    try {
      await api(`/api/jobs/${jobId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      tapHaptic("success");
      toast.success(`Moved to ${STATUS_LABELS[status]}`);
      const payload = await api<DashboardPayload>("/api/dashboard");
      setData(payload.dashboard);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update job");
    } finally {
      setPendingId(null);
      setDragging(null);
    }
  }

  return (
    <div className="space-y-5">
      {embedded ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <p>Drag a card, or tap the next stage.</p>
          <span className="flex items-center gap-1.5 font-mono uppercase tracking-[0.16em]">
            <span className={`size-2 rounded-full ${live ? "bg-boss" : "bg-muted-foreground"}`} />
            {live ? "Live" : "Standby"}
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
              {user.role === "technician" ? `Your shift, ${user.name.split(" ")[0]}` : "Today on the desk"}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`size-2 rounded-full ${live ? "bg-boss" : "bg-muted-foreground"}`} />
            {live ? "Live" : "Connecting"}
          </span>
        </div>
      )}

      <div className="grid grid-cols-5 gap-2">
        {metrics.map((metric) => (
          <Card key={metric.label} size="sm" className="px-0">
            <CardHeader className="px-2 pb-1">
              <CardTitle className="text-[10px] font-medium text-muted-foreground">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent className="px-2">
              <p className="font-mono text-xl font-semibold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
        {PIPELINE_COLUMNS.map((column) => {
          const jobs = jobsForColumn(data, column.status);
          return (
            <section
              key={column.status}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const jobId = event.dataTransfer.getData("text/job-id");
                if (jobId) void advance(jobId, column.status);
              }}
              className={cn(
                "min-h-[22rem] w-[min(84vw,19.5rem)] shrink-0 snap-start rounded-xl bg-card/70 p-3 ring-1 ring-foreground/10",
                dragging ? "ring-boss/40" : "",
              )}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold leading-tight">{column.title}</h2>
                <span className="font-mono text-xs text-muted-foreground">{jobs.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {jobs.map((job) => {
                  const health = jobHealth(job);
                  return (
                    <article
                      key={job.id}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData("text/job-id", job.id);
                        setDragging(job.id);
                      }}
                      onDragEnd={() => setDragging(null)}
                      className={cn(
                        "rounded-lg bg-background/90 p-3 text-left ring-1 ring-foreground/10",
                        dragging === job.id && "opacity-60",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => router.push(`/jobs/${job.id}`)}
                        className="w-full text-left"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {formatJobNumber(job.jobNumber)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "size-2 rounded-full",
                                health === "green" && "bg-boss",
                                health === "yellow" && "bg-pending",
                                health === "red" && "bg-duty",
                              )}
                              title={HEALTH_LABELS[health]}
                            />
                            <PriorityBadge priority={job.priority} />
                          </span>
                        </div>
                        <p className="text-[15px] font-semibold leading-snug">{job.customerName}</p>
                        <p className="mt-1 inline-flex rounded-full bg-boss/15 px-2 py-0.5 text-[10px] font-medium text-boss">
                          {job.trade || brand.companyName}
                        </p>
                        <p className="mt-2 text-xs leading-snug text-muted-foreground">
                          {job.customerAddress || job.location || "No address"}
                        </p>
                        <p className="mt-2 flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground">{formatCents(job.contractCents)}</span>
                          <span className="text-muted-foreground">{job.assigneeName ?? "No crew"}</span>
                        </p>
                      </button>
                      <div className="mt-3">
                        <FieldActions
                          compact
                          job={job}
                          user={user}
                          pending={pendingId === job.id}
                          onAdvance={(next) => void advance(job.id, next)}
                        />
                      </div>
                    </article>
                  );
                })}
                {jobs.length === 0 ? (
                  <p className="px-1 py-8 text-center text-xs text-muted-foreground">Empty lane</p>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>

      {data.overdueJobs.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Overdue</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {data.overdueJobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-muted/50"
              >
                <div>
                  <p className="text-sm font-medium">{job.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatJobNumber(job.jobNumber)} · {job.customerName}
                  </p>
                </div>
                <StatusBadge status={job.status} />
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
