import { STATUS_LABELS, type JobStatus } from "@/lib/domain";

export type FieldJob = {
  location: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
};

export function fieldDestination(job: FieldJob) {
  return job.location?.trim() || job.customerAddress?.trim() || "";
}

export function mapsUrl(query: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}&travelmode=driving`;
}

export function telUrl(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function preferredNextStatus(status: JobStatus): JobStatus | null {
  if (status === "assigned") return "in_progress";
  if (status === "in_progress") return "completed";
  if (status === "blocked") return "in_progress";
  return null;
}

export function nextStatusLabel(status: JobStatus) {
  const next = preferredNextStatus(status);
  return next ? `Mark ${STATUS_LABELS[next].toLowerCase()}` : null;
}
