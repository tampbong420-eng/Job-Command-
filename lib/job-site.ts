import type { CrewMember, Estimate, Job, JobChatMessage, TimeCard } from "./types";

export function jobScope(job: Job): string {
  return (job.scope || job.jobTitle || "").trim();
}

export function crewOnJob(
  job: Job,
  crew: CrewMember[],
  timeCards: TimeCard[],
): CrewMember[] {
  const ids = new Set<string>();
  if (job.workerId) ids.add(job.workerId);
  for (const row of crew) {
    if (row.currentJobId === job.id) ids.add(row.id);
  }
  for (const card of timeCards) {
    if (card.jobId === job.id) ids.add(card.employeeId);
  }
  return crew.filter((row) => ids.has(row.id));
}

export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function jobSiteSmsHref(
  job: Job,
  crew: CrewMember[],
  timeCards: TimeCard[],
  body?: string,
): string | null {
  const nums = [
    ...new Set(
      crewOnJob(job, crew, timeCards)
        .map((row) => phoneDigits(row.phone))
        .filter((row) => row.length >= 10),
    ),
  ];
  if (nums.length === 0) return null;
  const text =
    body ?? `Job Command: ${job.customerName} · ${job.jobTitle} · ${job.address}`;
  return `sms:${nums.join(",")}?body=${encodeURIComponent(text)}`;
}

export function parseChatAmount(text: string, explicit?: string): number {
  const typed = Number(String(explicit ?? "").replace(/[$,\s]/g, ""));
  if (Number.isFinite(typed) && typed > 0) return typed;
  const match = text.match(/\$\s*([\d,]+(?:\.\d+)?)/);
  if (!match) return 0;
  const amount = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

export function postJobChat({
  chats,
  estimates,
  job,
  fromId,
  fromName,
  body,
  amount = 0,
  now = new Date().toISOString(),
}: {
  chats: JobChatMessage[];
  estimates: Estimate[];
  job: Job;
  fromId: string;
  fromName: string;
  body: string;
  amount?: number;
  now?: string;
}): { chats: JobChatMessage[]; estimates: Estimate[] } {
  const text = body.trim();
  const filed = amount > 0 ? amount : parseChatAmount(text);
  if (!text && filed <= 0) return { chats, estimates };
  const chat: JobChatMessage = {
    id: `chat-${job.id}-${Date.parse(now)}`,
    jobId: job.id,
    fromId,
    fromName,
    body: text || `Estimate ${filed}`,
    createdAt: now,
    amount: filed > 0 ? filed : undefined,
  };
  const nextEstimates =
    filed > 0
      ? [
          {
            id: `est-${job.id}-${Date.parse(now)}`,
            jobId: job.id,
            amount: filed,
            notes: text || jobScope(job),
            createdAt: now,
          },
          ...estimates,
        ]
      : estimates;
  return { chats: [...chats, chat], estimates: nextEstimates };
}

export function chatsForJob(chats: JobChatMessage[], jobId: string): JobChatMessage[] {
  return chats.filter((row) => row.jobId === jobId);
}
