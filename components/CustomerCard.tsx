"use client";

import StatusButtons from "@/components/StatusButtons";
import StopBadge from "@/components/StopBadge";
import { jobStatusLabel, jobTone, money } from "@/lib/format";
import {
  chatsForJob,
  crewOnJob,
  jobScope,
  jobSiteSmsHref,
} from "@/lib/job-site";
import {
  mapsDirectionsUrl,
  mapsStreetViewEmbedUrl,
  mapsStreetViewUrl,
} from "@/lib/maps";
import type {
  CrewMember,
  Estimate,
  Job,
  JobChatMessage,
  JobStatus,
  TimeCard,
} from "@/lib/types";
import { useMemo, useState } from "react";

export default function CustomerCard({
  job,
  estimates,
  timeCards,
  crew,
  jobChats = [],
  canEstimate = false,
  onStatus,
  onDelete,
  onOpenTimeCards,
  onPhoto,
  onPostChat,
}: {
  job: Job;
  estimates: Estimate[];
  timeCards: TimeCard[];
  crew: CrewMember[];
  jobChats?: JobChatMessage[];
  canEstimate?: boolean;
  onStatus: (status: JobStatus) => void;
  onDelete: () => void;
  onOpenTimeCards: () => void;
  onPhoto?: (kind: "before" | "after", dataUrl: string) => void;
  onPostChat?: (body: string, amount: number) => void;
}) {
  const quotes = estimates.filter((row) => row.jobId === job.id);
  const cards = timeCards.filter((row) => row.jobId === job.id);
  const invoice = quotes[0] ?? null;
  const quoteTotal = quotes.reduce((sum, row) => sum + row.amount, 0);
  const billed = invoice?.amount ?? quoteTotal;
  const scope = jobScope(job);
  const chat = useMemo(() => chatsForJob(jobChats, job.id), [jobChats, job.id]);
  const siteCrew = useMemo(
    () => crewOnJob(job, crew, timeCards),
    [job, crew, timeCards],
  );
  const smsHref = jobSiteSmsHref(job, crew, timeCards);
  const streetViewEmbed =
    job.lat != null && job.lng != null
      ? mapsStreetViewEmbedUrl(job.lat, job.lng)
      : null;
  const streetViewPage =
    job.lat != null && job.lng != null
      ? mapsStreetViewUrl(job.lat, job.lng)
      : mapsDirectionsUrl(job);
  const hoursTotal = cards.reduce((sum, row) => sum + row.hours, 0);
  const [estimateOpen, setEstimateOpen] = useState(false);
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");

  function sendChat() {
    const text = note.trim();
    const dollars = Number(amount.replace(/[$,\s]/g, ""));
    const filed = Number.isFinite(dollars) && dollars > 0 ? dollars : 0;
    if (!text && filed <= 0) return;
    onPostChat?.(text, filed);
    setNote("");
    setAmount("");
  }

  return (
    <article className={`customer-card ${jobTone(job.status)}`}>
      <div className="customer-card-top">
        <div>
          <small>{job.scheduledTime}</small>
          <b>{job.jobTitle}</b>
          <span>
            {job.customerName} · {job.address}
          </span>
        </div>
        <div className="customer-card-end">
          <em>{job.worker}</em>
          {job.routeOrder != null && <StopBadge n={job.routeOrder} />}
        </div>
      </div>

      <dl className="property-facts card-facts">
        <div>
          <dt>Customer</dt>
          <dd>{job.customerName}</dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>{job.phone || "—"}</dd>
        </div>
        <div>
          <dt>Address</dt>
          <dd>{job.address}</dd>
        </div>
        <div>
          <dt>Assigned</dt>
          <dd>{job.worker}</dd>
        </div>
      </dl>

      <p className="card-label">Scope of work</p>
      <p className="board-copy tight">{scope}</p>

      {canEstimate && (
        <>
          <button
            type="button"
            className="ghost-action hours estimate-open"
            aria-expanded={estimateOpen}
            onClick={() => setEstimateOpen((open) => !open)}
          >
            {estimateOpen ? "Hide estimate" : "Estimate"}
            {quotes.length ? ` · ${money(quoteTotal)}` : ""}
          </button>
          {estimateOpen && (
            <div className="estimate-panel">
              <p className="card-label">Estimate</p>
              <b className="estimate-amount">
                {quotes.length ? money(billed) : "No estimate yet"}
              </b>
              {invoice?.labor != null && (
                <span className="board-copy tight">
                  Labor {money(invoice.labor)} · Materials {money(invoice.materials ?? 0)}
                </span>
              )}
              <p className="card-label">Scope of work</p>
              <p className="board-copy tight">{scope}</p>
              <p className="card-label">Estimate chat</p>
              <div className="job-chat" aria-live="polite">
                {chat.length === 0 ? (
                  <p className="board-copy tight">
                    Type the estimate here. Every line stays on this customer.
                  </p>
                ) : (
                  chat.map((row) => (
                    <p key={row.id} className="job-chat-row">
                      <strong>{row.fromName}</strong>
                      <span>{row.body}</span>
                      {row.amount != null && <em>{money(row.amount)}</em>}
                    </p>
                  ))
                )}
              </div>
              <div className="estimate-compose">
                <textarea
                  className="talk-input"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Write the estimate or a note for this job"
                />
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Amount $"
                  aria-label="Estimate amount"
                />
                <button
                  type="button"
                  className="ghost-action hours"
                  onClick={sendChat}
                  disabled={!onPostChat || (!note.trim() && !amount.trim())}
                >
                  Record on card
                </button>
              </div>
            </div>
          )}
          {smsHref ? (
            <a className="ghost-action directions site-text" href={smsHref}>
              Text job site · {siteCrew.map((row) => row.name.split(" ")[0]).join(", ")}
            </a>
          ) : (
            <p className="board-copy tight">Lock crew to this job to text the site.</p>
          )}
        </>
      )}

      <StatusButtons job={job} onStatus={onStatus} onDelete={onDelete} />

      <div className="street-view">
        {streetViewEmbed ? (
          <iframe
            title={`Street view of ${job.address}`}
            src={streetViewEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <p className="map-empty">Street view needs a mapped pin.</p>
        )}
      </div>
      <div className="property-links card-links">
        <a
          className="ghost-action directions"
          href={mapsDirectionsUrl(job)}
          target="_blank"
          rel="noreferrer"
        >
          Google Directions
        </a>
        <a className="ghost-action" href={streetViewPage} target="_blank" rel="noreferrer">
          Street View
        </a>
      </div>

      {onPhoto && (
        <div className="rolodex-actions">
          <label className="ghost-action hours">
            Before photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => onPhoto("before", String(reader.result ?? ""));
                reader.readAsDataURL(file);
              }}
            />
          </label>
          <label className="ghost-action hours">
            After photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => onPhoto("after", String(reader.result ?? ""));
                reader.readAsDataURL(file);
              }}
            />
          </label>
        </div>
      )}
      {(job.photos ?? []).length > 0 && (
        <div className="photo-strip">
          {(job.photos ?? []).map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={photo.id} src={photo.dataUrl} alt={photo.kind} />
          ))}
        </div>
      )}

      <p className="card-label">Who worked</p>
      {cards.length === 0 ? (
        <p className="board-copy tight">{job.worker} · no hours filed yet</p>
      ) : (
        cards.map((row) => {
          const member = crew.find((item) => item.id === row.employeeId);
          return (
            <p key={row.id} className="board-copy tight">
              {member?.name ?? "Crew"} · {row.hours}h · {row.date}
              {row.notes ? ` · ${row.notes}` : ""}
            </p>
          );
        })
      )}
      {cards.length > 0 && (
        <p className="board-copy tight">{hoursTotal}h total on this job</p>
      )}

      <div className="customer-card-foot">
        {canEstimate ? (
          <button
            type="button"
            className="text-back"
            onClick={() => setEstimateOpen(true)}
          >
            Estimate {quotes.length ? money(quoteTotal) : "—"}
          </button>
        ) : (
          <span className="text-back">Scope on this stop</span>
        )}
        <button type="button" className="text-back" onClick={onOpenTimeCards}>
          Time cards {cards.length || 0}
        </button>
        <span className={`job-chip ${jobTone(job.status)}`}>
          {jobStatusLabel(job.status)}
        </span>
      </div>
    </article>
  );
}
