import { CommandDeck } from "@/components/command-deck";
import { ExpenseScanner } from "@/components/expense-scanner";
import { getReadyDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { PRIMARY_SCREENS, screenNumber } from "@/lib/primary-screens";
import { listExpenses } from "@/lib/services/expenses";
import { listJobs } from "@/lib/services/jobs";

const screen = PRIMARY_SCREENS.find((item) => item.id === "expenses")!;

export const metadata = { title: screen.label };

export default async function ExpensesScreenPage() {
  const user = await requireUser();
  const db = await getReadyDb();
  const [jobs, expenses] = await Promise.all([listJobs(db, user), listExpenses(db, user)]);

  return (
    <CommandDeck kicker={screenNumber("expenses")} title={screen.label} hint={screen.hint}>
      <ExpenseScanner jobs={jobs} initial={expenses} />
    </CommandDeck>
  );
}
