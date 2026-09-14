"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClockInOut } from "@/components/clock-in-out";
import { BroadcastCrew, CrewComms } from "@/components/crew-comms";
import { JobScopeTalk } from "@/components/job-scope-talk";
import { PropertyPreview } from "@/components/property-preview";
import { ShiftMeterBar } from "@/components/shift-meter";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { CREW_LOCATION_LABELS } from "@/lib/crew";
import { initials } from "@/lib/format";
import { formatJobNumber } from "@/lib/format";
import type { ActiveCrewJob } from "@/lib/services/crew";
import { cn } from "@/lib/utils";

export function ActiveJobCard({ job }: { job: ActiveCrewJob }) {
  const phones = job.crew.map((member) => member.phone).filter((phone): phone is string => Boolean(phone));
  const [scope, setScope] = useState(job.scope);

  useEffect(() => {
    setScope(job.scope);
  }, [job.scope]);

  return (
    <article className="space-y-4 rounded-2xl bg-card p-4 ring-1 ring-primary/15">
      <header className="space-y-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">Owner</p>
          <h2 className="text-[1.55rem] font-semibold leading-tight tracking-tight">
            <Link href={`/customers/${job.customerId}`}>{job.customerName}</Link>
          </h2>
          <p className="mt-1 text-sm leading-snug text-foreground/90">
            {job.customerAddress?.trim() || job.destination || "No address on file"}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[11px] text-muted-foreground">
            {formatJobNumber(job.jobNumber)}
          </p>
          <div className="flex gap-1">
            <StatusBadge status={job.status} />
            <PriorityBadge priority={job.priority} />
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold leading-tight">
            <Link href={`/jobs/${job.id}`}>{job.title}</Link>
          </h3>
          <p className="mt-1 text-sm leading-snug text-muted-foreground">{scope}</p>
        </div>
      </header>

      <JobScopeTalk
        jobId={job.id}
        customerName={job.customerName}
        onSaved={setScope}
      />

      <PropertyPreview destination={job.destination} />

      <section className="space-y-3">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Assigned crew
        </h3>
        <ul className="space-y-3">
          {job.crew.map((member) => (
            <li key={member.id} className="space-y-3 rounded-2xl bg-background p-3 ring-1 ring-border">
              <div className="flex items-center gap-3">
                <Avatar
                  className={cn(
                    "size-12",
                    member.shift.clockedIn
                      ? "clock-in-move ring-2 ring-boss"
                      : "ring-2 ring-duty",
                  )}
                >
                  <AvatarImage src={member.avatarUrl} alt={member.name} />
                  <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                    {initials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="min-w-0 truncate text-base font-semibold">{member.name}</p>
                    <ClockInOut clockedIn={member.shift.clockedIn} />
                  </div>
                  <p
                    className={cn(
                      "font-mono text-[11px] uppercase tracking-[0.14em]",
                      member.tracking.status === "on_site" ? "text-boss" : "text-employee",
                    )}
                  >
                    {CREW_LOCATION_LABELS[member.tracking.status]}
                    {" · "}
                    {member.tracking.miles} mi
                    {" · "}
                    {member.tracking.minutes} min
                  </p>
                </div>
              </div>
              <ShiftMeterBar clockedInAt={member.clockedInAt} />
              <CrewComms name={member.name} phone={member.phone} jobTitle={job.title} />
            </li>
          ))}
        </ul>
        <BroadcastCrew phones={phones} jobTitle={job.title} />
      </section>
    </article>
  );
}
