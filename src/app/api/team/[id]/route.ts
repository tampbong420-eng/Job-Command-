import { getReadyDb } from "@/db";
import { errorResponse } from "@/lib/errors";
import { parseBody, withAuth } from "@/lib/http";
import { updateTeammate, updateUserSchema } from "@/lib/services/users";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  return withAuth(async (user) => {
    try {
      const body = await parseBody(request, updateUserSchema);
      const db = await getReadyDb();
      const teammate = await updateTeammate(db, user, id, body);
      return Response.json({ user: teammate });
    } catch (error) {
      return errorResponse(error);
    }
  });
}
