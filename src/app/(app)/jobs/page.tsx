import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldActions } from "@/components/field-actions";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { getReadyDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { canCreateJobs } from "@/lib/domain";
import { formatDateTime, formatJobNumber } from "@/lib/format";
import { listJobs } from "@/lib/services/jobs";

export const metadata = { title: "Jobs" };

export default async function JobsPage() {
  const user = await requireUser();
  const db = await getReadyDb();
  const jobs = await listJobs(db, user);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {user.role === "technician" ? "My jobs" : "Jobs"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {user.role === "technician"
              ? "Work assigned to you. Call, navigate, then close it out."
              : "Every work order in the workspace."}
          </p>
        </div>
        {canCreateJobs(user.role) ? (
          <Button asChild>
            <Link href="/jobs/new">New job</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 md:hidden">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="space-y-3 p-4">
              <Link href={`/jobs/${job.id}`} className="block">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {formatJobNumber(job.jobNumber)}
                  </span>
                  <div className="flex gap-1">
                    <StatusBadge status={job.status} />
                    <PriorityBadge priority={job.priority} />
                  </div>
                </div>
                <p className="mt-2 font-medium leading-snug">{job.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{job.customerName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {job.assigneeName ?? "Unassigned"} · {formatDateTime(job.scheduledAt)}
                </p>
              </Link>
              <FieldActions job={job} user={user} compact />
            </CardContent>
          </Card>
        ))}
        {jobs.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No jobs yet.</p>
        ) : null}
      </div>

      <Card className="hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Job</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Assignee</th>
                  <th className="px-4 py-3 font-medium">Schedule</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-border/70 last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/jobs/${job.id}`} className="font-medium hover:underline">
                        {job.title}
                      </Link>
                      <p className="font-mono text-xs text-muted-foreground">
                        {formatJobNumber(job.jobNumber)}
                      </p>
                    </td>
                    <td className="px-4 py-3">{job.customerName}</td>
                    <td className="px-4 py-3">{job.assigneeName ?? "Unassigned"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateTime(job.scheduledAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <StatusBadge status={job.status} />
                        <PriorityBadge priority={job.priority} />
                      </div>
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 ? (
                  <tr>
                    <td className="px-4 py-10 text-center text-muted-foreground" colSpan={5}>
                      No jobs yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
