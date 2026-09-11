import { clearSessionCookie } from "@/lib/http";

export async function POST() {
  await clearSessionCookie();
  return Response.json({ ok: true });
}
