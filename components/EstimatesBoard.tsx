"use client";

import { quoteTotal } from "@/lib/field";
import { money } from "@/lib/format";
import type { CrewMember, Estimate, Job, TimeCard } from "@/lib/types";
import { useState, type ReactNode } from "react";

export default function EstimatesBoard({
  jobs,
  estimates,
  onBack,
  onQuote,
  children,
}: {
  jobs: Job[];
  estimates: Estimate[];
  onBack?: () => void;
  onQuote?: (input: {
    jobId: string;
    labor: number;
    materials: number;
    notes: string;
  }) => void;
  children?: ReactNode;
}) {
  const [jobId, setJobId] = useState(jobs[0]?.id ?? "");
  const [labor, setLabor] = useState("1800");
  const [materials, setMaterials] = useState("420");
  const [notes] = useState("Labor + materials + 18% markup + 7.5% tax");
  const preview = quoteTotal(Number(labor) || 0, Number(materials) || 0);

  return (
    <section className="page jobs-board">
      {children}
      {onBack && (
        <button type="button" className="text-back" onClick={onBack}>
          ← Cards
        </button>
      )}
      <p className="section-kicker">Paperwork</p>
      <h1>
        Estimates
        <br />
        <strong>Ready.</strong>
      </h1>
      <p className="board-copy">
        Labor, materials, 18% markup, 7.5% tax — or talk a price onto a customer.
      </p>
      {onQuote && (
        <form
          className="add-customer-form plate"
          onSubmit={(event) => {
            event.preventDefault();
            if (!jobId) return;
            onQuote({
              jobId,
              labor: Number(labor) || 0,
              materials: Number(materials) || 0,
              notes,
            });
          }}
        >
          <label className="settings-field">
            Customer
            <select
              className="talk-input"
              value={jobId}
              onChange={(event) => setJobId(event.target.value)}
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.customerName}
                </option>
              ))}
            </select>
          </label>
          <label className="settings-field">
            Labor
            <input value={labor} onChange={(event) => setLabor(event.target.value)} />
          </label>
          <label className="settings-field">
            Materials
            <input
              value={materials}
              onChange={(event) => setMaterials(event.target.value)}
            />
          </label>
          <p className="talk-heard">Quote total {money(preview)}</p>
          <button type="submit" className="lock-button locked add-customer">
            <span>
              <small>18% markup · 7.5% tax</small>
              <b>FILE QUOTE</b>
            </span>
          </button>
        </form>
      )}
      {estimates.length === 0 ? (
        <p className="empty-group">No estimates yet. Say “estimate $1800 for Priya”.</p>
      ) : (
        estimates.map((row) => {
          const job = jobs.find((item) => item.id === row.jobId);
          return (
            <article key={row.id} className="paper-row">
              <div>
                <small>{job?.customerName ?? "Customer"}</small>
                <b>{money(row.amount)}</b>
                <span>
                  {row.labor != null
                    ? `Labor ${money(row.labor)} · Materials ${money(row.materials ?? 0)}`
                    : row.notes || job?.jobTitle}
                </span>
              </div>
              <em>{job?.address}</em>
            </article>
          );
        })
      )}
    </section>
  );
}

export function TimeCardsBoard({
  crew,
  jobs,
  timeCards,
  onBack,
  children,
}: {
  crew: CrewMember[];
  jobs: Job[];
  timeCards: TimeCard[];
  onBack?: () => void;
  children?: ReactNode;
}) {
  return (
    <section className="page jobs-board">
      {children}
      {onBack && (
        <button type="button" className="text-back" onClick={onBack}>
          ← Cards
        </button>
      )}
      <p className="section-kicker">Paperwork</p>
      <h1>
        Time
        <br />
        <strong>Cards.</strong>
      </h1>
      <p className="board-copy">
        Say “log 8 hours for Mike on Northline” and the hours hit the right
        crew member.
      </p>
      {timeCards.length === 0 ? (
        <p className="empty-group">No time cards yet.</p>
      ) : (
        timeCards.map((row) => {
          const member = crew.find((item) => item.id === row.employeeId);
          const job = jobs.find((item) => item.id === row.jobId);
          return (
            <article key={row.id} className="paper-row">
              <div>
                <small>{row.date}</small>
                <b>
                  {row.hours}h · {member?.name ?? "Crew"}
                </b>
                <span>{job?.jobTitle ?? row.notes}</span>
              </div>
              <em>{job?.customerName}</em>
            </article>
          );
        })
      )}
    </section>
  );
}
