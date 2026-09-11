"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { tapHaptic } from "@/lib/haptic";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { STATUS_LABELS, STATUS_TRANSITIONS, type JobStatus, type PublicUser } from "@/lib/domain";
import { canMutateJob } from "@/lib/domain";

export function JobActions({
  jobId,
  status,
  assignedToUserId,
  user,
}: {
  jobId: string;
  status: JobStatus;
  assignedToUserId: string | null;
  user: PublicUser;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const canMutate = canMutateJob(user.role, assignedToUserId, user.id);
  const nextStatuses =
    user.role === "admin" ? STATUS_TRANSITIONS[status] : STATUS_TRANSITIONS[status];

  async function setStatus(next: JobStatus) {
    setPending(true);
    try {
      await api(`/api/jobs/${jobId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      tapHaptic("success");
      toast.success(`Moved to ${STATUS_LABELS[next]}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update status");
    } finally {
      setPending(false);
    }
  }

  async function addNote() {
    if (!note.trim()) return;
    setPending(true);
    try {
      await api(`/api/jobs/${jobId}/notes`, {
        method: "POST",
        body: JSON.stringify({ body: note }),
      });
      setNote("");
      toast.success("Note added");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add note");
    } finally {
      setPending(false);
    }
  }

  if (!canMutate) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((item) => (
          <Button
            key={item}
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => void setStatus(item)}
          >
            Move to {STATUS_LABELS[item]}
          </Button>
        ))}
      </div>
      <div className="space-y-2">
        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add a field note"
          rows={3}
        />
        <Button type="button" disabled={pending || !note.trim()} onClick={() => void addNote()}>
          Post note
        </Button>
      </div>
    </div>
  );
}
