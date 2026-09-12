"use client";

import CustomerCard from "@/components/CustomerCard";
import { assignedJobs } from "@/lib/assign";
import type { CrewMember, Estimate, Job, JobStatus, TimeCard } from "@/lib/types";

export default function AssignedStops({
  member,
  jobs,
  estimates,
  timeCards,
  crew,
  onBack,
  onStatus,
  onDelete,
  onOpenEstimates,
  onOpenTimeCards,
  onPhoto,
}: {
  member: CrewMember;
  jobs: Job[];
  estimates: Estimate[];
  timeCards: TimeCard[];
  crew: CrewMember[];
  onBack: () => void;
  onStatus: (jobId: string, status: JobStatus) => void;
  onDelete: (jobId: string) => void;
  onOpenEstimates: () => void;
  onOpenTimeCards: () => void;
  onPhoto: (jobId: string, kind: "before" | "after", dataUrl: string) => void;
}) {
  const stops = assignedJobs(jobs, member.id);

  return (
    <section className="page hours-desk">
      <div className="hours-head">
        <button type="button" className="text-back" onClick={onBack}>
          ← Back
        </button>
        <p className="section-kicker">Today&apos;s route</p>
        <h1>
          {member.name.split(" ")[0]}
          <br />
          <strong>Stops.</strong>
        </h1>
        <p className="hours-person">
          {stops.length === 0
            ? "No jobs locked to this employee yet."
            : `${stops.length} job${stops.length === 1 ? "" : "s"} for the day, in order.`}
        </p>
      </div>
      {stops.map((job) => (
        <CustomerCard
          key={job.id}
          job={job}
          estimates={estimates}
          timeCards={timeCards}
          crew={crew}
          onStatus={(status) => onStatus(job.id, status)}
          onDelete={() => onDelete(job.id)}
          onOpenEstimates={onOpenEstimates}
          onOpenTimeCards={onOpenTimeCards}
          onPhoto={(kind, dataUrl) => onPhoto(job.id, kind, dataUrl)}
        />
      ))}
    </section>
  );
}
