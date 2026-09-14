import { HomePad } from "@/components/home-pad";
import { requireUser } from "@/lib/auth";
import { screensForRole } from "@/lib/primary-screens";

export const metadata = { title: "Home" };

export default async function HomePadPage() {
  const user = await requireUser();
  return <HomePad screens={screensForRole(user.role)} />;
}
