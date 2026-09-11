import { desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import type { AppDb } from "@/db/types";
import { customers } from "@/db/schema";
import { canWriteCustomers, type PublicUser } from "@/lib/domain";
import { ForbiddenError, NotFoundError } from "@/lib/errors";

export const customerInputSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.union([z.email(), z.literal("")]).optional(),
  phone: z.string().max(40).optional(),
  address: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

export async function listCustomers(db: AppDb, query?: string) {
  const filters = query
    ? or(
        ilike(customers.name, `%${query}%`),
        ilike(customers.email, `%${query}%`),
        ilike(customers.phone, `%${query}%`),
      )
    : undefined;
  return db
    .select()
    .from(customers)
    .where(filters)
    .orderBy(customers.name);
}

export async function getCustomer(db: AppDb, id: string) {
  const [row] = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  if (!row) throw new NotFoundError("Customer not found");
  return row;
}

export async function createCustomer(
  db: AppDb,
  actor: PublicUser,
  input: z.infer<typeof customerInputSchema>,
) {
  if (!canWriteCustomers(actor.role)) throw new ForbiddenError();
  const [created] = await db
    .insert(customers)
    .values({
      id: crypto.randomUUID(),
      name: input.name.trim(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
      notes: input.notes?.trim() || null,
      createdByUserId: actor.id,
    })
    .returning();
  return created;
}

export async function updateCustomer(
  db: AppDb,
  actor: PublicUser,
  id: string,
  input: z.infer<typeof customerInputSchema>,
) {
  if (!canWriteCustomers(actor.role)) throw new ForbiddenError();
  await getCustomer(db, id);
  const [updated] = await db
    .update(customers)
    .set({
      name: input.name.trim(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
      notes: input.notes?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(customers.id, id))
    .returning();
  return updated;
}

export async function deleteCustomer(db: AppDb, actor: PublicUser, id: string) {
  if (!canWriteCustomers(actor.role)) throw new ForbiddenError();
  await getCustomer(db, id);
  await db.delete(customers).where(eq(customers.id, id));
}

export async function recentCustomers(db: AppDb, limit = 6) {
  return db.select().from(customers).orderBy(desc(customers.createdAt)).limit(limit);
}
