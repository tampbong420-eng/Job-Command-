export const DEMO_PASSWORD = "Command#2026";

export const USER_ROLES = ["admin", "dispatcher", "technician", "viewer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const JOB_STATUSES = [
  "queued",
  "assigned",
  "in_progress",
  "blocked",
  "completed",
  "cancelled",
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const JOB_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type JobPriority = (typeof JOB_PRIORITIES)[number];

export const JOB_EVENT_TYPES = [
  "created",
  "updated",
  "status_changed",
  "assigned",
  "note_added",
] as const;
export type JobEventType = (typeof JOB_EVENT_TYPES)[number];

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string | null;
  active: boolean;
  createdAt: Date;
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  dispatcher: "Dispatcher",
  technician: "Technician",
  viewer: "Viewer",
};

export const STATUS_LABELS: Record<JobStatus, string> = {
  queued: "Queued",
  assigned: "Assigned",
  in_progress: "In progress",
  blocked: "Blocked",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PRIORITY_LABELS: Record<JobPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const STATUS_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  queued: ["assigned", "cancelled"],
  assigned: ["queued", "in_progress", "cancelled"],
  in_progress: ["blocked", "completed", "cancelled"],
  blocked: ["in_progress", "cancelled"],
  completed: ["in_progress"],
  cancelled: ["queued"],
};

export function canManageTeam(role: UserRole) {
  return role === "admin";
}

export function canWriteCustomers(role: UserRole) {
  return role === "admin" || role === "dispatcher";
}

export function canCreateJobs(role: UserRole) {
  return role === "admin" || role === "dispatcher";
}

export function canAssignJobs(role: UserRole) {
  return role === "admin" || role === "dispatcher";
}

export function canViewAllJobs(role: UserRole) {
  return role === "admin" || role === "dispatcher" || role === "viewer";
}

export function canMutateJob(
  role: UserRole,
  jobAssignedToUserId: string | null,
  actorId: string,
) {
  if (role === "admin" || role === "dispatcher") return true;
  if (role === "technician") {
    return jobAssignedToUserId === actorId;
  }
  return false;
}
