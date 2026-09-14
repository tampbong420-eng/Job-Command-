"use client";

import { useState } from "react";
import { MapPinned, PanelsTopLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mapsUrl } from "@/lib/field";
import { mapEmbedUrl, streetViewEmbedUrl } from "@/lib/crew";
import { tapHaptic } from "@/lib/haptic";

export function PropertyPreview({ destination }: { destination: string }) {
  const [mode, setMode] = useState<"street" | "map">("street");

  if (!destination) {
    return (
      <div className="flex h-44 items-center justify-center rounded-lg bg-muted/40 text-sm text-muted-foreground">
        No property pin on file
      </div>
    );
  }

  const src = mode === "street" ? streetViewEmbedUrl(destination) : mapEmbedUrl(destination);

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg ring-1 ring-foreground/10">
        <iframe
          title={`${mode === "street" ? "Street View" : "Map"} of ${destination}`}
          src={src}
          className="h-44 w-full border-0 bg-muted"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "street" ? "default" : "outline"}
          onClick={() => {
            tapHaptic();
            setMode("street");
          }}
        >
          <PanelsTopLeft className="size-3.5" />
          Street View
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "map" ? "default" : "outline"}
          onClick={() => {
            tapHaptic();
            setMode("map");
          }}
        >
          <MapPinned className="size-3.5" />
          Maps
        </Button>
        <Button asChild size="sm" variant="outline">
          <a
            href={mapsUrl(destination)}
            target="_blank"
            rel="noreferrer"
            onClick={() => tapHaptic()}
          >
            Directions
          </a>
        </Button>
      </div>
    </div>
  );
}
