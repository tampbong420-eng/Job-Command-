import { getReadyDb } from "@/db";
import { errorResponse } from "@/lib/errors";
import { parseBody, withAuth } from "@/lib/http";
import { scopeInputSchema, writeJobScope } from "@/lib/services/jobs";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  return withAuth(async (user) => {
    try {
      const body = await parseBody(request, scopeInputSchema);
      const db = await getReadyDb();
      const scope = await writeJobScope(db, user, id, body.notes);
      return Response.json({ scope });
    } catch (error) {
      return errorResponse(error);
    }
  });
}
