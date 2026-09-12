import type { PaperTab } from "@/lib/types";

export default function PaperNav({
  paper,
  onPaper,
}: {
  paper: PaperTab;
  onPaper: (paper: PaperTab) => void;
}) {
  return (
    <div className="paper-nav four" role="tablist" aria-label="Job paperwork">
      {(
        [
          ["jobs", "Cards"],
          ["estimates", "Quotes"],
          ["timecards", "Hours"],
          ["receipts", "Receipts"],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={paper === id}
          className={paper === id ? "on" : ""}
          onClick={() => onPaper(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
