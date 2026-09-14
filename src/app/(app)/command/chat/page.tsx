import { HomeScreenPlan } from "@/components/home-screen-plan";
import { PRIMARY_SCREENS } from "@/lib/primary-screens";

const screen = PRIMARY_SCREENS.find((item) => item.id === "chat")!;

export const metadata = { title: screen.label };

export default function ChatScreenPage() {
  return <HomeScreenPlan screen={screen} />;
}
