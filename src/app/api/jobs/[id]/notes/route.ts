import { getReadyDb } from "@/db";
import { errorResponse } from "@/lib/errors";
import { parseBody, withAuth } from "@/lib/http";
import { addJobNote, noteSchema } from "@/lib/services/jobs";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  return withAuth(async (user) => {
    try {
      const body = await parseBody(request, noteSchema);
      const db = await getReadyDb();
      const note = await addJobNote(db, user, id, body.body);
      return Response.json({ note }, { status: 201 });
    } catch (error) {
      return errorResponse(error);
    }
  });
}
