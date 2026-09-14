"use client";

import CustomerCard from "@/components/CustomerCard";
import { jobStatusLabel, jobTone } from "@/lib/format";
import type { CrewMember, Estimate, Job, JobStatus, TimeCard } from "@/lib/types";
import type { ReactNode } from "react";

const GROUPS: JobStatus[] = ["lead", "pending", "in_progress", "completed"];

export default function BossJobsBoard({
  jobs,
  estimates,
  timeCards,
  crew,
  onStatus,
  onDelete,
  onOpenEstimates,
  onOpenTimeCards,
  onPhoto,
  children,
}: {
  jobs: Job[];
  estimates: Estimate[];
  timeCards: TimeCard[];
  crew: CrewMember[];
  onStatus: (jobId: string, status: JobStatus) => void;
  onDelete: (jobId: string) => void;
  onOpenEstimates: (jobId: string) => void;
  onOpenTimeCards: (jobId: string) => void;
  onPhoto: (jobId: string, kind: "before" | "after", dataUrl: string) => void;
  children?: ReactNode;
}) {
  return (
    <section className="page jobs-board">
      <p className="section-kicker">Jobs</p>
      <h1>
        Customer
        <br />
        <strong>Cards.</strong>
      </h1>
      <p className="board-copy">
        Tap New call, Estimate, On job, Finished, or Delete on a card. Invoice,
        scope, street view, photos, and hours stay on the same customer.
      </p>
      {children}
      {GROUPS.map((status) => {
        const rows = jobs.filter((job) => job.status === status);
        return (
          <section key={status} className={`job-group ${jobTone(status)}`}>
            <header>
              <span className={`job-chip ${jobTone(status)}`}>
                {jobStatusLabel(status)}
              </span>
              <b>{rows.length}</b>
            </header>
            {rows.length === 0 ? (
              <p className="empty-group">None in this lane.</p>
            ) : (
              rows.map((job) => (
                <CustomerCard
                  key={job.id}
                  job={job}
                  estimates={estimates}
                  timeCards={timeCards}
                  crew={crew}
                  onStatus={(next) => onStatus(job.id, next)}
                  onDelete={() => onDelete(job.id)}
                  onOpenEstimates={() => onOpenEstimates(job.id)}
                  onOpenTimeCards={() => onOpenTimeCards(job.id)}
                  onPhoto={(kind, dataUrl) => onPhoto(job.id, kind, dataUrl)}
                />
              ))
            )}
          </section>
        );
      })}
    </section>
  );
}
