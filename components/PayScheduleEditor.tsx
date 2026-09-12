"use client";

import {
  WEEKDAY_LABEL,
  WEEKDAY_SHORT,
  formatHourLabel,
  patchDay,
} from "@/lib/schedule";
import type { DaySchedule } from "@/lib/types";

export default function PayScheduleEditor({
  schedule,
  onChange,
  readOnly = false,
}: {
  schedule: DaySchedule[];
  onChange: (next: DaySchedule[]) => void;
  readOnly?: boolean;
}) {
  return (
    <ol className="week-calendar pay-week">
      {schedule.map((day) => (
        <li key={day.day} className={`day-card${day.off ? " is-off" : ""}`}>
          <div className="day-card-top">
            <b>
              <span aria-hidden="true">{WEEKDAY_SHORT[day.day]}</span>
              {WEEKDAY_LABEL[day.day]}
            </b>
            <label className="off-toggle">
              <input
                type="checkbox"
                checked={!day.off}
                disabled={readOnly}
                onChange={(event) =>
                  onChange(patchDay(schedule, day.day, { off: !event.target.checked }))
                }
              />
              {day.off ? "Off" : "On"}
            </label>
          </div>
          <div className="day-times">
            <label>
              Start
              <input
                type="time"
                value={day.start}
                disabled={readOnly || day.off}
                onChange={(event) =>
                  onChange(patchDay(schedule, day.day, { start: event.target.value }))
                }
              />
            </label>
            <label>
              End
              <input
                type="time"
                value={day.end}
                disabled={readOnly || day.off}
                onChange={(event) =>
                  onChange(patchDay(schedule, day.day, { end: event.target.value }))
                }
              />
            </label>
          </div>
          <p className="day-summary">
            {day.off
              ? "Not scheduled"
              : `${formatHourLabel(day.start)}–${formatHourLabel(day.end)}`}
          </p>
        </li>
      ))}
    </ol>
  );
}
