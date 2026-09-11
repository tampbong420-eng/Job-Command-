import { getReadyDb } from "@/db";
import { errorResponse } from "@/lib/errors";
import { parseBody, withAuth } from "@/lib/http";
import { deleteJob, getJob, jobUpdateSchema, updateJob } from "@/lib/services/jobs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  return withAuth(async (user) => {
    const db = await getReadyDb();
    const job = await getJob(db, user, id);
    return Response.json({ job });
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  return withAuth(async (user) => {
    try {
      const body = await parseBody(request, jobUpdateSchema);
      const db = await getReadyDb();
      const job = await updateJob(db, user, id, body);
      return Response.json({ job });
    } catch (error) {
      return errorResponse(error);
    }
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  return withAuth(async (user) => {
    const db = await getReadyDb();
    await deleteJob(db, user, id);
    return Response.json({ ok: true });
  });
}
