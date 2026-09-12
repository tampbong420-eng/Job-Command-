import { useSyncExternalStore } from "react";
import { formatClockTime, greeting, longDate } from "./format";

let clientNow = 0;

function readClientNow() {
  if (clientNow === 0 && typeof window !== "undefined") {
    clientNow = Date.now();
  }
  return clientNow;
}

function subscribeNow(onChange: () => void) {
  const tick = () => {
    clientNow = Date.now();
    onChange();
  };
  tick();
  const id = window.setInterval(tick, 1000);
  return () => window.clearInterval(id);
}

export function useLiveNow(): number {
  return useSyncExternalStore(subscribeNow, readClientNow, () => 0);
}

export function useLiveDate(): string {
  return useSyncExternalStore(
    () => () => {},
    () => longDate(),
    () => "FIELD DATE",
  );
}

export function useLiveGreeting(): string {
  return useSyncExternalStore(
    () => () => {},
    () => greeting(),
    () => "Hello",
  );
}

export function useLiveClockTime(iso: string | null): string {
  return useSyncExternalStore(
    () => () => {},
    () => formatClockTime(iso),
    () => "--:--",
  );
}
