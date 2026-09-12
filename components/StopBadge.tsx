export default function StopBadge({
  n,
  label,
}: {
  n: number;
  label?: string;
}) {
  return (
    <span className="stop-badge" aria-label={label ?? `Stop ${n}`}>
      {n}
    </span>
  );
}
