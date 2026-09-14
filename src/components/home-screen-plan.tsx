import { CommandDeck } from "@/components/command-deck";
import type { UserRole } from "@/lib/domain";
import {
  canOpenScreen,
  groupsForRole,
  screenKicker,
  type PrimaryScreen,
} from "@/lib/primary-screens";
import { PAD_TONE_CLASS } from "@/lib/primary-screens";
import { cn } from "@/lib/utils";

export function HomeScreenPlan({
  screen,
  role,
}: {
  screen: PrimaryScreen;
  role: UserRole;
}) {
  const allowed = canOpenScreen(role, screen.id);
  const groups = groupsForRole(screen, role);
  const kicker = screenKicker(role, screen.id);
  const tone = PAD_TONE_CLASS[screen.tone];

  if (!allowed) {
    return (
      <CommandDeck kicker={kicker} title={screen.label} hint="Office box. Not on your home.">
        <p className="px-1 text-sm text-muted-foreground">Money stays with the office.</p>
      </CommandDeck>
    );
  }

  return (
    <CommandDeck kicker={kicker} title={screen.label} hint={screen.hint}>
      <div
        className={cn(
          "grid flex-1 gap-2.5",
          groups.length === 2 ? "grid-cols-2" : "grid-cols-1",
        )}
      >
        {groups.map((group) => (
          <div
            key={group.title}
            className="flex min-h-[7.5rem] flex-col items-center justify-center rounded-[1.35rem] bg-card px-4 text-center ring-1 ring-border"
          >
            <span className={cn("mb-2 h-1 w-10 rounded-full", tone.bar)} />
            <span className="text-[1.35rem] font-semibold leading-none tracking-tight">{group.title}</span>
            <span className="mt-2 text-[13px] leading-snug text-muted-foreground">{group.line}</span>
          </div>
        ))}
      </div>
    </CommandDeck>
  );
}
