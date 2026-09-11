import { redirect } from "next/navigation";
import { JobForm } from "@/components/job-form";
import { getReadyDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { canCreateJobs } from "@/lib/domain";
import { listCustomers } from "@/lib/services/customers";
import { listTechnicians } from "@/lib/services/users";

export const metadata = { title: "New job" };

export default async function NewJobPage() {
  const user = await requireUser();
  if (!canCreateJobs(user.role)) redirect("/jobs");
  const db = await getReadyDb();
  const [customers, technicians] = await Promise.all([
    listCustomers(db),
    listTechnicians(db),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dispatch a job</h1>
        <p className="text-sm text-muted-foreground">
          Create a work order and optionally assign it in the same step.
        </p>
      </div>
      {customers.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Add a customer before you can dispatch work.
        </p>
      ) : (
        <JobForm customers={customers} technicians={technicians} />
      )}
    </div>
  );
}
