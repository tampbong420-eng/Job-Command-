"use client";

import StopBadge from "@/components/StopBadge";
import { activeJobs, assignedJobs } from "@/lib/assign";
import { clampIndex, jobStatusLabel, jobTone, wrapIndex } from "@/lib/format";
import type { CrewMember, Job } from "@/lib/types";
import { useSwipe } from "@/lib/use-swipe";
import { useMemo } from "react";

export default function JobTumbler({
  jobs,
  jobIndex,
  member,
  ticking,
  onIndexChange,
  onLock,
}: {
  jobs: Job[];
  jobIndex: number;
  member: CrewMember;
  ticking: boolean;
  onIndexChange: (index: number) => void;
  onLock: () => void;
}) {
  const stack = useMemo(() => activeJobs(jobs), [jobs]);
  const index = clampIndex(jobIndex, stack.length);
  const current = stack[index] ?? null;
  const swipe = useSwipe((delta) => {
    onIndexChange(wrapIndex(index, delta, stack.length));
  }, "y", 52);
  const nextStop = assignedJobs(jobs, member.id).length + 1;

  function step(delta: number) {
    if (stack.length < 2) return;
    onIndexChange(wrapIndex(index, delta, stack.length));
  }

  if (!current) {
    return (
      <section className="plate tumbler-shell">
        <p className="card-label">Job assignment</p>
        <p>No active jobs to lock.</p>
      </section>
    );
  }

  const lockedToThis = current.workerId === member.id;

  return (
    <section className="plate tumbler-shell">
      <div className="tumbler-head">
        <div>
          <p className="card-label">Job tumbler</p>
          <p className="swipe-hint">Flick or tap the jobs above and below</p>
        </div>
        <div className="tumbler-stepper">
          <button
            type="button"
            className="tumbler-step"
            aria-label="Previous job"
            disabled={stack.length < 2}
            onClick={() => step(-1)}
          >
            ▲
          </button>
          <span className="shift-tag shock">
            {index + 1} / {stack.length}
          </span>
          <button
            type="button"
            className="tumbler-step"
            aria-label="Next job"
            disabled={stack.length < 2}
            onClick={() => step(1)}
          >
            ▼
          </button>
        </div>
      </div>
      <div
        className="tumbler-body"
        aria-label="Active jobs tumbler"
        onPointerDown={swipe.onPointerDown}
        onPointerMove={swipe.onPointerMove}
        onPointerUp={(event) => {
          const stepped = swipe.onPointerUp();
          if (stepped || stack.length < 2) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const y = event.clientY - rect.top;
          if (y < rect.height * 0.35) step(-1);
          else if (y > rect.height * 0.65) step(1);
        }}
        onPointerCancel={swipe.onPointerUp}
      >
        <span className="tumbler-knurl left" aria-hidden="true" />
        <span className="tumbler-knurl right" aria-hidden="true" />
        <span className="tumbler-notch" aria-hidden="true" />
        <span className="tumbler-window" aria-hidden="true" />
        <div className="tumbler-track">
          {[-2, -1, 0, 1, 2].map((offset) => {
            const slotIndex = wrapIndex(index, offset, stack.length);
            const job = stack[slotIndex];
            if (!job) return null;
            const y = offset * 56 + swipe.drag * 0.42;
            const abs = Math.abs(offset);
            return (
              <article
                key={`${job.id}-${offset}`}
                className={`tumbler-slot${offset === 0 ? " is-center" : ""}${
                  offset === 0 && ticking ? " is-ticking" : ""
                }${swipe.dragging ? " is-dragging" : ""}`}
                style={{
                  transform: `translateY(${y}px)`,
                  opacity: abs === 0 ? 1 : abs === 1 ? 0.5 : 0.18,
                  filter: abs === 0 ? "none" : "blur(0.35px)",
                }}
              >
                <div className={`slot-copy ${jobTone(job.status)}`}>
                  <small>
                    {job.scheduledTime} · {jobStatusLabel(job.status)}
                  </small>
                  <b>{job.jobTitle}</b>
                  <span>
                    {job.customerName} · {job.worker}
                  </span>
                </div>
                {job.workerId === member.id && job.routeOrder != null && (
                  <StopBadge n={job.routeOrder} />
                )}
              </article>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        className={`lock-button${lockedToThis ? " locked" : ""}`}
        onClick={onLock}
      >
        <span className="button-icon" aria-hidden="true">
          {lockedToThis ? "●" : "◎"}
        </span>
        <span>
          <small>
            {lockedToThis
              ? `Stop ${current.routeOrder} · tap to unlock`
              : `Assign to ${member.name.split(" ")[0]} as stop ${nextStop}`}
          </small>
          <b>{lockedToThis ? "UNLOCK JOB" : "LOCK JOB"}</b>
        </span>
      </button>
    </section>
  );
}
