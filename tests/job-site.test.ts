import { test } from "node:test";
import assert from "node:assert/strict";
import { CREW, ESTIMATES, JOBS, TIMECARDS } from "../lib/demo-data";
import {
  chatsForJob,
  crewOnJob,
  jobScope,
  jobSiteSmsHref,
  parseChatAmount,
  postJobChat,
} from "../lib/job-site";

const northline = JOBS.find((job) => job.id === "c-northline");
const hale = JOBS.find((job) => job.id === "c-hale");
const vasquez = JOBS.find((job) => job.id === "c-vasquez");

test("jobScope uses the same written scope on estimate and field cards", () => {
  assert.ok(northline);
  assert.ok(hale);
  assert.match(jobScope(northline), /Unit 4B/);
  assert.equal(jobScope(hale), hale.scope);
});

test("crewOnJob includes the locked worker, anyone pinned to the stop, and helpers with hours", () => {
  assert.ok(northline);
  const onSite = crewOnJob(northline, CREW, TIMECARDS).map((row) => row.id);
  assert.ok(onSite.includes("e-mike"));
  assert.ok(onSite.includes("e-liv"));
  assert.equal(onSite.includes("e-dana"), false);
});

test("jobSiteSmsHref texts every phone on that job", () => {
  assert.ok(northline);
  const href = jobSiteSmsHref(northline, CREW, TIMECARDS);
  assert.ok(href);
  assert.match(href, /^sms:/);
  assert.match(href, /2065550130/);
  assert.match(href, /2065550144/);
  assert.match(href, /body=/);
});

test("unassigned jobs with no hours have nobody to text", () => {
  assert.ok(vasquez);
  assert.equal(jobSiteSmsHref(vasquez, CREW, TIMECARDS), null);
});

test("parseChatAmount reads a typed dollar figure or $ in the note", () => {
  assert.equal(parseChatAmount("needs paint", "1800"), 1800);
  assert.equal(parseChatAmount("Quote $4,200 cedar fence"), 4200);
  assert.equal(parseChatAmount("no price yet"), 0);
});

test("postJobChat records the line and files an estimate when a price is given", () => {
  assert.ok(hale);
  const result = postJobChat({
    chats: [],
    estimates: ESTIMATES,
    job: hale,
    fromId: "boss",
    fromName: "Boss command",
    body: "Updated fence package $4500",
    now: "2026-09-14T12:00:00.000Z",
  });
  const chat = chatsForJob(result.chats, hale.id)[0];
  assert.equal(chat.body.includes("4500"), true);
  assert.equal(chat.amount, 4500);
  assert.equal(result.estimates[0]?.amount, 4500);
  assert.equal(result.estimates[0]?.jobId, hale.id);
  assert.equal(result.estimates[0]?.notes.includes("fence"), true);
});

test("postJobChat can log a note without filing a new estimate", () => {
  assert.ok(hale);
  const result = postJobChat({
    chats: [],
    estimates: ESTIMATES,
    job: hale,
    fromId: "boss",
    fromName: "Boss command",
    body: "Customer wants the gate to swing in.",
    now: "2026-09-14T12:05:00.000Z",
  });
  assert.equal(result.chats[0]?.amount, undefined);
  assert.equal(result.estimates.length, ESTIMATES.length);
});
