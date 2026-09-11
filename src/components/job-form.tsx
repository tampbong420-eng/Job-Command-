"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { JOB_PRIORITIES, PRIORITY_LABELS, type JobPriority } from "@/lib/domain";
import { toDateTimeLocal } from "@/lib/format";
import type { JobListItem } from "@/lib/services/jobs";

type CustomerOption = { id: string; name: string };
type TechOption = { id: string; name: string };

export function JobForm({
  customers,
  technicians,
  job,
}: {
  customers: CustomerOption[];
  technicians: TechOption[];
  job?: JobListItem;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [priority, setPriority] = useState<JobPriority>(job?.priority ?? "medium");
  const [customerId, setCustomerId] = useState(job?.customerId ?? customers[0]?.id ?? "");
  const [assignee, setAssignee] = useState(job?.assignedToUserId ?? "unassigned");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPending(true);
    try {
      const payload = {
        title: String(formData.get("title") || ""),
        description: String(formData.get("description") || ""),
        customerId,
        priority,
        assignedToUserId: assignee === "unassigned" ? null : assignee,
        scheduledAt: String(formData.get("scheduledAt") || "")
          ? new Date(String(formData.get("scheduledAt"))).toISOString()
          : null,
        location: String(formData.get("location") || ""),
      };
      if (job) {
        await api(`/api/jobs/${job.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Job updated");
        router.push(`/jobs/${job.id}`);
      } else {
        const created = await api<{ job: { id: string } }>("/api/jobs", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Job created");
        router.push(`/jobs/${created.job.id}`);
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save job");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={job?.title} required />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={job?.description ?? ""} rows={4} />
      </div>
      <div className="space-y-2">
        <Label>Customer</Label>
        <Select value={customerId} onValueChange={setCustomerId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Priority</Label>
        <Select value={priority} onValueChange={(value) => setPriority(value as JobPriority)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {JOB_PRIORITIES.map((item) => (
              <SelectItem key={item} value={item}>
                {PRIORITY_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Assignee</Label>
        <Select value={assignee} onValueChange={setAssignee}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Unassigned" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {technicians.map((tech) => (
              <SelectItem key={tech.id} value={tech.id}>
                {tech.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="scheduledAt">Scheduled</Label>
        <Input
          id="scheduledAt"
          name="scheduledAt"
          type="datetime-local"
          defaultValue={toDateTimeLocal(job?.scheduledAt)}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" defaultValue={job?.location ?? ""} />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending || !customerId}>
          {pending ? "Saving…" : job ? "Save job" : "Dispatch job"}
        </Button>
      </div>
    </form>
  );
}
