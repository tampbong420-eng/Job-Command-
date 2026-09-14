import { CommandDeck } from "@/components/command-deck";
import { Card, CardContent } from "@/components/ui/card";

export function NextScreenStub({
  title,
  copy,
}: {
  title: string;
  copy: string;
}) {
  return (
    <CommandDeck title={title}>
      <Card>
        <CardContent className="space-y-2 pt-6 text-sm text-muted-foreground">
          <p>{copy}</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            Coming next
          </p>
        </CardContent>
      </Card>
    </CommandDeck>
  );
}
