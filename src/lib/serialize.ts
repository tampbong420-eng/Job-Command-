import type { UserRow } from "@/db/schema";
import type { PublicUser } from "@/lib/domain";

export function toPublicUser(user: UserRow): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    active: user.active,
    createdAt: user.createdAt,
  };
}
