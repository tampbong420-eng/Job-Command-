import { useSyncExternalStore } from "react";
import { formatClockTime, greeting, longDate } from "./format";

let clientNow = 0;

function subscribeNow(onChange: () => void) {
  if (clientNow === 0) clientNow = Date.now();
  const id = window.setInterval(() => {
    clientNow = Date.now();
    onChange();
  }, 1000);
  return () => window.clearInterval(id);
}

function getClientNow() {
  if (clientNow === 0) clientNow = Date.now();
  return clientNow;
}

export function useLiveNow(): number {
  return useSyncExternalStore(subscribeNow, getClientNow, () => 0);
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
