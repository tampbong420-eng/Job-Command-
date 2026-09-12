import type {
  CallLog,
  CrewMember,
  Expense,
  ExpenseCategory,
  Job,
  JobStatus,
  ShopMessage,
} from "./types";

const CLOSED: JobStatus[] = ["completed", "invoiced"];
const FIELD: JobStatus[] = ["dispatched", "in_progress"];

export function normalizeJobStatus(status: string | undefined): JobStatus {
  if (status === "pending") return "scheduled";
  if (
    status === "lead" ||
    status === "scheduled" ||
    status === "dispatched" ||
    status === "in_progress" ||
    status === "completed" ||
    status === "invoiced"
  ) {
    return status;
  }
  return "lead";
}

export function isClosedJob(status: JobStatus): boolean {
  return CLOSED.includes(normalizeJobStatus(status));
}

export function isFieldJob(status: JobStatus): boolean {
  return FIELD.includes(normalizeJobStatus(status));
}

export function inviteTokenFor(member: Pick<CrewMember, "id" | "name" | "inviteToken">): string {
  if (member.inviteToken) return member.inviteToken;
  const slug = member.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return `jc_${slug || member.id}`;
}

export function crewByToken(crew: CrewMember[], token: string): CrewMember | null {
  const needle = token.trim().toLowerCase();
  return (
    crew.find((row) => inviteTokenFor(row).toLowerCase() === needle) ??
    crew.find((row) => row.id.toLowerCase() === needle) ??
    null
  );
}

export function parseReceiptAmount(text: string): number | null {
  const match = text.match(/\$?\s*(\d{1,5}(?:,\d{3})*(?:\.\d{1,2})?)/);
  if (!match) return null;
  const value = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function quoteTotal(
  labor: number,
  materials: number,
  markup = 0.18,
  taxRate = 0.075,
): number {
  const marked = (labor + materials) * (1 + markup);
  return Math.round(marked * (1 + taxRate) * 100) / 100;
}

const INBOUND: Omit<CallLog, "id" | "createdAt" | "convertedJobId">[] = [
  {
    callerName: "Rosa Bennett",
    phone: "(501) 385-0194",
    intent: "Estimate",
    summary: "Wants an exterior paint quote on Central Avenue.",
    transcript:
      "Hi, this is Rosa on Central. Can Top Gun come quote the south wall and fascia this week?",
  },
  {
    callerName: "Lakeside Market",
    phone: "(501) 385-0288",
    intent: "Emergency",
    summary: "Storefront graffiti — need cover paint today if possible.",
    transcript: "Someone tagged the front overnight. Can a crew hit us today?",
  },
  {
    callerName: "Chris Bell",
    phone: "(501) 385-0112",
    intent: "Schedule",
    summary: "Confirming Thursday window for interior doors.",
    transcript: "Just locking Thursday morning for the door package. Gate code 4412.",
  },
  {
    callerName: "Maya Ortiz",
    phone: "(501) 385-0177",
    intent: "General",
    summary: "Asking if you still do cabinets.",
    transcript: "Do y'all still spray cabinets, or is that a pass now?",
  },
];

export function simulateInboundCall(now = new Date().toISOString()): CallLog {
  const seed = Date.parse(now) || Date.now();
  const sample = INBOUND[Math.abs(seed) % INBOUND.length] ?? INBOUND[0];
  return {
    ...sample,
    id: `call-${seed}`,
    createdAt: now,
    convertedJobId: null,
  };
}

export function jobFromCall(call: CallLog): Job {
  const title =
    call.intent === "Emergency"
      ? "Emergency paint cover"
      : call.intent === "Schedule"
        ? "Scheduled interior"
        : call.intent === "Estimate"
          ? "Paint estimate"
          : "General service";
  return {
    id: `c-call-${call.id}`,
    customerName: call.callerName,
    phone: call.phone,
    address: "Hot Springs, AR",
    jobTitle: title,
    status: call.intent === "Emergency" ? "dispatched" : "lead",
    scheduledTime: call.intent === "Schedule" ? "Thu window" : "TBD",
    worker: "Unassigned",
    workerId: null,
    priority: call.intent === "Emergency" ? "high" : "medium",
    lat: 34.5037,
    lng: -93.0552,
    photos: [],
    signature: null,
    scope: call.summary,
  };
}

export function hasUnreadMessage(messages: ShopMessage[], userId: string): boolean {
  return messages.some(
    (row) => row.fromId !== userId && !(row.seenBy ?? []).includes(userId),
  );
}

export function markMessagesSeen(messages: ShopMessage[], userId: string): ShopMessage[] {
  return messages.map((row) =>
    (row.seenBy ?? []).includes(userId)
      ? row
      : { ...row, seenBy: [...(row.seenBy ?? []), userId] },
  );
}

export function buildExpense(input: {
  vendor: string;
  amount: number;
  category: ExpenseCategory;
  employeeId: string;
  jobId?: string | null;
  photoUrl?: string | null;
  now?: string;
}): Expense {
  return {
    id: `exp-${input.now ?? Date.now()}`,
    employeeId: input.employeeId,
    jobId: input.jobId ?? null,
    vendor: input.vendor,
    amount: input.amount,
    category: input.category,
    photoUrl: input.photoUrl ?? null,
    createdAt: input.now ?? new Date().toISOString(),
  };
}
