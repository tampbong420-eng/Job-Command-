import { getReadyDb } from "@/db";
import { errorResponse } from "@/lib/errors";
import { parseBody, setSessionCookie } from "@/lib/http";
import { authenticateUser, loginSchema } from "@/lib/services/users";

export async function POST(request: Request) {
  try {
    const body = await parseBody(request, loginSchema);
    const db = await getReadyDb();
    const user = await authenticateUser(db, body.email, body.password);
    await setSessionCookie(user.id);
    return Response.json({ user });
  } catch (error) {
    return errorResponse(error);
  }
}
