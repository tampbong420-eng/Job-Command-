import { CommandDeck } from "@/components/command-deck";
import { CompanyHub } from "@/components/company-hub";
import { getReadyDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { getWorkspaceBrand } from "@/lib/brand";
import { PRIMARY_SCREENS, screenNumber } from "@/lib/primary-screens";
import { listTechnicians, listUsers } from "@/lib/services/users";

const screen = PRIMARY_SCREENS.find((item) => item.id === "company")!;

export const metadata = { title: screen.label };

export default async function CompanyScreenPage() {
  const user = await requireUser();
  const db = await getReadyDb();
  const brand = getWorkspaceBrand();
  const teammates = user.role === "technician" ? await listTechnicians(db) : await listUsers(db, user);

  return (
    <CommandDeck kicker={screenNumber("company")} title={screen.label} hint={screen.hint}>
      <CompanyHub brand={brand} user={user} teammates={teammates} />
    </CommandDeck>
  );
}
