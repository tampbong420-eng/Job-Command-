import { FleetCommand } from "@/components/fleet-command";
import { CommandDeck } from "@/components/command-deck";
import { getReadyDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { PRIMARY_SCREENS } from "@/lib/primary-screens";
import { listActiveCrewJobs } from "@/lib/services/crew";

const fleetScreen = PRIMARY_SCREENS.find((item) => item.id === "fleet");

export const metadata = { title: fleetScreen?.label ?? "Fleet" };

export default async function ActiveCrewPage() {
  const user = await requireUser();
  const db = await getReadyDb();
  const jobs = await listActiveCrewJobs(db, user);

  return (
    <CommandDeck
      kicker="01"
      title={fleetScreen?.label ?? "Fleet"}
      hint={fleetScreen?.hint}
    >
      <FleetCommand initial={jobs} />
    </CommandDeck>
  );
}
