"use client";

import Link from "next/link";
import { PRIMARY_SCREENS } from "@/lib/primary-screens";
import { cn } from "@/lib/utils";

export function HomePad() {
  return (
    <div className="flex min-h-[calc(100svh-6.5rem)] flex-col">
      <div className="mb-4 px-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">Home</p>
        <h1 className="text-2xl font-semibold tracking-tight">Job Command</h1>
        <p className="text-sm text-muted-foreground">Six functions. Three boxes on each side.</p>
      </div>

      <div className="grid flex-1 grid-cols-2 grid-rows-3 gap-3">
        {PRIMARY_SCREENS.map((item, index) => {
          const n = String(index + 1).padStart(2, "0");
          const className = cn(
            "flex h-full min-h-[7.5rem] flex-col items-start justify-between rounded-2xl p-4 text-left ring-1",
            item.ready
              ? "bg-primary text-primary-foreground ring-primary"
              : "bg-card text-muted-foreground ring-primary/25",
          );

          const body = (
            <>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] opacity-80">
                {n}
              </span>
              <span className="text-[15px] font-semibold leading-tight text-balance">
                {item.ready ? item.label : "Coming next"}
              </span>
            </>
          );

          if (!item.ready) {
            return (
              <div key={item.id} className={className}>
                {body}
              </div>
            );
          }

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
