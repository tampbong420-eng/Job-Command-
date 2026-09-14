import { HomeScreenPlan } from "@/components/home-screen-plan";
import { requireUser } from "@/lib/auth";
import { PRIMARY_SCREENS } from "@/lib/primary-screens";

const screen = PRIMARY_SCREENS.find((item) => item.id === "money");

export const metadata = { title: screen?.label ?? "Money" };

export default async function MoneyScreenPage() {
  const user = await requireUser();
  if (!screen) return null;
  return <HomeScreenPlan screen={screen} role={user.role} />;
}
