import { CommandDeck } from "@/components/command-deck";
import { Card, CardContent } from "@/components/ui/card";
import { screenNumber, type PrimaryScreen } from "@/lib/primary-screens";

export function HomeScreenPlan({ screen }: { screen: PrimaryScreen }) {
  return (
    <CommandDeck kicker={screenNumber(screen)} title={screen.label} hint={screen.hint}>
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              This box opens
            </p>
            <ul className="space-y-1.5 text-sm leading-snug">
              {screen.opens.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Not this box
            </p>
            <ul className="space-y-1.5 text-sm leading-snug text-muted-foreground">
              {screen.notHere.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          {screen.ready ? null : (
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              Named. Not built yet.
            </p>
          )}
        </CardContent>
      </Card>
    </CommandDeck>
  );
}
