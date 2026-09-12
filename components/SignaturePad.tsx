"use client";

import { useEffect, useRef, type PointerEvent } from "react";

export default function SignaturePad({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#c6f000";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    if (value) {
      const image = new Image();
      image.onload = () => ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      image.src = value;
    }
  }, [value]);

  function point(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const box = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - box.left) / box.width) * canvas.width,
      y: ((event.clientY - box.top) / box.height) * canvas.height,
    };
  }

  return (
    <div className="sign-pad">
      <p className="card-label">Customer sign-off</p>
      <canvas
        ref={canvasRef}
        width={320}
        height={120}
        className="sign-canvas"
        onPointerDown={(event) => {
          drawing.current = true;
          const ctx = canvasRef.current?.getContext("2d");
          const { x, y } = point(event);
          ctx?.beginPath();
          ctx?.moveTo(x, y);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!drawing.current) return;
          const ctx = canvasRef.current?.getContext("2d");
          const { x, y } = point(event);
          ctx?.lineTo(x, y);
          ctx?.stroke();
        }}
        onPointerUp={() => {
          drawing.current = false;
          const canvas = canvasRef.current;
          if (canvas) onChange(canvas.toDataURL("image/png"));
        }}
      />
    </div>
  );
}
