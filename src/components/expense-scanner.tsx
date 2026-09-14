"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { formatCents, formatJobNumber } from "@/lib/format";
import { demoScan, lightingLabel, parseReceiptText, type ParsedReceipt } from "@/lib/receipts";
import { tapHaptic } from "@/lib/haptic";
import type { ExpenseReceiptRow } from "@/db/schema";
import type { JobListItem } from "@/lib/services/jobs";

export function ExpenseScanner({
  jobs,
  initial,
}: {
  jobs: JobListItem[];
  initial: ExpenseReceiptRow[];
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [lighting, setLighting] = useState("Aim at the receipt");
  const [jobId, setJobId] = useState(jobs[0]?.id ?? "");
  const [form, setForm] = useState<ParsedReceipt>(demoScan("ready"));
  const [pending, setPending] = useState(false);
  const [ledger, setLedger] = useState(initial);

  const openJobs = useMemo(
    () => jobs.filter((job) => job.status !== "cancelled"),
    [jobs],
  );

  async function onFile(file: File) {
    const url = URL.createObjectURL(file);
    setPreview(url);
    const brightness = await sampleBrightness(file).catch(() => 140);
    setLighting(lightingLabel(brightness));
    const parsed = demoScan(file.name || file.size.toString());
    const textGuess = parseReceiptText(file.name);
    setForm({
      ...parsed,
      vendor: textGuess.vendor || parsed.vendor,
      totalCents: textGuess.totalCents || parsed.totalCents,
      taxCents: textGuess.taxCents ?? parsed.taxCents,
    });
    tapHaptic();
  }

  async function save() {
    if (!jobId) {
      toast.error("Pick the job this receipt belongs to");
      return;
    }
    setPending(true);
    try {
      const result = await api<{ expense: ExpenseReceiptRow }>("/api/expenses", {
        method: "POST",
        body: JSON.stringify({
          jobId,
          vendor: form.vendor,
          purchasedAt: form.purchasedAt,
          totalCents: form.totalCents,
          taxCents: form.taxCents,
          lineItems: form.lineItems,
        }),
      });
      tapHaptic("success");
      toast.success("On the job ledger");
      setLedger((current) => [result.expense, ...current]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save receipt");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="relative flex h-52 w-full items-center justify-center overflow-hidden rounded-2xl bg-black ring-1 ring-boss/30"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Receipt preview" className="h-full w-full object-cover opacity-80" />
        ) : (
          <div className="absolute inset-6 rounded-xl border border-dashed border-boss/50" />
        )}
        <span className="relative z-10 rounded-full bg-boss px-3 py-1.5 text-xs font-semibold text-ink">
          {preview ? "Retake" : "Open camera"}
        </span>
        <span className="absolute bottom-3 left-3 z-10 rounded-full bg-background/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-boss">
          {lighting}
        </span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void onFile(file);
        }}
      />

      <div className="space-y-3 rounded-2xl bg-card p-4 ring-1 ring-border">
        <div className="space-y-1.5">
          <Label htmlFor="job">Job ledger</Label>
          <select
            id="job"
            value={jobId}
            onChange={(event) => setJobId(event.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
          >
            {openJobs.map((job) => (
              <option key={job.id} value={job.id}>
                {formatJobNumber(job.jobNumber)} · {job.customerName}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="vendor">Vendor</Label>
          <Input id="vendor" value={form.vendor} onChange={(event) => setForm({ ...form, vendor: event.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="total">Total</Label>
            <Input
              id="total"
              type="number"
              step="0.01"
              value={(form.totalCents / 100).toFixed(2)}
              onChange={(event) =>
                setForm({ ...form, totalCents: Math.round(Number(event.target.value || 0) * 100) })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tax">Tax</Label>
            <Input
              id="tax"
              type="number"
              step="0.01"
              value={(form.taxCents / 100).toFixed(2)}
              onChange={(event) =>
                setForm({ ...form, taxCents: Math.round(Number(event.target.value || 0) * 100) })
              }
            />
          </div>
        </div>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {form.lineItems.map((line) => (
            <li key={line.name} className="flex justify-between gap-2">
              <span>{line.name}</span>
              <span className="font-mono">{formatCents(line.amountCents)}</span>
            </li>
          ))}
        </ul>
        <Button type="button" className="w-full" disabled={pending || !jobId} onClick={() => void save()}>
          Save to job
        </Button>
      </div>

      <div className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Ledger</p>
        {ledger.map((row) => {
          const job = jobs.find((item) => item.id === row.jobId);
          return (
            <div key={row.id} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
              <div>
                <p className="font-medium">{row.vendor}</p>
                <p className="text-xs text-muted-foreground">
                  {job ? `${formatJobNumber(job.jobNumber)} · ${job.customerName}` : "Job"}
                </p>
              </div>
              <p className="font-mono text-sm">{formatCents(row.totalCents)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

async function sampleBrightness(file: File) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (!ctx) return 140;
  ctx.drawImage(bitmap, 0, 0, 32, 32);
  const { data } = ctx.getImageData(0, 0, 32, 32);
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    sum += (data[i]! + data[i + 1]! + data[i + 2]!) / 3;
  }
  return sum / (data.length / 4);
}
