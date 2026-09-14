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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {jobs.length} staffed {jobs.length === 1 ? "job" : "jobs"} on the board
        </p>
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <span className={`size-2 rounded-full ${live ? "bg-emerald-400" : "bg-muted-foreground"}`} />
          {live ? "Live feed" : "Standby"}
        </span>
      </div>
      {jobs.map((job) => (
        <ActiveJobCard key={job.id} job={job} />
      ))}
      {jobs.length === 0 ? (
        <div className="rounded-xl bg-card p-8 text-center ring-1 ring-foreground/10">
          <p className="font-medium">No staffed jobs</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Assign a technician and this feed will light up.
          </p>
        </div>
      ) : null}
    </div>
  );
}
