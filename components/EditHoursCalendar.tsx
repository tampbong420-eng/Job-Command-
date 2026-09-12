"use client";

import PayScheduleEditor from "@/components/PayScheduleEditor";
import { clockLabel, formatLiveHours } from "@/lib/format";
import { scheduledHours } from "@/lib/schedule";
import type { CrewMember, DaySchedule } from "@/lib/types";
import { useLiveNow } from "@/lib/use-live-time";
import { useState } from "react";

export default function EditHoursCalendar({
  member,
  onSave,
  onCancel,
}: {
  member: CrewMember;
  onSave: (schedule: DaySchedule[]) => void;
  onCancel: () => void;
}) {
  const [schedule, setSchedule] = useState<DaySchedule[]>(member.weeklySchedule);
  const now = useLiveNow();
  const onDuty = member.status !== "off";
  const hours = scheduledHours(schedule);

  return (
    <section className="page hours-desk">
      <div className="hours-head">
        <button type="button" className="text-back" onClick={onCancel}>
          ← Employees
        </button>
        <p className="section-kicker">Weekly schedule</p>
        <h1>Edit hours</h1>
        <p className="hours-person">{member.name}</p>
      </div>

      <div className="hours-status-row">
        <div className={`live-chip ${onDuty ? "on" : "off"}`}>
          <p className="metric-label">Live hours</p>
          <b>
            {!onDuty
              ? `${member.weeklyHoursLogged}h`
              : now === 0
                ? "—"
                : formatLiveHours(member.startedAt, now)}
          </b>
        </div>
        <span className={`status-pill ${member.status}`}>
          <span className="status-dot" />
          {clockLabel(member.status)}
        </span>
        <div className="live-chip">
          <p className="metric-label">Planned</p>
          <b>{hours}h</b>
        </div>
      </div>

      <PayScheduleEditor schedule={schedule} onChange={setSchedule} />

      <div className="hours-actions">
        <button type="button" className="ghost-action" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="lock-button locked"
          onClick={() => onSave(schedule)}
        >
          <span className="button-icon" aria-hidden="true">
            ◷
          </span>
          <span>
            <small>{hours} hours this week</small>
            <b>Save hours</b>
          </span>
        </button>
      </div>
    </section>
  );
}
