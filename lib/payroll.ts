import { money } from "./format";
import { scheduledHours } from "./schedule";
import type {
  CrewMember,
  PayAudit,
  PayAuditAction,
  PayCadence,
  TimeCard,
  Timesheet,
  TimesheetStatus,
} from "./types";

export const COST_CODES = [
  { id: "PAINT-LABOR", label: "Paint labor" },
  { id: "PREP-LABOR", label: "Prep labor" },
  { id: "APPR-LABOR", label: "Apprentice labor" },
  { id: "HVAC-LABOR", label: "HVAC labor" },
  { id: "ELEC-LABOR", label: "Electrical labor" },
  { id: "PLMB-LABOR", label: "Plumbing labor" },
  { id: "GEN-LABOR", label: "General labor" },
] as const;

export const CADENCE_LABEL: Record<PayCadence, string> = {
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  semimonthly: "Semi-monthly",
};

export const DEFAULT_OT_AFTER = 40;
export const DEFAULT_OT_MULTIPLIER = 1.5;
export const DEFAULT_MEAL_BREAK_AFTER = 6;
export const BIWEEKLY_EPOCH = "2026-09-07";

export type DayHours = {
  date: string;
  entries: TimeCard[];
  rawHours: number;
  breakHours: number;
  netHours: number;
  flagged: boolean;
};

export type WeekSplit = {
  weekStart: string;
  netHours: number;
  regularHours: number;
  overtimeHours: number;
};

