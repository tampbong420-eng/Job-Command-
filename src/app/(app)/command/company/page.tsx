import { CommandDeck } from "@/components/command-deck";
import { getWorkspaceBrand } from "@/lib/brand";
import { PRIMARY_SCREENS, screenNumber } from "@/lib/primary-screens";

const screen = PRIMARY_SCREENS.find((item) => item.id === "company")!;

export const metadata = { title: screen.label };

export default function CompanyScreenPage() {
  const brand = getWorkspaceBrand();

  return (
    <CommandDeck kicker={screenNumber("company")} title={screen.label} hint={screen.hint}>
      <div className="rounded-2xl bg-card px-4 py-5 ring-1 ring-border">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Shop</p>
        <p className="mt-2 text-[1.35rem] font-semibold leading-tight">{brand.companyName}</p>
        <p className="mt-1 text-sm text-muted-foreground">{brand.companyCity}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Job Command stays on the left. The shop logo sits here when you add it.
        </p>
      </div>
      <ul className="space-y-2">
        {screen.opens.map((line) => (
          <li
            key={line}
            className="rounded-2xl bg-card px-4 py-3.5 text-[15px] leading-snug ring-1 ring-border"
          >
            {line}
          </li>
        ))}
      </ul>
      <p className="px-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
        Named. Not built yet.
      </p>
    </CommandDeck>
  );
}
