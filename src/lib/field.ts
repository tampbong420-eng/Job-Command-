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
  if (status === "queued") return "estimate_sent";
  if (status === "estimate_sent") return "estimate_approved";
  if (status === "estimate_approved") return "assigned";
  if (status === "assigned") return "in_progress";
  if (status === "in_progress") return "completed";
  if (status === "blocked") return "in_progress";
  return null;
}

export function nextActionLabel(status: JobStatus) {
  if (status === "queued") return "Send estimate";
  if (status === "estimate_sent") return "They said yes";
  if (status === "estimate_approved") return "Book it";
  if (status === "assigned") return "Start job";
  if (status === "in_progress") return "Mark paid";
  if (status === "blocked") return "Back on it";
  return null;
}

export function nextStatusLabel(status: JobStatus) {
  return nextActionLabel(status) ?? (preferredNextStatus(status) ? `Mark ${STATUS_LABELS[preferredNextStatus(status)!].toLowerCase()}` : null);
}
