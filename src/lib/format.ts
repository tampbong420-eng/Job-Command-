export const JOB_STATUSES = [
  'lead',
  'estimate',
  'scheduled',
  'in_progress',
  'complete',
] as const;

export const STATUS_LABEL: Record<(typeof JOB_STATUSES)[number], string> = {
  lead: 'Lead',
  estimate: 'Estimate',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  complete: 'Complete',
};

export const EXPENSE_CATEGORIES = [
  'Materials',
  'Fuel',
  'Meals',
  'Parking',
  'Tools',
  'Subcontractor',
  'Other',
] as const;

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function timeAgo(iso: string): string {
  const delta = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(delta / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}
