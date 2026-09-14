export const DEMO_PASSWORD = "Command#2026";

export const USER_ROLES = ["admin", "dispatcher", "technician", "viewer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const JOB_STATUSES = [
  "queued",
  "estimate_sent",
  "estimate_approved",
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
  avatarUrl: string | null;
  active: boolean;
  createdAt: Date;
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  dispatcher: "Dispatcher",
  technician: "Field crew",
  viewer: "Viewer",
};

export const PIPELINE_COLUMNS = [
  { status: "queued", title: "New" },
  { status: "estimate_sent", title: "Estimate out" },
  { status: "estimate_approved", title: "Approved" },
  { status: "assigned", title: "Booked" },
  { status: "in_progress", title: "Painting" },
  { status: "completed", title: "Paid" },
] as const;

export type PipelineStatus = (typeof PIPELINE_COLUMNS)[number]["status"];

export const STATUS_LABELS: Record<JobStatus, string> = {
  queued: "New",
  estimate_sent: "Estimate out",
  estimate_approved: "Approved",
  assigned: "Booked",
  in_progress: "Painting",
  blocked: "Stuck",
  completed: "Paid",
  cancelled: "Cancelled",
};

export const PRIORITY_LABELS: Record<JobPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const STATUS_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  queued: ["estimate_sent", "assigned", "cancelled"],
  estimate_sent: ["estimate_approved", "queued", "cancelled"],
  estimate_approved: ["assigned", "estimate_sent", "cancelled"],
  assigned: ["in_progress", "estimate_approved", "queued", "cancelled"],
  in_progress: ["blocked", "completed", "assigned"],
  blocked: ["in_progress", "cancelled"],
  completed: ["in_progress"],
  cancelled: ["queued"],
};

export function canManageTeam(role: UserRole) {
  return role === "admin";
}

export function canAccessBilling(role: UserRole) {
  return role === "admin";
}

export function canConfigureAi(role: UserRole) {
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

export function isFieldCrew(role: UserRole) {
  return role === "technician";
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
