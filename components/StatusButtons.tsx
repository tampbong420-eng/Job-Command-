"use client";

import { jobStatusLabel, jobTone } from "@/lib/format";
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
  return (
    <div className="status-buttons" role="group" aria-label="Customer status">
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
