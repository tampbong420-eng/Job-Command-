import { HomeScreenPlan } from "@/components/home-screen-plan";
import { PRIMARY_SCREENS } from "@/lib/primary-screens";

const screen = PRIMARY_SCREENS.find((item) => item.id === "phone")!;

export const metadata = { title: screen.label };

export default function PhoneScreenPage() {
  return <HomeScreenPlan screen={screen} />;
}
