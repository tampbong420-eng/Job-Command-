"use client";

import CustomerCard from "@/components/CustomerCard";
import { jobsByStatus } from "@/lib/assign";
import { jobStatusLabel, jobTone, wrapIndex } from "@/lib/format";
import type { CrewMember, Estimate, Job, JobStatus, TimeCard } from "@/lib/types";
import { useSwipe } from "@/lib/use-swipe";
import { useEffect, useMemo } from "react";

export default function LaneJobsDeck({
  status,
  jobs,
  estimates,
  timeCards,
  crew,
  jobId,
  onJobId,
  onBack,
  onStatus,
  onDelete,
  onOpenEstimates,
  onOpenTimeCards,
  onPhoto,
}: {
  status: JobStatus;
  jobs: Job[];
  estimates: Estimate[];
  timeCards: TimeCard[];
  crew: CrewMember[];
  jobId: string | null;
  onJobId: (id: string | null) => void;
  onBack: () => void;
  onStatus: (jobId: string, status: JobStatus) => void;
  onDelete: (jobId: string) => void;
  onOpenEstimates: () => void;
  onOpenTimeCards: () => void;
  onPhoto: (jobId: string, kind: "before" | "after", dataUrl: string) => void;
}) {
  const lane = useMemo(() => jobsByStatus(jobs, status), [jobs, status]);
  const index = Math.max(
    0,
    lane.findIndex((job) => job.id === jobId),
  );
  const current = lane[index] ?? null;

  useEffect(() => {
    if (lane.length === 0) {
      if (jobId) onJobId(null);
      return;
    }
    if (!jobId || !lane.some((job) => job.id === jobId)) {
      onJobId(lane[0].id);
    }
  }, [jobId, lane, onJobId]);

  const swipe = useSwipe((delta) => {
    step(delta);
  }, "x", 72);

  function step(delta: number) {
    if (lane.length === 0) return;
    const next = wrapIndex(index, delta, lane.length);
    onJobId(lane[next]?.id ?? null);
  }

  return (
    <section className="page hours-desk lane-deck">
      <div className="hours-head">
        <button type="button" className="text-back" onClick={onBack}>
          ← Employees
        </button>
        <p className="section-kicker">Status lane</p>
        <h1 className={jobTone(status)}>{jobStatusLabel(status)}</h1>
        <p className="hours-person">
          {lane.length === 0
            ? "No jobs in this lane yet."
            : `Swipe to see all ${lane.length} ${jobStatusLabel(status).toLowerCase()} jobs.`}
        </p>
      </div>

      {current ? (
        <>
          <div
            className={`lane-flick${swipe.dragging ? " is-dragging" : ""}`}
            aria-label={`${jobStatusLabel(status)} jobs`}
            onPointerDown={swipe.onPointerDown}
            onPointerMove={swipe.onPointerMove}
            onPointerUp={swipe.onPointerUp}
            onPointerCancel={swipe.onPointerUp}
            style={{
              transform: swipe.dragging
                ? `translateX(${Math.max(-56, Math.min(56, swipe.drag * 0.28))}px)`
                : undefined,
            }}
          >
            <button
              type="button"
              className="ghost-action lane-step"
              aria-label="Previous job"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => step(-1)}
              disabled={lane.length < 2}
            >
              ←
            </button>
            <div className="lane-count">
              <span className={`job-chip ${jobTone(status)}`}>
                {index + 1} / {lane.length}
              </span>
              <p className="swipe-hint">Swipe jobs</p>
            </div>
            <button
              type="button"
              className="ghost-action lane-step"
              aria-label="Next job"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => step(1)}
              disabled={lane.length < 2}
            >
              →
            </button>
          </div>
          <CustomerCard
            job={current}
            estimates={estimates}
            timeCards={timeCards}
            crew={crew}
            onStatus={(next) => onStatus(current.id, next)}
            onDelete={() => onDelete(current.id)}
            onOpenEstimates={onOpenEstimates}
            onOpenTimeCards={onOpenTimeCards}
            onPhoto={(kind, dataUrl) => onPhoto(current.id, kind, dataUrl)}
          />
          <div className="rolodex-dots">
            {lane.map((job) => (
              <button
                key={job.id}
                type="button"
                className={job.id === current.id ? "on" : ""}
                aria-label={`Show ${job.customerName}`}
                aria-pressed={job.id === current.id}
                onClick={() => onJobId(job.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="empty-group">None in this lane.</p>
      )}
    </section>
  );
}
