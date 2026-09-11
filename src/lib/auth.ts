import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { getReadyDb } from "@/db";
import { users } from "@/db/schema";
import type { PublicUser, UserRole } from "@/lib/domain";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";
import { toPublicUser } from "@/lib/serialize";

export async function getSessionUser(): Promise<PublicUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const session = decodeSession(token);
  if (!session) return null;
  const db = await getReadyDb();
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, session.sub), eq(users.active, true)))
    .limit(1);
  return user ? toPublicUser(user) : null;
}

export async function requireUser(): Promise<PublicUser> {
  const user = await getSessionUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function requireRole(roles: UserRole[]): Promise<PublicUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new ForbiddenError();
  }
  return user;
}
