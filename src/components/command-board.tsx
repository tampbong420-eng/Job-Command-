"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { api } from "@/lib/api";
import { STATUS_LABELS, type JobStatus } from "@/lib/domain";
import { formatDateTime, formatJobNumber } from "@/lib/format";
import type { DashboardData } from "@/lib/services/dashboard";

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

export function CommandBoard({ initial }: { initial: DashboardData }) {
  const router = useRouter();
  const [data, setData] = useState<DashboardData>(initial);
  const [live, setLive] = useState(false);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Command board</h1>
          <p className="text-sm text-muted-foreground">
            Live view of every work order. Updates every few seconds.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className={`size-2 rounded-full ${live ? "bg-emerald-400" : "bg-muted-foreground"}`}
          />
          {live ? "Live" : "Connecting"}
        </div>
      </div>

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

      <div className="grid auto-cols-[minmax(16rem,1fr)] grid-flow-col gap-3 overflow-x-auto pb-2">
        {BOARD_COLUMNS.map((status) => {
          const jobs = data.columns[status];
          return (
            <section
              key={status}
              className="min-h-[28rem] rounded-xl bg-card/60 p-3 ring-1 ring-foreground/10"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-medium">{STATUS_LABELS[status]}</h2>
                <span className="font-mono text-xs text-muted-foreground">{jobs.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {jobs.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => router.push(`/jobs/${job.id}`)}
                    className="rounded-lg bg-background/80 p-3 text-left ring-1 ring-foreground/10 transition hover:ring-primary/40"
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
