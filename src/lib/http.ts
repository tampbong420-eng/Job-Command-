import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth";
import { AppError, errorResponse } from "@/lib/errors";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/session";
import type { PublicUser } from "@/lib/domain";

export async function withAuth(
  handler: (user: PublicUser) => Promise<Response>,
) {
  try {
    const user = await requireUser();
    return await handler(user);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function parseBody<T>(
  request: Request,
  schema: { parse: (data: unknown) => T },
): Promise<T> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    throw new AppError("Invalid JSON body");
  }
  return schema.parse(json);
}

export async function setSessionCookie(userId: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, createSessionToken(userId), sessionCookieOptions());
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
}

export function parseSearch(request: Request) {
  return new URL(request.url).searchParams;
}
