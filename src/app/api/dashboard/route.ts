import { getReadyDb } from "@/db";
import { withAuth } from "@/lib/http";
import { getDashboard } from "@/lib/services/dashboard";

export async function GET() {
  return withAuth(async (user) => {
    const db = await getReadyDb();
    const dashboard = await getDashboard(db, user);
    return Response.json({ dashboard });
  });
}
