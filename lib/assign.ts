import type { CrewMember, Job, JobStatus } from "./types";

export function jobsByStatus(jobs: Job[], status: JobStatus): Job[] {
  return jobs.filter((job) => job.status === status);
}

export function activeJobs(jobs: Job[]): Job[] {
  return jobs.filter((job) => job.status === "in_progress");
}

export function assignedJobs(jobs: Job[], employeeId: string): Job[] {
  return jobs
    .filter((job) => job.workerId === employeeId && job.status !== "completed")
    .sort((a, b) => {
      const aOrder = a.routeOrder ?? 99;
      const bOrder = b.routeOrder ?? 99;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });
}

export function assignedJob(jobs: Job[], member: CrewMember): Job | null {
  const stops = assignedJobs(jobs, member.id);
  if (member.currentJobId) {
    return stops.find((job) => job.id === member.currentJobId) ?? stops[0] ?? null;
  }
  return stops[0] ?? null;
}

function compactEmployeeRoute(jobs: Job[], employeeId: string): Job[] {
  const mine = assignedJobs(jobs, employeeId);
  const order = new Map(mine.map((job, index) => [job.id, index + 1]));
  return jobs.map((job) => {
    if (job.workerId !== employeeId) return job;
    if (job.status === "completed") return { ...job, routeOrder: null };
    const n = order.get(job.id);
    return n != null ? { ...job, routeOrder: n } : { ...job, routeOrder: null };
  });
}

export function syncJobRoutes(jobs: Job[]): Job[] {
  const owners = new Set(
    jobs
      .filter((job) => job.workerId && job.status !== "completed")
      .map((job) => job.workerId as string),
  );
  let next = jobs.map((job) =>
    !job.workerId || job.status === "completed"
      ? { ...job, routeOrder: null }
      : job,
  );
  for (const id of owners) {
    next = compactEmployeeRoute(next, id);
  }
  return next;
}

export function syncCrewToJobs(crew: CrewMember[], jobs: Job[]): CrewMember[] {
  return crew.map((member) => {
    const stops = assignedJobs(jobs, member.id);
    const current =
      stops.find((job) => job.id === member.currentJobId) ?? stops[0] ?? null;
    return {
      ...member,
      currentJobId: current?.id ?? null,
      currentJob: current?.jobTitle ?? "Unassigned",
    };
  });
}

export function tumblerIndexForCrew(
  jobs: Job[],
  employeeId: string,
  currentJobId: string | null,
): number {
  const stack = activeJobs(jobs);
  if (currentJobId) {
    const byId = stack.findIndex((job) => job.id === currentJobId);
    if (byId >= 0) return byId;
  }
  const byWorker = stack.findIndex((job) => job.workerId === employeeId);
  return byWorker >= 0 ? byWorker : 0;
}

export function lockJobToCrew(
  jobs: Job[],
  crew: CrewMember[],
  jobId: string,
  employeeId: string,
): { jobs: Job[]; crew: CrewMember[]; locked: boolean } {
  const job = jobs.find((row) => row.id === jobId);
  const employee = crew.find((row) => row.id === employeeId);
  if (!job || !employee || job.status === "completed") {
    return { jobs, crew, locked: false };
  }

  const previousOwner =
    job.workerId && job.workerId !== employeeId ? job.workerId : null;
  const alreadyOnRoute = job.workerId === employeeId;
  const nextOrder = alreadyOnRoute
    ? (job.routeOrder ?? assignedJobs(jobs, employeeId).length)
    : assignedJobs(jobs, employeeId).length + 1;

  let nextJobs = jobs.map((row) => {
    if (row.id !== jobId) return row;
    return {
      ...row,
      worker: employee.name,
      workerId: employee.id,
      routeOrder: nextOrder,
      status:
        row.status === "lead" || row.status === "pending"
          ? "in_progress"
          : row.status,
    };
  });

  if (previousOwner) {
    nextJobs = compactEmployeeRoute(nextJobs, previousOwner);
  }
  nextJobs = compactEmployeeRoute(nextJobs, employeeId);

  return {
    jobs: nextJobs,
    crew: syncCrewToJobs(crew, nextJobs),
    locked: true,
  };
}

export function toggleCrewClock(
  crew: CrewMember[],
  employeeId: string,
  now = new Date().toISOString(),
): CrewMember[] {
  return crew.map((row) => {
    if (row.id !== employeeId) return row;
    if (row.status !== "off") {
      return { ...row, status: "off", gpsLive: false };
    }
    return {
      ...row,
      status: "active",
      startedAt: row.startedAt ?? now,
      gpsLive: true,
    };
  });
}

export function toggleCrewGps(
  crew: CrewMember[],
  employeeId: string,
): CrewMember[] {
  return crew.map((row) => {
    if (row.id !== employeeId) return row;
    return { ...row, gpsLive: !row.gpsLive };
  });
}

export function updateWeeklySchedule(
  crew: CrewMember[],
  employeeId: string,
  weeklySchedule: CrewMember["weeklySchedule"],
): CrewMember[] {
  return crew.map((row) =>
    row.id === employeeId ? { ...row, weeklySchedule } : row,
  );
}

export function employeeJobs(jobs: Job[], employeeId: string): Job[] {
  return assignedJobs(jobs, employeeId);
}

export function onClockCrew(crew: CrewMember[]): CrewMember[] {
  return crew.filter((row) => row.status !== "off");
}
