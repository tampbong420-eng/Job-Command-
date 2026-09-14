import { ActiveJobsCrew } from "@/components/active-jobs-crew";
import { CommandDeck } from "@/components/command-deck";
import { getReadyDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { PRIMARY_SCREENS } from "@/lib/primary-screens";
import { listActiveCrewJobs } from "@/lib/services/crew";

const crewScreen = PRIMARY_SCREENS.find((item) => item.id === "crew");

export const metadata = { title: crewScreen?.label ?? "Active Jobs" };

export default async function ActiveCrewPage() {
  const user = await requireUser();
  const db = await getReadyDb();
  const jobs = await listActiveCrewJobs(db, user);

  return (
    <CommandDeck
      kicker="01"
      title={crewScreen?.label ?? "Active Jobs"}
      hint={crewScreen?.hint}
    >
      <ActiveJobsCrew initial={jobs} />
    </CommandDeck>
  );
}
