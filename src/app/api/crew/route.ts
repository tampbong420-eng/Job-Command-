import { getReadyDb } from "@/db";
import { withAuth } from "@/lib/http";
import { listActiveCrewJobs } from "@/lib/services/crew";

export async function GET() {
  return withAuth(async (user) => {
    const db = await getReadyDb();
    const jobs = await listActiveCrewJobs(db, user);
    return Response.json({ jobs });
  });
}
