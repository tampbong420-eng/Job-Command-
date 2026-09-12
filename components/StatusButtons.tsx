"use client";

import { jobTone } from "@/lib/format";
import type { Job, JobStatus } from "@/lib/types";

const BUTTONS: { status: JobStatus; label: string }[] = [
  { status: "lead", label: "New lead" },
  { status: "scheduled", label: "Scheduled" },
  { status: "dispatched", label: "Dispatched" },
  { status: "in_progress", label: "On job" },
  { status: "completed", label: "Job Archive" },
  { status: "invoiced", label: "Invoiced" },
];

export default function StatusButtons({
  job,
  onStatus,
  onDelete,
}: {
  job: Job;
  onStatus: (status: JobStatus) => void;
  onDelete: () => void;
}) {
  const current = job.status === "pending" ? "scheduled" : job.status;
  return (
    <div className="status-buttons six" role="group" aria-label="Customer status">
      {BUTTONS.map((button) => (
        <button
          key={button.status}
          type="button"
          className={`lane-button ${jobTone(button.status)}${current === button.status ? " is-on" : ""}`}
          aria-pressed={current === button.status}
          onClick={() => onStatus(button.status)}
        >
          {button.label}
        </button>
      ))}
      <button type="button" className="lane-button tone-delete" onClick={onDelete}>
        Delete
      </button>
    </div>
  );
}
