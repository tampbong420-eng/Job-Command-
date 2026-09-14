import { HomeScreenPlan } from "@/components/home-screen-plan";
import { PRIMARY_SCREENS } from "@/lib/primary-screens";

const screen = PRIMARY_SCREENS.find((item) => item.id === "schedule");

export const metadata = { title: screen?.label ?? "Schedule" };

export default function ScheduleScreenPage() {
  if (!screen) return null;
  return <HomeScreenPlan screen={screen} />;
}
