import { getReadyDb } from "@/db";
import { errorResponse } from "@/lib/errors";
import { parseBody, withAuth } from "@/lib/http";
import { fleetPingSchema, ingestFleetPing } from "@/lib/services/fleet";

export async function POST(request: Request) {
  return withAuth(async (user) => {
    try {
      const body = await parseBody(request, fleetPingSchema);
      const db = await getReadyDb();
      const ping = await ingestFleetPing(db, user, body);
      return Response.json(ping);
    } catch (error) {
      return errorResponse(error);
    }
  });
}
