"use client";

import { jobStatusLabel } from "@/lib/format";
import type { CallLog } from "@/lib/types";

export default function ReceptionistPlate({
  armed,
  greeting,
  calls,
  onArm,
  onSimulate,
  onConvert,
}: {
  armed: boolean;
  greeting: string;
  calls: CallLog[];
  onArm: (armed: boolean) => void;
  onSimulate: () => void;
  onConvert: (callId: string) => void;
}) {
  return (
    <section className="plate receptionist-plate">
      <div className="hours-status-row">
        <div className={`live-chip ${armed ? "on" : "off"}`}>
          <p className="metric-label">AI line</p>
          <b>{armed ? "ARMED" : "MUTED"}</b>
        </div>
        <button
          type="button"
          className={`status-pill ${armed ? "active" : "off"}`}
          onClick={() => onArm(!armed)}
        >
          <span className="status-dot" />
          {armed ? "ON DUTY" : "OFF"}
        </button>
      </div>
      <p className="board-copy tight">{greeting}</p>
      <div className="rolodex-actions">
        <button type="button" className="ghost-action hours" onClick={onSimulate}>
          Test inbound
        </button>
        <span className="swipe-hint">{calls.length} in the log</span>
      </div>
      {calls.slice(0, 3).map((call) => (
        <article key={call.id} className="paper-row">
          <div>
            <small>{call.intent}</small>
            <b>{call.callerName}</b>
            <span>{call.summary}</span>
          </div>
          {call.convertedJobId ? (
            <em>{jobStatusLabel("lead")}</em>
          ) : (
            <button
              type="button"
              className="ghost-action hours"
              onClick={() => onConvert(call.id)}
            >
              To job
            </button>
          )}
        </article>
      ))}
    </section>
  );
}
