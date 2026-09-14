import { test } from "node:test";
import assert from "node:assert/strict";
import {
  compactDayRange,
  formatHourLabel,
  patchDay,
  scheduleOverview,
  scheduledHours,
  weekPayDue,
  weekdayHours,
} from "../lib/schedule";
import {
  jobStatusAction,
  jobStatusLabel,
  jobTone,
  nextActionLabel,
  nextJobStatus,
} from "../lib/format";

test("weekdayHours marks weekend off by default", () => {
  const week = weekdayHours("07:00", "16:00");
  assert.equal(week[0].off, false);
  assert.equal(week[5].off, true);
  assert.equal(week[6].off, true);
  assert.equal(scheduledHours(week), 45);
});

test("weekPayDue multiplies logged hours by the hourly rate", () => {
  assert.equal(weekPayDue(4.5, 48), 216);
  assert.equal(weekPayDue(8, 42), 336);
  assert.equal(weekPayDue(-2, 40), 0);
});

test("scheduleOverview compresses a uniform weekday block", () => {
  assert.equal(
    scheduleOverview(weekdayHours("07:00", "16:00")),
    "MON–FRI · 7 AM–4 PM",
  );
});

test("patchDay can flip a Saturday on", () => {
  const next = patchDay(weekdayHours("08:00", "12:00"), "sat", { off: false });
  assert.equal(next[5].off, false);
  assert.equal(compactDayRange(["mon", "wed", "fri"]), "MON · WED · FRI");
  assert.equal(formatHourLabel("13:30"), "1:30 PM");
});

test("job tones follow the painting status hierarchy", () => {
  assert.equal(jobTone("lead"), "tone-lead");
  assert.equal(jobTone("pending"), "tone-pending");
  assert.equal(jobTone("in_progress"), "tone-active");
  assert.equal(jobTone("completed"), "tone-done");
  assert.equal(jobStatusLabel("lead"), "New");
  assert.equal(jobStatusLabel("pending"), "Estimate out");
  assert.equal(jobStatusLabel("in_progress"), "Painting");
  assert.equal(jobStatusLabel("completed"), "Paid");
  assert.deepEqual(jobStatusAction("lead"), { action: "New", hint: "Call" });
  assert.deepEqual(jobStatusAction("pending"), { action: "Estimate", hint: "Out" });
  assert.deepEqual(jobStatusAction("in_progress"), { action: "Painting", hint: "On job" });
  assert.deepEqual(jobStatusAction("completed"), { action: "Paid", hint: "Done" });
});

test("green next-step verbs never name a finished status", () => {
  assert.equal(nextActionLabel("lead"), "Send estimate");
  assert.equal(nextActionLabel("pending"), "They said yes");
  assert.equal(nextActionLabel("in_progress"), "Mark paid");
  assert.equal(nextActionLabel("completed"), null);
  assert.equal(nextJobStatus("lead"), "pending");
  assert.equal(nextJobStatus("pending"), "in_progress");
  assert.equal(nextJobStatus("in_progress"), "completed");
  assert.equal(nextJobStatus("completed"), null);
});
