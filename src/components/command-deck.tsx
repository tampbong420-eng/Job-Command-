"use client";

import Link from "next/link";
import {
  BookOpen,
  Building2,
  ClipboardList,
  Clock3,
  LayoutGrid,
  Radio,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PRIMARY_SCREENS, type PrimaryScreenId } from "@/lib/primary-screens";
import { cn } from "@/lib/utils";

const ICONS: Record<PrimaryScreenId, LucideIcon> = {
  crew: Radio,
  board: LayoutGrid,
  jobs: ClipboardList,
  sites: Building2,
  clock: Clock3,
  shop: BookOpen,
};

export function CommandDeck({
  screen,
  children,
}: {
  screen: PrimaryScreenId;
  children: React.ReactNode;
}) {
  const current = PRIMARY_SCREENS.find((item) => item.id === screen);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
            Job Command · Airfield desk
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {current?.label ?? "Command"}
          </h1>
          <p className="text-sm text-muted-foreground">{current?.hint}</p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Six-pack {PRIMARY_SCREENS.findIndex((item) => item.id === screen) + 1}/6
        </p>
      </div>

      <nav
        aria-label="Primary screens"
        className="grid grid-cols-3 gap-2 md:grid-cols-6"
      >
        {PRIMARY_SCREENS.map((item, index) => {
          const Icon = ICONS[item.id];
          const active = item.id === screen;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-start gap-1 rounded-xl px-2.5 py-2.5 ring-1 transition-colors",
                active
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-card/70 text-foreground ring-foreground/10 hover:bg-card",
              )}
            >
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.16em]",
                  active ? "text-primary-foreground/80" : "text-muted-foreground",
                )}
              >
                0{index + 1}
              </span>
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <Icon className="size-3.5" />
                {item.short}
              </span>
              {!item.ready ? (
                <span
                  className={cn(
                    "font-mono text-[9px] uppercase tracking-[0.14em]",
                    active ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  Next
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
