import { getReadyDb } from "@/db";
import { withAuth } from "@/lib/http";
import { listTechnicians } from "@/lib/services/users";

export async function GET() {
  return withAuth(async () => {
    const db = await getReadyDb();
    const technicians = await listTechnicians(db);
    return Response.json({ technicians });
  });
}
