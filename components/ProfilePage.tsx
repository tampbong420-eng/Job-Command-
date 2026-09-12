"use client";

import PayScheduleEditor from "@/components/PayScheduleEditor";
import { clockLabel, initials, money } from "@/lib/format";
import {
  scheduleOverview,
  scheduledHours,
  weekPayDue,
  WEEKDAY_SHORT,
} from "@/lib/schedule";
import type {
  CrewMember,
  DaySchedule,
  Estimate,
  Job,
  ShopMessage,
  TimeCard,
} from "@/lib/types";
import { useState } from "react";

export default function ProfilePage({
  member,
  jobs,
  estimates,
  timeCards,
  crew,
  role,
  employeeId,
  onSelectEmployee,
  onHourlyRate,
  onPaySchedule,
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
  messages?: ShopMessage[];
  unread?: boolean;
  onBroadcast?: (body: string) => void;
}) {
  const selectedId = role === "employee" ? employeeId : member.id;
  const canEdit = role === "boss" && Boolean(onHourlyRate && onPaySchedule);
  const payroll = crew.reduce(
    (sum, row) => sum + weekPayDue(row.weeklyHoursLogged, row.hourlyRate),
    0,
  );

  return (
    <section className="page jobs-board">
      <p className="section-kicker">Shop roster</p>
      <h1>
        Employee
        <br />
        <strong>Profiles.</strong>
      </h1>
      <p className="board-copy">
        {role === "employee"
          ? "Tap a card to clock in as that employee."
          : "Tap a card to open pay rate and the week schedule. Logged hours × rate is what you owe this week."}
      </p>
      <p className="payroll-total">
        <span>This week’s payroll</span>
        <b>{money(payroll)}</b>
      </p>
      {crew.map((row) => (
        <EmployeeProfileCard
          key={row.id}
          member={row}
          jobs={jobs}
          estimates={estimates}
          timeCards={timeCards}
          selected={row.id === selectedId}
          canEdit={canEdit}
          onSelect={() => onSelectEmployee(row.id)}
          onHourlyRate={(rate) => onHourlyRate?.(row.id, rate)}
          onPaySchedule={(schedule) => onPaySchedule?.(row.id, schedule)}
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

function EmployeeProfileCard({
  member,
  jobs,
  estimates,
  timeCards,
  selected,
  canEdit,
  onSelect,
  onHourlyRate,
  onPaySchedule,
}: {
  member: CrewMember;
  jobs: Job[];
  estimates: Estimate[];
  timeCards: TimeCard[];
  selected: boolean;
  canEdit: boolean;
  onSelect: () => void;
  onHourlyRate: (rate: number) => void;
  onPaySchedule: (schedule: DaySchedule[]) => void;
}) {
  const assigned = jobs.filter(
    (job) => job.workerId === member.id && job.status === "in_progress",
  );
  const hours = timeCards
    .filter((row) => row.employeeId === member.id)
    .reduce((sum, row) => sum + row.hours, 0);
  const quotes = estimates.filter((row) => {
    const job = jobs.find((item) => item.id === row.jobId);
    return job?.workerId === member.id;
  }).length;
  const planned = scheduledHours(member.weeklySchedule);
  const dueNow = weekPayDue(member.weeklyHoursLogged, member.hourlyRate);
  const dueIfFull = weekPayDue(planned, member.hourlyRate);

  return (
    <article
      className={`plate profile-card${selected ? " selected" : ""}`}
    >
      <button
        type="button"
        className="profile-card-select"
        aria-pressed={selected}
        onClick={onSelect}
      >
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
      </button>
      <div className="crew-card-meta">
        <div className="live-chip">
          <p className="metric-label">Logged</p>
          <b>
            {member.weeklyHoursLogged}h / {planned}h
          </b>
        </div>
        <div className="schedule-overview">
          <p className="metric-label">Week</p>
          <div className="week-strip" aria-hidden="true">
            {member.weeklySchedule.map((day) => (
              <span key={day.day} className={day.off ? "off" : "on"}>
                {WEEKDAY_SHORT[day.day]}
              </span>
            ))}
          </div>
          <b>{scheduleOverview(member.weeklySchedule)}</b>
        </div>
      </div>
      <div className="pay-strip">
        <div className="live-chip">
          <p className="metric-label">Pay this week</p>
          <b>{money(dueNow)}</b>
        </div>
        <div className="live-chip">
          <p className="metric-label">If full week</p>
          <b>{money(dueIfFull)}</b>
        </div>
      </div>
      {selected && (
        <div className="pay-editor">
          <label className="pay-rate-field">
            Hourly rate
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
                onChange={(event) => onHourlyRate(Number(event.target.value))}
              />
              /hr
            </span>
          </label>
          <p className="board-copy tight">
            {member.weeklyHoursLogged}h logged × {money(member.hourlyRate)} ={" "}
            <strong>{money(dueNow)}</strong> due now. Full schedule {planned}h ={" "}
            {money(dueIfFull)}.
          </p>
          <p className="metric-label">Pay schedule</p>
          <PayScheduleEditor
            schedule={member.weeklySchedule}
            readOnly={!canEdit}
            onChange={onPaySchedule}
          />
        </div>
      )}
      <p className="board-copy">
        {assigned.length} active job{assigned.length === 1 ? "" : "s"} · {hours}h on
        time cards · {quotes} shop estimates
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
