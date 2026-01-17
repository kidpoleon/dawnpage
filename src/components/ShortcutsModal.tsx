"use client";

import { Modal } from "@/components/Modal";

export function ShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const focusRing = "focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-0";

  return (
    <Modal
      open={open}
      title="Keyboard shortcuts"
      onClose={onClose}
      footer={
        <button
          type="button"
          className={`rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 ${focusRing}`}
          onClick={onClose}
        >
          Close
        </button>
      }
    >
      <div className="grid gap-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-white/70">Focus search</div>
          <div className="text-white/90">/</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-white/70">Add link</div>
          <div className="text-white/90">A</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-white/70">Open settings</div>
          <div className="text-white/90">S</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-white/70">Show this help</div>
          <div className="text-white/90">?</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-white/70">Clear tag / clear search</div>
          <div className="text-white/90">Esc</div>
        </div>
      </div>
    </Modal>
  );
}
