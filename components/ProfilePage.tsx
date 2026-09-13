"use client";

import PayScheduleEditor from "@/components/PayScheduleEditor";
import { assignedJobs } from "@/lib/assign";
import { clockLabel, initials, money } from "@/lib/format";
import {
  CADENCE_LABEL,
  calculateEmployeePeriod,
  formatHours,
  localYmd,
  paySummaryLine,
  scheduledPaycheck,
  shopPayroll,
} from "@/lib/payroll";
import { WEEKDAY_SHORT } from "@/lib/schedule";
import type {
  CrewMember,
  DaySchedule,
  Estimate,
  Job,
  PayCadence,
  ShopMessage,
  TimeCard,
} from "@/lib/types";
import { useMemo, useState } from "react";

export default function ProfilePage({
  jobs,
  estimates,
  timeCards,
  crew,
  role,
  employeeId,
  onSelectEmployee,
  onHourlyRate,
  onPaySchedule,
  onPayCadence,
  messages,
  unread,
  onBroadcast,
}: {
  member: CrewMember;
  jobs: Job[];
  estimates: Estimate[];
  timeCards: TimeCard[];
  crew: CrewMember[];
  role: "employee" | "boss";
  employeeId: string;
  onSelectEmployee: (id: string) => void;
  onHourlyRate?: (id: string, rate: number) => void;
  onPaySchedule?: (id: string, schedule: DaySchedule[]) => void;
  onPayCadence?: (id: string, cadence: PayCadence) => void;
  messages?: ShopMessage[];
  unread?: boolean;
  onBroadcast?: (body: string) => void;
}) {
  const canEdit = role === "boss" && Boolean(onHourlyRate && onPaySchedule);
  const onDate = localYmd();
  const payroll = useMemo(
    () => shopPayroll(crew, timeCards, onDate),
    [crew, timeCards, onDate],
  );
  const roster = role === "employee" ? crew.filter((row) => row.id === employeeId) : crew;

  return (
    <section className="page jobs-board">
      <p className="section-kicker">{role === "employee" ? "My card" : "Pay desk"}</p>
      <h1>
        {role === "employee" ? "My" : "Employee"}
        <br />
        <strong>{role === "employee" ? "Pay." : "Pay cards."}</strong>
      </h1>
      <p className="board-copy">
        {role === "employee"
          ? "Your rate, posted week, and this period’s paycheck."
          : "Every card is that person’s rate, week, and paycheck. Change Dana, Sam, Liv, or Mike on their own card — not just the one on Main Command."}
      </p>
      {role === "boss" && (
        <p className="payroll-total">
          <span>Shop paycheck this period</span>
          <b>{money(payroll.grossPay)}</b>
        </p>
      )}
      {roster.map((row) => (
        <EmployeePayCard
          key={row.id}
          member={row}
          jobs={jobs}
          estimates={estimates}
          timeCards={timeCards}
          onDate={onDate}
          canEdit={canEdit}
          onFocus={() => onSelectEmployee(row.id)}
          onHourlyRate={(rate) => onHourlyRate?.(row.id, rate)}
          onPaySchedule={(schedule) => onPaySchedule?.(row.id, schedule)}
          onPayCadence={(cadence) => onPayCadence?.(row.id, cadence)}
        />
      ))}
      {onBroadcast && (
        <RadioBox
          messages={messages ?? []}
          crew={crew}
          unread={Boolean(unread)}
          onBroadcast={onBroadcast}
        />
      )}
    </section>
  );
}

