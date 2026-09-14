"use client";

import { useEffect, useState } from "react";
import { ActiveJobCard } from "@/components/active-job-card";
import { api } from "@/lib/api";
import type { ActiveCrewJob } from "@/lib/services/crew";

export function ActiveJobsCrew({ initial }: { initial: ActiveCrewJob[] }) {
  const [jobs, setJobs] = useState(initial);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      void api<{ jobs: ActiveCrewJob[] }>("/api/crew")
        .then((payload) => {
          setJobs(payload.jobs);
          setLive(true);
        })
        .catch(() => setLive(false));
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  function saveScope(jobId: string, scope: string) {
    setJobs((current) =>
      current.map((job) => (job.id === jobId ? { ...job, scope, description: scope } : job)),
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <p className="text-sm text-muted-foreground">
          {jobs.length} staffed {jobs.length === 1 ? "job" : "jobs"}
        </p>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <span className={`size-2 rounded-full ${live ? "bg-emerald-400" : "bg-primary/50"}`} />
          {live ? "Live" : "Standby"}
        </span>
      </div>
      {jobs.map((job) => (
        <ActiveJobCard
          key={job.id}
          job={job}
          onScopeSaved={(scope) => saveScope(job.id, scope)}
        />
      ))}
      {jobs.length === 0 ? (
        <div className="rounded-2xl bg-card p-8 text-center ring-1 ring-primary/15">
          <p className="font-medium">No staffed jobs</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Assign a technician and this feed will light up.
          </p>
        </div>
      ) : null}
    </div>
  );
}
