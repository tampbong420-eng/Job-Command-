import { NextScreenStub } from "@/components/next-screen-stub";

export const metadata = { title: "Time deck" };

export default function ClockScreenPage() {
  return (
    <NextScreenStub
      screen="clock"
      title="Time deck"
      copy="Clock, timesheets, and payroll hours plug into this slot next. Crew hours already run on the Active jobs cards."
    />
  );
}
