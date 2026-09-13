"use client";

import { clockLabel, formatClockTime, initials, money } from "@/lib/format";
import {
  CADENCE_LABEL,
  COST_CODES,
  calculateEmployeePeriod,
  findSheet,
  formatHours,
  payPeriodFor,
  paySummaryLine,
  periodLabel,
  shopPayroll,
  todayYmd,
} from "@/lib/payroll";
import type {
  CrewMember,
  Job,
  PayAudit,
  PayCadence,
  TimeCard,
  Timesheet,
  TimesheetStatus,
} from "@/lib/types";
import { useMemo, useState, type ReactNode } from "react";

export default function PayrollBoard({
  crew,
  jobs,
  timeCards,
  timesheets,
  payAudits,
  onBack,
  onPayCadence,
  onEditEntry,
  onFlagEntry,
  onTimesheetStatus,
  children,
}: {
  crew: CrewMember[];
  jobs: Job[];
  timeCards: TimeCard[];
  timesheets: Timesheet[];
  payAudits: PayAudit[];
  onBack?: () => void;
  onPayCadence: (id: string, cadence: PayCadence) => void;
  onEditEntry: (
    member: CrewMember,
    entryId: string,
    patch: Partial<Pick<TimeCard, "hours" | "breakMinutes" | "notes" | "costCode" | "clockIn" | "clockOut">>,
  ) => void;
  onFlagEntry: (member: CrewMember, entryId: string, flagged: boolean) => void;
  onTimesheetStatus: (member: CrewMember, status: TimesheetStatus) => void;
  children?: ReactNode;
}) {
  const onDate = todayYmd();
  const rollup = useMemo(
    () => shopPayroll(crew, timeCards, onDate),
    [crew, timeCards, onDate],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = crew.find((row) => row.id === selectedId) ?? null;
  const selectedPay = selected
    ? calculateEmployeePeriod(selected, timeCards, onDate)
    : null;
  const sheet = selected
    ? findSheet(
        timesheets,
        selected.id,
        payPeriodFor(selected.payCadence ?? "weekly", onDate).start,
      )
    : undefined;

  if (selected && selectedPay) {
    const locked = sheet?.status === "locked";
    const audits = payAudits
      .filter((row) => row.timesheetId === `${selected.id}:${selectedPay.periodStart}`)
      .slice(0, 8);
    return (
      <section className="page jobs-board">
        {children}
        <button type="button" className="text-back" onClick={() => setSelectedId(null)}>
          ← Hours
        </button>
        <p className="section-kicker">{CADENCE_LABEL[selectedPay.cadence]} pay period</p>
        <h1>
          {selected.name.split(" ")[0]}
          <br />
          <strong>Timesheet.</strong>
        </h1>
        <p className="board-copy">
          {periodLabel(selectedPay.periodStart, selectedPay.periodEnd)} ·{" "}
          {selectedPay.hourlyRate}/hr · {selectedPay.overtimeMultiplier}× OT after{" "}
          {selected.weeklyHoursTarget || 40}h
        </p>
        <p className="payroll-total">
          <span>
            {formatHours(selectedPay.regularHours)} reg
            {selectedPay.overtimeHours > 0
              ? ` · ${formatHours(selectedPay.overtimeHours)} OT`
              : ""}
          </span>
          <b>{money(selectedPay.grossPay)}</b>
        </p>
        <label className="pay-rate-field">
          Pay schedule
          <select
            className="pay-cadence"
            value={selected.payCadence ?? "weekly"}
            disabled={locked}
            onChange={(event) =>
              onPayCadence(selected.id, event.target.value as PayCadence)
            }
          >
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="semimonthly">Semi-monthly</option>
          </select>
        </label>
        <p className={`status-pill ${sheet?.status === "locked" ? "off" : sheet?.status === "approved" ? "active" : sheet?.status === "flagged" ? "break" : "active"}`}>
          <span className="status-dot" />
          {(sheet?.status ?? "open").toUpperCase()}
        </p>
        {selectedPay.flags.length > 0 && (
          <p className="board-copy tight">Review: {selectedPay.flags.join(" · ")}</p>
        )}
        {selectedPay.days.map((day) => (
          <article key={day.date} className="plate profile-card">
            <p className="card-label">{day.date}</p>
            <b>
              {formatHours(day.netHours)}
              {day.breakHours > 0 ? ` · ${formatHours(day.breakHours)} break` : ""}
            </b>
            {day.entries.map((entry) => {
              const job = jobs.find((item) => item.id === entry.jobId);
              return (
                <div key={entry.id} className="pay-entry">
                  <p className="board-copy tight">
                    {entry.clockIn
                      ? `${formatClockTime(entry.clockIn)}–${entry.clockOut ? formatClockTime(entry.clockOut) : "LIVE"}`
                      : "Hours entry"}{" "}
                    · {job?.jobTitle ?? (entry.notes || "Shop")} ·{" "}
                    {entry.costCode || "GEN-LABOR"}
                  </p>
                  <div className="day-times">
                    <label>
                      Net hours
                      <input
                        type="number"
                        min="0"
                        step="0.25"
                        value={entry.hours}
                        disabled={locked}
                        onChange={(event) =>
                          onEditEntry(selected, entry.id, {
                            hours: Number(event.target.value),
                            clockIn: null,
                            clockOut: null,
                          })
                        }
                      />
                    </label>
                    <label>
                      Break min
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={entry.breakMinutes ?? 0}
                        disabled={locked}
                        onChange={(event) =>
                          onEditEntry(selected, entry.id, {
                            breakMinutes: Number(event.target.value),
                          })
                        }
                      />
                    </label>
                  </div>
                  <label className="pay-rate-field">
                    Cost code
                    <select
                      className="pay-cadence"
                      value={entry.costCode || selected.costCode || "GEN-LABOR"}
                      disabled={locked}
                      onChange={(event) =>
                        onEditEntry(selected, entry.id, { costCode: event.target.value })
                      }
                    >
                      {COST_CODES.map((code) => (
                        <option key={code.id} value={code.id}>
                          {code.id} · {code.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className={`ghost-action${entry.flagged ? " hours" : ""}`}
                    disabled={locked}
                    onClick={() => onFlagEntry(selected, entry.id, !entry.flagged)}
                  >
                    {entry.flagged ? "Clear flag" : "Flag discrepancy"}
                  </button>
                </div>
              );
            })}
          </article>
        ))}
        <div className="hours-actions">
          <button
            type="button"
            className="ghost-action"
            disabled={locked || sheet?.status === "approved"}
            onClick={() => onTimesheetStatus(selected, "approved")}
          >
            Approve
          </button>
          <button
            type="button"
            className="lock-button locked"
            disabled={locked}
            onClick={() => onTimesheetStatus(selected, "locked")}
          >
            <span className="button-icon" aria-hidden="true">
              ●
            </span>
            <span>
              <small>
                {locked ? "Pay run closed" : "Sign off and lock"}
              </small>
              <b>{locked ? "LOCKED" : "LOCK TIMESHEET"}</b>
            </span>
          </button>
        </div>
        {audits.length > 0 && (
          <article className="plate settings-card">
            <p className="card-label">Audit trail</p>
            {audits.map((row) => (
              <p key={row.id} className="board-copy tight">
                {row.at.slice(5, 16).replace("T", " ")} · {row.action} · {row.detail}
              </p>
            ))}
          </article>
        )}
      </section>
    );
  }

  return (
    <section className="page jobs-board">
      {children}
      {onBack && (
        <button type="button" className="text-back" onClick={onBack}>
          ← Cards
        </button>
      )}
      <p className="section-kicker">Current pay period</p>
      <h1>
        Hours
        <br />
        <strong>Pay run.</strong>
      </h1>
      <p className="board-copy">
        Clock-ins, meal breaks, and overtime after 40 hours roll into gross pay.
        Tap a card to review the week, flag a line, then approve and lock.
      </p>
      <p className="payroll-total">
        <span>
          {formatHours(rollup.netHours)} across {crew.length} employees
        </span>
        <b>{money(rollup.grossPay)}</b>
      </p>
      {rollup.rows.map((row) => {
        const member = crew.find((item) => item.id === row.employeeId);
        if (!member) return null;
        const status =
          findSheet(timesheets, member.id, row.periodStart)?.status ?? "open";
        return (
          <button
            key={member.id}
            type="button"
            className="plate profile-card"
            onClick={() => setSelectedId(member.id)}
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
                <p className="card-label">
                  {CADENCE_LABEL[row.cadence]} · {member.costCode || "GEN-LABOR"}
                </p>
                <h2>{member.name}</h2>
                <p>{clockLabel(member.status)}</p>
              </div>
              <span className={`status-pill ${status === "locked" ? "off" : status === "flagged" ? "break" : "active"}`}>
                <span className="status-dot" />
                {status.toUpperCase()}
              </span>
            </div>
            <div className="pay-strip">
              <div className="live-chip">
                <p className="metric-label">Hours</p>
                <b>{formatHours(row.netHours)}</b>
              </div>
              <div className="live-chip">
                <p className="metric-label">Gross pay</p>
                <b>{money(row.grossPay)}</b>
              </div>
            </div>
            <p className="board-copy tight">{paySummaryLine(row)}</p>
            {row.flags.length > 0 && (
              <p className="board-copy tight">Needs review · {row.flags[0]}</p>
            )}
          </button>
        );
      })}
    </section>
  );
}
