export function tapHaptic(kind: "light" | "success" = "light") {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return;
  }
  navigator.vibrate(kind === "success" ? [10, 24, 16] : 8);
}
