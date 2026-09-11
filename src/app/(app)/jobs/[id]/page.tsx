import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { JobActions } from "@/components/job-actions";
import { JobForm } from "@/components/job-form";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { getReadyDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { canCreateJobs } from "@/lib/domain";
import { NotFoundError } from "@/lib/errors";
import { formatDateTime, formatJobNumber } from "@/lib/format";
import { listCustomers } from "@/lib/services/customers";
import { getJob } from "@/lib/services/jobs";
import { listTechnicians } from "@/lib/services/users";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Job ${id.slice(0, 8)}` };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const db = await getReadyDb();
  let job;
  try {
    job = await getJob(db, user, id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
  const [customers, technicians] = await Promise.all([
    listCustomers(db),
    listTechnicians(db),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-muted-foreground">
            {formatJobNumber(job.jobNumber)}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{job.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge status={job.status} />
            <PriorityBadge priority={job.priority} />
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/jobs">Back to jobs</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Work order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">{job.description || "No description"}</p>
            <Separator />
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Customer</dt>
                <dd>
                  <Link className="hover:underline" href={`/customers/${job.customerId}`}>
                    {job.customerName}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Assignee</dt>
                <dd>{job.assigneeName ?? "Unassigned"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Schedule</dt>
                <dd>{formatDateTime(job.scheduledAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Location</dt>
                <dd>{job.location || "—"}</dd>
              </div>
            </dl>
            <Separator />
            <JobActions
              jobId={job.id}
              status={job.status}
              assignedToUserId={job.assignedToUserId}
              user={user}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notes yet.</p>
              ) : (
                job.notes.map((note) => (
                  <div key={note.id} className="rounded-lg bg-muted/40 p-3">
                    <p className="text-sm">{note.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {note.authorName ?? "Unknown"} · {formatDateTime(note.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {job.events.map((event) => (
                <p key={event.id} className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {event.type.replaceAll("_", " ")}
                  </span>{" "}
                  · {formatDateTime(event.createdAt)}
                </p>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {canCreateJobs(user.role) ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit job</CardTitle>
          </CardHeader>
          <CardContent>
            <JobForm customers={customers} technicians={technicians} job={job} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
