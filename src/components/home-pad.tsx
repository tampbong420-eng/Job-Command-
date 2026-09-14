"use client";

import Link from "next/link";
import { PAD_TONE_CLASS, type PrimaryScreen, type PrimaryScreenId } from "@/lib/primary-screens";
import { cn } from "@/lib/utils";

export function HomePad({
  screens,
  badges,
}: {
  screens: PrimaryScreen[];
  badges?: Partial<Record<PrimaryScreenId, number>>;
}) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-3 gap-2.5">
      {screens.map((item, index) => {
        const n = String(index + 1).padStart(2, "0");
        const tone = PAD_TONE_CLASS[item.tone];
        const count = badges?.[item.id];

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "relative flex min-h-0 items-center justify-center overflow-hidden rounded-[1.35rem] px-3 text-center ring-1 active:scale-[0.99]",
              item.ready ? tone.ready : tone.wait,
            )}
          >
            <span className={cn("absolute inset-x-0 top-0 h-1", tone.bar, !item.ready && "opacity-80")} />
            <span
              className={cn(
                "absolute left-3 top-3 font-mono text-[11px] tracking-[0.16em]",
                item.ready ? "text-ink/70" : tone.mark,
              )}
            >
              {n}
            </span>
            {count ? (
              <span
                className={cn(
                  "absolute right-3 top-3 flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 font-mono text-[11px] font-semibold",
                  item.ready ? "bg-ink text-boss" : "bg-primary text-primary-foreground",
                )}
              >
                {count}
              </span>
            ) : null}
            <span
              className={cn(
                "px-1 text-[1.45rem] font-semibold leading-none tracking-tight",
                !item.ready && "text-foreground",
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
