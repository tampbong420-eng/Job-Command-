"use client";

import { useEffect, useState } from "react";
import { formatElapsed, shiftMeter } from "@/lib/crew";
import { cn } from "@/lib/utils";

export function ShiftMeterBar({ clockedInAt }: { clockedInAt: string | null }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const meter = shiftMeter(clockedInAt, new Date(now));
  const hot = meter.overtimeWarning;
  const late = meter.lateShift;
  const width = `${Math.max(meter.progress * 100, meter.clockedIn ? 4 : 0)}%`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span
          className={cn(
            "font-medium",
            hot ? "text-duty" : late ? "text-employee" : "text-boss",
          )}
        >
          {meter.clockedIn
            ? meter.overtime
              ? `OT ${formatElapsed(meter.elapsedMs)}`
              : `On clock ${formatElapsed(meter.elapsedMs)}`
            : "Off clock"}
        </span>
        <span
          className={cn(
            "font-mono text-[11px]",
            hot ? "text-duty" : late ? "text-employee" : "text-muted-foreground",
          )}
        >
          {meter.clockedIn
            ? meter.overtime
              ? "Past 8h"
              : `${formatElapsed(meter.remainingMs)} to OT`
            : "8h day"}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-[width,background-color] duration-500",
            hot ? "ot-flash bg-duty" : late ? "bg-employee" : "bg-boss",
          )}
          style={{ width }}
        />
      </div>
    </div>
  );
}
