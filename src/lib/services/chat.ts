import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import type { AppDb } from "@/db/types";
import { chatMessages, users } from "@/db/schema";
import type { PublicUser } from "@/lib/domain";
import { portraitUrl } from "@/lib/avatars";

export const chatPostSchema = z.object({
  channel: z.string().min(1).max(120),
  body: z.string().min(1).max(2000),
  imageUrl: z.string().max(400_000).optional(),
});

export async function listChatMessages(db: AppDb, channel: string, limit = 80) {
  const rows = await db
    .select({
      id: chatMessages.id,
      channel: chatMessages.channel,
      body: chatMessages.body,
      imageUrl: chatMessages.imageUrl,
      createdAt: chatMessages.createdAt,
      authorId: chatMessages.authorUserId,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
    })
    .from(chatMessages)
    .leftJoin(users, eq(chatMessages.authorUserId, users.id))
    .where(eq(chatMessages.channel, channel))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);
  return rows
    .reverse()
    .map((row) => ({
      ...row,
      authorAvatar: row.authorAvatar || (row.authorName ? portraitUrl(row.authorId ?? "", row.authorName) : null),
    }));
}

export async function postChatMessage(
  db: AppDb,
  actor: PublicUser,
  input: z.infer<typeof chatPostSchema>,
) {
  const [created] = await db
    .insert(chatMessages)
    .values({
      id: crypto.randomUUID(),
      channel: input.channel,
      authorUserId: actor.id,
      body: input.body.trim(),
      imageUrl: input.imageUrl || null,
    })
    .returning();
  return {
    id: created.id,
    channel: created.channel,
    body: created.body,
    imageUrl: created.imageUrl,
    createdAt: created.createdAt,
    authorId: actor.id,
    authorName: actor.name,
    authorAvatar: actor.avatarUrl,
  };
}
