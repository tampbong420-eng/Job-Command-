import { CommandDeck } from "@/components/command-deck";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PrimaryScreenId } from "@/lib/primary-screens";

export function NextScreenStub({
  screen,
  title,
  copy,
}: {
  screen: PrimaryScreenId;
  title: string;
  copy: string;
}) {
  return (
    <CommandDeck screen={screen}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{copy}</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            Slot reserved · plug in next
          </p>
        </CardContent>
      </Card>
    </CommandDeck>
  );
}
