"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { smsUrl } from "@/lib/crew";
import { tapHaptic } from "@/lib/haptic";
import type { VoiceCallRow } from "@/db/schema";
import { cn } from "@/lib/utils";

type Call = VoiceCallRow;

export function VoiceDesk({ initial }: { initial: Call[] }) {
  const router = useRouter();
  const [calls, setCalls] = useState(initial);
  const [activeId, setActiveId] = useState(initial[0]?.id ?? null);
  const [pending, setPending] = useState(false);
  const active = useMemo(() => calls.find((call) => call.id === activeId) ?? calls[0] ?? null, [calls, activeId]);

  async function convert() {
    if (!active) return;
    setPending(true);
    try {
      const result = await api<{ job?: { id: string } }>(`/api/voice/${active.id}/convert`, { method: "POST" });
      tapHaptic("success");
      toast.success("Lead dropped on Pipeline");
      setCalls((current) =>
        current.map((call) => (call.id === active.id ? { ...call, status: "converted" } : call)),
      );
      if (result.job?.id) router.push("/command/board");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not convert call");
    } finally {
      setPending(false);
    }
  }

  function play() {
    if (!active || typeof window === "undefined" || !window.speechSynthesis) {
      toast.message("No speech engine on this device");
      return;
    }
    const utter = new SpeechSynthesisUtterance(active.transcript);
    utter.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  const extracted = (active?.extracted ?? {}) as Record<string, string | null>;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl bg-card p-4 ring-1 ring-boss/25">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-boss">Live line</p>
        <div className="mt-3 flex h-16 items-end gap-1">
          {Array.from({ length: 28 }).map((_, index) => (
            <span
              key={index}
              className="flex-1 rounded-full bg-boss/80"
              style={{
                height: `${30 + ((index * 37) % 70)}%`,
                animation: "ot-flash 1.1s ease-in-out infinite",
                animationDelay: `${index * 40}ms`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {calls.map((call) => (
          <button
            key={call.id}
            type="button"
            onClick={() => setActiveId(call.id)}
            className={cn(
              "min-w-[11rem] shrink-0 rounded-2xl px-3 py-3 text-left ring-1",
              call.id === active?.id ? "bg-boss text-ink ring-boss" : "bg-card text-foreground ring-border",
            )}
          >
            <p className="truncate text-sm font-semibold">{call.callerName || "Unknown"}</p>
            <p className="mt-1 truncate text-[11px] opacity-70">{call.fromPhone || "No CID"}</p>
          </button>
        ))}
      </div>

      {active ? (
        <div className="space-y-3 rounded-2xl bg-card p-4 ring-1 ring-border">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-lg font-semibold">{active.callerName || "Unknown caller"}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(active.createdAt)}</p>
            </div>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
                active.status === "converted" ? "bg-boss/15 text-boss" : "bg-pending/15 text-pending",
              )}
            >
              {active.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              ["Service", extracted.service],
              ["Address", extracted.address],
              ["When", extracted.timeline],
              ["Urgency", extracted.urgency],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-background px-3 py-2 ring-1 ring-border">
                <p className="text-muted-foreground">{label}</p>
                <p className="mt-0.5 font-medium">{value || "—"}</p>
              </div>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">{active.transcript}</p>
          <div className="grid grid-cols-3 gap-2">
            <Button type="button" disabled={pending || active.status === "converted"} onClick={() => void convert()}>
              To pipeline
            </Button>
            <Button type="button" variant="outline" onClick={play}>
              Play
            </Button>
            {active.fromPhone ? (
              <Button asChild variant="outline">
                <a href={smsUrl(active.fromPhone, "Top Gun Painting — we got your call. We'll send times shortly.")}>
                  SMS
                </a>
              </Button>
            ) : (
              <Button type="button" variant="outline" disabled>
                SMS
              </Button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No inbound calls yet.</p>
      )}
    </div>
  );
}
