export function LegalPage({
  kind,
  onClose,
}: {
  kind: 'privacy' | 'terms';
  onClose: () => void;
}) {
  const title = kind === 'privacy' ? 'Privacy' : 'Terms';
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-black">{title}</h3>
        <button type="button" onClick={onClose} className="text-neutral-400 hover:text-white text-sm font-bold">
          Close
        </button>
      </div>
      {kind === 'privacy' ? (
        <div className="space-y-3 text-sm text-neutral-300 leading-relaxed">
          <p>
            Job Command stores company profile, crew telemetry, jobs, and receipts in this browser
            unless you connect Supabase. Location is collected only from a field portal the tech
            opens themselves.
          </p>
          <p>
            Voice tests use the Vapi public key you paste in Settings. We do not proxy card numbers
            or government IDs. Receipt images stay on-device unless your Supabase project is
            configured.
          </p>
        </div>
      ) : (
        <div className="space-y-3 text-sm text-neutral-300 leading-relaxed">
          <p>
            Job Command is an operations desk for licensed trade businesses. Estimates are tools,
            not bids, until a human locks them. GPS positions are operational telemetry, not a
            consumer tracking product.
          </p>
          <p>
            You are responsible for call recording notices in your state, wage-and-hour rules for
            field portals, and the accuracy of invoices generated from this OS.
          </p>
        </div>
      )}
    </div>
  );
}
