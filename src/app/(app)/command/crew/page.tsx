import { ActiveJobsCrew } from "@/components/active-jobs-crew";
import { CommandDeck } from "@/components/command-deck";
import { getReadyDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { listActiveCrewJobs } from "@/lib/services/crew";

export const metadata = { title: "Active jobs & crew" };

export default async function ActiveCrewPage() {
  const user = await requireUser();
  const db = await getReadyDb();
  const jobs = await listActiveCrewJobs(db, user);

  return (
    <CommandDeck
      kicker="01"
      title="Active jobs & crew"
      hint="Staffed work, maps, and live crew"
    >
      <ActiveJobsCrew initial={jobs} />
    </CommandDeck>
  );
}
