import type { ReactNode } from 'react';

export function Modal({
  children,
  onClose,
  wide = false,
}: {
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`bg-neutral-900 border border-neutral-800 rounded-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto ${wide ? 'max-w-3xl' : 'max-w-md'}`}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
