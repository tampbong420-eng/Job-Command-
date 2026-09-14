import { test } from "node:test";
import assert from "node:assert/strict";
import { applyCommand, jobsMarkedForDelete, matchJob, parseTalk } from "../lib/commands";
import { CREW, ESTIMATES, JOBS, TIMECARDS } from "../lib/demo-data";
import type { ShopSnapshot } from "../lib/types";

const snapshot: ShopSnapshot = {
  jobs: JOBS,
  crew: CREW,
  estimates: ESTIMATES,
  timeCards: TIMECARDS,
  selectedJobId: "c-northline",
  selectedCrewId: "e-mike",
};

test("jobsMarkedForDelete lists every customer a delete command would remove", () => {
  const marked = jobsMarkedForDelete(JOBS, [
    { type: "delete_job", query: "Jordan Ellis" },
    { type: "set_status", query: "Pat", status: "pending" },
    { type: "delete_job", query: "c-shah" },
  ]);
  assert.deepEqual(
    marked.map((job) => job.id),
    ["c-chen", "c-shah"],
  );
});

test("customer cards can move a lead to pending", () => {
  const result = applyCommand(snapshot, {
    type: "set_status",
    query: "c-shah",
    status: "pending",
  });
  assert.equal(result.state.jobs.find((job) => job.id === "c-shah")?.status, "pending");
  assert.equal(result.notice.includes("Estimate"), true);
});

test("finished and delete take a customer off the board", () => {
  const finished = applyCommand(snapshot, {
    type: "set_status",
    query: "Rhodes",
    status: "completed",
  });
  assert.equal(
    finished.state.jobs.find((job) => job.id === "c-northline")?.status,
    "completed",
  );
  assert.equal(finished.notice.includes("Paid"), true);
  const gone = applyCommand(snapshot, { type: "delete_job", query: "Jordan Ellis" });
  assert.equal(gone.state.jobs.some((job) => job.id === "c-chen"), false);
});

test("talk files an estimate onto the named customer", () => {
  const talk = parseTalk("estimate $1800 for Pat Hamilton", snapshot);
  assert.deepEqual(talk.commands[0], {
    type: "create_estimate",
    query: "Pat Hamilton",
    amount: 1800,
  });
  const filed = applyCommand(snapshot, talk.commands[0]);
  assert.equal(filed.state.estimates[0]?.amount, 1800);
  assert.equal(filed.state.estimates[0]?.jobId, "c-shah");
  assert.equal(filed.view, "estimates");
});

test("talk logs a time card onto the named crew member", () => {
  const talk = parseTalk("log 8 hours for Dana on Cedar", snapshot);
  assert.equal(talk.commands[0]?.type, "create_timecard");
  const filed = applyCommand(snapshot, talk.commands[0]);
  assert.equal(filed.state.timeCards[0]?.hours, 8);
  assert.equal(filed.state.timeCards[0]?.employeeId, "e-dana");
  assert.equal(
    filed.state.crew.find((row) => row.id === "e-dana")?.weeklyHoursLogged,
    40,
  );
});

test("create_job adds a new lead onto the board", () => {
  const filed = applyCommand(snapshot, {
    type: "create_job",
    customerName: "Rivera Roofing",
    address: "90 Yesler Way",
    jobTitle: "Flashing repair",
    phone: "(206) 555-0199",
    status: "lead",
  });
  const lead = filed.state.jobs[0];
  assert.equal(lead?.customerName, "Rivera Roofing");
  assert.equal(lead?.status, "lead");
  assert.equal(lead?.jobTitle, "Flashing repair");
  assert.equal(filed.view, "jobs");
});

test("talk adds a spoken new lead", () => {
  const talk = parseTalk("new lead for Rivera at 90 Yesler Way for flashing", snapshot);
  assert.equal(talk.commands[0]?.type, "create_job");
});

test("talk marks a customer pending from spoken copy", () => {
  const talk = parseTalk("mark Pat pending", snapshot);
  assert.deepEqual(talk.commands[0], {
    type: "set_status",
    query: "Pat",
    status: "pending",
  });
  assert.equal(matchJob(JOBS, "Pat")?.id, "c-shah");
});

test("talk can mark a painting job paid", () => {
  const talk = parseTalk("mark Kim paid", snapshot);
  assert.equal(talk.commands[0]?.type, "set_status");
  if (talk.commands[0]?.type === "set_status") {
    assert.equal(talk.commands[0].status, "completed");
  }
});

test("talk they said yes moves estimate out into painting", () => {
  const talk = parseTalk("they said yes on Jordan", snapshot);
  assert.deepEqual(talk.commands[0], {
    type: "set_status",
    query: "Jordan",
    status: "in_progress",
  });
});

test("send_message pages the crew", () => {
  const filed = applyCommand(snapshot, {
    type: "send_message",
    body: "Wrap exteriors.",
  });
  assert.equal(filed.state.messages?.[0]?.body, "Wrap exteriors.");
  assert.equal(filed.notice, "Crew paged.");
});
