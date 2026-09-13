"use client";

import PayScheduleEditor from "@/components/PayScheduleEditor";
import { clockLabel, formatClockTime, initials, money } from "@/lib/format";
import {
  CADENCE_LABEL,
  calculateEmployeePeriod,
  extractPayRecords,
  findSheet,
  formatHours,
  localYmd,
  paySummaryLine,
  paycheckHistory,
  periodLabel,
  scheduledPaycheck,
} from "@/lib/payroll";
import { WEEKDAY_SHORT } from "@/lib/schedule";
import type {
  CrewMember,
  DaySchedule,
  Job,
  PayAudit,
  PayAuditAction,
  PayCadence,
  ShopMessage,
  TimeCard,
  Timesheet,
} from "@/lib/types";
import { useMemo, useRef, useState } from "react";

type DeskTool = "pay" | "schedule" | "history" | "log" | "extract";

const TOOLS: { id: DeskTool; label: string }[] = [
  { id: "pay", label: "Paycheck" },
  { id: "schedule", label: "Schedule" },
  { id: "history", label: "History" },
  { id: "log", label: "Log" },
  { id: "extract", label: "Extract" },
];

export default function ProfilePage({
  member,
  jobs,
  timeCards,
  timesheets = [],
  payAudits = [],
  crew,
  role,
  employeeId,
  onSelectEmployee,
  onHourlyRate,
  onPaySchedule,
  onPayCadence,
  onPayNote,
  messages,
  unread,
  onBroadcast,
}: {
  member: CrewMember;
  jobs: Job[];
  timeCards: TimeCard[];
  timesheets?: Timesheet[];
  payAudits?: PayAudit[];
  crew: CrewMember[];
  role: "employee" | "boss";
  employeeId: string;
  onSelectEmployee: (id: string) => void;
  onHourlyRate?: (id: string, rate: number) => void;
  onPaySchedule?: (id: string, schedule: DaySchedule[]) => void;
  onPayCadence?: (id: string, cadence: PayCadence) => void;
  onPayNote?: (id: string, action: PayAuditAction, detail: string) => void;
  messages?: ShopMessage[];
  unread?: boolean;
  onBroadcast?: (body: string) => void;
}) {
  const canEdit = role === "boss" && Boolean(onHourlyRate && onPaySchedule);
  const roster = role === "employee" ? crew.filter((row) => row.id === employeeId) : crew;
  const selectedId = role === "employee" ? employeeId : member.id;
  const selected = roster.find((row) => row.id === selectedId) ?? roster[0];
  const [tool, setTool] = useState<DeskTool>("pay");
  const onDate = localYmd();

  if (!selected) return null;

  return (
    <section className="page jobs-board">
      <p className="section-kicker">{role === "employee" ? "My card" : "Pay desk"}</p>
      <h1>
        {role === "employee" ? "My" : "Employee"}
        <br />
        <strong>Pay.</strong>
      </h1>
      <p className="board-copy">
        {role === "employee"
          ? "Your rate, posted week, paycheck, history, log, and extract."
          : `${roster.length} employees on this shop. Tap a name, then a tool.`}
      </p>

      {role === "boss" && (
        <div className="crew-picker" role="listbox" aria-label="Employees">
          {roster.map((row) => (
            <button
              key={row.id}
              type="button"
              role="option"
              className={`crew-pick${row.id === selected.id ? " on" : ""}`}
              aria-selected={row.id === selected.id}
              aria-label={`${row.name}, ${row.role}`}
              onClick={() => {
                onSelectEmployee(row.id);
                setTool("pay");
              }}
            >
              <span className={`crew-photo duty-${row.status}`}>
                {row.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.photoUrl} alt="" />
                ) : (
                  <span className="initials">{initials(row.name)}</span>
                )}
              </span>
              <b>{row.name.split(" ")[0]}</b>
              <small>{row.role}</small>
            </button>
          ))}
        </div>
      )}

      <label className="pay-rate-field">
        Desk tool
        <select
          className="pay-cadence"
          value={tool}
          aria-label="Pay desk tool"
          onChange={(event) => setTool(event.target.value as DeskTool)}
        >
          {TOOLS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <EmployeeDesk
        key={selected.id}
        member={selected}
        jobs={jobs}
        timeCards={timeCards}
        timesheets={timesheets}
        payAudits={payAudits}
        onDate={onDate}
        tool={tool}
        canEdit={canEdit}
        onHourlyRate={(rate) => onHourlyRate?.(selected.id, rate)}
        onPaySchedule={(schedule) => onPaySchedule?.(selected.id, schedule)}
        onPayCadence={(cadence) => onPayCadence?.(selected.id, cadence)}
        onRateLogged={(rate) =>
          onPayNote?.(selected.id, "rate", `Hourly rate set to ${rate}`)
        }
      />

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

function EmployeeDesk({
  member,
  jobs,
  timeCards,
  timesheets,
  payAudits,
  onDate,
  tool,
  canEdit,
  onHourlyRate,
  onPaySchedule,
  onPayCadence,
  onRateLogged,
}: {
  member: CrewMember;
  jobs: Job[];
  timeCards: TimeCard[];
  timesheets: Timesheet[];
  payAudits: PayAudit[];
  onDate: string;
  tool: DeskTool;
  canEdit: boolean;
  onHourlyRate: (rate: number) => void;
  onPaySchedule: (schedule: DaySchedule[]) => void;
  onPayCadence: (cadence: PayCadence) => void;
  onRateLogged: (rate: number) => void;
}) {
  const pay = calculateEmployeePeriod(member, timeCards, onDate);
  const posted = scheduledPaycheck(member);
  const lastLoggedRate = useRef(member.hourlyRate);
  const history = useMemo(
    () => paycheckHistory(member, timeCards, onDate),
    [member, timeCards, onDate],
  );
  const punches = useMemo(
    () =>
      timeCards
        .filter((row) => row.employeeId === member.id)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 10),
    [member.id, timeCards],
  );
  const log = payAudits
    .filter((row) => row.timesheetId.startsWith(`${member.id}:`))
    .slice(0, 16);
  const [fileNote, setFileNote] = useState<string | null>(null);
  const extract = extractPayRecords(member, timeCards, jobs, onDate, timesheets);
  const fileName = `${member.name.toLowerCase().replaceAll(" ", "-")}-hours-${onDate}.csv`;

  async function downloadHours() {
    const file = new File([extract], fileName, { type: "text/csv" });
    try {
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${member.name} hours`,
        });
        setFileNote("Hours file sent");
        return;
      }
    } catch {
      // Fall through to a local download if share is cancelled or missing.
    }
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    setFileNote("Hours file downloaded");
  }

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
          <span className={`status-pill ${member.status}`}>
            <span className="status-dot" />
            {clockLabel(member.status)}
          </span>
          <p>{member.phone}</p>
        </div>
      </div>

      {tool === "pay" && (
        <>
          <div className="paycheck-box">
            <p className="metric-label">{CADENCE_LABEL[pay.cadence]} paycheck</p>
            <b>{money(pay.grossPay)}</b>
            <span>{paySummaryLine(pay)}</span>
            <small>
              {periodLabel(pay.periodStart, pay.periodEnd)}
              {pay.openPunch ? " · live clock-in still counting" : ""}
            </small>
          </div>
          <div className="pay-strip">
            <div className="live-chip">
              <p className="metric-label">Worked</p>
              <b>
                {formatHours(pay.netHours)} / {formatHours(posted.plannedHours)}
              </b>
            </div>
            <div className="live-chip">
              <p className="metric-label">If posted week</p>
              <b>{money(posted.grossPay)}</b>
            </div>
          </div>
          <div className="pay-tools">
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
                  onBlur={(event) => {
                    const rate = Number(event.target.value);
                    if (!Number.isFinite(rate) || rate === lastLoggedRate.current) return;
                    lastLoggedRate.current = rate;
                    onRateLogged(rate);
                  }}
                />
                /hr
              </span>
            </label>
            <label className="pay-rate-field">
              How they get paid
              <select
                className="pay-cadence"
                value={member.payCadence ?? "weekly"}
                disabled={!canEdit}
                aria-label={`${member.name} pay cadence`}
                onChange={(event) => onPayCadence(event.target.value as PayCadence)}
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="semimonthly">Semi-monthly</option>
              </select>
            </label>
          </div>
          <p className="board-copy tight">
            {formatHours(pay.regularHours)} × {money(member.hourlyRate)}
            {pay.overtimeHours > 0
              ? ` + ${formatHours(pay.overtimeHours)} OT at ${member.overtimeMultiplier || 1.5}×`
              : ""}{" "}
            = <strong>{money(pay.grossPay)}</strong>
          </p>
        </>
      )}

      {tool === "schedule" && (
        <>
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
          <p className="metric-label">
            {canEdit ? `Change ${member.name.split(" ")[0]}’s days` : "Posted days"}
          </p>
          <PayScheduleEditor
            schedule={member.weeklySchedule}
            readOnly={!canEdit}
            onChange={onPaySchedule}
          />
        </>
      )}

      {tool === "history" && (
        <>
          <button type="button" className="ghost-action hours" onClick={downloadHours}>
            {fileNote ?? "Download hours file"}
          </button>
          <p className="metric-label">Paychecks</p>
          <ol className="record-list">
            {history.map((row) => {
              const status =
                findSheet(timesheets, member.id, row.periodStart)?.status ?? "open";
              return (
                <li key={row.periodStart} className="record-row">
                  <span>
                    {periodLabel(row.periodStart, row.periodEnd)}
                    <small>
                      {status.toUpperCase()} · {paySummaryLine(row)}
                    </small>
                  </span>
                  <b>{money(row.grossPay)}</b>
                </li>
              );
            })}
          </ol>
          <p className="metric-label">Punches</p>
          <ol className="record-list">
            {punches.length === 0 ? (
              <li className="board-copy">No punches kept for {member.name.split(" ")[0]} yet.</li>
            ) : (
              punches.map((row) => {
                const job = jobs.find((item) => item.id === row.jobId);
                return (
                  <li key={row.id} className="record-row punch">
                    <span>
                      {row.date}
                      <small>
                        {row.clockIn
                          ? `${formatClockTime(row.clockIn)}–${row.clockOut ? formatClockTime(row.clockOut) : "LIVE"}`
                          : `${row.hours}h entry`}
                        {job ? ` · ${job.jobTitle}` : ""}
                      </small>
                    </span>
                    <b>{formatHours(row.hours || 0)}</b>
                  </li>
                );
              })
            )}
          </ol>
        </>
      )}

      {tool === "log" && (
        <ol className="record-list">
          {log.length === 0 ? (
            <li className="board-copy">No pay log yet for {member.name.split(" ")[0]}.</li>
          ) : (
            log.map((row) => (
              <li key={row.id} className="record-row">
                <span>
                  {row.action.replaceAll("_", " ")}
                  <small>
                    {new Date(row.at).toLocaleString()} · {row.detail}
                  </small>
                </span>
              </li>
            ))
          )}
        </ol>
      )}

      {tool === "extract" && (
        <>
          <p className="board-copy">
            Same hours file payroll apps download: periods, regular, OT, gross, and punches.
          </p>
          <button type="button" className="ghost-action hours" onClick={downloadHours}>
            {fileNote ?? "Download hours file"}
          </button>
          <pre className="extract-box">{extract}</pre>
        </>
      )}
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
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button type="button" className="ghost-action" onClick={() => setOpen(true)}>
        Crew radio
      </button>
    );
  }
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
