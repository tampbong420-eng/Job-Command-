import { CommandBoard } from "@/components/command-board";
import { getReadyDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { getDashboard } from "@/lib/services/dashboard";

export const metadata = { title: "Command board" };

export default async function CommandPage() {
  const user = await requireUser();
  const db = await getReadyDb();
  const dashboard = await getDashboard(db, user);
  return <CommandBoard initial={dashboard} />;
}
