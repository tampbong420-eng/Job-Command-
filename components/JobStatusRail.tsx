"use client";

import { jobStatusLabel, jobTone } from "@/lib/format";
import { jobsByStatus } from "@/lib/assign";
import type { Job, JobStatus } from "@/lib/types";

const ORDER: JobStatus[] = ["lead", "pending", "in_progress", "completed"];

export default function JobStatusRail({
  jobs,
  onSelect,
}: {
  jobs: Job[];
  onSelect: (status: JobStatus) => void;
}) {
  return (
    <ul className="status-rail" aria-label="Job status lanes">
      {ORDER.map((status) => {
        const count = jobsByStatus(jobs, status).length;
        return (
          <li key={status}>
            <button
              type="button"
              className={`status-chip ${jobTone(status)}`}
              onClick={() => onSelect(status)}
              aria-label={`Open ${jobStatusLabel(status)}, ${count} jobs`}
            >
              <i />
              <span>
                {jobStatusLabel(status)}
                <b>{count}</b>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
