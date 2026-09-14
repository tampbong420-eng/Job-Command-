"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FieldActions } from "@/components/field-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { api } from "@/lib/api";
import { STATUS_LABELS, type JobStatus, type PublicUser } from "@/lib/domain";
import { formatDateTime, formatJobNumber } from "@/lib/format";
import type { DashboardData } from "@/lib/services/dashboard";
import { tapHaptic } from "@/lib/haptic";

const BOARD_COLUMNS: JobStatus[] = [
  "queued",
  "assigned",
  "in_progress",
  "blocked",
  "completed",
];

type DashboardPayload = {
  dashboard: DashboardData;
};

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
  const [data, setData] = useState<DashboardData>(initial);
  const [live, setLive] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

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
      { label: "Open jobs", value: data.metrics.open },
      { label: "In progress", value: data.metrics.inProgress },
      { label: "Blocked", value: data.metrics.blocked },
      { label: "Overdue", value: data.metrics.overdue },
      { label: "Completed today", value: data.metrics.completedToday },
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
    }
  }

  const greeting =
    user.role === "technician" ? `Your shift, ${user.name.split(" ")[0]}` : "Today on the desk";

  return (
    <div className="space-y-6">
      {embedded ? (
        <div className="flex items-center justify-end text-xs text-muted-foreground">
          <span
            className={`mr-2 size-2 rounded-full ${live ? "bg-emerald-400" : "bg-muted-foreground"}`}
          />
          {live ? "Live" : "Connecting"}
        </div>
      ) : (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
              {greeting}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">Command board</h1>
            <p className="text-sm text-muted-foreground">
              Call the site, get directions, and move the job without leaving the board.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className={`size-2 rounded-full ${live ? "bg-emerald-400" : "bg-muted-foreground"}`}
            />
            {live ? "Live" : "Connecting"}
          </div>
        </div>
      )}

      {data.focus ? (
        <Card className="ring-1 ring-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Next stop
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {formatJobNumber(data.focus.jobNumber)}
                </p>
                <p className="text-lg font-semibold leading-tight">{data.focus.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {data.focus.customerName}
                  {data.focus.location ? ` · ${data.focus.location}` : ""}
                </p>
              </div>
              <div className="flex gap-1">
                <StatusBadge status={data.focus.status} />
                <PriorityBadge priority={data.focus.priority} />
              </div>
            </div>
            <FieldActions
              job={data.focus}
              user={user}
              pending={pendingId === data.focus.id}
              onAdvance={(status) => void advance(data.focus!.id, status)}
            />
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((metric) => (
          <Card key={metric.label} size="sm">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-2xl font-semibold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:auto-cols-[minmax(16rem,1fr)] md:grid-flow-col md:px-0">
        {BOARD_COLUMNS.map((status) => {
          const jobs = data.columns[status];
          return (
            <section
              key={status}
              className="min-h-[22rem] w-[min(86vw,20rem)] shrink-0 snap-start rounded-xl bg-card/60 p-3 ring-1 ring-foreground/10 md:w-auto md:min-h-[28rem]"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-medium">{STATUS_LABELS[status]}</h2>
                <span className="font-mono text-xs text-muted-foreground">{jobs.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-lg bg-background/80 p-3 text-left ring-1 ring-foreground/10"
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
                        <PriorityBadge priority={job.priority} />
                      </div>
                      <p className="text-sm font-medium leading-snug">{job.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{job.customerName}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {job.assigneeName ?? "Unassigned"} · {formatDateTime(job.scheduledAt)}
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
                  </div>
                ))}
                {jobs.length === 0 ? (
                  <p className="px-1 py-8 text-center text-xs text-muted-foreground">
                    Empty lane
                  </p>
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

      {data.urgent.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Urgent queue</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {data.urgent.map((job) => (
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
