"use client";

import { money } from "@/lib/format";
import type { CrewMember, Expense, ExpenseCategory, Job } from "@/lib/types";
import { useState, type ReactNode } from "react";

const CATEGORIES: ExpenseCategory[] = [
  "Materials",
  "Fuel",
  "Equipment",
  "Permits",
  "Other",
];

export default function ReceiptsBoard({
  expenses,
  jobs,
  crew,
  defaultEmployeeId,
  onAdd,
  children,
}: {
  expenses: Expense[];
  jobs: Job[];
  crew: CrewMember[];
  defaultEmployeeId: string;
  onAdd: (input: {
    vendor: string;
    amount: number;
    category: ExpenseCategory;
    jobId: string | null;
    photoUrl: string | null;
  }) => void;
  children?: ReactNode;
}) {
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Materials");
  const [jobId, setJobId] = useState(jobs[0]?.id ?? "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  function filePhoto(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(String(reader.result ?? ""));
    reader.readAsDataURL(file);
    if (!vendor) setVendor(file.name.replace(/\.[^.]+$/, "").slice(0, 28));
  }

  return (
    <section className="page jobs-board">
      {children}
      <p className="section-kicker">Ledger</p>
      <h1>
        Receipt
        <br />
        <strong>Scanner.</strong>
      </h1>
      <p className="board-copy">
        Snap a supplier ticket. Tag Materials, Fuel, Equipment, Permits, or
        Other and lock it to a job.
      </p>
      <form
        className="add-customer-form plate"
        onSubmit={(event) => {
          event.preventDefault();
          const value = Number(amount);
          if (!vendor.trim() || !Number.isFinite(value) || value <= 0) return;
          onAdd({
            vendor: vendor.trim(),
            amount: value,
            category,
            jobId: jobId || null,
            photoUrl,
          });
          setVendor("");
          setAmount("");
          setPhotoUrl(null);
        }}
      >
        <label className="settings-field">
          Vendor
          <input
            value={vendor}
            onChange={(event) => setVendor(event.target.value)}
            placeholder="Sherwin-Williams"
          />
        </label>
        <label className="settings-field">
          Amount
          <input
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="187.44"
          />
        </label>
        <label className="settings-field">
          Category
          <select
            className="talk-input"
            value={category}
            onChange={(event) => setCategory(event.target.value as ExpenseCategory)}
          >
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="settings-field">
          Job
          <select
            className="talk-input"
            value={jobId}
            onChange={(event) => setJobId(event.target.value)}
          >
            <option value="">Unassigned</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.customerName}
              </option>
            ))}
          </select>
        </label>
        <label className="ghost-action hours">
          Snap receipt
          <input
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(event) => filePhoto(event.target.files?.[0])}
          />
        </label>
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="receipt-thumb" src={photoUrl} alt="Receipt preview" />
        )}
        <button type="submit" className="lock-button locked add-customer">
          <span>
            <small>{crew.find((row) => row.id === defaultEmployeeId)?.name ?? "Crew"}</small>
            <b>FILE RECEIPT</b>
          </span>
        </button>
      </form>
      {expenses.length === 0 ? (
        <p className="empty-group">No receipts yet.</p>
      ) : (
        expenses.map((row) => {
          const job = jobs.find((item) => item.id === row.jobId);
          const member = crew.find((item) => item.id === row.employeeId);
          return (
            <article key={row.id} className="paper-row">
              <div>
                <small>{row.category}</small>
                <b>
                  {row.vendor} · {money(row.amount)}
                </b>
                <span>
                  {member?.name ?? "Crew"} · {job?.customerName ?? "Unassigned"}
                </span>
              </div>
              {row.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="receipt-chip" src={row.photoUrl} alt="" />
              ) : (
                <em>{row.createdAt.slice(0, 10)}</em>
              )}
            </article>
          );
        })
      )}
    </section>
  );
}
