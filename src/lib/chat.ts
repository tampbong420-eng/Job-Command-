export const BASE_CHANNELS = [
  { id: "company-announcements", label: "#company-announcements" },
  { id: "hot-springs-crews", label: "#hot-springs-crews" },
  { id: "office-dispatch", label: "#office-dispatch" },
] as const;

export function jobChannelId(jobId: string) {
  return `job:${jobId}`;
}

export function jobChannelLabel(jobNumber: number) {
  return `#job-${jobNumber}`;
}

export function dmChannelId(a: string, b: string) {
  return `dm:${[a, b].sort().join(":")}`;
}
