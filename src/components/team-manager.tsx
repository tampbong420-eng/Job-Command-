"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { ROLE_LABELS, USER_ROLES, type PublicUser, type UserRole } from "@/lib/domain";

export function TeamManager({ users, canManage }: { users: PublicUser[]; canManage: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [role, setRole] = useState<UserRole>("technician");

  async function invite(formData: FormData) {
    setPending(true);
    try {
      await api("/api/team", {
        method: "POST",
        body: JSON.stringify({
          name: String(formData.get("name") || ""),
          email: String(formData.get("email") || ""),
          password: String(formData.get("password") || ""),
          role,
        }),
      });
      toast.success("Teammate added");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add teammate");
    } finally {
      setPending(false);
    }
  }

  async function toggleActive(user: PublicUser) {
    try {
      await api(`/api/team/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ active: !user.active }),
      });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update user");
    }
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              {canManage ? <th className="px-4 py-3 font-medium">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border/70 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </td>
                <td className="px-4 py-3">{ROLE_LABELS[user.role]}</td>
                <td className="px-4 py-3">{user.active ? "Active" : "Disabled"}</td>
                {canManage ? (
                  <td className="px-4 py-3">
                    <Button variant="outline" size="sm" onClick={() => void toggleActive(user)}>
                      {user.active ? "Disable" : "Enable"}
                    </Button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canManage ? (
        <form action={invite} className="grid max-w-2xl gap-4 rounded-xl p-4 ring-1 ring-foreground/10">
          <h2 className="text-sm font-medium">Invite teammate</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Temporary password</Label>
              <Input id="password" name="password" type="password" minLength={8} required />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {ROLE_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Adding…" : "Add teammate"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
