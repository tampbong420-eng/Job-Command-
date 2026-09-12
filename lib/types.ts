export type CrewStatus = "active" | "break" | "off";
export type JobStatus =
  | "lead"
  | "pending"
  | "scheduled"
  | "dispatched"
  | "in_progress"
  | "completed"
  | "invoiced";
export type JobPriority = "high" | "medium" | "low";
export type Role = "employee" | "boss";
export type NavTab = "command" | "jobs" | "profile" | "settings";
export type ShopView =
  | "command"
  | "hours"
  | "jobs"
  | "estimates"
  | "timecards"
  | "receipts";
export type PaperTab = "jobs" | "estimates" | "timecards" | "receipts";
export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type ExpenseCategory = "Materials" | "Fuel" | "Equipment" | "Permits" | "Other";
export type CallIntent = "Estimate" | "Emergency" | "Schedule" | "General";
export type PlanTier = "starter" | "pro" | "enterprise";

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
  weeklySchedule: DaySchedule[];
  lat: number | null;
  lng: number | null;
  gpsLive: boolean;
  battery?: number;
  speedMph?: number;
  lastCheckIn?: string | null;
  inviteToken?: string;
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
  priority: JobPriority;
  lat: number | null;
  lng: number | null;
  photos?: JobPhoto[];
  signature?: string | null;
};

export type GeoPoint = {
  lat: number;
  lng: number;
};

export type EstimateLine = {
  label: string;
  kind: "labor" | "material";
  qty: number;
  rate: number;
};

export type Estimate = {
  id: string;
  jobId: string;
  amount: number;
  notes: string;
  createdAt: string;
  labor?: number;
  materials?: number;
  markup?: number;
  taxRate?: number;
  lines?: EstimateLine[];
};

export type TimeCard = {
  id: string;
  employeeId: string;
  jobId: string | null;
  hours: number;
  date: string;
  notes: string;
};

export type Expense = {
  id: string;
  employeeId: string;
  jobId: string | null;
  vendor: string;
  amount: number;
  category: ExpenseCategory;
  photoUrl: string | null;
  createdAt: string;
};

export type CallLog = {
  id: string;
  callerName: string;
  phone: string;
  transcript: string;
  summary: string;
  intent: CallIntent;
  createdAt: string;
  convertedJobId: string | null;
};

export type ShopMessage = {
  id: string;
  fromId: string;
  body: string;
  createdAt: string;
  broadcast: boolean;
};

export type ShopSnapshot = {
  jobs: Job[];
  crew: CrewMember[];
  estimates: Estimate[];
  timeCards: TimeCard[];
  expenses?: Expense[];
  calls?: CallLog[];
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
  | {
      type: "create_expense";
      vendor: string;
      amount: number;
      category: ExpenseCategory;
      employee?: string;
      query?: string;
    }
  | { type: "convert_call"; callId: string }
  | { type: "send_message"; body: string; employee?: string };

export type TalkResult = {
  say: string;
  commands: ShopCommand[];
};
