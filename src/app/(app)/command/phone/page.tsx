import { CommandDeck } from "@/components/command-deck";
import { VoiceDesk } from "@/components/voice-desk";
import { getReadyDb } from "@/db";
import { requireUser } from "@/lib/auth";
import { PRIMARY_SCREENS, screenNumber } from "@/lib/primary-screens";
import { listVoiceCalls } from "@/lib/services/voice";

const screen = PRIMARY_SCREENS.find((item) => item.id === "phone")!;

export const metadata = { title: screen.label };

export default async function PhoneScreenPage() {
  await requireUser();
  const db = await getReadyDb();
  const calls = await listVoiceCalls(db);

  return (
    <CommandDeck kicker={screenNumber("phone")} title={screen.label} hint={screen.hint}>
      <VoiceDesk initial={calls} />
    </CommandDeck>
  );
}
