import { CommandDeck } from "@/components/command-deck";
import { screenNumber, type PrimaryScreen } from "@/lib/primary-screens";

export function HomeScreenPlan({ screen }: { screen: PrimaryScreen }) {
  return (
    <CommandDeck kicker={screenNumber(screen.id)} title={screen.label} hint={screen.hint}>
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
      {screen.ready ? null : (
        <p className="px-1 pt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
          Named. Not built yet.
        </p>
      )}
    </CommandDeck>
  );
}
