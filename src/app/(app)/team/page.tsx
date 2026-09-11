import { TeamManager } from "@/components/team-manager";
import { getReadyDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { canManageTeam } from "@/lib/domain";
import { listUsers } from "@/lib/services/users";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const user = await requireUser();
  const db = await getReadyDb();
  const teammates = await listUsers(db, user);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
        <p className="text-sm text-muted-foreground">
          Operators, dispatchers, and technicians on this desk.
        </p>
      </div>
      <TeamManager users={teammates} canManage={canManageTeam(user.role)} />
    </div>
  );
}
