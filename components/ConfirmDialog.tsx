"use client";

import { useEffect } from "react";

export default function ConfirmDialog({
  title,
  body,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="sheet-backdrop confirm-backdrop" onClick={onCancel}>
      <section
        className="property-sheet plate confirm-sheet"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-body"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="card-label">Are you sure?</p>
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-body" className="board-copy">
          {body}
        </p>
        <div className="talk-actions confirm-actions">
          <button type="button" className="ghost-action" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="lane-button tone-delete" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
