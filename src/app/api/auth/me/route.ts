import { requireUser } from "@/lib/auth";
import { errorResponse } from "@/lib/errors";

export async function GET() {
  try {
    const user = await requireUser();
    return Response.json({ user });
  } catch (error) {
    return errorResponse(error);
  }
}