function EmployeePayCard({
  member,
  jobs,
  estimates,
  timeCards,
  onDate,
  canEdit,
  onFocus,
  onHourlyRate,
  onPaySchedule,
  onPayCadence,
}: {
  member: CrewMember;
  jobs: Job[];
  estimates: Estimate[];
  timeCards: TimeCard[];
  onDate: string;
  canEdit: boolean;
  onFocus: () => void;
  onHourlyRate: (rate: number) => void;
  onPaySchedule: (schedule: DaySchedule[]) => void;
  onPayCadence: (cadence: PayCadence) => void;
}) {
  const [open, setOpen] = useState(true);
  const pay = calculateEmployeePeriod(member, timeCards, onDate);
  const posted = scheduledPaycheck(member);
  const stops = assignedJobs(jobs, member.id);
  const quotes = estimates.filter((row) => {
    const job = jobs.find((item) => item.id === row.jobId);
    return job?.workerId === member.id;
  }).length;

  return (
    <article className="plate profile-card pay-card">
      <div className="rolodex-person">
        <div className={`crew-photo duty-${member.status}`}>
          {member.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={member.photoUrl} alt="" />
          ) : (
            <span className="initials">{initials(member.name)}</span>
          )}
        </div>
        <div className="rolodex-copy">
          <p className="card-label">{member.role}</p>
          <h2>{member.name}</h2>
          <p>{member.phone}</p>
        </div>
        <span className={`status-pill ${member.status}`}>
          <span className="status-dot" />
          {clockLabel(member.status)}
        </span>
      </div>

      <div className="paycheck-box">
        <p className="metric-label">{CADENCE_LABEL[pay.cadence]} paycheck</p>
        <b>{money(pay.grossPay)}</b>
        <span>{paySummaryLine(pay)}</span>
        {pay.openPunch && (
          <small>Live clock-in is still counting on this check.</small>
        )}
      </div>

      <div className="pay-strip">
        <div className="live-chip">
          <p className="metric-label">Worked</p>
          <b>
            {formatHours(pay.netHours)} / {formatHours(posted.plannedHours)}
          </b>
        </div>
        <div className="live-chip">
          <p className="metric-label">If they work the posted week</p>
          <b>{money(posted.grossPay)}</b>
        </div>
      </div>

      <div className="schedule-overview">
        <p className="metric-label">Posted week</p>
        <div className="week-strip" aria-hidden="true">
          {member.weeklySchedule.map((day) => (
            <span key={day.day} className={day.off ? "off" : "on"}>
              {WEEKDAY_SHORT[day.day]}
            </span>
          ))}
        </div>
      </div>

      <div className="pay-tools">
        <label className="pay-rate-field">
          {member.name.split(" ")[0]}’s hourly rate
          <span>
            $
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={Number.isFinite(member.hourlyRate) ? member.hourlyRate : 0}
              disabled={!canEdit}
              aria-label={`${member.name} hourly rate`}
              onFocus={onFocus}
              onChange={(event) => onHourlyRate(Number(event.target.value))}
            />
            /hr
          </span>
        </label>
        <label className="pay-rate-field">
          Pay schedule
          <select
            className="pay-cadence"
            value={member.payCadence ?? "weekly"}
            disabled={!canEdit}
            aria-label={`${member.name} pay schedule`}
            onFocus={onFocus}
            onChange={(event) => onPayCadence(event.target.value as PayCadence)}
          >
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="semimonthly">Semi-monthly</option>
          </select>
        </label>
      </div>

      <button
        type="button"
        className="ghost-action hours"
        aria-expanded={open}
        onClick={() => {
          onFocus();
          setOpen((value) => !value);
        }}
      >
        {open ? "Hide" : "Edit"} {member.name.split(" ")[0]}’s week
      </button>

      {open && (
        <div className="pay-editor">
          <p className="metric-label">
            {canEdit
              ? `Change ${member.name.split(" ")[0]}’s days and hours`
              : "Posted days and hours"}
          </p>
          <PayScheduleEditor
            schedule={member.weeklySchedule}
            readOnly={!canEdit}
            onChange={onPaySchedule}
          />
        </div>
      )}

      <p className="board-copy tight">
        {formatHours(pay.regularHours)} × {money(member.hourlyRate)}
        {pay.overtimeHours > 0
          ? ` + ${formatHours(pay.overtimeHours)} OT × ${money(member.hourlyRate)} × ${member.overtimeMultiplier || 1.5}`
          : ""}{" "}
        = <strong>{money(pay.grossPay)}</strong>
      </p>
      <p className="board-copy">
        {stops.length === 0
          ? "No active jobs locked"
          : stops
              .map((job) => `#${job.routeOrder ?? "—"} ${job.customerName}`)
              .join(" · ")}
        {" · "}
        {quotes} estimate{quotes === 1 ? "" : "s"}
      </p>
    </article>
  );
}

function RadioBox({
  messages,
  crew,
  unread,
  onBroadcast,
}: {
  messages: ShopMessage[];
  crew: CrewMember[];
  unread: boolean;
  onBroadcast: (body: string) => void;
}) {
  const [body, setBody] = useState("");
  return (
    <article className="plate settings-card">
      <p className="card-label">Crew radio</p>
      <textarea
        className="talk-input"
        rows={2}
        value={body}
        placeholder="Weather delay, gate code, wrap exteriors…"
        onChange={(event) => setBody(event.target.value)}
      />
      <button
        type="button"
        className={`lock-button locked${unread ? " alert-glow" : ""}`}
        disabled={!body.trim()}
        onClick={() => {
          onBroadcast(body.trim());
          setBody("");
        }}
      >
        <span>
          <small>All phones</small>
          <b>PAGE CREW</b>
        </span>
      </button>
      {messages.slice(0, 4).map((row) => (
        <p key={row.id} className="board-copy tight">
          {crew.find((item) => item.id === row.fromId)?.name.split(" ")[0] ?? "Desk"}: {row.body}
        </p>
      ))}
    </article>
  );
}
