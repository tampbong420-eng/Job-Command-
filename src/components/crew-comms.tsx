"use client";

import { MessageSquare, Phone, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    return <p className="text-[11px] text-muted-foreground">No radio</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <Button asChild size="xs" variant="outline">
        <a href={telUrl(phone)} onClick={() => tapHaptic()}>
          <Phone className="size-3" />
          Call
        </a>
      </Button>
      <Button asChild size="xs" variant="outline">
        <a
          href={smsUrl(phone, `Job Command: ${name} — ${jobTitle}`)}
          onClick={() => tapHaptic()}
        >
          <MessageSquare className="size-3" />
          Text
        </a>
      </Button>
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
    <Button asChild size="sm" variant="secondary">
      <a href={href} onClick={() => tapHaptic()}>
        <Radio className="size-3.5" />
        Broadcast crew
      </a>
    </Button>
  );
}
