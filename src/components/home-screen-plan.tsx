import { CommandDeck } from "@/components/command-deck";
import type { UserRole } from "@/lib/domain";
import {
  canOpenScreen,
  groupsForRole,
  screenNumber,
  type PrimaryScreen,
} from "@/lib/primary-screens";
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

  if (!allowed) {
    return (
      <CommandDeck
        kicker={screenNumber(screen)}
        title={screen.label}
        hint="Boss desk. Not on your home."
      >
        <p className="px-1 text-sm text-muted-foreground">
          Money and the customer book stay with the office.
        </p>
      </CommandDeck>
    );
  }

  return (
    <CommandDeck kicker={screenNumber(screen)} title={screen.label} hint={screen.hint}>
      {groups.map((group) => (
        <section key={group.title} className="space-y-2">
          <p className="px-1 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
            {group.title}
          </p>
          {group.items.map((item) => (
            <p
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3.5 text-[15px] leading-snug ring-1 ring-border"
            >
              <span>{item.label}</span>
              {item.bossOnly ? (
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-logo">
                  Boss
                </span>
              ) : null}
            </p>
          ))}
        </section>
      ))}
      {role === "technician" ? null : (
        <section className="space-y-2 pt-1">
          <p className="px-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Look somewhere else
          </p>
          {screen.notHere.map((line) => (
            <p key={line} className="px-1 text-sm leading-snug text-muted-foreground">
              {line}
            </p>
          ))}
        </section>
      )}
      {screen.ready ? null : (
        <p className={cn("px-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary", role === "technician" ? "pt-2" : "pt-1")}>
          Named. Not built yet.
        </p>
      )}
    </CommandDeck>
  );
}
