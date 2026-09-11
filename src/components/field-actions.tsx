"use client";

import { MapPin, Phone, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tapHaptic } from "@/lib/haptic";
import {
  fieldDestination,
  mapsUrl,
  preferredNextStatus,
  telUrl,
} from "@/lib/field";
import { STATUS_LABELS, canMutateJob, type JobStatus, type PublicUser } from "@/lib/domain";
import { cn } from "@/lib/utils";

type FieldJob = {
  id: string;
  status: JobStatus;
  location: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  assignedToUserId: string | null;
};

export function FieldActions({
  job,
  user,
  pending,
  compact,
  onAdvance,
}: {
  job: FieldJob;
  user: PublicUser;
  pending?: boolean;
  compact?: boolean;
  onAdvance?: (next: JobStatus) => void;
}) {
  const destination = fieldDestination(job);
  const next = preferredNextStatus(job.status);
  const canAdvance =
    Boolean(onAdvance && next) &&
    canMutateJob(user.role, job.assignedToUserId, user.id);

  return (
    <div className={cn("flex flex-wrap gap-2", compact && "gap-1.5")}>
      {job.customerPhone ? (
        <Button asChild size={compact ? "sm" : "default"} variant="outline">
          <a
            href={telUrl(job.customerPhone)}
            onClick={(event) => {
              event.stopPropagation();
              tapHaptic();
            }}
          >
            <Phone className="size-3.5" />
            Call
          </a>
        </Button>
      ) : null}
      {destination ? (
        <Button asChild size={compact ? "sm" : "default"} variant="outline">
          <a
            href={mapsUrl(destination)}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => {
              event.stopPropagation();
              tapHaptic();
            }}
          >
            <MapPin className="size-3.5" />
            Directions
          </a>
        </Button>
      ) : null}
      {canAdvance && next ? (
        <Button
          type="button"
          size={compact ? "sm" : "default"}
          disabled={pending}
          onClick={(event) => {
            event.stopPropagation();
            tapHaptic("success");
            onAdvance?.(next);
          }}
        >
          <Play className="size-3.5" />
          {STATUS_LABELS[next]}
        </Button>
      ) : null}
    </div>
  );
}
