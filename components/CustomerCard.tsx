"use client";

import StatusButtons from "@/components/StatusButtons";
import { jobStatusLabel, jobTone, money } from "@/lib/format";
import {
  mapsDirectionsUrl,
  mapsStreetViewEmbedUrl,
  mapsStreetViewUrl,
} from "@/lib/maps";
import type { CrewMember, Estimate, Job, JobStatus, TimeCard } from "@/lib/types";

export default function CustomerCard({
  job,
  estimates,
  timeCards,
  crew,
  onStatus,
  onDelete,
  onOpenEstimates,
  onOpenTimeCards,
  onPhoto,
}: {
  job: Job;
  estimates: Estimate[];
  timeCards: TimeCard[];
  crew: CrewMember[];
  onStatus: (status: JobStatus) => void;
  onDelete: () => void;
  onOpenEstimates: () => void;
  onOpenTimeCards: () => void;
  onPhoto?: (kind: "before" | "after", dataUrl: string) => void;
}) {
  const quotes = estimates.filter((row) => row.jobId === job.id);
  const cards = timeCards.filter((row) => row.jobId === job.id);
  const invoice = quotes[0] ?? null;
  const quoteTotal = quotes.reduce((sum, row) => sum + row.amount, 0);
  const billed = invoice?.amount ?? quoteTotal;
  const streetViewEmbed =
    job.lat != null && job.lng != null
      ? mapsStreetViewEmbedUrl(job.lat, job.lng)
      : null;
  const streetViewPage =
    job.lat != null && job.lng != null
      ? mapsStreetViewUrl(job.lat, job.lng)
      : mapsDirectionsUrl(job);
  const hoursTotal = cards.reduce((sum, row) => sum + row.hours, 0);
  const invoiceLabel = job.status === "completed" ? "Invoice" : "Quote";

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
        <em>{job.worker}</em>
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
      <p className="board-copy tight">{job.scope || job.jobTitle}</p>

      <div className="card-invoice">
        <p className="card-label">{invoiceLabel}</p>
        <b>{quotes.length ? money(billed) : "—"}</b>
        <span>
          {invoice?.labor != null
            ? `Labor ${money(invoice.labor)} · Materials ${money(invoice.materials ?? 0)}`
            : quotes.length
              ? invoice?.notes || "Filed on this customer"
              : "No invoice yet"}
        </span>
      </div>

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
        <button type="button" className="text-back" onClick={onOpenEstimates}>
          {invoiceLabel} {quotes.length ? money(quoteTotal) : "—"}
        </button>
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
