export type CrewStatus = "active" | "break" | "off";
export type JobStatus = "lead" | "pending" | "in_progress" | "completed";
export type JobPriority = "high" | "medium" | "low";
export type Role = "employee" | "boss";
export type NavTab = "command" | "jobs" | "profile" | "settings";
export type ShopView = "command" | "hours" | "jobs" | "estimates" | "timecards";
export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type PayCadence = "weekly" | "biweekly" | "semimonthly";
export type TimesheetStatus = "open" | "flagged" | "approved" | "locked";
export type PayAuditAction =
  | "create"
  | "edit"
  | "flag"
  | "unflag"
  | "approve"
  | "unapprove"
  | "lock"
  | "punch_in"
  | "punch_out"
  | "rate"
  | "schedule";

export type DaySchedule = {
  day: Weekday;
  start: string;
  end: string;
  off: boolean;
};

export type CrewMember = {
  id: string;
  name: string;
  role: string;
  phone: string;
  photoUrl: string;
  status: CrewStatus;
  currentJob: string;
  currentJobId: string | null;
  startedAt: string | null;
  weeklyHoursTarget: number;
  weeklyHoursLogged: number;
  hourlyRate: number;
  overtimeMultiplier: number;
  payCadence: PayCadence;
  unpaidBreakMinutes: number;
  costCode: string;
  weeklySchedule: DaySchedule[];
  lat: number | null;
  lng: number | null;
  gpsLive: boolean;
};

export type JobPhoto = {
  id: string;
  kind: "before" | "after";
  dataUrl: string;
};

export type Job = {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  jobTitle: string;
  status: JobStatus;
  scheduledTime: string;
  worker: string;
  workerId: string | null;
  routeOrder: number | null;
  priority: JobPriority;
  lat: number | null;
  lng: number | null;
  photos?: JobPhoto[];
  scope?: string;
};

export type GeoPoint = {
  lat: number;
  lng: number;
};

export type Estimate = {
  id: string;
  jobId: string;
  amount: number;
  notes: string;
  createdAt: string;
  labor?: number;
  materials?: number;
};

export type JobChatMessage = {
  id: string;
  jobId: string;
  fromId: string;
  fromName: string;
  body: string;
  createdAt: string;
  amount?: number;
};

export type TimeCard = {
  id: string;
  employeeId: string;
  jobId: string | null;
  hours: number;
  date: string;
  notes: string;
  clockIn?: string | null;
  clockOut?: string | null;
  breakMinutes?: number | null;
  costCode?: string;
  flagged?: boolean;
};

export type Timesheet = {
  id: string;
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  status: TimesheetStatus;
  approvedAt: string | null;
  lockedAt: string | null;
};

export type PayAudit = {
  id: string;
  timesheetId: string;
  entryId: string | null;
  at: string;
  action: PayAuditAction;
  detail: string;
};

export type CostCode = {
  id: string;
  label: string;
};

export type ShopMessage = {
  id: string;
  fromId: string;
  body: string;
  createdAt: string;
  broadcast: boolean;
  seenBy?: string[];
};

export type ShopSnapshot = {
  jobs: Job[];
  crew: CrewMember[];
  estimates: Estimate[];
  timeCards: TimeCard[];
  messages?: ShopMessage[];
  selectedJobId: string | null;
  selectedCrewId: string | null;
};

export type ShopCommand =
  | { type: "set_status"; query: string; status: JobStatus }
  | { type: "delete_job"; query: string }
  | {
      type: "create_estimate";
      query: string;
      amount: number;
      notes?: string;
      labor?: number;
      materials?: number;
    }
  | {
      type: "create_timecard";
      employee: string;
      hours: number;
      query?: string;
      notes?: string;
    }
  | { type: "open"; view: ShopView }
  | { type: "assign"; query: string; employee: string }
  | {
      type: "create_job";
      customerName: string;
      address?: string;
      jobTitle?: string;
      phone?: string;
      status?: JobStatus;
    }
  | { type: "send_message"; body: string };

export type TalkResult = {
  say: string;
  commands: ShopCommand[];
};
