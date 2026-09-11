export function SettingsFooter({
  onOpenPrivacy,
  onOpenTerms,
  onOpenPricing,
}: {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenPricing: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
      <p className="font-bold tracking-widest text-neutral-500">JOB COMMAND · TRADE OS</p>
      <div className="flex items-center gap-4">
        <button type="button" onClick={onOpenPrivacy} className="hover:text-white">
          Privacy
        </button>
        <button type="button" onClick={onOpenTerms} className="hover:text-white">
          Terms
        </button>
        <button type="button" onClick={onOpenPricing} className="hover:text-white">
          Pricing
        </button>
      </div>
    </div>
  );
}
