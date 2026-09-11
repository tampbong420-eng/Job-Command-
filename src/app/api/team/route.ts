import { getReadyDb } from "@/db";
import { errorResponse } from "@/lib/errors";
import { parseBody, parseSearch, withAuth } from "@/lib/http";
import {
  createTeammate,
  createUserSchema,
  listUsers,
} from "@/lib/services/users";

export async function GET(request: Request) {
  return withAuth(async (user) => {
    const db = await getReadyDb();
    const teammates = await listUsers(
      db,
      user,
      parseSearch(request).get("q") ?? undefined,
    );
    return Response.json({ users: teammates });
  });
}

export async function POST(request: Request) {
  return withAuth(async (user) => {
    try {
      const body = await parseBody(request, createUserSchema);
      const db = await getReadyDb();
      const teammate = await createTeammate(db, user, body);
      return Response.json({ user: teammate }, { status: 201 });
    } catch (error) {
      return errorResponse(error);
    }
  });
}
