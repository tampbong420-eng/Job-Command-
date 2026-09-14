import { getReadyDb } from "@/db";
import { withAuth } from "@/lib/http";
import { listCustomers } from "@/lib/services/customers";
import { listJobs } from "@/lib/services/jobs";

export async function GET(request: Request) {
  return withAuth(async (user) => {
    const db = await getReadyDb();
    const format = new URL(request.url).searchParams.get("format") || "json";
    const [jobRows, customerRows] = await Promise.all([
      listJobs(db, user),
      listCustomers(db),
    ]);
    if (format === "csv") {
      const header = "jobNumber,title,status,customer,address,crew,contractCents";
      const lines = jobRows.map((job) =>
        [
          job.jobNumber,
          csv(job.title),
          job.status,
          csv(job.customerName),
          csv(job.customerAddress ?? ""),
          csv(job.assigneeName ?? ""),
          job.contractCents ?? "",
        ].join(","),
      );
      return new Response([header, ...lines].join("\n"), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=job-command-ledger.csv",
        },
      });
    }
    return Response.json({
      exportedAt: new Date().toISOString(),
      jobs: jobRows,
      customers: customerRows,
    });
  });
}

function csv(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}
