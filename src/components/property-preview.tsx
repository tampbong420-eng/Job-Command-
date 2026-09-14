"use client";

import { useState } from "react";
import { MapPinned, Navigation, PanelsTopLeft } from "lucide-react";
import { mapsUrl } from "@/lib/field";
import { mapEmbedUrl, streetViewEmbedUrl } from "@/lib/crew";
import { tapHaptic } from "@/lib/haptic";
import { cn } from "@/lib/utils";

export function PropertyPreview({ destination }: { destination: string }) {
  const [mode, setMode] = useState<"street" | "map">("street");

  if (!destination) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl bg-muted/40 text-sm text-muted-foreground">
        No property pin on file
      </div>
    );
  }

  const src = mode === "street" ? streetViewEmbedUrl(destination) : mapEmbedUrl(destination);

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-2xl ring-1 ring-primary/20">
        <iframe
          title={`${mode === "street" ? "Street View" : "Map"} of ${destination}`}
          src={src}
          className="h-48 w-full border-0 bg-muted"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted/60 p-1">
        <ToggleChip
          active={mode === "street"}
          onClick={() => {
            tapHaptic();
            setMode("street");
          }}
        >
          <PanelsTopLeft className="size-3.5" />
          Street
        </ToggleChip>
        <ToggleChip
          active={mode === "map"}
          onClick={() => {
            tapHaptic();
            setMode("map");
          }}
        >
          <MapPinned className="size-3.5" />
          Maps
        </ToggleChip>
        <a
          href={mapsUrl(destination)}
          target="_blank"
          rel="noreferrer"
          onClick={() => tapHaptic()}
          className="flex h-10 items-center justify-center gap-1 rounded-lg text-xs font-medium text-muted-foreground"
        >
          <Navigation className="size-3.5" />
          Go
        </a>
      </div>
    </div>
  );
}

function ToggleChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-10 items-center justify-center gap-1 rounded-lg text-xs font-medium",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}
