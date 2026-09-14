import { HomeScreenPlan } from "@/components/home-screen-plan";
import { PRIMARY_SCREENS } from "@/lib/primary-screens";

const screen = PRIMARY_SCREENS.find((item) => item.id === "money");

export const metadata = { title: screen?.label ?? "Money" };

export default function MoneyScreenPage() {
  if (!screen) return null;
  return <HomeScreenPlan screen={screen} />;
}
