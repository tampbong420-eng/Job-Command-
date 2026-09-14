import { getReadyDb } from "@/db";
import { errorResponse } from "@/lib/errors";
import { parseBody, withAuth } from "@/lib/http";
import { listVoiceCalls, recordInboundCall, voiceInboundSchema } from "@/lib/services/voice";

export async function GET() {
  return withAuth(async () => {
    const db = await getReadyDb();
    const calls = await listVoiceCalls(db);
    return Response.json({ calls });
  });
}

export async function POST(request: Request) {
  return withAuth(async () => {
    try {
      const body = await parseBody(request, voiceInboundSchema);
      const db = await getReadyDb();
      const call = await recordInboundCall(db, body);
      return Response.json({ call }, { status: 201 });
    } catch (error) {
      return errorResponse(error);
    }
  });
}
