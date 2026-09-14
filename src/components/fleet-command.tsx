"use client";

import { useEffect, useMemo, useState } from "react";
import { ActiveJobCard } from "@/components/active-job-card";
import { ClockInOut } from "@/components/clock-in-out";
import { ShiftMeterBar } from "@/components/shift-meter";
import { api } from "@/lib/api";
import {
  CREW_LOCATION_LABELS,
  FLEET_FILTERS,
  fleetFilterLabel,
  pinPercent,
  regionMapUrl,
  type FleetFilter,
} from "@/lib/crew";
import type { ActiveCrewJob, CrewMemberCard } from "@/lib/services/crew";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/format";

type RosterRow = {
  member: CrewMemberCard;
  job: ActiveCrewJob;
};

function flatten(jobs: ActiveCrewJob[]): RosterRow[] {
  const rows: RosterRow[] = [];
  const seen = new Set<string>();
  for (const job of jobs) {
    for (const member of job.crew) {
      if (seen.has(member.id)) continue;
      seen.add(member.id);
      rows.push({ member, job });
    }
  }
  return rows;
}

function matchesFilter(row: RosterRow, filter: FleetFilter) {
  if (filter === "all") return true;
  if (filter === "off") return !row.member.shift.clockedIn;
  if (filter === "active") {
    return row.member.shift.clockedIn && row.member.tracking.status === "on_site";
  }
  return row.member.shift.clockedIn && row.member.tracking.status !== "on_site";
}

export function FleetCommand({ initial }: { initial: ActiveCrewJob[] }) {
  const [jobs, setJobs] = useState(initial);
  const [live, setLive] = useState(false);
  const [filter, setFilter] = useState<FleetFilter>("all");
  const [satellite, setSatellite] = useState(false);
  const [geofence, setGeofence] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(initial[0]?.crew[0]?.id ?? null);

  useEffect(() => {
    const timer = setInterval(() => {
      void api<{ jobs: ActiveCrewJob[] }>("/api/crew")
        .then((payload) => {
          setJobs(payload.jobs);
          setLive(true);
        })
        .catch(() => setLive(false));
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const ping = () => {
      void api("/api/fleet/ping", { method: "POST", body: JSON.stringify({}) }).catch(() => undefined);
    };
    ping();
    const timer = setInterval(ping, 15_000);
    return () => clearInterval(timer);
  }, []);

  function saveScope(jobId: string, scope: string) {
    setJobs((current) =>
      current.map((job) => (job.id === jobId ? { ...job, scope, description: scope } : job)),
    );
  }

  const roster = useMemo(() => flatten(jobs).filter((row) => matchesFilter(row, filter)), [jobs, filter]);
  const selected = roster.find((row) => row.member.id === selectedId) ?? roster[0] ?? null;
  const selectedJob = selected ? jobs.find((job) => job.id === selected.job.id) : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {roster.length} {roster.length === 1 ? "tech" : "techs"} on the map
        </p>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <span className={`size-2 rounded-full ${live ? "bg-boss" : "bg-primary/50"}`} />
          {live ? "Live · 15s ping" : "Standby"}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1 rounded-xl bg-muted/70 p-1">
        {FLEET_FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cn(
              "h-9 rounded-lg text-[11px] font-semibold",
              filter === item ? "bg-boss text-ink" : "text-muted-foreground",
            )}
          >
            {fleetFilterLabel(item)}
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl ring-1 ring-boss/25">
        <iframe
          title="Hot Springs fleet map"
          src={regionMapUrl(satellite)}
          className="h-56 w-full border-0 bg-muted"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="pointer-events-none absolute inset-0">
          {geofence ? (
            <div className="absolute left-1/2 top-1/2 size-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-boss/70" />
          ) : null}
          {roster.map((row) => {
            const pin = pinPercent(row.member.fix.lat, row.member.fix.lng);
            const active = selected?.member.id === row.member.id;
            return (
              <button
                key={row.member.id}
                type="button"
                style={{ top: pin.top, left: pin.left }}
                onClick={() => setSelectedId(row.member.id)}
                className={cn(
                  "pointer-events-auto absolute size-8 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full ring-2",
                  row.member.shift.clockedIn ? "ring-boss" : "ring-duty",
                  active && "z-10 scale-110",
                )}
                aria-label={row.member.name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={row.member.avatarUrl} alt="" className="size-full object-cover" />
              </button>
            );
          })}
        </div>
        <div className="absolute bottom-2 left-2 right-2 flex gap-1">
          <button
            type="button"
            onClick={() => setSatellite((value) => !value)}
            className="rounded-full bg-background/90 px-3 py-1.5 text-[11px] font-medium ring-1 ring-white/10"
          >
            {satellite ? "Map" : "Satellite"}
          </button>
          <button
            type="button"
            onClick={() => setGeofence((value) => !value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-[11px] font-medium ring-1",
              geofence ? "bg-boss text-ink ring-boss" : "bg-background/90 ring-white/10",
            )}
          >
            Geofence
          </button>
        </div>
      </div>

      <ul className="space-y-2">
        {roster.map((row) => {
          const active = selected?.member.id === row.member.id;
          return (
            <li key={row.member.id}>
              <button
                type="button"
                onClick={() => setSelectedId(row.member.id)}
                className={cn(
                  "w-full rounded-2xl bg-card p-3 text-left ring-1",
                  active ? "ring-boss/50" : "ring-border",
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    className={cn(
                      "size-11",
                      row.member.shift.clockedIn ? "clock-in-move ring-2 ring-boss" : "ring-2 ring-duty",
                    )}
                  >
                    <AvatarImage src={row.member.avatarUrl} alt={row.member.name} />
                    <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                      {initials(row.member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold">{row.member.name}</p>
                      <ClockInOut clockedIn={row.member.shift.clockedIn} />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {CREW_LOCATION_LABELS[row.member.tracking.status]} · {row.job.customerName}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="rounded-lg bg-background py-1.5 ring-1 ring-border">
                    <p className="text-muted-foreground">Battery</p>
                    <p className={cn("font-mono font-semibold", row.member.fix.battery < 20 && "text-duty")}>
                      {row.member.fix.battery}%
                    </p>
                  </div>
                  <div className="rounded-lg bg-background py-1.5 ring-1 ring-border">
                    <p className="text-muted-foreground">Speed</p>
                    <p className="font-mono font-semibold">{row.member.fix.speedMph} mph</p>
                  </div>
                  <div className="rounded-lg bg-background py-1.5 ring-1 ring-border">
                    <p className="text-muted-foreground">Shift</p>
                    <p className="font-mono font-semibold">
                      {row.member.shift.clockedIn ? `${Math.floor(row.member.shift.elapsedMs / 3600000)}h` : "—"}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <ShiftMeterBar clockedInAt={row.member.clockedInAt} />
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {selectedJob ? (
        <ActiveJobCard job={selectedJob} onScopeSaved={(scope) => saveScope(selectedJob.id, scope)} />
      ) : (
        <div className="rounded-2xl bg-card p-8 text-center ring-1 ring-primary/15">
          <p className="font-medium">No crew on this filter</p>
          <p className="mt-1 text-sm text-muted-foreground">Clock someone in and they show up here.</p>
        </div>
      )}
    </div>
  );
}
