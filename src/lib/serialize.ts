import type { UserRow } from "@/db/schema";
import { portraitUrl } from "@/lib/avatars";
import type { PublicUser } from "@/lib/domain";

export function toPublicUser(user: UserRow): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    avatarUrl: user.avatarUrl || portraitUrl(user.id, user.name),
    active: user.active,
    createdAt: user.createdAt,
  };
}
