import { HomeScreenPlan } from "@/components/home-screen-plan";
import { PRIMARY_SCREENS } from "@/lib/primary-screens";

const screen = PRIMARY_SCREENS.find((item) => item.id === "hours");

export const metadata = { title: screen?.label ?? "Hours" };

export default function HoursScreenPage() {
  if (!screen) return null;
  return <HomeScreenPlan screen={screen} />;
}
