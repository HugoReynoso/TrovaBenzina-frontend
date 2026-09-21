"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function BottomSheet({ open, title, children, onClose }: BottomSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/35 md:hidden" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0 size-full cursor-default" type="button" aria-label="Chiudi pannello" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-md bg-paper p-4 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-black text-ink">{title}</h2>
          <button className="grid size-10 place-items-center rounded-md border border-ink/10 bg-white" type="button" onClick={onClose} aria-label="Chiudi">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
