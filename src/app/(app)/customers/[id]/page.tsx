import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomerForm } from "@/components/customer-form";
import { StatusBadge } from "@/components/status-badge";
import { getReadyDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { canWriteCustomers } from "@/lib/domain";
import { NotFoundError } from "@/lib/errors";
import { formatJobNumber } from "@/lib/format";
import { getCustomer } from "@/lib/services/customers";
import { listJobs } from "@/lib/services/jobs";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const db = await getReadyDb();
  let customer;
  try {
    customer = await getCustomer(db, id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
  const jobs = (await listJobs(db, user)).filter((job) => job.customerId === id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{customer.name}</h1>
          <p className="text-sm text-muted-foreground">
            {customer.email || "No email"} · {customer.phone || "No phone"}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/customers">All customers</Link>
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Site details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{customer.address || "No address on file"}</p>
            <p className="text-muted-foreground">{customer.notes || "No notes"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-muted/50"
              >
                <div>
                  <p className="text-sm font-medium">{job.title}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {formatJobNumber(job.jobNumber)}
                  </p>
                </div>
                <StatusBadge status={job.status} />
              </Link>
            ))}
            {jobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No jobs for this customer.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
      {canWriteCustomers(user.role) ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit customer</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerForm customer={customer} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
