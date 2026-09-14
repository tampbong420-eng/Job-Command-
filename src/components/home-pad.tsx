"use client";

import Link from "next/link";
import { PAD_TONE_CLASS, PRIMARY_SCREENS } from "@/lib/primary-screens";
import { cn } from "@/lib/utils";

export function HomePad() {
  return (
    <div className="flex min-h-[calc(100svh-6.5rem)] flex-col">
      <div className="mb-4 px-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">Home</p>
        <h1 className="text-2xl font-semibold tracking-tight">Job Command</h1>
        <p className="text-sm text-muted-foreground">Six boxes. Tap one. That is the desk.</p>
      </div>

      <div className="grid flex-1 grid-cols-2 grid-rows-3 gap-3">
        {PRIMARY_SCREENS.map((item, index) => {
          const n = String(index + 1).padStart(2, "0");
          const tone = PAD_TONE_CLASS[item.tone];
          const className = cn(
            "relative flex h-full min-h-[7.5rem] flex-col items-start justify-between overflow-hidden rounded-2xl p-4 text-left ring-1",
            item.ready ? tone.ready : tone.wait,
          );

          const body = (
            <>
              <span className={cn("absolute inset-x-0 top-0 h-1", tone.bar, !item.ready && "opacity-70")} />
              <span
                className={cn(
                  "font-mono text-[11px] uppercase tracking-[0.22em]",
                  item.ready ? "opacity-80" : tone.mark,
                )}
              >
                {n}
              </span>
              <span className="space-y-1">
                <span
                  className={cn(
                    "block text-[15px] font-semibold leading-tight text-balance",
                    !item.ready && "text-foreground",
                  )}
                >
                  {item.label}
                </span>
                <span
                  className={cn(
                    "block text-[11px] leading-snug text-pretty",
                    item.ready ? "opacity-80" : "text-muted-foreground",
                  )}
                >
                  {item.hint}
                </span>
              </span>
            </>
          );

          return (
            <Link key={item.id} href={item.href} className={className}>
              {body}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
