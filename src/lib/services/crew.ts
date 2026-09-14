import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import type { AppDb } from "@/db/types";
import { jobAssignments, telemetryPings, timeEntries, users } from "@/db/schema";
import {
  avatarUrl,
  crewTracking,
  shiftMeter,
  simulatedFix,
  type CrewTracking,
  type FleetFix,
  type ShiftMeter,
} from "@/lib/crew";
import { canViewAllJobs, type JobStatus, type PublicUser } from "@/lib/domain";
import { listJobs, type JobListItem } from "@/lib/services/jobs";

const ACTIVE_STATUSES: JobStatus[] = ["assigned", "in_progress", "blocked"];

export type CrewMemberCard = {
  id: string;
  name: string;
  phone: string | null;
  avatarUrl: string;
  tracking: CrewTracking;
  shift: ShiftMeter;
  clockedInAt: string | null;
  fix: FleetFix;
};

export type ActiveCrewJob = JobListItem & {
  scope: string;
  destination: string;
  crew: CrewMemberCard[];
};

export async function listActiveCrewJobs(db: AppDb, actor: PublicUser): Promise<ActiveCrewJob[]> {
  const jobs = await listJobs(db, actor);
  const active = jobs.filter((job) => ACTIVE_STATUSES.includes(job.status));
  if (active.length === 0) return [];

  const jobIds = active.map((job) => job.id);
  const assignmentRows = await db
    .select({
      jobId: jobAssignments.jobId,
      userId: jobAssignments.userId,
      name: users.name,
      phone: users.phone,
      avatarUrl: users.avatarUrl,
    })
    .from(jobAssignments)
    .innerJoin(users, eq(jobAssignments.userId, users.id))
    .where(inArray(jobAssignments.jobId, jobIds));

  const openClocks = await db
    .select({
      userId: timeEntries.userId,
      startedAt: timeEntries.startedAt,
      jobId: timeEntries.jobId,
    })
    .from(timeEntries)
    .where(isNull(timeEntries.endedAt));
  const clockByUser = new Map(openClocks.map((row) => [row.userId, row]));

  const pingRows = await db
    .select()
    .from(telemetryPings)
    .orderBy(desc(telemetryPings.createdAt));
  const pingByUser = new Map<string, (typeof pingRows)[number]>();
  for (const ping of pingRows) {
    if (!pingByUser.has(ping.userId)) pingByUser.set(ping.userId, ping);
  }

  function memberFix(userId: string) {
    const sim = simulatedFix(userId);
    const ping = pingByUser.get(userId);
    if (!ping) return sim;
    return {
      lat: ping.lat ? Number(ping.lat) : sim.lat,
      lng: ping.lng ? Number(ping.lng) : sim.lng,
      battery: ping.battery ?? sim.battery,
      speedMph: sim.speedMph,
    };
  }

  const crewByJob = new Map<string, CrewMemberCard[]>();
  for (const row of assignmentRows) {
    const clock = clockByUser.get(row.userId);
    const job = active.find((item) => item.id === row.jobId);
    if (!job) continue;
    const card: CrewMemberCard = {
      id: row.userId,
      name: row.name,
      phone: row.phone,
      avatarUrl: row.avatarUrl || avatarUrl(row.name, row.userId),
      tracking: crewTracking(row.userId, row.jobId, job.status),
      shift: shiftMeter(clock?.startedAt ?? null),
      clockedInAt: clock?.startedAt ? clock.startedAt.toISOString() : null,
      fix: memberFix(row.userId),
    };
    const list = crewByJob.get(row.jobId) ?? [];
    list.push(card);
    crewByJob.set(row.jobId, list);
  }

  const result: ActiveCrewJob[] = [];
  for (const job of active) {
    let crew = crewByJob.get(job.id) ?? [];
    if (crew.length === 0 && job.assignedToUserId && job.assigneeName) {
      const clock = clockByUser.get(job.assignedToUserId);
      crew = [
        {
          id: job.assignedToUserId,
          name: job.assigneeName,
          phone: null,
          avatarUrl: avatarUrl(job.assigneeName, job.assignedToUserId),
          tracking: crewTracking(job.assignedToUserId, job.id, job.status),
          shift: shiftMeter(clock?.startedAt ?? null),
          clockedInAt: clock?.startedAt ? clock.startedAt.toISOString() : null,
          fix: memberFix(job.assignedToUserId),
        },
      ];
    }
    if (crew.length === 0) continue;
    if (!canViewAllJobs(actor.role) && !crew.some((member) => member.id === actor.id)) {
      continue;
    }
    result.push({
      ...job,
      scope: job.description?.trim() || "Scope not written yet.",
      destination: job.customerAddress?.trim() || job.location?.trim() || "",
      crew,
    });
  }

  return result.sort((a, b) => {
    const rank = (status: JobStatus) =>
      status === "in_progress" ? 0 : status === "assigned" ? 1 : 2;
    return rank(a.status) - rank(b.status);
  });
}

export async function listOpenClocks(db: AppDb) {
  return db
    .select({
      userId: timeEntries.userId,
      startedAt: timeEntries.startedAt,
      jobId: timeEntries.jobId,
    })
    .from(timeEntries)
    .where(and(isNull(timeEntries.endedAt)));
}
