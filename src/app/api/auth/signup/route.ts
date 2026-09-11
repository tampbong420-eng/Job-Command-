import { getReadyDb } from "@/db";
import { errorResponse } from "@/lib/errors";
import { parseBody, setSessionCookie } from "@/lib/http";
import { registerFirstAdmin, signupSchema } from "@/lib/services/users";

export async function POST(request: Request) {
  try {
    const body = await parseBody(request, signupSchema);
    const db = await getReadyDb();
    const user = await registerFirstAdmin(db, body);
    await setSessionCookie(user.id);
    return Response.json({ user }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
