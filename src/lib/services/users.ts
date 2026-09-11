import { and, count, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import type { AppDb } from "@/db/types";
import { users } from "@/db/schema";
import {
  USER_ROLES,
  canManageTeam,
  type PublicUser,
  type UserRole,
} from "@/lib/domain";
import { AppError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { hashPassword, verifyPassword } from "@/lib/password";
import { toPublicUser } from "@/lib/serialize";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.email(),
  password: z.string().min(8).max(72),
});

export const createUserSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.email(),
  password: z.string().min(8).max(72),
  role: z.enum(USER_ROLES),
  phone: z.string().max(40).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  role: z.enum(USER_ROLES).optional(),
  phone: z.string().max(40).nullable().optional(),
  active: z.boolean().optional(),
  password: z.string().min(8).max(72).optional(),
});

export async function countUsers(db: AppDb) {
  const [row] = await db.select({ value: count() }).from(users);
  return row?.value ?? 0;
}

export async function authenticateUser(
  db: AppDb,
  email: string,
  password: string,
): Promise<PublicUser> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);
  if (!user || !user.active) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }
  return toPublicUser(user);
}

export async function registerFirstAdmin(
  db: AppDb,
  input: z.infer<typeof signupSchema>,
): Promise<PublicUser> {
  const total = await countUsers(db);
  if (total > 0) {
    throw new ForbiddenError("An administrator must invite new teammates");
  }
  const [created] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      email: input.email.toLowerCase().trim(),
      name: input.name.trim(),
      passwordHash: await hashPassword(input.password),
      role: "admin",
    })
    .returning();
  return toPublicUser(created);
}

export async function listUsers(db: AppDb, actor: PublicUser, query?: string) {
  if (actor.role === "technician") {
    return [actor];
  }
  const filters = query
    ? or(ilike(users.name, `%${query}%`), ilike(users.email, `%${query}%`))
    : undefined;
  const rows = await db
    .select()
    .from(users)
    .where(filters)
    .orderBy(users.name);
  return rows.map(toPublicUser);
}

export async function listTechnicians(db: AppDb) {
  const rows = await db
    .select()
    .from(users)
    .where(and(eq(users.role, "technician"), eq(users.active, true)))
    .orderBy(users.name);
  return rows.map(toPublicUser);
}

export async function createTeammate(
  db: AppDb,
  actor: PublicUser,
  input: z.infer<typeof createUserSchema>,
) {
  if (!canManageTeam(actor.role)) throw new ForbiddenError();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email.toLowerCase().trim()))
    .limit(1);
  if (existing) throw new AppError("A user with that email already exists", 409);
  const [created] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      email: input.email.toLowerCase().trim(),
      name: input.name.trim(),
      passwordHash: await hashPassword(input.password),
      role: input.role,
      phone: input.phone?.trim() || null,
    })
    .returning();
  return toPublicUser(created);
}

export async function updateTeammate(
  db: AppDb,
  actor: PublicUser,
  userId: string,
  input: z.infer<typeof updateUserSchema>,
) {
  if (!canManageTeam(actor.role) && actor.id !== userId) {
    throw new ForbiddenError();
  }
  if (actor.id === userId && input.role && input.role !== actor.role) {
    throw new ForbiddenError("You cannot change your own role");
  }
  if (!canManageTeam(actor.role) && (input.role || input.active === false)) {
    throw new ForbiddenError();
  }
  const [existing] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!existing) throw new NotFoundError("User not found");
  const [updated] = await db
    .update(users)
    .set({
      name: input.name?.trim() ?? existing.name,
      role: input.role ?? existing.role,
      phone: input.phone === undefined ? existing.phone : input.phone,
      active: input.active ?? existing.active,
      passwordHash: input.password
        ? await hashPassword(input.password)
        : existing.passwordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();
  return toPublicUser(updated);
}

export function isAssignableRole(role: UserRole) {
  return role === "technician" || role === "admin" || role === "dispatcher";
}
