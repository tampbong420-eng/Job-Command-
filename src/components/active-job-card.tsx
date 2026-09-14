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
    <article className="space-y-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted-foreground">
            {formatJobNumber(job.jobNumber)}
          </p>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
            {job.customerName}
          </p>
          <h2 className="mt-1 text-lg font-semibold leading-tight">
            <Link href={`/jobs/${job.id}`} className="hover:underline">
              {job.title}
            </Link>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{job.scope}</p>
        </div>
        <div className="flex gap-1">
          <StatusBadge status={job.status} />
          <PriorityBadge priority={job.priority} />
        </div>
      </header>

      <PropertyPreview destination={job.destination} />

      <section className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Assigned crew
          </h3>
          <BroadcastCrew phones={phones} jobTitle={job.title} />
        </div>
        <ul className="space-y-3">
          {job.crew.map((member) => (
            <li
              key={member.id}
              className="rounded-lg bg-background/70 p-3 ring-1 ring-foreground/8"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar size="lg">
                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                    <AvatarFallback>{initials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{member.name}</p>
                    <p
                      className={cn(
                        "font-mono text-[11px] uppercase tracking-[0.12em]",
                        member.tracking.status === "on_site"
                          ? "text-emerald-400"
                          : "text-primary",
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
                <CrewComms name={member.name} phone={member.phone} jobTitle={job.title} />
              </div>
              <div className="mt-3">
                <ShiftMeterBar clockedInAt={member.clockedInAt} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
