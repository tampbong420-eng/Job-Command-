"use client";

import { clockLabel, initials } from "@/lib/format";
import { scheduleOverview, scheduledHours, WEEKDAY_SHORT } from "@/lib/schedule";
import type { CrewMember, Estimate, Job, ShopMessage, TimeCard } from "@/lib/types";
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
  messages?: ShopMessage[];
  unread?: boolean;
  onBroadcast?: (body: string) => void;
}) {
  const selectedId = role === "employee" ? employeeId : member.id;

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
          : "Tap a card to put that employee on the Command desk."}
      </p>
      {crew.map((row) => (
        <EmployeeProfileCard
          key={row.id}
          member={row}
          jobs={jobs}
          estimates={estimates}
          timeCards={timeCards}
          selected={row.id === selectedId}
          onSelect={() => onSelectEmployee(row.id)}
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
  onSelect,
}: {
  member: CrewMember;
  jobs: Job[];
  estimates: Estimate[];
  timeCards: TimeCard[];
  selected: boolean;
  onSelect: () => void;
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

  return (
    <button
      type="button"
      className={`plate profile-card${selected ? " selected" : ""}`}
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
      <div className="crew-card-meta">
        <div className="live-chip">
          <p className="metric-label">Logged</p>
          <b>
            {member.weeklyHoursLogged}h / {scheduledHours(member.weeklySchedule)}h
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
      <p className="board-copy">
        {assigned.length} active job{assigned.length === 1 ? "" : "s"} · {hours}h on
        time cards · {quotes} shop estimates
      </p>
    </button>
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
