import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateEmployeePeriod,
  editTimeCard,
  grossPay,
  netEntryHours,
  payPeriodFor,
  setTimesheetStatus,
  splitRegularOvertime,
  togglePunch,
  weekStartMonday,
  refreshStaleShifts,
} from "../lib/payroll";
import { weekdayHours } from "../lib/schedule";
import type { CrewMember, TimeCard } from "../lib/types";

const mike: CrewMember = {
  id: "e-mike",
  name: "Mike Reyes",
  role: "HVAC Lead",
  phone: "",
  photoUrl: "",
  status: "off",
  currentJob: "Unit 4B",
  currentJobId: "c-northline",
  startedAt: null,
  weeklyHoursTarget: 40,
  weeklyHoursLogged: 0,
  hourlyRate: 48,
  overtimeMultiplier: 1.5,
  payCadence: "weekly",
  unpaidBreakMinutes: 30,
  costCode: "HVAC-LABOR",
  weeklySchedule: weekdayHours("07:00", "16:00"),
  lat: null,
  lng: null,
  gpsLive: false,
};

test("payPeriodFor weekly is Monday through Sunday", () => {
  assert.deepEqual(payPeriodFor("weekly", "2026-09-12"), {
    start: "2026-09-07",
    end: "2026-09-13",
  });
  assert.equal(weekStartMonday("2026-09-13"), "2026-09-07");
});

test("payPeriodFor biweekly and semi-monthly", () => {
  assert.deepEqual(payPeriodFor("biweekly", "2026-09-12"), {
    start: "2026-09-07",
    end: "2026-09-20",
  });
  assert.deepEqual(payPeriodFor("semimonthly", "2026-09-12"), {
    start: "2026-09-01",
    end: "2026-09-15",
  });
  assert.deepEqual(payPeriodFor("semimonthly", "2026-09-20"), {
    start: "2026-09-16",
    end: "2026-09-30",
  });
});

test("splitRegularOvertime uses the 40 hour weekly threshold", () => {
  assert.deepEqual(splitRegularOvertime(43), {
    regularHours: 40,
    overtimeHours: 3,
  });
  assert.deepEqual(grossPay(40, 3, 48, 1.5), {
    regularPay: 1920,
    overtimePay: 216,
    grossPay: 2136,
  });
});

test("netEntryHours subtracts a 30 minute meal break from punches over 6h", () => {
  const entry: TimeCard = {
    id: "tc-1",
    employeeId: "e-mike",
    jobId: "c-northline",
    hours: 0,
    date: "2026-09-07",
    notes: "",
    clockIn: "2026-09-07T14:00:00.000Z",
    clockOut: "2026-09-07T23:00:00.000Z",
    breakMinutes: 30,
    costCode: "HVAC-LABOR",
  };
  assert.deepEqual(netEntryHours(entry, 30), {
    rawHours: 9,
    breakHours: 0.5,
    netHours: 8.5,
  });
});

test("calculateEmployeePeriod rolls daily hours into weekly OT", () => {
  const cards: TimeCard[] = [
    {
      id: "a",
      employeeId: "e-mike",
      jobId: null,
      hours: 8,
      date: "2026-09-07",
      notes: "",
    },
    {
      id: "b",
      employeeId: "e-mike",
      jobId: null,
      hours: 8,
      date: "2026-09-08",
      notes: "",
    },
    {
      id: "c",
      employeeId: "e-mike",
      jobId: null,
      hours: 8,
      date: "2026-09-09",
      notes: "",
    },
    {
      id: "d",
      employeeId: "e-mike",
      jobId: null,
      hours: 8,
      date: "2026-09-10",
      notes: "",
    },
    {
      id: "e",
      employeeId: "e-mike",
      jobId: null,
      hours: 10,
      date: "2026-09-11",
      notes: "",
    },
  ];
  const row = calculateEmployeePeriod(mike, cards, "2026-09-12", Date.parse("2026-09-12T18:00:00.000Z"));
  assert.equal(row.netHours, 42);
  assert.equal(row.regularHours, 40);
  assert.equal(row.overtimeHours, 2);
  assert.equal(row.grossPay, 2064);
  assert.equal(row.days.length, 5);
});

test("togglePunch opens and closes a clock-in against the timesheet", () => {
  const inPunch = togglePunch([mike], [], [], [], "e-mike", "2026-09-12T14:00:00.000Z");
  assert.equal(inPunch.crew[0].status, "active");
  assert.equal(inPunch.timeCards[0].clockIn, "2026-09-12T14:00:00.000Z");
  assert.equal(inPunch.timeCards[0].clockOut, null);
  const outPunch = togglePunch(
    inPunch.crew,
    inPunch.timeCards,
    inPunch.timesheets,
    inPunch.payAudits,
    "e-mike",
    "2026-09-12T22:30:00.000Z",
  );
  assert.equal(outPunch.crew[0].status, "off");
  assert.equal(outPunch.timeCards[0].clockOut, "2026-09-12T22:30:00.000Z");
  assert.equal(outPunch.timeCards[0].hours, 8);
  assert.equal(outPunch.payAudits[0].action, "punch_out");
});

test("approve then lock a timesheet, and block later edits", () => {
  const approved = setTimesheetStatus([], [], mike, "2026-09-12", "approved", "2026-09-12T18:00:00.000Z");
  assert.equal(approved.timesheets[0].status, "approved");
  const locked = setTimesheetStatus(
    approved.timesheets,
    approved.payAudits,
    mike,
    "2026-09-12",
    "locked",
    "2026-09-12T18:05:00.000Z",
  );
  assert.equal(locked.timesheets[0].status, "locked");
  const edited = editTimeCard(
    [
      {
        id: "tc-1",
        employeeId: "e-mike",
        jobId: null,
        hours: 8,
        date: "2026-09-07",
        notes: "",
      },
    ],
    locked.timesheets,
    locked.payAudits,
    mike,
    "tc-1",
    { hours: 9 },
  );
  assert.equal(edited, null);
});

test("refreshStaleShifts closes yesterday's open punches and starts today", () => {
  const now = new Date(2026, 8, 14, 12, 0, 0);
  const today = `${now.getFullYear()}-09-14`;
  const result = refreshStaleShifts(
    [{ ...mike, status: "active", startedAt: "2026-09-12T14:05:00.000Z" }],
    [
      {
        id: "tc-mike-live",
        employeeId: "e-mike",
        jobId: "c-northline",
        hours: 0,
        date: "2026-09-12",
        notes: "Clock-in",
        clockIn: "2026-09-12T14:05:00.000Z",
        clockOut: null,
        breakMinutes: null,
        costCode: "HVAC-LABOR",
        flagged: false,
      },
    ],
    now,
  );
  const closed = result.timeCards.find((row) => row.id === "tc-mike-live");
  const live = result.timeCards.find((row) => row.id === `tc-e-mike-${today}-live`);
  assert.equal(closed?.clockOut, "2026-09-12T23:00:00.000Z");
  assert.ok((closed?.hours ?? 0) > 0);
  assert.equal(live?.clockOut, null);
  assert.equal(result.crew[0]?.startedAt?.slice(0, 10), today);
});
