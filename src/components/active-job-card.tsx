"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BroadcastCrew, CrewComms } from "@/components/crew-comms";
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

  return (
    <article className="space-y-4 rounded-2xl bg-card p-4 ring-1 ring-primary/15">
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[11px] text-muted-foreground">
            {formatJobNumber(job.jobNumber)}
          </p>
          <div className="flex gap-1">
            <StatusBadge status={job.status} />
            <PriorityBadge priority={job.priority} />
          </div>
        </div>
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          {job.customerName}
        </p>
        <h2 className="text-xl font-semibold leading-tight">
          <Link href={`/jobs/${job.id}`}>{job.title}</Link>
        </h2>
        <p className="text-sm leading-snug text-muted-foreground">{job.scope}</p>
      </header>

      <PropertyPreview destination={job.destination} />

      <section className="space-y-3">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Assigned crew
        </h3>
        <ul className="space-y-3">
          {job.crew.map((member) => (
            <li key={member.id} className="space-y-3 rounded-2xl bg-background p-3 ring-1 ring-border">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage src={member.avatarUrl} alt={member.name} />
                  <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                    {initials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">{member.name}</p>
                  <p
                    className={cn(
                      "font-mono text-[11px] uppercase tracking-[0.14em]",
                      member.tracking.status === "on_site" ? "text-emerald-400" : "text-primary",
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
