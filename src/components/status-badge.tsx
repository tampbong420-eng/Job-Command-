import { Badge } from "@/components/ui/badge";
import { PRIORITY_LABELS, STATUS_LABELS, type JobPriority, type JobStatus } from "@/lib/domain";
import { cn } from "@/lib/utils";

const statusClass: Record<JobStatus, string> = {
  queued: "border-white/10 bg-white/5 text-muted-foreground",
  estimate_sent: "border-lime/20 bg-lime/10 text-lime",
  estimate_approved: "border-boss/25 bg-boss/10 text-boss",
  assigned: "border-sky-500/20 bg-sky-500/10 text-sky-300",
  in_progress: "border-boss/30 bg-boss/15 text-boss",
  blocked: "border-rose-500/20 bg-rose-500/10 text-rose-300",
  completed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  cancelled: "border-white/10 bg-white/5 text-muted-foreground line-through",
};

const priorityClass: Record<JobPriority, string> = {
  low: "border-white/10 bg-white/5 text-muted-foreground",
  medium: "border-sky-500/20 bg-sky-500/10 text-sky-200",
  high: "border-orange-500/20 bg-orange-500/10 text-orange-300",
  urgent: "border-rose-500/30 bg-rose-500/15 text-rose-200",
};

export function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", statusClass[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: JobPriority }) {
  return (
    <Badge variant="outline" className={cn("font-medium", priorityClass[priority])}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}
