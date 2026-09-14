import { CommandDeck } from "@/components/command-deck";
import { TeamChat } from "@/components/team-chat";
import { getReadyDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { PRIMARY_SCREENS, screenNumber } from "@/lib/primary-screens";
import { listJobs } from "@/lib/services/jobs";
import { listTechnicians, listUsers } from "@/lib/services/users";

const screen = PRIMARY_SCREENS.find((item) => item.id === "chat")!;

export const metadata = { title: screen.label };

export default async function ChatScreenPage() {
  const user = await requireUser();
  const db = await getReadyDb();
  const [jobs, teammates] = await Promise.all([
    listJobs(db, user),
    user.role === "technician" ? listTechnicians(db) : listUsers(db, user),
  ]);

  return (
    <CommandDeck kicker={screenNumber("chat")} title={screen.label} hint={screen.hint}>
      <TeamChat user={user} jobs={jobs} teammates={teammates} />
    </CommandDeck>
  );
}
