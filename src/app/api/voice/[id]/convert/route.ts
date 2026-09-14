import { getReadyDb } from "@/db";
import { errorResponse } from "@/lib/errors";
import { withAuth } from "@/lib/http";
import { convertCallToLead } from "@/lib/services/voice";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuth(async (user) => {
    try {
      const { id } = await params;
      const db = await getReadyDb();
      const result = await convertCallToLead(db, user, id);
      return Response.json(result);
    } catch (error) {
      return errorResponse(error);
    }
  });
}
