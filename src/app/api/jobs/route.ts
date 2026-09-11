import { getReadyDb } from "@/db";
import { errorResponse } from "@/lib/errors";
import { parseBody, parseSearch, withAuth } from "@/lib/http";
import { JOB_STATUSES, type JobStatus } from "@/lib/domain";
import { createJob, jobCreateSchema, listJobs } from "@/lib/services/jobs";

export async function GET(request: Request) {
  return withAuth(async (user) => {
    const params = parseSearch(request);
    const statusParam = params.get("status");
    const status = JOB_STATUSES.includes(statusParam as JobStatus)
      ? (statusParam as JobStatus)
      : undefined;
    const db = await getReadyDb();
    const jobs = await listJobs(db, user, {
      status,
      query: params.get("q") ?? undefined,
    });
    return Response.json({ jobs });
  });
}

export async function POST(request: Request) {
  return withAuth(async (user) => {
    try {
      const body = await parseBody(request, jobCreateSchema);
      const db = await getReadyDb();
      const job = await createJob(db, user, body);
      return Response.json({ job }, { status: 201 });
    } catch (error) {
      return errorResponse(error);
    }
  });
}
