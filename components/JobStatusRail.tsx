import { jobStatusLabel, jobTone } from "@/lib/format";
import type { Job, JobStatus } from "@/lib/types";

const ORDER: JobStatus[] = [
  "lead",
  "scheduled",
  "dispatched",
  "in_progress",
  "completed",
  "invoiced",
];

export default function JobStatusRail({ jobs }: { jobs: Job[] }) {
  return (
    <ul className="status-rail six" aria-label="Job status colors">
      {ORDER.map((status) => {
        const count = jobs.filter((job) => {
          const lane = job.status === "pending" ? "scheduled" : job.status;
          return lane === status;
        }).length;
        return (
          <li key={status} className={`status-chip ${jobTone(status)}`}>
            <i />
            <span>
              {jobStatusLabel(status)}
              <b>{count}</b>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