export type EmployeePeriodPay = {
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  cadence: PayCadence;
  hourlyRate: number;
  overtimeMultiplier: number;
  regularHours: number;
  overtimeHours: number;
  breakHours: number;
  netHours: number;
  regularPay: number;
  overtimePay: number;
  grossPay: number;
  days: DayHours[];
  weeks: WeekSplit[];
  flags: string[];
  openPunch: boolean;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function ymd(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function parseYmd(date: string): { y: number; m: number; d: number } {
  const [y, m, d] = date.split("-").map(Number);
  return { y, m, d };
}

export function addDays(date: string, days: number): string {
  const { y, m, d } = parseYmd(date);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

export function todayYmd(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function localYmd(now = new Date()): string {
  return ymd(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function weekStartMonday(date: string): string {
  const { y, m, d } = parseYmd(date);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = dt.getUTCDay();
  const back = dow === 0 ? 6 : dow - 1;
  dt.setUTCDate(dt.getUTCDate() - back);
  return dt.toISOString().slice(0, 10);
}

export function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function payPeriodFor(
  cadence: PayCadence,
  onDate: string,
): { start: string; end: string } {
  if (cadence === "weekly") {
    const start = weekStartMonday(onDate);
    return { start, end: addDays(start, 6) };
  }
  if (cadence === "biweekly") {
    const epoch = Date.parse(`${BIWEEKLY_EPOCH}T00:00:00.000Z`);
    const target = Date.parse(`${onDate}T00:00:00.000Z`);
    const days = Math.floor((target - epoch) / 86_400_000);
    const into = ((days % 14) + 14) % 14;
    const start = addDays(onDate, -into);
    return { start, end: addDays(start, 13) };
  }
  const { y, m, d } = parseYmd(onDate);
  if (d <= 15) return { start: ymd(y, m, 1), end: ymd(y, m, 15) };
  return { start: ymd(y, m, 16), end: ymd(y, m, lastDayOfMonth(y, m)) };
}

export function inPeriod(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

export function roundHours(hours: number): number {
  if (!Number.isFinite(hours) || hours <= 0) return 0;
  return Math.round(hours * 100) / 100;
}

export function roundMoney(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.round(amount * 100) / 100;
}

export function splitRegularOvertime(
  netHours: number,
  overtimeAfter = DEFAULT_OT_AFTER,
): { regularHours: number; overtimeHours: number } {
  const net = roundHours(netHours);
  const cap = Math.max(0, overtimeAfter);
  const regularHours = roundHours(Math.min(net, cap));
  const overtimeHours = roundHours(Math.max(0, net - cap));
  return { regularHours, overtimeHours };
}

export function grossPay(
  regularHours: number,
  overtimeHours: number,
  hourlyRate: number,
  overtimeMultiplier = DEFAULT_OT_MULTIPLIER,
): { regularPay: number; overtimePay: number; grossPay: number } {
  const rate = Math.max(0, hourlyRate);
  const multi = Math.max(1, overtimeMultiplier);
  const regularPay = roundMoney(regularHours * rate);
  const overtimePay = roundMoney(overtimeHours * rate * multi);
  return {
    regularPay,
    overtimePay,
    grossPay: roundMoney(regularPay + overtimePay),
  };
}

export function rawShiftHours(entry: TimeCard, now = Date.now()): number {
  if (entry.clockIn) {
    const start = Date.parse(entry.clockIn);
    const end = entry.clockOut ? Date.parse(entry.clockOut) : now;
    if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
    return Math.max(0, (end - start) / 3_600_000);
  }
  return Math.max(0, entry.hours);
}

export function mealBreakHours(
  entry: TimeCard,
  rawHours: number,
  unpaidBreakMinutes: number,
): number {
  if (entry.breakMinutes != null && Number.isFinite(entry.breakMinutes)) {
    return Math.max(0, entry.breakMinutes) / 60;
  }
  if (unpaidBreakMinutes > 0 && rawHours >= DEFAULT_MEAL_BREAK_AFTER) {
    return unpaidBreakMinutes / 60;
  }
  return 0;
}

export function netEntryHours(
  entry: TimeCard,
  unpaidBreakMinutes: number,
  now = Date.now(),
): { rawHours: number; breakHours: number; netHours: number } {
  const rawHours = rawShiftHours(entry, now);
  if (entry.clockIn) {
    const breakHours = mealBreakHours(entry, rawHours, unpaidBreakMinutes);
    return {
      rawHours: roundHours(rawHours),
      breakHours: roundHours(breakHours),
      netHours: roundHours(Math.max(0, rawHours - breakHours)),
    };
  }
  return {
    rawHours: roundHours(rawHours),
    breakHours: 0,
    netHours: roundHours(rawHours),
  };
}

export function hydrateTimeCard(card: TimeCard, seed?: TimeCard): TimeCard {
  const merged = { ...seed, ...card };
  return {
    ...merged,
    clockIn: merged.clockIn ?? null,
    clockOut: merged.clockOut ?? null,
    breakMinutes: merged.breakMinutes ?? null,
    costCode: merged.costCode ?? "",
    flagged: Boolean(merged.flagged),
  };
}

export function defaultCostCode(role: string): string {
  const hay = role.toLowerCase();
  if (hay.includes("paint")) return "PAINT-LABOR";
  if (hay.includes("prep")) return "PREP-LABOR";
  if (hay.includes("apprent")) return "APPR-LABOR";
  if (hay.includes("hvac")) return "HVAC-LABOR";
  if (hay.includes("electr")) return "ELEC-LABOR";
  if (hay.includes("plumb")) return "PLMB-LABOR";
  return "GEN-LABOR";
}

export function timesheetId(employeeId: string, periodStart: string): string {
  return `${employeeId}:${periodStart}`;
}

export function emptyTimesheet(
  employeeId: string,
  periodStart: string,
  periodEnd: string,
): Timesheet {
  return {
    id: timesheetId(employeeId, periodStart),
    employeeId,
    periodStart,
    periodEnd,
    status: "open",
    approvedAt: null,
    lockedAt: null,
  };
}

export function isLocked(sheet: Timesheet | undefined): boolean {
  return sheet?.status === "locked";
}

function scheduledHoursForDate(member: CrewMember, date: string): number {
  const { y, m, d } = parseYmd(date);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const map = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  const day = member.weeklySchedule.find((row) => row.day === map[dow]);
  if (!day || day.off) return 0;
  const [sh, sm] = day.start.split(":").map(Number);
  const [eh, em] = day.end.split(":").map(Number);
  return Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60);
}

export function periodEntries(
  cards: TimeCard[],
  employeeId: string,
  start: string,
  end: string,
): TimeCard[] {
  return cards
    .filter(
      (row) =>
        row.employeeId === employeeId && inPeriod(row.date, start, end),
    )
    .sort((a, b) => {
      const byDate = a.date.localeCompare(b.date);
      if (byDate !== 0) return byDate;
      return (a.clockIn ?? "").localeCompare(b.clockIn ?? "");
    });
}

export function calculateEmployeePeriod(
  member: CrewMember,
  cards: TimeCard[],
  onDate = todayYmd(),
  now = Date.now(),
): EmployeePeriodPay {
  const cadence = member.payCadence ?? "weekly";
  const { start, end } = payPeriodFor(cadence, onDate);
  const overtimeAfter = DEFAULT_OT_AFTER;
  const multiplier = member.overtimeMultiplier || DEFAULT_OT_MULTIPLIER;
  const unpaidBreak = member.unpaidBreakMinutes ?? 30;
  const entries = periodEntries(cards, member.id, start, end);
  const byDate = new Map<string, TimeCard[]>();
  for (const entry of entries) {
    const list = byDate.get(entry.date) ?? [];
    list.push(entry);
    byDate.set(entry.date, list);
  }

  const days: DayHours[] = [];
  const flags: string[] = [];
  let openPunch = false;
  let breakHours = 0;

  for (const [date, dayEntries] of [...byDate.entries()].sort()) {
    let raw = 0;
    let brk = 0;
    let net = 0;
    let flagged = false;
    for (const entry of dayEntries) {
      const hours = netEntryHours(entry, unpaidBreak, now);
      raw += hours.rawHours;
      brk += hours.breakHours;
      net += hours.netHours;
      if (entry.flagged) flagged = true;
      if (entry.clockIn && !entry.clockOut) {
        openPunch = true;
        if (hours.rawHours > 12) {
          flags.push(`${date}: open punch still running (${hours.netHours}h)`);
          flagged = true;
        }
      }
    }
    const planned = scheduledHoursForDate(member, date);
    if (planned > 0 && net > planned + 1.5) {
      flags.push(
        `${date}: ${roundHours(net)}h vs ${roundHours(planned)}h scheduled`,
      );
      flagged = true;
    }
    breakHours += brk;
    days.push({
      date,
      entries: dayEntries,
      rawHours: roundHours(raw),
      breakHours: roundHours(brk),
      netHours: roundHours(net),
      flagged,
    });
  }

  const weekMap = new Map<string, number>();
  for (const day of days) {
    const wk = weekStartMonday(day.date);
    weekMap.set(wk, (weekMap.get(wk) ?? 0) + day.netHours);
  }
  const weeks: WeekSplit[] = [...weekMap.entries()].map(([wk, net]) => {
    const split = splitRegularOvertime(net, overtimeAfter);
    return { weekStart: wk, netHours: roundHours(net), ...split };
  });

  const regularHours = roundHours(
    weeks.reduce((sum, row) => sum + row.regularHours, 0),
  );
  const overtimeHours = roundHours(
    weeks.reduce((sum, row) => sum + row.overtimeHours, 0),
  );
  const netHours = roundHours(regularHours + overtimeHours);
  const pay = grossPay(
    regularHours,
    overtimeHours,
    member.hourlyRate,
    multiplier,
  );

  if (openPunch) flags.unshift("Open clock-in still running");

  return {
    employeeId: member.id,
    periodStart: start,
    periodEnd: end,
    cadence,
    hourlyRate: member.hourlyRate,
    overtimeMultiplier: multiplier,
    regularHours,
    overtimeHours,
    breakHours: roundHours(breakHours),
    netHours,
    ...pay,
    days,
    weeks,
    flags: [...new Set(flags)],
    openPunch,
  };
}

export function shopPayroll(
  crew: CrewMember[],
  cards: TimeCard[],
  onDate = todayYmd(),
  now = Date.now(),
): { rows: EmployeePeriodPay[]; grossPay: number; netHours: number } {
  const rows = crew.map((member) =>
    calculateEmployeePeriod(member, cards, onDate, now),
  );
  return {
    rows,
    grossPay: roundMoney(rows.reduce((sum, row) => sum + row.grossPay, 0)),
    netHours: roundHours(rows.reduce((sum, row) => sum + row.netHours, 0)),
  };
}

export function formatHours(hours: number): string {
  return `${roundHours(hours)}h`;
}

export function paySummaryLine(row: EmployeePeriodPay): string {
  if (row.overtimeHours > 0) {
    return `${formatHours(row.regularHours)} reg + ${formatHours(row.overtimeHours)} OT · ${money(row.grossPay)}`;
  }
  return `${formatHours(row.netHours)} · ${money(row.grossPay)}`;
}

export function scheduledPaycheck(member: CrewMember) {
  const planned = scheduledHours(member.weeklySchedule);
  const split = splitRegularOvertime(planned, DEFAULT_OT_AFTER);
  return {
    plannedHours: planned,
    ...split,
    ...grossPay(
      split.regularHours,
      split.overtimeHours,
      member.hourlyRate,
      member.overtimeMultiplier || DEFAULT_OT_MULTIPLIER,
    ),
  };
}

export function periodLabel(start: string, end: string): string {
  return `${start} → ${end}`;
}

export function appendPayAudit(
  audits: PayAudit[],
  member: CrewMember,
  action: PayAuditAction,
  detail: string,
  onDate = localYmd(),
  at = new Date().toISOString(),
): PayAudit[] {
  const { start } = payPeriodFor(member.payCadence ?? "weekly", onDate);
  return [audit(timesheetId(member.id, start), action, detail, null, at), ...audits];
}

export function paycheckHistory(
  member: CrewMember,
  cards: TimeCard[],
  onDate = localYmd(),
  limit = 8,
): EmployeePeriodPay[] {
  const dates = [
    onDate,
    ...cards.filter((row) => row.employeeId === member.id).map((row) => row.date),
  ]
    .filter(Boolean)
    .sort()
    .reverse();
  const seen = new Set<string>();
  const rows: EmployeePeriodPay[] = [];
  for (const date of dates) {
    const { start } = payPeriodFor(member.payCadence ?? "weekly", date);
    if (seen.has(start)) continue;
    seen.add(start);
    rows.push(calculateEmployeePeriod(member, cards, date));
    if (rows.length >= limit) break;
  }
  return rows;
}

export function extractPayRecords(
  member: CrewMember,
  cards: TimeCard[],
  jobs: { id: string; jobTitle: string }[],
  onDate = localYmd(),
  sheets: Timesheet[] = [],
): string {
  const history = paycheckHistory(member, cards, onDate);
  const punches = cards
    .filter((row) => row.employeeId === member.id)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date) || (b.clockIn ?? "").localeCompare(a.clockIn ?? ""));
  const lines = [
    `JOB COMMAND PAY EXTRACT`,
    `${member.name} · ${member.role} · ${money(member.hourlyRate)}/hr · ${CADENCE_LABEL[member.payCadence ?? "weekly"]}`,
    `Extracted ${onDate}`,
    "",
    "PERIOD START,PERIOD END,STATUS,REGULAR H,OT H,GROSS",
    ...history.map((row) => {
      const status = findSheet(sheets, member.id, row.periodStart)?.status ?? "open";
      return `${row.periodStart},${row.periodEnd},${status},${row.regularHours},${row.overtimeHours},${row.grossPay.toFixed(2)}`;
    }),
    "",
    "DATE,IN,OUT,HOURS,JOB,NOTES",
    ...punches.map((row) => {
      const job = jobs.find((item) => item.id === row.jobId);
      return [
        row.date,
        row.clockIn ?? "",
        row.clockOut ?? "LIVE",
        row.hours,
        job?.jobTitle ?? "",
        (row.notes ?? "").replaceAll(",", " "),
      ].join(",");
    }),
  ];
  return lines.join("\n");
}

function audit(
  timesheetIdValue: string,
  action: PayAuditAction,
  detail: string,
  entryId: string | null = null,
  at = new Date().toISOString(),
): PayAudit {
  return {
    id: `aud-${Date.parse(at)}-${action}-${entryId ?? timesheetIdValue}`,
    timesheetId: timesheetIdValue,
    entryId,
    at,
    action,
    detail,
  };
}

export function ensureTimesheet(
  sheets: Timesheet[],
  employeeId: string,
  start: string,
  end: string,
): Timesheet[] {
  const id = timesheetId(employeeId, start);
  if (sheets.some((row) => row.id === id)) return sheets;
  return [...sheets, emptyTimesheet(employeeId, start, end)];
}

export function findSheet(
  sheets: Timesheet[],
  employeeId: string,
  start: string,
): Timesheet | undefined {
  return sheets.find((row) => row.id === timesheetId(employeeId, start));
}

export function togglePunch(
  crew: CrewMember[],
  cards: TimeCard[],
  sheets: Timesheet[],
  audits: PayAudit[],
  employeeId: string,
  now = new Date().toISOString(),
): {
  crew: CrewMember[];
  timeCards: TimeCard[];
  timesheets: Timesheet[];
  payAudits: PayAudit[];
} {
  const member = crew.find((row) => row.id === employeeId);
  if (!member) {
    return { crew, timeCards: cards, timesheets: sheets, payAudits: audits };
  }
  const date = now.slice(0, 10);
  const { start, end } = payPeriodFor(member.payCadence ?? "weekly", date);
  const sheetId = timesheetId(employeeId, start);
  const timesheets = ensureTimesheet(sheets, employeeId, start, end);
  const sheet = findSheet(timesheets, employeeId, start);
  if (isLocked(sheet)) {
    return { crew, timeCards: cards, timesheets, payAudits: audits };
  }

  const clockingOut = member.status !== "off";
  if (clockingOut) {
    const open = [...cards]
      .reverse()
      .find(
        (row) =>
          row.employeeId === employeeId && row.clockIn && !row.clockOut,
      );
    let timeCards = cards;
    if (open) {
      const closed: TimeCard = { ...open, clockOut: now };
      const hours = netEntryHours(
        closed,
        member.unpaidBreakMinutes ?? 30,
        Date.parse(now),
      );
      closed.hours = hours.netHours;
      closed.breakMinutes =
        closed.breakMinutes ?? Math.round(hours.breakHours * 60);
      timeCards = cards.map((row) => (row.id === open.id ? closed : row));
    }
    return {
      crew: crew.map((row) =>
        row.id === employeeId
          ? { ...row, status: "off" as const, gpsLive: false }
          : row,
      ),
      timeCards,
      timesheets,
      payAudits: [
        audit(sheetId, "punch_out", `${member.name} clocked out`, open?.id ?? null, now),
        ...audits,
      ],
    };
  }

  const card: TimeCard = {
    id: `tc-${employeeId}-${Date.parse(now)}`,
    employeeId,
    jobId: member.currentJobId,
    hours: 0,
    date,
    notes: "Clock-in",
    clockIn: now,
    clockOut: null,
    breakMinutes: null,
    costCode: member.costCode || defaultCostCode(member.role),
    flagged: false,
  };
  return {
    crew: crew.map((row) =>
      row.id === employeeId
        ? {
            ...row,
            status: "active" as const,
            startedAt: now,
            gpsLive: true,
          }
        : row,
    ),
    timeCards: [card, ...cards],
    timesheets,
    payAudits: [
      audit(sheetId, "punch_in", `${member.name} clocked in`, card.id, now),
      ...audits,
    ],
  };
}

export function editTimeCard(
  cards: TimeCard[],
  sheets: Timesheet[],
  audits: PayAudit[],
  member: CrewMember,
  entryId: string,
  patch: Partial<Pick<TimeCard, "hours" | "notes" | "breakMinutes" | "costCode" | "clockIn" | "clockOut">>,
  now = new Date().toISOString(),
): { timeCards: TimeCard[]; timesheets: Timesheet[]; payAudits: PayAudit[] } | null {
  const entry = cards.find((row) => row.id === entryId);
  if (!entry) return null;
  const { start, end } = payPeriodFor(member.payCadence ?? "weekly", entry.date);
  const timesheets = ensureTimesheet(sheets, member.id, start, end);
  if (isLocked(findSheet(timesheets, member.id, start))) return null;
  const next: TimeCard = { ...entry, ...patch };
  const hours = netEntryHours(
    next,
    member.unpaidBreakMinutes ?? 30,
    Date.parse(now),
  );
  next.hours = hours.netHours;
  const detail = `Edited ${entry.date} to ${hours.netHours}h` +
    (patch.breakMinutes != null ? ` · ${patch.breakMinutes}m break` : "");
  return {
    timeCards: cards.map((row) => (row.id === entryId ? next : row)),
    timesheets,
    payAudits: [
      audit(timesheetId(member.id, start), "edit", detail, entryId, now),
      ...audits,
    ],
  };
}

export function flagTimeCard(
  cards: TimeCard[],
  sheets: Timesheet[],
  audits: PayAudit[],
  member: CrewMember,
  entryId: string,
  flagged: boolean,
  now = new Date().toISOString(),
): { timeCards: TimeCard[]; timesheets: Timesheet[]; payAudits: PayAudit[] } | null {
  const entry = cards.find((row) => row.id === entryId);
  if (!entry) return null;
  const { start, end } = payPeriodFor(member.payCadence ?? "weekly", entry.date);
  let timesheets = ensureTimesheet(sheets, member.id, start, end);
  if (isLocked(findSheet(timesheets, member.id, start))) return null;
  const nextCards = cards.map((row) =>
    row.id === entryId ? { ...row, flagged } : row,
  );
  const anyFlag = nextCards.some(
    (row) =>
      row.employeeId === member.id &&
      inPeriod(row.date, start, end) &&
      row.flagged,
  );
  timesheets = timesheets.map((row) =>
    row.id === timesheetId(member.id, start) && row.status !== "locked"
      ? {
          ...row,
          status: anyFlag ? "flagged" : row.status === "flagged" ? "open" : row.status,
        }
      : row,
  );
  return {
    timeCards: nextCards,
    timesheets,
    payAudits: [
      audit(
        timesheetId(member.id, start),
        flagged ? "flag" : "unflag",
        flagged ? `Flagged ${entry.date}` : `Cleared flag on ${entry.date}`,
        entryId,
        now,
      ),
      ...audits,
    ],
  };
}

export function setTimesheetStatus(
  sheets: Timesheet[],
  audits: PayAudit[],
  member: CrewMember,
  onDate: string,
  status: TimesheetStatus,
  now = new Date().toISOString(),
): { timesheets: Timesheet[]; payAudits: PayAudit[] } {
  const { start, end } = payPeriodFor(member.payCadence ?? "weekly", onDate);
  let timesheets = ensureTimesheet(sheets, member.id, start, end);
  const current = findSheet(timesheets, member.id, start);
  if (current?.status === "locked" && status !== "locked") {
    return { timesheets, payAudits: audits };
  }
  const action: PayAuditAction =
    status === "approved"
      ? "approve"
      : status === "locked"
        ? "lock"
        : status === "open" && current?.status === "approved"
          ? "unapprove"
          : "edit";
  timesheets = timesheets.map((row) =>
    row.id === timesheetId(member.id, start)
      ? {
          ...row,
          status,
          approvedAt: status === "approved" || status === "locked" ? (row.approvedAt ?? now) : null,
          lockedAt: status === "locked" ? now : null,
        }
      : row,
  );
  return {
    timesheets,
    payAudits: [
      audit(
        timesheetId(member.id, start),
        action,
        `${CADENCE_LABEL[member.payCadence ?? "weekly"]} timesheet ${status}`,
        null,
        now,
      ),
      ...audits,
    ],
  };
}

export function updatePayConfig(
  crew: CrewMember[],
  employeeId: string,
  patch: Partial<
    Pick<
      CrewMember,
      "hourlyRate" | "overtimeMultiplier" | "payCadence" | "unpaidBreakMinutes" | "costCode"
    >
  >,
): CrewMember[] {
  return crew.map((row) => (row.id === employeeId ? { ...row, ...patch } : row));
}

export function syncLoggedHours(
  crew: CrewMember[],
  cards: TimeCard[],
  onDate = todayYmd(),
  now = Date.now(),
): CrewMember[] {
  return crew.map((member) => {
    const week = payPeriodFor("weekly", onDate);
    const hours = periodEntries(cards, member.id, week.start, week.end).reduce(
      (sum, entry) =>
        sum + netEntryHours(entry, member.unpaidBreakMinutes ?? 30, now).netHours,
      0,
    );
    return { ...member, weeklyHoursLogged: roundHours(hours) };
  });
}

function shiftStartIso(today: string, start: string): string {
  const [hours, minutes] = start.split(":").map(Number);
  const h = Number.isFinite(hours) ? hours : 7;
  const m = Number.isFinite(minutes) ? minutes : 0;
  return `${today}T${pad(Math.min(23, h + 7))}:${pad(m)}:00.000Z`;
}

export function refreshStaleShifts(
  crew: CrewMember[],
  cards: TimeCard[],
  now = new Date(),
): { crew: CrewMember[]; timeCards: TimeCard[] } {
  const today = localYmd(now);
  let timeCards = cards.map((row) => hydrateTimeCard(row));

  timeCards = timeCards.map((row) => {
    if (!row.clockIn || row.clockOut) return row;
    const punchDay = row.date || row.clockIn.slice(0, 10);
    if (punchDay >= today) return row;
    const member = crew.find((item) => item.id === row.employeeId);
    const closeAt = `${punchDay}T23:00:00.000Z`;
    const closed: TimeCard = { ...row, clockOut: closeAt };
    const hours = netEntryHours(
      closed,
      member?.unpaidBreakMinutes ?? 30,
      Date.parse(closeAt),
    );
    closed.hours = hours.netHours;
    closed.breakMinutes =
      closed.breakMinutes ?? Math.round(hours.breakHours * 60);
    return closed;
  });

  const nextCrew = crew.map((member) => {
    if (member.status === "off") return member;
    const startedDay = member.startedAt?.slice(0, 10);
    if (startedDay && startedDay >= today) return member;
    const day = member.weeklySchedule.find((row) => {
      const { y, m, d } = parseYmd(today);
      const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
      const map = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
      return row.day === map[dow];
    });
    const start = day && !day.off ? day.start : "07:00";
    const startedAt = shiftStartIso(today, start);
    const startMs = Date.parse(startedAt);
    return {
      ...member,
      startedAt:
        Number.isFinite(startMs) && startMs > now.getTime()
          ? new Date(Math.max(0, now.getTime() - 2 * 3_600_000)).toISOString()
          : startedAt,
    };
  });

  for (const member of nextCrew) {
    if (member.status === "off") continue;
    const hasOpenToday = timeCards.some(
      (row) =>
        row.employeeId === member.id &&
        !row.clockOut &&
        (row.date === today || row.clockIn?.slice(0, 10) === today),
    );
    if (hasOpenToday) continue;
    timeCards = [
      {
        id: `tc-${member.id}-${today}-live`,
        employeeId: member.id,
        jobId: member.currentJobId,
        hours: 0,
        date: today,
        notes: "Clock-in",
        clockIn: member.startedAt,
        clockOut: null,
        breakMinutes: null,
        costCode: member.costCode || defaultCostCode(member.role),
        flagged: false,
      },
      ...timeCards,
    ];
  }

  return {
    crew: syncLoggedHours(nextCrew, timeCards, today, now.getTime()),
    timeCards,
  };
}
