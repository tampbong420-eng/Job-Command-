import type { ShopMessage } from "./types";

export function hasUnreadMessage(messages: ShopMessage[] | undefined, userId: string): boolean {
  return (messages ?? []).some(
    (row) => row.fromId !== userId && !(row.seenBy ?? []).includes(userId),
  );
}

export function markMessagesSeen(
  messages: ShopMessage[] | undefined,
  userId: string,
): ShopMessage[] {
  return (messages ?? []).map((row) =>
    (row.seenBy ?? []).includes(userId)
      ? row
      : { ...row, seenBy: [...(row.seenBy ?? []), userId] },
  );
}
