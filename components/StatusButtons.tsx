"use client";

import { jobStatusLabel, jobTone, nextActionLabel, nextJobStatus } from "@/lib/format";
import type { Job, JobStatus } from "@/lib/types";

const BUTTONS: JobStatus[] = ["lead", "pending", "in_progress", "completed"];

export default function StatusButtons({
  job,
  onStatus,
  onDelete,
}: {
  job: Job;
  onStatus: (status: JobStatus) => void;
  onDelete: () => void;
}) {
  const next = nextJobStatus(job.status);
  const nextLabel = nextActionLabel(job.status);

  return (
    <div className="status-buttons" role="group" aria-label="Customer status">
      {next && nextLabel ? (
        <>
          <button
            type="button"
            className="lane-button next-step"
            onClick={() => onStatus(next)}
          >
            {nextLabel}
          </button>
          <p className="status-next-hint">Green button is the next step.</p>
        </>
      ) : (
        <p className="status-next-hint">This job is paid.</p>
      )}
      {BUTTONS.map((status) => (
        <button
          key={status}
          type="button"
          className={`lane-button ${jobTone(status)}${job.status === status ? " is-on" : ""}`}
          aria-pressed={job.status === status}
          onClick={() => onStatus(status)}
        >
          {jobStatusLabel(status)}
        </button>
      ))}
      <button type="button" className="lane-button tone-delete" onClick={onDelete}>
        Delete
      </button>
    </div>
  );
}
