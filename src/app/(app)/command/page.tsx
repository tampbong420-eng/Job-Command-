import { HomePad } from "@/components/home-pad";
import { getReadyDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { screensForRole } from "@/lib/primary-screens";
import { listActiveCrewJobs } from "@/lib/services/crew";

export const metadata = { title: "Home" };

export default async function HomePadPage() {
  const user = await requireUser();
  const db = await getReadyDb();
  const jobs = await listActiveCrewJobs(db, user);
  return <HomePad screens={screensForRole(user.role)} badges={{ crew: jobs.length || undefined }} />;
}
