import { CommandBoard } from "@/components/command-board";
import { CommandDeck } from "@/components/command-deck";
import { getReadyDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { getDashboard } from "@/lib/services/dashboard";

export const metadata = { title: "Dispatch board" };

export default async function DispatchBoardPage() {
  const user = await requireUser();
  const db = await getReadyDb();
  const dashboard = await getDashboard(db, user);

  return (
    <CommandDeck screen="board">
      <CommandBoard initial={dashboard} user={user} embedded />
    </CommandDeck>
  );
}
