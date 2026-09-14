import { CommandBoard } from "@/components/command-board";
import { CommandDeck } from "@/components/command-deck";
import { getReadyDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { getDashboard } from "@/lib/services/dashboard";

import { PRIMARY_SCREENS } from "@/lib/primary-screens";

const pipelineScreen = PRIMARY_SCREENS.find((item) => item.id === "pipeline");

export const metadata = { title: pipelineScreen?.label ?? "Jobs" };

export default async function DispatchBoardPage() {
  const user = await requireUser();
  const db = await getReadyDb();
  const dashboard = await getDashboard(db, user);

  return (
    <CommandDeck
      kicker="03"
      title={pipelineScreen?.label ?? "Jobs"}
      hint={pipelineScreen?.hint}
    >
      <CommandBoard initial={dashboard} user={user} embedded />
    </CommandDeck>
  );
}
