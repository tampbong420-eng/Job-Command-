"use client";

import { clockStateLabel } from "@/lib/crew";
import { cn } from "@/lib/utils";

export function ClockInOut({ clockedIn }: { clockedIn: boolean }) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1"
      role="status"
      aria-label={clockedIn ? "Clocked in" : "Clocked out"}
    >
      <span
        className={cn(
          "rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.16em]",
          clockedIn
            ? "clock-in-move bg-boss text-ink"
            : "bg-zinc-800 text-zinc-500 ring-1 ring-white/10",
        )}
      >
        {clockStateLabel(true)}
      </span>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.16em]",
          clockedIn
            ? "bg-zinc-800 text-zinc-500 ring-1 ring-white/10"
            : "bg-duty text-white",
        )}
      >
        {clockStateLabel(false)}
      </span>
    </span>
  );
}
