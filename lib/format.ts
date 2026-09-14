import type { JobStatus } from "./types";

export function wrapIndex(index: number, delta: number, length: number): number {
  if (length <= 0) return 0;
  return (index + delta + length * 10) % length;
}

export function clampIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  if (!Number.isFinite(index)) return 0;
  return Math.min(length - 1, Math.max(0, index));
}

export function clockLabel(status: "active" | "break" | "off"): string {
  if (status === "active") return "ON THE CLOCK";
  if (status === "break") return "ON BREAK";
  return "CLOCKED OUT";
}

export function greeting(now = new Date()): string {
  const hour = now.getHours();
  if (hour < 5) return "Still at it";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function longDate(now = new Date()): string {
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" })
    .format(now)
    .toUpperCase();
  const month = new Intl.DateTimeFormat("en-US", { month: "short" })
    .format(now)
    .toUpperCase();
  const day = new Intl.DateTimeFormat("en-US", { day: "2-digit" }).format(now);
  return `${weekday} · ${month} ${day}, ${now.getFullYear()}`;
}

export function formatClockTime(iso: string | null): string {
  if (!iso) return "--:--";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "--:--";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatLiveHours(startedAt: string | null, now = Date.now()): string {
  if (!startedAt) return "0h 00m";
  const elapsed = Math.max(0, now - new Date(startedAt).getTime());
  const hours = Math.floor(elapsed / 3_600_000);
  const minutes = Math.floor((elapsed % 3_600_000) / 60_000);
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

export const JOB_STATUS_ORDER: JobStatus[] = [
  "lead",
  "pending",
  "in_progress",
  "completed",
];

export function nextJobStatus(status: JobStatus): JobStatus | null {
  if (status === "lead") return "pending";
  if (status === "pending") return "in_progress";
  if (status === "in_progress") return "completed";
  return null;
}

export function nextActionLabel(status: JobStatus): string | null {
  if (status === "lead") return "Send estimate";
  if (status === "pending") return "They said yes";
  if (status === "in_progress") return "Mark paid";
  return null;
}

export function jobStatusAction(status: JobStatus): {
  action: string;
  hint: string;
} {
  if (status === "lead") return { action: "New", hint: "Call" };
  if (status === "pending") return { action: "Estimate", hint: "Out" };
  if (status === "in_progress") return { action: "Painting", hint: "On job" };
  return { action: "Paid", hint: "Done" };
}

export function jobStatusLabel(status: JobStatus): string {
  if (status === "lead") return "New";
  if (status === "pending") return "Estimate out";
  if (status === "in_progress") return "Painting";
  return "Paid";
}

export function money(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function jobTone(status: JobStatus): string {
  if (status === "lead") return "tone-lead";
  if (status === "pending") return "tone-pending";
  if (status === "in_progress") return "tone-active";
  return "tone-done";
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}
