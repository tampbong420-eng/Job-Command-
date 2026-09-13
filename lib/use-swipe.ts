import { useCallback, useEffect, useRef, useState } from "react";

const DISTANCE = 28;
const VELOCITY = 0.38;

export function useSwipe(
  onStep: (delta: number) => void,
  axis: "x" | "y" = "x",
  slotSize = 56,
) {
  const [drag, setDrag] = useState(0);
  const start = useRef<{ x: number; y: number; at: number } | null>(null);
  const last = useRef(0);
  const onStepRef = useRef(onStep);

  useEffect(() => {
    onStepRef.current = onStep;
  }, [onStep]);

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    start.current = { x: event.clientX, y: event.clientY, at: Date.now() };
    last.current = 0;
    // Do not preventDefault or capture yet. Android treats that as a dead
    // control, so arrows / tap zones never fire.
  }, []);

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!start.current) return;
      const dx = event.clientX - start.current.x;
      const dy = event.clientY - start.current.y;
      const primary = axis === "x" ? dx : dy;
      const secondary = axis === "x" ? dy : dx;
      if (Math.abs(primary) < 10) return;
      if (Math.abs(secondary) > Math.abs(primary) + 12) {
        start.current = null;
        last.current = 0;
        setDrag(0);
        return;
      }
      last.current = primary;
      setDrag(primary);
      if (event.cancelable) event.preventDefault();
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Android Chrome can throw if the node is already gone.
      }
    },
    [axis],
  );

  const onPointerUp = useCallback(() => {
    const value = last.current;
    const elapsed = Math.max(1, Date.now() - (start.current?.at ?? Date.now()));
    start.current = null;
    last.current = 0;
    setDrag(0);
    const speed = value / elapsed;
    if (Math.abs(value) < DISTANCE && Math.abs(speed) < VELOCITY) return false;
    const steps = Math.max(1, Math.min(3, Math.round(Math.abs(value) / slotSize) || 1));
    onStepRef.current((value < 0 ? 1 : -1) * steps);
    return true;
  }, [slotSize]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (axis === "x") {
        if (event.key === "ArrowLeft") onStepRef.current(-1);
        if (event.key === "ArrowRight") onStepRef.current(1);
      } else {
        if (event.key === "ArrowUp") onStepRef.current(-1);
        if (event.key === "ArrowDown") onStepRef.current(1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [axis]);

  return {
    drag,
    dragging: Math.abs(drag) > 6,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
}
