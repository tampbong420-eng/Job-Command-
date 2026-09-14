import { HomeScreenPlan } from "@/components/home-screen-plan";
import { PRIMARY_SCREENS } from "@/lib/primary-screens";

const screen = PRIMARY_SCREENS.find((item) => item.id === "customers");

export const metadata = { title: screen?.label ?? "Customers" };

export default function CustomersScreenPage() {
  if (!screen) return null;
  return <HomeScreenPlan screen={screen} />;
}
