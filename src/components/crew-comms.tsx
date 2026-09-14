"use client";

import { MessageSquare, Phone, Radio } from "lucide-react";
import { broadcastSmsUrl, smsUrl } from "@/lib/crew";
import { telUrl } from "@/lib/field";
import { tapHaptic } from "@/lib/haptic";

export function CrewComms({
  name,
  phone,
  jobTitle,
}: {
  name: string;
  phone: string | null;
  jobTitle: string;
}) {
  if (!phone) {
    return <p className="text-xs text-muted-foreground">No radio</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <a
        href={telUrl(phone)}
        onClick={() => tapHaptic()}
        className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
      >
        <Phone className="size-4" />
        Call
      </a>
      <a
        href={smsUrl(phone, `Job Command: ${name} — ${jobTitle}`)}
        onClick={() => tapHaptic()}
        className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-secondary text-sm font-semibold ring-1 ring-primary/30"
      >
        <MessageSquare className="size-4" />
        Text
      </a>
    </div>
  );
}

export function BroadcastCrew({
  phones,
  jobTitle,
}: {
  phones: string[];
  jobTitle: string;
}) {
  const href = broadcastSmsUrl(phones, `Crew check: ${jobTitle}. Reply status.`);
  if (!href) return null;

  return (
    <a
      href={href}
      onClick={() => tapHaptic()}
      className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-primary/15 text-sm font-semibold text-primary ring-1 ring-primary/40"
    >
      <Radio className="size-4" />
      Broadcast crew
    </a>
  );
}
