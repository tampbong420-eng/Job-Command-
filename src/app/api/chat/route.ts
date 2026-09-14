import { getReadyDb } from "@/db";
import { errorResponse } from "@/lib/errors";
import { parseBody, parseSearch, withAuth } from "@/lib/http";
import { chatPostSchema, listChatMessages, postChatMessage } from "@/lib/services/chat";

export async function GET(request: Request) {
  return withAuth(async () => {
    const channel = parseSearch(request).get("channel") || "office-dispatch";
    const db = await getReadyDb();
    const messages = await listChatMessages(db, channel);
    return Response.json({ messages, channel });
  });
}

export async function POST(request: Request) {
  return withAuth(async (user) => {
    try {
      const body = await parseBody(request, chatPostSchema);
      const db = await getReadyDb();
      const message = await postChatMessage(db, user, body);
      return Response.json({ message }, { status: 201 });
    } catch (error) {
      return errorResponse(error);
    }
  });
}
