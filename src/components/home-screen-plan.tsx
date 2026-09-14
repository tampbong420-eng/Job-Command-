import { CommandDeck } from "@/components/command-deck";
import { screenNumber, type PrimaryScreen } from "@/lib/primary-screens";

export function HomeScreenPlan({ screen }: { screen: PrimaryScreen }) {
  return (
    <CommandDeck kicker={screenNumber(screen)} title={screen.label} hint={screen.hint}>
      <section className="space-y-2">
        {screen.opens.map((line) => (
          <p key={line} className="rounded-2xl bg-card px-4 py-3.5 text-[15px] leading-snug ring-1 ring-border">
            {line}
          </p>
        ))}
      </section>
      <section className="space-y-2 pt-2">
        <p className="px-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Look somewhere else
        </p>
        {screen.notHere.map((line) => (
          <p key={line} className="px-1 text-sm leading-snug text-muted-foreground">
            {line}
          </p>
        ))}
      </section>
      {screen.ready ? null : (
        <p className="px-1 pt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
          Named. Not built yet.
        </p>
      )}
    </CommandDeck>
  );
}
